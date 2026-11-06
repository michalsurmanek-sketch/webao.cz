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

    const accessibility = await page.evaluate(() => {
      const lang = document.documentElement.lang.trim();
      const missingImageAlts = [...document.querySelectorAll('img:not([alt])')].map(image => image.getAttribute('src') || '(inline image)');
      const controls = [...document.querySelectorAll('#audit-form input:not([type="hidden"]), #audit-form select, #audit-form textarea, #audit-form button')];
      const unnamedControls = controls.filter(control => {
        const labelledBy = (control.getAttribute('aria-labelledby') || '').split(/\\s+/).filter(Boolean)
          .some(id => document.getElementById(id)?.textContent.trim());
        const ariaLabel = Boolean(control.getAttribute('aria-label')?.trim());
        const associatedLabel = [...(control.labels || [])].some(label => label.textContent.trim());
        const buttonText = control.matches('button') && Boolean(control.textContent.trim());
        return !(labelledBy || ariaLabel || associatedLabel || buttonText);
      }).map(control => control.id || control.name || control.tagName.toLowerCase());
      return { lang, missingImageAlts, unnamedControls };
    });
    results.checks.push({
      name: 'document_language',
      ok: Boolean(accessibility.lang),
      detail: accessibility.lang ? `lang=${accessibility.lang}` : 'document language is missing'
    });
    results.checks.push({
      name: 'images_have_alt_attribute',
      ok: accessibility.missingImageAlts.length === 0,
      detail: accessibility.missingImageAlts.length ? `missing alt: ${accessibility.missingImageAlts.join(', ')}` : 'all images declare alt text (empty is allowed for decorative images)'
    });
    results.checks.push({
      name: 'audit_form_controls_have_accessible_names',
      ok: accessibility.unnamedControls.length === 0,
      detail: accessibility.unnamedControls.length ? `unnamed controls: ${accessibility.unnamedControls.join(', ')}` : 'all form controls have an associated or ARIA name'
    });

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
