/* =========================================================================
   SBTi "Net-Zero Loop" — M4 · Personalization engine
   "Which rules apply to you?" — three segmented controls (revenue / FTE /
   HQ income group, + optional medium-company emissions test) approximate
   Table 2 (p.19) and resolve a Category A | B verdict. The verdict:
     - stamps the verdict card (oversized serif letter, aria-live polite)
     - sets window.NZ.category ('A' | 'B' | null), persists to localStorage
     - emits 'category:change' on the NZ bus
     - flips every .req-badge on the page with a staggered ripple
   Default (no choice): badges show BOTH sides, so the page reads complete
   without interaction. Keyboard + focus-visible throughout.
   ========================================================================= */

const NZ = window.NZ || { on() {}, emit() {}, reducedMotion: false };
const STORAGE_KEY = 'nz-category';

/* ----- selection state, restored from localStorage if present ----- */
const state = { rev: null, fte: null, geo: null, emtest: false };

/* -------------------------------------------------------------------------
   Table 2 verdict — returns 'A' | 'B' | null (null = not enough chosen).
   Category A when, in ANY country:
     turnover >= 450M (rev:hi)  OR  FTE >= 1,000 (fte:hi)
   Otherwise, in a HIGH-INCOME country, a "medium" company is also A if the
   emissions test is met: S1+2 >= 10,000 tCO2e, or >=2 of {balance >=25M,
   turnover >=50M, FTE >=250}. We can't ask balance sheet without clutter,
   so the optional emtest checkbox stands in for that whole clause.
   ------------------------------------------------------------------------- */
function verdict() {
  const { rev, fte, geo, emtest } = state;
  // Large in ANY country → Category A. Decisive on its own, so a single
  // answer (≥€450M turnover or ≥1,000 FTE) resolves immediately.
  if (rev === 'hi' || fte === 'hi') return 'A';
  // Below that, we need the full picture (size + geography) to decide.
  if (!rev || !fte || !geo) return null;
  // Medium company in a high-income country that clears the emissions test.
  if (geo === 'high' && emtest) return 'A';
  return 'B';
}

/* -------------------------------------------------------------------------
   Badge state inference — each badge carries data-req-a / data-req-b strings.
   We colour each side by keyword so the ripple recolours correctly.
   ------------------------------------------------------------------------- */
function stateFor(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('required') || t.includes('disclose') || t.includes('mandatory')) return 'required';
  if (t.includes('recommended')) return 'recommended';
  if (t.includes('optional')) return 'optional';
  return 'recommended';
}

/* -------------------------------------------------------------------------
   Badge rendering. We take full control of .req-badge text + colour via JS
   (the CSS ::before default still covers a no-JS fallback). Each badge gets
   an inner <span class="rb-text"> we can animate without disturbing layout.
   ------------------------------------------------------------------------- */
let badges = [];

function initBadges() {
  badges = Array.from(document.querySelectorAll('.req-badge'));
  badges.forEach((b) => {
    b.classList.add('rb-js');                  // disables the CSS ::before
    if (!b.querySelector('.rb-text')) {
      const span = document.createElement('span');
      span.className = 'rb-text';
      b.appendChild(span);
    }
  });
}

function badgeContent(b, cat) {
  const a = b.dataset.reqA || '';
  const bb = b.dataset.reqB || '';
  if (cat === 'A') return { text: a, state: stateFor(a) };
  if (cat === 'B') return { text: bb, state: stateFor(bb) };
  // default: compact "both" form
  return { text: 'A: ' + a + ' · B: ' + bb, state: 'both' };
}

function paintBadges(cat, animate) {
  badges.forEach((b, i) => {
    const span = b.querySelector('.rb-text');
    const { text, state: st } = badgeContent(b, cat);
    const apply = () => {
      span.textContent = text;
      b.setAttribute('data-state', st);
      b.setAttribute('data-cat', cat || 'none');
    };
    if (!animate || NZ.reducedMotion) { apply(); return; }
    // staggered ripple — transforms/opacity only, ~200ms total
    const delay = Math.min(i * 28, 200);
    b.classList.add('rb-flip');
    setTimeout(() => {
      apply();
      // force reflow so the class re-trigger animates
      requestAnimationFrame(() => b.classList.remove('rb-flip'));
    }, delay);
  });
}

/* -------------------------------------------------------------------------
   Controls
   ------------------------------------------------------------------------- */
function initControls() {
  const form = document.getElementById('catControls');
  if (!form) return;

  const segButtons = Array.from(form.querySelectorAll('.seg-btn'));
  const emtest = document.getElementById('catEmTest');
  const resetBtn = document.getElementById('catReset');

  function selectSeg(btn) {
    const dim = btn.dataset.dim;
    const val = btn.dataset.val;
    state[dim] = val;
    // radio semantics within the dimension
    segButtons
      .filter((b) => b.dataset.dim === dim)
      .forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-on', on);
        b.setAttribute('aria-checked', on ? 'true' : 'false');
      });
    commit(true);
  }

  segButtons.forEach((btn) => {
    btn.addEventListener('click', () => selectSeg(btn));
    // arrow-key navigation inside each radiogroup
    btn.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' &&
          e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const group = segButtons.filter((b) => b.dataset.dim === btn.dataset.dim);
      const idx = group.indexOf(btn);
      const fwd = e.key === 'ArrowRight' || e.key === 'ArrowDown';
      const next = group[(idx + (fwd ? 1 : group.length - 1)) % group.length];
      next.focus();
      selectSeg(next);
    });
  });

  if (emtest) {
    emtest.addEventListener('change', () => { state.emtest = emtest.checked; commit(true); });
  }
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.rev = state.fte = state.geo = null;
      state.emtest = false;
      segButtons.forEach((b) => { b.classList.remove('is-on'); b.setAttribute('aria-checked', 'false'); });
      if (emtest) emtest.checked = false;
      commit(true);
    });
  }

  // restore persisted selection -> reflect into the UI
  restore(segButtons, emtest);
}

/* -------------------------------------------------------------------------
   Verdict card + global state commit
   ------------------------------------------------------------------------- */
function commit(animate) {
  const cat = verdict();
  setVerdictCard(cat);
  paintBadges(cat, animate);

  NZ.category = cat;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state }));
  } catch (e) { /* private mode — ignore */ }
  NZ.emit('category:change', { category: cat });
}

function setVerdictCard(cat) {
  const card = document.getElementById('catVerdict');
  const letter = document.getElementById('catLetter');
  const headline = document.getElementById('catHeadline');
  const explain = document.getElementById('catExplain');
  const reset = document.getElementById('catReset');
  if (!card) return;

  card.setAttribute('data-cat', cat ? cat.toLowerCase() : 'none');

  if (cat === 'A') {
    letter.textContent = 'A';
    headline.textContent = 'You are a Category A company.';
    explain.innerHTML = 'The full Standard applies — assurance, the 15-month transition plan, mandatory hourly-matching reporting, and OER from 2035. Every badge below now reads for you.';
  } else if (cat === 'B') {
    letter.textContent = 'B';
    headline.textContent = 'You are a Category B company.';
    explain.innerHTML = 'A lighter path — several requirements drop to recommended or optional. The badges below now show what is required of you specifically.';
  } else {
    letter.textContent = 'A/B';
    headline.textContent = 'Set your three details to see your category.';
    explain.innerHTML = 'Until then, every badge below shows both sides — Category&nbsp;A and Category&nbsp;B.';
  }
  if (reset) reset.hidden = !cat && !(state.rev || state.fte || state.geo);
}

/* -------------------------------------------------------------------------
   Persistence
   ------------------------------------------------------------------------- */
function restore(segButtons, emtest) {
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { saved = null; }
  if (!saved) { commit(false); return; }

  ['rev', 'fte', 'geo'].forEach((dim) => {
    if (!saved[dim]) return;
    state[dim] = saved[dim];
    const btn = segButtons.find((b) => b.dataset.dim === dim && b.dataset.val === saved[dim]);
    if (btn) { btn.classList.add('is-on'); btn.setAttribute('aria-checked', 'true'); }
  });
  state.emtest = !!saved.emtest;
  if (emtest) emtest.checked = state.emtest;

  commit(false);
}

/* ----- boot ----- */
function boot() {
  NZ.category = null;
  initBadges();
  initControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
