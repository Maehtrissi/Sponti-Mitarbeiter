alter table public."Kursanbieter" add column location text not null default '' check (char_length(location)<=300);
grant insert(location) on public."Kursanbieter" to anon,authenticated;
grant update(location) on public."Kursanbieter" to authenticated;
comment on column public."Kursanbieter".location is 'Provider business location/address supplied through enquiry or maintained by employees; separate from the course venue.';
notify pgrst,'reload schema';
