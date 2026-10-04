begin;
select set_config('courses.baseline',(select count(*)::text from public.courses where status='published' and archived_at is null and starts_at>now() and seats>0),true);
select set_config('request.jwt.claims',(select json_build_object('sub',id,'role','authenticated','app_metadata',raw_app_meta_data,'is_anonymous',false)::text from auth.users where email='info.sponti@gmail.com'),true);
set local role authenticated;
do $$ declare c uuid; p uuid; begin
insert into public.courses(title,category,region,venue,starts_at,price,seats) values ('Test draft','kunst-handwerk','zug','Studio',now()+interval '1 day',25,3) returning id into c;
if (select status from public.courses where id=c)<>'draft' then raise exception 'Default is not draft'; end if;
insert into public."Kursanbieter"(company,contact,email,category,offer_type) values ('Test course provider','Test','test-course@example.invalid','Etwas anderes','Beides') returning id into p;
begin
update public.courses set provider_id=p,status='published' where id=c;
raise exception 'Unconfirmed provider published';
exception when insufficient_privilege then null;
end;
update public."Kursanbieter" set crm_status='Partner' where id=p;
update public.courses set provider_id=p,status='published' where id=c;
perform set_config('courses.test_id',c::text,true);
insert into public.courses(title,category,region,venue,starts_at,status,seats) values
 ('Test hidden draft','kunst-handwerk','zug','Studio',now()+interval '1 day','draft',3),
 ('Test hidden past','kunst-handwerk','zug','Studio',now()-interval '1 day','published',3),
 ('Test hidden full','kunst-handwerk','zug','Studio',now()+interval '1 day','published',0);
end $$;
reset role;
set local role anon;
do $$ begin
if (select count(id) from public.courses)<>current_setting('courses.baseline')::int+1 then raise exception 'Public visibility failed'; end if;
if not exists(select id from public.courses where id=current_setting('courses.test_id')::uuid) then raise exception 'Published course missing'; end if;
begin insert into public.courses(title,category,region,venue,starts_at) values ('Unauthorized','kunst-handwerk','zug','Studio',now());raise exception 'Anon insert allowed';exception when insufficient_privilege then null;end;
begin perform provider_id from public.courses;raise exception 'Anon sees internal provider ID';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000099","role":"authenticated","app_metadata":{},"is_anonymous":false}',true);
set local role authenticated;
do $$ begin
if (select count(*) from public.courses)<>current_setting('courses.baseline')::int+1 then raise exception 'Ordinary user sees drafts';end if;
update public.courses set title='Hacked' where id=current_setting('courses.test_id')::uuid;
if found then raise exception 'Ordinary user can update';end if;
end $$;
reset role;
select set_config('request.jwt.claims',(select json_build_object('sub',id,'role','authenticated','app_metadata',raw_app_meta_data,'is_anonymous',false)::text from auth.users where email='info.sponti@gmail.com'),true);
set local role authenticated;
update public.courses set archived_at=now(),status='draft' where id=current_setting('courses.test_id')::uuid;
reset role;
set local role anon;
do $$ begin if (select count(id) from public.courses)<>current_setting('courses.baseline')::int then raise exception 'Archive remains public';end if;end $$;
reset role;
rollback;
select 'Course creation, provider approval, publication, privacy and archive passed; rolled back' as result;
