#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const source=html.slice(html.indexOf('function assertPageSpeedResult('),html.indexOf('function pageSpeedFinalAddress('));
assert(source.startsWith('function assertPageSpeedResult('));
const context={URL,isSameSiteHost:(a,b)=>a===b};vm.createContext(context);vm.runInContext(source,context);
const base={configSettings:{emulatedFormFactor:'mobile'},requestedUrl:'https://example.cz/',finalUrl:'https://example.cz/'};
function payload(categories){return{lighthouseResult:{...base,categories}}}
const url=new URL('https://example.cz/');
for(const malformed of [null,{}, {lighthouseResult:null},{lighthouseResult:[]},{lighthouseResult:'invalid'}]){
 assert.throws(()=>context.assertPageSpeedResult(malformed,url,'mobile'),error=>error.message.includes('nevrátil Lighthouse výsledek')&&error.retryable===false,'Malformed Lighthouse payload must fail without retry');
}
assert.equal(context.assertPageSpeedResult(payload({performance:{score:0},seo:{score:1}}),url,'mobile').lighthouseResult.categories.performance.score,0);
assert.doesNotThrow(()=>context.assertPageSpeedResult({lighthouseResult:base},url,'mobile'),'Legacy fixtures without categories remain compatible');
for(const categories of [{},[],null,'invalid',{performance:{score:NaN}},{seo:{score:2}},{seo:{score:-0.1}},{seo:null}]){
 assert.throws(()=>context.assertPageSpeedResult(payload(categories),url,'mobile'),/neplatné Lighthouse kategorie/);
}
assert.throws(()=>context.assertPageSpeedResult(payload({performance:{score:0.8}}),url,'desktop'),/jiné zařízení/);
assert.throws(()=>context.assertPageSpeedResult({lighthouseResult:{...base,finalUrl:'https://other.cz/',categories:{seo:{score:0.9}}}},url,'mobile'),/jinou doménu/);
for(const auditRefs of [null,{},'invalid',[null],[[]],[{id:'viewport',weight:'1'}],[{id:'viewport',weight:-1}],[{id:''}]]){
 assert.throws(()=>context.assertPageSpeedResult(payload({performance:{score:0.8,auditRefs}}),url,'mobile'),error=>/neplatný seznam/.test(error.message)&&error.retryable===false,'malformed references cannot abort report generation');
}
for(const audits of [null,[],[{}],{viewport:null},{viewport:[]},{viewport:{details:{items:{}}}},{viewport:{details:{items:[null]}}}]){
 assert.throws(()=>context.assertPageSpeedResult({lighthouseResult:{...base,audits}},url,'mobile'),error=>/neplatné detaily/.test(error.message)&&error.retryable===false,'malformed details must become an unavailable measurement');
}
assert.doesNotThrow(()=>context.assertPageSpeedResult({lighthouseResult:{...base,categories:{performance:{score:0.8,auditRefs:[{id:'viewport',weight:1}]}},audits:{viewport:{score:1},'third-party-cookies':{score:null,details:{items:[{url:'https://example.cz/'}]}}}}},url,'mobile'));
console.log('PASS: live Lighthouse categories, device and origin validation');
