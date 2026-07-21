// Site lightbox trigger API:
// - Add data-lightbox-parent to a wrapper.
// - Add data-lightbox-target to the native Webflow lightbox/link inside that wrapper.
// - Add data-lightbox-trigger to the button/link inside the same wrapper that should open it.
// - Optionally set data-lightbox-trigger=".selector" to choose a specific target inside that wrapper.
const LIGHTBOX_PARENT_SELECTOR = '[data-lightbox-parent]';
const LIGHTBOX_TRIGGER_SELECTOR = '[data-lightbox-trigger]';
const LIGHTBOX_TARGET_SELECTOR = '[data-lightbox-target]';
const LIGHTBOX_TEMPLATE_SELECTOR = '[data-lightbox-template], [data-newsletter-lightbox-template]';
const LIGHTBOX_GALLERY_SELECTOR = '[data-lightbox-gallery]';
const HISTORY_TIMELINE_SELECTOR =
  '[data-history-timeline="component"], .history-timeline_component';
const LIGHTBOX_CSS_ID = 'krb-lightbox-css';
const IMAGE_EXT_PATTERN = /\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;

type LightboxItem = {
  img: HTMLImageElement;
  src: string;
  alt: string;
  caption: string;
};

type LightboxGalleryOptions = {
  root: HTMLElement;
  imagesSelector?: string;
  template?: HTMLElement | null;
  label?: string;
  initialisedKey?: string;
  imageIndexAttribute?: string;
  overlayAttribute?: string;
  bodyOpenClass?: string;
  triggerImages?: boolean;
};

export function initLightboxes(root: ParentNode = document) {
  getLightboxParents(root).forEach(bindLightboxParent);
}

export function initLightboxGalleries(root: ParentNode = document) {
  getLightboxGalleries(root).forEach((gallery) => {
    initLightboxGallery({
      root: gallery,
      template: getTemplate(document),
      label:
        gallery.getAttribute('aria-label') ||
        gallery.getAttribute('data-lightbox-gallery') ||
        'Image gallery',
    });
  });
}

export function initLightboxGallery(options: LightboxGalleryOptions) {
  const {
    root,
    imagesSelector = 'img',
    template = getTemplate(root),
    label = 'Image gallery',
    initialisedKey = 'lightboxInitialised',
    imageIndexAttribute = 'lightboxIndex',
    overlayAttribute = 'data-lightbox',
    bodyOpenClass = 'lightbox-open',
    triggerImages = true,
  } = options;

  if (root.dataset[initialisedKey] === 'true') return;

  const images = getUniqueImages(root, imagesSelector);
  if (!images.length) return;

  const items = images.map((img, index) => {
    img.dataset[imageIndexAttribute] = String(index);

    if (triggerImages) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', img.alt ? `Open image: ${img.alt}` : 'Open image');
    }

    return {
      img,
      src: getImageSrc(img),
      alt: img.alt || '',
      caption: getImageCaption(img),
    };
  });

  addLightboxCSS();

  const lightbox = template ? (template.cloneNode(true) as HTMLElement) : createFallbackLightbox();
  if (!(lightbox instanceof HTMLElement)) return;

  lightbox.removeAttribute('data-lightbox-template');
  lightbox.removeAttribute('data-newsletter-lightbox-template');
  lightbox.setAttribute(overlayAttribute, '');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', label);
  lightbox.setAttribute('aria-hidden', 'true');

  if (template) {
    lightbox.style.removeProperty('display');
  }

  document.body.appendChild(lightbox);
  bindRichTextGallery(lightbox, items, { bodyOpenClass, triggerImages });
  root.dataset[initialisedKey] = 'true';
}

function getLightboxParents(root: ParentNode) {
  const parents = Array.from(root.querySelectorAll<HTMLElement>(LIGHTBOX_PARENT_SELECTOR));

  if (root instanceof HTMLElement && root.matches(LIGHTBOX_PARENT_SELECTOR)) {
    parents.unshift(root);
  }

  return parents;
}

function getLightboxGalleries(root: ParentNode) {
  const galleries = Array.from(root.querySelectorAll<HTMLElement>(LIGHTBOX_GALLERY_SELECTOR));

  if (root instanceof HTMLElement && root.matches(LIGHTBOX_GALLERY_SELECTOR)) {
    galleries.unshift(root);
  }

  return galleries.filter((gallery) => !gallery.closest(HISTORY_TIMELINE_SELECTOR));
}

function bindLightboxParent(parent: HTMLElement) {
  parent.querySelectorAll<HTMLElement>(LIGHTBOX_TRIGGER_SELECTOR).forEach((trigger) => {
    if (trigger.dataset.lightboxBound === 'true') return;

    const target = getScopedTarget(parent, trigger);
    if (!target || target === trigger) return;

    trigger.dataset.lightboxBound = 'true';
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      target.click();
    });
  });
}

function getScopedTarget(parent: HTMLElement, trigger: HTMLElement) {
  const targetSelector = trigger.getAttribute('data-lightbox-trigger')?.trim();

  if (targetSelector) {
    try {
      const selectedTarget = parent.querySelector<HTMLElement>(targetSelector);
      if (selectedTarget) return selectedTarget;
    } catch (_error) {
      return null;
    }
  }

  return parent.querySelector<HTMLElement>(LIGHTBOX_TARGET_SELECTOR);
}

function getUniqueImages(root: ParentNode, imagesSelector: string) {
  return Array.from(root.querySelectorAll<HTMLImageElement>(imagesSelector))
    .filter((img) => img.currentSrc || img.src)
    .filter((img, index, allImages) => allImages.indexOf(img) === index);
}

function getTemplate(root: ParentNode) {
  return root.querySelector<HTMLElement>(LIGHTBOX_TEMPLATE_SELECTOR);
}

function addLightboxCSS() {
  if (document.getElementById(LIGHTBOX_CSS_ID)) return;

  const style = document.createElement('style');
  style.id = LIGHTBOX_CSS_ID;
  style.textContent = `
    .newsletter_rich-text img[data-newsletter-lightbox-index] {
      cursor: zoom-in;
    }

    body.lightbox-open,
    body.newsletter-lightbox-open {
      overflow: hidden;
    }

    [data-lightbox-template],
    [data-newsletter-lightbox-template] {
      display: none !important;
    }

    .newsletter-lightbox,
    [data-lightbox],
    [data-newsletter-lightbox] {
      position: fixed;
      inset: 0;
      z-index: 9999;
      opacity: 0;
      pointer-events: none;
    }

    .newsletter-lightbox.is-open,
    [data-lightbox].is-open,
    [data-newsletter-lightbox].is-open {
      opacity: 1;
      pointer-events: auto;
    }

    .newsletter-lightbox__image,
    [data-lightbox-image] {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `;
  document.head.appendChild(style);
}

function createFallbackLightbox() {
  const fallback = document.createElement('div');
  fallback.className = 'newsletter-lightbox';
  fallback.setAttribute('data-lightbox', '');
  fallback.innerHTML = `
    <button class="newsletter-lightbox__button newsletter-lightbox__close" type="button" data-lightbox-close aria-label="Close image gallery">×</button>
    <button class="newsletter-lightbox__button newsletter-lightbox__prev" type="button" data-lightbox-prev aria-label="Previous image">‹</button>
    <div class="newsletter-lightbox__stage" data-lightbox-stage>
      <img class="newsletter-lightbox__image" data-lightbox-image alt="">
    </div>
    <button class="newsletter-lightbox__button newsletter-lightbox__next" type="button" data-lightbox-next aria-label="Next image">›</button>
    <div class="newsletter-lightbox__meta">
      <p class="newsletter-lightbox__caption" data-lightbox-caption></p>
      <p class="newsletter-lightbox__counter" data-lightbox-counter></p>
    </div>
  `;

  return fallback;
}

function bindRichTextGallery(
  lightbox: HTMLElement,
  items: LightboxItem[],
  options: { bodyOpenClass: string; triggerImages: boolean }
) {
  const imageEl =
    lightbox.querySelector<HTMLImageElement>('[data-lightbox-image]') ||
    lightbox.querySelector<HTMLImageElement>('img');
  const captionEl = lightbox.querySelector<HTMLElement>('[data-lightbox-caption]');
  const counterEls = Array.from(lightbox.querySelectorAll<HTMLElement>('[data-lightbox-counter]'));
  const paginationEls = Array.from(
    lightbox.querySelectorAll<HTMLElement>('[data-lightbox-counter], [data-lightbox-pagination]')
  );
  const closeButtons = lightbox.querySelectorAll<HTMLElement>('[data-lightbox-close]');
  const prevButtons = lightbox.querySelectorAll<HTMLElement>('[data-lightbox-prev]');
  const nextButtons = lightbox.querySelectorAll<HTMLElement>('[data-lightbox-next]');
  const stage =
    lightbox.querySelector<HTMLElement>('[data-lightbox-stage]') ||
    imageEl?.parentElement ||
    lightbox;

  if (!imageEl) {
    return { open: () => undefined, close: () => undefined };
  }

  const hasMultipleItems = items.length > 1;
  setElementsHidden([...prevButtons, ...nextButtons, ...paginationEls], !hasMultipleItems);

  let currentIndex = 0;
  let lastFocusedElement: Element | null = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const updateLightbox = () => {
    const item = items[currentIndex];
    if (!item) return;

    imageEl.src = item.src;
    imageEl.alt = item.alt || item.caption || 'Image';

    if (captionEl) {
      captionEl.textContent = item.caption;
      captionEl.hidden = !item.caption;
    }

    counterEls.forEach((counterEl) => {
      counterEl.textContent = `${currentIndex + 1} / ${items.length}`;
    });
  };

  const open = (index = 0) => {
    currentIndex = normaliseIndex(index, items.length);
    lastFocusedElement = document.activeElement;
    updateLightbox();

    document.body.classList.add(options.bodyOpenClass);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');

    const focusTarget =
      lightbox.querySelector<HTMLElement>('[data-lightbox-close]') ||
      lightbox.querySelector<HTMLElement>('button') ||
      lightbox;
    focusTarget.focus();
  };

  const close = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove(options.bodyOpenClass);

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const showPrevious = () => {
    if (!hasMultipleItems) return;
    currentIndex = normaliseIndex(currentIndex - 1, items.length);
    updateLightbox();
  };

  const showNext = () => {
    if (!hasMultipleItems) return;
    currentIndex = normaliseIndex(currentIndex + 1, items.length);
    updateLightbox();
  };

  if (options.triggerImages) {
    items.forEach((item, index) => {
      item.img.addEventListener('click', (event) => {
        event.preventDefault();
        open(index);
      });

      item.img.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(index);
        }
      });
    });
  }

  closeButtons.forEach((button) => button.addEventListener('click', close));
  prevButtons.forEach((button) => button.addEventListener('click', showPrevious));
  nextButtons.forEach((button) => button.addEventListener('click', showNext));

  lightbox.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) return;

    const interactiveTarget = target.closest(
      '[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe'
    );

    if (!interactiveTarget && lightbox.contains(target)) {
      close();
    }
  });

  stage.addEventListener(
    'touchstart',
    (event) => {
      const touch = event.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    },
    { passive: true }
  );

  stage.addEventListener(
    'touchend',
    (event) => {
      const touch = event.changedTouches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;

      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) showPrevious();
        else showNext();
      }
    },
    { passive: true }
  );

  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') showPrevious();
    if (event.key === 'ArrowRight') showNext();
  });

  return { open, close };
}

function normaliseIndex(index: number, itemCount: number) {
  if (!itemCount) return 0;
  return ((index % itemCount) + itemCount) % itemCount;
}

function setElementsHidden(elements: HTMLElement[], hidden: boolean) {
  elements.forEach((element) => {
    element.hidden = hidden;
    element.setAttribute('aria-hidden', String(hidden));

    if (hidden) {
      element.style.setProperty('display', 'none', 'important');
    } else {
      element.style.removeProperty('display');
    }
  });
}

function getImageSrc(img: HTMLImageElement) {
  const parentLink = img.closest<HTMLAnchorElement>('a[href]');
  const linkHref = parentLink?.getAttribute('href') || '';

  if (IMAGE_EXT_PATTERN.test(linkHref)) {
    return parentLink?.href || '';
  }

  return img.currentSrc || img.src;
}

function getImageCaption(img: HTMLImageElement) {
  const figcaption = img.closest('figure')?.querySelector('figcaption');
  return (figcaption?.textContent || img.alt || '').trim();
}
