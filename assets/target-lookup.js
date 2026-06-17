/* =========================================================================
   SBTi "Net-Zero Loop" — company target lookup
   A hero button opens a search overlay that lets visitors find their own
   company's current SBTi target by name. The dataset mirrors the official
   "Companies taking action" download (companies-excel.xlsx) from
   https://sciencebasedtargets.org/target-dashboard, converted to a compact
   positional-array JSON at build time (see the generator note in the repo).

   The JSON (~7.5 MB raw, ~0.8 MB gzipped) is fetched lazily on first open,
   so it never touches the critical hero render path.
   ========================================================================= */

const JSON_URL = 'assets/data/sbti-companies.json';
const DASHBOARD_URL = 'https://sciencebasedtargets.org/target-dashboard';
const MAX_RESULTS = 40;

// Column order as written by the generator — keep in sync with the JSON `cols`.
const C = {
  name: 0, location: 1, region: 2, sector: 3, orgType: 4,
  ntStatus: 5, ntClass: 6, ntYear: 7,
  ltStatus: 8, ltClass: 9, ltYear: 10,
  nzStatus: 11, nzYear: 12, ba15: 13,
  language: 14, updated: 15,
};

let DATA = null;        // parsed JSON document
let INDEX = null;       // [{ i, norm }] normalized search index
let loadPromise = null; // de-dupes concurrent fetches
let lastFocus = null;   // element to restore focus to on close

/* ---- helpers ---- */

// Fold to lowercase ASCII words: strips diacritics and punctuation so
// "L'Oréal" matches "loreal", "Coca-Cola" matches "coca cola".
function normalize(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function esc(str) {
  return (str || '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

const $ = (id) => document.getElementById(id);

/* ---- data loading ---- */

function ensureData() {
  if (loadPromise) return loadPromise;
  loadPromise = fetch(JSON_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((doc) => {
      DATA = doc;
      INDEX = doc.rows.map((row, i) => ({ i, norm: normalize(row[C.name]) }));
      return doc;
    });
  return loadPromise;
}

/* ---- search ---- */

// Rank: exact (0) < whole-string prefix (1) < word prefix (2) < substring (3).
function search(query) {
  const q = normalize(query);
  if (!q || !INDEX) return [];
  const hits = [];
  for (let k = 0; k < INDEX.length; k++) {
    const norm = INDEX[k].norm;
    const pos = norm.indexOf(q);
    if (pos === -1) continue;
    let score;
    if (norm === q) score = 0;
    else if (pos === 0) score = 1;
    else if (norm[pos - 1] === ' ') score = 2;
    else score = 3;
    hits.push({ i: INDEX[k].i, score, len: norm.length });
  }
  hits.sort((a, b) => a.score - b.score || a.len - b.len || a.i - b.i);
  return hits.slice(0, MAX_RESULTS);
}

/* ---- rendering ---- */

function statusPill(label, status) {
  const s = normalize(status);
  let tone = 'neutral';
  if (s.includes('set') || s.includes('approved')) tone = 'good';
  else if (s.includes('committed')) tone = 'pending';
  if (s.includes('removed') || s.includes('expired')) tone = 'off';
  return `<span class="lk-pill lk-pill--${tone}">${esc(label)}: ${esc(status || '—')}</span>`;
}

function highlight(name, query) {
  const q = normalize(query);
  const norm = normalize(name);
  const pos = norm.indexOf(q);
  if (!q || pos === -1) return esc(name);
  // Map the normalized match span back to the original string by walking
  // both in step — normalization only removes/merges chars, never reorders.
  let oi = 0, ni = 0, start = -1, end = -1;
  const nIsWord = (ch) => /[a-z0-9]/.test(ch);
  while (oi < name.length && ni <= norm.length) {
    if (ni === pos && start === -1) start = oi;
    if (ni === pos + q.length) { end = oi; break; }
    const oc = name[oi].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (nIsWord(oc) && norm[ni] === oc) { ni++; oi++; }
    else if (norm[ni] === ' ' && !nIsWord(oc)) { ni++; oi++; }
    else { oi++; }
  }
  if (start === -1) return esc(name);
  if (end === -1) end = name.length;
  return esc(name.slice(0, start)) + '<mark>' + esc(name.slice(start, end)) + '</mark>' + esc(name.slice(end));
}

function detailHTML(row) {
  const line = (label, value) => value
    ? `<div class="lk-dt">${esc(label)}</div><div class="lk-dd">${esc(value)}</div>` : '';
  const ntYear = row[C.ntYear] ? ` · target ${esc(row[C.ntYear])}` : '';
  const ltYear = row[C.ltYear] ? ` · target ${esc(row[C.ltYear])}` : '';
  const nzYear = row[C.nzYear] ? ` · by ${esc(row[C.nzYear])}` : '';

  let rows = '';
  if (row[C.ntStatus] || row[C.ntClass]) {
    rows += line('Near-term', `${row[C.ntStatus] || '—'}${row[C.ntClass] ? ` (${row[C.ntClass]})` : ''}${ntYear}`);
  }
  if (row[C.ltStatus] || row[C.ltClass]) {
    rows += line('Long-term', `${row[C.ltStatus] || '—'}${row[C.ltClass] ? ` (${row[C.ltClass]})` : ''}${ltYear}`);
  }
  if (row[C.nzStatus] || row[C.nzYear]) {
    rows += line('Net-zero', `${row[C.nzStatus] || '—'}${nzYear}`);
  }
  if (row[C.ba15]) rows += line('Business Ambition 1.5°C', row[C.ba15]);
  rows += line('Sector', row[C.sector]);
  rows += line('Location', [row[C.location], row[C.region]].filter(Boolean).join(' · '));
  rows += line('Organization type', row[C.orgType]);

  const lang = row[C.language]
    ? `<p class="lk-language">${esc(row[C.language])}</p>` : '';
  const updated = row[C.updated]
    ? `<p class="lk-updated">Dashboard entry updated ${esc(row[C.updated])}.</p>` : '';

  return `
    <div class="lk-detail">
      <dl class="lk-dl">${rows}</dl>
      ${lang}
      ${updated}
      <a class="lk-dashlink" href="${DASHBOARD_URL}" target="_blank" rel="noopener">View on the SBTi Dashboard ↗</a>
    </div>`;
}

function renderResults(query) {
  const wrap = $('lookupResults');
  const status = $('lookupStatus');
  const hits = search(query);

  if (!query.trim()) {
    wrap.innerHTML = '';
    status.textContent = `${DATA.count.toLocaleString('en-US')} companies ready to search.`;
    return;
  }
  if (!hits.length) {
    wrap.innerHTML = '';
    status.textContent = `No company matches “${query.trim()}”. Try a shorter or different spelling.`;
    return;
  }

  status.textContent = `${hits.length === MAX_RESULTS ? MAX_RESULTS + '+' : hits.length} match${hits.length === 1 ? '' : 'es'}.`;
  wrap.innerHTML = hits.map((h, idx) => {
    const row = DATA.rows[h.i];
    const sub = [row[C.location], row[C.sector]].filter(Boolean).join(' · ');
    const near = row[C.ntStatus] || row[C.nzStatus] || '';
    return `
      <div class="lk-item">
        <button type="button" class="lk-row" aria-expanded="false" data-row="${h.i}" data-idx="${idx}">
          <span class="lk-name">${highlight(row[C.name], query)}</span>
          <span class="lk-sub">${esc(sub)}</span>
          ${near ? statusPill('NT', row[C.ntStatus] || row[C.nzStatus]) : ''}
          <svg class="lk-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
      </div>`;
  }).join('');
}

/* ---- open / close ---- */

function openOverlay() {
  const overlay = $('lookupOverlay');
  lastFocus = document.activeElement;
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  document.documentElement.style.overflow = 'hidden';

  const input = $('lookupInput');
  const status = $('lookupStatus');
  status.textContent = 'Loading the company dataset…';
  input.focus();

  ensureData()
    .then(() => {
      const meta = $('lookupMeta');
      if (meta) {
        meta.textContent = ` ${DATA.count.toLocaleString('en-US')} companies, as of ${DATA.generated}.`;
      }
      renderResults(input.value);
    })
    .catch(() => {
      status.innerHTML = `Couldn’t load the dataset. Search directly on the <a href="${DASHBOARD_URL}" target="_blank" rel="noopener">SBTi Dashboard ↗</a>.`;
    });
}

function closeOverlay() {
  const overlay = $('lookupOverlay');
  overlay.classList.remove('is-open');
  document.documentElement.style.overflow = '';
  const done = () => { overlay.hidden = true; overlay.removeEventListener('transitionend', done); };
  overlay.addEventListener('transitionend', done);
  // Fallback in case the transition never fires (reduced motion, hidden tab).
  setTimeout(() => { if (overlay.classList.contains('is-open') === false) overlay.hidden = true; }, 360);
  (lastFocus && lastFocus.focus) ? lastFocus.focus() : $('targetLookupBtn')?.focus();
}

/* ---- keyboard: arrow-key navigation between input and results ---- */

function focusableRows() {
  return Array.from($('lookupResults').querySelectorAll('.lk-row'));
}

function onKeydown(e) {
  const overlay = $('lookupOverlay');
  if (overlay.hidden) return;
  if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); return; }
  if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

  const rows = focusableRows();
  if (!rows.length) return;
  const active = document.activeElement;
  const pos = rows.indexOf(active);
  e.preventDefault();
  if (e.key === 'ArrowDown') {
    if (pos === -1) rows[0].focus();
    else rows[Math.min(pos + 1, rows.length - 1)].focus();
  } else { // ArrowUp
    if (pos <= 0) $('lookupInput').focus();
    else rows[pos - 1].focus();
  }
}

/* ---- wiring ---- */

function init() {
  const btn = $('targetLookupBtn');
  const overlay = $('lookupOverlay');
  if (!btn || !overlay) return;

  // Warm the dataset on first hover/focus so the click feels instant.
  let warmed = false;
  const warm = () => { if (!warmed) { warmed = true; ensureData().catch(() => {}); } };
  btn.addEventListener('pointerenter', warm, { once: true });
  btn.addEventListener('focus', warm, { once: true });

  btn.addEventListener('click', openOverlay);
  $('lookupClose').addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });
  document.addEventListener('keydown', onKeydown);

  // Debounced search-as-you-type.
  let t = 0;
  $('lookupInput').addEventListener('input', (e) => {
    clearTimeout(t);
    const val = e.target.value;
    t = setTimeout(() => { if (DATA) renderResults(val); }, 110);
  });

  // Expand / collapse a result to reveal its target detail.
  $('lookupResults').addEventListener('click', (e) => {
    const row = e.target.closest('.lk-row');
    if (!row) return;
    const item = row.closest('.lk-item');
    const open = row.getAttribute('aria-expanded') === 'true';
    if (open) {
      row.setAttribute('aria-expanded', 'false');
      item.querySelector('.lk-detail')?.remove();
    } else {
      row.setAttribute('aria-expanded', 'true');
      item.insertAdjacentHTML('beforeend', detailHTML(DATA.rows[+row.dataset.row]));
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
