// Run with: node audit/tests/regression.cjs
(async()=>{
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={localStorage:{getItem:()=>JSON.stringify([{checkedAt:'old',score:50}]),setItem:()=>{throw Error('quota')}}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function saveLocalAuditHistory('),s.indexOf('function clearLocalAuditHistory(')),c);let h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert.equal(h.length,2);assert.equal(h[1].score,50);assert.match(h.storageWarning,/nepodařilo/);c.localStorage.getItem=()=>'{bad';h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert.equal(h.length,1);assert.match(h.storageWarning,/nepodařilo/);c.localStorage.setItem=()=>{};h=c.saveLocalAuditHistory('example.cz',{checkedAt:'new',score:100});assert(!h.storageWarning);console.log('PASS: history survives write failures and malformed storage');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);
const c={URL,TextEncoder};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('async function queryPageSpeedStrategies('),s.indexOf('async function queryDns('))+s.slice(s.indexOf('function isSameSiteHost('),s.indexOf('function extractPublicContacts('))+s.slice(s.indexOf('function normalizeRobotsPath('),s.indexOf('function pageType(')),c);
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
const c={localStorage:{getItem:()=>raw,setItem:(_,v)=>{written=v}}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function loadLocalFindingWork('),s.indexOf('function renderFindingWorkControls(')),c);
assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,2);assert.equal(c.loadLocalFindingWork('x').d.status,'Nový');assert.equal(c.loadLocalFindingWork('x').d.note,'');assert(c.saveLocalFindingWork('x','f','note','new'));assert.equal(JSON.parse(written).f.note,'new');assert(!c.saveLocalFindingWork('x','f','oops','new'));
raw='[]';assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,0);raw='{bad';assert.equal(Object.keys(c.loadLocalFindingWork('x')).length,0);
c.localStorage.setItem=()=>{throw Error('quota')};assert(!c.saveLocalFindingWork('x','f','note','new'));
// Execute the real export and capture every CSV row, including range notes.
let blob;const rowData={host:'example.cz',pages:[],areas:[],findings:[],coverage:20,score:100,crawlMeta:{note:'range note',excludedUrlExamples:[{url:'https://example.cz/x',source:'test'}]}};
c.window={currentAuditData:rowData};c.Blob=class{constructor(parts){blob=parts[0]}};c.URL={createObjectURL:()=> 'blob:stub',revokeObjectURL:()=>{}};c.document={createElement:()=>({click(){}})};c.setTimeout=()=>{};
vm.runInContext(s.slice(s.indexOf('function downloadAuditCsv('),s.indexOf('function auditComparisonScope(')),c);c.downloadAuditCsv();
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
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={URL};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function parsePageText('),s.indexOf('function decodeSitemapLoc(')),c);
const page=c.parsePageText('Title: Test\n# Main\n[Contact](/contact) [Relative](child) [WWW](https://www.example.cz/a) [Outside](https://other.cz/) ![Alt](/picture.png) [Picture](/picture.png) [![Logo](/logo.png)](/home) [Anchor](#part) [Mail](mailto:a@example.cz) [Bad](javascript:alert) [Auth](https://user:pw@example.cz/a)',new URL('https://example.cz/path/'));
assert.equal(page.links.length,5);assert(page.links.includes('https://example.cz/contact'));assert(page.links.includes('https://example.cz/path/child'));assert(page.links.includes('https://www.example.cz/a'));assert(page.links.includes('https://example.cz/picture.png'));assert(page.links.includes('https://example.cz/home'));assert.equal(page.externalLinks.length,1);assert.equal(page.images.length,2);assert.equal(page.images[0].alt,'Alt');assert(!page.links.some(x=>/mailto:|javascript:|user:|#/.test(x)));
console.log('PASS: 10 page extraction assertions');

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
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function auditComparisonScope('),s.indexOf('function saveLocalAuditHistory(')),c);
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
console.log('PASS: JavaScript syntax and 9 sitemap regression cases');
for(const candidate of ['ftp://example.cz/a','https://user:password@example.cz/a','https://example.cz:8443/a'])assert.equal(context.normalizeCrawlUrl(candidate,new URL('https://example.cz/')),'');
console.log('PASS: 3 unsupported crawl URL cases');

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];new vm.Script(s);const c={URL,setTimeout};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function assertReadableSource('),s.indexOf('async function fetchReadablePage('))+s.slice(s.indexOf('async function fetchReadablePage('),s.indexOf('async function fetchRobotsAwarePage('))+s.slice(s.indexOf('async function queryPageSpeed('),s.indexOf('async function queryPageSpeedStrategies(')),c);
assert.throws(()=>c.assertReadableSource('   '));assert.throws(()=>c.assertReadableSource('Title: Missing\nWarning: Target URL returned error 404: Not found\nMarkdown Content:\nError'),/404/);
assert.throws(()=>c.assertReadableSource('Warning: Target URL returned error 503: unavailable'),/503/);
const article='Title: Article\nMarkdown Content:\nWarning: Target URL returned error 404: example from documentation';assert.equal(c.assertReadableSource(article),article);
assert.equal(c.assertReadableSource('User-agent: *\nDisallow: /private'),'User-agent: *\nDisallow: /private');
assert.throws(()=>c.assertPageSpeedResult({}));assert.throws(()=>c.assertPageSpeedResult({lighthouseResult:{runtimeError:{code:'NO_FCP',message:'No paint'}}}),/NO_FCP/);assert(c.assertPageSpeedResult({lighthouseResult:{categories:{}}}));
await (async()=>{let calls=0;c.fetchTimed=async()=>{calls++;return{ok:true}};c.readTimedResponse=async()=> 'Title: Missing\nWarning: Target URL returned error 404: Not found';await assert.rejects(()=>c.fetchReadablePage(new URL('https://example.cz/')),/404/);assert.equal(calls,1);
calls=0;c.readTimedResponse=async()=>({lighthouseResult:{runtimeError:{code:'NO_FCP'}}});c.isPageSpeedQuotaError=()=>false;await assert.rejects(()=>c.queryPageSpeed(new URL('https://example.cz/'),'mobile'),/NO_FCP/);assert.equal(calls,1);console.log('PASS: reader wrapper errors, article false positives and Lighthouse runtime failures');})();

})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function advice('),s.indexOf('function buildDetektiv(')),c);
for(const name of ['Meta description','Hlavní nadpis H1','Hlavní nadpis podstránky','Titulek stránky'])assert.match(c.advice({name,points:null}),/Nejprve ověřte/);
assert.match(c.advice({name:'PageSpeed Insights — mobil',points:null}),/kvóty/);assert.match(c.advice({name:'HTTP varianta přesměrování',points:null}),/Konfiguraci měňte až/);assert.match(c.advice({name:'MDN HTTP Observatory',points:null}),/zaškrtněte/);assert.equal(c.advice({name:'Meta description',points:null,action:'Specific action'}),'Specific action');
console.log('PASS: unverified results recommend verification before changes');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function auditLinkKey('),s.indexOf('function isPriorityFinding(')),c);c.esc=x=>String(x);c.arrayJoin=(value,separator)=>value.join(separator);
const pages=[{url:'https://example.cz/a',title:'No slash',raw:'ok',links:['https://example.cz/a#self','https://example.cz/a/','https://example.cz/a/']},{url:'https://example.cz/a/',title:'Slash',raw:'ok',links:['https://example.cz/a/']},{url:'https://example.cz/failed',raw:null,links:['https://example.cz/a']}];
assert.notEqual(c.auditLinkKey(pages[0].url),c.auditLinkKey(pages[1].url));assert.equal(c.auditLinkKey('https://example.cz'),c.auditLinkKey('https://example.cz/'));assert.equal(c.auditLinkKey(pages[0].url+'#x'),pages[0].url);
const inbound=c.buildInboundLinks(pages);assert.equal(inbound.get(pages[0].url),0);assert.equal(inbound.get(pages[1].url),1);assert(!inbound.has('https://example.cz/failed'));const html=c.buildLinkGraphHtml(pages);assert(html.includes('Slash — https://example.cz/a/'));assert(html.includes('Odkazy stránky na sebe samu jsou vynechány'));
console.log('PASS: distinct trailing-slash URLs, self-links, duplicate links and failed-page exclusion');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function findingKind('),s.indexOf('function printAuditReport('))+s.slice(s.indexOf('function buildCoverageHtml('),s.indexOf('function buildSkippedUrlsHtml(')),c);c.esc=x=>String(x);c.arrayJoin=(a,sep)=>a.join(sep);c.coverageLimitations={};vm.runInContext('const coverageLimitations={}',c);
assert.equal(c.findingKind({state:'NEPROVEDENO',points:null}),'Neprovedeno');assert.equal(c.findingKind({state:'NELZE OVĚŘIT',points:null}),'Nelze ověřit');
const html=c.buildCoverageHtml([{name:'Test'}],[{area:'Test',name:'Optional scan',state:'NEPROVEDENO',points:null}]);assert(html.includes('0 signálů bez skóre'));assert(html.includes('0 neověřeno · 1 neprovedeno'));assert(html.includes('Neprovedeno'));
console.log('PASS: skipped optional checks remain distinct from unavailable measurements');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function parsePageText('),s.indexOf('function decodeSitemapLoc(')),c);
const text='Title: Real title\nMarkdown Content:\nMain heading\n============\n\nDescription: article text, not metadata\n```md\n# Fake H1\n[Fake link](/fake)\n![Fake image](/fake.png)\nTODO\n```\n[Real link](/real)\n# Hash heading #\n## Subheading\n';const page=c.parsePageText(text,new URL('https://example.cz/'));
assert.equal(page.title,'Real title');assert.equal(page.description,'');assert(page.body.includes('Description: article text'));assert.equal(page.h1s.length,2);assert.equal(page.h1s[0],'Main heading');assert.equal(page.h1s[1],'Hash heading');assert.equal(page.links.length,1);assert.equal(page.links[0],'https://example.cz/real');assert.equal(page.images.length,0);assert(!page.body.includes('TODO'));
assert.equal(c.parsePageText('Title: A\rH1: Heading',new URL('https://example.cz/')).h1s[0],'Heading');assert.equal(c.stripMarkdownCode('~~~js\n# fake\n~~~\n# Real').trim(),'# Real');assert.equal(c.stripMarkdownCode('````\n```\n# fake\n````\n# Real').trim(),'# Real');
console.log('PASS: Setext H1, metadata boundaries, CR lines and fenced-code false positives');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];let removed='',errorCount=0;const section={innerHTML:'history',querySelector:()=>errorCount?{}:null,insertAdjacentHTML:()=>{errorCount++}};const c={out:{querySelector:()=>section},location:{reload(){throw Error('Unexpected reload')}},localStorage:{removeItem:key=>{removed=key}}};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function clearLocalAuditHistory('),s.indexOf('function loadLocalFindingWork(')),c);assert(c.clearLocalAuditHistory('example.cz'));assert.equal(removed,'webao-audit-history:example.cz');assert.match(section.innerHTML,/Aktuální report zůstává/);c.localStorage.removeItem=()=>{throw Error('blocked')};assert(!c.clearLocalAuditHistory('example.cz'));assert(!c.clearLocalAuditHistory('example.cz'));assert.equal(errorCount,1);
console.log('PASS: clearing local history preserves the current report and reports failures');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,console,document:{querySelector:()=>({})},window:{}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
const good=(Answer=[])=>({status:'fulfilled',value:{Status:0,Answer}}),bad={status:'rejected',reason:new Error('timeout')};const results=Array.from({length:14},()=>good());results[0]=good([{type:15,data:'10 mail.example.cz.'}]);results[1]=good([{type:16,data:'"v=spf1 -all"'}]);results[3]=good([{type:1,data:'192.0.2.1'}]);results[6]=good([{type:2,data:'ns.example.cz.'}]);results[5]=bad;
const run=responses=>{c.dnsResults=responses;c.findings=[];c.dnsDomain='example.cz';c.dkimSelectors=['google','selector1','selector2','default','k1','mail'];vm.runInContext('{'+s.slice(s.indexOf('  const dnsOk='),s.indexOf('  const pageSpeedRecommendations='))+'}',c);return c.findings};
let f=run(results);assert.equal(f.find(x=>x.name==='SPF záznam').points,100);assert.equal(f.find(x=>x.name==='Nameservery (NS)').points,100);assert.equal(f.find(x=>x.name==='CAA záznamy').state,'NELZE OVĚŘIT');assert.match(f.find(x=>x.name==='MX záznamy').detail,/1 veřejných MX/);
const aaaaDown=[...results];aaaaDown[4]=bad;f=run(aaaaDown);assert.equal(f.find(x=>x.name==='DNS adresa webu (A / AAAA)').points,100);
const txtDown=[...results];txtDown[1]=bad;f=run(txtDown);assert.equal(f.find(x=>x.name==='SPF záznam').points,null);assert.equal(f.find(x=>x.name==='Nameservery (NS)').points,100);
const servfail=[...results];servfail[6]={status:'fulfilled',value:{Status:2}};f=run(servfail);assert.equal(f.find(x=>x.name==='Nameservery (NS)').state,'NELZE OVĚŘIT');assert.equal(f.find(x=>x.name==='SPF záznam').points,100);
f=run(Array.from({length:14},()=>bad));assert(f.some(x=>x.name==='DNS záznamy'&&x.points===null));
const dkimOnly=Array.from({length:14},()=>bad);dkimOnly[8]=good([{type:16,data:'v=DKIM1; p=ABC'}]);f=run(dkimOnly);assert.match(f.find(x=>x.name==='DKIM (běžné selektory)').detail,/kandidátů/);
console.log('PASS: actual DNS evaluation preserves independent successes and masks failed dependencies');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder,console,document:{querySelector:()=>({})},window:{}};vm.createContext(c);vm.runInContext(s.slice(0,s.indexOf("form.addEventListener('submit'")),c);
for(const score of [-1,1.1,NaN,Infinity,null,'1'])assert.equal(c.lighthouseScorePoints(score),null);assert.equal(c.lighthouseScorePoints(0),0);assert.equal(c.lighthouseScorePoints(1),100);
for(const scoreDisplayMode of ['manual','notApplicable','informative','error'])assert(!c.lighthouseAuditScored({score:1,scoreDisplayMode}));assert(c.lighthouseAuditScored({score:0,scoreDisplayMode:'binary'}));
const metrics={LARGEST_CONTENTFUL_PAINT_MS:{percentile:-1},CUMULATIVE_LAYOUT_SHIFT_SCORE:{percentile:-1},INTERACTION_TO_NEXT_PAINT:{percentile:-1}};
const payload={lighthouseResult:{categories:{performance:{score:1.8},accessibility:{score:1},seo:{score:0.75}},audits:{viewport:{score:1,scoreDisplayMode:'notApplicable',title:'viewport'},'tap-targets':{score:-1,title:'targets'},'content-width':{score:0,title:'width'},'csp-xss':{score:1,scoreDisplayMode:'error',title:'CSP'}}},loadingExperience:{metrics}};
c.pageSpeedResults=[{status:'fulfilled',value:payload}];c.findings=[];c.url=new URL('https://example.cz/');vm.runInContext('{'+s.slice(s.indexOf('  const pageSpeedRecommendations='),s.indexOf('  const titleGroups='))+'}',c);const f=c.findings;
assert(!f.some(x=>x.name==='Lighthouse mobil — viewport'));assert(!f.some(x=>x.name==='Lighthouse mobil — targets'));assert.equal(f.find(x=>x.name==='Lighthouse mobil — width').points,0);assert.equal(f.find(x=>x.name==='PageSpeed Insights — výkon (mobil)').points,null);assert.equal(f.find(x=>x.name==='PageSpeed Insights — přístupnost (mobil)').points,100);assert.equal(f.find(x=>x.name==='PageSpeed Insights — SEO (mobil)').points,75);assert.equal(f.find(x=>x.name.startsWith('Terénní Core Web Vitals')).points,null);assert(f.filter(x=>Number.isFinite(x.points)).every(x=>x.points>=0&&x.points<=100));
console.log('PASS: actual Lighthouse evaluation excludes unscored modes, out-of-range scores and invalid field metrics');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];let submit;const out={style:{},innerHTML:''};const form={addEventListener:(event,handler)=>{submit=handler}};const c={URL,TextEncoder,console,window:{currentAuditData:{host:'previous.cz'},currentAuditScreenshots:['old'],currentAuditScenarios:['old']},document:{querySelector:selector=>selector==='#audit-form'?form:selector==='#result'?out:{value:selector==='#domain'?'invalid':selector==='#pageLimit'?'6':''}}};vm.createContext(c);vm.runInContext(s,c);
vm.runInContext('pageSpeedChecksCompleted=7',c);await submit({preventDefault(){}});assert.equal(c.window.currentAuditData,null);assert.equal(c.window.currentAuditScreenshots.length,0);assert.equal(c.window.currentAuditScenarios.length,0);assert.equal(vm.runInContext('pageSpeedChecksCompleted',c),0);assert.match(out.innerHTML,/Zkontrolujte adresu/);assert(!s.includes("'/4 měření dokončeno"));
console.log('PASS: real submit handler resets counters and clears stale exports even for invalid input');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];let calls=[];
const c={URL,fetchTimed:async target=>{calls.push(target);return{ok:true,status:200}},readTimedResponse:async()=> 'Title: real\nMarkdown Content:\n# Real'};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function assertReadableSource('),s.indexOf('function lighthouseScorePoints('))+s.slice(s.indexOf('async function fetchReadablePage('),s.indexOf('async function fetchRobotsAwarePage('))+s.slice(s.indexOf('function normalize('),s.indexOf('function arrayJoin(')),c);
assert.equal(c.normalize('HTTPS://EXAMPLE.CZ/a').href,'https://example.cz/a');assert.equal(c.normalize('HTTP://EXAMPLE.CZ/a').href,'http://example.cz/a');
await c.fetchReadablePage(new URL('https://example.cz/'),'/a?x=1&y=2');assert.equal(calls.pop(),'https://r.jina.ai/https://example.cz/a?x=1&y=2');
await c.fetchReadablePage(new URL('http://example.cz/'),'/a');assert.equal(calls.pop(),'https://r.jina.ai/http://example.cz/a');
for(const path of ['//outside.cz/a','https://outside.cz/a','http://example.cz/a'])await assert.rejects(()=>c.fetchReadablePage(new URL('https://example.cz/'),path),/požadovaný původ/);assert.equal(calls.length,0);
c.fetchTimed=async target=>{calls.push(target);throw Error('TLS unavailable')};await assert.rejects(()=>c.fetchReadablePage(new URL('https://example.cz/'),'/robots.txt'),/TLS unavailable/);assert.equal(calls.length,1);assert(!calls[0].includes('/http://'));
calls=[];c.fetchTimed=async target=>{calls.push(target);return{ok:false,status:503}};await assert.rejects(()=>c.fetchReadablePage(new URL('https://example.cz/'),'/'),/503/);assert.equal(calls.length,1);
console.log('PASS: reader preserves requested origin, protocol and query without silent HTTP fallback; input schemes are case insensitive');
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
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];const c={URL,TextEncoder};vm.createContext(c);vm.runInContext(s.slice(s.indexOf('function isSameSiteHost('),s.indexOf('function extractPublicContacts('))+s.slice(s.indexOf('function normalizeRobotsPath('),s.indexOf('function pageType(')),c);
const base=new URL('https://example.cz/');
for(const candidate of ['http://example.cz/a','https://www.example.cz/a','https://shop.example.cz/a','https://cz/a','https://outside.cz/a'])assert.equal(c.normalizeCrawlUrl(candidate,base),'');
assert.equal(c.normalizeCrawlUrl('/a?x=1#part',base),'https://example.cz/a?x=1');assert.equal(c.normalizeCrawlUrl('http://example.cz/a',new URL('http://example.cz/')),'http://example.cz/a');
const links=c.discoverPageLinks([{url:base.href,raw:'ok',links:['/allowed','https://shop.example.cz/private','http://example.cz/other']}],base,()=>false,'User-agent: *\nDisallow: /private');assert.equal(links.length,1);assert.equal(links[0].url,'https://example.cz/allowed');
const xml='<urlset><loc>https://example.cz/a</loc><loc>https://shop.example.cz/private</loc><loc>http://example.cz/other</loc></urlset>';assert.deepEqual(Array.from(c.getSitemapUrls(xml,'example.cz')),['https://example.cz/a']);
assert.equal(c.getSitemapLocations('Sitemap: https://shop.example.cz/sitemap.xml','example.cz').length,0);assert.equal(c.normalizeCrawlUrl('https://example.cz/a',new URL('https://shop.example.cz/')),'');
console.log('PASS: crawls, sitemap discovery and link inventories stay on the audited origin without borrowing robots rules or rewriting protocols');
})();
await (async()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');const s=fs.readFileSync(require('path').join(__dirname,'../index.html'),'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
for(const {failHome,failRobots,blockHome,success,deepFailure} of [{failHome:true},{},{failRobots:true},{blockHome:true},{success:true},{deepFailure:true}]){
let submit,report;const errors=[];const element={value:'',checked:false,disabled:false,style:{},setAttribute(){},removeAttribute(){},scrollIntoView(){},querySelector(){return element},querySelectorAll(){return[]}};
const out={...element,innerHTML:''},button={...element};const form={...element,addEventListener:(name,handler)=>{submit=handler},querySelector:()=>button};
const c={URL,TextEncoder,setTimeout,clearTimeout,setInterval,clearInterval,console:{log(){},error:(...args)=>errors.push(args)},window:{},document:{querySelector:selector=>selector==='#audit-form'?form:selector==='#result'?out:selector==='#domain'?{value:'https://example.cz'}:selector==='#pageLimit'?{value:'6'}:element}};
vm.createContext(c);vm.runInContext(s,c);
c.fetchReadablePage=async(url,path)=>{if(path==='/robots.txt'){if(failRobots)throw Error('robots unavailable');return blockHome?'User-agent: *\nDisallow: /$':'User-agent: *\nAllow: /'};if(path==='/sitemap.xml')return '<urlset><loc>https://example.cz/child</loc></urlset>';if(path==='/grandchild'||path==='/child'&&!success&&!deepFailure||failHome&&path==='/')throw Error('Reader unavailable');if(success&&path==='/')return 'Title: A sufficiently long title\nMarkdown Content:\n# Welcome\n`TODO` [doplnit]\n![Descriptive alt](/info.png) ![](/decoration.png)';if(path==='/child'&&deepFailure)return 'Title: Child page title\nMarkdown Content:\n# Child\n[grandchild](/grandchild)';return 'Title: A sufficiently long title\nMarkdown Content:\n# Welcome\n[child](/child)';};
c.queryDns=async()=>({Status:0,Answer:[]});c.queryRdap=async()=>{if(failHome)return{events:{}};if(success)return{events:[{eventAction:'expiration',eventDate:'not a date'}]};throw Error('Registry unavailable')};c.queryPageSpeedStrategies=async()=>[{status:'rejected',reason:Error('quota exceeded')}];c.getReportBranding=async()=>({});const render=c.renderReport;c.renderReport=(host,findings,pages,meta)=>{render(host,findings,pages,meta);report={host,findings,pages,meta}};
await submit({preventDefault(){}});assert.equal(errors.length,0);assert(report,'Audit must reach report despite reader failures');assert.equal(report.host,'example.cz');assert.equal(report.findings.filter(x=>x.name==='Veřejná čtečka stránku neověřila').length,failHome?2:success?0:1);assert(report.findings.some(x=>x.area==='DNS a e-mail'));assert.match(out.innerHTML,/Detailní nálezy/);assert.equal(c.window.currentAuditData.host,'example.cz');assert.equal(button.disabled,false);assert.equal(vm.runInContext('auditInProgress',c),false);if(failRobots){const access=report.findings.find(x=>x.name==='Přístup homepage podle robots.txt');assert.equal(access.points,null);assert.equal(access.state,'NELZE OVĚŘIT');assert.match(access.detail,/nelze ověřit/);assert(!access.ok)}if(blockHome)assert(report.pages.some(x=>x.state==='Vynecháno podle robots.txt'));if(deepFailure)assert(report.pages.some(x=>x.url==='https://example.cz/grandchild'&&x.loadError));if(success){const alt=report.findings.find(x=>x.name==='Alternativní texty obrázků');assert(alt);assert.equal(alt.points,null);assert.equal(alt.state,'K PROVĚŘENÍ');assert.match(alt.detail,/dekorativní/);const expiry=report.findings.find(x=>x.name==='Expirace domény');assert.equal(expiry.points,null);assert(!expiry.detail.includes('NaN'));const placeholder=report.findings.find(x=>x.name==='Nedoplněný zástupný text');assert(placeholder);assert.equal(placeholder.points,null);assert.equal(placeholder.state,'HYPOTÉZA');assert.equal(placeholder.evidence,'[doplnit]')}
}
console.log('PASS: six complete audit/report flows cover reader failures, blocked/unknown robots, success and deep crawl failure');
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
console.log('PASS: all audit regression suites');
})().catch(error=>{console.error(error);process.exitCode=1;});
