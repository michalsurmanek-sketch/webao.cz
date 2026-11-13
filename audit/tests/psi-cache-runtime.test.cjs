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
assert.equal(cache.write(url, strategy, good), true);
assert.equal(cache.read(url, strategy).payload.lighthouseResult.categories.performance.score, 0.9);
values.set(key, JSON.stringify({savedAt: Date.now(), payload: failed}));
assert.equal(cache.read(url, strategy), null, 'legacy failed cache must be rejected');
assert.equal(values.has(key), false, 'invalid cache must be removed');
values.set(key, JSON.stringify({savedAt: Date.now() + 10000, payload: good}));
assert.equal(cache.read(url, strategy), null, 'future cache timestamp must be rejected');
values.set(key, JSON.stringify({savedAt: Date.now() - cache.ttlMs - 1000, payload: good}));
assert.equal(cache.read(url, strategy), null, 'expired cache must be rejected');
assert.equal(cache.read(url, 'desktop'), null, 'cache is scoped by strategy');
console.log('PASS: PageSpeed cache rejects runtime errors and invalid timestamps');
