import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
const allowed = new Set(["https://sponti-switzerland.ch","https://www.sponti-switzerland.ch","https://maehtrissi.github.io"]);
Deno.serve(async (req:Request)=>{
 const origin=req.headers.get("origin")||"";
 const headers={"Content-Type":"application/json","Access-Control-Allow-Origin":allowed.has(origin)?origin:"https://sponti-switzerland.ch","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Vary":"Origin"};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==="OPTIONS")return new Response(null,{headers});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 try {
  const auth=req.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return reply({error:"Authentication required"},401);
  const url=Deno.env.get("SUPABASE_URL")!, key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user},error}=await client.auth.getUser(auth.slice(7));
  if(error||!user||user.is_anonymous)return reply({error:"Invalid session"},401);
  const {data:employee}=await client.from("crm_employees").select("active").eq("user_id",user.id).maybeSingle();
  if(!employee?.active||user.app_metadata?.sponti_employee!==true)return reply({error:"CRM access required"},403);
  const {to,subject,message,request_id}=await req.json();
  if(typeof to!=="string"||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||to.length>254||typeof subject!=="string"||!subject.trim()||subject.length>180||typeof message!=="string"||!message.trim()||message.length>10000)return reply({error:"Invalid email data"},400);
  if(typeof request_id!=="string"||! /^[a-f0-9-]{36}$/i.test(request_id))return reply({error:"Ungültige Versandkennung."},400);
  const apiKey=Deno.env.get("RESEND_API_KEY");
  if(!apiKey)return reply({error:"RESEND_API_KEY is not configured"},503);
  const result=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${apiKey}`,"Content-Type":"application/json","Idempotency-Key":`crm-email/${user.id}/${request_id}`},body:JSON.stringify({from:"Sponti <info@sponti-switzerland.ch>",reply_to:"info.sponti@gmail.com",to:[to],subject,text:message})});
  const data=await result.json();
  if(!result.ok)return reply({error:"Der E-Mail-Dienst hat den Versand abgelehnt. Bitte Absender und Versandlimit prüfen."},502);
  return reply({ok:true,id:data.id});
 }catch{return reply({error:"Unable to send email"},500)}
});
