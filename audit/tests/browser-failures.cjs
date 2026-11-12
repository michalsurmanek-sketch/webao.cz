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
          requests: window.fixtureRequests
        }));
        assert.equal(state.busy, false);
        assert.match(state.text, /Nelze ověřit|NELZE OVĚŘIT/);
        assert(!state.text.includes('Kontrolu se nepodařilo dokončit'));
        assert.equal(state.score, null, 'unavailable sources must not create a score');
        assert.deepEqual(errors, []);
        if (!robotsAvailable) assert(!state.requests.some(url => /pagespeedonline|respondWith|example.cz\/$/.test(url)), 'unknown robots policy must suppress page requests');
        console.log(`PASS failure report: width=${width}, robotsAvailable=${robotsAvailable}, controls restored and score absent`);
        await page.close();
      }
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
