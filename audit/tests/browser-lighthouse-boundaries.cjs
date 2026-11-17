'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
 try{
  fs.mkdirSync('browser-results',{recursive:true});
  for(const width of [1365,390]){
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   await page.route('**/*',route=>{
    const url=new URL(route.request().url());
    const file=url.pathname==='/audit/'?'audit/index.html':url.pathname==='/audit/psi-cache.js'?'audit/psi-cache.js':url.pathname==='/assets/network.css'?'assets/network.css':null;
    return file?route.fulfill({contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html',body:fs.readFileSync(path.join(__dirname,'../..',file),'utf8')}):route.abort();
   });
   await page.goto('https://fixture.test/audit/');
   await page.evaluate(()=>{
    window.fixtureScore=0.895;
    window.fetch=async input=>{
     const address=new URL(String(input));
     if(address.hostname==='www.googleapis.com'){
      const target=address.searchParams.get('url'),strategy=address.searchParams.get('strategy'),score=window.fixtureScore;
      return new Response(JSON.stringify({id:target,lighthouseResult:{requestedUrl:target,finalUrl:target,fetchTime:new Date().toISOString(),
       configSettings:{emulatedFormFactor:strategy},categories:Object.fromEntries(['performance','accessibility','seo','best-practices'].map(id=>[id,{score,...(window.fixtureMalformed==='refs'?{auditRefs:[null]}:{})}])),
       audits:{viewport:{title:'Viewport',score,scoreDisplayMode:'numeric'},'third-party-cookies':window.fixtureMalformed==='details'?null:{title:'Third-party cookies',score,scoreDisplayMode:'numeric'}}}}),{headers:{'Content-Type':'application/json'}});
     }
     if(address.hostname==='r.jina.ai'){
      const target=new URL(String(input).slice('https://r.jina.ai/'.length));
      if(target.pathname==='/robots.txt')return new Response('User-agent: *\nAllow: /');
      if(target.pathname==='/sitemap.xml')return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+target.origin+'/</loc></url></urlset>');
      return new Response('Title: Fixture\nURL Source: '+target.href+'\nMarkdown Content:\n# Fixture\nA controlled public page.');
     }
     throw new TypeError('Fixture: source unavailable');
    };
   });
   for(const [domain,score] of [['example.cz',0.895],['second.cz',0.9]]){
    await page.evaluate(value=>{window.fixtureScore=value},score);
    await page.locator('#domain').fill(domain);
    await page.locator('#audit-form button[type="submit"]').click();
    await page.waitForFunction(host=>window.currentAuditData?.host===host&&!document.querySelector('#audit-form button[type="submit"]').disabled,domain,{timeout:20000});
    const state=await page.evaluate(()=>({host:currentAuditData.host,findings:currentAuditData.findings.filter(item=>item.name==='Lighthouse mobil — Viewport'||item.name.startsWith('PageSpeed Insights — ')||item.name.startsWith('Lighthouse — cookies třetích stran')).map(item=>({name:item.name,ok:item.ok,points:item.points,severity:item.severity})),text:document.querySelector('#result').textContent}));
    assert.equal(state.findings.length,10);
    assert(state.findings.every(item=>item.points===90&&item.ok===(score>=0.9)),JSON.stringify(state));
    assert(state.findings.every(item=>score>=0.9?item.severity==='Nízká':item.severity!=='Nízká'));
    assert(!state.text.includes('Kontrolu se nepodařilo dokončit'));
    const downloadPromise=page.waitForEvent('download');
    await page.getByRole('button',{name:'Exportovat CSV'}).click();
    const download=await downloadPromise,filename=`browser-results/boundaries-${width}-${score}.csv`;
    await download.saveAs(filename);
    const csv=fs.readFileSync(filename,'utf8');
    const rows=csv.split('\r\n').filter(row=>row.startsWith('"Nález"')&&(row.includes('"Lighthouse mobil — Viewport"')||row.includes('"Lighthouse — cookies třetích stran (mobil)"')||row.includes('"PageSpeed Insights — ')));
    assert.equal(rows.length,10);
    assert(rows.every(row=>row.includes('"'+(score>=0.9?'V POŘÁDKU':'OPRAVIT')+'"')));
    await page.screenshot({path:`browser-results/boundaries-${width}-${score}.png`,fullPage:true});
    if(width===1365&&score===0.895)await page.pdf({path:'browser-results/boundaries-report.pdf',format:'A4',printBackground:true});
   }
   for(const malformed of ['refs','details']){
    const domain='malformed-'+malformed+'.cz';
    await page.evaluate(value=>{window.fixtureMalformed=value},malformed);
    await page.locator('#domain').fill(domain);
    await page.locator('#audit-form button[type="submit"]').click();
    await page.waitForFunction(host=>window.currentAuditData?.host===host&&!document.querySelector('#audit-form button[type="submit"]').disabled,domain,{timeout:20000});
    const state=await page.evaluate(()=>({text:document.querySelector('#result').textContent,psi:currentAuditData.findings.filter(item=>item.name.startsWith('PageSpeed Insights — '))}));
    assert.equal(state.psi.length,2);
    assert(state.psi.every(item=>item.points===null&&item.state==='NELZE OVĚŘIT'),'malformed source cannot invent measured scores');
    assert(!state.text.includes('Kontrolu se nepodařilo dokončit'),'malformed measurement must leave the rest of the report available');
    assert.match(state.text,malformed==='refs'?/neplatný seznam Lighthouse kontrol/:/neplatné detaily Lighthouse kontrol/);
   }
   assert.deepEqual(errors,[]);
   await page.close();
   console.log(`PASS: complete Lighthouse boundary audit, CSV and repeat run at width=${width}`);
  }
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
