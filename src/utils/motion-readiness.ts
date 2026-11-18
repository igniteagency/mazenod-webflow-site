const HERO_PAGE = '6a508df534dc5c66f1386217';
const HERO_DEADLINE = 3500;
const IMAGE_CROPS =
  '.info-block_image-wrapper, .double-image_big-image-wrapper, .double-image_small-image-wrapper, .card_image-wrapper, .featured-news_inner .news_image-wrapper, .multi-cta_cta-item';
const FOOTER_BLOCKS = [
  ['links', '.footer_top > :nth-child(1)'],
  ['identity', '.footer_top > :nth-child(2)'],
  ['contact', '.footer_top > :nth-child(3)'],
  ['divider', '.footer_component > .container-large > .divider'],
  ['acknowledgement', '.footer_acknowledgement-wrapper'],
  ['extras', '.footer_extras-wrap'],
] as const;

export function initMotionReadiness() {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const home = root.dataset.wfPage === HERO_PAGE;
  const started = performance.now();
  // A late enhancement must not cover or hide content already shown to the visitor.
  if (document.readyState === 'complete' || started >= HERO_DEADLINE) {
    root.classList.add('mzn-hero-released');
    root.dataset.mznMotionState = 'late-helper';
    return;
  }
  const alreadyPainted = performance.getEntriesByName('first-contentful-paint').length > 0;
  let heroReleased =
    !home ||
    reduce.matches ||
    scrollY > 8 ||
    (alreadyPainted && !matchMedia('(scripting: enabled)').matches) ||
    (document.activeElement !== document.body && document.activeElement !== root);
  let ix: Window['WF_IX'] | undefined;
  let footerFrame = 0;
  let geometryFrame = 0;
  const revealedFooter = new Set<string>();
  const interruptions = new AbortController();

  if (!reduce.matches) root.classList.add('mzn-motion-enabled');
  if (!heroReleased) root.classList.add('mzn-hero-boot');
  else root.classList.add('mzn-hero-released');

  function releaseHero(reason: string) {
    clearTimeout(deadline);
    if (heroReleased && root.dataset.mznHeroState) return;
    heroReleased = true;
    root.classList.remove('mzn-hero-boot');
    root.classList.add('mzn-hero-released');
    root.dataset.mznHeroState = reason;
    interruptions.abort();
  }

  const deadline = window.setTimeout(
    () => releaseHero('timeout'),
    Math.max(0, HERO_DEADLINE - started)
  );
  const releaseOnInput = () => releaseHero('interrupted');
  for (const name of ['pointerdown', 'touchstart', 'wheel', 'keydown']) {
    addEventListener(name, releaseOnInput, {
      once: true,
      capture: true,
      passive: true,
      signal: interruptions.signal,
    });
  }
  addEventListener(
    'scroll',
    () => {
      if (scrollY > 8) releaseHero('scrolled');
    },
    { passive: true, signal: interruptions.signal }
  );

  function failOpen(reason: string) {
    releaseHero(reason);
    root.classList.add('mzn-motion-failed');
    root.classList.remove('mzn-motion-enabled');
    root.dataset.mznMotionState = reason;
  }

  function emit(name: string) {
    if (!ix) return false;
    try {
      ix.emit(`mazenod:${name}`);
      return true;
    } catch (error) {
      console.error('[Mazenod motion] Native event failed', error);
      failOpen('event-error');
      return false;
    }
  }

  function measureVideo() {
    geometryFrame = 0;
    const hero = document.querySelector('.home-hero_root');
    const origin = hero?.querySelector('.home-hero_thumbnail-origin');
    const slot = hero?.querySelector('.home-hero_video-slot');
    const frame = hero?.querySelector('.home-hero_video-frame');
    if (!hero || !origin || !slot || !frame) return;
    if (reduce.matches || !CSS.supports('animation-timeline: --home-hero-expand')) {
      hero.classList.remove('mzn-video-ready');
      return;
    }
    const from = origin.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    if (from.width <= 0 || to.width <= 0) {
      hero.classList.remove('mzn-video-ready');
      return;
    }
    frame.style.setProperty('--mzn-video-width', `${from.width}px`);
    frame.style.setProperty('--mzn-video-x', `${from.left - to.left}px`);
    frame.style.setProperty('--mzn-video-y', `${from.top - to.top}px`);
    hero.classList.add('mzn-video-ready');
  }

  function queueGeometry() {
    if (!geometryFrame) geometryFrame = requestAnimationFrame(measureVideo);
  }

  function checkFooter() {
    footerFrame = 0;
    const footer = document.querySelector('.section_footer');
    const main = document.querySelector('main');
    if (!footer || !main || !ix || reduce.matches) return;
    const sticky = getComputedStyle(footer).position === 'sticky';
    const coverBottom = main.getBoundingClientRect().bottom;
    const atEnd = scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    for (const [name, selector] of FOOTER_BLOCKS) {
      if (revealedFooter.has(name)) continue;
      const element = footer.querySelector(selector);
      if (!element || !element.getClientRects().length) continue;
      const rect = element.getBoundingClientRect();
      const top = rect.top - new DOMMatrixReadOnly(getComputedStyle(element).transform).m42;
      const reached = sticky
        ? top < innerHeight && coverBottom <= top
        : top <= innerHeight * 0.85 || (atEnd && top < innerHeight);
      if (reached && emit(`footer-${name}`)) revealedFooter.add(name);
    }
  }

  function queueFooter() {
    if (!footerFrame) footerFrame = requestAnimationFrame(checkFooter);
  }

  async function imageReady(image: HTMLImageElement) {
    if (!image.complete) {
      await new Promise<void>((resolve, reject) => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => reject(new Error('image-error')), { once: true });
      });
    }
    if (!image.naturalWidth) throw new Error('image-error');
    if (image.decode) await image.decode();
  }

  function prepareImageReveals() {
    if (reduce.matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const images = [...entry.target.querySelectorAll<HTMLImageElement>('img')];
          // A fully clipped lazy image may not load until its wipe has already finished.
          for (const image of images) image.loading = 'eager';
          void Promise.allSettled(images.map(imageReady)).then(() => {
            entry.target.classList.add('mzn-image-ready');
          });
        }
      },
      { rootMargin: '100% 0px' }
    );
    document.querySelectorAll(IMAGE_CROPS).forEach((crop) => observer.observe(crop));
  }

  async function readyHero() {
    if (heroReleased) return;
    const hero = document.querySelector('.home-hero_root');
    if (!hero) return releaseHero('missing-hero');
    try {
      const images = [
        ...hero.querySelectorAll<HTMLImageElement>(
          '.hero-header_parallax-image-wrapper .bg-visual_component img'
        ),
      ];
      if (!images.length) throw new Error('missing-images');
      await Promise.all([
        Promise.all(images.map(imageReady)),
        Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 500))]),
      ]);
      if (heroReleased || reduce.matches || performance.now() >= HERO_DEADLINE) return;
      hero.classList.add('is-ready');
      root.dataset.mznHeroState = 'ready';
      if (!emit('hero-ready')) return releaseHero('missing-ix3');
      window.setTimeout(() => {
        if (heroReleased) return;
        clearTimeout(deadline);
        releaseHero('complete');
      }, 2100);
    } catch (error) {
      console.debug('[Mazenod motion] Hero released', error);
      releaseHero('media-error');
    }
  }

  function onDOMReady() {
    prepareImageReveals();
    measureVideo();
    const hero = document.querySelector('.home-hero_root');
    const slot = hero?.querySelector('.home-hero_video-slot');
    const stage = hero?.querySelector('.home-hero_stage');
    const video = hero?.querySelector<HTMLVideoElement>('video');
    const revealVideo = () => video?.closest('.home-hero_video-frame')?.classList.add('mzn-video-loaded');
    if (video && video.readyState >= 2) revealVideo();
    else video?.addEventListener('loadeddata', revealVideo, { once: true });
    const observer = new ResizeObserver(queueGeometry);
    if (slot) observer.observe(slot);
    if (stage) observer.observe(stage);
    video?.addEventListener('loadedmetadata', queueGeometry);
    document.fonts.ready.then(queueGeometry).catch(() => {});
    document.addEventListener('focusin', (event) => {
      const element = event.target;
      if (!(element instanceof Element)) return;
      const group = element.closest(
        '.cta_text-wrapper, .heading-lockup, .card_item, .multi-cta_cta-item, .news_item, .latest-news_newsletter-cta, .info-block_text-wrapper, .double-image_text-wrapper, .footer_top > *, .footer_acknowledgement-wrapper, .footer_extras-wrap'
      );
      group?.classList.add('mzn-motion-force-visible');
      if (element.closest('.home-hero_root')) releaseHero('focus');
    });
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', onDOMReady, { once: true });
  else onDOMReady();

  addEventListener(
    'resize',
    () => {
      releaseHero('resize');
      queueGeometry();
      queueFooter();
    },
    { passive: true }
  );
  addEventListener('scroll', queueFooter, { passive: true });
  addEventListener('pageshow', queueFooter);
  reduce.addEventListener('change', () => {
    if (reduce.matches) failOpen('reduced-motion');
    queueGeometry();
    queueFooter();
  });

  const runtimeDeadline = window.setTimeout(() => failOpen('runtime-timeout'), 5000);
  window.Webflow = window.Webflow || [];
  function connectNativeTimelines() {
    if (ix || root.classList.contains('mzn-motion-failed')) return;
    try {
      const runtime = window.Webflow as unknown as { require?: (name: string) => Window['WF_IX'] };
      ix = runtime?.require?.('ix3');
      if (typeof ix?.emit !== 'function') return failOpen('missing-ix3');
      clearTimeout(runtimeDeadline);
      requestAnimationFrame(() => {
        root.dataset.mznMotionState = 'ready';
        void readyHero();
        checkFooter();
      });
    } catch (error) {
      console.error('[Mazenod motion] Initialization failed', error);
      failOpen('initialization-error');
    }
  }
  // Webflow's module exists before its asynchronous timeline registration finishes.
  addEventListener('__wf_ix3_ready', connectNativeTimelines, { once: true });
  window.Webflow.push(() => {
    if (root.classList.contains('w-mod-ix3')) connectNativeTimelines();
  });
}
