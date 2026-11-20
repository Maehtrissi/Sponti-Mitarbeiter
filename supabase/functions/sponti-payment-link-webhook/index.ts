import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import {createClient} from "npm:@supabase/supabase-js@2.117.2";
// Verbucht Zahlungen über Stripe-Zahlungslinks (inkl. mehrerer Plätze) als Kursbuchung.
// Secrets: STRIPE_PAYMENT_LINK_KEY (Secret oder Restricted Key, Lesezugriff genügt), STRIPE_PAYMENT_LINK_WEBHOOK_SECRET
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const base=(u:string)=>{try{const x=new URL(u);return x.origin+x.pathname.replace(/\/+$/,"");}catch{return "";}};
Deno.serve(async(req)=>{
 if(req.method!=="POST")return new Response("Method not allowed",{status:405});
 const key=Deno.env.get("STRIPE_PAYMENT_LINK_KEY"),signing=Deno.env.get("STRIPE_PAYMENT_LINK_WEBHOOK_SECRET");
 if(!key||!signing)return new Response("Not configured",{status:503});
 const stripe=new Stripe(key,{apiVersion:"2024-11-20"});
 const signature=req.headers.get("stripe-signature");
 if(!signature)return new Response("Missing signature",{status:400});
 let event:Stripe.Event;
 try{event=await stripe.webhooks.constructEventAsync(await req.text(),signature,signing,undefined,Stripe.createSubtleCryptoProvider());}
 catch{return new Response("Invalid signature",{status:400});}
 if(!["checkout.session.completed","checkout.session.async_payment_succeeded"].includes(event.type))return new Response("ok");
 const session=event.data.object as Stripe.Checkout.Session;
 if(!session.payment_link||session.metadata?.sponti_booking_id)return new Response("ok"); // nur Zahlungslinks, nicht den normalen Checkout
 if(session.payment_status!=="paid"||session.mode!=="payment")return new Response("ok");
 const db=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false}});
 const courseId=String(session.client_reference_id||"");
 const issue=async(note:string)=>{await db.rpc("sponti_record_payment_link_issue",{p_session_id:session.id,p_course_id:uuid.test(courseId)?courseId:null,p_note:note});return new Response("ok");};
 if(!uuid.test(courseId))return await issue("Zahlung ohne Kurszuordnung (client_reference_id fehlt).");
 try{
  const {data:course,error:ce}=await db.from("courses").select("payment_link").eq("id",courseId).maybeSingle();
  if(ce)throw ce;
  if(!course)return await issue("Kurs nicht gefunden.");
  const link=await stripe.paymentLinks.retrieve(String(session.payment_link));
  if(!base(course.payment_link||"")||base(link.url)!==base(course.payment_link))return await issue("Zahlungslink gehört nicht zu diesem Kurs.");
  const items=await stripe.checkout.sessions.listLineItems(session.id,{limit:100});
  const quantity=items.data.reduce((n,i)=>n+(i.quantity||0),0);
  const {error}=await db.rpc("sponti_record_payment_link_booking",{p_session_id:session.id,p_course_id:courseId,p_quantity:quantity,p_amount_total:session.amount_total,p_currency:session.currency,p_name:session.customer_details?.name||"",p_email:session.customer_details?.email||session.customer_email||"",p_phone:session.customer_details?.phone||""});
  if(error)throw error;
  return new Response("ok");
 }catch(e){console.error("Payment link booking failed",e instanceof Error?e.message:e);return new Response("Retry later",{status:500});}
});
