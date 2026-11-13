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
assert.throws(()=>context.assertPageSpeedResult({lighthouseResult:[]},url,'mobile'),/nevrátil Lighthouse výsledek/);
assert.equal(context.assertPageSpeedResult(payload({performance:{score:0},seo:{score:1}}),url,'mobile').lighthouseResult.categories.performance.score,0);
assert.doesNotThrow(()=>context.assertPageSpeedResult({lighthouseResult:base},url,'mobile'),'Legacy fixtures without categories remain compatible');
for(const categories of [{},[],null,'invalid',{performance:{score:NaN}},{seo:{score:2}},{seo:{score:-0.1}},{seo:null}]){
 assert.throws(()=>context.assertPageSpeedResult(payload(categories),url,'mobile'),/neplatné Lighthouse kategorie/);
}
assert.throws(()=>context.assertPageSpeedResult(payload({performance:{score:0.8}}),url,'desktop'),/jiné zařízení/);
assert.throws(()=>context.assertPageSpeedResult({lighthouseResult:{...base,finalUrl:'https://other.cz/',categories:{seo:{score:0.9}}}},url,'mobile'),/jinou doménu/);
console.log('PASS: live Lighthouse categories, device and origin validation');
