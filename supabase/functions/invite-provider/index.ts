import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const allowedOrigins=new Set(["https://sponti-switzerland.ch","https://www.sponti-switzerland.ch","https://maehtrissi.github.io"]);
const corsFor=(req:Request)=>{const origin=req.headers.get("Origin")||"";return {"Access-Control-Allow-Origin":allowedOrigins.has(origin)?origin:"https://sponti-switzerland.ch","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin","Content-Type":"application/json"};};
Deno.serve(async(req)=>{
 const cors=corsFor(req);
 const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:cors});
 if(req.method==="OPTIONS") return new Response("ok",{headers:cors});
 if(req.method!=="POST") return json({error:"Methode nicht erlaubt."},405);
 try{
  const url=Deno.env.get("SUPABASE_URL")!, key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const auth=req.headers.get("Authorization")||"";
  if(!auth.startsWith("Bearer ")) return json({error:"Nicht angemeldet."},401);
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const token=auth.slice(7);
  const {data:{user},error:userError}=await admin.auth.getUser(token);
  if(userError||!user||user.is_anonymous) return json({error:"Ungültige Sitzung."},401);
  const {data:employee}=await admin.from("crm_employees").select("active").eq("user_id",user.id).maybeSingle();
  if(!employee?.active||user.app_metadata?.sponti_employee!==true) return json({error:"Kein aktiver CRM-Mitarbeiterzugang."},403);
  const body=await req.json();
  const providerId=String(body.provider_id||"");
  const {data:provider,error:providerError}=await admin.from("Kursanbieter").select("id,company,contact,email,phone,location,website_url,category,crm_status,archived_at").eq("id",providerId).maybeSingle();
  if(providerError||!provider||provider.archived_at) return json({error:"Anbieter nicht gefunden."},404);
  if(provider.crm_status!=="Partner") return json({error:"Der Anbieter muss zuerst als Partner bestätigt werden."},400);
  const {data:existing,error:existingError}=await admin.rpc("crm_provider_account_admin",{p_action:"by_provider",p_provider_id:providerId});
  if(existingError) return json({error:"Anbieterzuordnung konnte nicht geprüft werden."},500);
  if(existing?.user_id){
   const {data:account,error:accountLookupError}=await admin.auth.admin.getUserById(existing.user_id);
   if(accountLookupError||!account.user||String(account.user.email).trim().toLowerCase()!==String(provider.email).trim().toLowerCase()) return json({error:"Die E-Mail-Adresse stimmt nicht mit dem verknüpften Konto überein. Bitte zuerst die Zuordnung prüfen."},409);
   const {error:resendError}=await admin.auth.resetPasswordForEmail(provider.email,{redirectTo:"https://sponti-switzerland.ch/anbieter.html"});
   if(resendError) return json({error:"Der Zugangslink konnte nicht versendet werden. Bitte die SMTP-Einstellungen in Supabase prüfen und erneut versuchen."},502);
   return json({ok:true,email:provider.email,existing:true});
  }
  let uid="";
  let reusedExisting=false;
  const {data:invite,error:inviteError}=await admin.auth.admin.inviteUserByEmail(provider.email,{redirectTo:"https://sponti-switzerland.ch/anbieter.html",data:{account_type:"provider",provider_id:provider.id}});
  if(inviteError||!invite.user){
   const emailExists=(inviteError as any)?.code==="email_exists" || /already been registered|already exists/i.test(inviteError?.message||"");
   if(!emailExists) return json({error:"Einladung konnte nicht versendet werden. Bitte die SMTP-Einstellungen in Supabase prüfen und erneut versuchen."},502);
   const normalizedEmail=String(provider.email||"").trim().toLowerCase();
   let found:any=null;
   for(let page=1;page<=20&&!found;page++){
    const {data:list,error:listError}=await admin.auth.admin.listUsers({page,perPage:1000});
    if(listError) return json({error:"Bestehender Benutzer konnte nicht geprüft werden."},500);
    found=list.users.find((u:any)=>String(u.email||"").trim().toLowerCase()===normalizedEmail);
    if(list.users.length<1000) break;
   }
   if(!found) return json({error:"Die E-Mail existiert bereits, konnte aber keinem Benutzer zugeordnet werden."},409);
   const {data:otherAccount,error:otherError}=await admin.rpc("crm_provider_account_admin",{p_action:"by_user",p_user_id:found.id});
   if(otherError) return json({error:"Bestehende Anbieterzuordnung konnte nicht geprüft werden."},500);
   if(otherAccount?.provider_id && otherAccount.provider_id!==providerId) return json({error:"Diese E-Mail ist bereits mit einem anderen Anbieter verknüpft."},409);
   uid=found.id;
   reusedExisting=true;
   const currentAppMeta=found.app_metadata||{};
   const {error:updateError}=await admin.auth.admin.updateUserById(uid,{app_metadata:{...currentAppMeta,account_type:"provider",provider_id:provider.id}});
   if(updateError) return json({error:"Bestehender Benutzer konnte nicht als Anbieter vorbereitet werden."},500);
  } else uid=invite.user.id;
  const {error:accountError}=await admin.rpc("crm_provider_account_admin",{p_action:"insert",p_user_id:uid,p_provider_id:provider.id,p_location:provider.location||""});
  if(accountError)return json({error:"Anbieterzugang konnte nicht verknüpft werden. Bitte erneut versuchen; das Konto bleibt erhalten."},500);
  const {error:profileError}=await admin.from("provider_profiles").upsert({user_id:uid,company:provider.company||"",contact_name:provider.contact||"",phone:provider.phone||"",location:provider.location||"",website:provider.website_url||"",category:provider.category||"",description:"",booking_url:""},{onConflict:"user_id",ignoreDuplicates:true});
  if(profileError){await admin.rpc("crm_provider_account_admin",{p_action:"delete",p_user_id:uid});return json({error:"Anbieterprofil konnte nicht vorbereitet werden. Bitte erneut versuchen; das Konto bleibt erhalten."},500);}
  if(reusedExisting){
   const publicClient=createClient(url,Deno.env.get("SUPABASE_ANON_KEY")||key,{auth:{persistSession:false,autoRefreshToken:false}});
   const {error:resetError}=await publicClient.auth.resetPasswordForEmail(provider.email,{redirectTo:"https://sponti-switzerland.ch/anbieter.html"});
   if(resetError) return json({error:"Zugang verknüpft, aber die E-Mail konnte nicht gesendet werden. Bitte SMTP prüfen und den Anbieter-Zugang erneut senden."},502);
   return json({ok:true,email:provider.email,existing:true});
  }
  return json({ok:true,email:provider.email,existing:false});
 }catch(e){return json({error:e instanceof Error?e.message:"Unbekannter Fehler."},500);}
});
