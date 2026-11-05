#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const base = process.env.WEBAO_BASE_URL || 'https://webao.cz';
const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 12000);
const retries = 2;
const records = [];

function record(name, status, detail, critical = false) {
  records.push({ at: new Date().toISOString(), name, status, detail, critical });
  console.log(`${status === 'PASS' ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
}

async function request(url) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
      clearTimeout(timer);
      return response;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function checkUrl(name, url, predicate, critical = true) {
  try {
    const response = await request(url);
    const result = predicate(response);
    record(name, result.ok ? 'PASS' : 'FAIL', result.detail, critical);
  } catch (error) {
    record(name, 'FAIL', error.name === 'AbortError' ? `timeout after ${timeoutMs}ms` : error.message, critical);
  }
}

(async () => {
  const origin = new URL(base);
  if (origin.protocol !== 'https:') throw new Error('WEBAO_BASE_URL must use HTTPS');

  await checkUrl('web_https', origin.href, response => ({
    ok: response.status >= 200 && response.status < 400,
    detail: `HTTP ${response.status}; final URL ${response.url || origin.href}`,
  }));

  await checkUrl('audit_page', new URL('/audit/', origin).href, response => ({
    ok: response.status === 200 && response.headers.get('content-type')?.includes('text/html'),
    detail: `HTTP ${response.status}; content-type ${response.headers.get('content-type') || 'missing'}`,
  }));

  await checkUrl('audit_cache_script', new URL('/audit/psi-cache.js', origin).href, response => ({
    ok: response.status === 200 && response.headers.get('content-type')?.includes('javascript'),
    detail: `HTTP ${response.status}; content-type ${response.headers.get('content-type') || 'missing'}`,
  }));

  try {
    const response = await request(new URL('/audit/', origin));
    const html = await response.text();
    const required = ['id="audit-form"', 'id="result"', 'id="domain"', '/audit/psi-cache.js', 'Zkontrolovat web'];
    const missing = required.filter(token => !html.includes(token));
    record('audit_markup', missing.length ? 'FAIL' : 'PASS', missing.length ? `missing markers: ${missing.join(', ')}` : 'form, result region and cache script are present', true);
  } catch (error) {
    record('audit_markup', 'FAIL', error.message, true);
  }

  const json = `${JSON.stringify({ generatedAt: new Date().toISOString(), base, checks: records }, null, 2)}\n`;
  const output = process.env.HEALTHCHECK_OUTPUT || path.join(process.cwd(), 'healthcheck-results.json');
  fs.writeFileSync(output, json);
  if (records.some(item => item.status === 'FAIL' && item.critical)) process.exitCode = 1;
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
