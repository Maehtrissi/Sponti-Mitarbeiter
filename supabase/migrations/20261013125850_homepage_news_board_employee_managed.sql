-- Employee-managed homepage news board. Applied in Supabase as homepage_news_board_employee_managed.
create table if not exists public.homepage_news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 100),
  body text not null default '' check (char_length(body) <= 280),
  label text not null default 'Neu' check (label in ('Neu','Kurse','Aktion','Info')),
  link_url text not null default '' check (char_length(link_url) <= 2048 and (link_url='' or link_url ~ '^https://[^[:space:]]+$' or link_url ~ '^/[^/[:space:]][^[:space:]]*$' or link_url='/')),
  status text not null default 'draft' check (status in ('draft','published')),
  priority integer not null default 0 check (priority between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.homepage_news enable row level security;
revoke all on table public.homepage_news from anon, authenticated;
grant select on table public.homepage_news to anon;
grant select,insert,update,delete on table public.homepage_news to authenticated;
create policy homepage_news_public_read on public.homepage_news for select to anon using (status='published');
create policy homepage_news_member_read on public.homepage_news for select to authenticated using (status='published' or (select public.crm_is_employee()));
create policy homepage_news_employee_insert on public.homepage_news for insert to authenticated with check ((select public.crm_is_employee()));
create policy homepage_news_employee_update on public.homepage_news for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));
create policy homepage_news_employee_delete on public.homepage_news for delete to authenticated using ((select public.crm_is_employee()));
create index if not exists homepage_news_published_sort on public.homepage_news (status,priority desc,created_at desc);
