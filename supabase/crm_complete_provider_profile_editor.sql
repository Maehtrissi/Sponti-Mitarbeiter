CREATE OR REPLACE FUNCTION public.crm_profile_editor(p_kind text, p_contact_id text, p_changes jsonb DEFAULT NULL::jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare v_customer bigint; v_provider uuid; v_user uuid; v_profile jsonb; v_prefs jsonb; v_result jsonb; v_rec record;
begin
 if auth.uid() is null or not public.crm_is_employee() then raise exception 'CRM access required' using errcode='42501'; end if;
 if p_kind='customer' then
  v_customer:=p_contact_id::bigint;
  select member_user_id into v_user from public."Kunden - Users" where id=v_customer;
  if not found then raise exception 'Customer not found'; end if;
  if p_changes is not null then
   if jsonb_typeof(p_changes)<>'object' then raise exception 'Invalid changes'; end if;
   update public."Kunden - Users" set
    "Name"=case when p_changes ? 'name' then left(p_changes->>'name',200) else "Name" end,
    "Phone"=case when p_changes ? 'phone' then left(p_changes->>'phone',100) else "Phone" end,
    "Interest"=case when p_changes ? 'interest' then left(p_changes->>'interest',500) else "Interest" end,
    "ContactChannel"=case when p_changes ? 'channel' then p_changes->>'channel' else "ContactChannel" end
   where id=v_customer;
   if p_changes ? 'channel' and (p_changes->>'channel') not in ('WhatsApp','E-Mail','Beides','Keine') then raise exception 'Invalid channel'; end if;
   if v_user is not null then
    insert into public.customer_preferences(user_id) values(v_user) on conflict(user_id) do nothing;
    update public.customer_preferences set
     locality=case when p_changes ? 'locality' then left(p_changes->>'locality',200) else locality end,
     radius_km=case when p_changes ? 'radius_km' then nullif(p_changes->>'radius_km','')::integer else radius_km end,
     regions=case when p_changes ? 'regions' then array(select jsonb_array_elements_text(p_changes->'regions')) else regions end,
     region=case when p_changes ? 'regions' then coalesce(p_changes->'regions'->>0,'') else region end,
     categories=case when p_changes ? 'categories' then array(select jsonb_array_elements_text(p_changes->'categories')) else categories end,
     preferred_days=case when p_changes ? 'preferred_days' then array(select jsonb_array_elements_text(p_changes->'preferred_days')) else preferred_days end,
     preferred_times=case when p_changes ? 'preferred_times' then array(select jsonb_array_elements_text(p_changes->'preferred_times')) else preferred_times end
    where user_id=v_user;
   end if;
  end if;
  select to_jsonb(c) into v_profile from (select "Name" as name,"Phone" as phone,"Interest" as interest,"ContactChannel" as channel,"Email" as email from public."Kunden - Users" where id=v_customer) c;
  select to_jsonb(cp) - 'user_id' into v_prefs from public.customer_preferences cp where user_id=v_user;
  return jsonb_build_object('kind','customer','linked',v_user is not null,'profile',v_profile,'preferences',coalesce(v_prefs,'{}'::jsonb));
 elsif p_kind='provider' then
  v_provider:=p_contact_id::uuid;
  perform 1 from public."Kursanbieter" where id=v_provider;
  if not found then raise exception 'Provider not found'; end if;
  select user_id into v_user from private.provider_accounts where provider_id=v_provider;
  if v_user is not null then perform 1 from public.provider_profiles where user_id=v_user for update; end if;
  if p_changes is not null then
   if jsonb_typeof(p_changes)<>'object' then raise exception 'Invalid changes'; end if;
   update public."Kursanbieter" set
    email=case when p_changes ? 'email' then left(p_changes->>'email',254) else email end,
    company=case when p_changes ? 'company' then left(p_changes->>'company',200) else company end,
    contact=case when p_changes ? 'contact_name' then left(p_changes->>'contact_name',200) else contact end,
    phone=case when p_changes ? 'phone' then left(p_changes->>'phone',100) else phone end,
    location=case when p_changes ? 'location' then left(p_changes->>'location',300) else location end,
    website_url=case when p_changes ? 'website' then left(p_changes->>'website',2048) else website_url end,
    category=case when p_changes ? 'category' then left(p_changes->>'category',120) else category end
   where id=v_provider;
   if v_user is not null then
    if p_changes ? 'specialties' and (jsonb_typeof(p_changes->'specialties') <> 'array' or jsonb_array_length(p_changes->'specialties') > 30) then raise exception 'Maximal 30 Angebote als Liste erlaubt'; end if;
    if p_changes ? 'social_links' and (jsonb_typeof(p_changes->'social_links') <> 'array' or jsonb_array_length(p_changes->'social_links') > 20) then raise exception 'Maximal 20 Links als Liste erlaubt'; end if;
    for v_rec in select key,value from jsonb_each(p_changes) where key in ('logo_path','banner_path','_add_photo') loop
     if v_rec.value <> 'null'::jsonb and coalesce(v_rec.value #>> '{}','') <> '' then
      if split_part(v_rec.value #>> '{}','/',1) <> v_user::text or not exists(select 1 from storage.objects where bucket_id='provider-gallery' and name=v_rec.value #>> '{}') then raise exception 'Bild gehört nicht zu diesem Anbieter'; end if;
     end if;
    end loop;
    if p_changes ? '_add_photo' then
     if (select count(*) from public.provider_photos where provider_id=v_user)>=5 then raise exception 'Maximal fünf Galeriefotos erlaubt'; end if;
     insert into public.provider_photos(provider_id,storage_path) values(v_user,p_changes->>'_add_photo');
    end if;
    if p_changes ? '_remove_photo' then
     delete from public.provider_photos where provider_id=v_user and id=(p_changes->>'_remove_photo')::uuid;
     if not found then raise exception 'Galeriefoto nicht gefunden'; end if;
    end if;
    update public.provider_profiles set
      logo_path=case when p_changes ? 'logo_path' then nullif(p_changes->>'logo_path','') else logo_path end,
      banner_path=case when p_changes ? 'banner_path' then nullif(p_changes->>'banner_path','') else banner_path end,
      description=case when p_changes ? 'description' then left(p_changes->>'description',3000) else description end,
      company=case when p_changes ? 'company' then left(p_changes->>'company',200) else company end,
      contact_name=case when p_changes ? 'contact_name' then left(p_changes->>'contact_name',200) else contact_name end,
      phone=case when p_changes ? 'phone' then left(p_changes->>'phone',100) else phone end,
      location=case when p_changes ? 'location' then left(p_changes->>'location',300) else location end,
      website=case when p_changes ? 'website' then left(p_changes->>'website',2048) else website end,
      category=case when p_changes ? 'category' then left(p_changes->>'category',120) else category end,
      about_text=case when p_changes ? 'about_text' then left(p_changes->>'about_text',1000) else about_text end,
      postal_code=case when p_changes ? 'postal_code' then left(p_changes->>'postal_code',10) else postal_code end,
      city=case when p_changes ? 'city' then left(p_changes->>'city',120) else city end,
      public_email=case when p_changes ? 'public_email' then left(p_changes->>'public_email',200) else public_email end,
      public_phone=case when p_changes ? 'public_phone' then left(p_changes->>'public_phone',100) else public_phone end,
      internal_notes=case when p_changes ? 'internal_notes' then left(p_changes->>'internal_notes',3000) else internal_notes end,
      booking_url=case when p_changes ? 'booking_url' then left(p_changes->>'booking_url',2048) else booking_url end,
      specialties=case when p_changes ? 'specialties' then p_changes->'specialties' else specialties end,
      social_links=case when p_changes ? 'social_links' then p_changes->'social_links' else social_links end,
      updated_at=now()
    where user_id=v_user;
   end if;
  end if;
  select to_jsonb(k) into v_profile from (select company,contact as contact_name,phone,location,website_url as website,category,email from public."Kursanbieter" where id=v_provider) k;
  if v_user is not null then
   select (coalesce(to_jsonb(p),'{}'::jsonb)-'user_id') into v_prefs from public.provider_profiles p where user_id=v_user;
  end if;
  return jsonb_build_object('kind','provider','linked',v_user is not null,'media_user_id',v_user,'photos',coalesce((select jsonb_agg(jsonb_build_object('id',id,'storage_path',storage_path) order by created_at) from public.provider_photos where provider_id=v_user),'[]'::jsonb),'profile',coalesce(v_profile,'{}'::jsonb)||coalesce(v_prefs,'{}'::jsonb));
 else raise exception 'Invalid profile type'; end if;
end $function$;
revoke all on function public.crm_profile_editor(text,text,jsonb) from public, anon;
grant execute on function public.crm_profile_editor(text,text,jsonb) to authenticated;
create policy "CRM employees upload provider images" on storage.objects for insert to authenticated with check (bucket_id='provider-gallery' and (select public.crm_is_employee()));
create policy "CRM employees read provider images" on storage.objects for select to authenticated using (bucket_id='provider-gallery' and (select public.crm_is_employee()));
create policy "CRM employees remove provider images" on storage.objects for delete to authenticated using (bucket_id='provider-gallery' and (select public.crm_is_employee()));
