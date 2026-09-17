"use strict";(()=>{var M="[data-lightbox-template], [data-newsletter-lightbox-template]";var v="krb-lightbox-css",I=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function A(t){let{root:e,imagesSelector:a="img",template:l=k(e),label:r="Image gallery",initialisedKey:h="lightboxInitialised",imageIndexAttribute:f="lightboxIndex",overlayAttribute:y="data-lightbox",bodyOpenClass:b="lightbox-open",triggerImages:u=!0,showCaption:m=!0}=t;if(e.dataset[h]==="true")return;let d=C(e,a);if(!d.length)return;let g=d.map((s,p)=>(s.dataset[f]=String(p),u&&(s.setAttribute("tabindex","0"),s.setAttribute("role","button"),s.setAttribute("aria-label",s.alt?`Open image: ${s.alt}`:"Open image")),{img:s,src:N(s),alt:s.alt||"",caption:P(s)}));O();let i=l?l.cloneNode(!0):q();i instanceof HTMLElement&&(i.removeAttribute("data-lightbox-template"),i.removeAttribute("data-newsletter-lightbox-template"),i.setAttribute(y,""),i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.setAttribute("aria-label",r),i.setAttribute("aria-hidden","true"),m||i.querySelector("[data-lightbox-caption]")?.remove(),l&&i.style.removeProperty("display"),document.body.appendChild(i),G(i,g,{bodyOpenClass:b,triggerImages:u}),e.dataset[h]="true")}function C(t,e){return Array.from(t.querySelectorAll(e)).filter(a=>a.currentSrc||a.src).filter((a,l,r)=>r.indexOf(a)===l)}function k(t){return t.querySelector(M)}function O(){if(document.getElementById(v))return;let t=document.createElement("style");t.id=v,t.textContent=`
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
  `,document.head.appendChild(t)}function q(){let t=document.createElement("div");return t.className="newsletter-lightbox",t.setAttribute("data-lightbox",""),t.innerHTML=`
    <button class="newsletter-lightbox__button newsletter-lightbox__close" type="button" data-lightbox-close aria-label="Close image gallery">\xD7</button>
    <button class="newsletter-lightbox__button newsletter-lightbox__prev" type="button" data-lightbox-prev aria-label="Previous image">\u2039</button>
    <div class="newsletter-lightbox__stage" data-lightbox-stage>
      <img class="newsletter-lightbox__image" data-lightbox-image alt="">
    </div>
    <button class="newsletter-lightbox__button newsletter-lightbox__next" type="button" data-lightbox-next aria-label="Next image">\u203A</button>
    <div class="newsletter-lightbox__meta">
      <p class="newsletter-lightbox__caption" data-lightbox-caption></p>
      <p class="newsletter-lightbox__counter" data-lightbox-counter></p>
    </div>
  `,t}function G(t,e,a){let l=t.querySelector("[data-lightbox-image]")||t.querySelector("img"),r=t.querySelector("[data-lightbox-caption]"),h=Array.from(t.querySelectorAll("[data-lightbox-counter]")),f=Array.from(t.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),y=t.querySelectorAll("[data-lightbox-close]"),b=t.querySelectorAll("[data-lightbox-prev]"),u=t.querySelectorAll("[data-lightbox-next]"),m=t.querySelector("[data-lightbox-stage]")||l?.parentElement||t;if(!l)return{open:()=>{},close:()=>{}};let d=e.length>1;R([...b,...u,...f],!d);let g=0,i=null,s=0,p=0,w=()=>{let n=e[g];n&&(l.src=n.src,l.alt=n.alt||n.caption||"Image",r&&(r.textContent=n.caption,r.hidden=!n.caption),h.forEach(o=>{o.textContent=`${g+1} / ${e.length}`}))},E=(n=0)=>{g=_(n,e.length),i=document.activeElement,w(),document.body.classList.add(a.bodyOpenClass),t.classList.add("is-open"),t.setAttribute("aria-hidden","false"),(t.querySelector("[data-lightbox-close]")||t.querySelector("button")||t).focus()},x=()=>{t.classList.remove("is-open"),t.setAttribute("aria-hidden","true"),document.body.classList.remove(a.bodyOpenClass),i instanceof HTMLElement&&i.focus()},L=()=>{d&&(g=_(g-1,e.length),w())},T=()=>{d&&(g=_(g+1,e.length),w())};return a.triggerImages&&e.forEach((n,o)=>{n.img.addEventListener("click",c=>{c.preventDefault(),E(o)}),n.img.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),E(o))})}),y.forEach(n=>n.addEventListener("click",x)),b.forEach(n=>n.addEventListener("click",L)),u.forEach(n=>n.addEventListener("click",T)),t.addEventListener("click",n=>{let o=n.target;if(!(o instanceof Element))return;!o.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&t.contains(o)&&x()}),m.addEventListener("touchstart",n=>{let o=n.changedTouches[0];s=o.clientX,p=o.clientY},{passive:!0}),m.addEventListener("touchend",n=>{let o=n.changedTouches[0],c=o.clientX-s,S=o.clientY-p;Math.abs(c)>45&&Math.abs(c)>Math.abs(S)&&(c>0?L():T())},{passive:!0}),document.addEventListener("keydown",n=>{t.classList.contains("is-open")&&(n.key==="Escape"&&x(),n.key==="ArrowLeft"&&L(),n.key==="ArrowRight"&&T())}),{open:E,close:x}}function _(t,e){return e?(t%e+e)%e:0}function R(t,e){t.forEach(a=>{a.hidden=e,a.setAttribute("aria-hidden",String(e)),e?a.style.setProperty("display","none","important"):a.style.removeProperty("display")})}function N(t){let e=t.closest("a[href]"),a=e?.getAttribute("href")||"";return I.test(a)?e?.href||"":t.currentSrc||t.src}function P(t){return(t.closest("figure")?.querySelector("figcaption")?.textContent||t.alt||"").trim()}var X=".post-content_component.grid .post-content_wrapper > .w-richtext, .post-content_left.w-richtext, .post-content_left .w-richtext",H="news-rich-text-gallery-css";function D(){let t=document.querySelectorAll(X);t.length&&(B(),t.forEach(e=>{if(e.dataset.newsGalleryInitialised==="true")return;e.dataset.newsGalleryRichText="";let a=[],l=()=>{if(a.length>1){let r=document.createElement("div");r.className="news-rich-text-gallery",r.dataset.count=String(a.length),a[0].before(r),r.append(...a)}a=[]};Array.from(e.children).forEach(r=>{r.matches("figure")&&r.querySelector("img")?a.push(r):l()}),l(),A({root:e,label:"News article images",overlayAttribute:"data-news-lightbox",showCaption:!1}),e.dataset.newsGalleryInitialised="true"}))}function B(){if(document.getElementById(H))return;let t=document.createElement("style");t.id=H,t.textContent=`
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
  `,document.head.appendChild(t)}})();
