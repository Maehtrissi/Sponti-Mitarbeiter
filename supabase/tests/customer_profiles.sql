begin;
select set_config('profile.user_a',gen_random_uuid()::text,true);
select set_config('profile.user_b',gen_random_uuid()::text,true);
select set_config('profile.user_unconfirmed',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values
(current_setting('profile.user_a')::uuid,'authenticated','authenticated','profile-a@example.invalid',now(),'{}','{}'),
(current_setting('profile.user_b')::uuid,'authenticated','authenticated','profile-b@example.invalid',now(),'{}','{"sponti_employee":true}'),
(current_setting('profile.user_unconfirmed')::uuid,'authenticated','authenticated','profile-unconfirmed@example.invalid',null,'{}','{}');
insert into public."Kunden - Users"("Name","Email","Phone","Interest","ContactChannel",crm_message)
values ('Legacy A','PROFILE-A@example.invalid','0791234567','Yoga','E-Mail','Private staff note');
select set_config('profile.legacy_id',(select id::text from public."Kunden - Users" where "Email"='PROFILE-A@example.invalid'),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('profile.user_a'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
do $$ declare p jsonb; begin
p:=public.customer_profile();
if p->>'name'<>'Legacy A' or p->>'email'<>'profile-a@example.invalid' or p ? 'crm_message' or p ? 'id' then raise exception 'Legacy claim or response privacy failed';end if;
p:=public.customer_profile('{"name":"Updated A","phone":"+41 79 123 45 67","interest":"Cooking","channel":"Beides"}');
if p->>'phone'<>'+41 79 123 45 67' then raise exception 'Profile update failed';end if;
p:=public.customer_profile('{"name":"Updated A","phone":"0791234567","interest":"Yoga","channel":"Keine"}');
if p->>'channel'<>'Keine' then raise exception 'Opt out failed';end if;
if exists(select 1 from public."Kunden - Users") then raise exception 'Customer can read CRM table';end if;
if exists(select 1 from public.crm_notes) then raise exception 'Customer can read staff notes';end if;
begin
perform public.customer_profile('{"name":"Bad","phone":"0791234567","interest":"","channel":"E-Mail","email":"profile-b@example.invalid"}');
raise exception 'Email injection allowed';
exception when raise_exception then if sqlerrm='Email injection allowed' then raise;end if;end;
begin
perform public.customer_profile('{"name":"Bad","phone":"invalid","interest":"","channel":"E-Mail"}');
raise exception 'Invalid phone accepted';
exception when raise_exception then if sqlerrm='Invalid phone accepted' then raise;end if;end;
end $$;
reset role;
do $$ begin
if (select member_user_id::text from public."Kunden - Users" where id=current_setting('profile.legacy_id')::bigint)<>current_setting('profile.user_a') then raise exception 'Wrong ownership';end if;
if (select "ContactChannel" from public."Kunden - Users" where id=current_setting('profile.legacy_id')::bigint) is not null then raise exception 'Opt out not saved in CRM';end if;
if (select crm_message from public."Kunden - Users" where id=current_setting('profile.legacy_id')::bigint)<>'Private staff note' then raise exception 'CRM note changed';end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('profile.user_b'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
do $$ declare p jsonb;begin
p:=public.customer_profile();if (p->>'saved')::boolean or p->>'email'<>'profile-b@example.invalid' then raise exception 'User B claimed user A';end if;
if public.crm_is_employee() then raise exception 'Metadata privilege escalation';end if;
p:=public.customer_profile('{"name":"Customer B","phone":"0797654321","interest":"Dance","channel":"WhatsApp"}');
if p->>'name'<>'Customer B' then raise exception 'New profile failed';end if;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('profile.user_unconfirmed'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
do $$ begin begin perform public.customer_profile();raise exception 'Unconfirmed email accepted';exception when insufficient_privilege then null;end;end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('profile.user_a'),'role','authenticated','is_anonymous',true)::text,true);
set local role authenticated;
do $$ begin begin perform public.customer_profile();raise exception 'Anonymous user accepted';exception when insufficient_privilege then null;end;end $$;
reset role;
set local role anon;
do $$ begin begin perform public.customer_profile();raise exception 'Public profile accepted';exception when insufficient_privilege then null;end;end $$;
reset role;
rollback;
select 'Customer ownership, legacy linking, profile edits, opt out, CRM privacy and email verification passed; rolled back' as result;
