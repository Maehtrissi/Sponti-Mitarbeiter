create table public.courses (
 id uuid primary key default gen_random_uuid(),
 provider_id uuid references public."Kursanbieter"(id) on delete restrict,
 title text not null check (length(trim(title)) between 1 and 200),
 description text not null default '' check (length(description)<=4000),
 category text not null check (category in ('yoga-wellness','kochen-geniessen','kunst-handwerk','fotografie-design','tanz-bewegung','natur-draussen')),
 region text not null check (region in ('zug','zuerich','luzern','schwyz','aargau','andere')),
 venue text not null check (length(trim(venue)) between 1 and 300),
 starts_at timestamptz not null,
 price numeric(10,2) not null default 0 check (price>=0),
 seats integer not null default 1 check (seats between 0 and 100000),
 booking_url text not null default '' check (length(booking_url)<=2048 and (booking_url='' or booking_url ~ '^https?://[^[:space:]]+$')),
 status text not null default 'draft' check (status in ('draft','published')),
 archived_at timestamptz,
 created_at timestamptz not null default now()
);
alter table public.courses enable row level security;
revoke all on public.courses from anon, authenticated;
grant select (id,title,description,category,region,venue,starts_at,price,seats,booking_url) on public.courses to anon;
grant select on public.courses to authenticated;
grant insert (provider_id,title,description,category,region,venue,starts_at,price,seats,booking_url,status) on public.courses to authenticated;
grant update (provider_id,title,description,category,region,venue,starts_at,price,seats,booking_url,status,archived_at) on public.courses to authenticated;
create policy courses_public_read on public.courses for select to anon,authenticated
 using (status='published' and archived_at is null and starts_at>now() and seats>0);
create policy courses_employee_read on public.courses for select to authenticated
 using ((select public.crm_is_employee()));
create policy courses_employee_insert on public.courses for insert to authenticated
 with check ((select public.crm_is_employee()) and (provider_id is null or exists (select 1 from public."Kursanbieter" p where p.id=provider_id and p.crm_status='Partner' and p.archived_at is null)));
create policy courses_employee_update on public.courses for update to authenticated
 using ((select public.crm_is_employee()))
 with check ((select public.crm_is_employee()) and (status='draft' or provider_id is null or exists (select 1 from public."Kursanbieter" p where p.id=provider_id and p.crm_status='Partner' and p.archived_at is null)));
create index courses_provider_idx on public.courses(provider_id);
create index courses_public_date_idx on public.courses(starts_at,id) where status='published' and archived_at is null and seats>0;
notify pgrst,'reload schema';
