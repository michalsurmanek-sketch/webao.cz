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
async function readBody(request,max){
 const reader=request.body?.getReader();if(!reader)throw Error('body');let size=0;const decoder=new TextDecoder('utf-8',{fatal:true});let text='';
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>max){await reader.cancel();throw Error('size')}text+=decoder.decode(value,{stream:true})}return JSON.parse(text+decoder.decode())}finally{reader.releaseLock()}
}
async function handle(request,env){
 const url=new URL(request.url);
 if(request.method==='GET'&&url.pathname==='/health'){
 try{const row=await env.DB.prepare('SELECT 1 AS ok').first();return json({status:row?.ok===1?'ok':'unavailable'},row?.ok===1?200:503)}catch{return json({status:'unavailable'},503)}
 }
 if(url.pathname.startsWith('/api/')){
 if(!env.GOOGLE_CLIENT_ID)return json({error:'Authentication not configured'},503);
 const token=request.headers.get('Authorization')?.match(/^Bearer ([A-Za-z0-9_.-]+)$/)?.[1];
 if(!token||token.length>8192)return json({error:'Unauthorized'},401);
 let claims;try{claims=await verify(token,env.GOOGLE_CLIENT_ID)}catch{return json({error:'Unauthorized'},401)}
 try{
 const issuer='https://accounts.google.com',email=claims.email_verified===true&&typeof claims.email==='string'?claims.email:null;
 await env.DB.prepare('INSERT INTO users(id,identity_issuer,identity_subject,email) VALUES(?,?,?,?) ON CONFLICT(identity_issuer,identity_subject) DO NOTHING').bind(crypto.randomUUID(),issuer,claims.sub,email).run();
 const user=await env.DB.prepare('SELECT id,email,created_at FROM users WHERE identity_issuer=? AND identity_subject=?').bind(issuer,claims.sub).first();
 if(url.pathname==='/api/me'&&request.method==='GET')return json({user});
 if(url.pathname==='/api/projects'&&request.method==='GET'){
 const {results}=await env.DB.prepare('SELECT id,url,name,created_at FROM projects WHERE user_id=? ORDER BY created_at DESC LIMIT 100').bind(user.id).all();return json({projects:results});
 }
 if(url.pathname==='/api/projects'&&request.method==='POST'){
 let body;try{body=await readBody(request,8192)}catch{return json({error:'Invalid body'},400)}
 let target;try{target=new URL(body.url);if(!['https:','http:'].includes(target.protocol)||target.username||target.password)throw Error();target.hash=''}catch{return json({error:'Invalid URL'},400)}
 const name=typeof body.name==='string'?body.name.trim():target.hostname;
 if(!name||name.length>200||target.href.length>2048)return json({error:'Invalid project'},400);
 const id=crypto.randomUUID();
 const result=await env.DB.prepare('INSERT INTO projects(id,user_id,url,name) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM projects WHERE user_id=?)<100 ON CONFLICT(user_id,url) DO NOTHING').bind(id,user.id,target.href,name,user.id).run();
 if(!result.meta.changes)return json({error:'Duplicate or project limit'},409);
 return json({id,url:target.href,name},201);
 }
 const detail=url.pathname.match(/^\/api\/projects\/([a-f0-9-]{36})\/audits\/([a-f0-9-]{36})$/);
 if(detail&&request.method==='GET'){
 const audit=await env.DB.prepare('SELECT a.id,a.score,a.created_at,a.report_json FROM audits a JOIN projects p ON p.id=a.project_id WHERE p.user_id=? AND p.id=? AND a.id=?').bind(user.id,detail[1],detail[2]).first();
 if(!audit)return json({error:'Not found'},404);
 const {report_json,...metadata}=audit;return json({audit:{...metadata,report:JSON.parse(report_json)}});
 }
 if(detail&&request.method==='DELETE'){
 const result=await env.DB.prepare('DELETE FROM audits WHERE id=? AND project_id IN (SELECT id FROM projects WHERE id=? AND user_id=?)').bind(detail[2],detail[1],user.id).run();
 return result.meta.changes?json({deleted:true}):json({error:'Not found'},404);
 }
 const match=url.pathname.match(/^\/api\/projects\/([a-f0-9-]{36})(\/audits)?$/);
 if(match){
 const project=await env.DB.prepare('SELECT id FROM projects WHERE id=? AND user_id=?').bind(match[1],user.id).first();if(!project)return json({error:'Not found'},404);
 if(!match[2]&&request.method==='DELETE'){await env.DB.prepare('DELETE FROM projects WHERE id=? AND user_id=?').bind(project.id,user.id).run();return json({deleted:true})}
 if(match[2]&&request.method==='GET'){const {results}=await env.DB.prepare('SELECT id,score,created_at FROM audits WHERE project_id=? ORDER BY created_at DESC LIMIT 100').bind(project.id).all();return json({audits:results})}
 if(match[2]&&request.method==='POST'){
 let body;try{body=await readBody(request,500000)}catch{return json({error:'Invalid body'},400)}
 if(!body.report||typeof body.report!=='object'||!Number.isInteger(body.score)||body.score<0||body.score>100)return json({error:'Invalid audit'},400);
 const id=crypto.randomUUID(),report=JSON.stringify(body.report);
 const result=await env.DB.prepare('INSERT INTO audits(id,project_id,score,report_json) SELECT ?,?,?,? WHERE EXISTS(SELECT 1 FROM projects WHERE id=? AND user_id=?) AND (SELECT COUNT(*) FROM audits WHERE project_id=?)<100').bind(id,project.id,body.score,report,project.id,user.id,project.id).run();
 if(!result.meta.changes)return json({error:'Audit limit or project unavailable'},409);
 return json({id},201);
 }
 }
 }catch{return json({error:'Service unavailable'},503)}
 }
 return json({error:'Not found'},404);
}
export default {async fetch(request,env){
 const origin=request.headers.get('Origin');
 const allowed=origin==='https://webao.cz';
 if(origin&&!allowed)return json({error:'Origin not allowed'},403);
 const cors={'Access-Control-Allow-Origin':'https://webao.cz','Vary':'Origin'};
 if(request.method==='OPTIONS'){
 if(!allowed)return json({error:'Origin not allowed'},403);
 return new Response(null,{status:204,headers:{...cors,'Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Access-Control-Allow-Headers':'Authorization, Content-Type','Access-Control-Max-Age':'600'}});
 }
 const url=new URL(request.url);
 const response=url.pathname==='/auth/config'&&request.method==='GET'?json({googleClientId:env.GOOGLE_CLIENT_ID||null}):await handle(request,env);
 if(!allowed)return response;
 const headers=new Headers(response.headers);for(const [k,v] of Object.entries(cors))headers.set(k,v);
 return new Response(response.body,{status:response.status,headers});
}};