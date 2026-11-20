-- AGB-Zustimmung bei der Anbieter-Registrierung: serverseitig erzwingen und im CRM sichtbar machen.
alter table public."Kursanbieter"
  add column if not exists agb_accepted boolean,
  add column if not exists agb_accepted_at timestamptz,
  add column if not exists agb_version text;
comment on column public."Kursanbieter".agb_accepted is 'true = bei der Registrierung akzeptiert; null = nicht erfasst (z. B. unverbindliche Anfrage oder manuell angelegt)';

-- 1) Eine Anbieter-Registrierung ohne AGB-Zustimmung wird abgelehnt (auch wenn das Formular umgangen wird).
create or replace function private.require_provider_terms() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if new.raw_user_meta_data ? 'provider_application'
     and coalesce(new.raw_user_meta_data->>'provider_terms_accepted','') <> 'true' then
    raise exception 'Die AGB müssen akzeptiert werden, um ein Anbieterkonto zu erstellen.' using errcode='check_violation';
  end if;
  return new;
end $$;
drop trigger if exists require_provider_terms on auth.users;
create trigger require_provider_terms before insert on auth.users
  for each row execute function private.require_provider_terms();

-- 2) Beim Anlegen eines Anbieter-Eintrags die Zustimmung aus dem Konto übernehmen (unabhängig vom bestehenden Anlage-Trigger).
create or replace function private.fill_provider_agb() returns trigger language plpgsql security definer set search_path='' as $$
declare meta jsonb;
begin
  if new.agb_accepted is null and new.email is not null then
    select raw_user_meta_data into meta from auth.users
      where lower(email)=lower(trim(new.email)) and raw_user_meta_data->>'provider_terms_accepted'='true'
      order by created_at desc limit 1;
    if meta is not null then
      new.agb_accepted:=true;
      new.agb_accepted_at:=coalesce(nullif(meta->>'provider_terms_accepted_at','')::timestamptz,now());
      new.agb_version:=nullif(meta->>'provider_terms_version','');
    end if;
  end if;
  return new;
end $$;
drop trigger if exists fill_provider_agb on public."Kursanbieter";
create trigger fill_provider_agb before insert on public."Kursanbieter"
  for each row execute function private.fill_provider_agb();

-- 3) Bestehende Einträge nachtragen, soweit die Zustimmung im Konto belegt ist.
update public."Kursanbieter" k set
  agb_accepted=true,
  agb_accepted_at=coalesce(nullif(u.raw_user_meta_data->>'provider_terms_accepted_at','')::timestamptz,k.created_at),
  agb_version=nullif(u.raw_user_meta_data->>'provider_terms_version','')
from auth.users u
where k.agb_accepted is null and lower(u.email)=lower(trim(k.email)) and u.raw_user_meta_data->>'provider_terms_accepted'='true';
