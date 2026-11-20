-- Eigener Checkout: Aufteilung bei der Zahlung durch Stripe (Testmodus). Solche Buchungen bekommen keinen Eintrag für die spätere Auszahlung.
alter table public.course_checkout_bookings
  add column if not exists payout_mode text not null default 'ledger';
do $$ begin
  if not exists(select 1 from pg_constraint where conname='course_checkout_bookings_payout_mode_check') then
    alter table public.course_checkout_bookings
      add constraint course_checkout_bookings_payout_mode_check check (payout_mode in ('ledger','stripe_split'));
  end if;
end $$;

create or replace function public.sponti_mark_checkout_split(p_booking_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
begin
  update public.course_checkout_bookings set payout_mode='stripe_split'
  where id=p_booking_id and booking_status='pending_payment' and payment_status='pending';
  return found;
end $$;
revoke all on function public.sponti_mark_checkout_split(uuid) from public, anon, authenticated;
grant execute on function public.sponti_mark_checkout_split(uuid) to service_role;

create or replace function private.sponti_record_paid_booking()
returns trigger language plpgsql security definer set search_path to '' as $function$
declare c record; gross bigint; fee bigint; mode text;
begin
  if new.payment_status <> 'paid' or new.booking_status <> 'confirmed' then return new; end if;
  if tg_op='UPDATE' and old.payment_status='paid' and old.booking_status='confirmed' then return new; end if;
  if new.payout_mode='stripe_split' then return new; end if;
  select provider_id,coalesce(ends_at,starts_at + interval '2 hours') as course_end
  into c from public.courses where id=new.course_id;
  if c.provider_id is null then return new; end if;
  gross:=round(new.total_chf*100)::bigint;
  if gross<=0 then return new; end if;
  fee:=round(coalesce(new.commission_chf,(select q.commission_chf from private.sponti_quote_tiered_commission(new.unit_price_chf,round(new.total_chf,2)) q))*100)::bigint;
  mode:=case when new.payment_reference like 'cs_test_%' then 'test' when new.payment_reference like 'cs_live_%' then 'live' else null end;
  if mode is null then return new; end if;
  insert into private.sponti_transfer_ledger
    (booking_id,provider_id,stripe_mode,status,gross_rappen,commission_rappen,provider_rappen,eligible_after)
  values(new.id,c.provider_id,mode,
    case when c.course_end>now() then 'awaiting_end_time' else 'held' end,
    gross,fee,gross-fee,c.course_end)
  on conflict(booking_id) do nothing;
  return new;
end $function$;

create or replace function private.sponti_record_provider_share()
returns trigger language plpgsql security definer set search_path to '' as $function$
declare v_course record; v_gross bigint; v_commission bigint; v_provider bigint;
begin
  if new.booking_status <> 'confirmed' or new.payment_status <> 'paid' then return new; end if;
  if tg_op = 'UPDATE' and old.booking_status='confirmed' and old.payment_status='paid' then return new; end if;
  if new.payout_mode='stripe_split' then return new; end if;
  select provider_id,ends_at from public.courses into v_course where id=new.course_id;
  if v_course.provider_id is null then return new; end if;
  v_gross:=round(new.total_chf*100)::bigint;
  v_commission:=round(coalesce(new.commission_chf,(select q.commission_chf from private.sponti_quote_tiered_commission(new.unit_price_chf,round(new.total_chf,2)) q))*100)::bigint;
  v_provider:=v_gross-v_commission;
  if v_gross<=0 or v_commission<0 or v_provider<0 then
    raise exception 'Provider share reconciliation failed';
  end if;
  insert into private.sponti_transfer_ledger(
    booking_id,provider_id,stripe_mode,status,gross_rappen,commission_rappen,provider_rappen,eligible_after)
  values(new.id,v_course.provider_id,
    case when new.payment_reference like 'cs_live_%' then 'live' else 'test' end,
    case when v_course.ends_at is null then 'awaiting_end_time' else 'held' end,
    v_gross,v_commission,v_provider,v_course.ends_at)
  on conflict (booking_id) do nothing;
  return new;
end;
$function$;

create or replace function public.sponti_checkout_connect_account(p_course_id uuid) returns text
language sql security definer stable set search_path='' as $$
  select a.stripe_account_id from public.courses c
  join private.sponti_connect_accounts a on a.provider_id=c.provider_id and a.mode='test'
  where c.id=p_course_id limit 1
$$;
revoke all on function public.sponti_checkout_connect_account(uuid) from public, anon, authenticated;
grant execute on function public.sponti_checkout_connect_account(uuid) to service_role;
