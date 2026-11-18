'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../psi-cache.js'),'utf8');
const prefix='webao:psi:v1:mobile:',now=Date.now();
const payload={lighthouseResult:{categories:{performance:{score:0.9}}}};
const serialized=time=>JSON.stringify({savedAt:time,payload});
function fixture(initial,quota){
 const values=new Map(initial),removed=[];let attempts=0;
 const storage={get length(){return values.size},key:index=>[...values.keys()][index],getItem:key=>values.get(key)??null,
  removeItem(key){removed.push(key);values.delete(key)},setItem(key,value){
   attempts++;
   const size=[...values].reduce((sum,[k,v])=>sum+(k===key?0:k.length+v.length),0)+key.length+value.length;
   if(size>quota){const error=new Error('Storage full');error.name='QuotaExceededError';throw error;}
   values.set(key,value);
  }};
 const window={localStorage:storage};vm.runInNewContext(source,{window,Date});
 return{cache:window.WebaoPsiCache,values,removed,storage,get attempts(){return attempts}};
}
const old=prefix+'https://old.cz/',recent=prefix+'https://recent.cz/',fresh=prefix+'https://new.cz/';
const history=['webao-audit-history:example.cz','history must survive'];
const notes=['webao-finding-work:example.cz','repair notes must survive'];
const initial=[[old,serialized(now-7*3600*1000)],[recent,serialized(now-1000)],history,notes];
const total=initial.reduce((sum,[k,v])=>sum+k.length+v.length,0);
const f=fixture(initial,total+10);
assert.equal(f.cache.write('https://new.cz/','mobile',payload),true,'expired other-domain cache frees enough room for a fresh measurement');
assert.deepEqual(f.removed,[old],'expired measurement is removed before a recent valid result');
assert.equal(f.values.get(recent),initial[1][1]);
assert.equal(f.cache.read('https://new.cz/','mobile').payload.lighthouseResult.categories.performance.score,0.9);
assert.equal(f.values.get(history[0]),history[1]);assert.equal(f.values.get(notes[0]),notes[1]);
const full=fixture([[old,serialized(now-2000)],[recent,serialized(now-1000)],history,notes],total+10);
assert.equal(full.cache.write('https://new.cz/','mobile',payload),true,'full valid cache evicts its oldest measurement');
assert.deepEqual(full.removed,[old]);assert(full.values.has(recent));
for(const bad of ['{broken',serialized(now+100000),JSON.stringify({savedAt:now,payload:{lighthouseResult:{runtimeError:{code:'FAILED'}}}})]){
 const values=[[old,bad],[recent,serialized(now-1000)],history,notes];
 const size=values.reduce((sum,[k,v])=>sum+k.length+v.length,0);
 const f=fixture(values,size+Math.max(0,serialized(now).length-bad.length)+10);
 assert.equal(f.cache.write('https://new.cz/','mobile',payload),true);
 assert.deepEqual(f.removed,[old],'corrupt, future or failed entry is evicted before a valid result');
}
const denied=fixture(initial,0);denied.storage.setItem=()=>{const error=Error('Denied');error.name='SecurityError';throw error};
assert.equal(denied.cache.write('https://new.cz/','mobile',payload),false);
assert.deepEqual(denied.removed,[],'a non-quota failure cannot evict measurements');
const noCache=fixture([history,notes],0);
assert.equal(noCache.cache.write('https://new.cz/','mobile',payload),false);
assert.deepEqual(noCache.removed,[],'history and repair notes cannot be evicted even when storage is full');
const replacing=fixture([[fresh,serialized(now-1000)],history,notes],0);
assert.equal(replacing.cache.write('https://new.cz/','mobile',payload),false);
assert.equal(replacing.values.get(fresh),serialized(now-1000),'failed replacement preserves the existing entry for this measurement');
console.log('PASS: quota recovery reuses storage without touching audit history, repair notes or newer cache entries');

// A provider result can exceed the available capacity even after every cache eviction.
const rollbackInitial=[[old,serialized(now-2000)],[recent,serialized(now-1000)],history,notes];
const rollbackSize=rollbackInitial.reduce((sum,[k,v])=>sum+k.length+v.length,0);
const rollback=fixture(rollbackInitial,rollbackSize);
const oversizedPayload={lighthouseResult:{categories:{performance:{score:0.9}},extra:'x'.repeat(rollbackSize*2)}};
assert.equal(rollback.cache.write('https://new.cz/','mobile',oversizedPayload),false);
for(const [key,value] of rollbackInitial)assert.equal(rollback.values.get(key),value,'failed recovery restores the original cache');
assert.equal(rollback.values.has(fresh),false);
const changedFailure=fixture(rollbackInitial,rollbackSize);
const originalSet=changedFailure.storage.setItem;
let newWrites=0;
changedFailure.storage.setItem=(key,value)=>{
 if(key===fresh&&++newWrites>1){const error=Error('Storage blocked');error.name='SecurityError';throw error;}
 return originalSet(key,value);
};
assert.equal(changedFailure.cache.write('https://new.cz/','mobile',payload),false);
for(const [key,value] of rollbackInitial)assert.equal(changedFailure.values.get(key),value,'non-quota failure restores evicted entries');
console.log('PASS: unsuccessful quota recovery restores previous measurements');
