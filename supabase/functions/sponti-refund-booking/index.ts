import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.117.2";
const cors={"access-control-allow-origin":"*","access-control-allow-headers":"authorization,content-type,apikey,x-client-info","access-control-allow-methods":"POST,OPTIONS"};
const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{...cors,"content-type":"application/json","cache-control":"no-store"}});
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
Deno.serve(async req=>{
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
 if(req.method!=="POST")return json({error:"Method not allowed"},405);
 const secret=Deno.env.get("STRIPE_SECRET_KEY")||"";
 if(!secret.startsWith("sk_test_"))return json({error:"Rückerstattungen sind vorerst nur im Testmodus freigeschaltet."},503);
 const auth=req.headers.get("authorization")||"";
 const url=Deno.env.get("SUPABASE_URL")!;
 // Nur Mitarbeitende: die Berechtigung wird mit dem Login der anfragenden Person geprüft.
 const user=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")!,{global:{headers:{authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}});
 const {data:isEmployee}=await user.rpc("crm_is_employee");
 if(isEmployee!==true)return json({error:"Nicht berechtigt."},403);
 let body:any;try{body=await req.json()}catch{return json({error:"Ungültige Anfrage."},400)}
 if(!body||typeof body.booking_id!=="string"||!uuid.test(body.booking_id))return json({error:"Ungültige Buchungsnummer."},400);
 const db=createClient(url,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:b}=await db.from("course_checkout_bookings").select("id,course_id,booking_status,payment_status,payment_reference,total_chf,payout_mode").eq("id",body.booking_id).maybeSingle();
 if(!b)return json({error:"Buchung nicht gefunden."},404);
 if(b.booking_status==="refunded")return json({ok:true,already:true});
 if(b.booking_status!=="confirmed"||b.payment_status!=="paid"||!String(b.payment_reference||"").startsWith("cs_test_"))return json({error:"Nur bezahlte, bestätigte Testbuchungen können hier zurückerstattet werden."},409);
 // Frist: bis 24 Stunden vor Kursbeginn. Ausnahme: der Kurs wurde abgesagt (archiviert oder nicht mehr veröffentlicht).
 const {data:course}=await db.from("courses").select("starts_at,status,archived_at").eq("id",b.course_id).maybeSingle();
 const cancelledCourse=!course||course.archived_at!==null||course.status!=="published";
 if(!cancelledCourse&&new Date(course.starts_at).getTime()-Date.now()<24*3600*1000)return json({error:"Rückerstattung nur bis 24 Stunden vor Kursbeginn möglich."},409);
 if(b.payout_mode!=="stripe_split")return json({error:"Diese Buchung nutzt die spätere Auszahlung. Bitte direkt in Stripe prüfen."},409);
 const stripe=async(path:string,params?:URLSearchParams,idem?:string)=>{
  const headers:Record<string,string>={authorization:"Bearer "+secret};
  if(params)headers["content-type"]="application/x-www-form-urlencoded";
  if(idem)headers["idempotency-key"]=idem;
  const r=await fetch("https://api.stripe.com/v1/"+path,{method:params?"POST":"GET",headers,body:params?.toString(),signal:AbortSignal.timeout(15000)});
  const obj=await r.json().catch(()=>({}));
  if(!r.ok)throw Error("Stripe "+r.status+" "+String(obj?.error?.code||"error"));
  return obj;
 };
 try{
  const session=await stripe("checkout/sessions/"+encodeURIComponent(b.payment_reference));
  if(session.payment_status!=="paid"||session.livemode!==false||session.amount_total!==Math.round(Number(b.total_chf)*100)||!session.payment_intent)throw Error("Zahlung stimmt nicht mit der Buchung überein.");
  const intent=await stripe("payment_intents/"+encodeURIComponent(session.payment_intent));
  if(intent.status!=="succeeded"||!intent.transfer_data?.destination)throw Error("Zahlung wurde nicht mit Aufteilung erstellt.");
  // Volle Rückerstattung an den Kunden. Der Anbieteranteil wird beim Anbieter zurückgebucht, auch Sponti gibt die eigene Gebühr zurück.
  const params=new URLSearchParams({payment_intent:intent.id,reverse_transfer:"true",refund_application_fee:"true","metadata[sponti_booking_id]":b.id});
  const refund=await stripe("refunds",params,"sponti-refund-"+b.id);
  if(!refund.id||!["succeeded","pending"].includes(refund.status))throw Error("Rückerstattung wurde von Stripe nicht angenommen.");
 }catch(e){
  return json({error:e instanceof Error?e.message:"Rückerstattung fehlgeschlagen."},502);
 }
 const {error}=await db.rpc("sponti_mark_booking_refunded",{p_booking_id:b.id});
 if(error)return json({error:"Stripe hat zurückgezahlt, aber die Buchung konnte nicht aktualisiert werden. Bitte nochmals auf «Rückerstatten» klicken."},500);
 return json({ok:true});
});
