"use strict";(()=>{var z="[data-lightbox-template], [data-newsletter-lightbox-template]";var R="krb-lightbox-css",W=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function C(i){let{root:e,imagesSelector:t="img",template:a=K(e),label:r="Image gallery",initialisedKey:n="lightboxInitialised",imageIndexAttribute:c="lightboxIndex",overlayAttribute:g="data-lightbox",bodyOpenClass:E="lightbox-open",triggerImages:b=!0}=i;if(e.dataset[n]==="true")return;let p=J(e,t);if(!p.length)return;let m=p.map((l,d)=>(l.dataset[c]=String(d),b&&(l.setAttribute("tabindex","0"),l.setAttribute("role","button"),l.setAttribute("aria-label",l.alt?`Open image: ${l.alt}`:"Open image")),{img:l,src:ie(l),alt:l.alt||"",caption:ne(l)}));Q();let o=a?a.cloneNode(!0):Z();o instanceof HTMLElement&&(o.removeAttribute("data-lightbox-template"),o.removeAttribute("data-newsletter-lightbox-template"),o.setAttribute(g,""),o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true"),o.setAttribute("aria-label",r),o.setAttribute("aria-hidden","true"),a&&o.style.removeProperty("display"),document.body.appendChild(o),ee(o,m,{bodyOpenClass:E,triggerImages:b}),e.dataset[n]="true")}function J(i,e){return Array.from(i.querySelectorAll(e)).filter(t=>t.currentSrc||t.src).filter((t,a,r)=>r.indexOf(t)===a)}function K(i){return i.querySelector(z)}function Q(){if(document.getElementById(R))return;let i=document.createElement("style");i.id=R,i.textContent=`
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
  `,document.head.appendChild(i)}function Z(){let i=document.createElement("div");return i.className="newsletter-lightbox",i.setAttribute("data-lightbox",""),i.innerHTML=`
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
  `,i}function ee(i,e,t){let a=i.querySelector("[data-lightbox-image]")||i.querySelector("img"),r=i.querySelector("[data-lightbox-caption]"),n=Array.from(i.querySelectorAll("[data-lightbox-counter]")),c=Array.from(i.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),g=i.querySelectorAll("[data-lightbox-close]"),E=i.querySelectorAll("[data-lightbox-prev]"),b=i.querySelectorAll("[data-lightbox-next]"),p=i.querySelector("[data-lightbox-stage]")||a?.parentElement||i;if(!a)return{open:()=>{},close:()=>{}};let m=e.length>1;te([...E,...b,...c],!m);let o=0,l=null,d=0,y=0,T=()=>{let s=e[o];s&&(a.src=s.src,a.alt=s.alt||s.caption||"Image",r&&(r.textContent=s.caption,r.hidden=!s.caption),n.forEach(u=>{u.textContent=`${o+1} / ${e.length}`}))},x=(s=0)=>{o=w(s,e.length),l=document.activeElement,T(),document.body.classList.add(t.bodyOpenClass),i.classList.add("is-open"),i.setAttribute("aria-hidden","false"),(i.querySelector("[data-lightbox-close]")||i.querySelector("button")||i).focus()},L=()=>{i.classList.remove("is-open"),i.setAttribute("aria-hidden","true"),document.body.classList.remove(t.bodyOpenClass),l instanceof HTMLElement&&l.focus()},v=()=>{m&&(o=w(o-1,e.length),T())},S=()=>{m&&(o=w(o+1,e.length),T())};return t.triggerImages&&e.forEach((s,u)=>{s.img.addEventListener("click",h=>{h.preventDefault(),x(u)}),s.img.addEventListener("keydown",h=>{(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),x(u))})}),g.forEach(s=>s.addEventListener("click",L)),E.forEach(s=>s.addEventListener("click",v)),b.forEach(s=>s.addEventListener("click",S)),i.addEventListener("click",s=>{let u=s.target;if(!(u instanceof Element))return;!u.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&i.contains(u)&&L()}),p.addEventListener("touchstart",s=>{let u=s.changedTouches[0];d=u.clientX,y=u.clientY},{passive:!0}),p.addEventListener("touchend",s=>{let u=s.changedTouches[0],h=u.clientX-d,j=u.clientY-y;Math.abs(h)>45&&Math.abs(h)>Math.abs(j)&&(h>0?v():S())},{passive:!0}),document.addEventListener("keydown",s=>{i.classList.contains("is-open")&&(s.key==="Escape"&&L(),s.key==="ArrowLeft"&&v(),s.key==="ArrowRight"&&S())}),{open:x,close:L}}function w(i,e){return e?(i%e+e)%e:0}function te(i,e){i.forEach(t=>{t.hidden=e,t.setAttribute("aria-hidden",String(e)),e?t.style.setProperty("display","none","important"):t.style.removeProperty("display")})}function ie(i){let e=i.closest("a[href]"),t=e?.getAttribute("href")||"";return W.test(t)?e?.href||"":i.currentSrc||i.src}function ne(i){return(i.closest("figure")?.querySelector("figcaption")?.textContent||i.alt||"").trim()}var $='[data-history-timeline="component"], .history-timeline_component',ae=".section_history-timeline",re=".history-timeline_swiper.swiper",V=".history-timeline_slide.swiper-slide",se=".history-timeline_nav-swiper.swiper",N=".history-timeline_nav-swiper-wrapper.swiper-wrapper",oe='[data-history-timeline="nav-template"], .history-timeline_nav-swiper-slide.swiper-slide',le="history-timeline_nav-swiper-slide swiper-slide",de='[data-slider-el="nav-prev"]',ce='[data-slider-el="nav-next"]',ue="[data-history-year], .history-timeline_slide-overlay_number",me="[data-lightbox-gallery]",he="[data-lightbox-template], [data-newsletter-lightbox-template]",pe=".history-timeline_slide-image",ge='[data-history-timeline="read-more"]',Ee='[data-history-timeline="read-more-text"]',be=".button_text",O="history-timeline-read-more-styles",D=4,F=400,P="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js",ye=700,Te=3500,q=3,fe=1,B="historyTimelineInitialised",f="is-active",k="is-previous",G="is-next",Le="is-disabled",xe="historyTimelineDuration",ve="historyTimelineImageDuration",_=class{component;section;slides;speed;imageRotationDelay;mainSwiper=null;navSwiper=null;imageRotationTimer=null;navResetTimer=null;navDisplayIndex=0;constructor(e){this.component=e,this.section=e.closest(ae)||e,this.slides=this.getSlides(),this.speed=Y(e.dataset[xe],ye),this.imageRotationDelay=Y(e.dataset[ve],Te)}init(){if(this.component.dataset[B]==="true")return;let e=this.component.querySelector(re),t=this.section.querySelector(se),a=this.section.querySelector(N);if(!e||!t||!a||!this.slides.length){console.warn("Skipping invalid history timeline component",this.component);return}this.component.dataset[B]="true",this.buildYearNavigation(a),this.initNavigationEvents(a),this.initLightboxGalleries(),this.initReadMoreControls(),this.initImageStates(),this.initSwipers(e,t),this.navDisplayIndex=this.getMiddleNavDisplayIndex(0),this.syncToSlide(0,0)}getSlides(){return Array.from(this.component.querySelectorAll(V)).map(e=>({el:e,year:Se(e),images:Array.from(e.querySelectorAll(pe)),imageIndex:0}))}buildYearNavigation(e){let t=e.querySelector(oe),a=Array.from({length:q}).flatMap((r,n)=>this.slides.map((c,g)=>this.createNavSlide(c.year,g,t,n)));e.replaceChildren(...a)}createNavSlide(e,t,a,r){let n=a?a.cloneNode(!0):document.createElement("button");return n.className=a?.className||le,n.removeAttribute("data-history-timeline"),n.dataset.historyYear=e,n.dataset.historyIndex=String(t),n.dataset.historyCopy=String(r),n.setAttribute("role","button"),n.setAttribute("tabindex","0"),n.setAttribute("aria-label",`Go to ${e}`),we(n,e),n}initNavigationEvents(e){let t=a=>{let r=a.target;if(!(r instanceof Element))return;let n=r.closest(".swiper-slide[data-history-index]");if(!n||!e.contains(n))return;let c=Number(n.dataset.historyIndex);if(Number.isInteger(c)){if(this.mainSwiper?.slideToLoop){this.mainSwiper.slideToLoop(c,this.speed);return}this.mainSwiper?.slideTo(c,this.speed)}};e.addEventListener("click",t),e.addEventListener("keydown",a=>{a.key!=="Enter"&&a.key!==" "||(a.preventDefault(),t(a))})}initLightboxGalleries(){let e=this.section.querySelector(he);this.slides.forEach(t=>{t.el.querySelectorAll(me).forEach(a=>{C({root:a,template:e,label:a.getAttribute("aria-label")||`${t.year} history image gallery`})})})}initReadMoreControls(){let e=Array.from(this.component.querySelectorAll(ge)).map(n=>Ie(n)).filter(n=>!!n);if(!e.length)return;let t=0,a=()=>e.forEach(n=>n()),r=()=>{window.cancelAnimationFrame(t),t=window.requestAnimationFrame(a)};r(),document.fonts?.ready.then(r),window.addEventListener("resize",r)}initImageStates(){this.slides.forEach(e=>{e.images.forEach((t,a)=>t.classList.toggle(f,a===0)),e.imageIndex=0})}initSwipers(e,t){let a=this.section.querySelector(de),r=this.section.querySelector(ce);this.navSwiper=new Swiper(t,{loop:!1,slidesPerView:"auto",centeredSlides:!1,slideToClickedSlide:!1,spaceBetween:0,speed:this.speed,watchSlidesProgress:!0,slideActiveClass:f,slidePrevClass:k,slideNextClass:G,a11y:{enabled:!0}}),this.mainSwiper=new Swiper(e,{loop:!0,speed:this.speed,spaceBetween:0,slidesPerView:1,navigation:a&&r?{nextEl:r,prevEl:a,disabledClass:Le}:!1,slideActiveClass:f,slidePrevClass:k,slideNextClass:G,a11y:{enabled:!0}}),this.mainSwiper.on("slideChange",()=>this.syncToSlide(this.mainSwiper?.realIndex||0)),this.navSwiper.on("slideChange",()=>this.syncMainToNav())}syncMainToNav(){if(!this.navSwiper||!this.mainSwiper||!this.slides.length)return;let e=this.getLogicalNavIndex(this.navSwiper.activeIndex);if(this.navDisplayIndex=this.navSwiper.activeIndex,this.updateNavState(e),this.mainSwiper.realIndex!==e){if(this.mainSwiper.slideToLoop){this.mainSwiper.slideToLoop(e,this.speed);return}this.mainSwiper.slideTo(e,this.speed)}}syncToSlide(e,t=this.speed){this.updateNavState(e),this.syncNavRail(e,t),this.resetImageRotation(e)}syncNavRail(e,t){if(!this.navSwiper||!this.slides.length)return;this.navResetTimer&&(window.clearTimeout(this.navResetTimer),this.navResetTimer=null);let a=this.getLogicalNavIndex(this.navDisplayIndex),r=Math.abs(e-a)>this.slides.length/2;r&&(this.navDisplayIndex=this.getMiddleNavDisplayIndex(a),this.navSwiper.slideTo(this.navDisplayIndex,0,!1));let n=this.getClosestNavDisplayIndex(e);this.navDisplayIndex=n,this.navSwiper.slideTo(n,t,!1);let c=this.getMiddleNavDisplayIndex(e);!r||n===c||(this.navResetTimer=window.setTimeout(()=>{this.navDisplayIndex=c,this.navSwiper?.slideTo(c,0,!1),this.navResetTimer=null},Math.max(t,0)+50))}getClosestNavDisplayIndex(e){let t=this.slides.length;return Array.from({length:q},(r,n)=>n*t+e).reduce((r,n)=>Math.abs(n-this.navDisplayIndex)<Math.abs(r-this.navDisplayIndex)?n:r)}getMiddleNavDisplayIndex(e){return fe*this.slides.length+e}getLogicalNavIndex(e){return this.slides.length?(e%this.slides.length+this.slides.length)%this.slides.length:0}updateNavState(e){this.section.querySelectorAll(`${N} > .swiper-slide`).forEach(t=>{let a=Number(t.dataset.historyIndex)===e;t.classList.toggle(f,a),t.setAttribute("aria-current",a?"true":"false")})}resetImageRotation(e){this.imageRotationTimer&&(window.clearInterval(this.imageRotationTimer),this.imageRotationTimer=null);let t=this.slides[e];!t||t.images.length<2||(t.imageIndex=0,this.setActiveImage(t,0),this.imageRotationTimer=window.setInterval(()=>{t.imageIndex=(t.imageIndex+1)%t.images.length,this.setActiveImage(t,t.imageIndex)},this.imageRotationDelay))}setActiveImage(e,t){e.images.forEach((a,r)=>a.classList.toggle(f,r===t))}};function Y(i,e){let t=Number(i);return Number.isFinite(t)&&t>0?t:e}function Se(i){let e=i.dataset.historyYear?.trim(),t=i.querySelector(ue)?.textContent?.trim();return e||t||""}function we(i,e){let t=i.querySelector("[data-history-year]");if(t){t.textContent=e,t.dataset.historyYear=e;return}let a=Array.from(i.children).find(r=>r instanceof HTMLElement&&!!r.textContent?.trim());if(a){a.textContent=e;return}i.textContent=e}var X=0;function Ie(i){let e=i instanceof HTMLButtonElement?i:i.querySelector("button");if(!e||e.dataset.historyReadMoreInitialised==="true")return null;let t=e.closest(V),a=e.closest(".button_component")||e,n=t?.querySelector(Ee)||a.previousElementSibling;if(!(n instanceof HTMLElement))return console.warn("Skipping history read more control without adjacent text",e),null;let c=e.querySelector(be),g=c?.textContent?.trim()||"Read more",E=e.dataset.historyReadMoreExpandedLabel?.trim()||"Read less",b=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,p=0,m=0;X+=1,n.id||=`history-read-more-${X}`,n.dataset.historyReadMoreText="true",a.dataset.historyReadMoreContainer="true",e.dataset.historyReadMoreInitialised="true",e.type="button",e.setAttribute("aria-controls",n.id);let o=d=>{e.setAttribute("aria-expanded",String(d)),e.setAttribute("aria-label",d?E:g),c&&(c.textContent=d?E:g)},l=d=>{n.dataset.historyReadMoreExpanded=String(d),o(d)};return l(!1),e.addEventListener("click",()=>{let d=e.getAttribute("aria-expanded")!=="true";if(window.clearTimeout(m),b||!p){n.style.maxHeight="",n.style.overflow="",l(d);return}let y=n.getBoundingClientRect().height;n.style.maxHeight=`${y}px`,n.style.overflow="hidden",d?l(!0):o(!1);let T=d?n.scrollHeight:p;n.getBoundingClientRect(),window.requestAnimationFrame(()=>{n.style.maxHeight=`${T}px`}),m=window.setTimeout(()=>{d||(n.dataset.historyReadMoreExpanded="false"),n.style.maxHeight="",n.style.overflow="",m=0},F)}),()=>{let d=e.getAttribute("aria-expanded")==="true";window.clearTimeout(m),m=0,n.style.maxHeight="",n.style.overflow="",l(!1),a.hidden=!1;let y=n.scrollHeight>n.clientHeight+1;p=n.clientHeight,a.hidden=!y,l(y&&d)}}function _e(){if(document.getElementById(O))return;let i=document.createElement("style");i.id=O,i.textContent=`
    [data-history-read-more-text="true"] {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: ${D};
      line-clamp: ${D};
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
  `,document.head.appendChild(i)}function M(){return!!document.querySelector($)}var I=null;function H(){return typeof Swiper<"u"}function A(){!M()||!H()||(_e(),document.querySelectorAll($).forEach(i=>new _(i).init()))}function Me(i,e){return H()?Promise.resolve():new Promise((t,a)=>{let r=document.createElement("script");r.src=i,r.defer=!0,r.onload=()=>{e&&document.dispatchEvent(new CustomEvent(`scriptLoaded:${e}`,{detail:{url:i,name:e,scriptName:e}})),t()},r.onerror=()=>a(new Error(`Failed to load script: ${i}`)),document.head.appendChild(r)})}function U(){if(H()){A();return}I=I||(window.loadScript?window.loadScript(P,{placement:"head",scriptName:"swiper"}):Me(P,"swiper")),I.then(A).catch(i=>{console.error("Failed to load Swiper JS for history timeline",i)})}document.addEventListener("scriptLoaded:swiper",A);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",()=>{M()&&U()}):M()&&U();})();
