import assert from 'node:assert/strict';
import test from 'node:test';

class FakeElement extends EventTarget {
  constructor(attributes = {}) {
    super();
    this.attributes = new Map(Object.entries(attributes));
    this.childrenBySelector = new Map();
    this.hidden = false;
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  querySelector(selector) {
    return this.childrenBySelector.get(selector) ?? null;
  }

  setChild(selector, child) {
    this.childrenBySelector.set(selector, child);
  }
}

class FakeVideo extends EventTarget {
  constructor() {
    super();
    this.paused = true;
    this.ended = false;
    this.autoplay = false;
    this.muted = true;
    this.playsInline = true;
    this.playCalls = 0;
    this.pauseCalls = 0;
    this.playError = null;
    this.deferPlay = false;
    this.playRequests = [];
  }

  play() {
    this.playCalls += 1;
    if (this.playError) return Promise.reject(this.playError);

    if (this.deferPlay) {
      return new Promise((resolve, reject) => {
        this.playRequests.push({ resolve, reject });
      });
    }

    this.paused = false;
    this.dispatchEvent(new Event('play'));
    return Promise.resolve();
  }

  resolvePlay(index) {
    this.paused = false;
    this.dispatchEvent(new Event('play'));
    this.playRequests[index].resolve();
  }

  rejectPlay(index, error = new Error('blocked')) {
    this.playRequests[index].reject(error);
  }

  pause() {
    this.pauseCalls += 1;
    this.paused = true;
    this.dispatchEvent(new Event('pause'));
  }
}

globalThis.HTMLVideoElement = FakeVideo;

class FakeIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.observed = [];
    this.disconnected = false;
  }

  observe(element) {
    this.observed.push(element);
  }

  disconnect() {
    this.disconnected = true;
  }

  trigger(target, isIntersecting) {
    this.callback([{ target, isIntersecting }]);
  }
}

const { initVideoPlayers } = await import('../src/components/video-player.ts');

function createFixture(attributes = {}) {
  const component = new FakeElement(attributes);
  const video = new FakeVideo();
  const toggle = new FakeElement();
  const playIcon = new FakeElement();
  const pauseIcon = new FakeElement();

  component.setChild('[data-video-el="player"]', video);
  component.setChild('[data-video-el="toggle"]', toggle);
  component.setChild('[data-video-el="play-icon"]', playIcon);
  component.setChild('[data-video-el="pause-icon"]', pauseIcon);

  const root = {
    querySelectorAll(selector) {
      assert.equal(selector, '[data-video-el="component"]');
      return [component];
    },
  };

  return { component, pauseIcon, playIcon, root, toggle, video };
}

function createDependencies({ hover = true, reducedMotion = false } = {}) {
  const observers = [];
  return {
    observers,
    dependencies: {
      createIntersectionObserver(callback) {
        const observer = new FakeIntersectionObserver(callback);
        observers.push(observer);
        return observer;
      },
      matchMedia(query) {
        return {
          matches: query.includes('prefers-reduced-motion') ? reducedMotion : hover,
        };
      },
    },
  };
}

test('binds a native video toggle and reflects actual playback state', async () => {
  const { component, pauseIcon, playIcon, root, toggle, video } = createFixture();

  const players = initVideoPlayers(root);

  assert.equal(players.length, 1);
  assert.equal(component.getAttribute('data-video-state'), 'paused');
  assert.equal(toggle.getAttribute('aria-label'), 'Play video');
  assert.equal(playIcon.hidden, false);
  assert.equal(pauseIcon.hidden, true);

  toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();

  assert.equal(video.playCalls, 1);
  assert.equal(component.getAttribute('data-video-state'), 'playing');
  assert.equal(toggle.getAttribute('aria-label'), 'Pause video');
  assert.equal(playIcon.hidden, true);
  assert.equal(pauseIcon.hidden, false);

  toggle.dispatchEvent(new Event('click'));

  assert.equal(video.pauseCalls, 1);
  assert.equal(component.getAttribute('data-video-state'), 'paused');
});

test('skips invalid components without a native video element', () => {
  const component = new FakeElement();
  const root = { querySelectorAll: () => [component] };
  const originalWarn = console.warn;
  console.warn = () => {};

  try {
    assert.deepEqual(initVideoPlayers(root), []);
  } finally {
    console.warn = originalWarn;
  }
});

test('repeated initialisation reuses the existing player without duplicate listeners', async () => {
  const { root, toggle, video } = createFixture();

  const first = initVideoPlayers(root);
  const second = initVideoPlayers(root);

  assert.equal(first[0], second[0]);
  toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();
  assert.equal(video.playCalls, 1);
});

test('reflects native playback events when no custom toggle is authored', () => {
  const { component, root, video } = createFixture();
  component.childrenBySelector.delete('[data-video-el="toggle"]');
  component.childrenBySelector.delete('[data-video-el="play-icon"]');
  component.childrenBySelector.delete('[data-video-el="pause-icon"]');

  const players = initVideoPlayers(root);
  video.paused = false;
  video.dispatchEvent(new Event('play'));
  assert.equal(component.getAttribute('data-video-state'), 'playing');

  video.ended = true;
  video.dispatchEvent(new Event('ended'));
  assert.equal(component.getAttribute('data-video-state'), 'ended');

  video.dispatchEvent(new Event('error'));
  assert.equal(component.getAttribute('data-video-state'), 'error');
  players[0].destroy();
});

test('keeps the paused UI when native play rejects', async () => {
  const { component, pauseIcon, playIcon, root, toggle, video } = createFixture();
  video.playError = new Error('blocked');
  const originalError = console.error;
  console.error = () => {};

  try {
    initVideoPlayers(root);
    toggle.dispatchEvent(new Event('click'));
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(component.getAttribute('data-video-state'), 'paused');
    assert.equal(toggle.getAttribute('aria-label'), 'Play video');
    assert.equal(playIcon.hidden, false);
    assert.equal(pauseIcon.hidden, true);
  } finally {
    console.error = originalError;
  }
});

test('plays in view and pauses out of view when explicitly enabled', async () => {
  const { component, root, video } = createFixture({ 'data-video-inview': 'true' });
  const { dependencies, observers } = createDependencies();

  initVideoPlayers(root, dependencies);
  assert.deepEqual(observers[0].observed, [component]);

  observers[0].trigger(component, true);
  await Promise.resolve();
  assert.equal(video.playCalls, 1);

  observers[0].trigger(component, false);
  assert.equal(video.pauseCalls, 1);
});

test('fails closed for in-view playback without muted and playsinline', () => {
  const { root, video } = createFixture({ 'data-video-inview': 'true' });
  const { dependencies, observers } = createDependencies();
  video.muted = false;
  video.playsInline = false;
  const originalWarn = console.warn;
  console.warn = () => {};

  try {
    initVideoPlayers(root, dependencies);
    assert.equal(observers.length, 0);
  } finally {
    console.warn = originalWarn;
  }
});

test('supports opt-in muted hover playback on fine pointers', async () => {
  const { component, root, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies({ hover: true });

  initVideoPlayers(root, dependencies);
  component.dispatchEvent(new Event('mouseenter'));
  await Promise.resolve();
  assert.equal(video.playCalls, 1);

  component.dispatchEvent(new Event('mouseleave'));
  assert.equal(video.pauseCalls, 1);
});

test('hover mode takes ownership of authored autoplay on fine pointers', () => {
  const { root, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies({ hover: true });
  video.autoplay = true;
  video.paused = false;

  initVideoPlayers(root, dependencies);

  assert.equal(video.autoplay, false);
  assert.equal(video.pauseCalls, 1);
});

test('reduced motion disables automatic playback but preserves manual controls', async () => {
  const { component, root, toggle, video } = createFixture({
    'data-video-hover': 'true',
    'data-video-inview': 'true',
  });
  const { dependencies, observers } = createDependencies({ reducedMotion: true });

  initVideoPlayers(root, dependencies);
  component.dispatchEvent(new Event('mouseenter'));
  assert.equal(video.playCalls, 0);
  assert.equal(observers.length, 0);

  toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();
  assert.equal(video.playCalls, 1);
});

test('reduced motion disables an authored native autoplay attribute', () => {
  const { root, video } = createFixture();
  const { dependencies } = createDependencies({ reducedMotion: true });
  video.autoplay = true;
  video.paused = false;

  initVideoPlayers(root, dependencies);

  assert.equal(video.autoplay, false);
  assert.equal(video.pauseCalls, 1);
});

test('in-view mode pauses native autoplay when the component starts out of view', () => {
  const { component, root, video } = createFixture({ 'data-video-inview': 'true' });
  const { dependencies, observers } = createDependencies();
  video.autoplay = true;
  video.paused = false;

  initVideoPlayers(root, dependencies);
  observers[0].trigger(component, false);

  assert.equal(video.pauseCalls, 1);
});

test('in-view mode blocks delayed native autoplay while still out of view', () => {
  const { component, root, video } = createFixture({ 'data-video-inview': 'true' });
  const { dependencies, observers } = createDependencies();
  video.autoplay = true;

  initVideoPlayers(root, dependencies);
  observers[0].trigger(component, false);
  video.paused = false;
  video.dispatchEvent(new Event('play'));

  assert.equal(video.autoplay, false);
  assert.equal(video.pauseCalls, 1);
});

test('in-view playback remains active after hover ends while still visible', async () => {
  const { component, root, video } = createFixture({
    'data-video-hover': 'true',
    'data-video-inview': 'true',
  });
  const { dependencies, observers } = createDependencies();

  initVideoPlayers(root, dependencies);
  observers[0].trigger(component, true);
  await Promise.resolve();
  component.dispatchEvent(new Event('mouseenter'));
  component.dispatchEvent(new Event('mouseleave'));

  assert.equal(video.pauseCalls, 0);
});

test('hover playback remains active after leaving the viewport while still hovered', async () => {
  const { component, root, video } = createFixture({
    'data-video-hover': 'true',
    'data-video-inview': 'true',
  });
  const { dependencies, observers } = createDependencies();

  initVideoPlayers(root, dependencies);
  component.dispatchEvent(new Event('mouseenter'));
  await Promise.resolve();
  observers[0].trigger(component, true);
  observers[0].trigger(component, false);

  assert.equal(video.pauseCalls, 0);
  component.dispatchEvent(new Event('mouseleave'));
  assert.equal(video.pauseCalls, 1);
});

test('ignores stale automatic play rejection after a newer request starts playing', async () => {
  const { component, root, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies();
  video.deferPlay = true;
  const originalError = console.error;
  console.error = () => {};

  try {
    initVideoPlayers(root, dependencies);
    component.dispatchEvent(new Event('mouseenter'));
    component.dispatchEvent(new Event('mouseleave'));
    component.dispatchEvent(new Event('mouseenter'));

    video.resolvePlay(1);
    video.rejectPlay(0, new Error('superseded'));
    await new Promise((resolve) => setImmediate(resolve));
    component.dispatchEvent(new Event('mouseleave'));

    assert.equal(video.pauseCalls, 2);
  } finally {
    console.error = originalError;
  }
});

test('ignores stale manual play rejection after a newer manual request starts playing', async () => {
  const { component, root, toggle, video } = createFixture({ 'data-video-inview': 'true' });
  const { dependencies, observers } = createDependencies();
  video.deferPlay = true;
  const originalError = console.error;
  console.error = () => {};

  try {
    initVideoPlayers(root, dependencies);
    toggle.dispatchEvent(new Event('click'));
    toggle.dispatchEvent(new Event('click'));

    video.resolvePlay(1);
    video.rejectPlay(0, new Error('superseded'));
    await new Promise((resolve) => setImmediate(resolve));
    observers[0].trigger(component, false);

    assert.equal(video.pauseCalls, 0);
  } finally {
    console.error = originalError;
  }
});

test('hover exit does not pause playback started manually', async () => {
  const { component, root, toggle, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies();

  initVideoPlayers(root, dependencies);
  toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();
  component.dispatchEvent(new Event('mouseleave'));

  assert.equal(video.pauseCalls, 0);
});

test('exclusive players pause one another without affecting ordinary players', async () => {
  const first = createFixture({ 'data-video-exclusive': 'true' });
  const second = createFixture({ 'data-video-exclusive': 'true' });
  const ordinary = createFixture();
  const root = {
    querySelectorAll: () => [first.component, second.component, ordinary.component],
  };

  initVideoPlayers(root, createDependencies().dependencies);
  ordinary.toggle.dispatchEvent(new Event('click'));
  first.toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();
  second.toggle.dispatchEvent(new Event('click'));
  await Promise.resolve();

  assert.equal(first.video.pauseCalls, 1);
  assert.equal(ordinary.video.pauseCalls, 0);
});

test('destroy cancels pending automatic playback even if it later resolves', async () => {
  const { component, root, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies();
  video.deferPlay = true;
  const [player] = initVideoPlayers(root, dependencies);

  component.dispatchEvent(new Event('mouseenter'));
  player.destroy();
  video.resolvePlay(0);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(video.paused, true);
  assert.equal(video.pauseCalls, 2);
});

test('destroy cancels pending manual playback even if it later resolves', async () => {
  const { root, toggle, video } = createFixture();
  video.deferPlay = true;
  const [player] = initVideoPlayers(root);

  toggle.dispatchEvent(new Event('click'));
  player.destroy();
  video.resolvePlay(0);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(video.paused, true);
  assert.equal(video.pauseCalls, 2);
});

test('a stale exclusive request cannot reclaim playback from a newer player', async () => {
  const first = createFixture({ 'data-video-exclusive': 'true' });
  const second = createFixture({ 'data-video-exclusive': 'true' });
  first.video.deferPlay = true;
  second.video.deferPlay = true;

  initVideoPlayers(first.root);
  initVideoPlayers(second.root);
  first.toggle.dispatchEvent(new Event('click'));
  second.toggle.dispatchEvent(new Event('click'));

  second.video.resolvePlay(0);
  first.video.resolvePlay(0);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(first.video.paused, true);
  assert.equal(second.video.paused, false);
  assert.equal(second.video.pauseCalls, 0);
});

test('destroy pauses controller-started automatic playback', async () => {
  const { component, root, video } = createFixture({ 'data-video-hover': 'true' });
  const { dependencies } = createDependencies();
  const [player] = initVideoPlayers(root, dependencies);

  component.dispatchEvent(new Event('mouseenter'));
  await Promise.resolve();
  player.destroy();

  assert.equal(video.pauseCalls, 1);
});

test('destroy disconnects observers and removes automatic playback listeners', async () => {
  const { component, root, video } = createFixture({
    'data-video-hover': 'true',
    'data-video-inview': 'true',
  });
  const { dependencies, observers } = createDependencies();
  const [player] = initVideoPlayers(root, dependencies);

  player.destroy();
  assert.equal(observers[0].disconnected, true);
  component.dispatchEvent(new Event('mouseenter'));
  await Promise.resolve();
  assert.equal(video.playCalls, 0);
});
