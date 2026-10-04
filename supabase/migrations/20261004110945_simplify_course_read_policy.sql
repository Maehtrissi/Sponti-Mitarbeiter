drop policy courses_public_read on public.courses;
drop policy courses_employee_read on public.courses;
create policy courses_public_read on public.courses for select to anon using (status='published' and archived_at is null and starts_at>now() and seats>0);
create policy courses_authenticated_read on public.courses for select to authenticated using ((select public.crm_is_employee()) or (status='published' and archived_at is null and starts_at>now() and seats>0));
notify pgrst,'reload schema';
