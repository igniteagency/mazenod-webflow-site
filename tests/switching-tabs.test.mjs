import { test, expect } from 'bun:test';

globalThis.window = { Webflow: [] };
const { AutoRotatingTabs } = await import('../src/components/switching-tabs.ts');

function setup(desktop = true) {
  const timers = new Map();
  let nextId = 0,
    observe,
    resets = 0;
  const mq = Object.assign(new EventTarget(), { matches: desktop });
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.window = {
    matchMedia: () => mq,
    setInterval: (fn) => {
      timers.set(++nextId, fn);
      return nextId;
    },
  };
  globalThis.clearInterval = (id) => timers.delete(id);
  globalThis.getComputedStyle = () => ({ getPropertyValue: () => '6s' });
  globalThis.IntersectionObserver = class {
    constructor(fn) {
      observe = fn;
    }
    observe() {}
    disconnect() {}
  };
  const classes = new Set();
  const summaries = [new EventTarget(), new EventTarget()];
  const tabs = summaries.map((summary, i) => ({ open: i === 0, querySelector: () => summary }));
  const component = {
    querySelectorAll: () => tabs,
    classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) },
    get offsetWidth() {
      expect(classes.has('is-out-of-view')).toBe(true);
      resets++;
      return 100;
    },
  };
  const instance = new AutoRotatingTabs(component);
  return {
    timers,
    tabs,
    classes,
    summaries,
    instance,
    mq,
    enter(ratio = 1) {
      observe([{ target: component, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
    },
    resets: () => resets,
  };
}

test('starts stopped, runs on entry, and ignores duplicate visibility notifications', () => {
  const s = setup();
  expect(s.classes.has('is-out-of-view')).toBe(true);
  s.enter();
  const timer = [...s.timers.keys()][0];
  s.enter();
  expect([...s.timers.keys()]).toEqual([timer]);
  expect(s.resets()).toBe(1);
  [...s.timers.values()][0]();
  expect(s.tabs.map((t) => t.open)).toEqual([false, true]);
  expect(s.timers.size).toBe(1);
  s.instance.destroy();
});

test('re-entry resets both progress and timer, including a short initial intersection', () => {
  const s = setup();
  s.enter(0.05);
  expect(s.timers.size).toBe(0);
  s.enter();
  s.enter(0);
  s.enter();
  expect(s.resets()).toBe(2);
  expect(s.timers.size).toBe(1);
  s.instance.destroy();
});

test('manual selection starts a fresh cycle and tab visibility pauses/resumes it', () => {
  const s = setup();
  s.enter();
  s.summaries[1].dispatchEvent(new Event('click', { cancelable: true }));
  expect(s.tabs.map((t) => t.open)).toEqual([false, true]);
  expect(s.resets()).toBe(2);
  document.hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
  expect(s.timers.size).toBe(0);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  expect(s.resets()).toBe(3);
  expect(s.timers.size).toBe(1);
  s.instance.destroy();
  expect(s.timers.size).toBe(0);
});

test('mobile remains manual with no misleading autoplay progress', () => {
  const s = setup(false);
  s.summaries[1].dispatchEvent(new Event('click', { cancelable: true }));
  expect(s.tabs[1].open).toBe(true);
  expect(s.timers.size).toBe(0);
  expect(s.classes.has('is-out-of-view')).toBe(true);
  s.instance.destroy();
});
