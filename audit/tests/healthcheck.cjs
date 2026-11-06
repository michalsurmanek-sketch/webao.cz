#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');

const base = process.env.WEBAO_BASE_URL || 'https://webao.cz';
function configuredTimeout(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, 120000) : 12000;
}
function hasContentType(response, expected) {
  const value = response.headers.get('content-type') || '';
  const mediaType = value.split(';', 1)[0].trim().toLowerCase();
  if (expected === 'text/html') return mediaType === 'text/html';
  if (expected === 'javascript') {
    return ['application/javascript', 'text/javascript', 'application/ecmascript', 'text/ecmascript', 'application/x-javascript', 'text/x-javascript'].includes(mediaType);
  }
  return false;
}

const timeoutMs = configuredTimeout(process.env.HEALTHCHECK_TIMEOUT_MS);
const maxResponseBytes = 2 * 1024 * 1024;
const retries = 2;
const records = [];

function isSecureSiteResponse(response, origin) {
  if (response.status >= 200 && response.status < 300) return true;
  if (![301, 302, 303, 307, 308].includes(response.status)) return false;
  const location = response.headers.get('location');
  if (!location) return false;
  try {
    const target = new URL(location, origin);
    const expectedHost = origin.hostname.replace(/^www\./i, '').toLowerCase();
    const targetHost = target.hostname.replace(/^www\./i, '').toLowerCase();
    return target.protocol === 'https:' && targetHost === expectedHost;
  } catch {
    return false;
  }
}

function record(name, status, detail, critical = false) {
  records.push({ at: new Date().toISOString(), name, status, detail, critical });
  console.log(`${status === 'PASS' ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
}

async function readResponseText(response, maxBytes = maxResponseBytes) {
  const contentLength = response.headers.get('content-length');
  if (contentLength !== null && contentLength !== '' && Number.isFinite(Number(contentLength)) && Number(contentLength) > maxBytes) {
    throw new Error(`response body exceeds ${maxBytes} bytes`);
  }
  if (!response.body || typeof response.body.getReader !== 'function') {
    const text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) throw new Error(`response body exceeds ${maxBytes} bytes`);
    return text;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new Error(`response body exceeds ${maxBytes} bytes`);
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } catch (error) {
    try { await reader.cancel(); } catch {}
    throw error;
  }
}

async function request(url, readBody = false) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { redirect: 'manual', signal: controller.signal });
      if (readBody) {
        const body = await readResponseText(response);
        clearTimeout(timer);
        return { response, body };
      }
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
    ok: isSecureSiteResponse(response, origin),
    detail: `HTTP ${response.status}; ${response.headers.get('location') ? 'redirect to ' + response.headers.get('location') : 'final URL ' + (response.url || origin.href)}`,
  }));

  await checkUrl('audit_page', new URL('/audit/', origin).href, response => ({
    ok: response.status === 200 && hasContentType(response, 'text/html'),
    detail: `HTTP ${response.status}; content-type ${response.headers.get('content-type') || 'missing'}`,
  }));

  await checkUrl('audit_cache_script', new URL('/audit/psi-cache.js', origin).href, response => ({
    ok: response.status === 200 && hasContentType(response, 'javascript'),
    detail: `HTTP ${response.status}; content-type ${response.headers.get('content-type') || 'missing'}`,
  }));

  try {
    const { response, body: html } = await request(new URL('/audit/', origin), true);
    const contentType = response.headers.get('content-type') || '';
    if (response.status !== 200 || !hasContentType(response, 'text/html')) {
      record('audit_markup', 'FAIL', `HTTP ${response.status}; content-type ${contentType || 'missing'}; markup was not inspected`, true);
    } else {
      const required = ['id="audit-form"', 'id="result"', 'id="domain"', '/audit/psi-cache.js', 'Zkontrolovat web'];
      const missing = required.filter(token => !html.includes(token));
      record('audit_markup', missing.length ? 'FAIL' : 'PASS', missing.length ? `missing markers: ${missing.join(', ')}` : 'form, result region and cache script are present', true);
    }
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
