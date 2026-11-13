#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  fs.mkdirSync('browser-results',{recursive:true});
  for(const width of [1365,390]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>{
    const url=route.request().url();
    if(url==='https://fixture.test/audit/')return route.fulfill({contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../index.html'),'utf8')});
    if(new URL(url).pathname==='/assets/network.css')return route.fulfill({contentType:'text/css',body:fs.readFileSync(path.join(__dirname,'../../assets/network.css'),'utf8')});
    if(url==='https://fixture.test/audit/psi-cache.js')return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(__dirname,'../psi-cache.js'),'utf8')});
    return route.abort();
   });
   await page.goto('https://fixture.test/audit/');
   const state=await page.evaluate(async()=>{
    const measuredAt=new Date(Date.now()-120000).toISOString();
    const payload={lighthouseResult:{configSettings:{emulatedFormFactor:'desktop'},requestedUrl:'https://example.cz/',finalUrl:'https://example.cz/',fetchTime:measuredAt,audits:{}}};
    WebaoPsiCache.write('https://example.cz/','desktop',payload);
    let requests=0;
    window.fetch=async()=>{requests++;return new Response(JSON.stringify({error:{message:'quota exceeded'}}),{status:429,headers:{'Content-Type':'application/json'}})};
    const results=await queryPageSpeedStrategies(new URL('https://example.cz/'),true);
    const sources=measurementSourceStatuses({pageSpeedResults:results});
    renderReport('example.cz',[],[],{sourceStatuses:sources});
    document.querySelector('#result').style.display='block';
    return{requests,measuredAt,source:sources.find(s=>s.name==='PageSpeed — mobil a desktop'),score:window.currentAuditData.score};
   });
   assert.equal(state.requests,1,'cached desktop does not make a paid retry after mobile quota');
   assert.equal(state.score,null,'source provenance does not invent score');
   assert.match(state.source.detail,/Desktop: uložený výsledek/);assert.match(state.source.detail,/Nejde o nové měření/);assert(state.source.detail.includes(state.measuredAt));
   assert(await page.getByText(state.source.detail,{exact:true}).isVisible());
   await page.screenshot({path:`browser-results/provenance-${width}.png`,fullPage:true});
   await page.emulateMedia({media:'print'});
   assert(await page.getByText(state.source.detail,{exact:true}).isVisible(),'print retains source provenance');
   const printColors=await page.evaluate(()=>({cell:getComputedStyle(document.querySelector('.audit-pages td')).color,heading:getComputedStyle(document.querySelector('.audit-pages th')).color,card:getComputedStyle(document.querySelector('.detektiv-card')).backgroundColor,cardText:getComputedStyle(document.querySelector('.detektiv-card p')).color}));
   assert.equal(printColors.cell,'rgb(36, 60, 44)');assert.equal(printColors.heading,'rgb(37, 76, 50)');assert.equal(printColors.card,'rgb(255, 255, 255)');assert.equal(printColors.cardText,'rgb(36, 60, 44)');
   if(width===1365)await page.pdf({path:'browser-results/provenance-report.pdf',format:'A4',printBackground:true});
   assert.deepEqual(errors,[]);await page.close();
   console.log(`PASS PageSpeed source provenance screen/print: width=${width}`);
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
