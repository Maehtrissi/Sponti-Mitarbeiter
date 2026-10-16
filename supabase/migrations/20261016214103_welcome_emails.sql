-- Future first email confirmations only. No mail is backfilled for existing accounts.
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;
create table private.welcome_email_outbox (
 user_id uuid primary key references auth.users(id) on delete cascade,
 kind text not null check(kind in ('customer','provider')),
 email text not null,
 status text not null default 'pending' check(status in ('pending','sending','sent','failed','cancelled')),
 created_at timestamptz not null default now(),
 first_attempt_at timestamptz, next_attempt_at timestamptz not null default now(),
 locked_until timestamptz, lease_id uuid,
 attempts integer not null default 0,
 sent_at timestamptz, resend_id text, last_error text
);
alter table private.welcome_email_outbox enable row level security;
revoke all on private.welcome_email_outbox from public,anon,authenticated;
grant all on private.welcome_email_outbox to service_role;
create policy welcome_service_only on private.welcome_email_outbox to service_role using(true) with check(true);

create function private.enqueue_welcome_email() returns trigger language plpgsql security definer set search_path='' as $$
declare k text;
begin
 if old.email_confirmed_at is not null or new.email_confirmed_at is null or new.email is null
    or coalesce(new.is_anonymous,false) then return new; end if;
 if exists(select 1 from public.crm_employees where user_id=new.id)
    or new.raw_app_meta_data->>'sponti_employee'='true' then return new; end if;
 -- A server-created provider mapping selects the template; metadata grants no access.
 k:=case when exists(select 1 from private.provider_accounts where user_id=new.id) then 'provider' else 'customer' end;
 if exists(select 1 from public.customer_welcome_mail_log where user_id=new.id)
    or exists(select 1 from private.customer_welcome_mail_log where user_id=new.id) then return new; end if;
 insert into private.welcome_email_outbox(user_id,kind,email) values(new.id,k,new.email) on conflict(user_id) do nothing;
 return new;
end $$;
revoke all on function private.enqueue_welcome_email() from public,anon,authenticated;
create trigger enqueue_welcome_email after update of email_confirmed_at on auth.users
 for each row when(old.email_confirmed_at is null and new.email_confirmed_at is not null)
 execute function private.enqueue_welcome_email();

create function private.claim_welcome_emails() returns jsonb language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 -- Stop uncertain retries well inside Resend's 24-hour idempotency window.
 update private.welcome_email_outbox set status='failed',last_error='Retry window exhausted'
 where status in ('pending','sending') and (attempts>=8 or first_attempt_at < now()-interval '20 hours')
 and (locked_until is null or locked_until<now());
 with candidates as (
  select user_id from private.welcome_email_outbox
  where status in ('pending','sending') and next_attempt_at<=now()
    and (locked_until is null or locked_until<now()) and attempts<8
  order by created_at for update skip locked limit 5
 ), claimed as (
  update private.welcome_email_outbox q set status='sending',attempts=attempts+1,
   first_attempt_at=coalesce(first_attempt_at,now()),locked_until=now()+interval '3 minutes',lease_id=gen_random_uuid()
  from candidates c where q.user_id=c.user_id
  returning q.user_id,q.kind,q.email,q.lease_id,q.attempts
 ) select coalesce(jsonb_agg(to_jsonb(claimed)),'[]'::jsonb) into result from claimed;
 return result;
end $$;
revoke all on function private.claim_welcome_emails() from public,anon,authenticated;
grant execute on function private.claim_welcome_emails() to service_role;
create function public.claim_welcome_emails() returns jsonb language sql security invoker set search_path='' as $$ select private.claim_welcome_emails(); $$;
revoke all on function public.claim_welcome_emails() from public,anon,authenticated;
grant execute on function public.claim_welcome_emails() to service_role;

create function private.finish_welcome_email(p_user_id uuid,p_lease_id uuid,p_status text,p_resend_id text,p_error text)
 returns boolean language plpgsql security definer set search_path='' as $$
declare affected integer;
begin
 if p_status not in ('sent','pending','failed','cancelled') then raise exception 'Invalid state'; end if;
 update private.welcome_email_outbox set status=p_status,resend_id=p_resend_id,
 sent_at=case when p_status='sent' then now() else null end,
 last_error=left(p_error,200),locked_until=null,lease_id=null,
 next_attempt_at=now()+make_interval(mins=>least(128,power(2,attempts)::integer))
 where user_id=p_user_id and lease_id=p_lease_id and status='sending';
 get diagnostics affected=row_count;
 return affected=1;
end $$;
revoke all on function private.finish_welcome_email(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function private.finish_welcome_email(uuid,uuid,text,text,text) to service_role;
create function public.finish_welcome_email(p_user_id uuid,p_lease_id uuid,p_status text,p_resend_id text default null,p_error text default null)
 returns boolean language sql security invoker set search_path='' as $$ select private.finish_welcome_email(p_user_id,p_lease_id,p_status,p_resend_id,p_error); $$;
revoke all on function public.finish_welcome_email(uuid,uuid,text,text,text) from public,anon,authenticated;
grant execute on function public.finish_welcome_email(uuid,uuid,text,text,text) to service_role;
grant usage on schema private to service_role;

-- Dedicated worker credential stays in Vault. Only its SHA-256 digest is deployed.
do $$ begin
 if not exists(select 1 from vault.secrets where name='welcome_worker_token') then
  perform vault.create_secret(encode(extensions.gen_random_bytes(32),'hex'),'welcome_worker_token','Scoped welcome worker invocation token');
 end if;
end $$;
create function private.dispatch_welcome_emails() returns bigint language plpgsql security definer set search_path='' as $$
declare request_id bigint;
begin
 if not exists(select 1 from private.welcome_email_outbox where status in ('pending','sending') and next_attempt_at<=now() and (locked_until is null or locked_until<now())) then return null; end if;
 select net.http_post(
  url:='https://ehifskiigrfpxeiruyxr.supabase.co/functions/v1/send-welcome-emails',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='welcome_worker_token')),
  body:='{}'::jsonb,timeout_milliseconds:=60000
 ) into request_id;
 return request_id;
end $$;
revoke all on function private.dispatch_welcome_emails() from public,anon,authenticated;
-- Schedule is activated only after deployment and verification.
