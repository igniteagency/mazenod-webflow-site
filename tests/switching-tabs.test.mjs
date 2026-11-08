import { test, expect } from 'bun:test';

globalThis.window = { Webflow: [] };
const { AutoRotatingTabs } = await import('../src/components/switching-tabs.ts');

function setup(desktop = true) {
  let observe;
  const mq = Object.assign(new EventTarget(), { matches: desktop });
  globalThis.document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.window = {
    matchMedia: () => mq,
  };
  globalThis.Node = EventTarget;
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
  const progress = tabs.map(() => new EventTarget());
  tabs.forEach((tab, index) => {
    tab.parentElement = { contains: (target) => target === progress[index] };
  });
  const component = Object.assign(new EventTarget(), {
    querySelectorAll: () => tabs,
    classList: { add: (x) => classes.add(x), remove: (x) => classes.delete(x) },
  });
  const instance = new AutoRotatingTabs(component);
  return {
    tabs,
    classes,
    summaries,
    instance,
    mq,
    enter(ratio = 1) {
      observe([{ target: component, isIntersecting: ratio > 0, intersectionRatio: ratio }]);
    },
    finish(index = 0, animationName = 'loaderLine') {
      const event = new Event('animationend');
      Object.defineProperties(event, {
        animationName: { value: animationName },
        target: { value: progress[index] },
      });
      component.dispatchEvent(event);
    },
  };
}

test('advances only when the active progress animation finishes', () => {
  const s = setup();
  s.enter();
  s.enter();
  s.finish(1);
  s.finish(0, 'unrelated');
  expect(s.tabs[0].open).toBe(true);
  s.finish();
  expect(s.tabs.map((t) => t.open)).toEqual([false, true]);
  s.finish(1);
  expect(s.tabs[0].open).toBe(true);
  s.instance.destroy();
});

test('ignores completion off-screen and resumes on re-entry', () => {
  const s = setup();
  s.enter(0.05);
  s.finish();
  expect(s.tabs[0].open).toBe(true);
  expect(s.classes.has('is-out-of-view')).toBe(true);
  s.enter();
  s.enter(0);
  s.finish();
  expect(s.tabs[0].open).toBe(true);
  s.enter();
  expect(s.classes.has('is-out-of-view')).toBe(false);
  s.finish();
  expect(s.tabs[1].open).toBe(true);
  s.instance.destroy();
});

test('manual selection, document visibility, and cleanup remain supported', () => {
  const s = setup();
  s.enter();
  s.summaries[1].dispatchEvent(new Event('click', { cancelable: true }));
  expect(s.tabs[1].open).toBe(true);
  document.hidden = true;
  document.dispatchEvent(new Event('visibilitychange'));
  s.finish(1);
  expect(s.tabs[1].open).toBe(true);
  expect(s.classes.has('is-out-of-view')).toBe(true);
  document.hidden = false;
  document.dispatchEvent(new Event('visibilitychange'));
  expect(s.classes.has('is-out-of-view')).toBe(false);
  s.instance.destroy();
  s.finish(1);
  expect(s.tabs[1].open).toBe(true);
});

test('mobile remains manual with no misleading autoplay progress', () => {
  const s = setup(false);
  s.finish();
  expect(s.tabs[0].open).toBe(true);
  s.summaries[1].dispatchEvent(new Event('click', { cancelable: true }));
  expect(s.tabs[1].open).toBe(true);
  expect(s.classes.has('is-out-of-view')).toBe(true);
  s.instance.destroy();
});
