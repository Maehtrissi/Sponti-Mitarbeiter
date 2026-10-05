alter table public."Kunden - Users" add column member_user_id uuid unique references auth.users(id) on delete set null;
create index customers_email_claim_idx on public."Kunden - Users"(lower(trim("Email"))) where member_user_id is null;
create schema if not exists private;
revoke all on schema private from public,anon;
grant usage on schema private to authenticated;
-- Narrow ownership bridge: existing CRM tables remain employee-only. No public table read is added.
create function private.customer_profile(profile jsonb default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 uid uuid:=auth.uid(); verified_email text; metadata jsonb; customer public."Kunden - Users"%rowtype;
 pname text; phone text; interest text; channel text;
begin
 if uid is null or coalesce((auth.jwt()->>'is_anonymous')::boolean,false) then raise exception 'Bitte melde dich mit einem bestätigten Konto an.' using errcode='42501';end if;
 select lower(trim(email)),raw_user_meta_data into verified_email,metadata from auth.users where id=uid and email_confirmed_at is not null and coalesce(is_anonymous,false)=false;
 if verified_email is null then raise exception 'Bitte bestätige zuerst deine E-Mail-Adresse.' using errcode='42501';end if;
 perform pg_advisory_xact_lock(hashtextextended(verified_email,0));
 select * into customer from public."Kunden - Users" where member_user_id=uid for update;
 if customer.id is null then
  select * into customer from public."Kunden - Users" where member_user_id is null and lower(trim("Email"))=verified_email and archived_at is null order by created_at,id limit 1 for update;
  if customer.id is not null then update public."Kunden - Users" set member_user_id=uid where id=customer.id;end if;
 end if;
 if customer.archived_at is not null then raise exception 'Dein Kundenprofil wurde archiviert. Bitte kontaktiere Sponti.' using errcode='42501';end if;
 if profile is not null then
  if jsonb_typeof(profile)<>'object' or exists(select 1 from jsonb_object_keys(profile) k where k not in ('name','phone','interest','channel')) then raise exception 'Ungültige Profilfelder.';end if;
  pname:=trim(coalesce(profile->>'name',''));phone:=trim(coalesce(profile->>'phone',''));interest:=trim(coalesce(profile->>'interest',''));channel:=coalesce(profile->>'channel','');
  if length(pname) not between 1 and 200 or length(phone)>100 or phone !~ '^[+0-9 ()/.\-]+$' or length(regexp_replace(phone,'[^0-9]','','g')) not between 7 and 15 or position('+' in phone)>1 or length(phone)-length(replace(phone,'+',''))>1 or length(interest)>500 or channel not in ('WhatsApp','E-Mail','Beides','Keine') then raise exception 'Bitte prüfe Name, Telefonnummer und Kontaktkanal.';end if;
  if customer.id is null then
   insert into public."Kunden - Users"("Name","Email","Phone","Interest","ContactChannel",member_user_id) values(pname,verified_email,phone,interest,nullif(channel,'Keine'),uid) returning * into customer;
  else
   update public."Kunden - Users" set "Name"=pname,"Email"=verified_email,"Phone"=phone,"Interest"=interest,"ContactChannel"=nullif(channel,'Keine') where id=customer.id returning * into customer;
  end if;
 end if;
 if customer.id is null then
  return jsonb_build_object('name',left(coalesce(metadata->>'name',''),200),'email',verified_email,'phone',left(coalesce(metadata->>'phone',''),100),'interest',left(coalesce(metadata->>'interest',''),500),'channel',coalesce(metadata->>'channel',''),'saved',false);
 end if;
 return jsonb_build_object('name',customer."Name",'email',verified_email,'phone',customer."Phone",'interest',customer."Interest",'channel',coalesce(customer."ContactChannel",'Keine'),'saved',true);
end $$;
revoke all on function private.customer_profile(jsonb) from public,anon;
grant execute on function private.customer_profile(jsonb) to authenticated;
create function public.customer_profile(profile jsonb default null) returns jsonb
language sql security invoker set search_path='' as $$select private.customer_profile(profile)$$;
revoke all on function public.customer_profile(jsonb) from public,anon;
grant execute on function public.customer_profile(jsonb) to authenticated;
notify pgrst,'reload schema';
