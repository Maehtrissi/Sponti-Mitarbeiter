-- Zahlungslink (Stripe Payment Link) pro Kurs. Wird nur im CRM von Mitarbeitenden gepflegt.
-- Eigene Spalte, damit der Sync-Trigger aus provider_courses den Link nicht überschreibt.
alter table public.courses
  add column if not exists payment_link text not null default ''
  check (length(payment_link)<=2048 and (payment_link='' or payment_link ~ '^https://[^[:space:]]+$'));

grant select (payment_link) on public.courses to anon, authenticated;
grant insert (payment_link) on public.courses to authenticated;
grant update (payment_link) on public.courses to authenticated;
