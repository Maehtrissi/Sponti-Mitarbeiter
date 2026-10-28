create table public.crm_provider_document_register (
id uuid primary key default gen_random_uuid(),
provider_id uuid not null references public."Kursanbieter"(id) on delete cascade,
title text not null check (length(trim(title)) between 1 and 200),
document_type text not null default 'Anbietervereinbarung',
availability text not null default 'Nein' check (availability in ('Nein','Teilweise','Ja','Nicht erforderlich')),
progress text not null default 'Noch nicht angefragt' check (progress in ('Noch nicht angefragt','Angefragt','In Bearbeitung','Zur Unterschrift','Abgeschlossen')),
storage_location text not null default '',
responsible_person text not null default '',
prepared_by text not null default '',
notes text not null default '',
updated_at timestamptz not null default now(),
created_at timestamptz not null default now()
);
alter table public.crm_provider_document_register enable row level security;
grant select,insert,update,delete on public.crm_provider_document_register to authenticated;
create policy "Employees manage document register" on public.crm_provider_document_register for all to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));
