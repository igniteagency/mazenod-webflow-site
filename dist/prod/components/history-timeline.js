"use strict";(()=>{var j="[data-lightbox-template], [data-newsletter-lightbox-template]";var R="krb-lightbox-css",z=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function C(t){let{root:e,imagesSelector:i="img",template:n=J(e),label:r="Image gallery",initialisedKey:a="lightboxInitialised",imageIndexAttribute:u="lightboxIndex",overlayAttribute:T="data-lightbox",bodyOpenClass:g="lightbox-open",triggerImages:E=!0}=t;if(e.dataset[a]==="true")return;let p=W(e,i);if(!p.length)return;let m=p.map((l,d)=>(l.dataset[u]=String(d),E&&(l.setAttribute("tabindex","0"),l.setAttribute("role","button"),l.setAttribute("aria-label",l.alt?`Open image: ${l.alt}`:"Open image")),{img:l,src:te(l),alt:l.alt||"",caption:ie(l)}));K();let s=n?n.cloneNode(!0):Q();s instanceof HTMLElement&&(s.removeAttribute("data-lightbox-template"),s.removeAttribute("data-newsletter-lightbox-template"),s.setAttribute(T,""),s.setAttribute("role","dialog"),s.setAttribute("aria-modal","true"),s.setAttribute("aria-label",r),s.setAttribute("aria-hidden","true"),n&&s.style.removeProperty("display"),document.body.appendChild(s),Z(s,m,{bodyOpenClass:g,triggerImages:E}),e.dataset[a]="true")}function W(t,e){return Array.from(t.querySelectorAll(e)).filter(i=>i.currentSrc||i.src).filter((i,n,r)=>r.indexOf(i)===n)}function J(t){return t.querySelector(j)}function K(){if(document.getElementById(R))return;let t=document.createElement("style");t.id=R,t.textContent=`
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
  `,document.head.appendChild(t)}function Q(){let t=document.createElement("div");return t.className="newsletter-lightbox",t.setAttribute("data-lightbox",""),t.innerHTML=`
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
  `,t}function Z(t,e,i){let n=t.querySelector("[data-lightbox-image]")||t.querySelector("img"),r=t.querySelector("[data-lightbox-caption]"),a=Array.from(t.querySelectorAll("[data-lightbox-counter]")),u=Array.from(t.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),T=t.querySelectorAll("[data-lightbox-close]"),g=t.querySelectorAll("[data-lightbox-prev]"),E=t.querySelectorAll("[data-lightbox-next]"),p=t.querySelector("[data-lightbox-stage]")||n?.parentElement||t;if(!n)return{open:()=>{},close:()=>{}};let m=e.length>1;ee([...g,...E,...u],!m);let s=0,l=null,d=0,b=0,y=()=>{let o=e[s];o&&(n.src=o.src,n.alt=o.alt||o.caption||"Image",r&&(r.textContent=o.caption,r.hidden=!o.caption),a.forEach(c=>{c.textContent=`${s+1} / ${e.length}`}))},S=(o=0)=>{s=w(o,e.length),l=document.activeElement,y(),document.body.classList.add(i.bodyOpenClass),t.classList.add("is-open"),t.setAttribute("aria-hidden","false"),(t.querySelector("[data-lightbox-close]")||t.querySelector("button")||t).focus()},L=()=>{t.classList.remove("is-open"),t.setAttribute("aria-hidden","true"),document.body.classList.remove(i.bodyOpenClass),l instanceof HTMLElement&&l.focus()},x=()=>{m&&(s=w(s-1,e.length),y())},v=()=>{m&&(s=w(s+1,e.length),y())};return i.triggerImages&&e.forEach((o,c)=>{o.img.addEventListener("click",h=>{h.preventDefault(),S(c)}),o.img.addEventListener("keydown",h=>{(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),S(c))})}),T.forEach(o=>o.addEventListener("click",L)),g.forEach(o=>o.addEventListener("click",x)),E.forEach(o=>o.addEventListener("click",v)),t.addEventListener("click",o=>{let c=o.target;if(!(c instanceof Element))return;!c.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&t.contains(c)&&L()}),p.addEventListener("touchstart",o=>{let c=o.changedTouches[0];d=c.clientX,b=c.clientY},{passive:!0}),p.addEventListener("touchend",o=>{let c=o.changedTouches[0],h=c.clientX-d,V=c.clientY-b;Math.abs(h)>45&&Math.abs(h)>Math.abs(V)&&(h>0?x():v())},{passive:!0}),document.addEventListener("keydown",o=>{t.classList.contains("is-open")&&(o.key==="Escape"&&L(),o.key==="ArrowLeft"&&x(),o.key==="ArrowRight"&&v())}),{open:S,close:L}}function w(t,e){return e?(t%e+e)%e:0}function ee(t,e){t.forEach(i=>{i.hidden=e,i.setAttribute("aria-hidden",String(e)),e?i.style.setProperty("display","none","important"):i.style.removeProperty("display")})}function te(t){let e=t.closest("a[href]"),i=e?.getAttribute("href")||"";return z.test(i)?e?.href||"":t.currentSrc||t.src}function ie(t){return(t.closest("figure")?.querySelector("figcaption")?.textContent||t.alt||"").trim()}var U='[data-history-timeline="component"], .history-timeline_component',ne=".section_history-timeline",re=".history-timeline_swiper.swiper",$=".history-timeline_slide.swiper-slide",ae=".history-timeline_nav-swiper.swiper",N=".history-timeline_nav-swiper-wrapper.swiper-wrapper",oe='[data-history-timeline="nav-template"], .history-timeline_nav-swiper-slide.swiper-slide',se="history-timeline_nav-swiper-slide swiper-slide",le='[data-slider-el="nav-prev"]',de='[data-slider-el="nav-next"]',ce="[data-history-year], .history-timeline_slide-overlay_number",ue="[data-lightbox-gallery]",me="[data-lightbox-template], [data-newsletter-lightbox-template]",he=".history-timeline_slide-image",pe='[data-history-timeline="read-more"]',ge='[data-history-timeline="read-more-text"]',Ee=".button_text",O="history-timeline-read-more-styles",q=4,F=400,P="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",be=700,Te=3500,k="historyTimelineInitialised",f="is-active",B="is-previous",D="is-next",ye="is-disabled",fe="historyTimelineDuration",Le="historyTimelineImageDuration",A=class{component;section;slides;speed;imageRotationDelay;mainSwiper=null;navSwiper=null;imageRotationTimer=null;constructor(e){this.component=e,this.section=e.closest(ne)||e,this.slides=this.getSlides(),this.speed=G(e.dataset[fe],be),this.imageRotationDelay=G(e.dataset[Le],Te)}init(){if(this.component.dataset[k]==="true")return;let e=this.component.querySelector(re),i=this.section.querySelector(ae),n=this.section.querySelector(N);if(!e||!i||!n||!this.slides.length){console.warn("Skipping invalid history timeline component",this.component);return}this.component.dataset[k]="true",this.buildYearNavigation(n),this.initNavigationEvents(n),this.initLightboxGalleries(),this.initReadMoreControls(),this.initImageStates(),this.initSwipers(e,i),this.syncToSlide(0,0)}getSlides(){return Array.from(this.component.querySelectorAll($)).map(e=>({el:e,year:Se(e),images:Array.from(e.querySelectorAll(he)),imageIndex:0}))}buildYearNavigation(e){let i=e.querySelector(oe),n=this.slides.map((r,a)=>this.createNavSlide(r.year,a,i));e.replaceChildren(...n)}createNavSlide(e,i,n){let r=n?n.cloneNode(!0):document.createElement("button");return r.className=n?.className||se,r.removeAttribute("data-history-timeline"),r.dataset.historyYear=e,r.dataset.historyIndex=String(i),r.setAttribute("role","button"),r.setAttribute("tabindex","0"),r.setAttribute("aria-label",`Go to ${e}`),xe(r,e),r}initNavigationEvents(e){let i=n=>{let r=n.target;if(!(r instanceof Element))return;let a=r.closest(".swiper-slide[data-history-index]");if(!a||!e.contains(a))return;let u=Number(a.dataset.historyIndex);if(Number.isInteger(u)){if(this.mainSwiper?.slideToLoop){this.mainSwiper.slideToLoop(u,this.speed);return}this.mainSwiper?.slideTo(u,this.speed)}};e.addEventListener("click",i),e.addEventListener("keydown",n=>{n.key!=="Enter"&&n.key!==" "||(n.preventDefault(),i(n))})}initLightboxGalleries(){let e=this.section.querySelector(me);this.slides.forEach(i=>{i.el.querySelectorAll(ue).forEach(n=>{C({root:n,template:e,label:n.getAttribute("aria-label")||`${i.year} history image gallery`})})})}initReadMoreControls(){let e=Array.from(this.component.querySelectorAll(pe)).map(a=>ve(a)).filter(a=>!!a);if(!e.length)return;let i=0,n=()=>e.forEach(a=>a()),r=()=>{window.cancelAnimationFrame(i),i=window.requestAnimationFrame(n)};r(),document.fonts?.ready.then(r),window.addEventListener("resize",r)}initImageStates(){this.slides.forEach(e=>{e.images.forEach((i,n)=>i.classList.toggle(f,n===0)),e.imageIndex=0})}initSwipers(e,i){let n=this.section.querySelector(le),r=this.section.querySelector(de);this.navSwiper=new Swiper(i,{loop:!0,slidesPerView:"auto",centeredSlides:!1,slideToClickedSlide:!1,spaceBetween:0,speed:this.speed,watchSlidesProgress:!0,slideActiveClass:f,slidePrevClass:B,slideNextClass:D,a11y:{enabled:!0}}),this.mainSwiper=new Swiper(e,{loop:!0,speed:this.speed,spaceBetween:0,slidesPerView:1,navigation:n&&r?{nextEl:r,prevEl:n,disabledClass:ye}:!1,slideActiveClass:f,slidePrevClass:B,slideNextClass:D,a11y:{enabled:!0}}),this.mainSwiper.on("slideChange",()=>this.syncToSlide(this.mainSwiper?.realIndex||0)),this.navSwiper.on("slideChange",()=>this.syncMainToNav())}syncMainToNav(){if(!this.navSwiper||!this.mainSwiper||!this.slides.length)return;let e=this.navSwiper.realIndex;if(this.updateNavState(e),this.mainSwiper.realIndex!==e){if(this.mainSwiper.slideToLoop){this.mainSwiper.slideToLoop(e,this.speed);return}this.mainSwiper.slideTo(e,this.speed)}}syncToSlide(e,i=this.speed){this.updateNavState(e),this.syncNavRail(e,i),this.resetImageRotation(e)}syncNavRail(e,i){if(!(!this.navSwiper||!this.slides.length)){if(this.navSwiper.slideToLoop){this.navSwiper.slideToLoop(e,i);return}this.navSwiper.slideTo(e,i,!1)}}updateNavState(e){this.section.querySelectorAll(`${N} > .swiper-slide`).forEach(i=>{let n=Number(i.dataset.historyIndex)===e;i.classList.toggle(f,n),i.setAttribute("aria-current",n?"true":"false")})}resetImageRotation(e){this.imageRotationTimer&&(window.clearInterval(this.imageRotationTimer),this.imageRotationTimer=null);let i=this.slides[e];!i||i.images.length<2||(i.imageIndex=0,this.setActiveImage(i,0),this.imageRotationTimer=window.setInterval(()=>{i.imageIndex=(i.imageIndex+1)%i.images.length,this.setActiveImage(i,i.imageIndex)},this.imageRotationDelay))}setActiveImage(e,i){e.images.forEach((n,r)=>n.classList.toggle(f,r===i))}};function G(t,e){let i=Number(t);return Number.isFinite(i)&&i>0?i:e}function Se(t){let e=t.dataset.historyYear?.trim(),i=t.querySelector(ce)?.textContent?.trim();return e||i||""}function xe(t,e){let i=t.querySelector("[data-history-year]");if(i){i.textContent=e,i.dataset.historyYear=e;return}let n=Array.from(t.children).find(r=>r instanceof HTMLElement&&!!r.textContent?.trim());if(n){n.textContent=e;return}t.textContent=e}var Y=0;function ve(t){let e=t instanceof HTMLButtonElement?t:t.querySelector("button");if(!e||e.dataset.historyReadMoreInitialised==="true")return null;let i=e.closest($),n=e.closest(".button_component")||e,a=i?.querySelector(ge)||n.previousElementSibling;if(!(a instanceof HTMLElement))return console.warn("Skipping history read more control without adjacent text",e),null;let u=e.querySelector(Ee),T=u?.textContent?.trim()||"Read more",g=e.dataset.historyReadMoreExpandedLabel?.trim()||"Read less",E=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,p=0,m=0;Y+=1,a.id||=`history-read-more-${Y}`,a.dataset.historyReadMoreText="true",n.dataset.historyReadMoreContainer="true",e.dataset.historyReadMoreInitialised="true",e.type="button",e.setAttribute("aria-controls",a.id);let s=d=>{e.setAttribute("aria-expanded",String(d)),e.setAttribute("aria-label",d?g:T),u&&(u.textContent=d?g:T)},l=d=>{a.dataset.historyReadMoreExpanded=String(d),s(d)};return l(!1),e.addEventListener("click",()=>{let d=e.getAttribute("aria-expanded")!=="true";if(window.clearTimeout(m),E||!p){a.style.maxHeight="",a.style.overflow="",l(d);return}let b=a.getBoundingClientRect().height;a.style.maxHeight=`${b}px`,a.style.overflow="hidden",d?l(!0):s(!1);let y=d?a.scrollHeight:p;a.getBoundingClientRect(),window.requestAnimationFrame(()=>{a.style.maxHeight=`${y}px`}),m=window.setTimeout(()=>{d||(a.dataset.historyReadMoreExpanded="false"),a.style.maxHeight="",a.style.overflow="",m=0},F)}),()=>{let d=e.getAttribute("aria-expanded")==="true";window.clearTimeout(m),m=0,a.style.maxHeight="",a.style.overflow="",l(!1),n.hidden=!1;let b=a.scrollHeight>a.clientHeight+1;p=a.clientHeight,n.hidden=!b,l(b&&d)}}function we(){if(document.getElementById(O))return;let t=document.createElement("style");t.id=O,t.textContent=`
    [data-history-read-more-text="true"] {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${q};
      line-clamp: ${q};
      overflow: hidden;
      transition: max-height ${F}ms cubic-bezier(0.19, 1, 0.22, 1);
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

    @media (prefers-reduced-motion: reduce) {
      [data-history-read-more-text="true"] {
        transition: none;
      }
    }
  `,document.head.appendChild(t)}function M(){return!!document.querySelector(U)}var _=null;function H(){return typeof Swiper<"u"}function I(){!M()||!H()||(we(),document.querySelectorAll(U).forEach(t=>new A(t).init()))}function _e(t,e){return H()?Promise.resolve():new Promise((i,n)=>{let r=document.createElement("script");r.src=t,r.defer=!0,r.onload=()=>{e&&document.dispatchEvent(new CustomEvent(`scriptLoaded:${e}`,{detail:{url:t,name:e,scriptName:e}})),i()},r.onerror=()=>n(new Error(`Failed to load script: ${t}`)),document.head.appendChild(r)})}function X(){if(H()){I();return}_=_||(window.loadScript?window.loadScript(P,{placement:"head",scriptName:"swiper"}):_e(P,"swiper")),_.then(I).catch(t=>{console.error("Failed to load Swiper JS for history timeline",t)})}document.addEventListener("scriptLoaded:swiper",I);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{M()&&X()}):M()&&X();})();
