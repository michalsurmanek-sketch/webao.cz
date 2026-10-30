export const BASE='https://jmukoccjqykyoqsypuwb.supabase.co';
export const KEY='sb_publishable_FSrTbgu1LeF9DNeam3ztwA_3dNHGq-V';
export const ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptdWtvY2NqcXlreW9xc3lwdXdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDUwNTYsImV4cCI6MjEwNjI4MTA1Nn0.ZVNWpY5jSS7ODlVspTacGBFm_Y4Kllze_jiR7DCzwmc';
export function escapeHTML(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
export const money=v=>new Intl.NumberFormat('cs-CZ',{style:'currency',currency:'CZK',maximumFractionDigits:0}).format(Number(v)||0);
export async function request(path,{method='GET',body,token,prefer}={}){
 const headers={apikey:KEY,'Content-Type':'application/json'};
 if(token)headers.Authorization='Bearer '+token;
 if(prefer)headers.Prefer=prefer;
 const r=await fetch(BASE+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const data=await r.json().catch(()=>null);
 if(!r.ok){const error=new Error(data?.error_description||data?.msg||data?.message||data?.error||'Požadavek se nezdařil.');error.status=r.status;throw error;}
 return data;
}
