import assert from 'node:assert/strict';
import test from 'node:test';

import { calculateMarqueeCloneCount, calculateMarqueeDuration } from '../src/components/marquee.ts';

test('creates enough runtime copies to cover the viewport plus one seamless loop', () => {
  assert.equal(calculateMarqueeCloneCount(1000, 300), 5);
  assert.equal(calculateMarqueeCloneCount(300, 600), 2);
});

test('does not clone content that cannot be measured', () => {
  assert.equal(calculateMarqueeCloneCount(1000, 0), 0);
  assert.equal(calculateMarqueeCloneCount(0, 300), 0);
});

test('uses pixels per second when an explicit marquee speed is provided', () => {
  assert.equal(calculateMarqueeDuration(480, 80, 15), 6);
});

test('falls back to the authored CSS duration when speed is omitted', () => {
  assert.equal(calculateMarqueeDuration(480, 0, 15), 15);
  assert.equal(calculateMarqueeDuration(480, Number.NaN, 12), 12);
});
