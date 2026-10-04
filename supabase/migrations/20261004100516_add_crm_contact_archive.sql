alter table public."Kunden - Users" add column archived_at timestamptz;
alter table public."Kursanbieter" add column archived_at timestamptz;
grant update (archived_at) on public."Kunden - Users",public."Kursanbieter" to authenticated;
notify pgrst, 'reload schema';
