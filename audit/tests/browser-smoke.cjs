#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

(async () => {
  const output = path.join(process.cwd(), 'browser-results');
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = { startedAt: new Date().toISOString(), errors: [], checks: [] };
  try {
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 } });
    page.on('pageerror', error => results.errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') results.errors.push(message.text()); });
    const response = await page.goto('https://webao.cz/audit/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    results.checks.push({ name: 'page_response', ok: response && response.status() === 200, detail: `HTTP ${response && response.status()}` });

    for (const selector of ['#audit-form', '#domain', '.audit-hero h1']) {
      const visible = await page.locator(selector).isVisible();
      results.checks.push({ name: `visible:${selector}`, ok: visible, detail: visible ? 'visible' : 'not visible' });
    }

    const result = page.locator('#result');
    const resultExists = await result.count() === 1;
    const resultHiddenBeforeAudit = resultExists && !(await result.isVisible());
    results.checks.push({
      name: 'result_hidden_before_audit',
      ok: resultHiddenBeforeAudit,
      detail: !resultExists ? 'result container is missing' : resultHiddenBeforeAudit ? 'hidden until an audit is run' : 'unexpectedly visible before an audit'
    });

    await page.screenshot({ path: path.join(output, 'audit-desktop.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    results.checks.push({ name: 'mobile_horizontal_overflow', ok: !overflow, detail: overflow ? 'document exceeds viewport width' : 'no horizontal overflow' });
    await page.screenshot({ path: path.join(output, 'audit-mobile.png'), fullPage: true });

    results.finishedAt = new Date().toISOString();
    results.ok = results.checks.every(check => check.ok) && results.errors.length === 0;
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify(results, null, 2) + '\n');
    for (const check of results.checks) console.log(`${check.ok ? 'PASS' : 'FAIL'} ${check.name}: ${check.detail}`);
    for (const error of results.errors) console.error(`CONSOLE ERROR: ${error}`);
    if (!results.ok) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
