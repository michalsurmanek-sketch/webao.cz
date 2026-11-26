const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const decode=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const parse=s=>JSON.parse(new TextDecoder().decode(decode(s)));
async function verify(token,audience){
 const parts=token.split('.');if(parts.length!==3)throw Error('token');
 const [h,p,s]=parts,header=parse(h),claims=parse(p),now=Math.floor(Date.now()/1000);
 if(header.alg!=='RS256'||typeof header.kid!=='string'||!['https://accounts.google.com','accounts.google.com'].includes(claims.iss)||claims.aud!==audience||(claims.azp&&claims.azp!==audience)||!Number.isInteger(claims.exp)||claims.exp<=now||!Number.isInteger(claims.iat)||claims.iat>now+60||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255)throw Error('claims');
 const res=await fetch('https://www.googleapis.com/oauth2/v3/certs',{redirect:'error'});if(!res.ok)throw Error('keys');
 const {keys}=await res.json();const jwk=keys.find(k=>k.kid===header.kid&&k.kty==='RSA'&&k.alg==='RS256');if(!jwk)throw Error('key');
 const key=await crypto.subtle.importKey('jwk',jwk,{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(!await crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,decode(s),new TextEncoder().encode(h+'.'+p)))throw Error('signature');
 return claims;
}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/health'){
 try{const row=await env.DB.prepare('SELECT 1 AS ok').first();return json({status:row?.ok===1?'ok':'unavailable'},row?.ok===1?200:503)}catch{return json({status:'unavailable'},503)}
 }
 if(url.pathname.startsWith('/api/')){
 if(!env.GOOGLE_CLIENT_ID)return json({error:'Authentication not configured'},503);
 const token=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
 if(!token||token.length>8192)return json({error:'Unauthorized'},401);
 let claims;try{claims=await verify(token,env.GOOGLE_CLIENT_ID)}catch{return json({error:'Unauthorized'},401)}
 if(url.pathname==='/api/me'&&request.method==='GET'){
 try{const issuer='https://accounts.google.com',email=claims.email_verified===true&&typeof claims.email==='string'?claims.email:null;
 await env.DB.prepare('INSERT INTO users(id,identity_issuer,identity_subject,email) VALUES(?,?,?,?) ON CONFLICT(identity_issuer,identity_subject) DO UPDATE SET email=excluded.email').bind(crypto.randomUUID(),issuer,claims.sub,email).run();
 const user=await env.DB.prepare('SELECT id,email,created_at FROM users WHERE identity_issuer=? AND identity_subject=?').bind(issuer,claims.sub).first();return json({user});
 }catch{return json({error:'Service unavailable'},503)}
 }
 }
 return json({error:'Not found'},404);
}};