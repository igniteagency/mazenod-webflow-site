import { CountUp } from 'countup.js';

const COUNTER_SELECTOR = '[data-el="counter"]';
const VISIBILITY_THRESHOLD = 0.5;

export function initCounters(): void {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;

  const pending = new Set<HTMLElement>();
  const active = new Map<HTMLElement, { counter: CountUp; text: string }>();
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(({ target, isIntersecting, intersectionRatio }) => {
        const element = target as HTMLElement;
        if (!isIntersecting || intersectionRatio < VISIBILITY_THRESHOLD || !pending.has(element)) {
          return;
        }
        pending.delete(element);
        observer.unobserve(element);
        if (motion.matches) return;

        const text = element.textContent?.trim() || '';
        const match = text.match(/^([^\d]*?)(-?\d+(?:,\d{3})*(?:\.\d+)?)([^\d]*)$/);
        if (!match) return;
        const [, prefix, number, suffix] = match;
        const value = Number(number.replaceAll(',', ''));
        if (!Number.isFinite(value)) return;

        const counter = new CountUp(element, value, {
          duration: Math.min(Math.log10(Math.abs(value) + 1) * 0.8 + 1, 5),
          decimalPlaces: number.split('.')[1]?.length || 0,
          useGrouping: number.includes(','),
          prefix,
          suffix,
        });
        if (counter.error) {
          element.textContent = text;
          console.error('CountUp error:', counter.error);
          return;
        }
        active.set(element, { counter, text });
        counter.start(() => {
          element.textContent = text;
          active.delete(element);
        });
      });
    },
    { threshold: VISIBILITY_THRESHOLD }
  );

  document.querySelectorAll<HTMLElement>(COUNTER_SELECTOR).forEach((element) => {
    if (element.dataset.counterInitialized) return;
    element.dataset.counterInitialized = 'true';
    pending.add(element);
    observer.observe(element);
  });

  motion.addEventListener('change', () => {
    if (!motion.matches) return;
    observer.disconnect();
    pending.clear();
    active.forEach(({ counter, text }, element) => {
      counter.reset();
      element.textContent = text;
    });
    active.clear();
  });
}

window.Webflow = window.Webflow || [];
window.Webflow.push(initCounters);
