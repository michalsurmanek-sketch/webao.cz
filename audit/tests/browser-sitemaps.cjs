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
    await page.evaluate(() => {
      window.sitemapRequests = [];
      window.fetch = async input => {
        const raw = String(input), prefix = 'https://r.jina.ai/https://example.cz';
        if (!raw.startsWith(prefix)) throw new TypeError('Fixture external outage');
        const pathname = new URL(raw.slice('https://r.jina.ai/'.length)).pathname;
        if (pathname === '/robots.txt') return new Response('User-agent: *\nAllow: /\nDisallow: /blocked.xml');
        if (pathname.endsWith('.xml')) window.sitemapRequests.push(pathname);
        if (pathname === '/sitemap.xml') {
          const entries = ['/sitemap.xml', '/blocked.xml', ...Array.from({ length: 12 }, (_, i) => '/child-' + i + '.xml'), '/child-11.xml'];
          return new Response('<sitemapindex>' + entries.map(url => '<sitemap><loc>https://example.cz' + url + '</loc></sitemap>').join('') + '</sitemapindex>');
        }
        if (/^\/child-\d+\.xml$/.test(pathname)) {
          if (pathname === '/child-0.xml') throw new TypeError('Fixture sitemap read failure');
          return new Response('<urlset><url><loc>https://example.cz/page' + pathname.match(/\d+/)[0] + '</loc></url></urlset>');
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
    assert.equal(new Set(result.requests).size, 8, 'cycles and duplicates must not waste requests');
    assert(!result.requests.includes('/blocked.xml'));
    assert.equal(result.meta.sitemapFiles, 7, 'one of eight requested files failed');
    assert.equal(result.meta.sitemapFailures.length, 1);
    assert.equal(result.meta.sitemapBudgetOmittedCount, 5);
    assert.equal(result.meta.sitemapBudgetOmittedExamples.length, 5);
    assert.equal(result.meta.sitemapDiscovered, 6, 'only successfully read child sitemaps contribute URLs');
    assert.match(result.csv, /sitemapy nevyžádané limitem: 5/);
    assert.match(result.report, /Sitemapy nevyžádané kvůli limitu požadavků · 5/);
    assert.match(result.meta.note, /jejich URL nebyly zahrnuty do inventáře/);
    assert.deepEqual(errors, []);
    console.log('PASS sitemap integration: request budget, duplicate/cycle suppression, robots, fetch failure, omissions and CSV/report counts');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
