import { initLightboxGallery } from '$components/lightbox';

const COMPONENT_SELECTOR = '.newsletter_component';
const SIDE_NAV_DETAILS_SELECTOR = '.newsletter_side-nav_details';
const SIDE_NAV_LINK_SELECTOR = '.newsletter_side-nav_link';
const PERIOD_SELECTOR = '.newsletter_period_item[id]';
const PERIOD_DETAILS_SELECTOR = '.newsletter_period_item > details';
const NEWSLETTER_RICH_TEXT_SELECTOR = '.newsletter_rich-text.w-richtext';
const NEWSLETTER_CONTENT_SELECTOR = '.newsletter-content_component';
const NEWSLETTER_CONTENT_TOC_SELECTOR = '.newsletter-content_toc';
const NEWSLETTER_TRANSITION_CSS_ID = 'krb-newsletter-readmore-transition-css';
const DESKTOP_MEDIA_QUERY = '(min-width: 768px)';

const desktopMediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);

type NewsletterPeriod = {
  year: string;
  term: string;
  id: string;
};

export function initNewsletter() {
  const components = getNewsletterComponents();

  components.forEach((component) => {
    const mainDetails = getMainNewsletterDetails(component);

    populateSideNav(component);
    initResponsiveSideNav(component);
    initMainContentDetails(mainDetails);
    initNewsletterArticles(component);
    initNewsletterTableOfContents(component);
    initNewsletterLightbox(component);
  });
}

function getNewsletterComponents() {
  const components = Array.from(document.querySelectorAll<HTMLElement>(COMPONENT_SELECTOR));
  if (components.length) return components;

  return Array.from(document.querySelectorAll<HTMLElement>(NEWSLETTER_CONTENT_SELECTOR));
}

function populateSideNav(component: HTMLElement) {
  const templateDetails = component.querySelector<HTMLDetailsElement>(SIDE_NAV_DETAILS_SELECTOR);
  const sideNavWrapper = templateDetails?.parentElement;
  const templateLink = templateDetails?.querySelector<HTMLAnchorElement>(SIDE_NAV_LINK_SELECTOR);

  if (!templateDetails || !sideNavWrapper || !templateLink) return;

  const groupedPeriods = groupPeriodsByYear(getNewsletterPeriods(component));
  if (!groupedPeriods.size) return;

  const previousTemplateOpenState = templateDetails.open;
  const sideNavItems = Array.from(groupedPeriods.entries()).map(([year, periods], index) => {
    const item = templateDetails.cloneNode(true) as HTMLDetailsElement;
    const yearText = item.querySelector<HTMLElement>('summary p') || item.querySelector('summary');
    const content = item.querySelector<HTMLElement>('.newsletter_side-nav_content');
    const spacer = content?.querySelector<HTMLElement>('[class*="spacer"]')?.cloneNode(true);

    item.open = previousTemplateOpenState && index === 0;

    if (yearText) yearText.textContent = year;
    if (!content) return item;

    content.replaceChildren(
      ...periods.map((period) => {
        const link = templateLink.cloneNode(true) as HTMLAnchorElement;
        link.textContent = period.term;
        link.setAttribute('href', `#${encodeURIComponent(period.id)}`);
        return link;
      }),
      ...(spacer ? [spacer] : [])
    );

    return item;
  });

  sideNavWrapper.querySelectorAll(SIDE_NAV_DETAILS_SELECTOR).forEach((item) => item.remove());
  sideNavWrapper.append(...sideNavItems);
}

function initResponsiveSideNav(component: HTMLElement) {
  const sideNavDetails = component.querySelector<HTMLDetailsElement>(SIDE_NAV_DETAILS_SELECTOR);
  const sideNavContainer = sideNavDetails?.parentElement;

  if (!sideNavContainer?.parentElement) return;
  if (sideNavContainer.dataset.responsiveSideNavInitialised === 'true') return;

  sideNavContainer.dataset.responsiveSideNavInitialised = 'true';

  const placeholder = document.createComment('newsletter side nav mobile placeholder');
  sideNavContainer.before(placeholder);

  const syncSideNav = () => {
    if (desktopMediaQuery.matches) {
      if (!sideNavContainer.isConnected) placeholder.after(sideNavContainer);
      return;
    }

    sideNavContainer.remove();
  };

  syncSideNav();
  desktopMediaQuery.addEventListener('change', syncSideNav);
}

function getNewsletterPeriods(component: HTMLElement) {
  return Array.from(component.querySelectorAll<HTMLElement>(PERIOD_SELECTOR))
    .filter((period) => !period.closest(SIDE_NAV_DETAILS_SELECTOR))
    .map((period) => {
      const year = period.closest<HTMLElement>('[data-year]')?.dataset.year || parseYear(period.id);
      const term = parseTerm(period.id) || period.querySelector('summary')?.textContent?.trim();

      if (!year || !term) return null;

      return {
        year,
        term: normaliseTerm(term),
        id: period.id,
      };
    })
    .filter((period): period is NewsletterPeriod => Boolean(period));
}

function groupPeriodsByYear(periods: NewsletterPeriod[]) {
  return periods.reduce((groups, period) => {
    const currentPeriods = groups.get(period.year) || [];
    const alreadyAdded = currentPeriods.some((currentPeriod) => currentPeriod.id === period.id);

    if (!alreadyAdded) {
      groups.set(period.year, [...currentPeriods, period].sort(sortPeriodsByTerm));
    }

    return groups;
  }, new Map<string, NewsletterPeriod[]>());
}

function sortPeriodsByTerm(firstPeriod: NewsletterPeriod, secondPeriod: NewsletterPeriod) {
  return getTermNumber(firstPeriod.term) - getTermNumber(secondPeriod.term);
}

function getMainNewsletterDetails(component: HTMLElement) {
  return Array.from(component.querySelectorAll<HTMLDetailsElement>(PERIOD_DETAILS_SELECTOR)).filter(
    (details) => !details.closest(SIDE_NAV_DETAILS_SELECTOR)
  );
}

function initMainContentDetails(detailsList: HTMLDetailsElement[]) {
  const syncDetails = () => {
    detailsList.forEach((details) => {
      details.open = desktopMediaQuery.matches;
    });
  };

  detailsList.forEach((details) => {
    if (details.dataset.newsletterDetailsInitialised === 'true') return;
    details.dataset.newsletterDetailsInitialised = 'true';

    const summary = details.querySelector('summary');

    summary?.addEventListener('click', (event) => {
      if (!desktopMediaQuery.matches) return;

      event.preventDefault();
      details.open = true;
    });
  });

  syncDetails();
  desktopMediaQuery.addEventListener('change', syncDetails);
}

function initNewsletterArticles(component: HTMLElement) {
  const richText = getNewsletterRichText(component);
  if (!richText) return;
  if (richText.dataset.newsletterArticlesInitialised === 'true') return;

  addNewsletterArticleTransitionCSS();

  Array.from(richText.children)
    .filter(isArticleHeading)
    .forEach((heading) => {
      if (heading.closest('.newsletter_article')) return;

      const contentNodes = getArticleContentNodes(heading);
      if (!hasUsefulArticleContent(contentNodes)) return;

      const summarySource = getFirstSummaryNode(contentNodes);
      if (!summarySource) return;

      const article = document.createElement('div');
      article.className = 'newsletter_article';

      heading.before(article);
      article.appendChild(heading);

      const summary = summarySource.cloneNode(true) as HTMLElement;
      summary.classList.add('newsletter_article-summary');
      article.appendChild(summary);

      const body = document.createElement('div');
      body.className = 'newsletter_article-body';
      body.style.maxHeight = '0px';
      article.appendChild(body);

      contentNodes.forEach((node) => body.appendChild(node));

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'newsletter_article-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = `
        <span class="more">Read More</span>
        <span class="less">Read Less</span>
        <span class="newsletter_article-toggle-icon" aria-hidden="true"></span>
      `;

      article.appendChild(toggle);

      toggle.addEventListener('click', () => {
        if (article.classList.contains('is-open')) {
          closeArticle(article, body, toggle);
        } else {
          openArticle(article, body, toggle);
        }
      });
    });

  richText.dataset.newsletterArticlesInitialised = 'true';
}

function addNewsletterArticleTransitionCSS() {
  if (document.getElementById(NEWSLETTER_TRANSITION_CSS_ID)) return;

  const style = document.createElement('style');
  style.id = NEWSLETTER_TRANSITION_CSS_ID;
  style.textContent = `
    .newsletter_article-summary {
      transition: opacity 220ms ease;
    }

    .newsletter_article-body {
      display: block !important;
      overflow: hidden;
      max-height: 0;
      opacity: 0;
      transition: max-height 380ms ease, opacity 260ms ease;
      will-change: max-height, opacity;
    }

    .newsletter_article.is-open .newsletter_article-body {
      opacity: 1;
    }

    @media (prefers-reduced-motion: reduce) {
      .newsletter_article-summary,
      .newsletter_article-body {
        transition: none !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function isArticleHeading(element: Element) {
  if (!['H2', 'H3'].includes(element.tagName)) return false;
  if (element.tagName === 'H3') return true;

  const next = element.nextElementSibling;
  return Boolean(next && !['H2', 'H3'].includes(next.tagName));
}

function getArticleContentNodes(heading: Element) {
  const contentNodes: Element[] = [];
  let node = heading.nextElementSibling;

  while (node && !isArticleStopElement(node)) {
    const next = node.nextElementSibling;
    contentNodes.push(node);
    node = next;
  }

  return contentNodes;
}

function isArticleStopElement(element: Element) {
  if (['H2', 'H3'].includes(element.tagName)) return true;

  return (
    element.tagName === 'FIGURE' &&
    (element.nextElementSibling?.tagName === 'FIGURE' ||
      element.previousElementSibling?.tagName === 'FIGURE')
  );
}

function hasUsefulArticleContent(nodes: Element[]) {
  return nodes.some((element) => element.matches('p, ul, ol, blockquote, h4, h5, h6'));
}

function getFirstSummaryNode(nodes: Element[]) {
  return nodes.find((element) => element.matches('p, ul, ol, blockquote'));
}

function openArticle(article: HTMLElement, body: HTMLElement, toggle: HTMLButtonElement) {
  article.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  body.style.maxHeight = '0px';
  body.offsetHeight;
  body.style.maxHeight = `${body.scrollHeight}px`;
}

function closeArticle(article: HTMLElement, body: HTMLElement, toggle: HTMLButtonElement) {
  toggle.setAttribute('aria-expanded', 'false');
  body.style.maxHeight = `${body.scrollHeight}px`;
  body.offsetHeight;
  article.classList.remove('is-open');
  body.style.maxHeight = '0px';
}

function initNewsletterTableOfContents(component: HTMLElement) {
  const toc = component.querySelector<HTMLElement>(NEWSLETTER_CONTENT_TOC_SELECTOR);
  const richText = getNewsletterRichText(component);

  if (!toc || !richText) return;
  if (toc.dataset.tocGenerated === 'true') return;

  const templateGroup = toc.querySelector<HTMLElement>('.newsletter-content_toc-group');
  const templateTop = templateGroup?.querySelector<HTMLAnchorElement>(
    '.newsletter-content_toc-group_top'
  );
  const templateLink = templateGroup?.querySelector<HTMLAnchorElement>(
    '.newsletter-content_toc-group_link'
  );

  if (!templateGroup || !templateTop || !templateLink) return;

  const slugCounts: Record<string, number> = {};
  const fragment = document.createDocumentFragment();
  let currentGroup: HTMLElement | null = null;

  Array.from(richText.children).forEach((node) => {
    const heading = getDirectHeading(node);
    if (!heading) return;

    if (heading.tagName === 'H2') {
      currentGroup = makeTocGroup(heading, templateGroup, templateTop, slugCounts);
      fragment.appendChild(currentGroup);
      return;
    }

    if (heading.tagName === 'H3') {
      if (!currentGroup) {
        currentGroup = makeTocGroup(heading, templateGroup, templateTop, slugCounts);
        fragment.appendChild(currentGroup);
        return;
      }

      currentGroup.appendChild(makeTocLink(heading, templateLink, slugCounts));
    }
  });

  if (!fragment.childNodes.length) return;

  templateGroup.remove();
  toc.appendChild(fragment);
  toc.dataset.tocGenerated = 'true';
}

function makeTocGroup(
  heading: HTMLElement,
  templateGroup: HTMLElement,
  templateTop: HTMLAnchorElement,
  slugCounts: Record<string, number>
) {
  const group = templateGroup.cloneNode(false) as HTMLElement;
  group.removeAttribute('id');
  group.removeAttribute('data-generated');

  const top = templateTop.cloneNode(true) as HTMLAnchorElement;
  top.href = `#${ensureHeadingId(heading, slugCounts)}`;
  setTocLinkText(top, getHeadingText(heading));
  group.appendChild(top);

  return group;
}

function makeTocLink(
  heading: HTMLElement,
  templateLink: HTMLAnchorElement,
  slugCounts: Record<string, number>
) {
  const link = templateLink.cloneNode(true) as HTMLAnchorElement;
  link.href = `#${ensureHeadingId(heading, slugCounts)}`;
  setTocLinkText(link, getHeadingText(heading));
  return link;
}

function getDirectHeading(node: Element) {
  if (['H2', 'H3'].includes(node.tagName)) return node as HTMLElement;

  if (node.classList.contains('newsletter_article')) {
    return node.querySelector<HTMLElement>(':scope > h2, :scope > h3');
  }

  return null;
}

function ensureHeadingId(heading: HTMLElement, slugCounts: Record<string, number>) {
  if (heading.id) return heading.id;

  const cmsId = heading.getAttribute('data-toc-id') || heading.getAttribute('data-anchor-id');
  heading.id = cmsId || slugify(getHeadingText(heading), slugCounts);
  return heading.id;
}

function slugify(text: string, slugCounts: Record<string, number>) {
  const base =
    text
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section';

  slugCounts[base] = (slugCounts[base] || 0) + 1;
  return slugCounts[base] === 1 ? base : `${base}-${slugCounts[base]}`;
}

function getHeadingText(heading: HTMLElement) {
  return heading.textContent?.trim().replace(/\s+/g, ' ') || '';
}

function setTocLinkText(link: HTMLAnchorElement, text: string) {
  const textTarget =
    link.querySelector<HTMLElement>('p') ||
    link.querySelector<HTMLElement>('.text-style-eyebrow') ||
    link.querySelector<HTMLElement>('div') ||
    link;

  textTarget.textContent = text;
}

function initNewsletterLightbox(component: HTMLElement) {
  const richText = getNewsletterRichText(component);
  if (!richText) return;

  const templateSelector = '[data-lightbox-template], [data-newsletter-lightbox-template]';
  const template =
    component.querySelector<HTMLElement>(templateSelector) ||
    document.querySelector<HTMLElement>(templateSelector);

  initLightboxGallery({
    root: richText,
    template,
    label: 'Newsletter image gallery',
    initialisedKey: 'lightboxInitialised',
    imageIndexAttribute: 'newsletterLightboxIndex',
    overlayAttribute: 'data-newsletter-lightbox',
    bodyOpenClass: 'newsletter-lightbox-open',
    triggerImages: true,
  });
}

function getNewsletterRichText(component: HTMLElement) {
  return (
    component.querySelector<HTMLElement>(
      `${NEWSLETTER_CONTENT_SELECTOR} ${NEWSLETTER_RICH_TEXT_SELECTOR}`
    ) || component.querySelector<HTMLElement>(NEWSLETTER_RICH_TEXT_SELECTOR)
  );
}

function parseYear(value: string) {
  return value.match(/\b(20\d{2})\b/)?.[1];
}

function parseTerm(value: string) {
  return value.match(/\bTerm\s+\d+\b/i)?.[0];
}

function getTermNumber(value: string) {
  return Number(value.match(/\d+/)?.[0] || 0);
}

function normaliseTerm(value: string) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
