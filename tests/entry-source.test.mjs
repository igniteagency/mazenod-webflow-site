import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const entrySource = await readFile(new URL('../src/entry.ts', import.meta.url), 'utf8');

test('Webflow staging loads the default main-branch CDN bundle', () => {
  assert.doesNotMatch(entrySource, /getProductionBase\(['"]dev['"]\)/);
  assert.match(entrySource, /window\.PRODUCTION_BASE = getProductionBase\(\);/);
});
