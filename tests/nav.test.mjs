import { afterEach, beforeEach, describe, expect, test } from 'bun:test';

import { initNav } from '../src/components/nav';

function element() {
  const classes = new Set();
  const listeners = new Map();
  return {
    dataset: {},
    style: {},
    focused: false,
    open: false,
    classList: {
      contains: (name) => classes.has(name),
      toggle: (name, enabled) => (enabled ? classes.add(name) : classes.delete(name)),
    },
    querySelector: () => null,
    querySelectorAll: () => [],
    matches(selector) {
      return selector === ':focus-within' ? this.focused : this.open;
    },
    addEventListener(name, listener) {
      listeners.set(name, [...(listeners.get(name) || []), listener]);
    },
    emit(name) {
      for (const listener of listeners.get(name) || []) listener({});
    },
  };
}

const originalGlobals = {
  window: globalThis.window,
  document: globalThis.document,
  MutationObserver: globalThis.MutationObserver,
};

describe('navbar scrolling', () => {
  let wrapper, navbar, popover;
  let frames;

  beforeEach(() => {
    wrapper = element();
    navbar = element();
    popover = element();
    frames = [];
    wrapper.querySelector = (selector) => (selector === '.navbar_component' ? navbar : null);
    wrapper.querySelectorAll = (selector) => (selector === '[popover]' ? [popover] : []);
    globalThis.window = Object.assign(element(), {
      scrollY: 0,
      innerHeight: 800,
      matchMedia: () => ({ matches: false }),
      requestAnimationFrame: (callback) => frames.push(callback),
    });
    globalThis.document = Object.assign(element(), {
      body: element(),
      documentElement: Object.assign(element(), { scrollHeight: 3000 }),
      querySelectorAll: () => [wrapper],
    });
    globalThis.MutationObserver = class {
      observe() {}
    };
    initNav();
  });

  afterEach(() => Object.assign(globalThis, originalGlobals));

  function scrollTo(y) {
    window.scrollY = y;
    window.emit('scroll');
    for (const callback of frames.splice(0)) callback();
  }

  test('stays visible near the top, hides going down, and returns going up', () => {
    scrollTo(80);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    expect(navbar.classList.contains('is-transparent')).toBe(true);
    scrollTo(450);
    expect(wrapper.classList.contains('is-hidden')).toBe(true);
    expect(navbar.classList.contains('is-transparent')).toBe(false);
    scrollTo(400);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    scrollTo(0);
    expect(navbar.classList.contains('is-transparent')).toBe(true);
  });

  test('a popover toggle reveals the header without applying a second scroll lock', () => {
    scrollTo(450);
    popover.open = true;
    popover.emit('toggle');
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    scrollTo(600);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    expect(document.body.style.position).toBeUndefined();
    popover.open = false;
    popover.emit('toggle');
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    scrollTo(650);
    expect(wrapper.classList.contains('is-hidden')).toBe(true);
  });

  test('keyboard focus immediately reveals the header and keeps it visible', () => {
    scrollTo(450);
    wrapper.focused = true;
    wrapper.emit('focusin');
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    scrollTo(650);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    wrapper.focused = false;
    scrollTo(700);
    expect(wrapper.classList.contains('is-hidden')).toBe(true);
  });

  test('duplicate scroll events and bottom overscroll do not reveal the header', () => {
    scrollTo(2200);
    scrollTo(2200);
    expect(wrapper.classList.contains('is-hidden')).toBe(true);
    scrollTo(2300);
    scrollTo(2200);
    expect(wrapper.classList.contains('is-hidden')).toBe(true);
    scrollTo(2100);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
  });

  test('restores the header at the top and through top overscroll', () => {
    scrollTo(400);
    scrollTo(-30);
    scrollTo(0);
    expect(wrapper.classList.contains('is-hidden')).toBe(false);
    expect(navbar.classList.contains('is-transparent')).toBe(true);
  });
});
