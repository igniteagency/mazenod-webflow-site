const NAVBAR_WRAPPER_SELECTOR = '.navbar-wrapper';
const NAVBAR_COMPONENT_SELECTOR = '.navbar_component';
const NAV_MENU_ITEM_SELECTOR = '.navbar_menu-content_item';
const NAV_MENU_ITEM_LIST_SELECTOR = '.navbar_menu-content_item-list';
const NAV_MENU_TRIGGER_SELECTOR = ':scope > a.heading-style-h5';
const NAV_MENU_BACK_SELECTOR =
  '[data-nav-menu-back], .navbar_menu-back, .navbar_menu-content_item-back';
const WEBFLOW_NAV_BUTTON_SELECTOR = '.w-nav-button';
const WEBFLOW_NAV_MENU_SELECTOR = '.w-nav-menu';
const WEBFLOW_OPEN_CLASS = 'w--open';

const HIDE_THRESHOLD = 100;
const TABLET_BREAKPOINT = 991;
const HIDDEN_CLASS = 'is-hidden';
const TRANSPARENT_CLASS = 'is-transparent';
const OPEN_CLASS = 'is-open';
const OVERVIEW_LABEL = 'overview';

type BodyScrollLockState = {
  scrollY: number;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  htmlOverflow: string;
};

let bodyScrollLockState: BodyScrollLockState | null = null;

function isTabletDown() {
  return window.matchMedia(`(max-width: ${TABLET_BREAKPOINT}px)`).matches;
}

function getOverviewLink(listEl: HTMLElement) {
  const links = Array.from(listEl.querySelectorAll<HTMLAnchorElement>('a'));

  return links.find((link) => link.textContent?.trim().toLowerCase() === OVERVIEW_LABEL) ?? null;
}

function getBackButton(listEl: HTMLElement) {
  const explicitBackButton = listEl.querySelector<HTMLElement>(NAV_MENU_BACK_SELECTOR);

  if (explicitBackButton) return explicitBackButton;

  const textBackButton = Array.from(listEl.querySelectorAll<HTMLElement>('a, button')).find(
    (button) => button.textContent?.trim().toLowerCase().includes('back')
  );

  if (textBackButton) return textBackButton;

  const backLabel = Array.from(listEl.querySelectorAll<HTMLElement>('*')).find(
    (element) => element.textContent?.trim().toLowerCase() === 'back'
  );

  return backLabel?.closest<HTMLElement>('a, button, .button_component') ?? backLabel ?? null;
}

function setBodyScrollLocked(shouldLock: boolean) {
  if (shouldLock) {
    if (bodyScrollLockState) return;

    const scrollY = window.scrollY;
    bodyScrollLockState = {
      scrollY,
      bodyPosition: document.body.style.position,
      bodyTop: document.body.style.top,
      bodyLeft: document.body.style.left,
      bodyRight: document.body.style.right,
      bodyWidth: document.body.style.width,
      bodyOverflow: document.body.style.overflow,
      htmlOverflow: document.documentElement.style.overflow,
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return;
  }

  if (!bodyScrollLockState) return;

  const {
    scrollY,
    bodyPosition,
    bodyTop,
    bodyLeft,
    bodyRight,
    bodyWidth,
    bodyOverflow,
    htmlOverflow,
  } = bodyScrollLockState;

  bodyScrollLockState = null;
  document.body.style.position = bodyPosition;
  document.body.style.top = bodyTop;
  document.body.style.left = bodyLeft;
  document.body.style.right = bodyRight;
  document.body.style.width = bodyWidth;
  document.body.style.overflow = bodyOverflow;
  document.documentElement.style.overflow = htmlOverflow;
  window.scrollTo(0, scrollY);
}

export function initNav() {
  const navbarWrapperEls = document.querySelectorAll<HTMLElement>(NAVBAR_WRAPPER_SELECTOR);

  navbarWrapperEls.forEach((navbarWrapperEl) => {
    const navbarComponentEl = navbarWrapperEl.querySelector<HTMLElement>(NAVBAR_COMPONENT_SELECTOR);

    if (!navbarComponentEl) {
      console.debug('Skipping empty/placeholder navbar wrapper:', navbarWrapperEl);
      return;
    }

    if (navbarWrapperEl.dataset.navInitialised === 'true') return;
    navbarWrapperEl.dataset.navInitialised = 'true';

    console.debug('Navbar script initialized successfully.', {
      navbarWrapperEl,
      navbarComponentEl,
    });

    const menuItemEls = Array.from(
      navbarWrapperEl.querySelectorAll<HTMLElement>(NAV_MENU_ITEM_SELECTOR)
    );

    const isMenuOpen = () => {
      const navButtonEl = navbarWrapperEl.querySelector<HTMLElement>(WEBFLOW_NAV_BUTTON_SELECTOR);
      const overlayEl = navButtonEl?.getAttribute('aria-controls')
        ? document.getElementById(navButtonEl.getAttribute('aria-controls') || '')
        : null;
      const isWebflowMenuOpen =
        navButtonEl?.classList.contains(WEBFLOW_OPEN_CLASS) ||
        navButtonEl?.getAttribute('aria-expanded') === 'true' ||
        overlayEl?.style.display === 'block';
      const isSubmenuOpen =
        isTabletDown() &&
        menuItemEls.some((itemEl) =>
          itemEl
            .querySelector<HTMLElement>(NAV_MENU_ITEM_LIST_SELECTOR)
            ?.classList.contains(OPEN_CLASS)
        );

      return Boolean(isWebflowMenuOpen || isSubmenuOpen);
    };

    const updateBodyScrollLock = () => {
      setBodyScrollLocked(isMenuOpen());
    };

    const closeMenuLists = () => {
      menuItemEls.forEach((itemEl) => {
        const triggerEl = itemEl.querySelector<HTMLAnchorElement>(NAV_MENU_TRIGGER_SELECTOR);
        const listEl = itemEl.querySelector<HTMLElement>(NAV_MENU_ITEM_LIST_SELECTOR);

        listEl?.classList.remove(OPEN_CLASS);
        triggerEl?.setAttribute('aria-expanded', 'false');
      });

      updateBodyScrollLock();
    };

    menuItemEls.forEach((itemEl) => {
      const triggerEl = itemEl.querySelector<HTMLAnchorElement>(NAV_MENU_TRIGGER_SELECTOR);
      const listEl = itemEl.querySelector<HTMLElement>(NAV_MENU_ITEM_LIST_SELECTOR);

      if (!triggerEl || !listEl) return;

      const triggerHref = triggerEl.getAttribute('href');
      const overviewLinkEl = getOverviewLink(listEl);
      const backButtonEl = getBackButton(listEl);

      triggerEl.setAttribute('aria-haspopup', 'true');
      triggerEl.setAttribute('aria-expanded', listEl.classList.contains(OPEN_CLASS).toString());

      if (triggerHref && overviewLinkEl) {
        overviewLinkEl.setAttribute('href', triggerHref);
      }

      triggerEl.addEventListener(
        'click',
        (event) => {
          if (!isTabletDown()) return;

          event.preventDefault();

          const shouldOpen = !listEl.classList.contains(OPEN_CLASS);
          closeMenuLists();

          if (shouldOpen) {
            listEl.classList.add(OPEN_CLASS);
            triggerEl.setAttribute('aria-expanded', 'true');
          }

          updateBodyScrollLock();
        },
        { capture: true }
      );

      backButtonEl?.addEventListener('click', (event) => {
        event.preventDefault();
        listEl.classList.remove(OPEN_CLASS);
        triggerEl.setAttribute('aria-expanded', 'false');
        updateBodyScrollLock();
      });
    });

    closeMenuLists();

    window.addEventListener('resize', () => {
      if (!isTabletDown()) {
        closeMenuLists();
        return;
      }

      updateBodyScrollLock();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenuLists();
    });

    let previousScrollY = window.scrollY;
    let isTicking = false;
    let transparentTimeoutId: number | null = null;

    const updateNavState = () => {
      const currentScrollY = window.scrollY;
      const isPastThreshold = currentScrollY > HIDE_THRESHOLD;
      const isScrollingDown = currentScrollY > previousScrollY;
      const isHiding = isPastThreshold && isScrollingDown && !isMenuOpen();

      console.debug('updateNavState firing:', {
        currentScrollY,
        previousScrollY,
        isPastThreshold,
        isScrollingDown,
        isHiding,
      });

      if (transparentTimeoutId !== null) {
        window.clearTimeout(transparentTimeoutId);
        transparentTimeoutId = null;
      }

      navbarWrapperEl.classList.toggle(HIDDEN_CLASS, isHiding);

      if (!isPastThreshold) {
        navbarComponentEl.classList.add(TRANSPARENT_CLASS);
      } else {
        if (isHiding) {
          // Delay removal of transparency while it slides out of view to avoid flash to white
          transparentTimeoutId = window.setTimeout(() => {
            navbarComponentEl.classList.remove(TRANSPARENT_CLASS);
            transparentTimeoutId = null;
          }, 400); // 400ms matches the slide-out transition duration
        } else {
          // If we are showing it (scrolling up), make it opaque immediately
          navbarComponentEl.classList.remove(TRANSPARENT_CLASS);
        }
      }

      previousScrollY = currentScrollY;
      isTicking = false;
    };

    const syncMenuState = () => {
      updateBodyScrollLock();
      updateNavState();
    };

    const webflowMenuEls = Array.from(
      navbarWrapperEl.querySelectorAll<HTMLElement>(
        `${WEBFLOW_NAV_BUTTON_SELECTOR}, ${WEBFLOW_NAV_MENU_SELECTOR}`
      )
    );

    webflowMenuEls.forEach((menuEl) => {
      menuEl.addEventListener('click', () => {
        window.requestAnimationFrame(syncMenuState);
      });
    });

    const webflowMenuObserver = new MutationObserver(syncMenuState);
    webflowMenuEls.forEach((menuEl) => {
      webflowMenuObserver.observe(menuEl, {
        attributes: true,
        attributeFilter: ['aria-expanded', 'class', 'style', 'data-nav-menu-open'],
      });
    });

    window.addEventListener(
      'scroll',
      () => {
        if (isTicking) return;

        window.requestAnimationFrame(updateNavState);
        isTicking = true;
      },
      { passive: true }
    );

    updateNavState();
  });
}
