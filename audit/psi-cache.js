/* WEBAO audit: cache successful PageSpeed results only. */
(function(global){
 'use strict';
 const PREFIX='webao:psi:v1:';
 const TTL=6*60*60*1000;
 // Avoid exhausting the browser's usually small localStorage quota with one Lighthouse payload.
 const MAX_ENTRY_CHARS=2*1024*1024;
 const MAX_RECOVERY_ENTRIES=128;
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
 function quotaError(error){return error&&(error.name==='QuotaExceededError'||error.name==='NS_ERROR_DOM_QUOTA_REACHED'||error.code===22||error.code===1014);}
 function recoverWrite(entryKey,serialized){
  const storage=global.localStorage,candidates=[],now=Date.now();
  // Snapshot keys before removing anything. Never inspect or evict report history or repair notes.
  for(let index=0;index<storage.length&&index<4096&&candidates.length<MAX_RECOVERY_ENTRIES;index++){
   const candidateKey=storage.key(index);
   if(typeof candidateKey!=='string'||!candidateKey.startsWith(PREFIX)||candidateKey===entryKey)continue;
   let savedAt=0,expired=true;
   try{
    const raw=storage.getItem(candidateKey);
    if(typeof raw==='string'&&raw.length<=MAX_ENTRY_CHARS){
     const value=JSON.parse(raw);
     if(value&&Number.isFinite(value.savedAt)&&value.savedAt>0&&value.savedAt<=now&&valid(value.payload)){
      savedAt=value.savedAt;expired=now-savedAt>TTL;
     }
    }
   }catch{}
   candidates.push({key:candidateKey,savedAt,expired});
  }
  candidates.sort((a,b)=>Number(b.expired)-Number(a.expired)||a.savedAt-b.savedAt);
  const removed=[];
  function restore(){
   // A failed optional write must not discard usable measurements.
   for(const entry of removed.reverse()){try{storage.setItem(entry.key,entry.raw);}catch{}}
  }
  for(const candidate of candidates){
   let raw;
   try{raw=storage.getItem(candidate.key);storage.removeItem(candidate.key);}catch{restore();return false;}
   if(typeof raw==='string')removed.push({key:candidate.key,raw});
   try{storage.setItem(entryKey,serialized);return true;}
   catch(error){if(!quotaError(error)){restore();return false;}}
  }
  restore();
  return false;
 }
 function read(url,strategy){
  try{
   const raw=global.localStorage.getItem(key(url,strategy));
   if(!raw)return null;
   if(typeof raw!=='string'){global.localStorage.removeItem(key(url,strategy));return null;}
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
   const entryKey=key(url,strategy);
   try{global.localStorage.setItem(entryKey,serialized);return true;}
   catch(error){return quotaError(error)?recoverWrite(entryKey,serialized):false;}
  }catch(_){return false;}
 }
 global.WebaoPsiCache={read,write,ttlMs:TTL};
})(window);
