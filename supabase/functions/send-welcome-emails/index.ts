import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {createClient} from "npm:@supabase/supabase-js@2.117.2";
import {welcomeMail} from './mail.ts';
import {workerTokenHash} from './worker-config.ts';

Deno.serve(async(req:Request)=>{
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});
 if(req.method!=='POST')return reply({error:'Method not allowed'},405);
 const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';
 if(!/^[a-f0-9]{64}$/.test(token))return reply({error:'Unauthorized'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==workerTokenHash)return reply({error:'Unauthorized'},401);
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
 try{
  const {data:apiKey,error:keyError}=await db.rpc('welcome_mail_sending_key');
  if(keyError||typeof apiKey!=='string'||!apiKey)return reply({error:'Mail service not configured'},503);
  const {data:jobs,error}=await db.rpc('claim_welcome_emails');
  if(error)throw new Error('Queue claim failed');
  let sent=0,failed=0;
  for(const job of jobs||[]){
   let state='pending',messageId:string|null=null,reason:string|null=null;
   try{
    const {data,error:lookupError}=await db.auth.admin.getUserById(job.user_id);
    if(lookupError)throw new Error('Account lookup failed');
    const user=data.user;
    if(!user||!user.email_confirmed_at||user.is_anonymous||user.email!==job.email||user.app_metadata?.sponti_employee===true){
     state='cancelled';reason='Account no longer eligible';
    }else{
     const response=await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json','Idempotency-Key':`sponti-welcome-v1/${job.user_id}`},
      body:JSON.stringify({...welcomeMail(job.kind),to:[job.email]}),signal:AbortSignal.timeout(10000)
     });
     if(response.ok){
      const body=await response.json();
      if(typeof body.id!=='string')throw new Error('Uncertain mail response');
      state='sent';messageId=body.id;sent++;
     }else{
      state=(response.status===429||response.status>=500||response.status===409)?'pending':'failed';
      reason=`Mail service HTTP ${response.status}`;failed++;
     }
    }
   }catch{reason='Temporary delivery or account lookup failure';failed++;}
   const result=await db.rpc('finish_welcome_email',{p_user_id:job.user_id,p_lease_id:job.lease_id,p_status:state,p_resend_id:messageId,p_error:reason});
   if(result.error||result.data!==true)throw new Error('Queue acknowledgement failed');
   // Stay within the email service request rate, including concurrent CRM sends.
   await new Promise(resolve=>setTimeout(resolve,600));
  }
  return reply({ok:true,processed:(jobs||[]).length,sent,failed});
 }catch{return reply({error:'Welcome queue temporarily unavailable'},500);}
});
