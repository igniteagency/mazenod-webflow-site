import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/slider.ts', import.meta.url), 'utf8');

assert.match(
  source,
  /const DEFAULT_SWIPER_SPEED_IN_MS = 600;/,
  'default crossfade speed should be doubled to 600ms'
);

assert.match(
  source,
  /const SLIDE_DURATION_ATTRIBUTE = 'sliderSlideDuration';/,
  'slides should expose data-slider-slide-duration as the Webflow-facing duration override'
);

assert.match(
  source,
  /slide\.setAttribute\('data-swiper-autoplay', duration\)/,
  'valid per-slide override values should be passed through to Swiper autoplay'
);

assert.match(
  source,
  /slide\.removeAttribute\('data-swiper-autoplay'\)/,
  'invalid per-slide override values should not leave stale Swiper autoplay overrides'
);

console.log('slider source checks passed');
