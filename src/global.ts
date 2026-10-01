import { initDetailsGroups } from '$components/details';
import Dialog from '$components/dialog';
import { initLightboxGalleries, initLightboxes } from '$components/lightbox';
import { initMarquees } from '$components/marquee';
import { initNav } from '$components/nav';
import { initNewsRichTextGalleries } from '$components/news-rich-text-gallery';
import { initNewsletter } from '$components/newsletter';
import { setCurrentYear } from '$utils/current-year';
import '$utils/disable-webflow-scroll';
import { disableWebflowAnchorSmoothScroll } from '$utils/disable-webflow-scroll';
import handleExternalLinks from '$utils/external-link';
import addMainElementId from '$utils/main-element-id';
import { initRevealFallback } from '$utils/reveal-fallback';
import { setSearchResultTextFromQuery } from '$utils/search-query-text';

window.Webflow = window.Webflow || [];
window.Webflow?.push(() => {
  setTimeout(() => {
    window.WF_IX = Webflow.require('ix3');
    console.debug('Webflow IX3 globalised:', window.WF_IX);
  }, 100);

  // Set current year on respective elements
  setCurrentYear();
  addMainElementId();
  handleExternalLinks();
  setSearchResultTextFromQuery();

  initComponents();
  UIFunctions();
  webflowOverrides();

  loadScrollTimelineCSSPolyfill();
});

function initComponents() {
  new Dialog();
}

function UIFunctions() {
  initMarquees();
  initNewsletter();
  initNewsRichTextGalleries();
  initLightboxes();
  initLightboxGalleries();
  initRevealFallback();
  initDetailsGroups();
  initNav();
  window.conditionalLoadScript('[data-video-el="component"]', 'components/video-player.js');
  window.conditionalLoadScript('[data-slider-el="component"]', 'components/slider.js');
  window.conditionalLoadScript(
    '[data-history-timeline="component"], .history-timeline_component',
    'components/history-timeline.js'
  );
  window.conditionalLoadScript(
    '[data-el="switching-tabs-component"], .switcing-tabs_component, .switching-tabs_component',
    'components/switching-tabs.js'
  );
}

function webflowOverrides() {
  disableWebflowAnchorSmoothScroll();
}

function loadScrollTimelineCSSPolyfill() {
  window.loadScript('https://flackr.github.io/scroll-timeline/dist/scroll-timeline.js');
}
