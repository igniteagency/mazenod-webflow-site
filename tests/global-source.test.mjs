import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const globalSource = await readFile(new URL('../src/global.ts', import.meta.url), 'utf8');

test('conditionally loads the native video player without Vimeo or Plyr', () => {
  assert.match(
    globalSource,
    /conditionalLoadScript\(\s*['"]\[data-video-el=\\?['"]component\\?['"]\]['"]\s*,\s*['"]components\/video-player\.js['"]/
  );
  assert.doesNotMatch(globalSource, /vimeo|plyr/i);
});
