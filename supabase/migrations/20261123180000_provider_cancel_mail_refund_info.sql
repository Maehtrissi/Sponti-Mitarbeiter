-- Anbieter-Stornomail: Zahlungsstatus «Zurückerstattet» statt «Unbekannt» und neue Variable REFUND_MESSAGE.
do $mig$
declare def text; a1 text; b1 text; a2 text; b2 text;
begin
  def := pg_get_functiondef('public.claim_provider_event_emails()'::regprocedure);
  a1 := $$when b.payment_status='not_required' then 'Kostenlos' else 'Unbekannt' end,$$;
  b1 := $$when b.payment_status='not_required' then 'Kostenlos' when b.payment_status='refunded' then 'Zurückerstattet' else 'Unbekannt' end,$$;
  a2 := $$'CANCELLATION_DATETIME',to_char(now() AT TIME ZONE 'Europe/Zurich','DD.MM.YYYY HH24:MI')||' Uhr'$$;
  b2 := a2 || $$,'REFUND_MESSAGE',case when b.payment_status='refunded' then 'Der Betrag wurde dem Kunden zurückerstattet. Dein Anteil wird dir bei Stripe wieder abgezogen.' else 'Es wurde keine Zahlung zurückerstattet.' end$$;
  if position(a1 in def)=0 or position(a2 in def)=0 then raise exception 'Funktion hat sich geändert, Anpassung abgebrochen'; end if;
  def := replace(replace(def,a1,b1),a2,b2);
  execute def;
end
$mig$;
