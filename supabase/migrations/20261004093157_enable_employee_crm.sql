-- Existing customer/provider tables stay the source of truth for website and CRM.
create table public.crm_employees (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active boolean not null default true
);
alter table public.crm_employees enable row level security;
revoke all on public.crm_employees from anon, authenticated;
grant select on public.crm_employees to authenticated;
grant all on public.crm_employees to service_role;
create policy "Employees see their own access" on public.crm_employees for select to authenticated
using (user_id = (select auth.uid()));
insert into public.crm_employees(user_id)
select id from auth.users where raw_app_meta_data->'sponti_employee' = 'true'::jsonb and not is_anonymous;

create function public.crm_is_employee() returns boolean
language sql stable security invoker set search_path = '' as $$
  select auth.uid() is not null
    and coalesce(auth.jwt()->'app_metadata'->'sponti_employee' = 'true'::jsonb, false)
    and not coalesce((auth.jwt()->>'is_anonymous')::boolean, false)
    and exists(select 1 from public.crm_employees where user_id = auth.uid() and active);
$$;
revoke all on function public.crm_is_employee() from public, anon;
grant execute on function public.crm_is_employee() to authenticated, service_role;

alter table public."Kunden - Users"
  add column crm_status text not null default 'Aktiv' check (crm_status in ('Aktiv','Pausiert')),
  add column crm_message text not null default '' check (length(crm_message) <= 4000),
  add column crm_source text not null default 'Website' check (crm_source in ('Website','CRM','Import'));
alter table public."Kursanbieter"
  add column crm_status text not null default 'Neu' check (crm_status in ('Neu','Kontaktiert','Gespräch','Partner','Abgelehnt')),
  add column phone text not null default '' check (length(phone) <= 100),
  add column crm_source text not null default 'Website' check (crm_source in ('Website','CRM','Import'));

-- Remove the old unconditional ALL policy and public read/write privileges.
drop policy "Enable delete for users based on user_id" on public."Kunden - Users";
revoke all on public."Kunden - Users" from anon, authenticated;
revoke all (id,"Name","Email","Phone","Interest",created_at,"ContactChannel") on public."Kunden - Users" from anon, authenticated;
grant insert ("Name","Email","Phone","Interest","ContactChannel") on public."Kunden - Users" to anon;
grant select on public."Kunden - Users" to authenticated;
grant insert ("Name","Email","Phone","Interest","ContactChannel",crm_status,crm_message,crm_source) on public."Kunden - Users" to authenticated;
grant update ("Name","Email","Phone","Interest","ContactChannel",crm_status,crm_message) on public."Kunden - Users" to authenticated;
grant usage on sequence public."Kunden - Users_id_seq" to anon, authenticated;
alter table public."Kunden - Users" enable row level security;
create policy "Website submits customers" on public."Kunden - Users" for insert to anon, authenticated with check (
  length(trim("Name")) between 1 and 200
  and length(trim("Email")) between 3 and 254
  and "Email" ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'
  and length(trim("Phone")) between 1 and 100
  and length(coalesce("Interest",'')) <= 500
  and "ContactChannel" in ('WhatsApp','E-Mail','Beides')
  and crm_status = 'Aktiv' and crm_message = '' and crm_source = 'Website'
);
create policy "Employees read customers" on public."Kunden - Users" for select to authenticated using ((select public.crm_is_employee()));
create policy "Employees create customers" on public."Kunden - Users" for insert to authenticated with check ((select public.crm_is_employee()));
create policy "Employees update customers" on public."Kunden - Users" for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));

-- Provider public submission policy and column grants remain in place.
grant select on public."Kursanbieter" to authenticated;
grant insert (phone,crm_status,crm_source) on public."Kursanbieter" to authenticated;
grant update (company,contact,email,category,message,offer_type,phone,crm_status) on public."Kursanbieter" to authenticated;
create policy "Provider submissions start new" on public."Kursanbieter" as restrictive for insert to authenticated
with check ((crm_status = 'Neu' and phone = '' and crm_source = 'Website') or (select public.crm_is_employee()));
create policy "Employees read providers" on public."Kursanbieter" for select to authenticated using ((select public.crm_is_employee()));
create policy "Employees create providers" on public."Kursanbieter" for insert to authenticated with check ((select public.crm_is_employee()));
create policy "Employees update providers" on public."Kursanbieter" for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));

create table public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  customer_id bigint references public."Kunden - Users"(id) on delete cascade,
  provider_id uuid references public."Kursanbieter"(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  author_id uuid not null default auth.uid() references auth.users(id),
  author text not null default (auth.jwt()->>'email'),
  created_at timestamptz not null default now(),
  check (num_nonnulls(customer_id,provider_id)=1)
);
create index crm_notes_customer_idx on public.crm_notes(customer_id);
create index crm_notes_provider_idx on public.crm_notes(provider_id);
create index crm_notes_author_idx on public.crm_notes(author_id);
alter table public.crm_notes enable row level security;
revoke all on public.crm_notes from anon, authenticated;
grant select on public.crm_notes to authenticated;
grant insert (customer_id,provider_id,body) on public.crm_notes to authenticated;
grant all on public.crm_notes to service_role;
create policy "Employees read notes" on public.crm_notes for select to authenticated using ((select public.crm_is_employee()));
create policy "Employees add notes" on public.crm_notes for insert to authenticated
with check ((select public.crm_is_employee()) and author_id = (select auth.uid()) and author = (select auth.jwt()->>'email'));

create table public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  customer_id bigint references public."Kunden - Users"(id) on delete cascade,
  provider_id uuid references public."Kursanbieter"(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 500),
  due_date date not null,
  done boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  check (num_nonnulls(customer_id,provider_id)<=1)
);
create index crm_tasks_customer_idx on public.crm_tasks(customer_id);
create index crm_tasks_provider_idx on public.crm_tasks(provider_id);
create index crm_tasks_creator_idx on public.crm_tasks(created_by);
create index crm_tasks_due_idx on public.crm_tasks(done,due_date);
alter table public.crm_tasks enable row level security;
revoke all on public.crm_tasks from anon, authenticated;
grant select on public.crm_tasks to authenticated;
grant insert (customer_id,provider_id,title,due_date) on public.crm_tasks to authenticated;
grant update (done) on public.crm_tasks to authenticated;
grant all on public.crm_tasks to service_role;
create policy "Employees read tasks" on public.crm_tasks for select to authenticated using ((select public.crm_is_employee()));
create policy "Employees add tasks" on public.crm_tasks for insert to authenticated with check ((select public.crm_is_employee()) and created_by = (select auth.uid()));
create policy "Employees complete tasks" on public.crm_tasks for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));
notify pgrst, 'reload schema';
