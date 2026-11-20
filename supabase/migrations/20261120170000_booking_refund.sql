-- Rückerstattung einer bezahlten Buchung: Status auf «refunded», Plätze wieder frei. Wird nur von der Edge Function sponti-refund-booking (service_role) aufgerufen.
create or replace function public.sponti_mark_booking_refunded(p_booking_id uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare b record;
begin
  select id,course_id,quantity,booking_status,payment_status into b
  from public.course_checkout_bookings where id=p_booking_id for update;
  if not found then raise exception 'Buchung nicht gefunden'; end if;
  if b.booking_status='refunded' then return false; end if;
  if b.booking_status<>'confirmed' or b.payment_status<>'paid' then
    raise exception 'Nur bezahlte, bestätigte Buchungen können zurückerstattet werden';
  end if;
  update public.courses set seats=seats+b.quantity where id=b.course_id;
  update public.course_checkout_bookings set booking_status='refunded',payment_status='refunded' where id=b.id;
  return true;
end $$;
revoke all on function public.sponti_mark_booking_refunded(uuid) from public, anon, authenticated;
grant execute on function public.sponti_mark_booking_refunded(uuid) to service_role;
