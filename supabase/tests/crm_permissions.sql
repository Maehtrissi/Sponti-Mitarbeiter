-- Transactional integration checks against the live schema. No test records remain.
begin;
select set_config('crm.expected_customers',(select count(*)::text from public."Kunden - Users"),true);
select set_config('request.jwt.claims', (select json_build_object('sub',id,'role','authenticated','email',email,'app_metadata',raw_app_meta_data,'is_anonymous',false)::text from auth.users where email='info.sponti@gmail.com'), true);
set local role authenticated;
do $$ declare customer bigint; provider uuid; task uuid;
begin
if not public.crm_is_employee() then raise exception 'Employee access failed'; end if;
if (select count(*) from public."Kunden - Users") <> current_setting('crm.expected_customers')::bigint then raise exception 'Existing customers inaccessible'; end if;
insert into public."Kunden - Users" ("Name","Email","Phone","Interest","ContactChannel",crm_source)
values ('CRM integration test','crm-test@example.invalid','+41790000000','Kochen','Beides','CRM') returning id into customer;
update public."Kunden - Users" set crm_status='Pausiert' where id=customer;
insert into public."Kursanbieter" (company,contact,email,category,offer_type,crm_source)
values ('CRM test company','CRM test contact','provider-test@example.invalid','Etwas anderes','Beides','CRM') returning id into provider;
insert into public.crm_notes(customer_id,body) values (customer,'CRM rollback test');
insert into public.crm_tasks(provider_id,title,due_date) values (provider,'CRM rollback task',current_date) returning id into task;
update public.crm_tasks set done=true where id=task;
if not (select done from public.crm_tasks where id=task) then raise exception 'Task persistence failed'; end if;
if (select crm_status from public."Kunden - Users" where id=customer)<>'Pausiert' then raise exception 'Customer status failed'; end if;
if not exists(select 1 from public.crm_notes where customer_id=customer and body='CRM rollback test') then raise exception 'Note persistence failed'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000099","role":"authenticated","app_metadata":{"sponti_employee":true},"is_anonymous":false}',true);
set local role authenticated;
do $$ begin
if public.crm_is_employee() then raise exception 'Unknown user has employee access'; end if;
if (select count(*) from public."Kunden - Users") <> 0 then raise exception 'Customer privacy failed'; end if;
if (select count(*) from public."Kursanbieter") <> 0 then raise exception 'Provider privacy failed'; end if;
if (select count(*) from public.crm_notes) <> 0 then raise exception 'Note privacy failed'; end if;
if (select count(*) from public.crm_tasks) <> 0 then raise exception 'Task privacy failed'; end if;
begin
insert into public.crm_tasks(title,due_date) values ('Unauthorized',current_date);
raise exception 'Unauthorized task insert allowed';
exception when insufficient_privilege then null;
end;
end $$;
reset role;
select set_config('request.jwt.claims', (select json_build_object('sub',id,'role','authenticated','email',email,'app_metadata',raw_app_meta_data,'is_anonymous',true)::text from auth.users where email='info.sponti@gmail.com'), true);
set local role authenticated;
do $$ begin
if public.crm_is_employee() then raise exception 'Anonymous user has employee access'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
begin perform * from public."Kunden - Users"; raise exception 'Anonymous read allowed'; exception when insufficient_privilege then null; end;
begin perform * from public.crm_notes; raise exception 'Anonymous notes read allowed'; exception when insufficient_privilege then null; end;
insert into public."Kunden - Users" ("Name","Email","Phone","Interest","ContactChannel") values ('Website rollback test','website-test@example.invalid','0791234567','Yoga','E-Mail');
insert into public."Kursanbieter" (company,contact,email,category,offer_type,message) values ('Website rollback provider','Test contact','web-provider@example.invalid','Etwas anderes','Mehrere Kurse','Test');
end $$;
reset role;
rollback;
select 'CRM permissions and form submissions passed; test records rolled back' as result;
