alter table public.course_reviews
 add column if not exists reply text not null default '' check (length(reply)<=3000),
 add column if not exists replied_at timestamptz;
alter table public.course_reviews enable row level security;
grant select on public.course_reviews to anon, authenticated;
grant update(status,reply) on public.course_reviews to authenticated;
grant delete on public.course_reviews to authenticated;
create policy "Published reviews are public" on public.course_reviews for select to anon,authenticated using (status='approved');
create policy "CRM employees read reviews" on public.course_reviews for select to authenticated using ((select public.crm_is_employee()));
create policy "CRM employees moderate reviews" on public.course_reviews for update to authenticated using ((select public.crm_is_employee())) with check ((select public.crm_is_employee()));
create policy "CRM employees delete reviews" on public.course_reviews for delete to authenticated using ((select public.crm_is_employee()));
create or replace function public.review_reply_timestamp() returns trigger language plpgsql set search_path='' as $$
begin
 if new.reply is distinct from old.reply then
  new.reply:=btrim(new.reply);
  new.replied_at:=case when new.reply='' then null else now() end;
 end if;
 return new;
end $$;
create trigger set_review_reply_timestamp before update on public.course_reviews for each row execute function public.review_reply_timestamp();
