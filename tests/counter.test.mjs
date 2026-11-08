import { expect, test } from 'bun:test';

globalThis.window = { Webflow: [] };
const { initCounters } = await import('../src/components/counter.ts');

function setup(texts = ['80.5', '33', '15%'], reduced = false, supported = true) {
  const frames = new Map();
  const observed = new Set();
  let notify,
    id = 0;
  const media = Object.assign(new EventTarget(), { matches: reduced });
  const elements = texts.map((text) => ({
    dataset: {},
    tagName: 'DIV',
    textContent: text,
    set innerHTML(value) {
      this.textContent = value;
    },
  }));
  globalThis.requestAnimationFrame = (fn) => {
    frames.set(++id, fn);
    return id;
  };
  globalThis.cancelAnimationFrame = (key) => frames.delete(key);
  globalThis.IntersectionObserver = class {
    constructor(fn) {
      notify = fn;
    }
    observe(el) {
      observed.add(el);
    }
    unobserve(el) {
      observed.delete(el);
    }
    disconnect() {
      observed.clear();
    }
  };
  globalThis.document = { querySelectorAll: () => elements };
  globalThis.window = { matchMedia: () => media };
  if (supported) window.IntersectionObserver = globalThis.IntersectionObserver;
  initCounters();
  return {
    media,
    elements,
    frames,
    observed,
    values: () => elements.map((e) => e.textContent),
    enter(ratio = 1) {
      notify(
        elements.map((target) => ({ target, isIntersecting: ratio > 0, intersectionRatio: ratio }))
      );
    },
    frame(time) {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((fn) => fn(time));
    },
  };
}

test('waits for visibility, counts decimal/integer/percentage, and runs only once', () => {
  const s = setup();
  expect(s.values()).toEqual(['80.5', '33', '15%']);
  s.enter(0.1);
  expect(s.frames.size).toBe(0);
  s.enter();
  expect(s.values()).toEqual(['0.0', '0', '0%']);
  s.frame(1);
  s.frame(500);
  expect(Number(s.values()[0])).toBeGreaterThan(0);
  expect(Number(s.values()[0])).toBeLessThan(80.5);
  expect(s.values()[2]).toEndWith('%');
  s.frame(6000);
  expect(s.values()).toEqual(['80.5', '33', '15%']);
  s.enter(0);
  s.enter();
  initCounters();
  s.enter();
  expect(s.frames.size).toBe(0);
  expect(s.observed.size).toBe(0);
});

test('leaves final values intact for reduced motion or missing observer support', () => {
  for (const [reduced, supported] of [
    [true, true],
    [false, false],
  ]) {
    const s = setup(undefined, reduced, supported);
    expect(s.values()).toEqual(['80.5', '33', '15%']);
    expect(s.frames.size).toBe(0);
    expect(s.observed.size).toBe(0);
  }
});

test('switching to reduced motion cancels animations and restores authored figures', () => {
  const s = setup();
  s.enter();
  s.frame(1);
  s.frame(500);
  s.media.matches = true;
  s.media.dispatchEvent(new Event('change'));
  expect(s.values()).toEqual(['80.5', '33', '15%']);
  expect(s.frames.size).toBe(0);
  expect(s.observed.size).toBe(0);
});

test('preserves suffixes, grouping and precision, and ignores non-numeric content', () => {
  const s = setup(['1,234', '99.00%', '40+', 'Not available', '2025–2026']);
  s.enter();
  for (let time = 1; time < 10000; time += 100) s.frame(time);
  expect(s.values()).toEqual(['1,234', '99.00%', '40+', 'Not available', '2025–2026']);
});
