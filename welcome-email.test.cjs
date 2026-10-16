const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {transformSync}=require('esbuild');
const dir=__dirname+'/supabase/functions/send-welcome-emails/';
const token='a'.repeat(64),user={id:'test-user',email:'test@example.invalid',email_confirmed_at:'2026-10-16',app_metadata:{}};
async function scenario({kind='customer',status=200,jobs=true,authorized=true,confirmed=true}={}){
 let payload,headers,finished;
 const db={rpc:async(name,args)=>name==='welcome_mail_sending_key'?{data:'test-only'}:name==='claim_welcome_emails'?{data:jobs?[{user_id:user.id,email:user.email,kind,lease_id:'test-lease'}]:[]}:(finished=args,{data:true}),auth:{admin:{getUserById:async()=>({data:{user:{...user,email_confirmed_at:confirmed?user.email_confirmed_at:null}}})}}};
 const ctx={Request,Response,TextEncoder,AbortSignal,crypto:crypto.webcrypto,setTimeout:r=>r(),createClient:()=>db,workerTokenHash:crypto.createHash('sha256').update(token).digest('hex'),Deno:{env:{get:()=> 'test-only'},serve:fn=>ctx.handle=fn},fetch:async(_url,options)=>{payload=JSON.parse(options.body);headers=options.headers;return new Response(JSON.stringify({id:'test-message'}),{status});}};
 vm.createContext(ctx);
 vm.runInContext(transformSync(fs.readFileSync(dir+'mail.ts','utf8').replace('export function','function'),{loader:'ts'}).code,ctx);
 vm.runInContext(transformSync(fs.readFileSync(dir+'index.ts','utf8').replace(/^import .*\n/gm,''),{loader:'ts'}).code,ctx);
 const response=await ctx.handle(new Request('https://test.invalid',{method:'POST',headers:{Authorization:'Bearer '+(authorized?token:'bad')}}));
 return {response,payload,headers,finished};
}
(async()=>{
 let x=await scenario();assert.equal(x.finished.p_status,'sent');assert.match(x.payload.text,/dein Sponti-Konto ist bereit/);assert.equal(x.payload.reply_to,'info@sponti-switzerland.ch');assert.equal(x.headers['Idempotency-Key'],'sponti-welcome-v1/test-user');
 x=await scenario({kind:'provider'});assert.match(x.payload.text,/prüfen deine Angaben/);assert.match(x.payload.html,/anbieter.html/);assert.equal(x.finished.p_status,'sent');
 x=await scenario({status:429});assert.equal(x.finished.p_status,'pending');
 x=await scenario({status:422});assert.equal(x.finished.p_status,'failed');
 x=await scenario({authorized:false});assert.equal(x.response.status,401);assert.equal(x.payload,undefined);
 x=await scenario({confirmed:false});assert.equal(x.finished.p_status,'cancelled');assert.equal(x.payload,undefined);
 x=await scenario({jobs:false});assert.equal((await x.response.json()).processed,0);assert.equal(x.payload,undefined);
 console.log('PASS: two templates, deterministic idempotency, retry, permanent failure, worker authentication, recipient eligibility, empty queue');
})().catch(e=>{console.error(e);process.exitCode=1;});
