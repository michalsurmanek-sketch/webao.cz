/* WEBAO audit: cache successful PageSpeed results only. */
(function(global){
 'use strict';
 const PREFIX='webao:psi:v1:';
 const TTL=6*60*60*1000;
 // Avoid exhausting the browser's usually small localStorage quota with one Lighthouse payload.
 const MAX_ENTRY_CHARS=2*1024*1024;
 function key(url,strategy){return PREFIX+strategy+':'+url;}
 function valid(payload){
  const result=payload&&payload.lighthouseResult;
  if(!result||typeof result!=='object'||Array.isArray(result)||result.runtimeError)return false;
  // Some supported source fixtures omit categories; do not invalidate those cached results.
  if(result.categories===undefined)return true;
  if(!result.categories||typeof result.categories!=='object'||Array.isArray(result.categories))return false;
  const categories=Object.values(result.categories);
  if(!categories.length)return false;
  return categories.every(category=>
   category&&typeof category==='object'&&!Array.isArray(category)&&
   (category.score===undefined||category.score===null||
    (typeof category.score==='number'&&Number.isFinite(category.score)&&category.score>=0&&category.score<=1)));

 }
 function read(url,strategy){
  try{
   const raw=global.localStorage.getItem(key(url,strategy));
   if(!raw)return null;
   if(raw.length>MAX_ENTRY_CHARS){global.localStorage.removeItem(key(url,strategy));return null;}
   const value=JSON.parse(raw);
   const now=Date.now();
   if(!value||!Number.isFinite(value.savedAt)||value.savedAt<=0||value.savedAt>now||now-value.savedAt>TTL||!valid(value.payload)){
    global.localStorage.removeItem(key(url,strategy));return null;
   }
   return {payload:value.payload,savedAt:value.savedAt};
  }catch(_){
   // A corrupt entry must not repeatedly break future reads. Storage may be disabled.
   try{global.localStorage.removeItem(key(url,strategy));}catch(__){}
   return null;
  }
 }
 function write(url,strategy,payload){
  if(!valid(payload))return false;
  try{
   const savedAt=Date.now();
   const serialized=JSON.stringify({savedAt,payload});
   if(serialized.length>MAX_ENTRY_CHARS)return false;
   global.localStorage.setItem(key(url,strategy),serialized);
   return true;
  }catch(_){return false;}
 }
 global.WebaoPsiCache={read,write,ttlMs:TTL};
})(window);
