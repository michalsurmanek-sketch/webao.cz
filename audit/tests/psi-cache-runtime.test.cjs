#!/usr/bin/env node
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const values = new Map();
const localStorage = {
 getItem: key => values.get(key) ?? null,
 setItem: (key, value) => values.set(key, value),
 removeItem: key => values.delete(key),
};
const window = {localStorage};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'psi-cache.js'), 'utf8'), {window, Date});
const cache = window.WebaoPsiCache;
const url = 'https://example.com/';
const strategy = 'mobile';
const key = 'webao:psi:v1:mobile:' + url;
const good = {lighthouseResult: {categories: {performance: {score: 0.9}}}};
const failed = {lighthouseResult: {runtimeError: {code: 'ERRORED_DOCUMENT_REQUEST'}}};

assert.equal(cache.write(url, strategy, failed), false, 'failed Lighthouse runs must not be cached');
assert.equal(cache.read(url, strategy), null);
assert.equal(cache.write(url,strategy,{lighthouseResult:{categories:{}}}),false,'explicit empty categories are not a measurement');
assert.equal(cache.write(url,strategy,{lighthouseResult:{categories:{performance:{score:'bad'}}}}),false);
assert.equal(cache.write(url,strategy,{lighthouseResult:{categories:{performance:{score:1.5}}}}),false);
assert.equal(cache.write(url,strategy,{lighthouseResult:{categories:{performance:{score:null}}}}),true);
assert.equal(cache.write(url,strategy,{lighthouseResult:{}}),true,'legacy metadata-only results remain compatible');
assert.equal(cache.write(url, strategy, good), true);
const priorEntry=values.get(key);
const huge={lighthouseResult:{categories:{performance:{score:0.9}},audits:{oversized:{details:'x'.repeat(2*1024*1024)}}}};
assert.equal(cache.write(url,strategy,huge),false,'oversized Lighthouse result must not fill browser storage');
assert.equal(values.get(key),priorEntry,'oversized result must preserve existing valid cache');
assert.equal(cache.read(url, strategy).payload.lighthouseResult.categories.performance.score, 0.9);
values.set(key, JSON.stringify({savedAt: Date.now(), payload: failed}));
assert.equal(cache.read(url, strategy), null, 'legacy failed cache must be rejected');
assert.equal(values.has(key), false, 'invalid cache must be removed');
values.set(key,JSON.stringify({savedAt:Date.now(),payload:{lighthouseResult:{categories:{performance:{score:'invalid'}}}}}));
assert.equal(cache.read(url,strategy),null,'malformed legacy score must be evicted');
values.set(key,JSON.stringify({savedAt:Date.now(),payload:{lighthouseResult:{categories:{}}}}));
assert.equal(cache.read(url,strategy),null,'legacy empty categories must be evicted');
values.set(key, JSON.stringify({savedAt: Date.now() + 10000, payload: good}));
assert.equal(cache.read(url, strategy), null, 'future cache timestamp must be rejected');
values.set(key, JSON.stringify({savedAt: Date.now() - cache.ttlMs - 1000, payload: good}));
assert.equal(cache.read(url, strategy), null, 'expired cache must be rejected');
assert.equal(cache.read(url, 'desktop'), null, 'cache is scoped by strategy');
values.set(key,'{invalid-json');
assert.equal(cache.read(url,strategy),null,'corrupt JSON is ignored');
assert.equal(values.has(key),false,'corrupt JSON is evicted');
assert.equal(cache.write(url,strategy,good),true,'cache recovers after corruption');
assert.equal(cache.read(url,strategy).payload.lighthouseResult.categories.performance.score,0.9);

const denied={localStorage:{getItem(){throw Error('Storage disabled')},setItem(){throw Error('Storage disabled')},removeItem(){throw Error('Storage disabled')}}};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','psi-cache.js'),'utf8'),{window:denied,Date});
assert.equal(denied.WebaoPsiCache.read(url,strategy),null,'disabled storage never blocks audit');
assert.equal(denied.WebaoPsiCache.write(url,strategy,good),false,'disabled storage never blocks audit');
console.log('PASS: PageSpeed cache rejects malformed categories and timestamps, recovers from corruption, and handles disabled storage');
