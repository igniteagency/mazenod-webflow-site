import { initLightboxGallery } from '$components/lightbox';

const RICH_TEXT_SELECTOR =
  '.post-content_component.grid .post-content_wrapper > .w-richtext, .post-content_left.w-richtext, .post-content_left .w-richtext';
const STYLE_ID = 'news-rich-text-gallery-css';

export function initNewsRichTextGalleries() {
  const richTexts = document.querySelectorAll<HTMLElement>(RICH_TEXT_SELECTOR);
  if (!richTexts.length) return;

  addStyles();

  richTexts.forEach((richText) => {
    if (richText.dataset.newsGalleryInitialised === 'true') return;
    richText.dataset.newsGalleryRichText = '';

    let run: HTMLElement[] = [];
    const flush = () => {
      if (run.length > 1) {
        const gallery = document.createElement('div');
        gallery.className = 'news-rich-text-gallery';
        gallery.dataset.count = String(run.length);
        run[0].before(gallery);
        gallery.append(...run);
      }
      run = [];
    };

    Array.from(richText.children).forEach((child) => {
      if (child.matches('figure') && child.querySelector('img')) {
        run.push(child as HTMLElement);
      } else {
        flush();
      }
    });
    flush();

    initLightboxGallery({
      root: richText,
      label: 'News article images',
      overlayAttribute: 'data-news-lightbox',
      showCaption: false,
    });
    richText.dataset.newsGalleryInitialised = 'true';
  });
}

function addStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .post-content_component.grid > .post-content_wrapper { grid-column: container-start / container-end; width: 100%; }
    .post-header_component .button_component:has(.button_link[aria-label="All posts"]) .icon_button { transform: translateX(0) !important; }
    .post-header_component .button_component:has(.button_link[aria-label="All posts"]):hover .icon_button { transform: translateX(-.25rem) !important; }
    [data-news-gallery-rich-text] > figure { max-width: 780px; width: 100%; }
    [data-news-gallery-rich-text] figure img { height: auto; cursor: zoom-in; }
    [data-news-gallery-rich-text] .news-rich-text-gallery { display: grid; gap: 20px; margin: 24px 0; }
    [data-news-gallery-rich-text] .news-rich-text-gallery[data-count="2"] { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 50px; }
    [data-news-gallery-rich-text] .news-rich-text-gallery:not([data-count="2"]) { grid-template-columns: repeat(auto-fill, minmax(180px, 180px)); }
    [data-news-gallery-rich-text] .news-rich-text-gallery figure { width: 100%; max-width: none; margin: 0; }
    [data-news-gallery-rich-text] .news-rich-text-gallery figure img { display: block; width: 100%; }
    [data-news-gallery-rich-text] .news-rich-text-gallery:not([data-count="2"]) figure img { width: 180px; height: 180px; object-fit: cover; }
    @media (max-width: 600px) {
      [data-news-gallery-rich-text] .news-rich-text-gallery[data-count="2"] { gap: 20px; }
      [data-news-gallery-rich-text] .news-rich-text-gallery:not([data-count="2"]) { grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); }
      [data-news-gallery-rich-text] .news-rich-text-gallery:not([data-count="2"]) figure img { width: 100%; height: auto; aspect-ratio: 1; }
    }
    [data-news-lightbox].newsletter-lightbox { position: fixed; inset: 0; z-index: 9999; background: rgba(0, 0, 0, .88); display: grid; place-items: center; opacity: 0; pointer-events: none; transition: opacity 180ms ease; }
    [data-news-lightbox].newsletter-lightbox.is-open { opacity: 1; pointer-events: auto; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__stage { display: grid; place-items: center; width: min(90vw, 1200px); height: 85vh; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__image { max-width: min(90vw, 1200px); max-height: min(85dvh, calc(100dvh - 120px)); width: auto; height: auto; object-fit: contain; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__button { position: absolute; z-index: 1; color: white; background: transparent; border: 0; font-size: 40px; cursor: pointer; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__close { top: 20px; right: 24px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__prev { left: 20px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__next { right: 20px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__meta { position: absolute; bottom: 20px; color: white; text-align: center; }
  `;
  document.head.appendChild(style);
}
