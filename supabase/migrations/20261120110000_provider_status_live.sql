-- Neuer Anbieter-Status «Live».
-- «Partner» = angenommen (Stripe-Start, Anbieterkonto). «Live» = nach Stripe-Prüfung freigegeben (öffentlich, Kurse veröffentlichen).
alter table public."Kursanbieter" drop constraint if exists "Kursanbieter_crm_status_check";
alter table public."Kursanbieter" add constraint "Kursanbieter_crm_status_check"
  check (crm_status in ('Neu','Kontaktiert','Gespräch','Partner','Live','Abgelehnt'));

do $$
declare r record; def text; newdef text; n int;
begin
  -- Angenommen: Partner ODER Live
  for r in select p.oid, n.nspname||'.'||p.proname as fn from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (n.nspname,p.proname) in (('private','provider_access_allowed'),('private','provider_approved'),('private','provision_confirmed_provider'),
      ('private','provider_registration_status'),('private','provider_mail_eligible'),('public','provider_course_readiness'))
  loop
    def:=pg_get_functiondef(r.oid);
    newdef:=replace(replace(replace(def,'new.crm_status=''Partner''','new.crm_status in (''Partner'',''Live'')'),
      'crm_status=''Partner''','crm_status in (''Partner'',''Live'')'),'v_status=''Partner''','v_status in (''Partner'',''Live'')');
    if newdef=def then raise exception 'Keine Änderung in %',r.fn; end if;
    execute newdef;
  end loop;
  -- Öffentlich / veröffentlichen: nur Live
  for r in select p.oid, n.nspname||'.'||p.proname as fn from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where (n.nspname,p.proname) in (('private','provider_directory'),('private','provider_public_profile'),
      ('public','list_public_course_providers'),('public','list_public_providers'),('private','sponti_provider_live_ready'))
  loop
    def:=pg_get_functiondef(r.oid);
    newdef:=replace(def,'crm_status=''Partner''','crm_status=''Live''');
    if newdef=def then raise exception 'Keine Änderung in %',r.fn; end if;
    execute newdef;
  end loop;
end $$;

-- Mitarbeiter-Kursverwaltung: Entwürfe für Partner/Live, Veröffentlichen nur für Live.
alter policy courses_employee_insert on public.courses with check (
  (select public.crm_is_employee()) and (provider_id is null or exists (
    select 1 from public."Kursanbieter" p where p.id=courses.provider_id and p.archived_at is null
      and (p.crm_status='Live' or (p.crm_status='Partner' and courses.status='draft')))));
alter policy courses_employee_update on public.courses with check (
  (select public.crm_is_employee()) and (status='draft' or provider_id is null or exists (
    select 1 from public."Kursanbieter" p where p.id=courses.provider_id and p.crm_status='Live' and p.archived_at is null)));
