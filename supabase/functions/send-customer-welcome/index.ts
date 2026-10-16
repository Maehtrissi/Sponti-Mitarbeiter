// Compatibility endpoint: old clients no longer send a second welcome message.
// The confirmed-email database event now queues both customer and provider mail.
Deno.serve((req:Request)=>new Response(JSON.stringify({ok:true,queued_by_confirmation:true}),{
 headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'https://sponti-switzerland.ch','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS'},
 status:req.method==='POST'||req.method==='OPTIONS'?200:405
}));
