#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => route.request().url() === 'https://fixture.test/audit/'
      ? route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8') }) : route.abort());
    await page.goto('https://fixture.test/audit/');
    const textIndex=await page.evaluate(()=>{
      const text='Title: Sitemap Index\nURL Source: https://example.cz/sitemap.xml\nMarkdown Content:\nhttps://example.cz/sitemaps/products';
      return {pages:getSitemapUrls(text,'example.cz'),indexes:getSitemapLocations(text,'example.cz'),verifiedPages:getSitemapUrls('Title: Sitemap Index\nMarkdown Content:\n<urlset><url><loc>https://example.cz/real</loc></url></urlset>','example.cz')};
    });
    assert.deepEqual(textIndex.pages,[]);
    assert.deepEqual(textIndex.indexes,['https://example.cz/sitemaps/products']);
    assert.deepEqual(textIndex.verifiedPages,['https://example.cz/real']);
    const xmlPages=await page.evaluate(()=>{
      const header='Title: Sitemap\nMarkdown Content:\n';
      return {pages:getSitemapUrls(header+'<urlset><url><loc>https://example.cz/catalog.xml</loc></url></urlset>','example.cz'),indexes:getSitemapLocations(header+'<urlset><url><loc>https://example.cz/catalog.xml</loc></url></urlset>','example.cz'),textIndex:getSitemapUrls(header+'https://example.cz/child.xml','example.cz')};
    });
    assert.deepEqual(xmlPages.pages,['https://example.cz/catalog.xml'],'verified urlset must override filename-based index heuristic');
    assert.deepEqual(xmlPages.indexes,[]);
    assert.deepEqual(xmlPages.textIndex,[],'preserve supported text-index heuristic');
    const rootTypes=await page.evaluate(()=>({
      pages:getSitemapUrls('<urlset xmlns:ext="urn:extension" note="&lt;sitemapindex&gt;"><ext:sitemapindex/><url><loc>https://example.cz/root-page</loc></url></urlset>','example.cz'),
      indexes:getSitemapLocations('<sitemapindex xmlns:ext="urn:extension" note="&lt;urlset&gt;"><ext:urlset/><sitemap><loc>https://example.cz/nested.xml</loc></sitemap></sitemapindex>','example.cz')
    }));
    assert.deepEqual(rootTypes.pages,['https://example.cz/root-page']);
    assert.deepEqual(rootTypes.indexes,['https://example.cz/nested.xml']);
    const cdataTypes=await page.evaluate(()=>({
      pages:getSitemapUrls('<urlset><note><![CDATA[<sitemapindex>not markup</sitemapindex>]]></note><url><loc>https://example.cz/real</loc></url></urlset>','example.cz'),
      indexes:getSitemapLocations('<sitemapindex><note><![CDATA[<urlset>not markup</urlset>]]></note><sitemap><loc>https://example.cz/child.xml</loc></sitemap></sitemapindex>','example.cz')
    }));
    assert.deepEqual(cdataTypes.pages,['https://example.cz/real']);
    assert.deepEqual(cdataTypes.indexes,['https://example.cz/child.xml']);
    const incompleteComment=await page.evaluate(()=>getSitemapUrls('<urlset><url><loc>https://example.cz/invalid</loc></url></urlset><!-- truncated','example.cz'));
    assert.deepEqual(incompleteComment,[],'extraction must not repair incomplete XML by stripping comments');
    const scale=await page.evaluate(()=>{
      const count=15000;
      const entries=Array.from({length:count},(_,i)=>'<url><loc>https://example.cz/page-'+i+'?a=1&amp;b=2</loc></url>');
      const xml='<urlset>'+entries.join('')+entries.slice(0,100).join('')+'</urlset>';
      const start=performance.now();
      const valid=isSitemapDocument(xml),urls=getSitemapUrls(xml,'example.cz');
      return {valid,count:urls.length,first:urls[0],last:urls.at(-1),elapsedMs:performance.now()-start,bytes:new TextEncoder().encode(xml).length};
    });
    assert.equal(scale.valid,true);
    assert.equal(scale.count,15000,'native XML inventory must retain all distinct URLs');
    assert.equal(scale.first,'https://example.cz/page-0?a=1&b=2');
    assert.equal(scale.last,'https://example.cz/page-14999?a=1&b=2');
    assert(scale.bytes<2*1024*1024,'fixture must fit the supported reader response budget');
    assert(scale.elapsedMs<10000,'15k XML URLs must finish within the conservative CI regression ceiling of 10 seconds');
    console.log('PASS native sitemap scale '+JSON.stringify(scale));
    const annotated=await page.evaluate(()=>{
      const header='Title: Sitemap\nAnnotation: <sitemapindex><loc>https://example.cz/fake.xml</loc></sitemapindex>\nMarkdown Content:\n';
      return {valid:isSitemapDocument(header+'https://example.cz/real'),urls:getSitemapUrls(header+'<urlset><url><loc>https://example.cz/real</loc></url></urlset>','example.cz'),indexes:getSitemapLocations(header+'<urlset><url><loc>https://example.cz/real</loc></url></urlset>','example.cz')};
    });
    assert.equal(annotated.valid,true);
    assert.deepEqual(annotated.urls,['https://example.cz/real']);
    assert.deepEqual(annotated.indexes,[]);
    const readerInventory=await page.evaluate(()=>{
      const envelope='Title: Sitemap\nURL Source: https://example.cz/sitemap.xml\nMarkdown Content:\n';
      return {empty:isSitemapDocument(envelope),urls:getSitemapUrls(envelope+'https://example.cz/real-page','example.cz'),indexes:getSitemapLocations(envelope+'https://example.cz/child.xml','example.cz')};
    });
    assert.equal(readerInventory.empty,false,'reader URL Source alone cannot confirm a sitemap');
    assert.deepEqual(readerInventory.urls,['https://example.cz/real-page']);
    assert.deepEqual(readerInventory.indexes,['https://example.cz/child.xml']);
    const parseCount=await page.evaluate(()=>{
      const NativeParser=window.DOMParser;let count=0;
      window.DOMParser=class extends NativeParser{parseFromString(...args){count++;return super.parseFromString(...args)}};
      try{
        const xml='<!-- transport comment --><urlset><url><loc>https://example.cz/cache-test</loc></url></urlset>';
        isSitemapDocument(xml);getSitemapUrls(xml,'example.cz');getSitemapUrls(xml,'example.cz');
        return count;
      }finally{window.DOMParser=NativeParser}
    });
    assert.equal(parseCount,1,'validation and repeated extraction must share one native parse');
    const extensionUrls=await page.evaluate(()=>getSitemapUrls('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><url><loc>https://example.cz/page?a=1&amp;b=2</loc><image:image><image:loc>https://example.cz/image.jpg</image:loc></image:image><image:loc>https://example.cz/direct-image.jpg</image:loc></url></urlset>','example.cz'));
    assert.deepEqual(extensionUrls,['https://example.cz/page?a=1&b=2']);
    const recognition = await page.evaluate(() => {
      const valid='<urlset><url><loc>https://example.cz/page</loc></url></urlset>';
      return {
        prefixed:isSitemapDocument('<s:urlset xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"><s:url><s:loc>https://example.cz/a</s:loc></s:url></s:urlset>'),
        valid:isSitemapDocument(valid),
        wrapped:isSitemapDocument('Title: Sitemap\nMarkdown Content:\n'+valid),
        cdata:isSitemapDocument('<urlset><url><loc><![CDATA[https://example.cz/?a=1&b=2]]></loc></url></urlset>'),
        empty:isSitemapDocument('<urlset/>'),
        truncated:isSitemapDocument(valid.slice(0,-9)),
        mismatched:isSitemapDocument('<urlset><url></urlset>'),
        bareLoc:isSitemapDocument('<loc>https://example.cz/page</loc>'),
        trailingComment:isSitemapDocument(valid+'<!-- incomplete'),
        commentOnly:isSitemapDocument('<!-- '+valid+' -->'),
        reader:isSitemapDocument('Title: Sitemap\nMarkdown Content:\nhttps://example.cz/page')
      };
    });
    assert.deepEqual(recognition, {prefixed:true,valid:true,wrapped:true,cdata:true,empty:true,truncated:false,mismatched:false,bareLoc:false,trailingComment:false,commentOnly:false,reader:true});
    await page.evaluate(() => {
      window.sitemapRequests = [];
      window.fetch = async input => {
        const raw = String(input), prefix = 'https://r.jina.ai/https://example.cz';
        if (!raw.startsWith(prefix)) throw new TypeError('Fixture external outage');
        const pathname = new URL(raw.slice('https://r.jina.ai/'.length)).pathname;
        if (pathname === '/robots.txt') return new Response('User-agent: *\nAllow: /\nDisallow: /blocked.xml\nDisallow: /blocked-late.xml\nDisallow: /declared-only.xml\nSitemap: https://example.cz/declared-only.xml\nSitemap: https://example.cz/declared-only.xml\nSitemap: https://example.cz/blocked.xml');
        if (pathname.endsWith('.xml')) window.sitemapRequests.push(pathname);
        if (pathname === '/sitemap.xml') {
          const entries = ['/sitemap.xml', '/blocked.xml', ...Array.from({ length: 12 }, (_, i) => '/child-' + i + '.xml'), '/child-11.xml', '/blocked-late.xml', '/blocked.xml', '/blocked-late.xml'];
          return new Response('<!-- <urlset><loc>https://example.cz/comment-only.xml</loc></urlset> --><sitemapindex>' + entries.map(url => '<sitemap><loc>https://example.cz' + url + '</loc></sitemap>').join('') + '</sitemapindex>');
        }
        if (/^\/child-\d+\.xml$/.test(pathname)) {
          if (pathname === '/child-0.xml') return new Response('<urlset><url><loc>https://example.cz/truncated-page</loc></url>');
          return new Response('<s:urlset xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"><s:url><s:loc>https://example.cz/page' + pathname.match(/\d+/)[0] + '?a=1&amp;b=2</s:loc><image:image xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"><image:loc>https://example.cz/image.jpg</image:loc></image:image></s:url></s:urlset>');
        }
        throw new TypeError('Fixture page unavailable');
      };
    });
    await page.locator('#domain').fill('example.cz');
    await page.locator('#audit-form button[type="submit"]').click();
    await page.waitForFunction(() => window.currentAuditData && !document.querySelector('#audit-form button[type="submit"]').disabled, null, { timeout: 20000 });
    const result = await page.evaluate(async () => {
      const meta = window.currentAuditData.crawlMeta;
      let exported;
      URL.createObjectURL = blob => { exported = blob; return 'blob:fixture'; };
      URL.revokeObjectURL = () => {};
      HTMLAnchorElement.prototype.click = function () {};
      downloadAuditCsv();
      return { meta, requests: window.sitemapRequests, csv: await exported.text(), report: document.querySelector('#result').textContent };
    });
    assert.equal(result.requests.length, 8, 'root plus seven child requests must exhaust the budget');
    assert(!result.requests.includes('/comment-only.xml'));
    assert.equal(new Set(result.requests).size, 8, 'cycles and duplicates must not waste requests');
    assert(!result.requests.includes('/blocked.xml'));
    assert(!result.requests.includes('/blocked-late.xml'));
    assert(!result.requests.includes('/declared-only.xml'));
    assert.deepEqual(result.meta.sitemapSkipped.map(item=>new URL(item.url).pathname).sort(), ['/blocked-late.xml','/blocked.xml','/declared-only.xml']);
    assert.match(result.csv, /sitemapy vynechané robots.txt: 3/);
    assert.match(result.report, /Sitemapy vynechané kvůli robots.txt · 3/);
    assert.equal(result.meta.sitemapFiles, 7, 'one of eight requested files failed');
    assert.equal(result.meta.sitemapFailures.length, 1);
    assert.equal(result.meta.sitemapBudgetOmittedCount, 5);
    assert.equal(result.meta.sitemapBudgetOmittedExamples.length, 5);
    assert.equal(result.meta.sitemapDiscovered, 6, 'only successfully read child sitemaps contribute URLs');
    assert.match(result.csv, /sitemapy nevyžádané limitem: 5/);
    assert.match(result.report, /Sitemapy nevyžádané kvůli limitu požadavků · 5/);
    assert.match(result.meta.note, /jejich URL nebyly zahrnuty do inventáře/);
    await page.evaluate(() => {
      window.currentAuditData=null;
      window.fetch=async input=>{
        const raw=String(input);
        if(raw==='https://r.jina.ai/https://example.cz/robots.txt')return new Response('User-agent: *\nAllow: /');
        if(raw==='https://r.jina.ai/https://example.cz/sitemap.xml')return new Response('<urlset><url><loc>https://example.cz/truncated-page</loc></url>');
        throw new TypeError('Fixture external outage');
      };
    });
    await page.locator('#audit-form button[type="submit"]').click();
    await page.waitForFunction(() => window.currentAuditData && !document.querySelector('#audit-form button[type="submit"]').disabled, null, { timeout: 20000 });
    const incomplete=await page.evaluate(()=>({meta:window.currentAuditData.crawlMeta,finding:window.currentAuditData.findings.find(item=>item.name==='XML sitemap')}));
    assert.equal(incomplete.meta.sitemapFiles,0);
    assert.equal(incomplete.meta.sitemapDiscovered,0);
    assert.equal(incomplete.finding.points,null,'incomplete XML must not confirm or penalize sitemap score');
    assert.equal(incomplete.finding.state,'NELZE OVĚŘIT');
    assert.deepEqual(errors, []);
    console.log('PASS sitemap integration: request budget, duplicate/cycle suppression, robots, fetch failure, omissions and CSV/report counts');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
