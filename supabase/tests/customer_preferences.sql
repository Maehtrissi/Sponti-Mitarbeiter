begin;
select set_config('prefs.user_a',gen_random_uuid()::text,true);
select set_config('prefs.user_b',gen_random_uuid()::text,true);
insert into auth.users(id,aud,role,email,email_confirmed_at,raw_app_meta_data,raw_user_meta_data)
values(current_setting('prefs.user_a')::uuid,'authenticated','authenticated','prefs-a@example.invalid',now(),'{}','{}'),
(current_setting('prefs.user_b')::uuid,'authenticated','authenticated','prefs-b@example.invalid',now(),'{}','{}');
insert into public.bookings(user_id,course_title,starts_at,status)
values(current_setting('prefs.user_a')::uuid,'Test A',now()+interval '2 days','confirmed'),
(current_setting('prefs.user_b')::uuid,'Test B',now()+interval '3 days','pending');
select set_config('request.jwt.claims',json_build_object('sub',current_setting('prefs.user_a'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
select public.customer_profile('{"name":"Test A","phone":"0791234567","interest":"","channel":"E-Mail"}');
select public.save_course_preferences('{"region":"zug","locality":"6300 Zug","radius_km":20,"categories":["kunst-handwerk","kochen-geniessen"],"preferred_days":["sa","so"],"preferred_times":["afternoon"],"channel":"Beides","interest":"Keramik"}');
do $$ declare n integer; begin
 if not exists(select 1 from public.customer_preferences where region='zug' and radius_km=20 and categories=array['kunst-handwerk','kochen-geniessen'] and preferred_days=array['sa','so']) then raise exception 'Preferences did not persist';end if;
 if public.customer_profile()->>'channel'<>'Beides' then raise exception 'Channel did not persist';end if;
 begin
  perform public.save_course_preferences('{"region":"zug","locality":"6300 Zug","radius_km":20,"categories":["invalid"],"preferred_days":[],"preferred_times":[],"channel":"Keine","interest":""}');
  raise exception 'Invalid categories accepted';
 exception when check_violation then null;end;
 if public.customer_profile()->>'channel'<>'Beides' then raise exception 'Failed settings changed channel: atomicity broken';end if;
 begin
  insert into public.customer_preferences(user_id) values(current_setting('prefs.user_b')::uuid);
  raise exception 'Cross-owner preferences insert allowed';
 exception when insufficient_privilege then null;end;
 begin
  update public.customer_preferences set user_id=current_setting('prefs.user_b')::uuid;
  raise exception 'Preferences owner changed';
 exception when insufficient_privilege then null;end;
 select count(*) into n from public.bookings;
 if n<>1 or exists(select 1 from public.bookings where course_title<>'Test A') then raise exception 'Cross-owner bookings exposed';end if;
 update public.bookings set status='cancelled';get diagnostics n=row_count;
 if n<>0 then raise exception 'Customer can change booking';end if;
 begin
  insert into public.bookings(user_id,course_title,starts_at) values(current_setting('prefs.user_a')::uuid,'Forged',now());
  raise exception 'Customer can forge booking';
 exception when insufficient_privilege then null;end;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('prefs.user_b'),'role','authenticated','is_anonymous',false)::text,true);
set local role authenticated;
do $$ declare n integer; begin
 if exists(select 1 from public.customer_preferences) then raise exception 'User B can see A preferences';end if;
 update public.customer_preferences set region='luzern';get diagnostics n=row_count;
 if n<>0 then raise exception 'User B can edit A preferences';end if;
end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('prefs.user_a'),'role','authenticated','is_anonymous',true)::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.customer_preferences) or exists(select 1 from public.bookings) then raise exception 'Anonymous authenticated user can read private data';end if;
 begin perform public.save_course_preferences('{}');raise exception 'Anonymous preference save allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform count(*) from public.bookings;raise exception 'Anon bookings read allowed';exception when insufficient_privilege then null;end;
 begin perform count(*) from public.customer_preferences;raise exception 'Anon preferences read allowed';exception when insufficient_privilege then null;end;
end $$;
reset role;
rollback;
select 'Course preferences, channels, atomic rollback and private booking permissions passed; rolled back' as result;
