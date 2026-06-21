/* =========================================================================
   SBTi "Net-Zero Loop" — role one-pager
   The hero "I want a one-pager" button opens a chooser ("What's your job?")
   and renders a tailored, printable brief on what CNZS v2 changes for that
   role. Content is authored from the chapters in index.html / content.js and
   the published Standard. Three roles, written from each seat:
     · Energy procurement manager  — Scope 2 as a procurement architecture
     · ESG / sustainability manager — the whole cycle, submission to proof
     · Senior leadership            — accountability, strategy, cost, risk
   ========================================================================= */

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
        `<p class="op-lede">For electricity, v2 is less about buying a certificate somewhere and more about proving the low-carbon supply is connected to the load you want to claim. Procurement now needs site-level data, contract evidence and careful claim wording.</p>`,

        stats([
          { big: '100%', label: 'of Scope 2 emissions must be covered by near-term targets' },
          { big: '10 GWh', label: 'Category A hourly-reporting trigger, per activity pool' },
          { big: '1 Feb 2027', label: 'v2 effective date; legacy contract cut-off' },
        ]),

        section('The 5 shifts that reshape your week', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · Two ways to express the target (C12)</h5><p>Set an <strong>LCE-alignment</strong> target, an <strong>absolute Scope 2 emissions</strong> target, or both. Category A companies with projected average annual electricity growth above 20% over the cycle must set a Scope 2 emissions target.</p></div>
            <div class="op-kp"><h5>2 · Market instruments can still help</h5><p>PPAs, supplier contracts, unbundled EACs and some default-delivered LCE can support implementation if they meet v2 integrity rules. On their own, they do <strong>not</strong> prove a physical emissions reduction.</p></div>
            <div class="op-kp"><h5>3 · Deliverability regions replace broad claims</h5><p>An activity pool is the smallest reasonable grid or system your load connects to. Broad national or regional portfolios need deliverability, interconnection or legacy-contract support.</p></div>
            <div class="op-kp"><h5>4 · One PPA can cover many loads (C30.3.b)</h5><p>Aggregate interconnected loads in a wide-area synchronous grid under one PPA if offtake begins within <strong>36 months</strong> of the project's commissioning.</p></div>
            <div class="op-kp"><h5>5 · Sector-level action needs evidence</h5><p>Use it only when structural constraints block activity or activity-pool action. Infrastructure, regulation or supply can count; internal preference or cost alone does not.</p></div>
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
          <p class="op-fine">Category A companies must report hourly matching for Scope 2 electricity pools ≥10 GWh/year. The bars are optional SBTi Dashboard recognition thresholds, not a general pass/fail requirement.</p>`),

        section('Say it right', dodont([
          { tone: 'bad', h: 'Don\'t say', t: '"We reduced Scope 2 by 100% through GOs."' },
          { tone: 'good', h: 'Do say', t: '"We matched 100% of consumption with eligible low-carbon electricity instruments, subject to v2 quality & deliverability."' },
        ])),

        section('Your action list before 1 Feb 2027', checklist([
          'Map electricity by site, country, bidding/grid zone, supplier and annual MWh.',
          'Identify activity pools above 10 GWh/year.',
          'Separate physical-reduction levers from EAC/PPA implementation levers.',
          'Build a <strong>legacy-contract register</strong> — sign date, term, renewal rights, commissioning date, zone, serials, allowed claim wording.',
          'Require certificate serial numbers, cancellation evidence and hourly data.',
          'Review all claim wording with legal/comms; drop generic pan-EU claims.',
          'Prioritise demand reduction, on-site/direct-line supply and deliverable PPAs over cheap unbundled certificates.',
        ])),

        callout('amber', 'Validated 2030 targets stay the near-term focus', 'If your 2030 Scope 1 & 2 targets are validated, keep delivering and evidencing them. Start designing the 2030–2035 cycle under v2 from 2028, unless a material change triggers recalculation or revalidation sooner.'),
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
        `<p class="op-lede">v2 turns a one-off submission into a <strong>governed five-year loop</strong>: govern → baseline → set targets → implement → prove, repeated to 2050. You're the integrator who makes every link hold.</p>`,

        stats([
          { big: '5%', label: 'Category A Scope 3 category / EIA significance trigger' },
          { big: '15 mo', label: 'Category A transition-plan publication deadline after validation' },
          { big: '5 yr', label: 'near-term cycle: annual tracking plus end-of-cycle assessment' },
        ]),

        section('Get the foundations right (Ch.1–2)', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>Board accountability (C1)</h5><p>Your highest governing body must <em>formally take accountability</em> for the targets — not just note them. Document the governance structure and a review process.</p></div>
            <div class="op-kp"><h5>Transition plan at validation (C2)</h5><p>Have a board-approved plan aligned to corporate strategy, including unabated-fossil revenue phase-out where relevant. Category A publishes within 15 months; some Scope 1 target routes require publication at validation.</p></div>
            <div class="op-kp"><h5>Rolling base year + assurance (C4, C7)</h5><p>Use the most recent comprehensive-data year each cycle — a continuation, not a reset. Category A needs limited assurance over the base-year inventory and required metrics.</p></div>
            <div class="op-kp"><h5>Emissions-intensive activities (C6)</h5><p>Identify and quantify EIAs from the SBTi list. Significant EIAs are ≥5% of Scope 3, must be reported by absolute emissions and share, and need a decarbonisation plan.</p></div>
          </div>`),

        section('Scope 3 is now a decision system (C14–C16)', `
          <p class="op-fine">For Category A, two questions replace "did you cover two-thirds?": <strong>(1)</strong> which categories clear the 5% boundary, and <strong>(2)</strong> which target lever fits each. Seven exclusion routes exist, but each needs a reason, excluded emissions in absolute and % terms, and mitigation intent. Category 11 has a narrow fallback: equivalent emissions elsewhere, or an approved exception with a long-term target, embedded plan and annual reporting.</p>
          ${table(
            ['Decision', 'Plain-English requirement'],
            [
              ['Category A near-term targets', 'Separate Scope 1, Scope 2 and Scope 3 targets.'],
              ['Category B near-term targets', 'Separate Scope 1 and Scope 2 targets; Scope 3 is optional unless the company chooses net-zero.'],
              ['Long-term / net-zero', 'Net-zero targets are optional. If chosen, they need near-term and long-term targets across all scopes and neutralization of residual emissions.'],
              ['Scope 1 special routes', 'If using intensity or asset-transition targets, publish the transition plan at validation and set long-term Scope 1 targets.'],
            ])}
          <p class="op-fine">Category A mostly means large companies anywhere, plus medium-sized companies in high-income countries; Category B covers smaller companies and medium-sized companies in lower-income countries.</p>`),

        section('Delivery is graded — the mitigation hierarchy (C21–C26)', ladder([
          { n: 1, tier: 'Activity level', title: 'Cut at source', text: 'Efficiency, fuel switching, behind-the-meter generation, supplier & customer engagement.', earns: 'Company-level reduction — lands in your inventory.' },
          { n: 2, tier: 'Activity pools', title: 'Act within shared systems', text: 'Grids, supply sheds, logistics — PPAs, EACs, mass-balance, book & claim.', earns: 'System-contribution claim, reported separately.' },
          { n: 3, tier: 'Sector level', title: 'Only while constrained', text: 'Requires a documented structural constraint; cost or preference alone does not qualify.', earns: 'System-contribution claim — never a substitute for cuts.' },
        ])),

        section('Prove it — say only what you can show (C36–C37)', `
          <p class="op-fine">Report progress annually, then complete an End-of-Cycle Assessment in year five. Three claim types, each with its own evidence bar:</p>
          ${table(
            ['Claim', 'Basis'],
            [
              ['Emissions reduction', 'A change in your physical GHG inventory vs base year (strongest)'],
              ['Net-zero alignment', 'Activity-level actions producing measurable change'],
              ['System contribution', 'Activity-pool / sector actions — outside the inventory'],
            ])}
          <p class="op-fine">Best efforts matter: explain barriers, dependencies and corrective actions. Minimum progress criteria for revalidation are still forthcoming in the SBTi Assurance Manual.</p>`),

        callout('teal', 'On your radar for 2035', 'Ongoing Emissions Responsibility is voluntary now (Engaged/Advanced/Leadership tiers). From 2035, Category A companies are expected to support eligible removals, starting at 1% of ongoing emissions and rising linearly to 100% by the net-zero year.'),
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
        `<p class="op-lede">v2 moves net-zero from a sustainability commitment into a governed business cycle. The board owns accountability, the transition plan must connect to strategy, and public claims now need evidence from inventory data and implementation actions.</p>`,

        stats([
          { big: 'Board', label: 'your highest governing body is now formally accountable (C1)' },
          { big: '$20 / $80', label: 'OER budget benchmarks for Advanced / Leadership tiers' },
          { big: '2050', label: 'latest net-zero year; residuals neutralised at and after target date' },
        ]),

        section('Four things that change the risk picture', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · The board is on the hook (C1)</h5><p>Accountability for the targets sits with the highest governing body — explicit governance, not delegated sign-off.</p></div>
            <div class="op-kp"><h5>2 · The transition plan is a strategy document (C2.3)</h5><p>It must be aligned to — or built into — corporate strategy, board-approved, and reviewed at least every 5 years. Where you earn revenue from unabated fossil fuels, you must commit to phasing it out. Not a CSR appendix.</p></div>
            <div class="op-kp"><h5>3 · Delivery is earned, not bought (C21–C23)</h5><p>Cut at source first. Market instruments and sector-level action can help, but only within the hierarchy and with evidence of structural constraints where required.</p></div>
            <div class="op-kp"><h5>4 · Claims are evidence-bound (C37)</h5><p>Reduction claims come from physical inventory change. Activity-pool and sector actions are reported separately and support system-contribution claims, not inventory reduction claims.</p></div>
          </div>`),

        section('It has a price — Ongoing Emissions Responsibility', `
          ${costTiers()}
          <p class="op-fine">Voluntary recognition today. From 2035, Category A companies are expected to support eligible removals equal to 1% of ongoing emissions, rising linearly to 100% by the net-zero year and no later than 2050.</p>`),

        section('The clock to 2050', dates([
          { when: '11 Jun 2026', what: 'v2 published', tone: 'teal' },
          { when: '1 Feb 2027', what: 'v2 effective — existing long-term electricity contracts get limited grandfathering', tone: 'teal' },
          { when: 'End 2027', what: 'v1 closes to new targets', tone: 'gray' },
          { when: 'From 2028', what: 'First cohort renews — 2030–2035 targets set under v2', tone: 'teal' },
          { when: '2035', what: 'Category A OER removals phase in; optional hourly-recognition threshold reaches 90%', tone: 'amber' },
          { when: 'By 2050', what: 'Net-zero: zero or residual emissions, with residuals neutralised using eligible removals', tone: 'amber' },
        ])),

        callout('teal', 'The decisions that are yours to make', 'Owning board accountability and the transition plan; allocating capital to asset transition, PPAs and a removals budget; setting the risk appetite for public claims; and committing to phase out any unabated-fossil revenue.'),
      ].join('');
    },
  },
];

/* ---- rendering ---- */

function renderChooser() {
  $('opRoleGrid').innerHTML = ROLES.map((r) => `
    <button type="button" class="op-role-card op-role-card--${r.accent}" data-role="${r.id}">
      <span class="op-role-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${r.icon}</svg>
      </span>
      <span class="op-role-name">${r.role}</span>
      <span class="op-role-tag">${r.tag}</span>
      <span class="op-role-go">Read the brief →</span>
    </button>`).join('');
}

function showChooser() {
  $('opSheet').hidden = true;
  $('opSheet').innerHTML = '';
  $('opChooser').hidden = false;
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
      Summarised from the chapters on this page. Definitive requirements:
      <a href="${PDF_URL}" target="_blank" rel="noopener">the published Standard (PDF)</a>.
    </footer>`;
  sheet.hidden = false;
  sheet.scrollTop = 0;
  $('opBack').focus();
}

/* ---- open / close ---- */

function openOverlay() {
  const overlay = $('onePagerOverlay');
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
  (lastFocus && lastFocus.focus) ? lastFocus.focus() : $('onePagerBtn')?.focus();
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
    // Esc steps back to the chooser first, then closes.
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
