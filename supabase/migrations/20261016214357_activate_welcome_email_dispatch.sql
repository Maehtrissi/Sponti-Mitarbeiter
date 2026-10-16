-- Provision welcome_resend_api_key in Vault before activating this worker.
-- The value is deliberately absent from source control.
create function private.welcome_mail_sending_key() returns text language sql security definer set search_path='' as $$
 select decrypted_secret from vault.decrypted_secrets where name='welcome_resend_api_key';
$$;
revoke all on function private.welcome_mail_sending_key() from public,anon,authenticated;
grant execute on function private.welcome_mail_sending_key() to service_role;
create function public.welcome_mail_sending_key() returns text language sql security invoker set search_path='' as $$
 select private.welcome_mail_sending_key();
$$;
revoke all on function public.welcome_mail_sending_key() from public,anon,authenticated;
grant execute on function public.welcome_mail_sending_key() to service_role;
select cron.schedule('sponti-welcome-emails','* * * * *','select private.dispatch_welcome_emails();');
