create table public.customer_preferences (
 user_id uuid primary key references auth.users(id) on delete cascade,
 region text not null default '' check (region in ('','zug','zuerich','luzern','schwyz','aargau','andere')),
 locality text not null default '' check (char_length(locality)<=200),
 radius_km integer check (radius_km in (5,10,20,30,50,100)),
 preferred_days text[] not null default '{}' check (preferred_days <@ array['mo','di','mi','do','fr','sa','so']::text[] and cardinality(preferred_days)<=7 and array_position(preferred_days,null) is null),
 preferred_times text[] not null default '{}' check (preferred_times <@ array['morning','afternoon','evening']::text[] and cardinality(preferred_times)<=3 and array_position(preferred_times,null) is null)
);
alter table public.customer_preferences enable row level security;
revoke all on public.customer_preferences from anon, authenticated;
grant select, insert on public.customer_preferences to authenticated;
grant update(region,locality,radius_km,preferred_days,preferred_times) on public.customer_preferences to authenticated;
create policy preferences_read on public.customer_preferences for select to authenticated using (
 ((select auth.uid())=user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false))
 or (select public.crm_is_employee())
);
create policy preferences_insert on public.customer_preferences for insert to authenticated with check (
 (select auth.uid())=user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)
);
create policy preferences_update on public.customer_preferences for update to authenticated using (
 (select auth.uid())=user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)
) with check (
 (select auth.uid())=user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false)
);

create table public.bookings (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 course_id uuid references public.courses(id) on delete set null,
 course_title text not null check (char_length(btrim(course_title)) between 1 and 200),
 starts_at timestamptz not null,
 venue text not null default '' check (char_length(venue)<=300),
 price numeric(10,2) not null default 0 check (price>=0),
 quantity integer not null default 1 check (quantity between 1 and 1000),
 status text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
 created_at timestamptz not null default now()
);
create index bookings_user_date_idx on public.bookings(user_id,starts_at,id);
create index bookings_course_idx on public.bookings(course_id);
alter table public.bookings enable row level security;
revoke all on public.bookings from anon, authenticated;
grant select,insert,update on public.bookings to authenticated;
create policy bookings_read on public.bookings for select to authenticated using (
 ((select auth.uid())=user_id and not coalesce(((select auth.jwt())->>'is_anonymous')::boolean,false))
 or (select public.crm_is_employee())
);
create policy bookings_insert on public.bookings for insert to authenticated with check ((select public.crm_is_employee()));
create policy bookings_update on public.bookings for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));
comment on table public.customer_preferences is 'Customer-selected course information preferences; radius is a preference, not a geospatial filter.';
comment on table public.bookings is 'Employee-assigned customer bookings. External provider bookings are not imported automatically. Price is per participant in CHF.';
