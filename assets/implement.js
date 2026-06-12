/* =========================================================================
   SBTi "Net-Zero Loop" — M5 · Pinned implementation-hierarchy sequence
   The ONLY pinned section on the page (#implement). Scroll descends a 3-rung
   ladder: Activity level -> Activity pools -> Sector level. Each rung lights
   as it becomes active; a progress fill tracks the descent.
     - GSAP ScrollTrigger pin + scrub, modest +150% viewport duration
     - hourly-matching bars grow on reveal (non-pinned, normal flow)
   prefers-reduced-motion OR mobile (<768px): NO pin, no scrub — render the
   three rungs as static stacked cards with full content parity.
   Transforms/opacity only.
   ========================================================================= */

const NZ = window.NZ || {};
const gsap = NZ.gsap;
const ScrollTrigger = NZ.ScrollTrigger;
const REDUCED = NZ.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const RUNG_COUNT = 3;

/* -------------------------------------------------------------------------
   Ladder activation — shared by both pinned and static modes.
   ------------------------------------------------------------------------- */
function setActiveRung(idx) {
  const rungs = document.querySelectorAll('#ladder .rung');
  rungs.forEach((r, i) => {
    r.classList.toggle('is-active', i === idx);
    r.classList.toggle('is-past', i < idx);
  });
  const fill = document.getElementById('ladderFill');
  if (fill) {
    const pct = RUNG_COUNT > 1 ? (idx / (RUNG_COUNT - 1)) * 100 : 0;
    fill.style.transform = 'scaleY(' + (pct / 100).toFixed(3) + ')';
  }
}

/* -------------------------------------------------------------------------
   Static fallback: reduced-motion or narrow viewport. All rungs visible,
   no pin. We light the active rung via IntersectionObserver for a touch of
   life, but content parity is guaranteed by CSS (all rungs rendered).
   ------------------------------------------------------------------------- */
function initStaticLadder() {
  const pin = document.getElementById('ladderPin');
  if (pin) pin.classList.add('is-static');
  const rungs = document.querySelectorAll('#ladder .rung');
  rungs.forEach((r) => r.classList.add('is-active'));

  const fill = document.getElementById('ladderFill');
  if (fill) fill.style.transform = 'scaleY(1)';

  if (REDUCED || !('IntersectionObserver' in window)) return;

  // subtle: brighten whichever rung is centred (does not hide the others)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('is-focus');
      else e.target.classList.remove('is-focus');
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  rungs.forEach((r) => io.observe(r));
}

/* -------------------------------------------------------------------------
   Pinned mode: pin the stage, scrub the active rung through the scroll.
   ------------------------------------------------------------------------- */
function initPinnedLadder() {
  const pin = document.getElementById('ladderPin');
  const stage = document.getElementById('ladderStage');
  if (!pin || !stage || !gsap || !ScrollTrigger) { initStaticLadder(); return; }

  setActiveRung(0);

  ScrollTrigger.create({
    trigger: pin,
    start: 'top top',
    end: '+=150%',                 // modest — corporate users skim
    pin: stage,
    pinSpacing: true,
    scrub: 0.75,
    anticipatePin: 1,
    onUpdate: (self) => {
      // map 0..1 progress -> 0,1,2 with even thirds, slight bias to dwell
      const p = self.progress;
      let idx = Math.floor(p * RUNG_COUNT);
      if (idx >= RUNG_COUNT) idx = RUNG_COUNT - 1;
      setActiveRung(idx);
    }
  });
}

/* -------------------------------------------------------------------------
   Hourly-matching bars — grow on reveal (non-pinned). Pure CSS transition;
   we just toggle .is-grown when it scrolls in. Reduced-motion: grown at once.
   ------------------------------------------------------------------------- */
function initHourly() {
  const el = document.getElementById('hourly');
  if (!el) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    el.classList.add('is-grown');
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add('is-grown'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0.12 });
  io.observe(el);
}

/* -------------------------------------------------------------------------
   Mode selection — re-evaluate on resize across the 768px boundary so a
   rotate/resize doesn't leave the user trapped in a stale mode.
   ------------------------------------------------------------------------- */
let mode = null;
const MOBILE = () => window.matchMedia('(max-width: 767px)').matches;

function applyMode() {
  // Pinned scrub retired — user testing found it confusing. The static ladder
  // (all rungs visible, centred rung brightened) reads better at every size.
  const wantPinned = false;
  const next = wantPinned ? 'pinned' : 'static';
  if (next === mode) return;
  // first build only — avoid tearing down a live pin mid-session for simplicity;
  // we only build once, then on a true mobile<->desktop crossing rebuild.
  if (mode !== null) {
    if (ScrollTrigger) {
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars && st.vars.trigger === document.getElementById('ladderPin')) st.kill(true);
      });
    }
    const pin = document.getElementById('ladderPin');
    if (pin) pin.classList.remove('is-static');
  }
  mode = next;
  if (wantPinned) initPinnedLadder();
  else initStaticLadder();
  if (ScrollTrigger) ScrollTrigger.refresh();
}

/* ----- boot ----- */
function boot() {
  applyMode();
  initHourly();

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(applyMode, 200);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
