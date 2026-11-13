#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const source=html.slice(html.indexOf('async function queryPageSpeed('),html.indexOf('async function queryPageSpeedStrategies('));
assert(source.startsWith('async function queryPageSpeed('),'PageSpeed function must be found');
async function check(status,expectedCalls){
 let calls=0;
 const context={
  URL,Error,Promise,
  readCachedPageSpeed:()=>null,
  fetchTimed:async()=>{calls++;return{ok:false,status}},
  readTimedResponse:async()=>({error:{message:'HTTP '+status}}),
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
}
(async()=>{
 await check(400,1);
 await check(403,1);
 await check(404,1);
 await check(429,2);
 await check(500,2);
 console.log('PASS: PageSpeed retries only transient HTTP errors');
})().catch(error=>{console.error(error);process.exitCode=1});
