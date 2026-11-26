const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/health'){
 try{const row=await env.DB.prepare('SELECT 1 AS ok').first();return json({status:row?.ok===1?'ok':'unavailable'},row?.ok===1?200:503)}catch{return json({status:'unavailable'},503)}
 }
 if(url.pathname.startsWith('/api/'))return json({error:'Authentication not configured'},503);
 return json({error:'Not found'},404);
}};