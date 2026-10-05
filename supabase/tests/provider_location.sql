begin;
select set_config('location.employee',gen_random_uuid()::text,true);
select set_config('location.email',gen_random_uuid()::text||'@example.invalid',true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values(current_setting('location.employee')::uuid,'authenticated','authenticated','location-staff@example.invalid',now(),'{"sponti_employee":true}','{}');
insert into public.crm_employees(user_id,active) values(current_setting('location.employee')::uuid,true);
set local role anon;
insert into public."Kursanbieter"(company,contact,email,phone,location,category,offer_type,message)
values('Location Test','Test Person',current_setting('location.email'),'0791234567','Bahnhofstrasse 10, 6300 Zug','Kunst & Handwerk','Beides','Test');
do $$ begin
 begin
 insert into public."Kursanbieter"(company,contact,email,location,category,offer_type)
 values('Too Long','Test',current_setting('location.email'),repeat('x',301),'Kunst & Handwerk','Beides');
 raise exception 'Oversized location accepted';
 exception when check_violation then null;end;
 begin perform location from public."Kursanbieter";raise exception 'Anon can read provider locations';exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('location.provider',(select id::text from public."Kursanbieter" where email=current_setting('location.email')),true);
select set_config('request.jwt.claims',json_build_object('sub',current_setting('location.employee'),'role','authenticated','is_anonymous',false,'app_metadata',json_build_object('sponti_employee',true))::text,true);
set local role authenticated;
do $$ begin
 if not exists(select 1 from public."Kursanbieter" where id=current_setting('location.provider')::uuid and location='Bahnhofstrasse 10, 6300 Zug' and crm_status='Neu') then raise exception 'Enquiry location not saved or approval bypassed';end if;
end $$;
update public."Kursanbieter" set location='Baarerstrasse 20, 6300 Zug',crm_status='Partner' where id=current_setting('location.provider')::uuid;
insert into public.courses(title,description,category,region,venue,starts_at,price,seats,status)
values('Association Test','Detailed test course description','kunst-handwerk','zug','Kursatelier Zug',now()+interval '30 days',25,5,'draft');
reset role;
select set_config('location.course',(select id::text from public.courses where title='Association Test' and provider_id is null order by created_at desc limit 1),true);
set local role authenticated;
update public.courses set provider_id=current_setting('location.provider')::uuid where id=current_setting('location.course')::uuid;
do $$ begin
 if not exists(select 1 from public.courses where id=current_setting('location.course')::uuid and provider_id=current_setting('location.provider')::uuid and description='Detailed test course description') then raise exception 'Deferred association failed';end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"authenticated","is_anonymous":false,"app_metadata":{}}',true);
set local role authenticated;
do $$ declare n integer;begin
 if exists(select 1 from public."Kursanbieter") then raise exception 'Customer can read providers';end if;
 update public."Kursanbieter" set location='Unauthorised';get diagnostics n=row_count;
 if n<>0 then raise exception 'Customer can edit location';end if;
 update public.courses set provider_id=null where id=current_setting('location.course')::uuid;get diagnostics n=row_count;
 if n<>0 then raise exception 'Customer can change course provider';end if;
end $$;
reset role;
rollback;
select 'Public location submission, employee edits, deferred course association and customer isolation passed; rolled back' as result;
