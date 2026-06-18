/* =========================================================================
   SBTi "Net-Zero Loop" — chapter interactivity
   Vanilla JS, keyboard-operable. Wires up:
     #govern   — flip-card flip on click/Enter/Space
     #scope-1  — route-card expand · #scope-2 — LCE/Abs toggle
     #scope-3  — 5% boundary slider + Table 3 category explorer
     #oer      — preset calculator
     #timeline  — timeline render from content.js
   Generic: any [data-fineprint] / .fineprint-toggle button toggles its
   parent .fineprint's [open] attribute.
   ========================================================================= */

import {
  SCOPE3_TABLE3,
  SCOPE3_OPTION_LABELS,
  SCOPE3_CATEGORY_NAMES,
  SCOPE3_PROFILES,
  TIMELINE_ENTRIES,
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
   #scope-1 — route card expand/collapse
   ------------------------------------------------------------------------- */
function initRouteCards() {
  document.querySelectorAll('#scope-1 .route-card-head').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.route-card');
      const open = card.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      NZ.refresh();
    });
  });
}

/* -------------------------------------------------------------------------
   #scope-2 — LCE-share vs Absolute toggle
   ------------------------------------------------------------------------- */
function initScope2Toggle() {
  const buttons = document.querySelectorAll('#scope-2 [data-s2]');
  if (!buttons.length) return;
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.s2;
      buttons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      document.querySelectorAll('#scope-2 .target-panel').forEach((panel) => {
        panel.classList.toggle('is-active', panel.dataset.s2Panel === target);
      });
    });
  });
}

/* -------------------------------------------------------------------------
   #scope-2 — compact expandable procurement cards
   ------------------------------------------------------------------------- */
function initScope2Expanders() {
  const cards = Array.from(document.querySelectorAll('#scope-2 .s2-block, #scope-2 .s2-major-box'));
  if (!cards.length) return;

  function setOpen(card, open) {
    const toggle = card.querySelector('.s2-expander-toggle');
    card.classList.toggle('is-open', open);
    if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    NZ.refresh();
  }

  cards.forEach((card, i) => {
    if (card.dataset.s2Expander === '1') return;
    const heading = Array.from(card.children).find((el) => el.matches('h3'));
    if (!heading) return;
    const kicker = Array.from(card.children).find((el) => el.matches('.kicker'));
    const bodyId = card.id ? card.id + '-body' : 's2-card-body-' + i;
    const toggleId = card.id ? card.id + '-toggle' : 's2-card-toggle-' + i;
    const hash = window.location.hash;
    const shouldOpen = hash ? hash === '#' + card.id || (hash === '#scope-2' && i === 0) : i === 0;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = toggleId;
    toggle.className = 's2-expander-toggle';
    toggle.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
    toggle.setAttribute('aria-controls', bodyId);
    toggle.innerHTML =
      '<span class="s2-expander-copy">' +
        '<span class="s2-expander-kicker">' + (kicker ? kicker.textContent : 'Scope 2') + '</span>' +
        '<span class="s2-expander-title">' + heading.textContent + '</span>' +
      '</span>' +
      '<span class="s2-expander-icon" aria-hidden="true">⌄</span>';

    const body = document.createElement('div');
    body.id = bodyId;
    body.className = 's2-expander-body';
    body.setAttribute('aria-labelledby', toggleId);

    Array.from(card.children).forEach((child) => {
      if (child !== heading && child !== kicker) body.appendChild(child);
    });
    heading.remove();
    if (kicker) kicker.remove();

    card.prepend(body);
    card.prepend(toggle);
    card.dataset.s2Expander = '1';
    card.setAttribute('aria-labelledby', toggleId);
    card.classList.add('s2-expander-card');
    if (shouldOpen) card.classList.add('is-open');

    toggle.addEventListener('click', () => setOpen(card, !card.classList.contains('is-open')));
  });

  document.querySelectorAll('#scope-2 .anchor-pill[href^="#s2-"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      setOpen(target, true);
      history.pushState(null, '', '#' + id);
      target.scrollIntoView({ behavior: NZ.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  window.addEventListener('hashchange', () => {
    const target = document.getElementById(window.location.hash.slice(1));
    if (target && target.classList.contains('s2-expander-card')) setOpen(target, true);
  });
}

/* -------------------------------------------------------------------------
   #scope-3 — 5% boundary slider, live bars
   ------------------------------------------------------------------------- */
function initBoundaryTool() {
  const slider = document.getElementById('boundarySlider');
  const valEl = document.getElementById('boundaryVal');
  const barsEl = document.getElementById('boundaryBars');
  const readout = document.getElementById('boundaryReadout');
  const profilesEl = document.getElementById('boundaryProfiles');
  const noteEl = document.getElementById('boundaryProfileNote');
  if (!slider || !barsEl) return;

  const profiles = SCOPE3_PROFILES;
  let barCount = 0;

  // Rebuild the bars for the chosen company profile, sorted by share
  // descending for a clean staircase.
  function buildBars(profile) {
    const entries = Object.entries(profile.shares)
      .map(([cat, share]) => ({ cat: Number(cat), share }))
      .sort((a, b) => b.share - a.share);
    const maxShare = Math.max(...entries.map((e) => e.share)) || 1;

    barsEl.innerHTML = '';
    entries.forEach((e) => {
      const bar = document.createElement('div');
      bar.className = 'boundary-bar';
      bar.dataset.cat = String(e.cat);
      bar.dataset.share = String(e.share);
      bar.style.height = ((e.share / maxShare) * 100).toFixed(1) + '%';
      bar.title = (SCOPE3_CATEGORY_NAMES[e.cat] || ('Cat ' + e.cat)) +
        ' — ' + e.share + '%';
      barsEl.appendChild(bar);
    });
    barCount = entries.length;
  }

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
    readout.innerHTML = '<strong>' + inCount + ' of ' + barCount +
      '</strong> scope 3 categories sit at or above this threshold — each one needs a category target under Table 3.';
  }

  function selectProfile(id) {
    const profile = profiles.find((p) => p.id === id) || profiles[0];
    if (profilesEl) {
      profilesEl.querySelectorAll('.boundary-profile-btn').forEach((b) => {
        const active = b.dataset.id === profile.id;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    }
    if (noteEl) noteEl.textContent = profile.blurb;
    buildBars(profile);
    update();
  }

  // Profile selector buttons.
  if (profilesEl) {
    profiles.forEach((p) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'boundary-profile-btn';
      btn.dataset.id = p.id;
      btn.textContent = p.label;
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', () => selectProfile(p.id));
      profilesEl.appendChild(btn);
    });
  }

  slider.addEventListener('input', update);
  selectProfile(profiles[0].id);
}

/* -------------------------------------------------------------------------
   #scope-3 — Table 3 category explorer
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
  const cat11Fineprint = document.getElementById('cat11Fineprint');

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
    // The category-11 escape-hatch note only applies to Cat 11 (use of sold products).
    if (cat11Fineprint) {
      const isCat11 = key === 'c11';
      cat11Fineprint.hidden = !isCat11;
      if (!isCat11) {
        cat11Fineprint.removeAttribute('open');
        const toggle = cat11Fineprint.querySelector('.fineprint-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      }
    }
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
   #timeline — render timeline from content.js
   ------------------------------------------------------------------------- */
function initTimeline() {
  const line = document.getElementById('timelineLine');
  if (!line) return;

  TIMELINE_ENTRIES.forEach((entry) => {
    const item = document.createElement('div');
    item.className = 'timeline-item tone-' + entry.tone;
    item.setAttribute('data-reveal', 'fade');
    item.innerHTML = `
      <p class="timeline-date">${entry.date}</p>
      <h3 class="timeline-title">${entry.title}</h3>
      <p class="timeline-text">${entry.text}</p>
    `;
    if (entry.a || entry.b) {
      const you = document.createElement('p');
      you.className = 'timeline-you';
      you.dataset.a = entry.a || '';
      you.dataset.b = entry.b || '';
      item.appendChild(you);
    }
    line.appendChild(item);
  });

  // "For you" lines follow the category set in chapter 01 — both sides
  // shown until the visitor picks, then their side only.
  function updateYou(cat) {
    document.querySelectorAll('.timeline-you').forEach((el) => {
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
  initRouteCards();
  initScope2Expanders();
  initScope2Toggle();
  initBoundaryTool();
  initCategoryExplorer();
  initOerCalculator();
  initTimeline();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
