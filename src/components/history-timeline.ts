import { initLightboxGallery } from '$components/lightbox';

const COMPONENT_SELECTOR = '[data-history-timeline="component"], .history-timeline_component';
const SECTION_SELECTOR = '.section_history-timeline';
const MAIN_SWIPER_SELECTOR = '.history-timeline_swiper.swiper';
const MAIN_SLIDE_SELECTOR = '.history-timeline_slide.swiper-slide';
const NAV_SWIPER_SELECTOR = '.history-timeline_nav-swiper.swiper';
const NAV_WRAPPER_SELECTOR = '.history-timeline_nav-swiper-wrapper.swiper-wrapper';
const NAV_TEMPLATE_SELECTOR =
  '[data-history-timeline="nav-template"], .history-timeline_nav-swiper-slide.swiper-slide';
const NAV_SLIDE_CLASS = 'history-timeline_nav-swiper-slide swiper-slide';
const NAV_PREV_BUTTON_SELECTOR = '[data-slider-el="nav-prev"]';
const NAV_NEXT_BUTTON_SELECTOR = '[data-slider-el="nav-next"]';
const YEAR_TEXT_SELECTOR = '[data-history-year], .history-timeline_slide-overlay_number';
const LIGHTBOX_GALLERY_SELECTOR = '[data-lightbox-gallery]';
const LIGHTBOX_TEMPLATE_SELECTOR = '[data-lightbox-template], [data-newsletter-lightbox-template]';
const IMAGE_SELECTOR = '.history-timeline_slide-image';
const READ_MORE_SELECTOR = '[data-history-timeline="read-more"]';
const READ_MORE_TEXT_SELECTOR = '[data-history-timeline="read-more-text"]';
const READ_MORE_LABEL_SELECTOR = '.button_text';
const READ_MORE_STYLES_ID = 'history-timeline-read-more-styles';
const READ_MORE_LINE_COUNT = 4;
const READ_MORE_TRANSITION_DURATION_IN_MS = 400;
const SWIPER_JS_URL = 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js';
const DEFAULT_SWIPER_SPEED_IN_MS = 700;
const DEFAULT_IMAGE_ROTATION_DELAY_IN_MS = 3500;
const NAV_LOOP_COPY_COUNT = 3;
const NAV_LOOP_MIDDLE_COPY_INDEX = 1;
const INITIALISED_ATTRIBUTE = 'historyTimelineInitialised';
const ACTIVE_CLASS = 'is-active';
const PREVIOUS_CLASS = 'is-previous';
const NEXT_CLASS = 'is-next';
const DISABLED_CLASS = 'is-disabled';
const DURATION_ATTRIBUTE = 'historyTimelineDuration';
const IMAGE_DURATION_ATTRIBUTE = 'historyTimelineImageDuration';

type SwiperInstance = {
  activeIndex: number;
  realIndex: number;
  slideTo: (index: number, speed?: number, runCallbacks?: boolean) => void;
  slideToLoop?: (index: number, speed?: number) => void;
  on: (eventName: string, callback: () => void) => void;
  update: () => void;
};

type HistorySlide = {
  el: HTMLElement;
  year: string;
  images: HTMLImageElement[];
  imageIndex: number;
};

class HistoryTimeline {
  private readonly component: HTMLElement;
  private readonly section: HTMLElement;
  private readonly slides: HistorySlide[];
  private readonly speed: number;
  private readonly imageRotationDelay: number;
  private mainSwiper: SwiperInstance | null = null;
  private navSwiper: SwiperInstance | null = null;
  private imageRotationTimer: number | null = null;
  private navResetTimer: number | null = null;
  private navDisplayIndex = 0;

  constructor(component: HTMLElement) {
    this.component = component;
    this.section = component.closest<HTMLElement>(SECTION_SELECTOR) || component;
    this.slides = this.getSlides();
    this.speed = getPositiveNumber(
      component.dataset[DURATION_ATTRIBUTE],
      DEFAULT_SWIPER_SPEED_IN_MS
    );
    this.imageRotationDelay = getPositiveNumber(
      component.dataset[IMAGE_DURATION_ATTRIBUTE],
      DEFAULT_IMAGE_ROTATION_DELAY_IN_MS
    );
  }

  init() {
    if (this.component.dataset[INITIALISED_ATTRIBUTE] === 'true') return;

    const mainSwiperEl = this.component.querySelector<HTMLElement>(MAIN_SWIPER_SELECTOR);
    const navSwiperEl = this.section.querySelector<HTMLElement>(NAV_SWIPER_SELECTOR);
    const navWrapperEl = this.section.querySelector<HTMLElement>(NAV_WRAPPER_SELECTOR);

    if (!mainSwiperEl || !navSwiperEl || !navWrapperEl || !this.slides.length) {
      console.warn('Skipping invalid history timeline component', this.component);
      return;
    }

    this.component.dataset[INITIALISED_ATTRIBUTE] = 'true';
    this.buildYearNavigation(navWrapperEl);
    this.initNavigationEvents(navWrapperEl);
    this.initLightboxGalleries();
    this.initReadMoreControls();
    this.initImageStates();
    this.initSwipers(mainSwiperEl, navSwiperEl);
    this.navDisplayIndex = this.getMiddleNavDisplayIndex(0);
    this.syncToSlide(0, 0);
  }

  private getSlides() {
    return Array.from(this.component.querySelectorAll<HTMLElement>(MAIN_SLIDE_SELECTOR)).map(
      (el) => ({
        el,
        year: getSlideYear(el),
        images: Array.from(el.querySelectorAll<HTMLImageElement>(IMAGE_SELECTOR)),
        imageIndex: 0,
      })
    );
  }

  private buildYearNavigation(navWrapperEl: HTMLElement) {
    const template = navWrapperEl.querySelector<HTMLElement>(NAV_TEMPLATE_SELECTOR);

    const navSlides = Array.from({ length: NAV_LOOP_COPY_COUNT }).flatMap((_, copyIndex) =>
      this.slides.map((slide, index) => this.createNavSlide(slide.year, index, template, copyIndex))
    );

    navWrapperEl.replaceChildren(...navSlides);
  }

  private createNavSlide(
    year: string,
    index: number,
    template: HTMLElement | null,
    copyIndex: number
  ) {
    const navSlide = template
      ? (template.cloneNode(true) as HTMLElement)
      : document.createElement('button');

    navSlide.className = template?.className || NAV_SLIDE_CLASS;
    navSlide.removeAttribute('data-history-timeline');
    navSlide.dataset.historyYear = year;
    navSlide.dataset.historyIndex = String(index);
    navSlide.dataset.historyCopy = String(copyIndex);
    navSlide.setAttribute('role', 'button');
    navSlide.setAttribute('tabindex', '0');
    navSlide.setAttribute('aria-label', `Go to ${year}`);
    setNavSlideYear(navSlide, year);

    return navSlide;
  }

  private initNavigationEvents(navWrapperEl: HTMLElement) {
    const activate = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const navSlide = target.closest<HTMLElement>('.swiper-slide[data-history-index]');
      if (!navSlide || !navWrapperEl.contains(navSlide)) return;

      const index = Number(navSlide.dataset.historyIndex);
      if (!Number.isInteger(index)) return;

      if (this.mainSwiper?.slideToLoop) {
        this.mainSwiper.slideToLoop(index, this.speed);
        return;
      }

      this.mainSwiper?.slideTo(index, this.speed);
    };

    navWrapperEl.addEventListener('click', activate);
    navWrapperEl.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate(event);
    });
  }

  private initLightboxGalleries() {
    const template = this.section.querySelector<HTMLElement>(LIGHTBOX_TEMPLATE_SELECTOR);

    this.slides.forEach((slide) => {
      slide.el.querySelectorAll<HTMLElement>(LIGHTBOX_GALLERY_SELECTOR).forEach((gallery) => {
        initLightboxGallery({
          root: gallery,
          template,
          label: gallery.getAttribute('aria-label') || `${slide.year} history image gallery`,
        });
      });
    });
  }

  private initReadMoreControls() {
    const updateControls = Array.from(
      this.component.querySelectorAll<HTMLElement>(READ_MORE_SELECTOR)
    )
      .map((toggle) => initReadMoreControl(toggle))
      .filter((update): update is () => void => Boolean(update));

    if (!updateControls.length) return;

    let resizeFrame = 0;
    const updateAll = () => updateControls.forEach((update) => update());
    const scheduleUpdate = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updateAll);
    };

    scheduleUpdate();
    document.fonts?.ready.then(scheduleUpdate);
    window.addEventListener('resize', scheduleUpdate);
  }

  private initImageStates() {
    this.slides.forEach((slide) => {
      slide.images.forEach((image, index) => image.classList.toggle(ACTIVE_CLASS, index === 0));
      slide.imageIndex = 0;
    });
  }

  private initSwipers(mainSwiperEl: HTMLElement, navSwiperEl: HTMLElement) {
    const navPrevButtonEl = this.section.querySelector<HTMLElement>(NAV_PREV_BUTTON_SELECTOR);
    const navNextButtonEl = this.section.querySelector<HTMLElement>(NAV_NEXT_BUTTON_SELECTOR);

    this.navSwiper = new Swiper(navSwiperEl, {
      loop: false,
      slidesPerView: 'auto',
      centeredSlides: false,
      slideToClickedSlide: false,
      spaceBetween: 0,
      speed: this.speed,
      watchSlidesProgress: true,
      slideActiveClass: ACTIVE_CLASS,
      slidePrevClass: PREVIOUS_CLASS,
      slideNextClass: NEXT_CLASS,
      a11y: {
        enabled: true,
      },
    }) as SwiperInstance;

    this.mainSwiper = new Swiper(mainSwiperEl, {
      loop: true,
      speed: this.speed,
      spaceBetween: 0,
      slidesPerView: 1,
      navigation:
        navPrevButtonEl && navNextButtonEl
          ? {
              nextEl: navNextButtonEl,
              prevEl: navPrevButtonEl,
              disabledClass: DISABLED_CLASS,
            }
          : false,
      slideActiveClass: ACTIVE_CLASS,
      slidePrevClass: PREVIOUS_CLASS,
      slideNextClass: NEXT_CLASS,
      a11y: {
        enabled: true,
      },
    }) as SwiperInstance;

    this.mainSwiper.on('slideChange', () => this.syncToSlide(this.mainSwiper?.realIndex || 0));
    this.navSwiper.on('slideChange', () => this.syncMainToNav());
  }

  private syncMainToNav() {
    if (!this.navSwiper || !this.mainSwiper || !this.slides.length) return;

    const index = this.getLogicalNavIndex(this.navSwiper.activeIndex);
    this.navDisplayIndex = this.navSwiper.activeIndex;
    this.updateNavState(index);

    if (this.mainSwiper.realIndex === index) return;

    if (this.mainSwiper.slideToLoop) {
      this.mainSwiper.slideToLoop(index, this.speed);
      return;
    }

    this.mainSwiper.slideTo(index, this.speed);
  }

  private syncToSlide(index: number, speed = this.speed) {
    this.updateNavState(index);
    this.syncNavRail(index, speed);

    this.resetImageRotation(index);
  }

  private syncNavRail(index: number, speed: number) {
    if (!this.navSwiper || !this.slides.length) return;

    if (this.navResetTimer) {
      window.clearTimeout(this.navResetTimer);
      this.navResetTimer = null;
    }

    const currentLogicalIndex = this.getLogicalNavIndex(this.navDisplayIndex);
    const crossesLoopBoundary = Math.abs(index - currentLogicalIndex) > this.slides.length / 2;
    if (crossesLoopBoundary) {
      this.navDisplayIndex = this.getMiddleNavDisplayIndex(currentLogicalIndex);
      this.navSwiper.slideTo(this.navDisplayIndex, 0, false);
    }

    const targetIndex = this.getClosestNavDisplayIndex(index);
    this.navDisplayIndex = targetIndex;
    this.navSwiper.slideTo(targetIndex, speed, false);

    const middleIndex = this.getMiddleNavDisplayIndex(index);
    if (!crossesLoopBoundary || targetIndex === middleIndex) return;

    this.navResetTimer = window.setTimeout(
      () => {
        this.navDisplayIndex = middleIndex;
        this.navSwiper?.slideTo(middleIndex, 0, false);
        this.navResetTimer = null;
      },
      Math.max(speed, 0) + 50
    );
  }

  private getClosestNavDisplayIndex(index: number) {
    const slideCount = this.slides.length;
    const candidates = Array.from(
      { length: NAV_LOOP_COPY_COUNT },
      (_, copyIndex) => copyIndex * slideCount + index
    );

    return candidates.reduce((closestIndex, candidateIndex) =>
      Math.abs(candidateIndex - this.navDisplayIndex) <
      Math.abs(closestIndex - this.navDisplayIndex)
        ? candidateIndex
        : closestIndex
    );
  }

  private getMiddleNavDisplayIndex(index: number) {
    return NAV_LOOP_MIDDLE_COPY_INDEX * this.slides.length + index;
  }

  private getLogicalNavIndex(displayIndex: number) {
    if (!this.slides.length) return 0;

    return ((displayIndex % this.slides.length) + this.slides.length) % this.slides.length;
  }

  private updateNavState(activeIndex: number) {
    this.section
      .querySelectorAll<HTMLElement>(`${NAV_WRAPPER_SELECTOR} > .swiper-slide`)
      .forEach((slide) => {
        const isActive = Number(slide.dataset.historyIndex) === activeIndex;
        slide.classList.toggle(ACTIVE_CLASS, isActive);
        slide.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
  }

  private resetImageRotation(activeIndex: number) {
    if (this.imageRotationTimer) {
      window.clearInterval(this.imageRotationTimer);
      this.imageRotationTimer = null;
    }

    const slide = this.slides[activeIndex];
    if (!slide || slide.images.length < 2) return;

    slide.imageIndex = 0;
    this.setActiveImage(slide, 0);
    this.imageRotationTimer = window.setInterval(() => {
      slide.imageIndex = (slide.imageIndex + 1) % slide.images.length;
      this.setActiveImage(slide, slide.imageIndex);
    }, this.imageRotationDelay);
  }

  private setActiveImage(slide: HistorySlide, activeIndex: number) {
    slide.images.forEach((image, index) =>
      image.classList.toggle(ACTIVE_CLASS, index === activeIndex)
    );
  }
}

function getPositiveNumber(value: string | undefined, fallback: number) {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function getSlideYear(slide: HTMLElement) {
  const dataYear = slide.dataset.historyYear?.trim();
  const textYear = slide.querySelector<HTMLElement>(YEAR_TEXT_SELECTOR)?.textContent?.trim();

  return dataYear || textYear || '';
}

function setNavSlideYear(navSlide: HTMLElement, year: string) {
  const yearTarget = navSlide.querySelector<HTMLElement>('[data-history-year]');

  if (yearTarget) {
    yearTarget.textContent = year;
    yearTarget.dataset.historyYear = year;
    return;
  }

  const textTarget = Array.from(navSlide.children).find(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && Boolean(child.textContent?.trim())
  );

  if (textTarget) {
    textTarget.textContent = year;
    return;
  }

  navSlide.textContent = year;
}

let readMoreId = 0;

function initReadMoreControl(toggle: HTMLElement) {
  const button =
    toggle instanceof HTMLButtonElement
      ? toggle
      : toggle.querySelector<HTMLButtonElement>('button');
  if (!button || button.dataset.historyReadMoreInitialised === 'true') return null;

  const slide = button.closest<HTMLElement>(MAIN_SLIDE_SELECTOR);
  const container = button.closest<HTMLElement>('.button_component') || button;
  const explicitText = slide?.querySelector<HTMLElement>(READ_MORE_TEXT_SELECTOR);
  const text = explicitText || container.previousElementSibling;
  if (!(text instanceof HTMLElement)) {
    console.warn('Skipping history read more control without adjacent text', button);
    return null;
  }

  const label = button.querySelector<HTMLElement>(READ_MORE_LABEL_SELECTOR);
  const collapsedLabel = label?.textContent?.trim() || 'Read more';
  const expandedLabel = button.dataset.historyReadMoreExpandedLabel?.trim() || 'Read less';
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  let collapsedHeight = 0;
  let transitionTimer = 0;

  readMoreId += 1;
  text.id ||= `history-read-more-${readMoreId}`;
  text.dataset.historyReadMoreText = 'true';
  container.dataset.historyReadMoreContainer = 'true';
  button.dataset.historyReadMoreInitialised = 'true';
  button.type = 'button';
  button.setAttribute('aria-controls', text.id);

  const setButtonState = (expanded: boolean) => {
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? expandedLabel : collapsedLabel);
    if (label) label.textContent = expanded ? expandedLabel : collapsedLabel;
  };

  const setExpanded = (expanded: boolean) => {
    text.dataset.historyReadMoreExpanded = String(expanded);
    setButtonState(expanded);
  };

  setExpanded(false);
  button.addEventListener('click', () => {
    const expand = button.getAttribute('aria-expanded') !== 'true';
    window.clearTimeout(transitionTimer);

    if (prefersReducedMotion || !collapsedHeight) {
      text.style.maxHeight = '';
      text.style.overflow = '';
      setExpanded(expand);
      return;
    }

    const startHeight = text.getBoundingClientRect().height;
    text.style.maxHeight = `${startHeight}px`;
    text.style.overflow = 'hidden';

    if (expand) {
      setExpanded(true);
    } else {
      setButtonState(false);
    }

    const endHeight = expand ? text.scrollHeight : collapsedHeight;
    text.getBoundingClientRect();
    window.requestAnimationFrame(() => {
      text.style.maxHeight = `${endHeight}px`;
    });

    transitionTimer = window.setTimeout(() => {
      if (!expand) text.dataset.historyReadMoreExpanded = 'false';
      text.style.maxHeight = '';
      text.style.overflow = '';
      transitionTimer = 0;
    }, READ_MORE_TRANSITION_DURATION_IN_MS);
  });

  return () => {
    const wasExpanded = button.getAttribute('aria-expanded') === 'true';
    window.clearTimeout(transitionTimer);
    transitionTimer = 0;
    text.style.maxHeight = '';
    text.style.overflow = '';
    setExpanded(false);
    container.hidden = false;

    const isOverflowing = text.scrollHeight > text.clientHeight + 1;
    collapsedHeight = text.clientHeight;
    container.hidden = !isOverflowing;
    setExpanded(isOverflowing && wasExpanded);
  };
}

function addReadMoreStyles() {
  if (document.getElementById(READ_MORE_STYLES_ID)) return;

  const style = document.createElement('style');
  style.id = READ_MORE_STYLES_ID;
  style.textContent = `
    [data-history-read-more-text="true"] {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${READ_MORE_LINE_COUNT};
      line-clamp: ${READ_MORE_LINE_COUNT};
      overflow: hidden;
      transition: max-height ${READ_MORE_TRANSITION_DURATION_IN_MS}ms cubic-bezier(0.19, 1, 0.22, 1);
    }

    [data-history-read-more-text="true"][data-history-read-more-expanded="true"] {
      display: block;
      -webkit-line-clamp: unset;
      line-clamp: unset;
      overflow: visible;
    }

    [data-history-read-more-container="true"][hidden] {
      display: none !important;
    }

    .section_history-timeline .history-timeline_nav-swiper.swiper {
      width: 0;
      min-width: 0;
      flex: 1 1 auto;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-history-read-more-text="true"] {
        transition: none;
      }
    }
  `;
  document.head.appendChild(style);
}

function hasHistoryTimeline() {
  return Boolean(document.querySelector(COMPONENT_SELECTOR));
}

let swiperLoadPromise: Promise<void> | null = null;

function isSwiperReady() {
  return typeof Swiper !== 'undefined';
}

function initHistoryTimeline() {
  if (!hasHistoryTimeline() || !isSwiperReady()) return;

  addReadMoreStyles();
  document
    .querySelectorAll<HTMLElement>(COMPONENT_SELECTOR)
    .forEach((component) => new HistoryTimeline(component).init());
}

function loadExternalScript(url: string, scriptName?: string) {
  if (isSwiperReady()) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    script.onload = () => {
      scriptName &&
        document.dispatchEvent(
          new CustomEvent(`scriptLoaded:${scriptName}`, {
            detail: { url, name: scriptName, scriptName },
          })
        );
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

function loadSwiper() {
  if (isSwiperReady()) {
    initHistoryTimeline();
    return;
  }

  swiperLoadPromise =
    swiperLoadPromise ||
    (window.loadScript
      ? window.loadScript(SWIPER_JS_URL, {
          placement: 'head',
          scriptName: 'swiper',
        })
      : loadExternalScript(SWIPER_JS_URL, 'swiper'));

  swiperLoadPromise.then(initHistoryTimeline).catch((error) => {
    console.error('Failed to load Swiper JS for history timeline', error);
  });
}

document.addEventListener('scriptLoaded:swiper', initHistoryTimeline);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (hasHistoryTimeline()) loadSwiper();
  });
} else if (hasHistoryTimeline()) {
  loadSwiper();
}
