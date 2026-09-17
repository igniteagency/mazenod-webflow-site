"use strict";(()=>{var M="[data-lightbox-template], [data-newsletter-lightbox-template]";var A="krb-lightbox-css",I=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function H(t){let{root:e,imagesSelector:a="img",template:s=k(e),label:r="Image gallery",initialisedKey:h="lightboxInitialised",imageIndexAttribute:p="lightboxIndex",overlayAttribute:f="data-lightbox",bodyOpenClass:b="lightbox-open",triggerImages:g=!0}=t;if(e.dataset[h]==="true")return;let d=O(e,a);if(!d.length)return;let u=d.map((o,x)=>(o.dataset[p]=String(x),g&&(o.setAttribute("tabindex","0"),o.setAttribute("role","button"),o.setAttribute("aria-label",o.alt?`Open image: ${o.alt}`:"Open image")),{img:o,src:N(o),alt:o.alt||"",caption:P(o)}));q();let i=s?s.cloneNode(!0):C();i instanceof HTMLElement&&(i.removeAttribute("data-lightbox-template"),i.removeAttribute("data-newsletter-lightbox-template"),i.setAttribute(f,""),i.setAttribute("role","dialog"),i.setAttribute("aria-modal","true"),i.setAttribute("aria-label",r),i.setAttribute("aria-hidden","true"),s&&i.style.removeProperty("display"),document.body.appendChild(i),G(i,u,{bodyOpenClass:b,triggerImages:g}),e.dataset[h]="true")}function O(t,e){return Array.from(t.querySelectorAll(e)).filter(a=>a.currentSrc||a.src).filter((a,s,r)=>r.indexOf(a)===s)}function k(t){return t.querySelector(M)}function q(){if(document.getElementById(A))return;let t=document.createElement("style");t.id=A,t.textContent=`
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
  `,document.head.appendChild(t)}function C(){let t=document.createElement("div");return t.className="newsletter-lightbox",t.setAttribute("data-lightbox",""),t.innerHTML=`
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
  `,t}function G(t,e,a){let s=t.querySelector("[data-lightbox-image]")||t.querySelector("img"),r=t.querySelector("[data-lightbox-caption]"),h=Array.from(t.querySelectorAll("[data-lightbox-counter]")),p=Array.from(t.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),f=t.querySelectorAll("[data-lightbox-close]"),b=t.querySelectorAll("[data-lightbox-prev]"),g=t.querySelectorAll("[data-lightbox-next]"),d=t.querySelector("[data-lightbox-stage]")||s?.parentElement||t;if(!s)return{open:()=>{},close:()=>{}};let u=e.length>1;R([...b,...g,...p],!u);let i=0,o=null,x=0,_=0,y=()=>{let n=e[i];n&&(s.src=n.src,s.alt=n.alt||n.caption||"Image",r&&(r.textContent=n.caption,r.hidden=!n.caption),h.forEach(l=>{l.textContent=`${i+1} / ${e.length}`}))},w=(n=0)=>{i=T(n,e.length),o=document.activeElement,y(),document.body.classList.add(a.bodyOpenClass),t.classList.add("is-open"),t.setAttribute("aria-hidden","false"),(t.querySelector("[data-lightbox-close]")||t.querySelector("button")||t).focus()},m=()=>{t.classList.remove("is-open"),t.setAttribute("aria-hidden","true"),document.body.classList.remove(a.bodyOpenClass),o instanceof HTMLElement&&o.focus()},E=()=>{u&&(i=T(i-1,e.length),y())},L=()=>{u&&(i=T(i+1,e.length),y())};return a.triggerImages&&e.forEach((n,l)=>{n.img.addEventListener("click",c=>{c.preventDefault(),w(l)}),n.img.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),w(l))})}),f.forEach(n=>n.addEventListener("click",m)),b.forEach(n=>n.addEventListener("click",E)),g.forEach(n=>n.addEventListener("click",L)),t.addEventListener("click",n=>{let l=n.target;if(!(l instanceof Element))return;!l.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&t.contains(l)&&m()}),d.addEventListener("touchstart",n=>{let l=n.changedTouches[0];x=l.clientX,_=l.clientY},{passive:!0}),d.addEventListener("touchend",n=>{let l=n.changedTouches[0],c=l.clientX-x,S=l.clientY-_;Math.abs(c)>45&&Math.abs(c)>Math.abs(S)&&(c>0?E():L())},{passive:!0}),document.addEventListener("keydown",n=>{t.classList.contains("is-open")&&(n.key==="Escape"&&m(),n.key==="ArrowLeft"&&E(),n.key==="ArrowRight"&&L())}),{open:w,close:m}}function T(t,e){return e?(t%e+e)%e:0}function R(t,e){t.forEach(a=>{a.hidden=e,a.setAttribute("aria-hidden",String(e)),e?a.style.setProperty("display","none","important"):a.style.removeProperty("display")})}function N(t){let e=t.closest("a[href]"),a=e?.getAttribute("href")||"";return I.test(a)?e?.href||"":t.currentSrc||t.src}function P(t){return(t.closest("figure")?.querySelector("figcaption")?.textContent||t.alt||"").trim()}var B=".post-content_component.grid .post-content_wrapper > .w-richtext, .post-content_left.w-richtext, .post-content_left .w-richtext",v="news-rich-text-gallery-css";function D(){let t=document.querySelectorAll(B);t.length&&(X(),t.forEach(e=>{if(e.dataset.newsGalleryInitialised==="true")return;e.dataset.newsGalleryRichText="";let a=[],s=()=>{if(a.length>1){let r=document.createElement("div");r.className="news-rich-text-gallery",r.dataset.count=String(a.length),a[0].before(r),r.append(...a)}a=[]};Array.from(e.children).forEach(r=>{r.matches("figure")&&r.querySelector("img")?a.push(r):s()}),s(),H({root:e,label:"News article images",overlayAttribute:"data-news-lightbox"}),e.dataset.newsGalleryInitialised="true"}))}function X(){if(document.getElementById(v))return;let t=document.createElement("style");t.id=v,t.textContent=`
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
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__image { max-width: 100%; max-height: 100%; width: auto; height: auto; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__button { position: absolute; z-index: 1; color: white; background: transparent; border: 0; font-size: 40px; cursor: pointer; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__close { top: 20px; right: 24px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__prev { left: 20px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__next { right: 20px; }
    [data-news-lightbox].newsletter-lightbox .newsletter-lightbox__meta { position: absolute; bottom: 20px; color: white; text-align: center; }
  `,document.head.appendChild(t)}})();
