alter table public."Kursanbieter" add column website_url text not null default '' check (length(website_url)<=2048 and (website_url='' or website_url ~ '^https?://[^[:space:]]+$'));
grant insert (website_url) on public."Kursanbieter" to anon,authenticated;
grant update (website_url) on public."Kursanbieter" to authenticated;
notify pgrst, 'reload schema';
