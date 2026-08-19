import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const marqueeSource = readFileSync(
  new URL('../src/components/marquee.ts', import.meta.url),
  'utf8'
);
const globalSource = readFileSync(new URL('../src/global.ts', import.meta.url), 'utf8');

assert.match(marqueeSource, /export function initMarquees/);
assert.match(marqueeSource, /prefers-reduced-motion: reduce/);
assert.match(marqueeSource, /data-marquee-initialised/);
assert.match(marqueeSource, /clone\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(marqueeSource, /clone\.querySelectorAll\('\[id\]'\)/);
assert.match(marqueeSource, /new ResizeObserver/);
assert.match(marqueeSource, /gsap\.fromTo/);
assert.match(marqueeSource, /ScrollTrigger\.create/);
assert.match(globalSource, /import \{ initMarquees \} from '\$components\/marquee';/);
assert.match(globalSource, /initMarquees\(\);/);
assert.doesNotMatch(globalSource, /duplicateMarqueeList/);

console.log('marquee source checks passed');
