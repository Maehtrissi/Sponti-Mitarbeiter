alter policy "Website submits customers" on public."Kunden - Users" to anon;
alter policy "Submit provider enquiry" on public."Kursanbieter" to anon;
drop policy "Provider submissions start new" on public."Kursanbieter";
alter policy "Employees add notes" on public.crm_notes
with check ((select public.crm_is_employee()) and author_id = (select auth.uid()) and author = ((select auth.jwt())->>'email'));
notify pgrst, 'reload schema';
