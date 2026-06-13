/* =========================================================================
   SBTi "Net-Zero Loop" — chapter interactivity
   Vanilla JS, keyboard-operable. Wires up:
     #govern   — flip-card flip on click/Enter/Space
     #baseline — V1↔V2 drag slider (pointer + arrow keys) + fineprint toggles
     #targets  — tab triptych, S1 route-card expand, S2 LCE/Abs toggle,
                  S3 5% boundary slider + Table 3 category explorer
     #oer      — preset calculator
     #horizon  — timeline render from content.js
   Generic: any [data-fineprint] / .fineprint-toggle button toggles its
   parent .fineprint's [open] attribute.
   ========================================================================= */

import {
  SCOPE3_TABLE3,
  SCOPE3_OPTION_LABELS,
  HORIZON_TIMELINE,
  OER_PRESETS
} from './content.js';

const NZ = window.NZ || { refresh() {}, reducedMotion: false };

/* -------------------------------------------------------------------------
   Generic: fineprint toggles (used across #baseline, #targets, #prove, #oer)
   ------------------------------------------------------------------------- */
function initFineprint() {
  document.querySelectorAll('.fineprint-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wrap = btn.closest('.fineprint');
      if (!wrap) return;
      const isOpen = wrap.hasAttribute('open');
      if (isOpen) {
        wrap.removeAttribute('open');
        btn.setAttribute('aria-expanded', 'false');
      } else {
        wrap.setAttribute('open', '');
        btn.setAttribute('aria-expanded', 'true');
      }
      NZ.refresh();
    });
  });
}

/* -------------------------------------------------------------------------
   #govern — flip cards
   ------------------------------------------------------------------------- */
function initFlipCards() {
  document.querySelectorAll('.flip-card').forEach((card) => {
    const flip = () => {
      const flipped = card.classList.toggle('is-flipped');
      card.setAttribute('aria-pressed', flipped ? 'true' : 'false');
    };
    card.addEventListener('click', flip);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        flip();
      }
    });
  });
}

/* -------------------------------------------------------------------------
   #baseline — V1 ↔ V2 drag slider
   ------------------------------------------------------------------------- */
function initBaselineSlider() {
  const track = document.getElementById('baselineTrack');
  const handle = document.getElementById('baselineHandle');
  const caption = document.getElementById('baselineCaption');
  if (!track || !handle || !caption) return;

  const CAPTIONS = {
    left: 'V1 — your base year is fixed at registration and drifts further from your current operations every cycle.',
    mid: 'Drag the handle \u2014 or press \u2190 / \u2192 \u2014 to compare the two approaches.',
    right: 'V2.0 — at the start of every cycle you reset to the most recent year with comprehensive data, so your starting point stays representative (CNZS-C4).'
  };

  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    track.style.setProperty('--bs-pos', pct + '%');
    handle.setAttribute('aria-valuenow', String(Math.round(pct)));
    let label;
    if (pct < 35) { label = 'Closer to V1'; caption.textContent = CAPTIONS.left; }
    else if (pct > 65) { label = 'Closer to V2.0'; caption.textContent = CAPTIONS.right; }
    else { label = 'Balanced view'; caption.textContent = CAPTIONS.mid; }
    handle.setAttribute('aria-valuetext', label);
  }

  setPos(50);

  let dragging = false;

  function pctFromClientX(clientX) {
    const rect = track.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  }

  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setPos(pctFromClientX(e.clientX));
  });
  handle.addEventListener('pointerup', (e) => {
    dragging = false;
    handle.releasePointerCapture(e.pointerId);
  });

  track.addEventListener('pointerdown', (e) => {
    if (e.target === handle) return;
    setPos(pctFromClientX(e.clientX));
  });

  handle.addEventListener('keydown', (e) => {
    const current = parseFloat(handle.getAttribute('aria-valuenow')) || 50;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault();
      setPos(current - 5);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault();
      setPos(current + 5);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setPos(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setPos(100);
    }
  });
}

/* -------------------------------------------------------------------------
   #targets — tab triptych (S1 / S2 / S3)
   ------------------------------------------------------------------------- */
function initTargetTabs() {
  const tabs = document.querySelectorAll('#targets .tab-btn');
  if (!tabs.length) return;

  tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabs.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('#targets .tab-panel').forEach((panel) => {
        const active = panel.id === 'panel-' + target;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
      NZ.refresh();
    });
  });
}

/* -------------------------------------------------------------------------
   #targets — S1 route card expand/collapse
   ------------------------------------------------------------------------- */
function initRouteCards() {
  document.querySelectorAll('#targets .route-card-head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.route-card');
      const open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      NZ.refresh();
    });
  });
}

/* -------------------------------------------------------------------------
   #targets — S2 LCE-share vs Absolute toggle
   ------------------------------------------------------------------------- */
function initScope2Toggle() {
  const buttons = document.querySelectorAll('#panel-s2 [data-s2]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.s2;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('#panel-s2 .target-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.s2Panel === target);
      });
    });
  });
}

/* -------------------------------------------------------------------------
   #targets — S3 5% boundary slider, live bars
   ------------------------------------------------------------------------- */
function initBoundaryTool() {
  const slider = document.getElementById('boundarySlider');
  const valEl = document.getElementById('boundaryVal');
  const barsEl = document.getElementById('boundaryBars');
  const readout = document.getElementById('boundaryReadout');
  if (!slider || !barsEl) return;

  // Build bars once, sorted by share descending for a clean staircase.
  const entries = Object.entries(SCOPE3_TABLE3)
    .map(([key, d]) => ({ key, ...d }))
    .sort((a, b) => b.share - a.share);

  const maxShare = Math.max(...entries.map((e) => e.share));

  entries.forEach((e) => {
    const bar = document.createElement('div');
    bar.className = 'boundary-bar';
    bar.dataset.key = e.key;
    bar.dataset.share = String(e.share * 100);
    bar.style.height = ((e.share / maxShare) * 100).toFixed(1) + '%';
    bar.title = e.n + ' — ' + (e.share * 100).toFixed(0) + '%';
    barsEl.appendChild(bar);
  });

  function update() {
    const threshold = parseFloat(slider.value);
    valEl.textContent = threshold.toFixed(1) + '%';
    let inCount = 0;
    barsEl.querySelectorAll('.boundary-bar').forEach((bar) => {
      const share = parseFloat(bar.dataset.share);
      const inBoundary = share >= threshold;
      bar.classList.toggle('in-boundary', inBoundary);
      if (inBoundary) inCount += 1;
    });
    readout.innerHTML = '<strong>' + inCount + ' of ' + entries.length +
      '</strong> scope 3 categories sit at or above this threshold — each one needs a category target under Table 3.';
  }

  slider.addEventListener('input', update);
  update();
}

/* -------------------------------------------------------------------------
   #targets — Table 3 category explorer
   ------------------------------------------------------------------------- */
function initCategoryExplorer() {
  const rowUp = document.getElementById('catrowUp');
  const rowDown = document.getElementById('catrowDown');
  const nameEl = document.getElementById('catName');
  const groupEl = document.getElementById('catGroup');
  const optsEl = document.getElementById('catOpts');
  const noteEl = document.getElementById('catNote');
  if (!rowUp || !rowDown) return;

  const entries = Object.entries(SCOPE3_TABLE3);
  const buttons = {};

  entries.forEach(([key, d]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cat-btn';
    btn.dataset.key = key;
    // short label: "Cat 1" / "Cat 1p" -> "Cat 1"
    const m = d.n.match(/Cat (\d+)/);
    let short = m ? 'Cat ' + m[1] : key;
    if (key.endsWith('p')) short += '*';
    btn.textContent = short;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', d.n);
    btn.addEventListener('click', () => selectCategory(key));
    (d.side === 'up' ? rowUp : rowDown).appendChild(btn);
    buttons[key] = btn;
  });

  function selectCategory(key) {
    const d = SCOPE3_TABLE3[key];
    Object.entries(buttons).forEach(([k, b]) => {
      const active = k === key;
      b.classList.toggle('is-active', active);
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    nameEl.textContent = d.n;
    groupEl.textContent = d.g;
    optsEl.innerHTML = '';
    d.o.forEach((on, i) => {
      const span = document.createElement('span');
      span.className = 'cat-opt ' + (on ? 'on' : 'off');
      span.textContent = SCOPE3_OPTION_LABELS[i];
      optsEl.appendChild(span);
    });
    noteEl.textContent = d.t;
    NZ.refresh();
  }

  // default selection
  selectCategory(entries[0][0]);
  rowUp.parentElement.querySelector('.cat-panel').hidden = false;
}

/* -------------------------------------------------------------------------
   #oer — preset calculator
   ------------------------------------------------------------------------- */
function initOerCalculator() {
  const resultEl = document.getElementById('oerResult');
  const buttons = document.querySelectorAll('#oer [data-preset]');
  if (!resultEl || !buttons.length) return;

  function fmt(n) {
    return Math.round(n).toLocaleString('en-GB');
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      const preset = OER_PRESETS.find((p) => p.id === btn.dataset.preset);
      if (!preset) return;

      const engaged = preset.ongoing * 0.01;
      const advanced = preset.ongoing * 0.10;
      const leadership = preset.ongoing * 1.0;

      resultEl.innerHTML = `
        <p class="calc-result-label">
          ${preset.label} — ${preset.detail}
        </p>
        <div class="rcell">
          <span class="rnum">${fmt(engaged)} t</span>
          <span class="rlbl">Engaged · 1% covered<br>no mandated price</span>
        </div>
        <div class="rcell is-highlight">
          <span class="rnum">${fmt(advanced)} t</span>
          <span class="rlbl">Advanced · 10% covered (incl. 100% S1+S2)<br>≈ $${fmt(advanced * 20)} contribution budget @ $20/t</span>
        </div>
        <div class="rcell is-leadership">
          <span class="rnum">${fmt(leadership)} t</span>
          <span class="rlbl">Leadership · 100% covered<br>≈ $${fmt(leadership * 80)} contribution budget @ $80/t, plus equal-volume removals</span>
        </div>
      `;
      NZ.refresh();
    });
  });
}

/* -------------------------------------------------------------------------
   #horizon — render timeline from content.js
   ------------------------------------------------------------------------- */
function initHorizonTimeline() {
  const line = document.getElementById('horizonLine');
  if (!line) return;

  HORIZON_TIMELINE.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'horizon-item tone-' + entry.tone;
    item.setAttribute('data-reveal', 'fade');
    item.innerHTML = `
      <p class="horizon-date">${entry.date}</p>
      <h3 class="horizon-title">${entry.title}</h3>
      <p class="horizon-text">${entry.text}</p>
    `;
    if (entry.a || entry.b) {
      const you = document.createElement('p');
      you.className = 'horizon-you';
      you.dataset.a = entry.a || '';
      you.dataset.b = entry.b || '';
      item.appendChild(you);
    }
    line.appendChild(item);
  });

  // "For you" lines follow the category set in chapter 01 — both sides
  // shown until the visitor picks, then their side only.
  function updateYou(cat) {
    document.querySelectorAll('.horizon-you').forEach((el) => {
      if (cat === 'A' || cat === 'B') {
        const note = cat === 'A' ? el.dataset.a : el.dataset.b;
        el.innerHTML = note
          ? '<span class="hy-tag">For you · Category ' + cat + '</span> ' + note
          : '';
        el.hidden = !note;
      } else {
        el.innerHTML =
          (el.dataset.a ? '<span class="hy-tag">Cat A</span> ' + el.dataset.a + '<br>' : '') +
          (el.dataset.b ? '<span class="hy-tag">Cat B</span> ' + el.dataset.b : '');
        el.hidden = !(el.dataset.a || el.dataset.b);
      }
    });
  }
  updateYou(window.NZ && window.NZ.category);
  NZ.on('category:change', ({ category }) => updateYou(category));

  NZ.refresh();
}

/* =========================================================================
   BOOT
   ========================================================================= */
function boot() {
  initFineprint();
  initFlipCards();
  initBaselineSlider();
  initTargetTabs();
  initRouteCards();
  initScope2Toggle();
  initBoundaryTool();
  initCategoryExplorer();
  initOerCalculator();
  initHorizonTimeline();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
