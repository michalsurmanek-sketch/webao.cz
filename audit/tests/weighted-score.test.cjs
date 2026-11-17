'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const script=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
let csv;
const out={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
const context={window:{},document:{querySelector:selector=>selector==='#result'?out:{},createElement:()=>({click(){}})},
 localStorage:{getItem:()=>null,setItem(){}},TextEncoder,setTimeout:()=>{},
 URL:class extends URL{static createObjectURL(){return 'blob:fixture'}static revokeObjectURL(){}},
 Blob:class{constructor(parts){csv=parts[0]}}};
vm.createContext(context);vm.runInContext(script.slice(0,script.indexOf("form.addEventListener('submit'")),context);
const finding=(area,points,index)=>({area,name:'Check '+index,points,ok:points===100});
function report(findings){context.renderReport('example.cz',findings);context.downloadAuditCsv();return context.window.currentAuditData;}
for(const count of [3,11,201,1001]){
 const result=report(Array.from({length:count},(_,i)=>finding('SEO a obsah',i===0?100:null,i)));
 assert.equal(result.score,100,`one measured perfect result among ${count} controls must remain 100`);
 assert(result.coverage<100);
 assert.equal(result.grade,'Částečný audit');
 assert(csv.includes('"100%"'));
 assert(!out.innerHTML.includes('Známka A'));
}
const mixed=report([finding('SEO a obsah',0,0),finding('SEO a obsah',1,1),finding('Technické SEO',0,2)]);
assert.equal(mixed.areas[0].score,1,'area score remains rounded for display');
assert.equal(mixed.areas[0].rawScore,0.5,'weighted calculation preserves the area average');
assert.equal(mixed.score,0,'round the weighted result once: (0.5*25+0*20)/45');
const areas=['SEO a obsah','Technické SEO','Bezpečnost a HTTPS','Rychlost a Core Web Vitals','Přístupnost','Mobilní použitelnost','DNS a e-mail','Cookies a soukromí'];
const complete=areas.map((area,i)=>finding(area,100,i));
assert.equal(report(complete).coverage,100);
assert.equal(context.window.currentAuditData.grade,'A');
const nearlyComplete=[...complete.filter(item=>item.area!=='SEO a obsah'),...Array.from({length:600},(_,i)=>finding('SEO a obsah',i===599?null:100,i))];
const partial=report(nearlyComplete);
assert.equal(partial.score,100);
assert.equal(partial.coverage,99.9,'99.958% coverage must not be displayed as complete');
assert.equal(partial.grade,'Částečný audit');
assert(out.innerHTML.includes('VÁŽENÉ POKRYTÍ · ČÁSTEČNÝ AUDIT'));
assert(csv.includes('"ČÁSTEČNÝ"'));
assert(!csv.includes('"PLNÉ POKRYTÍ VÁŽENÝCH KONTROL"'));
const empty=report([]);assert.equal(empty.score,null);assert.equal(empty.coverage,0);
console.log('PASS: weighted scores use unrounded weights and means, with honest partial coverage in report and CSV');
