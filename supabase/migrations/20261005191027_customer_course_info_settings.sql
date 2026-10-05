alter table public.customer_preferences add column categories text[] not null default '{}'
 check (categories <@ array['yoga-wellness','kochen-geniessen','kunst-handwerk','fotografie-design','tanz-bewegung','natur-draussen']::text[] and cardinality(categories)<=6 and array_position(categories,null) is null);
alter table public.customer_preferences add constraint preferences_radius_origin check (radius_km is null or char_length(btrim(locality))>0);
grant update(categories) on public.customer_preferences to authenticated;
create function public.save_course_preferences(settings jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 current_profile jsonb;
begin
 if settings is null or jsonb_typeof(settings)<>'object' or exists(
  select 1 from jsonb_object_keys(settings) as k(key) where key not in ('region','locality','radius_km','categories','preferred_days','preferred_times','channel','interest')
 ) then raise exception 'Ungültige Kursinfos-Einstellungen';end if;
 if jsonb_typeof(settings->'categories')<>'array' or jsonb_typeof(settings->'preferred_days')<>'array' or jsonb_typeof(settings->'preferred_times')<>'array' then
  raise exception 'Bitte Kategorien und Zeiten prüfen';
 end if;
 current_profile:=public.customer_profile();
 if not (current_profile->>'saved')::boolean then raise exception 'Bitte zuerst dein Profil speichern';end if;
 perform public.customer_profile(jsonb_build_object(
  'name',current_profile->>'name','phone',current_profile->>'phone',
  'interest',coalesce(settings->>'interest',''),'channel',settings->>'channel'
 ));
 insert into public.customer_preferences(user_id,region,locality,radius_km,categories,preferred_days,preferred_times)
 values((select auth.uid()),coalesce(settings->>'region',''),coalesce(settings->>'locality',''),(settings->>'radius_km')::integer,
  array(select jsonb_array_elements_text(settings->'categories')),
  array(select jsonb_array_elements_text(settings->'preferred_days')),
  array(select jsonb_array_elements_text(settings->'preferred_times')))
 on conflict(user_id) do update set
 region=excluded.region,locality=excluded.locality,radius_km=excluded.radius_km,
 categories=excluded.categories,preferred_days=excluded.preferred_days,preferred_times=excluded.preferred_times;
 return jsonb_build_object('saved',true);
end;
$$;
revoke all on function public.save_course_preferences(jsonb) from public,anon;
grant execute on function public.save_course_preferences(jsonb) to authenticated;
comment on function public.save_course_preferences(jsonb) is 'Atomically stores course preferences and contact channel in the customer profile; executes with caller RLS.';
