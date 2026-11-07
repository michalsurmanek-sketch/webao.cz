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

    const domainInput = page.locator('#domain');
    await domainInput.focus();
    await page.keyboard.press('Tab');
    const forwardFocus = await page.evaluate(() => {
      const active = document.activeElement;
      const style = getComputedStyle(active);
      return {
        isSubmit: active.matches('#audit-form button[type="submit"]'),
        isFocusVisible: active.matches(':focus-visible'),
        outlineStyle: style.outlineStyle,
        outlineWidth: parseFloat(style.outlineWidth),
        outlineColor: style.outlineColor,
        bodyBackground: getComputedStyle(document.body).backgroundColor
      };
    });
    const submitFocusVisible = forwardFocus.isSubmit && forwardFocus.isFocusVisible &&
      forwardFocus.outlineStyle !== 'none' && forwardFocus.outlineWidth >= 2 &&
      forwardFocus.outlineColor !== 'rgba(0, 0, 0, 0)';
    results.checks.push({
      name: 'keyboard_can_reach_audit_submit',
      ok: forwardFocus.isSubmit,
      detail: forwardFocus.isSubmit ? 'Tab moves from the domain field to submit' : 'Tab did not move from the domain field to submit'
    });
    const focusContrast = await page.evaluate(() => {
      const parse = value => {
        const match = value.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        return match ? match.slice(1, 4).map(Number) : null;
      };
      const luminance = rgb => {
        const channels = rgb.map(value => value / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const outline = parse(getComputedStyle(document.querySelector('#audit-form button[type="submit"]')).outlineColor);
      const background = parse(getComputedStyle(document.body).backgroundColor);
      if (!outline || !background) return { ratio: null, outline, background };
      const values = [luminance(outline), luminance(background)].sort((a, b) => b - a);
      return { ratio: (values[0] + 0.05) / (values[1] + 0.05), outline, background };
    });
    results.checks.push({
      name: 'keyboard_focus_outline_contrast',
      ok: focusContrast.ratio !== null && focusContrast.ratio >= 3,
      detail: focusContrast.ratio === null ? 'could not determine focus outline and adjacent background colors' : `outline/background contrast ${focusContrast.ratio.toFixed(2)}:1 (sampled on the audit page)`
    });
    results.checks.push({
      name: 'keyboard_submit_focus_is_visible',
      ok: submitFocusVisible,
      detail: submitFocusVisible ? `visible ${forwardFocus.outlineWidth}px ${forwardFocus.outlineStyle} outline` : `focus indicator missing or too thin: ${JSON.stringify(forwardFocus)}`
    });
    await page.keyboard.press('Shift+Tab');
    const reverseFocus = await page.evaluate(() => {
      const active = document.activeElement;
      const style = getComputedStyle(active);
      return {
        isDomain: active.matches('#domain'),
        isFocusVisible: active.matches(':focus-visible'),
        boxShadow: style.boxShadow,
        borderColor: style.borderColor
      };
    });
    const domainFocusVisible = reverseFocus.isDomain && reverseFocus.isFocusVisible &&
      reverseFocus.boxShadow !== 'none' && reverseFocus.borderColor !== 'rgba(0, 0, 0, 0)';
    results.checks.push({
      name: 'keyboard_domain_focus_is_visible',
      ok: domainFocusVisible,
      detail: domainFocusVisible ? 'Shift+Tab returns to the domain field with its focus treatment' : `domain focus treatment missing: ${JSON.stringify(reverseFocus)}`
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
