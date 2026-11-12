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
      ? route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8') })
      : route.abort());
    await page.goto('https://fixture.test/audit/');
    const results = await page.evaluate(async () => {
      const fixtures = [
        { name: 'first base, entities and equivalent targets', html: '<html><head><base href="https://example.cz/cs/"><base href="https://wrong.test/"><link rel="CANONICAL alternate" href="target?a=1&amp;b=2"><link rel="canonical" href="https://example.cz/cs/target?a=1&amp;b=2"><link rel="alternate" hreflang="cs" href="target"><link rel="alternate" hreflang="CS" href="https://example.cz/cs/target"></head><body></body></html>' },
        { name: 'body metadata is outside inspected head', html: '<html><head><title>Example</title></head><body><link rel="canonical" href="https://outside.test/"><link rel="alternate" hreflang="cs" href="https://outside.test/"></body></html>' },
        { name: 'unknown base stays unverified', html: '<html><head><base href="/cs/"><link rel="canonical" href="target"><link rel="canonical" href="https://example.cz/cs/target"></head><body></body></html>' },
        { name: 'distinct absolute targets remain hypotheses', html: '<html><head><link rel="canonical" href="https://example.cz/a"><link rel="canonical" href="https://example.cz/b"></head><body></body></html>' }
      ];
      const output = [];
      for (const fixture of fixtures) {
        window.fetch = async () => new Response(fixture.html, { status: 200 });
        const metadata = await fetchPageHtmlMetadata(new URL('https://example.cz/old/'));
        const findings = htmlMetadataFindings([{ url: 'https://example.cz/old/', raw: 'page', htmlMetadata: metadata }]);
        output.push({ name: fixture.name, metadata, findings, scoredTests: scoreAuditAreas(findings).reduce((sum, area) => sum + area.tests, 0) });
      }
      for (const html of ['<!doctype html><html>', '<html><head><link rel="canonical" href="/a">', '<!-- <head></head> --><html>', '<html><head><script>const x="</head>";</script>', '<html><head><!-- </head> -->', '<html><head><meta content="</head>">', '<template><head></head></template>']) {
        window.fetch = async () => new Response(html, { status: 200 });
        try { await fetchPageHtmlMetadata(new URL('https://example.cz/')); output.push({ incompleteRejected: false }); }
        catch (error) { output.push({ incompleteRejected: /Úplnost HTML hlavičky nelze potvrdit/.test(error.message) }); }
      }
      return output;
    });
    assert.equal(results[0].metadata.baseHref, 'https://example.cz/cs/');
    assert.equal(results[0].metadata.canonical[0], 'target?a=1&b=2');
    assert(!results[0].findings.some(item => item.state === 'HYPOTÉZA'));
    assert.deepEqual(results[1].metadata.canonical, []);
    assert.deepEqual(results[1].metadata.hreflang, []);
    assert(results[2].findings.some(item => item.state === 'NELZE OVĚŘIT'));
    assert(!results[2].findings.some(item => item.state === 'HYPOTÉZA'));
    assert(results[3].findings.some(item => item.state === 'HYPOTÉZA'));
    for (const result of results.slice(0, 4)) { assert.equal(result.scoredTests, 0); console.log(`PASS metadata DOMParser: ${result.name}`); }
    assert(results.slice(4).every(result => result.incompleteRejected));
    assert.deepEqual(errors, []);
    console.log('PASS metadata DOMParser: incomplete sources rejected without scoring');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
