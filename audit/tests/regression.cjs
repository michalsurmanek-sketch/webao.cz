// Run with: node audit/tests/regression.cjs

// Run with: node audit/tests/regression.cjs
(async()=>{
// CSV must not present partial coverage as an unqualified overall score.
{
 const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const csv=html.slice(html.indexOf('function downloadAuditCsv()'),html.indexOf('function ',html.indexOf('function downloadAuditCsv()')+10));
 assert.match(csv,/Skóre měřených oblastí/);
 assert.match(csv,/Nejde o celkové hodnocení webu/);
 assert.match(csv,/Neměřené oblasti nejsou zahrnuty do skóre/);
 assert.match(csv,/Skóre pouze z provedených kontrol v této oblasti/);
 assert.match(csv,/area\.measured\+' \/ '\+area\.tests/);
 assert.match(csv,/Math\.round\(area\.coverage\*100\)/);
 assert.match(csv,/data\.coverage===100\?'PLNÉ POKRYTÍ VÁŽENÝCH KONTROL':'ČÁSTEČNÝ'/);
 console.log('PASS: partial CSV audit scores are explicitly qualified');
}
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={localStorage:{getItem:()=>JSON.stringify([{checkedAt:'old',score:50}]),setItem:()=>{throw Error('quota')}}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function saveLocalAuditHistory('),s.indexOf('function clearLocalAuditHistory(')),c);let h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert.equal(h.length,2);assert.equal(h[1].score,50);assert.match(h.storageWarning,/nepodařilo/);c.localStorage.getItem=()=>'{bad';h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert.equal(h.length,1);assert.match(h.storageWarning,/nepodařilo/);c.localStorage.setItem=()=>{};h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert(!h.storageWarning);console.log('PASS: history survives write failures and malformed storage');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);
const c={URL,TextEncoder,readCachedPageSpeed:()=>null,pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('async function queryPageSpeedStrategies('),s.indexOf('async function queryDns('))+s.slice(s.indexOf('function isSameSiteHost('),s.indexOf('function extractPublicContacts('))+s.slice(s.indexOf('function normalizeRobotsPath('),s.indexOf('function pageType(')),c);
assert(c.isSameSiteHost('example.cz','example.cz'));
assert(c.isSameSiteHost('www.example.cz','example.cz'));
assert(c.isSameSiteHost('example.cz','www.example.cz'),'www and apex hosts should be treated symmetrically');
assert(c.isSameSiteHost('example.cz.','example.cz'),'DNS trailing-dot notation should normalize to the same host');
assert(c.isSameSiteHost('example.cz','example.cz.'),'DNS trailing-dot normalization should be symmetric');
assert(c.isSameSiteHost('shop.example.cz','example.cz'));
assert(!c.isSameSiteHost('example.cz','shop.example.cz'));
assert(!c.isSameSiteHost('co.uk','shop.co.uk'));
assert(!c.isSameSiteHost('github.io','project.github.io'));
assert(!c.isSameSiteHost('other.example.cz','shop.example.cz'));
const url=new URL('https://example.cz/');const pages=[{url:url.href,raw:'ok',links:['/','/a','/excluded','/private','https://outside.cz/a']},{url:'https://example.cz/a',raw:'ok',links:['/last','/a']}];
const links=c.discoverPageLinks(pages,url,x=>x.endsWith('/excluded'),'User-agent: *\nDisallow: /private');assert.equal(links.length,4);assert(links.find(x=>x.url.endsWith('/private')).robotsBlocked);assert(links.find(x=>x.url.endsWith('/excluded')).excluded);assert.equal(links.find(x=>x.url.endsWith('/last')).source,'https://example.cz/a');
assert(!s.includes('pageSpeedPromise=pagePromise.then'));assert(s.includes('const finalLinks=discoverPageLinks'));
await (async()=>{let calls=[];c.trackPageSpeed=p=>p;c.isPageSpeedQuotaError=e=>/quota/i.test(e.message);c.queryPageSpeed=async(u,strategy)=>{calls.push(strategy);return{strategy}};
let r=await c.queryPageSpeedStrategies(url,true);assert.equal(r.length,2);assert.equal(calls.length,2);assert(r.every(x=>x.status==='fulfilled'));
calls=[];r=await c.queryPageSpeedStrategies(url,false);assert.equal(calls.length,0);assert(r.every(x=>x.status==='rejected'));
c.queryPageSpeed=async()=>{calls.push('call');throw Error('quota exceeded')};calls=[];r=await c.queryPageSpeedStrategies(url,true);assert.equal(calls.length,1);assert.equal(r.length,2);
c.queryPageSpeed=async(u,strategy)=>{calls.push(strategy);if(strategy==='mobile')throw Error('temporary failure');return{strategy}};calls=[];r=await c.queryPageSpeedStrategies(url,true);assert.equal(calls.length,2);assert.equal(r[1].status,'fulfilled');console.log('PASS: crawl inventory and independent PageSpeed scheduling');})();

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8'),s=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const memory=new Map(),out={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};const context={console,URL,TextEncoder,window:{},document:{querySelector:sel=>sel==='#result'?out:{}},localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)}};vm.createContext(context);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),context);
const findings=[{area:'DNS a e-mail',name:'SPF záznam',points:50,ok:false,detail:'=cmd <script>test</script>'},context.buildMxFinding([{data:'0 .'},{data:'10 mail.example.cz.'}])];
context.renderReport('example.cz',findings,[],{});assert.match(out.innerHTML,/Pokrytí váhy kontrol/);assert.match(out.innerHTML,/PRIORITA/);assert(!out.innerHTML.includes('<script>test</script>'));assert.match(out.innerHTML,/&lt;script&gt;test/);assert.match(context.window.currentAuditData.ruleVersion,/^\d{4}-\d{2}-\d{2}\.\d+$/);
context.renderReport('example.cz',findings,[],{});assert.match(out.innerHTML,/Poslední změna: 0 bodů/);
context.renderReport('example.cz',[...findings,{area:'DNS a e-mail',name:'Extra unknown',points:null}],[],{});assert.match(out.innerHTML,/podíl měření v oblastech/);assert(!out.innerHTML.includes('Poslední změna:'));
console.log('PASS: complete report generation, escaping, priorities and history integration');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);
let raw=JSON.stringify({a:null,b:5,c:[],d:{status:'wrong',note:7,owner:'Joe'},e:{status:'Opraveno',note:'ok'}});let written;
const c={pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined),localStorage:{getItem:()=>raw,setItem:(_,v)=>{written=v}}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function loadLocalFindingWork('),s.indexOf('function renderFindingWorkControls(')),c);
assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,2);assert.equal(c.loadLocalFindingWork('x').d.status,'Nový');assert.equal(c.loadLocalFindingWork('x').d.note,'');assert(c.saveLocalFindingWork('x','f','note','new'));assert.equal(JSON.parse(written).f.note,'new');assert(!c.saveLocalFindingWork('x','f','oops','new'));
raw='[]';assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,0);raw='{bad';assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,0);
c.localStorage.setItem=()=>{throw Error('quota')};assert(!c.saveLocalFindingWork('x','f','note','new'));
// Execute the real export and capture every CSV row, including range notes.
let blob;const rowData={host:'example.cz',pages:[],areas:[],findings:[],coverage:20,score:100,crawlMeta:{note:'range note',excludedUrlExamples:[{url:'https://example.cz/x',source:'test'}]}};
c.window={currentAuditData:rowData};c.Blob=class{constructor(parts){blob=parts[0]}};c.URL=class extends URL{static createObjectURL(){return 'blob:stub'}static revokeObjectURL(){}};c.document={createElement:()=>({click(){}})};c.setTimeout=()=>{};
vm.runInContext(s.slice(s.indexOf('function auditLinkKey('),s.indexOf('function buildInboundLinks(')),c);
vm.runInContext(s.slice(s.indexOf('function downloadAuditCsv('),s.indexOf('function auditComparisonScope(')),c);c.downloadAuditCsv();
vm.runInContext(s.slice(s.indexOf('function auditCsvPageValue('),s.indexOf('function downloadAuditCsv(')),c);rowData.pages=[{url:'https://example.cz/a',raw:'ok',links:['https://example.cz/a?utm_source=test'],externalLinks:[]}];c.downloadAuditCsv();assert.match(blob,/CÍL VE VZORKU/);
const rows=blob.replace(/^\uFEFF/,'').split('\r\n').map(row=>Array.from(row.matchAll(/"(?:[^"]|"")*"(?=;|$)/g),m=>m[0]));assert(rows.every(row=>row.length===18));assert.match(rows[0][17],/Poznámka k rozsahu/);assert.match(blob,/range note/);
assert(s.includes("dispatchEvent(new Event('change'))"));assert(s.includes("renderFindingWorkNote(progress)"));
console.log('PASS: UI storage, fixed-width CSV and update integration checks');
// Exercise the real work-control handler, including filtering and print-note refresh.
let handler,filterRefreshes=0,removed=0,printHtml='',storageLabel='';
const card={dataset:{},querySelector:()=>({remove(){removed++}}),insertAdjacentHTML:(_,html)=>{printHtml=html}};
const field={dataset:{workField:'status'},value:'Opraveno',tagName:'SELECT',type:'select-one',addEventListener:(_,fn)=>{handler=fn},closest:()=>card};
const container={dataset:{workKey:encodeURIComponent('example.cz|Title')},querySelectorAll:()=>[field],querySelector:()=>({set textContent(v){storageLabel=v}})};
c.out={querySelectorAll:()=>[container],querySelector:()=>({dispatchEvent:()=>{filterRefreshes++}})};c.Event=class{};c.esc=v=>String(v);c.localStorage.setItem=()=>{};
vm.runInContext(s.slice(s.indexOf('function renderFindingWorkNote('),s.indexOf('function initFindingFilters('))+s.slice(s.indexOf('function initFindingWorkControls('),s.indexOf('const coverageLimitations=')),c);
c.initFindingWorkControls('example.cz');handler();assert.equal(card.dataset.workStatus,'Opraveno');assert.equal(filterRefreshes,1);assert.equal(removed,1);assert.match(printHtml,/Opraveno/);assert.match(storageLabel,/Uloženo/);
c.localStorage.setItem=()=>{throw Error('quota')};handler();assert.match(storageLabel,/nepodařilo/);
console.log('PASS: actual status handler updates filtering, print notes and storage warnings');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={URL,pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function parsePageText('),s.indexOf('function decodeSitemapLoc(')),c);
const page=c.parsePageText('Title: Test\n# Main\n[Contact](/contact) [Relative](child) [WWW](https://www.example.cz/a) [Outside](https://other.cz/) ![Alt](/picture.png) [Picture](/picture.png) [![Logo](/logo.png)](/home) [Anchor](#part) [Mail](mailto:a@example.cz) [Bad](javascript:alert) [Auth](https://user:pw@example.cz/a)',new URL('https://example.cz/path/'));
assert.equal(page.links.length,5);assert(page.links.includes('https://example.cz/contact'));assert(page.links.includes('https://example.cz/path/child'));assert(page.links.includes('https://www.example.cz/a'));assert(page.links.includes('https://example.cz/picture.png'));assert(page.links.includes('https://example.cz/home'));assert.equal(page.externalLinks.length,1);assert.equal(page.images.length,2);assert.equal(page.images[0].alt,'Alt');assert(!page.links.some(x=>/mailto:|javascript:|user:|#/.test(x)));
const malformed=c.parsePageText('Text ](/fake) and [valid](/real)',new URL('https://example.cz/'));assert.deepEqual(Array.from(malformed.links),['https://example.cz/real'],'unmatched closing bracket is not a link');
const balanced=c.parsePageText('[a](/a_(b)) [nested](/n_(a(b))) [angle](</angle_(x)>) [bad](/unfinished(x)',new URL('https://example.cz/'));assert.deepEqual(Array.from(balanced.links),['https://example.cz/a_(b)','https://example.cz/n_(a(b))','https://example.cz/angle_(x)']);
const imageTargets=c.parsePageText('![alt](/img_(a(b)).png) ![angle](</angle_(x).png>) [![logo](/logo_(x).png)](/home) ![bad](/unfinished(x)',new URL('https://example.cz/'));assert.deepEqual(Array.from(imageTargets.images,x=>x.url),['https://example.cz/img_(a(b)).png','https://example.cz/angle_(x).png','https://example.cz/logo_(x).png']);assert.deepEqual(Array.from(imageTargets.links),['https://example.cz/home']);
const escapedTargets=c.parsePageText(String.raw`[a](/a_\(b\)) [close](/close\)) ![image](/img_\(x\).png)`,new URL('https://example.cz/'));assert.deepEqual(Array.from(escapedTargets.links),['https://example.cz/a_(b)','https://example.cz/close)']);assert.equal(escapedTargets.images[0].url,'https://example.cz/img_(x).png');
const textOnly=c.parsePageText('Markdown Content:\n\nTato stránka má obsahový text, ale nemá titulek ani nadpis H1.',new URL('https://example.cz/text-only'));
assert.equal(textOnly.title,'');assert.equal(textOnly.h1s.length,0);assert(textOnly.wordCount>0);assert.equal(c.pageInventoryState(textOnly),'Prověřeno');
const blank=c.parsePageText('',new URL('https://example.cz/blank'));assert.equal(c.pageInventoryState(blank),'Obsah nerozpoznán');
const duplicatePages=[{url:'https://example.cz/',raw:'a',parsed:{h1s:['  Naše   služby ']}},{url:'https://example.cz/sluzby',raw:'b',parsed:{h1s:['naše služby']}},{url:'https://example.cz/reference',raw:'c',parsed:{h1s:['Reference']}},{url:'https://example.cz/unavailable',raw:null,parsed:{h1s:['naše služby']}},{url:'https://example.cz/empty',raw:'d',parsed:{h1s:['']}}];
const duplicateH1=c.findDuplicateH1Groups(duplicatePages);assert.equal(duplicateH1.length,1);assert.equal(duplicateH1[0].heading,'Naše služby');assert.deepEqual(Array.from(duplicateH1[0].pages, page=>page.url),['https://example.cz/','https://example.cz/sluzby']);
console.log('PASS: page extraction and page-inventory recognition assertions');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={};vm.createContext(c);
vm.runInContext(s.slice(s.indexOf('function isPriorityFinding('),s.indexOf('function renderReport('))+s.slice(s.indexOf('function buildMxFinding('),s.indexOf('function analyzeSpf(')),c);
const eligible=c.isPriorityFinding;
assert(eligible({points:50,ok:false}));assert(!eligible({points:100,ok:true}));assert(!eligible({points:null,state:'NELZE OVĚŘIT'}));assert(!eligible({points:null,severity:'Závažná'}));assert(eligible({points:null,requiresAction:true}));assert(eligible({priorityPoints:30}));assert(!eligible({priorityPoints:null}));
const mx=(...data)=>c.buildMxFinding(data.map(data=>({data})));
assert(eligible(mx('0 .','10 mail.example.cz.')));assert(!eligible(mx('0 .')));assert(!eligible(mx('10 mail.example.cz.')));assert.match(mx('0 .').action,/Ponechte Null MX/);assert.match(mx('0 .','10 mail.example.cz.').action,/odstraňte kořenový/);
assert(s.includes('findings.filter(isPriorityFinding)'));assert(s.includes('affectedCount:new Set'));
console.log('PASS: JavaScript syntax and 14 priority assertions');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function auditComparisonScope('),s.indexOf('function saveLocalAuditHistory(')),c);
const checks=[{area:'SEO',name:'Title',points:100},{area:'DNS',name:'SPF',points:50}],pages=[{url:'https://example.cz/',raw:'ok'}];
const scope=(f=checks,p=pages)=>c.auditComparisonScope(f,p),a=scope();
assert.equal(a,scope([...checks].reverse()));
assert.equal(a,scope(checks.map(x=>({...x,points:0}))));
assert.notEqual(a,scope([...checks,{area:'SEO',name:'unknown',points:null}]));
assert.notEqual(scope([...checks,{area:'SEO',name:'unknown',points:null}]),scope([...checks,{area:'DNS',name:'unknown',points:null}]));
assert.equal(a,scope([...checks,{area:'SEO',name:'Kontrola oblasti: SEO',points:null}]));
assert.notEqual(a,scope(checks.slice(1)));assert.notEqual(a,scope(checks,[...pages,{url:'https://example.cz/contact',raw:'ok'}]));
assert(c.comparableAuditRuns({ruleVersion:'v',comparisonScope:a},{ruleVersion:'v',comparisonScope:a}));
assert(!c.comparableAuditRuns({ruleVersion:'v',comparisonScope:a},{ruleVersion:'v',comparisonScope:scope([...checks,{area:'SEO',name:'unknown',points:null}])}));
assert(s.includes('comparisonScope,coverage:totalWeight'));assert(s.includes('entry.coverage'));assert(s.includes('<th>Pokrytí váhy kontrol</th>'));
console.log('PASS: JavaScript syntax and 12 history coverage assertions');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function normalizeDnsTxt('),s.indexOf('function buildMxFinding(')),c);
const response=(data,Status=0)=>({status:'fulfilled',value:{Status,Answer:data===null?[]:[{type:16,data}]}});
const finding=(...r)=>c.buildDkimFinding(r,r.map((_,i)=>'s'+i));
assert.equal(finding(response('unrelated TXT')).points,null);
assert.match(finding(response('v=DKIM1; p=')).detail,/odvolané/);
assert.match(finding(response('v=DKIM1; p=ABCDEF')).detail,/nepotvrzuje platnost/);
assert.equal(finding(response('v=DKIM1; p=ABCDEF')).points,null);
assert.match(finding({status:'rejected'}).detail,/Neúspěšných DNS dotazů: 1/);
assert.equal(finding(response(null)).state,'NELZE OVĚŘIT');
assert.match(finding(response('v=DKIM1; p=ABC',2)).detail,/Neúspěšných/);
assert.match(finding(response('"v=DKIM1; " "p="')).detail,/odvolané/);
assert.match(finding(response('v=DKIM1; p='),response('v=DKIM1; p=ABC')).detail,/kandidátů/);
assert(!s.includes('dkimMatches'));
console.log('PASS: JavaScript syntax and 10 DKIM assertions');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function buildMxFinding('),s.indexOf('function analyzeSpf(')),c);
const mx=(...data)=>c.buildMxFinding(data.map(data=>({data})));
assert.match(mx('0 .').detail,/výslovně nepřijímá/);assert.equal(mx('0 .').points,null);
assert.equal(mx('0 .','10 mail.example.cz.').severity,'Závažná');assert.equal(mx('10 .').ok,false);
assert.equal(mx('0 .','0 .').ok,false);assert.match(mx().detail,/A\/AAAA/);
assert.match(mx('10 mail.example.cz.').detail,/nepotvrzuje/);assert.equal(mx('10 mail.example.cz.').points,null);
assert.equal(mx('  0   . ').ok,true);assert.match(mx('10 mail.example.cz.').evidence,/10 mail/);
console.log('PASS: JavaScript syntax and 10 MX assertions');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const context={TextEncoder};vm.createContext(context);vm.runInContext(script.slice(script.indexOf('function normalizeRobotsPath('),script.indexOf('function pageType(')),context);
const allows=context.robotsAllowsPath;
const cases=[
['User-agent: *\nDisallow: /café','/caf%C3%A9',false],
['User-agent: *\nDisallow: /caf%c3%a9','/café',false],
['User-agent: *\nDisallow: /private','/%70rivate',false],
['User-agent: *\nDisallow: /a%2fb','/a%2Fb',false],
['User-agent: *\nDisallow: /a%2fb','/a/b',true],
['User-agent: *\nDisallow: /a/b','/a%2Fb',true],
['User-agent: *\rDisallow: /private','/private',false],
['User-agent: *\nDisallow: /\nAllow: /public','/public',true],
['User-agent: *\nDisallow: /foo\nAllow: /foo','/foo',true],
['User-agent: *\nDisallow: /*.pdf$','/a.pdf',false],
['User-agent: *\nDisallow: /*.pdf$','/a.pdf?download=1',true],
['User-agent: *\nDisallow: /','/robots.txt',true],
['User-agent: Audit\nDisallow: /\nUser-agent: *\nAllow: /','/',true],
['User-agent: WEBAOAudit\nDisallow: /secret\nUser-agent: webaoaudit\nDisallow: /other','/other',false],
['User-agent: WEBAOAudit\nAllow: /\nUser-agent: *\nDisallow: /','/',true],
['User-agent: *\nDisallow: /Private','/private',true],
['User-agent: *\nDisallow: /x%2A','/x*',true],
['User-agent: *\nDisallow: /x%2a','/x%2A',false]
];
for(const [robots,path,expected] of cases)assert.equal(allows(robots,path),expected,JSON.stringify({robots,path}));
console.log('PASS: JavaScript syntax and '+cases.length+' robots cases');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(script);
const context={URL};vm.createContext(context);vm.runInContext(script.slice(script.indexOf('function isSameSiteHost('),script.indexOf('function extractPublicContacts(')),context);
const urls=text=>Array.from(context.getSitemapUrls(text,'example.cz'));
assert.deepEqual(urls('<urlset><url><loc>https://example.cz/?a=1&amp;b=2</loc></url></urlset>'),['https://example.cz/?a=1&b=2']);
assert.deepEqual(urls('<urlset><loc><![CDATA[https://example.cz/?a=1&b=2]]></loc></urlset>'),['https://example.cz/?a=1&b=2']);
assert.deepEqual(urls('<urlset><loc>https://example.cz/end.</loc><loc>https://example.cz/end;</loc></urlset>'),['https://example.cz/end.','https://example.cz/end;']);
assert.deepEqual(urls('<urlset><loc>https://example.cz/a</loc></urlset> [annotation](https://example.cz/unrelated)'),['https://example.cz/a']);
assert.equal(context.decodeSitemapLoc('a&amp;amp;b&#38;c&#x26;d'),'a&amp;b&c&d');
assert.equal(context.decodeSitemapLoc('&#x110000; &#xD800;'),'&#x110000; &#xD800;');
assert.deepEqual(urls('<urlset><loc>https://outside.cz/a</loc><loc>https://example.cz/a</loc><loc>https://example.cz/a</loc></urlset>'),['https://example.cz/a']);
assert.deepEqual(Array.from(context.getSitemapLocations('<sitemapindex><sitemap><loc>https://example.cz/sitemap.xml?a=1&amp;b=2</loc></sitemap></sitemapindex>','example.cz')),['https://example.cz/sitemap.xml?a=1&b=2']);
assert.deepEqual(urls('[Page](https://example.cz/markdown)'),['https://example.cz/markdown']);
const manyUrls=Array.from({length:15000},(_,i)=>'https://example.cz/page/'+i);
const largeXml='<urlset>'+[...manyUrls,...manyUrls.slice(0,200)].map(url=>'<loc>'+url+'</loc>').join('')+'</urlset>';
assert.deepEqual(urls(largeXml),manyUrls,'large sitemap deduplication must preserve every distinct URL and source order');
const indexUrls=manyUrls.slice(0,2000).map(url=>url+'.xml');
assert.deepEqual(Array.from(context.getSitemapLocations('<sitemapindex>'+[...indexUrls,...indexUrls.slice(0,100)].map(url=>'<loc>'+url+'</loc>').join('')+'</sitemapindex>','example.cz')),indexUrls,'sitemap index deduplication must preserve discovery order');
const remainder=context.sitemapBudgetRemainder(['https://example.cz/a.xml','https://example.cz/b.xml','https://example.cz/b.xml','https://example.cz/blocked.xml','invalid'],new Set(['https://example.cz/a.xml']),path=>path!=='/blocked.xml');
assert.deepEqual(Array.from(remainder),['https://example.cz/b.xml'],'budget omission counts only distinct eligible, unrequested sitemaps');
assert.deepEqual(Array.from(context.sitemapBudgetRemainder([],new Set(),()=>true)),[]);
assert.match(script,/sitemapBudgetOmittedCount:sitemapBudgetOmitted.length/);
assert.match(script,/Sitemapy nevyžádané kvůli limitu požadavků/);
assert.deepEqual(urls('<urlset><!-- <loc>https://example.cz/fake</loc> --><loc>https://example.cz/real</loc></urlset>'),['https://example.cz/real']);
assert.deepEqual(Array.from(context.getSitemapLocations('<!-- <urlset><loc>https://example.cz/fake.xml</loc></urlset> --><sitemapindex><loc>https://example.cz/real.xml</loc></sitemapindex>','example.cz')),['https://example.cz/real.xml']);
assert.deepEqual(urls('<!-- <urlset><loc>https://example.cz/fake</loc></urlset> -->'),[]);
assert.deepEqual(urls('<urlset><loc>https://example.cz/real</loc><!-- <loc>https://example.cz/fake</loc>'),['https://example.cz/real']);
assert.deepEqual(Array.from(context.sitemapUrlCandidates('<urlset><loc><![CDATA[https://example.cz/a?literal=<!--text-->]]></loc></urlset>')),['https://example.cz/a?literal=<!--text-->'],'CDATA content must not be stripped as a comment');
console.log('PASS: JavaScript syntax and 9 sitemap regression cases');
for(const candidate of ['ftp://example.cz/a','https://user:password@example.cz/a','https://example.cz:8443/a'])assert.equal(context.normalizeCrawlUrl(candidate,new URL('https://example.cz/')),'');
console.log('PASS: 3 unsupported crawl URL cases');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={URL,setTimeout,clearTimeout,TextEncoder,TextDecoder,timedResponseControllers:{get:()=>null,delete(){}},window:{}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('async function readTimedTextResponse('),s.indexOf('async function fetchRobotsAwarePage('))+s.slice(s.indexOf('function withPageSpeedProvenance('),s.indexOf('async function queryPageSpeedStrategies(')),c);
let calls=[];
vm.runInContext(s.slice(s.indexOf('function isSameSiteHost('),s.indexOf('function extractPublicContacts(')),c);
assert.throws(()=>c.assertReadableSource('   '));assert.throws(()=>c.assertReadableSource('Title: Missing\nWarning: Target URL returned error 404: Not found\nMarkdown Content:\nError'),/404/);
assert.throws(()=>c.assertReadableSource('Warning: Target URL returned error 503: unavailable'),/503/);
const article='Title: Article\nMarkdown Content:\nWarning: Target URL returned error 404: example from documentation';assert.equal(c.assertReadableSource(article),article);
assert.equal(c.assertReadableSource('User-agent: *\nDisallow: /private'),'User-agent: *\nDisallow: /private');
const metadataLinks=[
 {getAttribute:name=>({rel:'ALTERNATE',hreflang:'cs',href:'/cs'}[name]||null)},
 {getAttribute:name=>({rel:'alternate',hreflang:'CS',href:'/cs-2'}[name]||null)},
 {getAttribute:name=>({rel:'canonical',href:'https://example.cz/a'}[name]||null)},
 {getAttribute:name=>({rel:'canonical',href:'https://example.cz/b'}[name]||null)},
 {getAttribute:name=>({rel:'icon',href:'/favicon.ico'}[name]||null)}
];
c.DOMParser=class{parseFromString(html,type){assert.match(html,/<html/i);assert.equal(type,'text/html');return{head:{querySelectorAll:selector=>{assert.equal(selector,'link[rel]');return metadataLinks}}}}};
calls=[];c.fetchTimed=async(target,options,timeout)=>{calls.push({target,options,timeout});return{ok:true,status:200,text:async()=> '<!doctype html><html><head><title>Example</title></head></html>'}};
const htmlMeta=await c.fetchPageHtmlMetadata(new URL('https://example.cz/a?x=1#fragment'));
assert.equal(calls[0].target,'https://r.jina.ai/https://example.cz/a?x=1');assert.equal(calls[0].options.headers['X-Respond-With'],'html');assert.equal(calls[0].timeout,20000);
assert.deepEqual(Array.from(htmlMeta.canonical),['https://example.cz/a','https://example.cz/b']);assert.deepEqual(Array.from(htmlMeta.hreflang,item=>[item.lang,item.href]),[['cs','/cs'],['CS','/cs-2']]);
const metadataContext={URL,pageTextWasFetched:page=>page?.raw!==null&&page?.raw!==undefined,areaDefs:[['Technické SEO',20]]};vm.createContext(metadataContext);vm.runInContext(s.slice(s.indexOf('function extractHeadMetadata('),s.indexOf('async function fetchRobotsAwarePage('))+s.slice(s.indexOf('function htmlMetadataFindings('),s.indexOf('function pageInventoryState('))+s.slice(s.indexOf('function scoreAuditAreas('),s.indexOf('function renderReport(')),metadataContext);
const metadataFindings=metadataContext.htmlMetadataFindings([{url:'https://example.cz/a',raw:'page',htmlMetadata:htmlMeta},{url:'https://example.cz/b',raw:'page',htmlMetadataError:'timeout'},{url:'https://example.cz/c',raw:null}]);
assert.equal(metadataFindings[0].points,null);assert.equal(metadataFindings[0].coverageExcluded,true);assert.match(metadataFindings[0].detail,/1 z 2 načtených stránek/);assert.match(metadataFindings[0].detail,/správnost canonical cíle/);
assert(metadataFindings.some(item=>item.name==='Více odlišných canonical deklarací — hypotéza'&&item.points===null&&item.coverageExcluded));assert(metadataFindings.some(item=>item.name==='Relativní metadata — základ nelze ověřit'&&item.points===null&&item.coverageExcluded));
assert.equal(metadataContext.scoreAuditAreas(metadataFindings)[0].tests,0,'HTML metadata signals and hypotheses must stay outside the score');
const equivalentTargets=metadataContext.htmlMetadataFindings([{url:'https://example.cz/page',raw:'page',htmlMetadata:{canonical:['/canonical','https://EXAMPLE.cz:443/canonical'],hreflang:[{lang:'cs',href:'/cs'},{lang:'CS',href:'https://EXAMPLE.cz:443/cs'}]}}]);
assert(!equivalentTargets.some(item=>/Více odlišných canonical|Odlišné hreflang cíle/.test(item.name)),'relative and absolute links resolving to the same normalized target must not be reported as conflicts');
assert.equal(metadataContext.scoreAuditAreas(equivalentTargets)[0].tests,0,'normalized metadata signals must remain excluded from score');
const extractedBase=metadataContext.extractHeadMetadata({head:{querySelectorAll:()=>[],querySelector:selector=>{assert.equal(selector,'base[href]');return{getAttribute:()=>'/localized/'}}}});
assert.equal(extractedBase.baseHref,'/localized/');
for(const baseHref of ['/localized/','https://cdn.example.cz/localized/']){
 const destination=new URL('target',new URL(baseHref,'https://example.cz/page')).href;
 const findings=metadataContext.htmlMetadataFindings([{url:'https://example.cz/page',raw:'page',htmlMetadata:{baseHref,canonical:['target',destination],hreflang:[{lang:'cs',href:'target'},{lang:'CS',href:destination}]}}]);
 assert(!findings.some(item=>item.state==='HYPOTÉZA'),'equivalent targets must respect base href');
 assert.equal(metadataContext.scoreAuditAreas(findings)[0].tests,0);
}
const distinctBaseTargets=metadataContext.htmlMetadataFindings([{url:'https://example.cz/page',raw:'page',htmlMetadata:{baseHref:'https://example.cz/localized/',canonical:['target','https://example.cz/other'],hreflang:[]}}]);
assert(distinctBaseTargets.some(item=>item.state==='HYPOTÉZA'),'genuinely different targets remain visible');
const redirectUnknown=metadataContext.htmlMetadataFindings([{url:'https://example.cz/old/',raw:'page',htmlMetadata:{canonical:['target','https://example.cz/new/target'],hreflang:[{lang:'cs',href:'target'},{lang:'cs',href:'https://example.cz/new/target'}]}}]);
assert(!redirectUnknown.some(item=>item.state==='HYPOTÉZA'),'unknown final URL must not create relative target conflicts');
assert(redirectUnknown.some(item=>item.state==='NELZE OVĚŘIT'));
assert.equal(metadataContext.scoreAuditAreas(redirectUnknown)[0].tests,0);
const longTargets=Array.from({length:200},(_,i)=>'https://example.cz/?value='+'x'.repeat(8000)+i);
const largeMetadata=metadataContext.htmlMetadataFindings([{url:'https://example.cz/',raw:'page',htmlMetadata:{canonical:longTargets,hreflang:longTargets.map(href=>({lang:'cs',href}))}}]);
assert(largeMetadata.filter(item=>item.state==='HYPOTÉZA').length===2,'full target identities must still detect both conflicts');
for(const item of largeMetadata){assert(item.evidence.length<2000,'metadata evidence must stay bounded');assert.match(item.evidence,/Ukázka zkrácena/);}
assert.equal(metadataContext.scoreAuditAreas(largeMetadata)[0].tests,0);
const unresolvedLarge=metadataContext.htmlMetadataFindings([{url:'https://example.cz/',raw:'page',htmlMetadata:{canonical:longTargets.map(href=>'/relative/'+href),hreflang:[]}}]);
assert(unresolvedLarge.every(item=>item.evidence.length<2000));



assert(metadataContext.extractHeadMetadata({head:{querySelectorAll:()=>Array.from({length:205},()=>metadataLinks[4])}}).truncated,'large HTML heads must disclose the metadata collection cap');
c.fetchTimed=async()=>({ok:false,status:503,text:async()=>'unavailable'});await assert.rejects(()=>c.fetchPageHtmlMetadata(new URL('https://example.cz/bad')),/HTML metadata stránky:.*503/);
c.fetchTimed=async()=>({ok:true,status:200,text:async()=>'Warning: Target URL returned error 404: Not found'});await assert.rejects(()=>c.fetchPageHtmlMetadata(new URL('https://example.cz/not-found')),/HTML metadata stránky:.*404/);
for(const complete of ['<html><head><!-- </head> --><title>literal &lt;head&gt;</title></head></html>', '<html><head><meta content="</head>"><script>const x="<head>";</script></head></html>'])assert(c.hasExplicitCompleteHead(complete));
for(const incomplete of ['<!doctype html><html>', '<html><head><link rel="canonical" href="/a">', '<html><body>Reader fragment</body></html>', '<!-- <head></head> --><html>', '<html><head><script>const x="</head>";</script>', '<html><head><!-- </head> -->', '<html><head><title>literal </head></title>', '<template><head></head></template>', '<html><head><meta content="</head>">']){
 c.fetchTimed=async()=>({ok:true,status:200,text:async()=>incomplete});
 await assert.rejects(()=>c.fetchPageHtmlMetadata(new URL('https://example.cz/incomplete')),/Úplnost HTML hlavičky nelze potvrdit/);
}
console.log('PASS: HTML metadata fetch/extraction is bounded, explicit, conflict-only, and excluded from score');
const makeStream=(chunks,onCancel=()=>{})=>({getReader:()=>{let index=0;return{async read(){return index<chunks.length?{done:false,value:chunks[index++]}:{done:true}},async cancel(){onCancel()}}}});
assert.equal(await c.readTimedTextResponse({body:makeStream([Buffer.from([0x41,0xc5]),Buffer.from([0xbe])])},3),'Až','UTF-8 sequences split across stream chunks should decode correctly');
let oversizedStreamCancelled=false;await assert.rejects(c.readTimedTextResponse({body:makeStream([Buffer.from('ab'),Buffer.from('cd')],()=>{oversizedStreamCancelled=true})},3),/limit 3 bajtů/);assert(oversizedStreamCancelled,'oversized response stream must be cancelled immediately');
let cancelRequested=false;
const stuckCancel={body:{getReader:()=>({read:async()=>({done:false,value:Buffer.from('oversized')}),cancel(){cancelRequested=true;return new Promise(()=>{})}})}};
let cancelTimer;
try{
 await assert.rejects(Promise.race([c.readTimedTextResponse(stuckCancel,3),new Promise((_,reject)=>{cancelTimer=setTimeout(()=>reject(new Error('cancellation blocked audit')),100)})]),/limit 3 bajtů/);
 assert(cancelRequested,'oversized streams must request cancellation even when cleanup never settles');
}finally{clearTimeout(cancelTimer)}
await assert.rejects(c.readTimedTextResponse({body:null,text:async()=>'long response'},3),/limit 3 bajtů/,'fallback response readers must still reject oversized text');
assert.throws(()=>c.assertPageSpeedResult({}));
assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{runtimeError:{code:'ERRORED_DOCUMENT_REQUEST',message:'failed'}}}),/ERRORED_DOCUMENT_REQUEST/);
const payload={lighthouseResult:{audits:{}}};assert.equal(c.assertPageSpeedResult(payload),payload);
const expectedPageUrl=new URL('https://example.cz/');
const mobilePayload={lighthouseResult:{configSettings:{emulatedFormFactor:'mobile'},audits:{}}};assert.equal(c.assertPageSpeedResult(mobilePayload,expectedPageUrl,'mobile'),mobilePayload);assert.throws(()=>c.assertPageSpeedResult(mobilePayload,expectedPageUrl,'desktop'),/jiné zařízení/);assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{configSettings:{},audits:{}}},expectedPageUrl,'mobile'),/jiné zařízení/);assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{audits:{}}},expectedPageUrl,'mobile'),/jiné zařízení/);assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{configSettings:null,audits:{}}},expectedPageUrl,'desktop'),/jiné zařízení/);
const sameSitePayload={lighthouseResult:{requestedUrl:'https://www.example.cz/',finalUrl:'https://example.cz/a',finalDisplayedUrl:'https://example.cz/a',audits:{}}};assert.equal(c.assertPageSpeedResult(sameSitePayload,expectedPageUrl),sameSitePayload);
assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{requestedUrl:'https://attacker.example/',finalUrl:'https://attacker.example/',audits:{}}},expectedPageUrl),/jinou doménu/);
assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{finalUrl:'not a valid URL',audits:{}}},expectedPageUrl),/neplatnou adresu/);
assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{finalDisplayedUrl:'not a valid URL',audits:{}}},expectedPageUrl),/neplatnou adresu/);
assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{finalDisplayedUrl:'https://attacker.example/',audits:{}}},expectedPageUrl),/jinou doménu/);
calls=[];c.fetchTimed=async(target,options,timeout)=>{calls.push({target,timeout});return{ok:true,status:200,text:async()=> 'Title: Example\nMarkdown Content:\nPage text'}};c.readTimedResponse=async response=>response.text();
const pageUrl=new URL('https://example.cz/');const page=await c.fetchReadablePage(pageUrl,'/a?x=1#section');assert.match(page,/Page text/);assert.equal(calls[0].target,'https://r.jina.ai/https://example.cz/a?x=1');assert.equal(calls[0].timeout,20000);
calls=[];await assert.rejects(()=>c.fetchReadablePage(pageUrl,'//outside.cz/a'),/požadovaný původ/);assert.equal(calls.length,0);
c.fetchTimed=async()=>({ok:true,status:200,body:makeStream([Buffer.alloc(2*1024*1024+1,0x61)],()=>{oversizedStreamCancelled=true})});await assert.rejects(()=>c.fetchReadablePage(pageUrl,'/large-page'),/limit 2 MiB/,'oversized public pages must fail as unreadable instead of being parsed or scored');assert(oversizedStreamCancelled);
c.fetchTimed=async target=>{calls.push(target);throw Error('TLS unavailable')};await assert.rejects(()=>c.fetchReadablePage(pageUrl,'/robots.txt'),/TLS unavailable/);assert.equal(calls.length,1);assert(!calls[0].includes('/http://'));
c.fetchTimed=async target=>{calls.push(target);return{ok:false,status:503,text:async()=> 'unavailable'}};await assert.rejects(()=>c.fetchReadablePage(pageUrl,'/'),/503/);
let pageSpeedRequests=0,pageSpeedCacheWrites=0,cachedPageSpeed=null;
c.window.WebaoPsiCache={read:()=>cachedPageSpeed,write:()=>{pageSpeedCacheWrites++}};
c.fetchTimed=async()=>{pageSpeedRequests++;return{ok:true,status:200}};
c.readTimedResponse=async()=>({lighthouseResult:{configSettings:{emulatedFormFactor:'mobile'},requestedUrl:'https://example.cz/',finalUrl:'https://other.example/',audits:{}}});
await assert.rejects(c.queryPageSpeed(new URL('https://example.cz/'),'mobile'),/jinou doménu/);
assert.equal(pageSpeedRequests,1);assert.equal(pageSpeedCacheWrites,0);
cachedPageSpeed={payload:{lighthouseResult:{configSettings:{emulatedFormFactor:'desktop'},audits:{}}}};c.readTimedResponse=async()=>({lighthouseResult:{configSettings:{emulatedFormFactor:'mobile'},requestedUrl:'https://example.cz/',finalUrl:'https://example.cz/',audits:{}}});const recovered=await c.queryPageSpeed(new URL('https://example.cz/'),'mobile');assert.equal(recovered.lighthouseResult.configSettings.emulatedFormFactor,'mobile');assert.equal(pageSpeedRequests,2);assert.equal(pageSpeedCacheWrites,1);
console.log('PASS: readable source validation, PageSpeed payload validation and origin-safe page fetch');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function parsePageText('),s.indexOf('function decodeSitemapLoc(')),c);
const page=c.parsePageText('Title: Article\nMarkdown Content:\n# Using `[example](/fake)`\nHere is `[fake](/fake)` and ``![fake](/fake.png) `code` ``.\n[real](/real) ![real image](/real.png)\n`unmatched [valid](/valid)',new URL('https://example.cz/'));
assert.equal(page.links.length,2);assert(page.links.includes('https://example.cz/real'));assert(page.links.includes('https://example.cz/valid'));assert.equal(page.images.length,1);assert.equal(page.images[0].url,'https://example.cz/real.png');assert.equal(page.h1s.length,1);assert(page.body.includes('[fake](/fake)'));
assert.match(c.stripMarkdownInlineCode('before ``code ` inner`` after'),/^before +after$/);
const escaped='\\`[real](/real)\\`';assert.equal(c.stripMarkdownInlineCode(escaped),escaped);assert.equal(c.parsePageText(escaped,new URL('https://example.cz/')).links.length,1);
console.log('PASS: inline code examples do not create crawl links or image findings; unmatched backticks preserve actual text');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function isSameSiteHost('),s.indexOf('function extractPublicContacts('))+s.slice(s.indexOf('function normalizeRobotsPath('),s.indexOf('function pageType(')),c);
const base=new URL('https://example.cz/');
for(const candidate of ['http://example.cz/a','https://www.example.cz/a','https://shop.example.cz/a','https://cz/a','https://outside.cz/a'])assert.equal(c.normalizeCrawlUrl(candidate,base),'');
assert.equal(c.normalizeCrawlUrl('/a?x=1#part',base),'https://example.cz/a?x=1');assert.equal(c.normalizeCrawlUrl('http://example.cz/a',new URL('http://example.cz/')),'http://example.cz/a');
assert.equal(c.normalizeCrawlUrl('/article?utm_source=newsletter&gclid=campaign&product=42#details',base),'https://example.cz/article?product=42','known analytics identifiers must not multiply crawled copies of the same page');
assert.equal(c.normalizeCrawlUrl('/article?campaign=summer&ref=partner&UTM_MEDIUM=email',base),'https://example.cz/article?campaign=summer&ref=partner','remove tracking parameters while preserving potentially content-bearing query values');
assert.equal(c.normalizeCrawlUrl('/article?utm=content&lang=cs',base),'https://example.cz/article?utm=content&lang=cs','keep non-standard and functional query parameters');
const links=c.discoverPageLinks([{url:base.href,raw:'ok',links:['/allowed','https://shop.example.cz/private','http://example.cz/other']}],base,()=>false,'User-agent: *\nDisallow: /private');assert.equal(links.length,1);assert.equal(links[0].url,'https://example.cz/allowed');
const xml='<urlset><loc>https://example.cz/a</loc><loc>https://shop.example.cz/private</loc><loc>http://example.cz/other</loc></urlset>';assert.deepEqual(Array.from(c.getSitemapUrls(xml,'example.cz')),['https://example.cz/a']);
assert.equal(c.getSitemapLocations('Sitemap: https://shop.example.cz/sitemap.xml','example.cz').length,0);assert.equal(c.normalizeCrawlUrl('https://example.cz/a',new URL('https://shop.example.cz/')),'');
console.log('PASS: crawls, sitemap discovery and link inventories stay on the audited origin without borrowing robots rules or rewriting protocols');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
for(const {failHome,failRobots,robotsServerError,robotsTargetStatus,blockHome,success,deepFailure} of [{failHome:true},{},{failRobots:true},{robotsServerError:'503'},{robotsTargetStatus:'404'},{blockHome:true},{success:true},{deepFailure:true}]){
let submit,report;const errors=[];const element={value:'',checked:false,disabled:false,style:{},setAttribute(){},removeAttribute(){},scrollIntoView(){},querySelector(){return element},querySelectorAll(){return[]}};
const requestedPaths=[];const out={...element,innerHTML:''},button={...element};const form={...element,addEventListener:(name,handler)=>{submit=handler},querySelector:()=>button};
const c={URL,TextEncoder,setTimeout,clearTimeout,setInterval,clearInterval,console:{log(){},error:(...args)=>errors.push(args)},window:{},document:{querySelector:selector=>selector==='#audit-form'?form:selector==='#result'?out:selector==='#domain'?{value:'https://example.cz'}:selector==='#pageLimit'?{value:'6'}:element}};
vm.createContext(c);vm.runInContext(s,c);
c.fetchReadablePage=async(url,path)=>{requestedPaths.push(path);if(path==='/robots.txt'){if(failRobots)throw Error('robots unavailable');if(robotsServerError)throw Error('Textová čtečka oznámila chybu cílového zdroje ('+robotsServerError+').');if(robotsTargetStatus)throw Error('Textová čtečka oznámila chybu cílového zdroje ('+robotsTargetStatus+').');return blockHome?'User-agent: *\nDisallow: /$':'User-agent: *\nAllow: /'};if(path==='/sitemap.xml')return 'Title: Sitemap\nMarkdown Content:\nhttps://example.cz/child';if(path==='/grandchild'||path==='/child'&&!success&&!deepFailure||failHome&&path==='/')throw Error('Reader unavailable');if(success&&path==='/')return 'Title: A sufficiently long title\nMarkdown Content:\n# Welcome\n`TODO` [doplnit]\n![Descriptive alt](/info.png) ![](/decoration.png)';if(path==='/child'&&deepFailure)return 'Title: Child page title\nMarkdown Content:\n# Child\n[grandchild](/grandchild)';return 'Title: A sufficiently long title\nMarkdown Content:\n# Welcome\n[child](/child)';};
c.queryDns=async()=>({Status:0,Answer:[]});c.queryRdap=async()=>{if(failHome)return{events:{}};if(success)return{events:[{eventAction:'expiration',eventDate:'not a date'}]};throw Error('Registry unavailable')};c.queryPageSpeedStrategies=async()=>[{status:'rejected',reason:Error('quota exceeded')}];c.getReportBranding=async()=>({});const render=c.renderReport;c.renderReport=(host,findings,pages,meta)=>{render(host,findings,pages,meta);report={host,findings,pages,meta}};
await submit({preventDefault(){}});assert.equal(errors.length,0);assert(report,'Audit must reach report despite reader failures');assert.equal(report.host,'example.cz');assert.equal(report.findings.filter(x=>x.name==='Veřejná čtečka stránku neověřila').length,robotsServerError||failRobots?0:failHome?2:success?0:1);assert(report.findings.some(x=>x.area==='DNS a e-mail'));assert.match(out.innerHTML,/Detailní nálezy/);assert.equal(c.window.currentAuditData.host,'example.cz');assert.equal(button.disabled,false);assert.equal(vm.runInContext('auditInProgress',c),false);if(robotsServerError){assert.equal(report.pages.filter(page=>page.state==='Vynecháno — robots.txt dočasně nedostupný').length,1);assert.equal(report.pages.some(page=>page.state==='Prověřeno'),false);assert.equal(report.meta.selected,0);assert.equal(report.meta.robotsExcludedUrlCount,0);assert.equal(report.meta.robotsUnverifiedUrlCount,1);assert.deepEqual(requestedPaths,['/robots.txt']);assert.match(report.meta.note,/fail-closed/);const source=report.meta.sourceStatuses.find(item=>item.name==='robots.txt');assert.equal(source.status,'Chyba serveru HTTP 503');assert.match(source.detail,/auditní požadavky na stránky a sitemapu byly vynechány/i)}if(failRobots){assert.equal(report.meta.selected,0);assert.equal(report.meta.robotsExcludedUrlCount,0);assert.equal(report.meta.robotsUnverifiedUrlCount,1);assert.deepEqual(requestedPaths,['/robots.txt']);assert.equal(report.pages[0].state,'Vynecháno — robots.txt nelze ověřit');assert.equal(report.meta.sourceStatuses.find(item=>item.name==='PageSpeed — mobil a desktop').status,'Vynecháno — robots.txt nelze ověřit');assert.equal(report.meta.sitemapFailures.length,0);assert.equal(report.meta.sitemapSkipped.length,1);const access=report.findings.find(x=>x.name==='Přístup homepage podle robots.txt');assert.equal(access.points,null);assert.equal(access.state,'NELZE OVĚŘIT');assert.match(access.detail,/nelze ověřit/);assert(!access.ok)}if(robotsTargetStatus){assert.equal(report.meta.sourceStatuses.find(item=>item.name==='robots.txt').status,'Soubor nedostupný HTTP 404');assert.equal(report.meta.selected,2);assert.equal(report.meta.robotsExcludedUrlCount,0);assert.equal(report.meta.robotsUnverifiedUrlCount,0);assert(requestedPaths.includes('/'));assert(requestedPaths.includes('/sitemap.xml'));const access=report.findings.find(x=>x.name==='Přístup homepage podle robots.txt');assert.equal(access.points,null);assert.equal(access.state,'NELZE OVĚŘIT')}if(blockHome)assert(report.pages.some(x=>x.state==='Vynecháno podle robots.txt'));if(deepFailure)assert(report.pages.some(x=>x.url==='https://example.cz/grandchild'&&x.loadError));if(success){const alt=report.findings.find(x=>x.name==='Alternativní texty obrázků');assert(alt);assert.equal(alt.points,null);assert.equal(alt.state,'K PROVĚŘENÍ');assert.match(alt.detail,/dekorativní/);const expiry=report.findings.find(x=>x.name==='Expirace domény');assert.equal(expiry.points,null);assert(!expiry.detail.includes('NaN'));const placeholder=report.findings.find(x=>x.name==='Nedoplněný zástupný text');assert(placeholder);assert.equal(placeholder.points,null);assert.equal(placeholder.state,'HYPOTÉZA');assert.equal(placeholder.evidence,'[doplnit]');const repeatedH1=report.findings.filter(x=>x.name==='Opakovaný hlavní nadpis ve vzorku — hypotéza');assert.equal(repeatedH1.length,2);assert(repeatedH1.every(x=>x.points===null&&x.state==='HYPOTÉZA'));assert.match(out.innerHTML,/Samotné opakování nemění skóre/)}
}
console.log('PASS: seven audit/report flows cover reader failures, blocked/unknown/server-error robots, success and deep crawl failure');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function buildRdapExpiryFinding('),s.indexOf('function dnsResultAvailable('))+s.slice(s.indexOf('function advice('),s.indexOf('function buildDetektiv(')),c);const url=new URL('http://example.cz/'),now=Date.parse('2026-11-03T12:00:00Z');
for(const data of [null,{}, {events:{}},{events:[null,5]},{events:[{eventAction:'expiration',eventDate:'invalid'}]},{events:[{eventAction:'expiration',eventDate:'2027-02-30T12:00:00Z'}]},{events:[{eventAction:'expiration',eventDate:1800000000000}]}]){const f=c.buildRdapExpiryFinding(data,url,now);assert.equal(f.points,null);assert.equal(f.state,'NELZE OVĚŘIT');assert.equal(f.url,'http://example.cz');assert(!f.detail.includes('NaN'));}
const finding=date=>c.buildRdapExpiryFinding({events:[{eventAction:'expiration',eventDate:date}]},url,now);
assert.equal(finding('2027-11-03T12:00:00Z').points,100);assert.equal(finding('2026-11-10T12:00:00Z').points,20);assert.equal(finding('2026-12-10T12:00:00Z').points,65);assert.equal(finding('2026-10-03T12:00:00Z').points,20);
assert.equal(c.buildRdapExpiryFinding({events:[{eventAction:'expiration',eventDate:'invalid'},{eventAction:'registrar expiration',eventDate:'2027-11-03T12:00:00+01:00'}]},url,now).points,100);
assert.match(c.advice({name:'Pravidla robots.txt',points:null}),/Nejprve ověřte/);assert.match(c.advice({name:'XML sitemap',points:null}),/nepotvrzuje/);assert(!c.advice({name:'Expirace domény',points:null}).includes('modul'));
console.log('PASS: malformed RDAP never crashes or scores as valid registration; expiry boundaries and unverified advice remain accurate');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function findPlaceholderExamples('),s.indexOf('function isSameSiteHost(')),c);
assert.deepEqual(Array.from(c.findPlaceholderExamples('[doplnit] {{company}} TODO Lorem ipsum example.com')),['[doplnit]','{{company}}','TODO','Lorem ipsum','example.com']);
assert.equal(c.findPlaceholderExamples('`TODO` ``{{company}} ` nested`` \n~~~html\n[doplnit]\n~~~').length,0);assert.equal(c.findPlaceholderExamples('Methodology TODOlist example.company').length,0);assert.equal(c.findPlaceholderExamples('Please [doplnit] and then {{name}}.').length,2);
console.log('PASS: placeholder detection handles bracketed template tokens and excludes code samples and partial words');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,console,document:{querySelector:()=>({})},window:{}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
assert.equal(c.analyzeSpf(['v=spf1 all']).allQualifier,'+');assert.equal(c.analyzeSpf(['v=spf1 +all']).allQualifier,'+');assert.equal(c.analyzeSpf(['v=spf1 -all']).allQualifier,'-');assert.equal(c.analyzeSpf(['v=spf1 ~all']).allQualifier,'~');assert.equal(c.analyzeSpf(['v=spf1 ?all']).allQualifier,'?');assert.equal(c.analyzeSpf(['v=spf1 a']).allQualifier,'');assert.equal(c.analyzeSpf(['v=spf1 -all +all']).allQualifier,'-');
const raw='Title: Contacts\nMarkdown Content:\n# Call 00420 777 888 999\ninfo@example.cz\n`fake@example.cz`\n```\nfake2@example.cz\n+420 111 222 333\n```\n[Call](tel:+420777888999)';const url=new URL('https://example.cz/');const parsed=c.parsePageText(raw,url);const contacts=c.extractPublicContacts([{url:url.href,raw,parsed}])[0];assert.equal(contacts.emails.length,1);assert.equal(contacts.emails[0],'info@example.cz');assert.equal(contacts.phones.length,1);assert.equal(contacts.phones[0],'+420 777 888 999');
console.log('PASS: implicit SPF pass qualifier and real contacts without code-sample false positives');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,console,document:{querySelector:()=>({})},window:{}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
for(const text of ['Cena 100','ceník','Cena: 100 Kč','100 Kč','100Kč','100,50Kč','CZK 100','Rozpočet'])assert(c.priceSignalPattern().test(text),text);for(const text of ['ocenění','podceníkx','xKčx','abc100Kč','price 100'])assert(!c.priceSignalPattern().test(text),text);
const url=new URL('https://example.cz/');const page=raw=>({url:url.href,type:'Úvodní stránka',raw,parsed:c.parsePageText(raw,url)});
c.buildDetektiv([page('Title: Demo\nMarkdown Content:\nHello\n```\nCena Kč kontakt reference nejrychlejší\n```\n`nejlepší nabídka 50 %`')]);assert(c.window.currentAuditScenarios.every(x=>!x.found));assert.equal(c.window.currentAuditClaims.length,0);
c.buildDetektiv([page('Title: Demo\nMarkdown Content:\n# Nejlepší nabídka\nSleva 50 %. Cena 100 Kč. Kontaktujte nás.')]);assert(c.window.currentAuditScenarios.find(x=>x.key==='price').found);assert(c.window.currentAuditScenarios.find(x=>x.key==='contact').found);assert(c.window.currentAuditClaims.some(x=>x.phrase.includes('Nejlepší')));assert(c.window.currentAuditClaims.some(x=>x.phrase.includes('50 %')));
console.log('PASS: Czech pricing and claims use Unicode boundaries and ignore code-sample business signals');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,console,document:{querySelector:()=>({})},window:{}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
const quota={status:'rejected',reason:new Error('quota exceeded')},success={status:'fulfilled',value:{}},dns={status:'fulfilled',value:{Status:0,Answer:[]}};
let sources=c.measurementSourceStatuses({pages:[{raw:'ok'},{loadError:'failed'}],robotsKnown:true,dnsResults:[dns,quota],rdapResult:quota,pageSpeedResults:[quota,quota],httpVariantResults:[quota,quota],observatoryResult:{status:'skipped'}});
assert.equal(sources.find(x=>x.name==='Google Public DNS').status,'Částečně dostupné');assert.equal(sources.find(x=>x.name==='PageSpeed — mobil a desktop').status,'Limit služby');assert.equal(sources.find(x=>x.name==='MDN HTTP Observatory').status,'Neprovedeno');assert.equal(sources[0].status,'Částečně dostupné');
sources=c.measurementSourceStatuses({pages:[{raw:'ok',htmlMetadata:{canonical:[],hreflang:[]}},{raw:'ok',htmlMetadataError:'reader timeout'}]});const metadataSource=sources.find(x=>x.name==='HTML hlavičky — canonical a hreflang');assert.equal(metadataSource.status,'Částečně dostupné');assert.match(metadataSource.detail,/1 z 2/);assert.equal(c.findingKind({state:'SIGNÁL'}),'Informace');
sources=c.measurementSourceStatuses({rootAllowed:false,pages:[],pageSpeedResults:[quota,quota],httpVariantResults:[quota,quota],observatoryResult:{status:'skipped'}});assert.equal(sources[0].status,'Vynecháno');assert.equal(sources.find(x=>x.name==='PageSpeed — mobil a desktop').status,'Vynecháno podle robots.txt');
sources=c.measurementSourceStatuses({pages:[{raw:'ok'}],robotsKnown:true,dnsResults:[dns],rdapResult:success,pageSpeedResults:[success,success],httpVariantResults:[success,success],observatoryResult:success});assert.equal(sources.find(x=>x.name==='Google Public DNS').status,'Odpovědi získány');assert.equal(sources.find(x=>x.name==='PageSpeed — mobil a desktop').status,'Odpovědi získány');assert.equal(sources.find(x=>x.name==='RDAP registr domény').status,'Odpověď získána');
const html=c.buildSourceAvailabilityHtml({sourceStatuses:[{name:'<script>x</script>',status:'OK',detail:'a&b'}]});assert(!html.includes('<script>x</script>'));assert(html.includes('&lt;script&gt;'));assert(html.includes('a&amp;b'));assert.equal(c.buildSourceAvailabilityHtml({}),'');
const out=vm.runInContext('out',c);out.querySelector=()=>null;out.querySelectorAll=()=>[];c.localStorage={getItem:()=>null,setItem(){}};c.renderReport('example.cz',[],[],{sourceStatuses:sources});assert(out.innerHTML.includes('Dostupnost zdrojů v tomto běhu'));assert(out.innerHTML.includes('Google Public DNS'));
let csv='';c.Blob=class{constructor(parts){csv=parts[0]}};c.URL={createObjectURL:()=> 'blob:stub',revokeObjectURL(){}};c.document.createElement=()=>({click(){}});c.setTimeout=()=>{};c.downloadAuditCsv();assert(csv.includes('Zdroj měření'));assert(csv.includes('Google Public DNS'));assert(csv.includes(c.window.currentAuditData.checkedAt));
console.log('PASS: source availability distinguishes response, partial failure, quota and optional skip and reaches report and CSV');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function normalizeFindingSearch('),s.indexOf('function initFindingWorkControls(')),c);
const makeCard=(status,owner)=>({textContent:'Nový V řešení Opraveno Ignorováno Znovu ověřit',dataset:{area:'SEO',severity:'Nízká',workStatus:status,findingKind:'Měřený signál'},fields:[{value:status},{value:owner},{value:'Poznámka'}],querySelector:()=>({textContent:'Přístupnost stránky'}),querySelectorAll(){return this.fields}});
const cards=[makeCard('Nový','Petr'),makeCard('Opraveno','Jana')];let update;const query={value:'Opraveno',tagName:'INPUT',addEventListener:(_,handler)=>{update=handler}};const summary={textContent:''};const root={querySelector:selector=>selector==='[name="finding-query"]'?query:selector==='.finding-filter-summary'?summary:{value:'all'},querySelectorAll:()=>[query]};c.out={querySelector:()=>root,querySelectorAll:()=>cards};c.initFindingFilters();assert(cards[0].hidden);assert(!cards[1].hidden);assert.equal(summary.textContent,'Zobrazeno 1 z 2 nálezů.');
query.value='pristupnost';update();assert(cards.every(x=>!x.hidden));query.value='Jana';update();assert(cards[0].hidden);assert(!cards[1].hidden);cards[1].fields[2].value='Hotový formulář';query.value='hotovy formular';update();assert(!cards[1].hidden);assert.equal(c.normalizeFindingSearch('ŘEŠITEL'),'resitel');assert(s.includes('data-finding-content'));assert(s.includes("dispatchEvent(new Event('input'))"));
console.log('PASS: real finding filters search selected state, current owner/notes and Czech text without matching unused options');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const out={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};const c={URL,TextEncoder,console,window:{},document:{querySelector:selector=>selector==='#result'?out:{}},localStorage:{getItem:()=>null,setItem(){}}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
const findings=[{area:'SEO a obsah',name:'Title',points:100,ok:true,detail:'Description'}];const previous={checkedAt:'before',score:50,ruleVersion:s.match(/const ruleVersion='([^']+)'/)[1],comparisonScope:c.auditComparisonScope(findings,[]),areas:{'SEO a obsah':'corrupted'}};c.localStorage.getItem=()=>JSON.stringify([previous]);c.renderReport('example.cz',findings,[],{});assert(!out.innerHTML.includes('NaN'));assert(out.innerHTML.includes('data-finding-content'));assert(out.innerHTML.includes('finding-work-controls'));
console.log('PASS: malformed stored area scores cannot create NaN changes in the full report');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={areaDefs:[['SEO a obsah',25]],pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function scoreAuditAreas('),s.indexOf('function renderReport('))+s.slice(s.indexOf('function auditComparisonScope('),s.indexOf('function comparableAuditRuns(')),c);
const checked={area:'SEO a obsah',name:'Title',points:100,ok:true};const recommendation={area:'SEO a obsah',name:'Lighthouse recommendation',points:null,priorityPoints:50,state:'DOPORUČENÍ',coverageExcluded:true};const unverified={area:'SEO a obsah',name:'Meta description',points:null,state:'NELZE OVĚŘIT'};
const base=c.scoreAuditAreas([checked])[0],withRecommendation=c.scoreAuditAreas([checked,recommendation])[0],withUnverified=c.scoreAuditAreas([checked,unverified])[0];assert.equal(withRecommendation.tests,base.tests);assert.equal(withRecommendation.effectiveWeight,base.effectiveWeight);assert.equal(withRecommendation.score,base.score);assert.equal(withUnverified.coverage,0.5);assert.equal(withUnverified.effectiveWeight,12.5);
assert.equal(c.auditComparisonScope([checked],[{url:'https://example.cz/',raw:'page'}]),c.auditComparisonScope([checked,recommendation],[{url:'https://example.cz/',raw:'page'}]));assert.notEqual(c.auditComparisonScope([checked],[{url:'https://example.cz/',raw:'page'}]),c.auditComparisonScope([checked,unverified],[{url:'https://example.cz/',raw:'page'}]));
assert(s.includes("coverageExcluded:true,severity:points<50?'Závažná':'Střední'"));assert.match(s,/const ruleVersion='2026-11-11\.160'/);
console.log('PASS: unscored Lighthouse recommendations do not distort weighted audit coverage or comparison scope');
})();

await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const healthcheck=fs.readFileSync(path.join(__dirname,'healthcheck.cjs'),'utf8');
assert(healthcheck.includes("present', true)"));
assert(healthcheck.includes("record('audit_markup', 'FAIL', error.message, true)"));
assert(healthcheck.includes("records.some(item => item.status === 'FAIL' && item.critical)"));
assert(healthcheck.includes("async function request(url, readBody = false)"));
assert(healthcheck.includes("const body = await readResponseText(response);"));
assert(healthcheck.includes("size > maxBytes"));
assert(healthcheck.includes("const maxResponseBytes = 2 * 1024 * 1024;"));
assert(healthcheck.includes("body: html } = await request(new URL('/audit/', origin), true)"));
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'healthcheck.cjs'),'utf8');
const c={AbortController,TextDecoder:require('node:util').TextDecoder,Buffer,setTimeout,clearTimeout,timeoutMs:15,retries:0,maxResponseBytes:2*1024*1024,fetch:async(_url,{signal})=>({headers:{get:()=>null},body:{getReader:()=>({read:()=>new Promise((_,reject)=>signal.addEventListener('abort',()=>reject(Object.assign(new Error('aborted'),{name:'AbortError'})))),cancel:async()=>{}})}})};
vm.createContext(c);
vm.runInContext(source.slice(source.indexOf('async function readResponseText('),source.indexOf('async function checkUrl(')),c);
const started=Date.now();
await assert.rejects(c.request('https://example.cz/audit/',true),{name:'AbortError'});
assert(Date.now()-started<1000,'body read should honor the configured timeout');
const streamContext={Buffer,TextDecoder};vm.createContext(streamContext);
vm.runInContext(source.slice(source.indexOf('async function readResponseText('),source.indexOf('async function request(')),streamContext);
const makeStream=(chunks,onCancel=()=>{})=>({getReader:()=>{let index=0;return{async read(){return index<chunks.length?{done:false,value:chunks[index++]}:{done:true}},async cancel(){onCancel()}}}});
let cancelled=false;
const streamedLarge={headers:{get:()=>null},body:makeStream([Buffer.from('ab'),Buffer.from('cd')],()=>{cancelled=true})};
await assert.rejects(streamContext.readResponseText(streamedLarge,3),/exceeds 3 bytes/);
assert(cancelled,'stream should be cancelled as soon as the byte limit is exceeded');
let cancellationCalls=0,cleanupTimer;
const stuckCleanup={body:{getReader:()=>({read:async()=>({done:false,value:Buffer.from('oversized')}),cancel(){cancellationCalls++;return new Promise(()=>{})}})}};
try{
 await assert.rejects(Promise.race([streamContext.readResponseText(stuckCleanup,3),new Promise((_,reject)=>{cleanupTimer=setTimeout(()=>reject(new Error('healthcheck cleanup blocked')),100)})]),/exceeds 3 bytes/);
 assert.equal(cancellationCalls,1,'healthcheck requests cancellation once without waiting for cleanup');
}finally{clearTimeout(cleanupTimer)}
const rejectedCleanup={body:{getReader:()=>({read:async()=>{throw new Error('original read failure')},cancel:async()=>{throw new Error('cleanup failure')}})}};
await assert.rejects(streamContext.readResponseText(rejectedCleanup,3),/original read failure/);
const utf8={headers:{get:()=>null},body:makeStream([Buffer.from([0x41,0xc5]),Buffer.from([0xbe])])};
assert.equal(await streamContext.readResponseText(utf8,3),'Až','UTF-8 sequences split across chunks should decode correctly');
await assert.rejects(streamContext.readResponseText({body:null,text:async()=>''},3),/stream is unavailable/);

const redirectSource=source.slice(source.indexOf('function isSecureSiteResponse('),source.indexOf('function record('));
const redirects={URL};vm.createContext(redirects);vm.runInContext(redirectSource,redirects);
const site=new URL('https://webao.cz/');
const response=(status,location)=>({status,headers:{get:()=>location}});
assert(redirects.isSecureSiteResponse(response(200,null),site));
assert(redirects.isSecureSiteResponse(response(301,'https://www.webao.cz/audit/'),site));
assert(redirects.isSecureSiteResponse(response(302,'/audit/'),site));
assert(!redirects.isSecureSiteResponse(response(301,'http://webao.cz/'),site));
assert(!redirects.isSecureSiteResponse(response(302,'https://attacker.example/'),site));
assert(!redirects.isSecureSiteResponse(response(301,null),site));
assert(!redirects.isSecureSiteResponse(response(404,null),site));
console.log('PASS: healthcheck aborts a stalled response body within its timeout');
const timeoutSource=source.slice(source.indexOf('function configuredTimeout('),source.indexOf('const timeoutMs ='));
const timeoutContext={};vm.createContext(timeoutContext);vm.runInContext(timeoutSource,timeoutContext);
assert.equal(timeoutContext.configuredTimeout('2500'),2500);
assert.equal(timeoutContext.configuredTimeout('0.5'),12000);
assert.equal(timeoutContext.configuredTimeout('12.5'),12000);
assert.equal(timeoutContext.configuredTimeout('0'),12000);
assert.equal(timeoutContext.configuredTimeout('-1'),12000);
assert.equal(timeoutContext.configuredTimeout('Infinity'),12000);
assert.equal(timeoutContext.configuredTimeout('999999'),120000);
const contentTypeSource=source.slice(source.indexOf('function hasContentType('),source.indexOf('const timeoutMs ='));
const contentTypeContext={};vm.createContext(contentTypeContext);vm.runInContext(contentTypeSource,contentTypeContext);
const mediaResponse=value=>({headers:{get:()=>value}});
assert(contentTypeContext.hasContentType(mediaResponse('Text/HTML; charset=UTF-8'),'text/html'));
assert(contentTypeContext.hasContentType(mediaResponse(' text/javascript ; charset=utf-8'),'javascript'));
assert(contentTypeContext.hasContentType(mediaResponse('application/javascript'),'javascript'));
assert(contentTypeContext.hasContentType(mediaResponse('application/x-javascript'),'javascript'));
assert(!contentTypeContext.hasContentType(mediaResponse('text/htmlish'),'text/html'));
assert(!contentTypeContext.hasContentType(mediaResponse('application/notjavascript'),'javascript'));
assert(!contentTypeContext.hasContentType(mediaResponse(null),'text/html'));
assert(!contentTypeContext.hasContentType(mediaResponse('text/plain'),'javascript'));
console.log('PASS: healthcheck timeout and MIME type assertions');
})();
})();
;(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');const firstClose=html.indexOf('</script>');const scriptStart=html.indexOf('<script>',firstClose+9);const script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const c={areaDefs:[['Mobilní použitelnost',5]]};vm.createContext(c);
vm.runInContext(script.slice(script.indexOf('function missingLighthouseFinding('),script.indexOf('function assertPageSpeedResult('))+script.slice(script.indexOf('function scoreAuditAreas('),script.indexOf('function renderReport(')),c);
const missing=c.missingLighthouseFinding('Mobilní použitelnost','Lighthouse mobil — viewport — bez skórovaného auditu','viewport','https://example.cz/');
assert.equal(missing.points,null);assert.equal(missing.state,'NELZE OVĚŘIT');
const area=c.scoreAuditAreas([{area:'Mobilní použitelnost',name:'PageSpeed Insights',points:100},missing])[0];
assert.equal(area.tests,2);assert.equal(area.measured,1);assert.equal(area.coverage,0.5);assert.equal(area.effectiveWeight,2.5);
assert(script.includes("missingLighthouseFinding('Bezpečnost a HTTPS'"));
assert(script.includes("missingLighthouseFinding('Mobilní použitelnost'"));
assert(script.includes("if(!privacyCookieAudits.length)findings.push(missingLighthouseFinding"));
console.log('PASS: absent Lighthouse security, mobile and cookie checks reduce measured coverage instead of disappearing');
})();
await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const workflow=fs.readFileSync(path.join(__dirname,'../../.github/workflows/webao-monitor.yml'),'utf8');
const auditHtml=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert(auditHtml.includes('href="/assets/network.css'));
assert(workflow.includes("      - 'assets/**'"));
assert(workflow.includes("if: github.event_name == 'workflow_dispatch' || github.event_name == 'push'"));
console.log('PASS: shared audit assets trigger the mobile/browser smoke checks on push');
})();
await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const browserSmoke=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
assert(browserSmoke.includes("name: 'document_language'"));
assert(browserSmoke.includes("name: 'images_have_alt_attribute'"));
assert(browserSmoke.includes("name: 'audit_form_controls_have_accessible_names'"));
assert(browserSmoke.includes("document.querySelectorAll('img:not([alt])')"));
assert(browserSmoke.includes("control.labels || []"));
console.log('PASS: browser smoke protects document language, image alt attributes and form control names');
})();
await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const browserSmoke=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
const networkCss=fs.readFileSync(path.join(__dirname,'../../assets/network.css'),'utf8');
const auditHtml=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert(browserSmoke.includes("name: 'keyboard_can_reach_audit_submit'"));
assert(browserSmoke.includes("name: 'keyboard_submit_focus_is_visible'"));
assert(browserSmoke.includes("name: 'keyboard_focus_outline_contrast'"));
assert(browserSmoke.includes('focusContrast.ratio >= 3'));
assert(browserSmoke.includes("name: 'keyboard_domain_focus_is_visible'"));
assert(networkCss.includes('button:focus-visible{outline:2px solid var(--gold);outline-offset:5px}'));
assert(auditHtml.includes('.audit-form input:focus{'));
console.log('PASS: browser smoke protects keyboard tab order and visible focus checks');
})();
await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const workflow=fs.readFileSync(path.join(__dirname,'../../.github/workflows/webao-monitor.yml'),'utf8');
assert(workflow.includes("    - cron: '35 2 * * *'"));
assert(workflow.includes("github.event.schedule == '35 2 * * *'"));
assert(workflow.includes("name: Browser smoke test"));
console.log('PASS: daily scheduled browser smoke includes keyboard and accessibility checks');
})();
await (async()=>{
const fs=require('fs'),assert=require('assert/strict'),path=require('path');
const browserSmoke=fs.readFileSync(path.join(__dirname,'browser-smoke.cjs'),'utf8');
assert(browserSmoke.includes("name: 'sampled_form_text_contrast'"));
assert(browserSmoke.includes("sample.ratio >= 4.5"));
console.log('PASS: form text contrast smoke check is kept scoped to opaque controls');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const s=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const start=s.indexOf('function validateObservatoryResult('),end=s.indexOf('async function queryHttpObservatory(');
assert(start>=0&&end>start,'Observatory payload validator exists before query');
const c={Number};vm.createContext(c);vm.runInContext(s.slice(start,end)+';this.validateObservatoryResult=validateObservatoryResult;',c);
const valid={score:105,tests_quantity:10,tests_passed:10,tests_failed:0,grade:'A+',status_code:200};
assert.equal(c.validateObservatoryResult(valid),valid);
assert.throws(()=>c.validateObservatoryResult({...valid,grade:'A'}),/skóre a známku/);
for(const invalid of [
 null,[],{}, {...valid,score:NaN}, {...valid,score:105.5}, {...valid,score:146}, {...valid,tests_quantity:0},
 {...valid,tests_passed:-1}, {...valid,tests_failed:-1},
 {...valid,tests_passed:10,tests_failed:1}, {...valid,grade:''},
 {...valid,status_code:0}, {...valid,status_code:600}
])assert.throws(()=>c.validateObservatoryResult(invalid),/neplatný formát|neúplný výsledek/);
assert(s.slice(end,end+1000).includes('return validateObservatoryResult(payload)'), 'query validates payload before returning');
console.log('PASS: Observatory rejects incomplete and out-of-range payloads');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const start=script.indexOf('function nonnegativeMetric('),end=script.indexOf('function assertPageSpeedResult(',start);
assert(start>=0&&end>start,'CrUX metric helpers exist before PageSpeed validation');
const c={Number};vm.createContext(c);vm.runInContext(script.slice(start,end),c);
const metrics={INTERACTION_TO_NEXT_PAINT:{percentile:null},EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT:{percentile:-1},INP:{percentile:180}};
assert.equal(c.firstMetricPercentile(metrics,['INTERACTION_TO_NEXT_PAINT','EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT','INP']),180);
assert.equal(c.firstMetricPercentile({INTERACTION_TO_NEXT_PAINT:{percentile:150},INP:{percentile:180}},['INTERACTION_TO_NEXT_PAINT','INP']),150);
assert.equal(c.firstMetricPercentile({INTERACTION_TO_NEXT_PAINT:{percentile:'180'}},['INTERACTION_TO_NEXT_PAINT','INP']),null);
assert(script.includes("const interactionPercentile=firstMetricPercentile(metricSet,['INTERACTION_TO_NEXT_PAINT','EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT','INP']);"));
assert(script.includes("const fieldInp=firstMetricPercentile(metrics,['INTERACTION_TO_NEXT_PAINT','EXPERIMENTAL_INTERACTION_TO_NEXT_PAINT','INP']);"));
console.log('PASS: CrUX INP aliases fall through invalid preferred values without mixing scopes');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function robotsResponseLooksLikeError('),end=html.indexOf('async function queryRdap(',start),c={URL};vm.createContext(c);
vm.runInContext(html.slice(start,end)+';this.fetchRobotsAwarePage=fetchRobotsAwarePage;',c);
assert.equal(c.robotsResponseLooksLikeError('HTTP/1.1 200 OK\nUser-agent: *\nAllow: /'),false,'successful HTTP status lines must not be treated as reader errors');
assert.equal(c.robotsResponseLooksLikeError('HTTP/1.1 404 Not Found'),true);
assert.equal(c.robotsResponseLooksLikeError('HTTP 503 Service Unavailable'),true);
let pageCalls=0,deny=true;
c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')return deny?'User-agent: *\\nDisallow: /':'User-agent: *\\nAllow: /';pageCalls++;return 'page';};
c.robotsAllowsPath=(_rules,path)=>deny&&path==='/'?false:true;
let result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'));
assert.equal(result.status,'Vynecháno podle robots.txt');assert.equal(pageCalls,0);
deny=false;result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'));
assert.equal(result.text,'page');assert.equal(result.robotsStatus,'Ověřeno');assert.equal(pageCalls,1);
c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')throw Error('timeout');pageCalls++;return 'page';};
pageCalls=0;result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');assert.equal(result.status,'Vynecháno — robots.txt nelze ověřit');assert.equal(result.robotsStatus,'robots.txt nelze ověřit; stránka byla vynechána (fail-closed)');assert.equal(pageCalls,0,'a reader timeout must not trigger page requests with unknown robots policy');
c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')throw Error('Čtečka oznámila chybu cílového zdroje (404).');pageCalls++;return 'page';};
result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');assert.equal(result.text,'page');assert.match(result.robotsStatus,/HTTP 404/);assert.match(result.robotsStatus,/lze pokračovat/);
for(const status of ['403']){
 c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')throw Error('Čtečka oznámila chybu cílového zdroje ('+status+').');pageCalls++;return 'page';};
 result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');
 assert.equal(result.text,'page');assert.match(result.robotsStatus,new RegExp('HTTP '+status));assert.match(result.robotsStatus,/lze pokračovat/);
}
for(const status of ['500','503']){
 pageCalls=0;c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')throw Error('Čtečka oznámila chybu cílového zdroje ('+status+').');pageCalls++;return 'page';};
 result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');
 assert.equal(result.status,'Vynecháno — robots.txt dočasně nedostupný');assert.equal(result.robotsStatus,'robots.txt dočasně nedostupný (HTTP '+status+')');assert.equal(pageCalls,0,'pages must not be requested after a target robots 5xx');
}
c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')throw Error('proxy error 404 while retrieving target');pageCalls++;return 'page';};
result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');
assert.equal(result.status,'Vynecháno — robots.txt nelze ověřit','proxy status must not be mistaken for target 404');assert.equal(pageCalls,0);
c.fetchReadablePage=async(_url,path)=>{if(path==='/robots.txt')return 'HTTP 404 Not Found';pageCalls++;return 'page'};pageCalls=0;result=await c.fetchRobotsAwarePage(new URL('https://example.cz/'),'/');assert.equal(result.status,'Vynecháno — robots.txt nelze ověřit','an unverified reader error body is not proof that target robots.txt is absent');assert.equal(pageCalls,0);
console.log('PASS: competitor crawl distinguishes target robots errors from reader failures');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),startScript=html.lastIndexOf('<script>'),script=html.slice(startScript+8,html.indexOf('</script>',startScript));
const start=script.indexOf('function competitorSignalLabel('),end=script.indexOf('const competitorHtml=',start);
assert(start>=0&&end>start,'competitor signal rendering helper exists');
const c={};vm.createContext(c);vm.runInContext(script.slice(start,end)+';this.competitorSignalLabel=competitorSignalLabel;',c);
assert.equal(c.competitorSignalLabel({status:'Nelze načíst',price:false},'price'),'Nelze ověřit');
assert.equal(c.competitorSignalLabel({status:'Vynecháno podle robots.txt',contact:false},'contact'),'Nelze ověřit');
assert.equal(c.competitorSignalLabel({status:'Prověřeno · robots.txt se nepodařilo ověřit',trust:false},'trust'),'Nerozpoznáno ve vzorku');
assert.equal(c.competitorSignalLabel({status:'Prověřeno',price:true},'price'),'Signál nalezen');
console.log('PASS: unavailable competitor pages do not appear to lack business signals');
})();
console.log('PASS: all audit regression suites');
})().catch(error=>{console.error(error);process.exitCode=1;});

;(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const start=script.indexOf('function pageSpeedFinalAddress('),end=script.indexOf('async function fetchReadablePage(',start);
assert(start>=0&&end>start,'PageSpeed final URL helper exists');
const c={};vm.createContext(c);vm.runInContext(script.slice(start,end),c);
assert.equal(c.pageSpeedFinalAddress({finalDisplayedUrl:'https://example.cz/final'}),'https://example.cz/final');
assert.equal(c.pageSpeedFinalAddress({finalDisplayedUrl:'',finalUrl:'https://example.cz/final'}),'https://example.cz/final');
assert.equal(c.pageSpeedFinalAddress({finalUrl:'https://example.cz/final'}),'https://example.cz/final');
assert.equal(c.pageSpeedFinalAddress({finalDisplayedUrl:'   ',finalUrl:'https://example.cz/final'}),'https://example.cz/final');
assert.equal(c.pageSpeedFinalAddress({finalDisplayedUrl:'http://example.cz/final',finalUrl:'https://example.cz/final'}),'http://example.cz/final','present display address remains authoritative');
assert.equal(c.pageSpeedFinalAddress({finalUrl:42}), '');
assert(script.includes('const finalAddress=pageSpeedFinalAddress(lighthouse);'),'HTTP redirect finding consumes final display or final URL');
console.log('PASS: HTTP redirect audit falls back to Lighthouse finalUrl only when finalDisplayedUrl is absent');
})();


(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const start=script.indexOf('function pageInventoryValue('),end=script.indexOf('const pageRows=',start);
assert(start>=0&&end>start,'inventory values use a shared page availability helper');
const c={pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(script.slice(start,end)+';this.pageInventoryValue=pageInventoryValue;',c);
const unavailable={raw:null,state:'Textová čtečka stránku nenačetla'};
for(const key of ['title','h1','words','images','links','externalLinks','inbound'])
 assert.equal(c.pageInventoryValue(unavailable,key),'Nelze ověřit',key+' stays unknown when page was not loaded');
const empty={raw:'',title:'',h1:'',wordCount:0,imageCount:0,missingAltCount:0,links:[],externalLinks:[],inboundLinks:null};
assert.equal(c.pageInventoryValue(empty,'title'),'Titulek nebyl rozpoznán');
assert.equal(c.pageInventoryValue(empty,'h1'),'—');
assert.equal(c.pageInventoryValue(empty,'words'),'0');
assert.equal(c.pageInventoryValue(empty,'images'),'0 / chybí alt: 0');
assert.equal(c.pageInventoryValue(empty,'links'),'0','an empty successfully loaded page has zero links, not unknown');
assert.equal(c.pageInventoryValue(empty,'externalLinks'),'0');
assert.equal(c.pageInventoryValue(empty,'inbound'),'Nezjištěno');
const loaded={raw:'text',title:'Domů',h1:'Nabídka',wordCount:12,imageCount:2,missingAltCount:1,links:['/a'],externalLinks:['https://other.cz'],inboundLinks:3};
assert.equal(c.pageInventoryValue(loaded,'title'),'Domů');
assert.equal(c.pageInventoryValue(loaded,'h1'),'Nabídka');
assert.equal(c.pageInventoryValue(loaded,'images'),'2 / chybí alt: 1');
assert.equal(c.pageInventoryValue(loaded,'links'),'1');
assert.equal(c.pageInventoryValue(loaded,'externalLinks'),'1');
assert.equal(c.pageInventoryValue(loaded,'inbound'),'3');
const rows=script.slice(end,script.indexOf('function competitorSignalLabel(',end));
for(const key of ['title','h1','words','images','links','externalLinks','inbound'])assert(rows.includes("pageInventoryValue(page,'"+key+"')"),'inventory column uses helper: '+key);
console.log('PASS: unavailable page inventory does not claim missing content; empty loaded content retains zero counts');
})();

(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function auditCsvPageValue('),end=html.indexOf('function downloadAuditCsv(',start);
assert(start>=0&&end>start,'CSV-specific availability helpers exist');
const c={pageTextWasFetched:page=>Boolean(page&&page.raw!==null&&page.raw!==undefined)};vm.createContext(c);vm.runInContext(html.slice(start,end)+';this.auditCsvPageValue=auditCsvPageValue;this.auditCsvCompetitorSignal=auditCsvCompetitorSignal;',c);
const unavailable={raw:null,title:'',h1:'',links:null,externalLinks:null,imageCount:undefined};
for(const key of ['title','h1','words','images','links','externalLinks'])assert.equal(c.auditCsvPageValue(unavailable,key),'Nelze ověřit');
const loadedEmpty={raw:'',title:'',h1:'',wordCount:0,imageCount:0,missingAltCount:0,links:[],externalLinks:[]};
assert.equal(c.auditCsvPageValue(loadedEmpty,'title'),'Titulek nebyl rozpoznán');
assert.equal(c.auditCsvPageValue(loadedEmpty,'h1'),'—');
assert.equal(c.auditCsvPageValue(loadedEmpty,'words'),'0');
assert.equal(c.auditCsvPageValue(loadedEmpty,'images'),'0 / chybí alt: 0');
assert.equal(c.auditCsvPageValue(loadedEmpty,'links'),'0');
assert.equal(c.auditCsvPageValue(loadedEmpty,'externalLinks'),'0');
for(const status of ['Nelze načíst','Vynecháno podle robots.txt'])assert.equal(c.auditCsvCompetitorSignal({status,price:false},'price'),'Nelze ověřit');
assert.equal(c.auditCsvCompetitorSignal({status:'Prověřeno · robots.txt se nepodařilo ověřit',contact:false},'contact'),'Nerozpoznáno ve vzorku');
assert.equal(c.auditCsvCompetitorSignal({status:'Prověřeno',trust:true},'trust'),'Signál nalezen');
const csv=html.slice(end,html.indexOf('function auditComparisonScope(',end));
assert(csv.includes("auditCsvPageValue(page,'title')")&&csv.includes("auditCsvPageValue(page,'links')"),'CSV page rows use availability-aware values');
assert(csv.includes("auditCsvCompetitorSignal(item,'price')")&&csv.includes("auditCsvCompetitorSignal(item,'trust')"),'CSV competitor signals use checked samples only');
console.log('PASS: CSV distinguishes unavailable sources from checked absence and valid zero counts');
})();

(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const start=script.indexOf('function pageTextWasFetched('),end=script.indexOf('function auditCsvPageValue(',start);
assert(start>=0&&end>start,'page retrieval status has a shared helper');
const c={};vm.createContext(c);vm.runInContext(script.slice(start,end)+';this.pageTextWasFetched=pageTextWasFetched;',c);
assert.equal(c.pageTextWasFetched(null),false);
assert.equal(c.pageTextWasFetched({}),false);
assert.equal(c.pageTextWasFetched({raw:null}),false);
assert.equal(c.pageTextWasFetched({raw:undefined}),false);
assert.equal(c.pageTextWasFetched({raw:''}),true,'empty text is still a successfully retrieved response');
assert.equal(c.pageTextWasFetched({raw:'text'}),true);
assert(script.includes('const usable=pages.filter(page=>pageTextWasFetched(page)&&page.parsed);'));
assert(script.includes('crawlMeta.scanned=pages.filter(pageTextWasFetched).length;'));
assert(script.includes('const loaded=pages.filter(pageTextWasFetched).length'));
assert(script.includes('pageTextWasFetched(item)?(inbound.get(auditLinkKey(item.url))??0):null'));
assert(!/pages\.filter\(\s*(?:page|item)=>\s*(?:page|item)\.raw\b/.test(script),'page inclusion must not depend on body truthiness');
assert(!/if\(!(?:page|item|pageItem)\.raw\b/.test(script),'empty response body must not count as an unavailable fetch');
console.log('PASS: fetched empty page bodies remain measured rather than being mistaken for failed reads');
})();

;(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),firstClose=html.indexOf('</script>'),scriptStart=html.indexOf('<script>',firstClose+9),script=html.slice(scriptStart+8,html.indexOf('</script>',scriptStart));
const c={areaDefs:[['Technické SEO',10]]};vm.createContext(c);
vm.runInContext(script.slice(script.indexOf('function lighthouseScorePoints('),script.indexOf('function nonnegativeMetric('))+script.slice(script.indexOf('function scoreAuditAreas('),script.indexOf('function renderReport(')),c);
const absent=c.canonicalLighthouseFinding(null,'https://example.cz/');
assert.equal(absent.state,'NELZE OVĚŘIT');assert.equal(absent.points,null);
const manual=c.canonicalLighthouseFinding({score:1,scoreDisplayMode:'manual'},'https://example.cz/');
assert.equal(manual.state,'NELZE OVĚŘIT');assert.equal(manual.points,null);
const found=c.canonicalLighthouseFinding({score:1,scoreDisplayMode:'binary',title:'Canonical URL',displayValue:'https://example.cz/'},'https://example.cz/');
assert.equal(found.state,'SIGNÁL');assert.equal(found.points,null);assert.equal(found.coverageExcluded,true);assert.equal(found.ok,true);
const unrecognized=c.canonicalLighthouseFinding({score:0,scoreDisplayMode:'binary',title:'Canonical URL'},'https://example.cz/');
assert.equal(unrecognized.state,'HYPOTÉZA');assert.equal(unrecognized.points,null);assert.equal(unrecognized.coverageExcluded,true);assert.equal(unrecognized.ok,false);assert.match(unrecognized.detail,/sám o sobě nepotvrzuje SEO chybu/);
assert.equal(c.scoreAuditAreas([found])[0].tests,0);
assert.equal(c.scoreAuditAreas([absent])[0].tests,1);assert.equal(c.scoreAuditAreas([absent])[0].measured,0);
assert.match(script,/findings\.push\(canonicalLighthouseFinding\(audits\.canonical/);
assert.match(script,/\['canonical','is-on-https','no-vulnerable-libraries','csp-xss'\]/);
assert.match(script,/canonical homepage Lighthouse je pouze doplňkový signál/i);
assert.match(script,/HTML hlavičky pro canonical\/hreflang byly samostatně načteny/i);
assert.match(script,/const ruleVersion='2026-11-11\.160'/);
console.log('PASS: canonical Lighthouse signal is scoreless, contextual, and unverified when missing or unscored');
})();

(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const c={URL,pageTextWasFetched:p=>p.raw!=null};vm.createContext(c);
vm.runInContext(html.slice(html.indexOf('function auditLinkKey('),html.indexOf('function buildLinkGraphHtml(')),c);
const pages=[{url:'https://example.cz/',raw:'ok',links:['https://example.cz/product?id=1&utm_source=test#x','https://example.cz/product?id=1&fbclid=test','https://example.cz/product?id=2']},{url:'https://example.cz/product?id=1',raw:'ok',links:['https://example.cz/product?id=1&utm_medium=self']},{url:'https://example.cz/product?id=2',raw:null,links:['https://example.cz/product?id=1']}];
const counts=c.buildInboundLinks(pages);
assert.equal(counts.get('https://example.cz/product?id=1'),1,'tracking variants deduplicate and self/unavailable sources do not count');
assert(!counts.has('https://example.cz/product?id=2'),'unavailable target stays unmeasured');
assert.notEqual(c.auditLinkKey('https://example.cz/a'),c.auditLinkKey('https://example.cz/a/'));
assert.notEqual(c.auditLinkKey('https://example.cz/product?id=1'),c.auditLinkKey('https://example.cz/product?id=2'));
assert.equal(c.auditLinkKey('https://example.cz/a?UTM_Source=x&gclid=y#z'),'https://example.cz/a');
console.log('PASS: inbound link identity matches crawl tracking normalization without merging functional URLs');
})();


(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8'),c={URL};vm.createContext(c);
vm.runInContext(html.slice(html.indexOf('function parsePageText('),html.indexOf('function decodeSitemapLoc(')),c);
const parse=text=>c.parsePageText(text,new URL('https://example.cz/'));
for(const text of [String.raw`\[fake](/fake)`,String.raw`[fake\](/fake)`,String.raw`!\[fake](/fake.png)`]){assert.equal(parse(text).links.length,0);assert.equal(parse(text).images.length,0);}
assert.equal(parse(String.raw`\![real](/real)`).links[0],'https://example.cz/real');
assert.equal(parse(String.raw`\![real](/real)`).images.length,0);
assert.equal(parse(String.raw`\\[real](/real)`).links[0],'https://example.cz/real');
assert.equal(parse(String.raw`\\![real](/real.png)`).images[0].url,'https://example.cz/real.png');
assert.equal(parse(String.raw`[![alt](/image.png)](/target)`).links[0],'https://example.cz/target');
console.log('PASS: escaped Markdown delimiters respect backslash parity without false links or images');
})();

;(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const c={URL,window:{},trackPageSpeed:p=>p,isPageSpeedQuotaError:e=>/quota/i.test(e.message)};vm.createContext(c);
vm.runInContext(html.slice(html.indexOf('function assertPageSpeedResult('),html.indexOf('function pageSpeedFinalAddress('))+html.slice(html.indexOf('function isSameSiteHost('),html.indexOf('function decodeSitemapLoc('))+html.slice(html.indexOf('function withPageSpeedProvenance('),html.indexOf('async function queryDns(')),c);
const url=new URL('https://example.cz/');
const payload={lighthouseResult:{configSettings:{emulatedFormFactor:'desktop'},requestedUrl:url.href,finalUrl:url.href,audits:{}}};
let requests=0,reads=0,completed=0;
c.queryPageSpeed=async()=>{requests++;throw Error('quota exceeded')};c.trackPageSpeed=p=>p.finally(()=>completed++);
c.window.WebaoPsiCache={read:()=>{reads++;return{payload}}};
let result=await c.queryPageSpeedStrategies(url,true);
assert.equal(requests,1);assert.equal(result[0].status,'rejected');assert.equal(result[1].status,'fulfilled');assert.equal(result[1].value.lighthouseResult,payload.lighthouseResult);assert.equal(result[1].value.webaoMeasurement.source,'cache');assert.equal(completed,2,'cached device completes progress tracking');
requests=0;reads=0;result=await c.queryPageSpeedStrategies(url,false);assert.equal(requests,0);assert.equal(reads,0,'robots exclusion does not read or reuse cached results');assert(result.every(x=>x.status==='rejected'));
for(const invalid of [null,{payload:{lighthouseResult:{...payload.lighthouseResult,configSettings:{emulatedFormFactor:'mobile'}}}},{payload:{lighthouseResult:{...payload.lighthouseResult,finalUrl:'https://other.cz/'}}},{payload:{lighthouseResult:{...payload.lighthouseResult,runtimeError:{code:'FAILED'}}}}]){
 c.window.WebaoPsiCache.read=()=>invalid;requests=0;result=await c.queryPageSpeedStrategies(url,true);assert.equal(requests,1);assert.equal(result[1].status,'rejected','invalid cache cannot bypass quota with unverified data');
}
c.window.WebaoPsiCache.read=()=>{throw Error('storage blocked')};assert.equal(c.readCachedPageSpeed(url,'desktop'),null);result=await c.queryPageSpeedStrategies(url,true);assert.equal(result[1].status,'rejected');
console.log('PASS: quota preserves validated cached device results without new requests or robots bypass');
})().catch(error=>{console.error(error);process.exitCode=1});
(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8'),c={URL};vm.createContext(c);
vm.runInContext(html.slice(html.indexOf('function parsePageText('),html.indexOf('function decodeSitemapLoc(')),c);
const parse=text=>c.parsePageText(text,new URL('https://example.cz/'));
for(const suffix of [' "Popis odkazu"'," 'Popis odkazu'",' (Popis odkazu)',' ""','\n "Více informací"','   ']){
 const page=parse('[stránka](/cil'+suffix+') ![Fotografie](/foto.png'+suffix+')');
 assert.equal(page.links[0],'https://example.cz/cil',suffix);assert.equal(page.images[0].url,'https://example.cz/foto.png',suffix);
 assert.equal(page.links.length,1);assert.equal(page.images.length,1);
}
assert.equal(parse('[odkaz](</cesta se slovy> "Popis")').links[0],'https://example.cz/cesta%20se%20slovy');
assert.equal(parse('[odkaz]( /cesta(a) "Popis")').links[0],'https://example.cz/cesta(a)');
assert.equal(parse(String.raw`[odkaz](/cil "Titulek s \"uvozovkami\"")`).links[0],'https://example.cz/cil');
assert.equal(parse('[![Fotografie](/foto.png "Obrázek")](/cil "Stránka")').links[0],'https://example.cz/cil');
assert.equal(parse('[externí](https://outside.cz/ "Popis")').externalLinks[0],'https://outside.cz/');
for(const text of ['[x](/cil "nedokončený)','[x](/cil cizí text)','[x](</cil>"bez mezery")','[x](/cil "popis" odpad)','[x](/cil (vnořený (titulek)))','![x](/foto.png "nedokončený)']){
 assert.equal(parse(text).links.length,0,text);assert.equal(parse(text).images.length,0,text);
}
console.log('PASS: Markdown link and image titles preserve valid destinations and reject incomplete syntax');
})();

(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const html=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8');
const ns='http://www.sitemaps.org/schemas/sitemap/0.9';
let root=null,broken=false,parses=0;
const c={URL,DOMParser:class{parseFromString(){parses++;return{documentElement:root,querySelector:()=>broken?{}:null}}}};
vm.createContext(c);vm.runInContext(html.slice(html.indexOf('function decodeSitemapLoc('),html.indexOf('function extractPublicContacts(')),c);
for(const [name,namespace,valid] of [['urlset',ns,true],['sitemapindex',ns,true],['urlset',null,true],['urlset','urn:foreign',false],['sitemapindex','urn:foreign',false],['html',ns,false]]){
 root={localName:name,namespaceURI:namespace,children:[]};
 assert.equal(Boolean(c.parseSitemapXml('<'+name+' sample="'+String(namespace)+'"/>')),valid,name+' '+namespace);
}
root={localName:'urlset',namespaceURI:ns,children:[]};broken=true;
assert.equal(c.parseSitemapXml('<urlset broken>'),null);broken=false;
const loc=(text,children=[],namespaceURI=ns)=>({localName:'loc',namespaceURI,children,textContent:text});
root={localName:'urlset',namespaceURI:ns,children:[{localName:'url',namespaceURI:ns,children:[loc('https://example.cz/fabricated',[{}]),loc('https://example.cz/image.jpg',[],'urn:image'),loc('https://example.cz/real?a=1&b=2')]}]};
const xml='<urlset fixture="leaf-only"/>';
assert.deepEqual(Array.from(c.sitemapUrlCandidates(xml)),['https://example.cz/real?a=1&b=2']);
const before=parses;c.sitemapUrlCandidates(xml);assert.equal(parses,before,'repeated extraction retains bounded one-document cache');
console.log('PASS: sitemap namespace validation rejects foreign or broken roots and nested loc markup without losing text URLs');
})();

(async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const c={window:{},URL,Date,esc:v=>String(v),pageTextWasFetched:p=>p.raw!=null,dnsResultAvailable:()=>false,isPageSpeedQuotaError:()=>false,pageSpeedErrorMessage:e=>String(e.message||e)};vm.createContext(c);
vm.runInContext(html.slice(html.indexOf('function withPageSpeedProvenance('),html.indexOf('async function queryDns('))+html.slice(html.indexOf('function pageSpeedProvenanceDetail('),html.indexOf('function scoreAuditAreas(')),c);
const measured='2026-01-01T10:00:00.000Z',saved=Date.parse('2026-01-01T11:00:00Z');
const payload={lighthouseResult:{fetchTime:measured},webaoMeasurement:{source:'forged'}};
const cached=c.withPageSpeedProvenance(payload,'cache',saved),live=c.withPageSpeedProvenance(payload,'network');
assert.equal(cached.webaoMeasurement.measuredAt,measured);assert.equal(cached.webaoMeasurement.savedAt,new Date(saved).toISOString());assert.equal(cached.webaoMeasurement.source,'cache');assert.equal(payload.webaoMeasurement.source,'forged','source payload remains unchanged');
assert.equal(live.webaoMeasurement.source,'network');assert.equal(live.webaoMeasurement.savedAt,null);
for(const bad of [undefined,'not a date',Date.now()+86400000])assert.equal(c.withPageSpeedProvenance({lighthouseResult:{fetchTime:bad}},'cache',bad).webaoMeasurement.measuredAt,null);
const sources=c.measurementSourceStatuses({pageSpeedResults:[{status:'fulfilled',value:cached},{status:'fulfilled',value:live}]});
const source=sources.find(x=>x.name==='PageSpeed — mobil a desktop');assert.match(source.detail,/Mobil: uložený výsledek/);assert.match(source.detail,/Nejde o nové měření/);assert(source.detail.includes(measured));assert.match(source.detail,/Desktop: odpověď PageSpeed v tomto běhu/);
assert(c.buildSourceAvailabilityHtml({sourceStatuses:sources}).includes(source.detail),'screen and print source table preserve provenance');
let csvBlob;
c.window.currentAuditData={host:'example.cz',score:null,coverage:0,findings:[],pages:[],checkedAt:'now',crawlMeta:{sourceStatuses:sources}};
c.loadLocalFindingWork=()=>({});c.auditLinkKey=v=>v;c.setTimeout=fn=>fn();c.Blob=Blob;c.URL={createObjectURL:blob=>{csvBlob=blob;return 'blob:fixture'},revokeObjectURL:()=>{}};c.document={createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
vm.runInContext(html.slice(html.indexOf('function downloadAuditCsv('),html.indexOf('function auditComparisonScope(')),c);c.downloadAuditCsv();
const csv=await csvBlob.text();assert(csv.includes(source.detail),'CSV preserves the same provenance as the report');
console.log('PASS: PageSpeed provenance distinguishes cached and retrieved data, retains measurement time and survives report/CSV export');
})().catch(e=>{console.error(e);process.exitCode=1});

(()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const storage=new Map(),now=Date.now();
const c={window:{localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}}};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(__dirname,'../psi-cache.js'),'utf8'),c);
const key='webao:psi:v1:mobile:https://example.cz/',payload={lighthouseResult:{}};
for(const savedAt of [null,'today',0,now+86400000,now-7*3600000]){storage.set(key,JSON.stringify({savedAt,payload}));assert.equal(c.window.WebaoPsiCache.read('https://example.cz/','mobile'),null,String(savedAt));}
storage.set(key,JSON.stringify({savedAt:now-1000,payload}));assert(c.window.WebaoPsiCache.read('https://example.cz/','mobile'));
assert(c.window.WebaoPsiCache.write('https://example.cz/','mobile',payload));assert(c.window.WebaoPsiCache.read('https://example.cz/','mobile'));
console.log('PASS: PageSpeed cache rejects future, expired and malformed timestamps while retaining valid results');
})();
