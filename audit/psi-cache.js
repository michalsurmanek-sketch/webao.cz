/* WEBAO audit: cache successful PageSpeed results only. */
(function(global){
 'use strict';
 const PREFIX='webao:psi:v1:';
 const TTL=6*60*60*1000;
 function key(url,strategy){return PREFIX+strategy+':'+url;}
 function valid(payload){
  return !!(payload&&payload.lighthouseResult&&!payload.lighthouseResult.runtimeError);
 }
 function read(url,strategy){
  try{
   const raw=global.localStorage.getItem(key(url,strategy));
   if(!raw)return null;
   const value=JSON.parse(raw);
   const now=Date.now();
   if(!value||!Number.isFinite(value.savedAt)||value.savedAt<=0||value.savedAt>now||now-value.savedAt>TTL||!valid(value.payload)){
    global.localStorage.removeItem(key(url,strategy));return null;
   }
   return {payload:value.payload,savedAt:value.savedAt};
  }catch(_){return null;}
 }
 function write(url,strategy,payload){
  if(!valid(payload))return false;
  try{
   global.localStorage.setItem(key(url,strategy),JSON.stringify({savedAt:Date.now(),payload}));
   return true;
  }catch(_){return false;}
 }
 global.WebaoPsiCache={read,write,ttlMs:TTL};
})(window);
