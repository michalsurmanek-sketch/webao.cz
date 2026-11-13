#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}) });
  try {
    for (const width of [1365, 390]) {
      for (const robotsAvailable of [true, false]) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/*', route => route.request().url() === 'https://fixture.test/audit/'
          ? route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8') })
          : route.abort());
        await page.goto('https://fixture.test/audit/');
        await page.evaluate(available => {
          window.fixtureRequests = [];
          window.fetch = async input => {
            const url = String(input);
            window.fixtureRequests.push(url);
            if (available && url.includes('/robots.txt')) return new Response('User-agent: *\nAllow: /', { status: 200 });
            throw new TypeError('Fixture: external source unavailable');
          };
        }, robotsAvailable);
        await page.locator('#domain').fill('example.cz');
        await page.locator('#audit-form button[type="submit"]').click();
        await page.waitForFunction(() => window.currentAuditData && !document.querySelector('#audit-form button[type="submit"]').disabled, null, { timeout: 20000 });
        const state = await page.evaluate(() => ({
          busy: document.querySelector('#audit-form button[type="submit"]').hasAttribute('aria-busy'),
          text: document.querySelector('#result').textContent,
          score: window.currentAuditData.score,
          coverage: window.currentAuditData.coverage,
          scoredFindings: window.currentAuditData.findings.filter(item => Number.isFinite(item.points)).map(item => ({ name: item.name, points: item.points })),
          requests: window.fixtureRequests
        }));
        assert.equal(state.busy, false);
        assert.match(state.text, /Nelze ověřit|NELZE OVĚŘIT/);
        assert(!state.text.includes('Kontrolu se nepodařilo dokončit'));
        if (robotsAvailable) {
          assert(state.scoredFindings.length > 0, 'available robots rules should remain measurable');
          assert(state.scoredFindings.every(item => /robots/i.test(item.name)), JSON.stringify(state.scoredFindings));
          assert(state.coverage < 100, 'outage report must show partial coverage');
        } else {
          assert.equal(state.score, null, 'unavailable sources must not create a score');
          assert.equal(state.scoredFindings.length, 0);
        }
        assert.deepEqual(errors, []);
        if (!robotsAvailable) assert(!state.requests.some(url => /pagespeedonline|respondWith|example.cz\/$/.test(url)), 'unknown robots policy must suppress page requests');
        await page.evaluate(()=>{window.currentAuditData=null;window.fixtureRequests=[];});
        await page.locator('#domain').fill('second-example.cz');
        await page.locator('#audit-form button[type="submit"]').click();
        await page.waitForFunction(()=>window.currentAuditData&&!document.querySelector('#audit-form button[type="submit"]').disabled,null,{timeout:20000});
        assert.equal(await page.locator('#audit-form button[type="submit"]').getAttribute('aria-busy'),null,'second audit restores controls without reloading');
        assert.deepEqual(errors,[],'repeated audit has no browser exceptions');
        const repeated=await page.evaluate(()=>({host:window.currentAuditData.host,pages:window.currentAuditData.pages,requests:window.fixtureRequests,text:document.querySelector('#result').textContent}));
        assert.equal(repeated.host,'second-example.cz','second report replaces domain without reload');
        assert(repeated.pages.every(item=>new URL(item.url).hostname==='second-example.cz'),'inventory cannot retain first-domain pages');
        assert(!repeated.requests.some(value=>/https?:\/\/example\.cz(?:[\/:]|$)/.test(value)),'second run cannot request first-domain pages');
        assert(repeated.text.includes('second-example.cz'),'rendered report identifies second domain');
        console.log(`PASS failure report: width=${width}, robotsAvailable=${robotsAvailable}, controls restored and unavailable sources unscored`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
