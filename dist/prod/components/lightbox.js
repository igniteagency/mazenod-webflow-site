"use strict";(()=>{var _="[data-lightbox-parent]",w="[data-lightbox-trigger]",O="[data-lightbox-target]",q="[data-lightbox-template], [data-newsletter-lightbox-template]",M="[data-lightbox-gallery]",C='[data-history-timeline="component"], .history-timeline_component',S="krb-lightbox-css",k=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function K(t=document){P(t).forEach(N)}function U(t=document){R(t).forEach(e=>{G({root:e,template:v(document),label:e.getAttribute("aria-label")||e.getAttribute("data-lightbox-gallery")||"Image gallery"})})}function G(t){let{root:e,imagesSelector:a="img",template:o=v(e),label:d="Image gallery",initialisedKey:b="lightboxInitialised",imageIndexAttribute:E="lightboxIndex",overlayAttribute:x="data-lightbox",bodyOpenClass:h="lightbox-open",triggerImages:g=!0,showCaption:m=!0}=t;if(e.dataset[b]==="true")return;let u=X(e,a);if(!u.length)return;let c=u.map((l,f)=>(l.dataset[E]=String(f),g&&(l.setAttribute("tabindex","0"),l.setAttribute("role","button"),l.setAttribute("aria-label",l.alt?`Open image: ${l.alt}`:"Open image")),{img:l,src:z(l),alt:l.alt||"",caption:F(l)}));Y();let r=o?o.cloneNode(!0):D();r instanceof HTMLElement&&(r.removeAttribute("data-lightbox-template"),r.removeAttribute("data-newsletter-lightbox-template"),r.setAttribute(x,""),r.setAttribute("role","dialog"),r.setAttribute("aria-modal","true"),r.setAttribute("aria-label",d),r.setAttribute("aria-hidden","true"),m||r.querySelector("[data-lightbox-caption]")?.remove(),o&&r.style.removeProperty("display"),document.body.appendChild(r),$(r,c,{bodyOpenClass:h,triggerImages:g}),e.dataset[b]="true")}function P(t){let e=Array.from(t.querySelectorAll(_));return t instanceof HTMLElement&&t.matches(_)&&e.unshift(t),e}function R(t){let e=Array.from(t.querySelectorAll(M));return t instanceof HTMLElement&&t.matches(M)&&e.unshift(t),e.filter(a=>!a.closest(C))}function N(t){t.querySelectorAll(w).forEach(e=>{if(e.dataset.lightboxBound==="true")return;let a=B(t,e);!a||a===e||(e.dataset.lightboxBound="true",e.addEventListener("click",o=>{o.preventDefault(),a.click()}))})}function B(t,e){let a=e.getAttribute("data-lightbox-trigger")?.trim();if(a)try{let o=t.querySelector(a);if(o)return o}catch{return null}return t.querySelector(O)}function X(t,e){return Array.from(t.querySelectorAll(e)).filter(a=>a.currentSrc||a.src).filter((a,o,d)=>d.indexOf(a)===o)}function v(t){return t.querySelector(q)}function Y(){if(document.getElementById(S))return;let t=document.createElement("style");t.id=S,t.textContent=`
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
  `,document.head.appendChild(t)}function D(){let t=document.createElement("div");return t.className="newsletter-lightbox",t.setAttribute("data-lightbox",""),t.innerHTML=`
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
  `,t}function $(t,e,a){let o=t.querySelector("[data-lightbox-image]")||t.querySelector("img"),d=t.querySelector("[data-lightbox-caption]"),b=Array.from(t.querySelectorAll("[data-lightbox-counter]")),E=Array.from(t.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),x=t.querySelectorAll("[data-lightbox-close]"),h=t.querySelectorAll("[data-lightbox-prev]"),g=t.querySelectorAll("[data-lightbox-next]"),m=t.querySelector("[data-lightbox-stage]")||o?.parentElement||t;if(!o)return{open:()=>{},close:()=>{}};let u=e.length>1;j([...h,...g,...E],!u);let c=0,r=null,l=0,f=0,L=()=>{let n=e[c];n&&(o.src=n.src,o.alt=n.alt||n.caption||"Image",d&&(d.textContent=n.caption,d.hidden=!n.caption),b.forEach(i=>{i.textContent=`${c+1} / ${e.length}`}))},y=(n=0)=>{c=H(n,e.length),r=document.activeElement,L(),document.body.classList.add(a.bodyOpenClass),t.classList.add("is-open"),t.setAttribute("aria-hidden","false"),(t.querySelector("[data-lightbox-close]")||t.querySelector("button")||t).focus()},p=()=>{t.classList.remove("is-open"),t.setAttribute("aria-hidden","true"),document.body.classList.remove(a.bodyOpenClass),r instanceof HTMLElement&&r.focus()},T=()=>{u&&(c=H(c-1,e.length),L())},A=()=>{u&&(c=H(c+1,e.length),L())};return a.triggerImages&&e.forEach((n,i)=>{n.img.addEventListener("click",s=>{s.preventDefault(),y(i)}),n.img.addEventListener("keydown",s=>{(s.key==="Enter"||s.key===" ")&&(s.preventDefault(),y(i))})}),x.forEach(n=>n.addEventListener("click",p)),h.forEach(n=>n.addEventListener("click",T)),g.forEach(n=>n.addEventListener("click",A)),t.addEventListener("click",n=>{let i=n.target;if(!(i instanceof Element))return;!i.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&t.contains(i)&&p()}),m.addEventListener("touchstart",n=>{let i=n.changedTouches[0];l=i.clientX,f=i.clientY},{passive:!0}),m.addEventListener("touchend",n=>{let i=n.changedTouches[0],s=i.clientX-l,I=i.clientY-f;Math.abs(s)>45&&Math.abs(s)>Math.abs(I)&&(s>0?T():A())},{passive:!0}),document.addEventListener("keydown",n=>{t.classList.contains("is-open")&&(n.key==="Escape"&&p(),n.key==="ArrowLeft"&&T(),n.key==="ArrowRight"&&A())}),{open:y,close:p}}function H(t,e){return e?(t%e+e)%e:0}function j(t,e){t.forEach(a=>{a.hidden=e,a.setAttribute("aria-hidden",String(e)),e?a.style.setProperty("display","none","important"):a.style.removeProperty("display")})}function z(t){let e=t.closest("a[href]"),a=e?.getAttribute("href")||"";return k.test(a)?e?.href||"":t.currentSrc||t.src}function F(t){return(t.closest("figure")?.querySelector("figcaption")?.textContent||t.alt||"").trim()}})();
