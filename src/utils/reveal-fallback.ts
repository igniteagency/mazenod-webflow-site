const REVEAL_SELECTOR = '[data-reveal], [data-reveal-stagger]';
const REVEAL_STAGGER_CHILDREN_SELECTOR = ":scope > *:not(.display-contents):not([class*='spacer'])";
const REVEALED_CLASS = 'is-revealed';
const FALLBACK_CLASS = 'reveal-fallback';
const LOG_PREFIX = '[KRB reveal fallback]';
const TRIGGER_VIEWPORT_RATIO = 0.5;
const INITIAL_REVEAL_CHECK_DELAYS = [0, 100, 500, 1000];
const DEFAULT_REVEAL_DURATION = 800;
const DEFAULT_REVEAL_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';
const DEFAULT_REVEAL_STAGGER = 80;
const DEFAULT_REVEAL_Y = '3rem';

function supportsNativeRevealAnimations() {
  return CSS.supports('animation-trigger: --reveal-trigger play-once');
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getRootCustomProperty(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function parseTime(value: string, fallback: number) {
  if (!value) return fallback;

  const numericValue = parseFloat(value);
  if (Number.isNaN(numericValue)) return fallback;

  return value.includes('ms') ? numericValue : numericValue * 1000;
}

function getRevealDuration() {
  return parseTime(getRootCustomProperty('--reveal-duration'), DEFAULT_REVEAL_DURATION);
}

function getRevealStagger() {
  return parseTime(getRootCustomProperty('--reveal-stagger'), DEFAULT_REVEAL_STAGGER);
}

function getRevealEase() {
  return getRootCustomProperty('--reveal-ease') || DEFAULT_REVEAL_EASE;
}

function getRevealDistance() {
  return (
    getRootCustomProperty('--animation--fade-distance') ||
    getRootCustomProperty('--reveal-y') ||
    DEFAULT_REVEAL_Y
  );
}

function getStaggerChildren(element: HTMLElement) {
  return Array.from(element.querySelectorAll<HTMLElement>(REVEAL_STAGGER_CHILDREN_SELECTOR)).filter(
    (child) => !child.closest('[data-stagger-stop]')
  );
}

function getRevealTargets(element: HTMLElement) {
  return element.hasAttribute('data-reveal-stagger') ? getStaggerChildren(element) : [element];
}

function setStaggerIndexes(element: HTMLElement) {
  if (!element.hasAttribute('data-reveal-stagger')) return;

  getStaggerChildren(element).forEach((child, index) => {
    child.style.setProperty('--reveal-index', String(index));
  });
}

function setFallbackInitialState(element: HTMLElement) {
  getRevealTargets(element).forEach((target) => {
    target.style.opacity = getRootCustomProperty('--reveal-opacity') || '0';
    target.style.transform = `translateY(${getRevealDistance()})`;
  });
}

function animateRevealTarget(target: HTMLElement, delay: number) {
  const duration = getRevealDuration();
  const easing = getRevealEase();
  const revealY = getRevealDistance();

  target.style.opacity = getRootCustomProperty('--reveal-opacity') || '0';
  target.style.transform = `translateY(${revealY})`;

  if (target.animate) {
    const animation = target.animate(
      [
        { opacity: target.style.opacity, transform: `translateY(${revealY})` },
        { opacity: '1', transform: 'translateY(0)' },
      ],
      {
        delay,
        duration,
        easing,
        fill: 'forwards',
      }
    );

    animation.onfinish = () => {
      target.style.opacity = '1';
      target.style.transform = 'translateY(0)';
    };

    return;
  }

  window.setTimeout(() => {
    target.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    target.style.opacity = '1';
    target.style.transform = 'translateY(0)';
  }, delay);
}

function reveal(element: HTMLElement, shouldLog = false) {
  if (element.classList.contains(REVEALED_CLASS)) return false;

  element.classList.add(REVEALED_CLASS);

  const stagger = getRevealStagger();
  getRevealTargets(element).forEach((target, index) => {
    animateRevealTarget(target, element.hasAttribute('data-reveal-stagger') ? index * stagger : 0);
  });

  if (shouldLog) {
    console.info(`${LOG_PREFIX} Revealed element.`, { element });
  }

  return true;
}

function initViewportFallback(revealElements: NodeListOf<HTMLElement>) {
  const unrevealedElements = new Set(revealElements);
  let isTicking = false;

  revealElements.forEach(setFallbackInitialState);

  const checkRevealElements = () => {
    const triggerPoint = window.innerHeight * TRIGGER_VIEWPORT_RATIO;

    unrevealedElements.forEach((element) => {
      if (element.getBoundingClientRect().top > triggerPoint) return;

      reveal(element, true);
      unrevealedElements.delete(element);
    });

    if (!unrevealedElements.size) {
      window.removeEventListener('scroll', requestRevealCheck);
      window.removeEventListener('resize', requestRevealCheck);
    }
  };

  const requestRevealCheck = () => {
    if (isTicking) return;

    isTicking = true;
    window.requestAnimationFrame(() => {
      isTicking = false;
      checkRevealElements();
    });
  };

  window.addEventListener('scroll', requestRevealCheck, { passive: true });
  window.addEventListener('resize', requestRevealCheck);
  window.addEventListener('load', requestRevealCheck, { once: true });
  window.addEventListener('pageshow', requestRevealCheck);

  INITIAL_REVEAL_CHECK_DELAYS.forEach((delay) => {
    window.setTimeout(requestRevealCheck, delay);
  });
}

export function initRevealFallback() {
  const revealElements = document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR);

  if (!revealElements.length) return;

  revealElements.forEach(setStaggerIndexes);

  const nativeRevealSupported = supportsNativeRevealAnimations();
  const reducedMotion = prefersReducedMotion();

  if (reducedMotion) {
    console.info(`${LOG_PREFIX} Reduced motion requested; revealing elements without animation.`, {
      revealElementCount: revealElements.length,
    });
    revealElements.forEach((element) => element.classList.add(REVEALED_CLASS));
    return;
  }

  console.info(
    nativeRevealSupported
      ? `${LOG_PREFIX} Native CSS animation-trigger supported; using JS driver for consistent trigger timing.`
      : `${LOG_PREFIX} Native CSS animation-trigger unsupported; JS fallback active.`,
    {
      revealElementCount: revealElements.length,
      triggerViewportRatio: TRIGGER_VIEWPORT_RATIO,
    }
  );
  console.info(`${LOG_PREFIX} Using JS-driven viewport scroll fallback.`, {
    triggerViewportRatio: TRIGGER_VIEWPORT_RATIO,
  });

  document.documentElement.classList.add(FALLBACK_CLASS);
  initViewportFallback(revealElements);
}
