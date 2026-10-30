const cors = {"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"authorization, apikey, content-type","Vary":"Origin","Content-Type":"application/json"};
const allowed=new Set(["https://webao.cz","https://www.webao.cz","http://terminal.local:4173"]);
Deno.serve(async req=>{
 const origin=req.headers.get("origin")||"";
 const headers={...cors,...(allowed.has(origin)?{"Access-Control-Allow-Origin":origin}:{})};
 const reply=(status:number,data:unknown)=>new Response(JSON.stringify(data),{status,headers});
 if(!allowed.has(origin))return reply(403,{error:"Nepovolený původ požadavku."});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply(405,{error:"Použijte formulář na webu."});
 if(Number(req.headers.get("content-length")||0)>16000)return reply(413,{error:"Zpráva je příliš dlouhá."});
 try{
  const raw=await req.text();if(raw.length>16000)return reply(413,{error:"Zpráva je příliš dlouhá."});
  const b=JSON.parse(raw);
  if(b.website)return reply(200,{ok:true});
  const clean=(v:unknown,max:number)=>typeof v==="string"?v.trim().slice(0,max):"";
  const slug=clean(b.project,80),name=clean(b.name,120),email=clean(b.email,254).toLowerCase();
  const phone=clean(b.phone,40),company=clean(b.company,160),message=clean(b.message,3000);
  const type=clean(b.interest_type,20),amount=b.amount===""||b.amount==null?null:Number(b.amount);
  if(!/^[a-z0-9-]+$/.test(slug)||name.length<2||!/^\S+@\S+\.\S+$/.test(email)||!["investment","partnership","expertise"].includes(type)||b.privacy!==true||amount!==null&&(!Number.isFinite(amount)||amount<=0||amount>1000000000))return reply(400,{error:"Zkontrolujte jméno, e-mail, typ zájmu a potvrzení seznámení s ochranou údajů."});
  const base=Deno.env.get("SUPABASE_URL")!,key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const dbHeaders={"apikey":key,"Authorization":"Bearer "+key,"Content-Type":"application/json"};
  const ip=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()||"unknown";
  const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode("webao-interest:"+new Date().toISOString().slice(0,10)+":"+ip)))).map(v=>v.toString(16).padStart(2,"0")).join("");
  const cutoff=new Date(Date.now()-3600000).toISOString();
  const rate=await fetch(base+"/rest/v1/webao_rate_limits?select=id&ip_hash=eq."+hash+"&created_at=gte."+encodeURIComponent(cutoff)+"&limit=5",{headers:dbHeaders});
  if(!rate.ok)throw new Error("rate-read");
  if((await rate.json()).length>=5)return reply(429,{error:"Bylo odesláno příliš mnoho zpráv. Zkuste to později."});
  const pr=await fetch(base+"/rest/v1/webao_projects?select=id&slug=eq."+encodeURIComponent(slug)+"&open_to_interest=eq.true&limit=1",{headers:dbHeaders});
  if(!pr.ok)throw new Error("project-read");const projects=await pr.json();
  if(!projects.length)return reply(400,{error:"Tento projekt právě nepřijímá nové zájemce."});
  const record=await fetch(base+"/rest/v1/webao_interests",{method:"POST",headers:dbHeaders,body:JSON.stringify({project_id:projects[0].id,name,email,phone,company,message,interest_type:type,amount})});
  if(!record.ok)throw new Error("interest-insert");
  await fetch(base+"/rest/v1/webao_rate_limits",{method:"POST",headers:dbHeaders,body:JSON.stringify({ip_hash:hash})});
  await fetch(base+"/rest/v1/webao_rate_limits?created_at=lt."+encodeURIComponent(new Date(Date.now()-86400000).toISOString()),{method:"DELETE",headers:dbHeaders});
  return reply(200,{ok:true});
 }catch{return reply(500,{error:"Zprávu se nepodařilo uložit. Zkuste to znovu nebo napište na studio@webao.cz."});}
});
