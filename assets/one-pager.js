/* =========================================================================
   SBTi "Net-Zero Loop" — role one-pager
   The hero "I want a one-pager" button opens a chooser ("What's your job?")
   and renders a tailored, printable brief on what CNZS v2 changes for that
   role. Content is authored from the chapters in index.html / content.js and
   the published Standard. Three roles, written from each seat:
     · Energy procurement manager  — Scope 2 as a procurement architecture
     · ESG / sustainability manager — the whole cycle, submission to proof
     · Senior leadership            — accountability, strategy, cost, risk
   Plus a 4th entry: SBTi's official "How to set targets" flowchart, rebuilt
   as an interactive roadmap (assets/roadmap.js) whose nodes open context
   bubbles that deep-link into the chapters on the page.
   ========================================================================= */

import { ROADMAP_ROLE, dismissRoadmapPopover } from './roadmap.js';

const PDF_URL = 'https://files.sciencebasedtargets.org/production/files/Corporate-Net-Zero-Standard-version-2.pdf?dm=1781191781';

const $ = (id) => document.getElementById(id);
let lastFocus = null;

/* ---- small visual helpers (self-contained, themed via CSS tokens) ---- */

function stats(items) {
  return `<div class="op-stats">${items.map((s) => `
    <div class="op-stat">
      <span class="op-stat-big">${s.big}</span>
      <span class="op-stat-label">${s.label}</span>
    </div>`).join('')}</div>`;
}

function bars(items, label) {
  return `<div class="op-bars" role="img" aria-label="${label}">${items.map((b) => `
    <div class="op-bar${b.peak ? ' is-peak' : ''}">
      <div class="op-bar-track"><div class="op-bar-fill" style="height:${b.pct}%"><span>${b.pct}%</span></div></div>
      <span class="op-bar-label">${b.label}</span>
    </div>`).join('')}</div>`;
}

function table(head, rows) {
  return `<div class="op-table-wrap"><table class="op-table">
    <thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="op-td-key"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

// items: [{ tone:'good'|'watch'|'bad', h, t }]
function dodont(items) {
  return `<div class="op-dodont">${items.map((d) => `
    <div class="op-dd op-dd--${d.tone}"><h5>${d.h}</h5><p>${d.t}</p></div>`).join('')}</div>`;
}

function checklist(items) {
  return `<ul class="op-checklist">${items.map((i) => `<li>${i}</li>`).join('')}</ul>`;
}

// rungs: [{ n, tier, title, text, earns }]
function ladder(rungs) {
  return `<ol class="op-ladder">${rungs.map((r) => `
    <li class="op-rung">
      <span class="op-rung-num">${r.n}</span>
      <div class="op-rung-body">
        <p class="op-rung-tier">${r.tier}</p>
        <h5>${r.title}</h5>
        <p>${r.text}</p>
        ${r.earns ? `<p class="op-rung-earns"><span>Earns</span> ${r.earns}</p>` : ''}
      </div>
    </li>`).join('')}</ol>`;
}

// dates: [{ when, what, tone:'teal'|'amber'|'gray' }]
function dates(items) {
  return `<ol class="op-dates">${items.map((d) => `
    <li class="op-date op-date--${d.tone || 'teal'}">
      <span class="op-date-when">${d.when}</span>
      <span class="op-date-what">${d.what}</span>
    </li>`).join('')}</ol>`;
}

// OER cost tiers
function costTiers() {
  const t = [
    { name: 'Engaged', cov: '1%', detail: 'of total ongoing scope 1, 2 & 3', price: 'No mandated price' },
    { name: 'Advanced', cov: '10%', detail: 'incl. 100% of scope 1 + 2', price: '$20 / tCO₂e budget option' },
    { name: 'Leadership', cov: '100%', detail: 'of ongoing emissions for Cat A', price: '$80 / tCO₂e budget', lead: true },
  ];
  return `<div class="op-tiers">${t.map((x) => `
    <div class="op-tier${x.lead ? ' is-lead' : ''}">
      <p class="op-tier-name">${x.name}</p>
      <p class="op-tier-cov">${x.cov}</p>
      <p class="op-tier-detail">${x.detail}</p>
      <p class="op-tier-price">${x.price}</p>
    </div>`).join('')}</div>`;
}

function section(title, body) {
  return `<section class="op-section"><h3 class="op-section-h">${title}</h3>${body}</section>`;
}

function callout(tone, title, text) {
  return `<div class="op-callout op-callout--${tone}">
    <p class="op-callout-h">${title}</p><p>${text}</p></div>`;
}

/* ---- role definitions ---- */

const ROLES = [
  {
    id: 'procurement',
    label: 'Energy procurement',
    role: 'Energy Procurement Manager',
    tag: 'Scope 2 just became a contract-architecture problem',
    icon: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    accent: 'amber',
    build() {
      return [
        `<p class="op-lede">For electricity, v2 shifts the question from where you bought a certificate to whether the low-carbon supply reaches the load you want to claim. That puts site-level data, contract evidence and precise claim wording on procurement's desk.</p>`,

        stats([
          { big: '100%', label: 'of Scope 2 emissions must be covered by near-term targets' },
          { big: '10 GWh', label: 'Category A hourly-reporting trigger, per activity pool' },
          { big: '1 Feb 2027', label: 'v2 effective date; legacy contract cut-off' },
        ]),

        section('The 5 shifts that reshape your week', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · Two ways to express the target (C12)</h5><p>Set an <strong>LCE-alignment</strong> target, an <strong>absolute Scope 2 emissions</strong> target, or both. Category A companies whose projected average annual electricity growth tops 20% over the cycle must set a Scope 2 emissions target.</p></div>
            <div class="op-kp"><h5>2 · Market instruments can still help</h5><p>PPAs, supplier contracts, unbundled EACs and some default-delivered LCE can back implementation if they meet v2 integrity rules. On their own, they prove <strong>no</strong> physical emissions reduction.</p></div>
            <div class="op-kp"><h5>3 · Deliverability regions replace broad claims</h5><p>An activity pool is the smallest reasonable grid or system your load connects to. Claim across a broad national or regional portfolio and you need deliverability, interconnection or legacy-contract support.</p></div>
            <div class="op-kp"><h5>4 · One PPA can cover many loads (C30.3.b)</h5><p>Pool several interconnected loads across a wide-area synchronous grid under a single PPA, provided offtake starts within <strong>36 months</strong> of the project's commissioning.</p></div>
            <div class="op-kp"><h5>5 · Sector-level action needs evidence</h5><p>Use it only when structural constraints block activity or activity-pool action. Infrastructure, regulation or supply can count; internal preference or cost alone cannot.</p></div>
          </div>`),

        section('The claim shift, in one table', table(
          ['Action', 'Strongest claim it earns'],
          [
            ['Energy efficiency cutting kWh', 'Physical emissions reduction'],
            ['On-site or direct-line LCE consumed by you', 'Activity-level reduction + LCE alignment'],
            ['Eligible PPA / EAC in the right pool', 'LCE alignment; system contribution if outside the physical inventory'],
            ['Legacy long-term contract signed before v2', 'May remain deliverable in existing pools until renewal'],
            ['Out-of-region certificate with no deliverability route', 'Not a robust v2 claim'],
          ])),

        section('Optional hourly recognition thresholds (C32–C34)', `
          ${bars([
            { pct: 50, label: 'until 2030' },
            { pct: 75, label: 'until 2035' },
            { pct: 90, label: 'from 2035', peak: true },
          ], 'Hourly-matching recognition thresholds rising from 50% to 75% to 90%')}
          <p class="op-fine">For any Scope 2 electricity pool ≥10 GWh/year, Category A companies must report hourly matching. The thresholds above earn optional recognition on the SBTi Dashboard; they set no general pass/fail bar.</p>`),

        section('Say it right', dodont([
          { tone: 'bad', h: 'Don\'t say', t: '"We reduced Scope 2 by 100% through GOs."' },
          { tone: 'good', h: 'Do say', t: '"We matched 100% of consumption with eligible low-carbon electricity instruments, subject to v2 quality & deliverability."' },
        ])),

        section('Your action list before 1 Feb 2027', checklist([
          'Map every electricity draw by site, country, bidding/grid zone, supplier and annual MWh.',
          'Flag the activity pools that run above 10 GWh/year.',
          'Split your physical-reduction levers from your EAC/PPA implementation levers.',
          'Stand up a <strong>legacy-contract register</strong> — sign date, term, renewal rights, commissioning date, zone, serials and the claim wording each contract allows.',
          'Demand certificate serial numbers, cancellation evidence and hourly data.',
          'Run all claim wording past legal and comms, and drop the generic pan-EU claims.',
          'Put demand reduction, on-site or direct-line supply and deliverable PPAs ahead of cheap unbundled certificates.',
        ])),

        callout('amber', 'Validated 2030 targets stay the near-term focus', 'If your 2030 Scope 1 & 2 targets are validated, keep delivering and evidencing them. From 2028, start designing the 2030–2035 cycle under v2 — sooner if a material change triggers recalculation or revalidation.'),
      ].join('');
    },
  },

  {
    id: 'esg',
    label: 'ESG / Sustainability',
    role: 'ESG / Sustainability Manager',
    tag: 'You own the cycle — from board sign-off to end-of-cycle proof',
    icon: '<path d="M12 2a9 9 0 1 0 9 9"/><path d="M12 7v5l3 2"/><path d="M21 3v6h-6"/>',
    accent: 'teal',
    build() {
      return [
        `<p class="op-lede">v2 turns a one-off submission into a <strong>governed five-year loop</strong>: govern → baseline → set targets → implement → prove, repeated to 2050. You are the integrator who keeps every link holding.</p>`,

        stats([
          { big: '5%', label: 'Category A Scope 3 category / EIA significance trigger' },
          { big: '15 mo', label: 'Category A transition-plan publication deadline after validation' },
          { big: '5 yr', label: 'near-term cycle: annual tracking plus end-of-cycle assessment' },
        ]),

        section('Get the foundations right (Ch.1–2)', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>Board accountability (C1)</h5><p>Your highest governing body must <em>formally take accountability</em> for the targets, not merely note them. Document the governance structure and the review process behind it.</p></div>
            <div class="op-kp"><h5>Transition plan at validation (C2)</h5><p>Bring a board-approved plan that tracks corporate strategy and, where it applies, commits to phasing out unabated-fossil revenue. Category A publishes it within 15 months, and some Scope 1 target routes demand publication right at validation.</p></div>
            <div class="op-kp"><h5>Rolling base year + assurance (C4, C7)</h5><p>Each cycle, roll the base year forward to your most recent comprehensive-data year — you continue the line, you do not reset it. Category A must secure limited assurance over that base-year inventory and the required metrics.</p></div>
            <div class="op-kp"><h5>Emissions-intensive activities (C6)</h5><p>Screen your operations against the SBTi list of EIAs and quantify each one you find. Any EIA at ≥5% of Scope 3 counts as significant: report it by absolute emissions and share, and back it with a decarbonisation plan.</p></div>
          </div>`),

        section('Scope 3 is now a decision system (C14–C16)', `
          <p class="op-fine">For Category A, "did you cover two-thirds?" gives way to two sharper questions: <strong>(1)</strong> which categories clear the 5% boundary, and <strong>(2)</strong> which target lever fits each. Seven exclusion routes stay open, yet each one demands a reason, the excluded emissions in absolute and % terms, and a stated intent to mitigate. Category 11 keeps one narrow fallback — cut equivalent emissions elsewhere, or win an approved exception that carries a long-term target, an embedded plan and annual reporting.</p>
          ${table(
            ['Decision', 'Plain-English requirement'],
            [
              ['Category A near-term targets', 'Separate Scope 1, Scope 2 and Scope 3 targets.'],
              ['Category B near-term targets', 'Separate Scope 1 and Scope 2 targets; Scope 3 is optional unless the company chooses net-zero.'],
              ['Long-term / net-zero', 'Net-zero targets are optional. If chosen, they need near-term and long-term targets across all scopes and neutralization of residual emissions.'],
              ['Scope 1 special routes', 'If using intensity or asset-transition targets, publish the transition plan at validation and set long-term Scope 1 targets.'],
            ])}
          <p class="op-fine">Category A captures large companies anywhere, along with medium-sized companies based in high-income countries; Category B gathers the smaller companies, plus medium-sized companies in lower-income countries.</p>`),

        section('Delivery is graded — the mitigation hierarchy (C21–C26)', ladder([
          { n: 1, tier: 'Activity level', title: 'Cut at source', text: 'Efficiency, fuel switching, behind-the-meter generation, supplier & customer engagement.', earns: 'A company-level reduction that lands straight in your inventory.' },
          { n: 2, tier: 'Activity pools', title: 'Act within shared systems', text: 'Grids, supply sheds, logistics — PPAs, EACs, mass-balance, book & claim.', earns: 'A system-contribution claim, reported on its own.' },
          { n: 3, tier: 'Sector level', title: 'Only while constrained', text: 'Open only against a documented structural constraint; cost or preference alone will not qualify.', earns: 'A system-contribution claim — never a stand-in for real cuts.' },
        ])),

        section('Prove it — say only what you can show (C36–C37)', `
          <p class="op-fine">Track progress every year, then close the cycle with an End-of-Cycle Assessment in year five. Three claim types follow, each held to its own evidence bar:</p>
          ${table(
            ['Claim', 'Basis'],
            [
              ['Emissions reduction', 'A change in your physical GHG inventory vs base year (strongest)'],
              ['Net-zero alignment', 'Activity-level actions producing measurable change'],
              ['System contribution', 'Activity-pool / sector actions — outside the inventory'],
            ])}
          <p class="op-fine">Best efforts count, so spell out the barriers you hit, the dependencies you carry and the corrective actions you are taking. The minimum progress criteria for revalidation are still to come in the SBTi Assurance Manual.</p>`),

        callout('teal', 'On your radar for 2035', 'Today, Ongoing Emissions Responsibility stays voluntary across the Engaged, Advanced and Leadership tiers. From 2035, Category A companies are expected to support eligible removals — 1% of ongoing emissions at the start, climbing linearly to 100% by the net-zero year.'),
      ].join('');
    },
  },

  {
    id: 'leadership',
    label: 'Senior leadership',
    role: 'Senior Leadership',
    tag: 'Accountability, strategy, capital and reputation — now yours',
    icon: '<path d="M3 21h18"/><path d="M5 21V8l7-5 7 5v13"/><path d="M9 21v-6h6v6"/>',
    accent: 'teal',
    build() {
      return [
        `<p class="op-lede">v2 moves net-zero from a sustainability commitment into a governed business cycle. The board owns accountability, the transition plan must connect to strategy, and every public claim now rests on evidence — inventory data and implementation actions.</p>`,

        stats([
          { big: 'Board', label: 'your highest governing body is now formally accountable (C1)' },
          { big: '$20 / $80', label: 'OER budget benchmarks for Advanced / Leadership tiers' },
          { big: '2050', label: 'latest net-zero year; residuals neutralised at and after target date' },
        ]),

        section('Four things that change the risk picture', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · The board is on the hook (C1)</h5><p>The highest governing body now carries accountability for the targets — through explicit governance, not a delegated sign-off.</p></div>
            <div class="op-kp"><h5>2 · The transition plan is a strategy document (C2.3)</h5><p>The plan has to align with — or sit inside — corporate strategy, win board approval, and face review at least every 5 years. Where unabated fossil fuels earn you revenue, you must commit to phasing that revenue out. This is no CSR appendix.</p></div>
            <div class="op-kp"><h5>3 · Delivery is earned, not bought (C21–C23)</h5><p>Cut at source first. Market instruments and sector-level action can support the effort, but only inside the hierarchy — and, where the rules demand it, only on evidence of structural constraints.</p></div>
            <div class="op-kp"><h5>4 · Claims are evidence-bound (C37)</h5><p>A reduction claim has to trace to a physical change in your inventory. Activity-pool and sector actions report separately and back system-contribution claims — never inventory reduction claims.</p></div>
          </div>`),

        section('It has a price — Ongoing Emissions Responsibility', `
          ${costTiers()}
          <p class="op-fine">Today it earns voluntary recognition. From 2035, Category A companies are expected to support eligible removals worth 1% of ongoing emissions, a share that climbs linearly to 100% by the net-zero year and no later than 2050.</p>`),

        section('The clock to 2050', dates([
          { when: '11 Jun 2026', what: 'v2 published', tone: 'teal' },
          { when: '1 Feb 2027', what: 'v2 effective — existing long-term electricity contracts get limited grandfathering', tone: 'teal' },
          { when: 'End 2027', what: 'v1 closes to new targets', tone: 'gray' },
          { when: 'From 2028', what: 'First cohort renews — 2030–2035 targets set under v2', tone: 'teal' },
          { when: '2035', what: 'Category A OER removals phase in; optional hourly-recognition threshold reaches 90%', tone: 'amber' },
          { when: 'By 2050', what: 'Net-zero: zero or residual emissions, with residuals neutralised using eligible removals', tone: 'amber' },
        ])),

        callout('teal', 'The decisions that are yours to make', 'Own board accountability and the transition plan; steer capital toward asset transition, PPAs and a removals budget; set the risk appetite for public claims; and commit to phasing out any unabated-fossil revenue.'),
      ].join('');
    },
  },
];

/* The official SBTi flowchart, rendered by assets/roadmap.js — listed first */
ROLES.unshift(ROADMAP_ROLE);

/* ---- rendering ---- */

function renderChooser() {
  $('opRoleGrid').innerHTML = ROLES.map((r) => `
    <button type="button" class="op-role-card op-role-card--${r.accent}" data-role="${r.id}">
      <span class="op-role-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${r.icon}</svg>
      </span>
      <span class="op-role-name">${r.role}</span>
      <span class="op-role-tag">${r.tag}</span>
      <span class="op-role-go">${r.go || 'Read the brief →'}</span>
    </button>`).join('');
}

function showChooser() {
  $('opSheet').hidden = true;
  $('opSheet').innerHTML = '';
  $('opChooser').hidden = false;
  document.querySelector('.op-panel')?.classList.remove('op-panel--wide');
  $('opTitle').focus?.();
}

function showRole(id) {
  const role = ROLES.find((r) => r.id === id);
  if (!role) return;
  $('opChooser').hidden = true;
  const sheet = $('opSheet');
  sheet.innerHTML = `
    <div class="op-sheet-bar">
      <button type="button" class="op-back" id="opBack">← All roles</button>
      <button type="button" class="op-print" id="opPrint">Print / Save PDF</button>
    </div>
    <header class="op-sheet-head op-accent--${role.accent}">
      <span class="op-sheet-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${role.icon}</svg>
      </span>
      <div>
        <p class="kicker">CNZS v2 · One-pager</p>
        <h2 class="op-sheet-title">${role.role}</h2>
        <p class="op-sheet-tag">${role.tag}</p>
      </div>
    </header>
    <div class="op-sheet-body">${role.build()}</div>
    <footer class="op-sheet-foot">
      Summarised from the chapters on this page. For the definitive requirements, read
      <a href="${PDF_URL}" target="_blank" rel="noopener">the published Standard (PDF)</a>.
    </footer>`;
  /* The flowchart needs more width than the briefs */
  document.querySelector('.op-panel')?.classList.toggle('op-panel--wide', role.id === 'roadmap');
  sheet.hidden = false;
  sheet.scrollTop = 0;
  /* Optional per-role hook: wires up interactivity after the HTML lands
     (the roadmap uses it for its context bubbles). */
  if (role.enhance) role.enhance(sheet, { onNavigate: leaveForAnchor });
  $('opBack').focus();
}

/* ---- roadmap deep links: leave the overlay for a chapter, offer a way back ---- */

let roadmapScroll = 0;

function leaveForAnchor(anchor) {
  roadmapScroll = $('onePagerOverlay').scrollTop;
  closeOverlay();
  showReturnPill();
  const target = document.getElementById(anchor.slice(1));
  /* Setting the hash lets chapters.js auto-open Scope 2 expander cards on
     hashchange; the explicit follow-up scroll mirrors the anchor-pill
     pattern there and covers the same-hash case (no hashchange event).
     The extra scroll margin makes the section land below the return pill
     (which sits just under the fixed header). */
  if (target) target.style.scrollMarginTop = '140px';
  if (location.hash !== anchor) location.hash = anchor;
  setTimeout(() => {
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => { if (target) target.style.scrollMarginTop = ''; }, 1500);
  }, 80);
}

function showReturnPill() {
  if ($('opReturnPill')) return;
  const pill = document.createElement('button');
  pill.type = 'button';
  pill.id = 'opReturnPill';
  pill.className = 'op-return-pill';
  pill.innerHTML = '← Back to roadmap';
  /* sit just below the fixed header, whatever its current height */
  const header = document.querySelector('.site-header');
  if (header) pill.style.top = Math.round(header.getBoundingClientRect().height + 10) + 'px';
  pill.addEventListener('click', () => {
    openOverlay();
    showRole('roadmap');
    requestAnimationFrame(() => { $('onePagerOverlay').scrollTop = roadmapScroll; });
  });
  document.body.appendChild(pill);
  requestAnimationFrame(() => pill.classList.add('is-in'));
}

function hideReturnPill() {
  $('opReturnPill')?.remove();
}

/* ---- open / close ---- */

function openOverlay() {
  const overlay = $('onePagerOverlay');
  hideReturnPill(); // any re-entry into the one-pager supersedes the pill
  lastFocus = document.activeElement;
  showChooser();
  overlay.hidden = false;
  requestAnimationFrame(() => overlay.classList.add('is-open'));
  document.documentElement.style.overflow = 'hidden';
}

function closeOverlay() {
  const overlay = $('onePagerOverlay');
  overlay.classList.remove('is-open');
  document.documentElement.style.overflow = '';
  const done = () => { overlay.hidden = true; overlay.removeEventListener('transitionend', done); };
  overlay.addEventListener('transitionend', done);
  setTimeout(() => { if (!overlay.classList.contains('is-open')) overlay.hidden = true; }, 360);
  /* preventScroll: when leaving via a roadmap deep link, restoring focus to
     the hero button must not scroll the page away from the target chapter */
  (lastFocus && lastFocus.focus)
    ? lastFocus.focus({ preventScroll: true })
    : $('onePagerBtn')?.focus({ preventScroll: true });
}

/* ---- wiring ---- */

function init() {
  const btn = $('onePagerBtn');
  const overlay = $('onePagerOverlay');
  if (!btn || !overlay) return;

  renderChooser();

  btn.addEventListener('click', openOverlay);
  $('onePagerClose').addEventListener('click', closeOverlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay(); });

  document.addEventListener('keydown', (e) => {
    if (overlay.hidden || e.key !== 'Escape') return;
    e.preventDefault();
    // Esc closes the roadmap bubble first, then steps back to the chooser, then closes.
    if (dismissRoadmapPopover()) return;
    if ($('opSheet').hidden) closeOverlay();
    else showChooser();
  });

  $('opRoleGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.op-role-card');
    if (card) showRole(card.dataset.role);
  });

  $('opSheet').addEventListener('click', (e) => {
    if (e.target.closest('#opBack')) showChooser();
    else if (e.target.closest('#opPrint')) window.print();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
