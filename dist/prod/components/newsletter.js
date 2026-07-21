"use strict";(()=>{var G="[data-lightbox-template], [data-newsletter-lightbox-template]";var N="krb-lightbox-css",B=/\.(jpe?g|png|webp|gif|avif)(\?.*)?$/i;function v(e){let{root:t,imagesSelector:n="img",template:r=X(t),label:a="Image gallery",initialisedKey:l="lightboxInitialised",imageIndexAttribute:g="lightboxIndex",overlayAttribute:c="data-lightbox",bodyOpenClass:s="lightbox-open",triggerImages:E=!0}=e;if(t.dataset[l]==="true")return;let u=$(t,n);if(!u.length)return;let f=u.map((d,h)=>(d.dataset[g]=String(h),E&&(d.setAttribute("tabindex","0"),d.setAttribute("role","button"),d.setAttribute("aria-label",d.alt?`Open image: ${d.alt}`:"Open image")),{img:d,src:W(d),alt:d.alt||"",caption:z(d)}));Y();let o=r?r.cloneNode(!0):U();o instanceof HTMLElement&&(o.removeAttribute("data-lightbox-template"),o.removeAttribute("data-newsletter-lightbox-template"),o.setAttribute(c,""),o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true"),o.setAttribute("aria-label",a),o.setAttribute("aria-hidden","true"),r&&o.style.removeProperty("display"),document.body.appendChild(o),F(o,f,{bodyOpenClass:s,triggerImages:E}),t.dataset[l]="true")}function $(e,t){return Array.from(e.querySelectorAll(t)).filter(n=>n.currentSrc||n.src).filter((n,r,a)=>a.indexOf(n)===r)}function X(e){return e.querySelector(G)}function Y(){if(document.getElementById(N))return;let e=document.createElement("style");e.id=N,e.textContent=`
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
  `,document.head.appendChild(e)}function U(){let e=document.createElement("div");return e.className="newsletter-lightbox",e.setAttribute("data-lightbox",""),e.innerHTML=`
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
  `,e}function F(e,t,n){let r=e.querySelector("[data-lightbox-image]")||e.querySelector("img"),a=e.querySelector("[data-lightbox-caption]"),l=Array.from(e.querySelectorAll("[data-lightbox-counter]")),g=Array.from(e.querySelectorAll("[data-lightbox-counter], [data-lightbox-pagination]")),c=e.querySelectorAll("[data-lightbox-close]"),s=e.querySelectorAll("[data-lightbox-prev]"),E=e.querySelectorAll("[data-lightbox-next]"),u=e.querySelector("[data-lightbox-stage]")||r?.parentElement||e;if(!r)return{open:()=>{},close:()=>{}};let f=t.length>1;K([...s,...E,...g],!f);let o=0,d=null,h=0,b=0,x=()=>{let i=t[o];i&&(r.src=i.src,r.alt=i.alt||i.caption||"Image",a&&(a.textContent=i.caption,a.hidden=!i.caption),l.forEach(m=>{m.textContent=`${o+1} / ${t.length}`}))},H=(i=0)=>{o=_(i,t.length),d=document.activeElement,x(),document.body.classList.add(n.bodyOpenClass),e.classList.add("is-open"),e.setAttribute("aria-hidden","false"),(e.querySelector("[data-lightbox-close]")||e.querySelector("button")||e).focus()},y=()=>{e.classList.remove("is-open"),e.setAttribute("aria-hidden","true"),document.body.classList.remove(n.bodyOpenClass),d instanceof HTMLElement&&d.focus()},M=()=>{f&&(o=_(o-1,t.length),x())},S=()=>{f&&(o=_(o+1,t.length),x())};return n.triggerImages&&t.forEach((i,m)=>{i.img.addEventListener("click",p=>{p.preventDefault(),H(m)}),i.img.addEventListener("keydown",p=>{(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),H(m))})}),c.forEach(i=>i.addEventListener("click",y)),s.forEach(i=>i.addEventListener("click",M)),E.forEach(i=>i.addEventListener("click",S)),e.addEventListener("click",i=>{let m=i.target;if(!(m instanceof Element))return;!m.closest("[data-lightbox-close], [data-lightbox-prev], [data-lightbox-next], [data-lightbox-image], [data-lightbox-caption], [data-lightbox-counter], [data-lightbox-pagination], button, a, img, video, iframe")&&e.contains(m)&&y()}),u.addEventListener("touchstart",i=>{let m=i.changedTouches[0];h=m.clientX,b=m.clientY},{passive:!0}),u.addEventListener("touchend",i=>{let m=i.changedTouches[0],p=m.clientX-h,D=m.clientY-b;Math.abs(p)>45&&Math.abs(p)>Math.abs(D)&&(p>0?M():S())},{passive:!0}),document.addEventListener("keydown",i=>{e.classList.contains("is-open")&&(i.key==="Escape"&&y(),i.key==="ArrowLeft"&&M(),i.key==="ArrowRight"&&S())}),{open:H,close:y}}function _(e,t){return t?(e%t+t)%t:0}function K(e,t){e.forEach(n=>{n.hidden=t,n.setAttribute("aria-hidden",String(t)),t?n.style.setProperty("display","none","important"):n.style.removeProperty("display")})}function W(e){let t=e.closest("a[href]"),n=t?.getAttribute("href")||"";return B.test(n)?t?.href||"":e.currentSrc||e.src}function z(e){return(e.closest("figure")?.querySelector("figcaption")?.textContent||e.alt||"").trim()}var j=".newsletter_component",L=".newsletter_side-nav_details",Q=".newsletter_side-nav_link",V=".newsletter_period_item[id]",J=".newsletter_period_item > details",I=".newsletter_rich-text.w-richtext",O=".newsletter-content_component",Z=".newsletter-content_toc",C="krb-newsletter-readmore-transition-css",ee="(min-width: 768px)",T=window.matchMedia(ee);function Ae(){te().forEach(t=>{let n=oe(t);ne(t),re(t),se(n),ce(t),be(t),xe(t)})}function te(){let e=Array.from(document.querySelectorAll(j));return e.length?e:Array.from(document.querySelectorAll(O))}function ne(e){let t=e.querySelector(L),n=t?.parentElement,r=t?.querySelector(Q);if(!t||!n||!r)return;let a=ie(ae(e));if(!a.size)return;let l=t.open,g=Array.from(a.entries()).map(([c,s],E)=>{let u=t.cloneNode(!0),f=u.querySelector("summary p")||u.querySelector("summary"),o=u.querySelector(".newsletter_side-nav_content"),d=o?.querySelector('[class*="spacer"]')?.cloneNode(!0);return u.open=l&&E===0,f&&(f.textContent=c),o&&o.replaceChildren(...s.map(h=>{let b=r.cloneNode(!0);return b.textContent=h.term,b.setAttribute("href",`#${encodeURIComponent(h.id)}`),b}),...d?[d]:[]),u});n.querySelectorAll(L).forEach(c=>c.remove()),n.append(...g)}function re(e){let n=e.querySelector(L)?.parentElement;if(!n?.parentElement||n.dataset.responsiveSideNavInitialised==="true")return;n.dataset.responsiveSideNavInitialised="true";let r=document.createComment("newsletter side nav mobile placeholder");n.before(r);let a=()=>{if(T.matches){n.isConnected||r.after(n);return}n.remove()};a(),T.addEventListener("change",a)}function ae(e){return Array.from(e.querySelectorAll(V)).filter(t=>!t.closest(L)).map(t=>{let n=t.closest("[data-year]")?.dataset.year||He(t.id),r=Me(t.id)||t.querySelector("summary")?.textContent?.trim();return!n||!r?null:{year:n,term:Se(r),id:t.id}}).filter(t=>!!t)}function ie(e){return e.reduce((t,n)=>{let r=t.get(n.year)||[];return r.some(l=>l.id===n.id)||t.set(n.year,[...r,n].sort(le)),t},new Map)}function le(e,t){return R(e.term)-R(t.term)}function oe(e){return Array.from(e.querySelectorAll(J)).filter(t=>!t.closest(L))}function se(e){let t=()=>{e.forEach(n=>{n.open=T.matches})};e.forEach(n=>{if(n.dataset.newsletterDetailsInitialised==="true")return;n.dataset.newsletterDetailsInitialised="true",n.querySelector("summary")?.addEventListener("click",a=>{T.matches&&(a.preventDefault(),n.open=!0)})}),t(),T.addEventListener("change",t)}function ce(e){let t=A(e);t&&t.dataset.newsletterArticlesInitialised!=="true"&&(ue(),Array.from(t.children).filter(de).forEach(n=>{if(n.closest(".newsletter_article"))return;let r=me(n);if(!Ee(r))return;let a=pe(r);if(!a)return;let l=document.createElement("div");l.className="newsletter_article",n.before(l),l.appendChild(n);let g=a.cloneNode(!0);g.classList.add("newsletter_article-summary"),l.appendChild(g);let c=document.createElement("div");c.className="newsletter_article-body",c.style.maxHeight="0px",l.appendChild(c),r.forEach(E=>c.appendChild(E));let s=document.createElement("button");s.type="button",s.className="newsletter_article-toggle",s.setAttribute("aria-expanded","false"),s.innerHTML=`
        <span class="more">Read More</span>
        <span class="less">Read Less</span>
        <span class="newsletter_article-toggle-icon" aria-hidden="true"></span>
      `,l.appendChild(s),s.addEventListener("click",()=>{l.classList.contains("is-open")?he(l,c,s):fe(l,c,s)})}),t.dataset.newsletterArticlesInitialised="true")}function ue(){if(document.getElementById(C))return;let e=document.createElement("style");e.id=C,e.textContent=`
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
  `,document.head.appendChild(e)}function de(e){if(!["H2","H3"].includes(e.tagName))return!1;if(e.tagName==="H3")return!0;let t=e.nextElementSibling;return!!(t&&!["H2","H3"].includes(t.tagName))}function me(e){let t=[],n=e.nextElementSibling;for(;n&&!ge(n);){let r=n.nextElementSibling;t.push(n),n=r}return t}function ge(e){return["H2","H3"].includes(e.tagName)?!0:e.tagName==="FIGURE"&&(e.nextElementSibling?.tagName==="FIGURE"||e.previousElementSibling?.tagName==="FIGURE")}function Ee(e){return e.some(t=>t.matches("p, ul, ol, blockquote, h4, h5, h6"))}function pe(e){return e.find(t=>t.matches("p, ul, ol, blockquote"))}function fe(e,t,n){e.classList.add("is-open"),n.setAttribute("aria-expanded","true"),t.style.maxHeight="0px",t.offsetHeight,t.style.maxHeight=`${t.scrollHeight}px`}function he(e,t,n){n.setAttribute("aria-expanded","false"),t.style.maxHeight=`${t.scrollHeight}px`,t.offsetHeight,e.classList.remove("is-open"),t.style.maxHeight="0px"}function be(e){let t=e.querySelector(Z),n=A(e);if(!t||!n||t.dataset.tocGenerated==="true")return;let r=t.querySelector(".newsletter-content_toc-group"),a=r?.querySelector(".newsletter-content_toc-group_top"),l=r?.querySelector(".newsletter-content_toc-group_link");if(!r||!a||!l)return;let g={},c=document.createDocumentFragment(),s=null;Array.from(n.children).forEach(E=>{let u=Le(E);if(u){if(u.tagName==="H2"){s=q(u,r,a,g),c.appendChild(s);return}if(u.tagName==="H3"){if(!s){s=q(u,r,a,g),c.appendChild(s);return}s.appendChild(Te(u,l,g))}}}),c.childNodes.length&&(r.remove(),t.appendChild(c),t.dataset.tocGenerated="true")}function q(e,t,n,r){let a=t.cloneNode(!1);a.removeAttribute("id"),a.removeAttribute("data-generated");let l=n.cloneNode(!0);return l.href=`#${k(e,r)}`,P(l,w(e)),a.appendChild(l),a}function Te(e,t,n){let r=t.cloneNode(!0);return r.href=`#${k(e,n)}`,P(r,w(e)),r}function Le(e){return["H2","H3"].includes(e.tagName)?e:e.classList.contains("newsletter_article")?e.querySelector(":scope > h2, :scope > h3"):null}function k(e,t){if(e.id)return e.id;let n=e.getAttribute("data-toc-id")||e.getAttribute("data-anchor-id");return e.id=n||ye(w(e),t),e.id}function ye(e,t){let n=e.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")||"section";return t[n]=(t[n]||0)+1,t[n]===1?n:`${n}-${t[n]}`}function w(e){return e.textContent?.trim().replace(/\s+/g," ")||""}function P(e,t){let n=e.querySelector("p")||e.querySelector(".text-style-eyebrow")||e.querySelector("div")||e;n.textContent=t}function xe(e){let t=A(e);if(!t)return;let n="[data-lightbox-template], [data-newsletter-lightbox-template]",r=e.querySelector(n)||document.querySelector(n);v({root:t,template:r,label:"Newsletter image gallery",initialisedKey:"lightboxInitialised",imageIndexAttribute:"newsletterLightboxIndex",overlayAttribute:"data-newsletter-lightbox",bodyOpenClass:"newsletter-lightbox-open",triggerImages:!0})}function A(e){return e.querySelector(`${O} ${I}`)||e.querySelector(I)}function He(e){return e.match(/\b(20\d{2})\b/)?.[1]}function Me(e){return e.match(/\bTerm\s+\d+\b/i)?.[0]}function R(e){return Number(e.match(/\d+/)?.[0]||0)}function Se(e){return e.replace(/\s+/g," ").trim().toLowerCase().replace(/\b\w/g,t=>t.toUpperCase())}})();
