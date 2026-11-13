#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const source=html.slice(html.indexOf('async function queryPageSpeed('),html.indexOf('async function queryPageSpeedStrategies('));
assert(source.startsWith('async function queryPageSpeed('),'PageSpeed function must be found');
async function check(status,expectedCalls,unreadable=false){
 let calls=0;
 const context={
  URL,Error,Promise,
  readCachedPageSpeed:()=>null,
  fetchTimed:async()=>{calls++;return{ok:false,status}},
  readTimedResponse:async()=>{if(unreadable)throw Error('Invalid JSON');return{error:{message:'HTTP '+status}}},
  isPageSpeedQuotaError:()=>false,
  setTimeout:(fn)=>{fn();return 1},
  withPageSpeedProvenance:()=>{throw Error('Unexpected success')},
  assertPageSpeedResult:()=>{throw Error('Unexpected success')},
  window:{WebaoPsiCache:{write:()=>{throw Error('Unexpected cache write')}}}
 };
 vm.createContext(context);
 vm.runInContext(source,context);
 await assert.rejects(context.queryPageSpeed(new URL('https://example.cz/'),'mobile',2),new RegExp('HTTP '+status));
 assert.equal(calls,expectedCalls,'HTTP '+status+' request count');
 if(status===429){
  const quotaSource=html.slice(html.indexOf('function isPageSpeedQuotaError('),html.indexOf('function withPageSpeedProvenance('));
  const quotaContext={};vm.createContext(quotaContext);vm.runInContext(quotaSource,quotaContext);
  assert.equal(quotaContext.isPageSpeedQuotaError(new Error('PageSpeed mobile: HTTP 429 — Too Many Requests')),true);
  assert.match(quotaContext.pageSpeedErrorMessage(new Error('HTTP 429')),/omezil počet požadavků/);
 }
}
(async()=>{
 await check(400,1);
 await check(403,1);
 await check(404,1);
 await check(429,1);
 await check(500,2);
 await check(400,1,true);
 await check(429,1,true);
 await check(500,2,true);
 const strategySource=html.slice(html.indexOf('async function queryPageSpeedStrategies('),html.indexOf('async function queryDns('));
 const quotaSource=html.slice(html.indexOf('function isPageSpeedQuotaError('),html.indexOf('function withPageSpeedProvenance('));
 let networkCalls=0;
 const strategyContext={URL,Promise,Error,readCachedPageSpeed:()=>null,trackPageSpeed:promise=>promise,queryPageSpeed:async()=>{networkCalls++;throw Error('HTTP 429 — Too Many Requests')}};
 vm.createContext(strategyContext);vm.runInContext(quotaSource+'\n'+strategySource,strategyContext);
 const outcomes=await strategyContext.queryPageSpeedStrategies(new URL('https://example.cz/'),true);
 assert.equal(networkCalls,1,'HTTP 429 must suppress the second device network request');
 assert.equal(outcomes.length,2);
 assert.equal(outcomes[0].status,'rejected');
 assert.equal(outcomes[1].status,'rejected');
 assert.match(outcomes[1].reason.message,/vynecháno/);
 // A non-quota failure must still attempt the desktop measurement.
 networkCalls=0;
 strategyContext.queryPageSpeed=async()=>{networkCalls++;throw Error('HTTP 500 — Server error')};
 const transient=await strategyContext.queryPageSpeedStrategies(new URL('https://example.cz/'),true);
 assert.equal(networkCalls,2,'Non-quota errors must not suppress the other device');
 assert.equal(transient.length,2);
 console.log('PASS: PageSpeed HTTP errors, rate limit classification and device skip');
})().catch(error=>{console.error(error);process.exitCode=1});
