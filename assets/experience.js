/* =========================================================================
   SBTi "Net-Zero Loop" — experience chassis
   ES module. GSAP core + ScrollTrigger via CDN (pinned gsap@3.12.5).
   Responsibilities:
     - scroll-reveal system driven by [data-reveal] / [data-reveal-group]
     - progress rail: desktop loop SVG fill + clickable chapter dots,
       mobile top progress bar
     - hash-redirect handling (old anchors → new chapters)
     - prefers-reduced-motion: disable animation, instant reveals, parity
     - exposes the window.NZ chassis API used by the other modules
   No Club GSAP plugins. Transforms/opacity only. No pinned sections.
   ========================================================================= */

import { gsap } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger.js/+esm';

gsap.registerPlugin(ScrollTrigger);

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------
   Chapter manifest — single source of truth for rail dots + hash redirects.
   ------------------------------------------------------------------------- */
const CHAPTERS = [
  { id: 'top',       label: 'Hero' },
  { id: 'category',  label: 'A or B?' },
  { id: 'horizon',   label: 'Horizon' },
  { id: 'govern',    label: 'Govern' },
  { id: 'baseline',  label: 'Baseline' },
  { id: 'targets',   label: 'Targets' },
  { id: 'implement', label: 'Implement' },
  { id: 'prove',     label: 'Prove' },
  { id: 'oer',       label: 'Responsibility' },
  { id: 'about',     label: 'About' }
];

const HASH_REDIRECTS = {
  '#timeline': '#horizon',
  '#scope-1':  '#targets',
  '#scope-2':  '#targets',
  '#scope-3':  '#targets'
};

/* =========================================================================
   Public chassis API (window.NZ) — lets the hero, personalization and
   chapter scripts register reveals / read motion prefs without
   re-implementing observers or re-importing GSAP.
   ========================================================================= */
const listeners = [];
const NZ = {
  gsap,
  ScrollTrigger,
  reducedMotion: REDUCED,
  chapters: CHAPTERS,
  /** Register an element (or NodeList) for scroll reveal. */
  reveal(target) {
    const els = target instanceof Element ? [target] : Array.from(target || []);
    els.forEach(observeReveal);
  },
  /** Subscribe to a named chassis event ('rail:change'). cb(detail). */
  on(name, cb) { listeners.push({ name, cb }); },
  emit(name, detail) { listeners.forEach(l => l.name === name && l.cb(detail)); }
};
window.NZ = NZ;

/* =========================================================================
   1 · REVEAL SYSTEM
   Uses IntersectionObserver (cheap, no GSAP ticker cost). CSS does the
   transition. Reduced-motion: everything is shown immediately by CSS, and
   we still mark .is-in so any JS keyed off it behaves consistently.
   ========================================================================= */
let revealObserver = null;

function ensureObserver() {
  if (revealObserver || REDUCED) return;
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
}

function observeReveal(el) {
  if (!el || el.dataset.revealBound) return;
  el.dataset.revealBound = '1';
  if (REDUCED) { el.classList.add('is-in'); return; }
  ensureObserver();
  revealObserver.observe(el);
}

function initReveals() {
  const groups = document.querySelectorAll('[data-reveal-group]');
  groups.forEach((g) => {
    Array.from(g.children).forEach((child, i) => child.style.setProperty('--i', i));
    observeReveal(g);
  });
  document.querySelectorAll('[data-reveal]').forEach(observeReveal);
}

/* =========================================================================
   2 · PROGRESS RAIL (desktop loop) + MOBILE BAR
   ========================================================================= */
function initRail() {
  const dotsEl = document.getElementById('railDots');
  const fillEl = document.getElementById('railFill');
  const bar = document.getElementById('progressBar');

  // build clickable chapter dots (skip hero so the loop reads as the cycle)
  const dotChapters = CHAPTERS.filter(c => c.id !== 'top');
  if (dotsEl) {
    dotChapters.forEach((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.className = 'rail-dot';
      btn.type = 'button';
      btn.dataset.target = c.id;
      btn.setAttribute('aria-label', 'Jump to ' + c.label);
      btn.innerHTML = '<span class="tip" aria-hidden="true">' + c.label + '</span>';
      btn.addEventListener('click', () => {
        const sec = document.getElementById(c.id);
        if (sec) sec.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth', block: 'start' });
      });
      li.appendChild(btn);
      dotsEl.appendChild(li);
    });
  }

  // loop circle geometry
  const FULL = 2 * Math.PI * 20; // r = 20 → ~125.66
  if (fillEl) {
    fillEl.style.strokeDasharray = FULL.toFixed(2);
    fillEl.style.strokeDashoffset = FULL.toFixed(2);
  }

  // doc scroll progress → fill + bar (rAF-throttled)
  let ticking = false;
  function updateProgress() {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (fillEl) fillEl.style.strokeDashoffset = (FULL * (1 - p)).toFixed(2);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  // active dot tracking via ScrollTrigger (one per chapter, no pinning)
  dotChapters.forEach((c) => {
    const sec = document.getElementById(c.id);
    if (!sec) return;
    ScrollTrigger.create({
      trigger: sec,
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (!self.isActive) return;
        setActiveDot(c.id);
        NZ.emit('rail:change', { id: c.id });
      }
    });
  });

  function setActiveDot(id) {
    if (!dotsEl) return;
    dotsEl.querySelectorAll('.rail-dot').forEach((d) => {
      d.classList.toggle('is-active', d.dataset.target === id);
    });
  }
}

/* =========================================================================
   3 · HEADER scrolled state
   ========================================================================= */
function initHeader() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  ScrollTrigger.create({
    start: 'top -40',
    end: 99999,
    onUpdate: (self) => header.classList.toggle('is-scrolled', self.scroll() > 40),
    onToggle: (self) => header.classList.toggle('is-scrolled', self.isActive)
  });
  // also set on load
  if (window.scrollY > 40) header.classList.add('is-scrolled');
}

/* =========================================================================
   3b · JUMP MENU — desktop: inline chapter links in the header;
   mobile/tablet: "Menu" button opening a full-screen overlay.
   Both are built from the CHAPTERS manifest and track 'rail:change'.
   ========================================================================= */
function initMenu() {
  const header = document.getElementById('siteHeader');
  if (!header) return;
  const items = CHAPTERS.filter(c => c.id !== 'top');

  // --- desktop inline nav ---
  const nav = document.createElement('nav');
  nav.className = 'hd-nav';
  nav.setAttribute('aria-label', 'Jump to chapter');
  items.forEach(c => {
    const a = document.createElement('a');
    a.href = '#' + c.id;
    a.dataset.chapter = c.id;
    a.textContent = c.label;
    nav.appendChild(a);
  });
  header.appendChild(nav);

  // --- mobile menu button + overlay ---
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'menu-btn';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="menu-btn-label">Menu</span>';
  header.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.className = 'menu-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Chapters');
  overlay.hidden = true;
  overlay.innerHTML =
    '<button type="button" class="menu-close" aria-label="Close menu">×</button>' +
    '<nav class="menu-list" aria-label="Chapters">' +
    items.map((c, i) =>
      `<a href="#${c.id}" data-chapter="${c.id}" style="--mi:${i}">` +
      `<span class="menu-num">${String(i + 1).padStart(2, '0')}</span>${c.label}</a>`
    ).join('') +
    '</nav>';
  document.body.appendChild(overlay);

  let lastFocus = null;
  function openMenu() {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    btn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
    overlay.querySelector('.menu-list a')?.focus();
  }
  function closeMenu() {
    overlay.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    const done = () => { overlay.hidden = true; };
    REDUCED ? done() : setTimeout(done, 280);
    (lastFocus || btn).focus?.();
  }
  btn.addEventListener('click', openMenu);
  overlay.querySelector('.menu-close').addEventListener('click', closeMenu);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeMenu();
    if (e.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) closeMenu();
  });

  // --- active chapter tracking (shared with the rail) ---
  NZ.on('rail:change', ({ id }) => {
    document.querySelectorAll('.hd-nav a, .menu-list a').forEach(a =>
      a.classList.toggle('is-current', a.dataset.chapter === id));
  });
}

/* =========================================================================
   4 · HASH handling — redirect old anchors, smooth-scroll to target on load
   (assets/boot.js already rewrote the hash before paint; here we honour it
   and intercept in-page redirect-target clicks for safety.)
   ========================================================================= */
function initHash() {
  // on load: if a hash points to a real chapter, scroll there after layout
  const h = location.hash;
  if (h && document.getElementById(h.slice(1))) {
    // defer until reveal/layout settled
    requestAnimationFrame(() => {
      const el = document.getElementById(h.slice(1));
      el.scrollIntoView({ behavior: 'auto', block: 'start' });
    });
  }

  // guard against any stale redirect hash arriving via hashchange
  window.addEventListener('hashchange', () => {
    const mapped = HASH_REDIRECTS[location.hash];
    if (mapped) history.replaceState(null, '', location.pathname + location.search + mapped);
  });
}

/* =========================================================================
   5 · HERO bootstrap — lazy-import the Three.js scene after first paint.
   Module is loaded only if WebGL is available and motion is allowed; the
   hero3d module itself owns the poster fallback otherwise.
   ========================================================================= */
function initHero() {
  const poster = document.getElementById('heroPoster');

  if (REDUCED) {
    if (poster) poster.classList.add('is-on');
    return;
  }
  if (!hasWebGL()) {
    if (poster) poster.classList.add('is-on');
    return;
  }

  // lazy init after first paint to protect LCP / perf budget
  const start = () => {
    import('./hero3d.js')
      .then((mod) => mod.initHero3D({ gsap, ScrollTrigger }))
      .catch(() => { if (poster) poster.classList.add('is-on'); });
  };
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 1200 });
  } else {
    setTimeout(start, 600);
  }
}

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext &&
      (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

/* =========================================================================
   BOOT
   ========================================================================= */
function boot() {
  initReveals();
  initRail();
  initHeader();
  initMenu();
  initHash();
  initHero();
  // re-measure once everything (incl. late content) is in
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

/* Expose a refresh hook so chapter scripts can re-init reveals after injecting content */
NZ.refresh = function () {
  initReveals();
  ScrollTrigger.refresh();
};
