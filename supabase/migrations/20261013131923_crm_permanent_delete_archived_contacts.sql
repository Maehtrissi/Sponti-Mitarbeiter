-- Employee-only permanent deletion of previously archived CRM contacts.
-- Existing foreign keys cascade CRM notes/tasks. Course references protect providers.
grant delete on table public."Kunden - Users" to authenticated;
grant delete on table public."Kursanbieter" to authenticated;
create policy "Employees delete archived customers"
  on public."Kunden - Users" for delete to authenticated
  using (archived_at is not null and (select public.crm_is_employee()));
create policy "Employees delete archived providers"
  on public."Kursanbieter" for delete to authenticated
  using (archived_at is not null and (select public.crm_is_employee()));
notify pgrst, 'reload schema';
