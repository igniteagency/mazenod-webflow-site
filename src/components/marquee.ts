const TRACK_SELECTOR = '.marquee_track';
const LIST_SELECTOR = ':scope > [data-el="marquee-list"]';
const DEFAULT_DURATION_IN_SECONDS = 15;
const DEFAULT_SCROLL_INFLUENCE = 0.35;
const MIN_TIME_SCALE = 1;
const MAX_TIME_SCALE = 3;

export function calculateMarqueeCloneCount(containerWidth: number, listWidth: number) {
  if (containerWidth <= 0 || listWidth <= 0) return 0;

  return Math.max(2, Math.ceil(containerWidth / listWidth) + 1);
}

export function calculateMarqueeDuration(
  loopDistance: number,
  speedInPixelsPerSecond: number,
  fallbackDuration: number
) {
  if (Number.isFinite(speedInPixelsPerSecond) && speedInPixelsPerSecond > 0) {
    return loopDistance / speedInPixelsPerSecond;
  }

  return fallbackDuration;
}

export function initMarquees(root: ParentNode = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.error('GSAP and ScrollTrigger are required to initialise marquees.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  root.querySelectorAll<HTMLElement>(TRACK_SELECTOR).forEach(initMarqueeTrack);
}

function initMarqueeTrack(track: HTMLElement) {
  if (track.hasAttribute('data-marquee-initialised')) return;

  const sourceList = getSourceList(track);
  if (!sourceList) return;

  const container = track.closest<HTMLElement>('.image-marquee_component') || track.parentElement;
  if (!container) return;

  track.setAttribute('data-marquee-initialised', 'true');

  let animation: ReturnType<typeof gsap.fromTo> | null = null;
  let scrollTrigger: ReturnType<typeof ScrollTrigger.create> | null = null;
  let settleTween: ReturnType<typeof gsap.delayedCall> | null = null;
  let lastContainerWidth = 0;

  const rebuild = (force = false) => {
    const containerWidth = container.clientWidth;
    if (!force && Math.abs(containerWidth - lastContainerWidth) < 1) return;

    lastContainerWidth = containerWidth;
    animation?.kill();
    scrollTrigger?.kill();
    settleTween?.kill();
    removeGeneratedClones(track);
    sourceList.style.animation = 'none';
    gsap.set(sourceList, { clearProps: 'transform' });

    const listWidth = sourceList.offsetWidth;
    const cloneCount = calculateMarqueeCloneCount(containerWidth, listWidth);
    if (!cloneCount) return;

    for (let index = 0; index < cloneCount; index += 1) {
      track.appendChild(createAccessibleClone(sourceList));
    }

    const gap = Number.parseFloat(getComputedStyle(track).columnGap) || 0;
    const loopDistance = listWidth + gap;
    const speed = getNumericDataValue(sourceList, track, 'marqueeSpeed', 0);
    const fallbackDuration = getCssDuration(track);
    const duration = calculateMarqueeDuration(loopDistance, speed, fallbackDuration);
    const direction = sourceList.dataset.marqueeDirection === 'right' ? 'right' : 'left';
    const lists = Array.from(track.querySelectorAll<HTMLElement>(LIST_SELECTOR));
    const fromX = direction === 'right' ? -loopDistance : 0;
    const toX = direction === 'right' ? 0 : -loopDistance;

    animation = gsap.fromTo(
      lists,
      { x: fromX },
      {
        x: toX,
        duration,
        ease: 'none',
        repeat: -1,
      }
    );

    const scrollInfluence = Math.max(
      0,
      getNumericDataValue(sourceList, track, 'marqueeScrollInfluence', DEFAULT_SCROLL_INFLUENCE)
    );
    if (!scrollInfluence) return;

    scrollTrigger = ScrollTrigger.create({
      trigger: track,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: (self) => {
        if (!animation) return;

        const velocityBoost = (Math.abs(self.getVelocity()) / 1000) * scrollInfluence;
        const timeScale = Math.min(MAX_TIME_SCALE, Math.max(MIN_TIME_SCALE, 1 + velocityBoost));

        gsap.to(animation, { duration: 0.15, overwrite: true, timeScale });
        settleTween?.kill();
        settleTween = gsap.delayedCall(0.12, () => {
          if (animation) gsap.to(animation, { duration: 0.6, overwrite: true, timeScale: 1 });
        });
      },
    });
  };

  sourceList.querySelectorAll<HTMLImageElement>('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', () => rebuild(true), { once: true });
  });

  rebuild(true);
  new ResizeObserver(() => rebuild()).observe(container);
}

function getSourceList(track: HTMLElement) {
  return Array.from(track.querySelectorAll<HTMLElement>(LIST_SELECTOR)).find(
    (list) => list.dataset.marqueeClone !== 'true'
  );
}

function createAccessibleClone(sourceList: HTMLElement) {
  const clone = sourceList.cloneNode(true) as HTMLElement;
  clone.dataset.marqueeClone = 'true';
  clone.setAttribute('aria-hidden', 'true');
  clone.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
  clone
    .querySelectorAll<HTMLElement>('a, button, input, select, textarea, [tabindex]')
    .forEach((element) => element.setAttribute('tabindex', '-1'));

  return clone;
}

function removeGeneratedClones(track: HTMLElement) {
  track
    .querySelectorAll<HTMLElement>('[data-marquee-clone="true"]')
    .forEach((clone) => clone.remove());
}

function getNumericDataValue(
  sourceList: HTMLElement,
  track: HTMLElement,
  key: 'marqueeSpeed' | 'marqueeScrollInfluence',
  fallback: number
) {
  const value = Number.parseFloat(sourceList.dataset[key] || track.dataset[key] || '');
  return Number.isFinite(value) ? value : fallback;
}

function getCssDuration(track: HTMLElement) {
  const duration = Number.parseFloat(getComputedStyle(track).getPropertyValue('--duration'));
  return Number.isFinite(duration) && duration > 0 ? duration : DEFAULT_DURATION_IN_SECONDS;
}
