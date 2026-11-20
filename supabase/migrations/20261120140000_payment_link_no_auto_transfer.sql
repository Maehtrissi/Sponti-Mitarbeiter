-- Zahlungslink-Käufe: Anbieter-Anteil wird im Stripe-Link aufgeteilt, daher keinen Eintrag für die automatische Auszahlung anlegen.
create or replace function public.sponti_record_payment_link_booking(
  p_session_id text, p_course_id uuid, p_quantity integer, p_amount_total bigint, p_currency text,
  p_name text, p_email text, p_phone text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare c record; v_id uuid; v_note text:=''; v_name text; v_email text;
begin
  if p_currency is distinct from 'chf' then raise exception 'Invalid currency'; end if;
  if exists(select 1 from private.payment_link_events where session_id=p_session_id) then
    return jsonb_build_object('status','duplicate');
  end if;
  v_email:=lower(btrim(coalesce(p_email,'')));
  v_name:=left(coalesce(nullif(btrim(coalesce(p_name,'')),''),v_email),200);
  if p_quantity is null or p_quantity<1 or p_quantity>10 or v_email='' or p_amount_total is null or p_amount_total<=0 then
    insert into private.payment_link_events(session_id,course_id,quantity,amount_rappen,status,note)
    values(p_session_id,p_course_id,p_quantity,p_amount_total,'needs_review','Menge ausserhalb 1–10 oder Angaben unvollständig. Bitte manuell prüfen.');
    return jsonb_build_object('status','needs_review');
  end if;
  select id,price,seats into c from public.courses where id=p_course_id for update;
  if not found then
    insert into private.payment_link_events(session_id,course_id,quantity,amount_rappen,status,note)
    values(p_session_id,p_course_id,p_quantity,p_amount_total,'needs_review','Kurs nicht gefunden.');
    return jsonb_build_object('status','needs_review');
  end if;
  if p_amount_total<>round(c.price*100*p_quantity)::bigint then
    v_note:='Bezahlter Betrag weicht vom Kurspreis ab. ';
  end if;
  if c.seats<p_quantity then v_note:=v_note||'Nicht genug freie Plätze (überbucht). '; end if;
  insert into public.course_checkout_bookings(course_id,guest_name,guest_email,guest_phone,quantity,unit_price_chf,total_chf,
    booking_status,payment_provider,payment_status,payment_reference,duplicate_guard_enabled)
  values(p_course_id,v_name,v_email,left(coalesce(p_phone,''),32),p_quantity,round(p_amount_total/100.0/p_quantity,2),p_amount_total/100.0,
    'pending_payment','stripe','pending',p_session_id,false)
  returning id into v_id;
  update public.courses set seats=greatest(seats-p_quantity,0) where id=p_course_id;
  update public.course_checkout_bookings set booking_status='confirmed',payment_status='paid' where id=v_id;
  -- Die Aufteilung auf den Anbieter erfolgt im Stripe-Zahlungslink selbst. Keine zweite automatische Auszahlung.
  delete from private.sponti_transfer_ledger where booking_id=v_id;
  insert into private.payment_link_events(session_id,course_id,quantity,amount_rappen,status,note,booking_id)
  values(p_session_id,p_course_id,p_quantity,p_amount_total,case when v_note='' then 'booked' else 'needs_review' end,btrim(v_note),v_id);
  return jsonb_build_object('status','booked','booking_id',v_id,'note',btrim(v_note));
end $$;

revoke all on function public.sponti_record_payment_link_booking(text,uuid,integer,bigint,text,text,text,text) from public, anon, authenticated;
grant execute on function public.sponti_record_payment_link_booking(text,uuid,integer,bigint,text,text,text,text) to service_role;
