const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/health'){
 try{const row=await env.DB.prepare('SELECT 1 AS ok').first();return json({status:row?.ok===1?'ok':'unavailable'},row?.ok===1?200:503)}catch{return json({status:'unavailable'},503)}
 }
 if(url.pathname.startsWith('/api/')){
 if(!env.GOOGLE_CLIENT_ID)return json({error:'Authentication not configured'},503);
 const token=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
 if(!token||token.length>8192)return json({error:'Unauthorized'},401);
 // Identity verification must be installed before enabling any data endpoint.
 return json({error:'Identity verification unavailable'},503);
 }
 return json({error:'Not found'},404);
}};