/* =========================================================================
   SBTi "Net-Zero Loop" — role one-pager
   The hero "I want a one-pager" button opens a chooser ("What's your job?")
   and renders a tailored, printable brief on what CNZS V2.0 changes for that
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
    { name: 'Engaged', cov: '1%', detail: 'of total ongoing scope 1, 2 & 3', price: 'Price you choose' },
    { name: 'Advanced', cov: '10%', detail: 'incl. 100% of scope 1 + 2', price: '$20 / tCO₂e' },
    { name: 'Leadership', cov: '100%', detail: 'of ongoing emissions (Cat A)', price: '$80 / tCO₂e', lead: true },
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
        `<p class="op-lede">V2.0 barely changes <em>whether</em> instruments exist — it changes <strong>where they can credibly be claimed</strong>. Your job shifts from buying certificates to architecting deliverable, claimable supply, pool by pool.</p>`,

        stats([
          { big: '100%', label: 'of purchased electricity, heat, steam & cooling must be covered' },
          { big: '10 GWh', label: 'hourly-matching reporting threshold — per activity pool, not global' },
          { big: '1 Feb 2027', label: 'effective date & grandfathering cut-off' },
        ]),

        section('The 5 shifts that reshape your week', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · Two ways to express the target (C12)</h5><p><strong>LCE-share alignment</strong> — grow low-carbon electricity to 100% long-term; LCE now means renewables <em>plus nuclear plus CCS-fitted</em> generation. Or <strong>absolute reduction</strong>. If projected demand grows &gt;20%/yr, an emissions target becomes mandatory (C12.4). Category A files demand projections at validation.</p></div>
            <div class="op-kp"><h5>2 · EACs still count — but the claim changes</h5><p>Unbundled certificates support <em>low-carbon alignment</em> and <em>system-contribution</em> claims — <strong>not</strong> a physical emissions-reduction claim unless your physical inventory actually changes.</p></div>
            <div class="op-kp"><h5>3 · Deliverability regions, not countries</h5><p>An activity pool is the grid your load connects to. Bidding zones matter: SE1≠SE4, DK1≠DK2, GB≠NI, ERCOT/PJM/CAISO. A generic "Europe-wide GO portfolio" is too broad.</p></div>
            <div class="op-kp"><h5>4 · One PPA can cover many loads (C30.3.b)</h5><p>Aggregate interconnected loads in a synchronous grid under one PPA — if offtake begins within <strong>36 months</strong> of the project's commissioning.</p></div>
            <div class="op-kp"><h5>5 · Sector-level action is a fallback, not a discount</h5><p>Allowed only under a demonstrated <em>structural</em> constraint (regulation, infrastructure, supply). Cost or preference never qualifies.</p></div>
          </div>`),

        section('The claim shift, in one table', table(
          ['Action', 'Strongest claim it earns'],
          [
            ['Energy efficiency cutting kWh', 'Physical emissions reduction'],
            ['On-site solar consumed on site', 'Physical reduction + LCE alignment'],
            ['Grid-connected PPA in the right pool', 'LCE alignment / possible system contribution'],
            ['Unbundled GO / EAC (quality rules met)', 'LCE alignment only'],
            ['Out-of-region certificate, no deliverability', 'Weak — likely not robust for V2'],
          ])),

        section('Hourly matching climbs over time (C32–C34)', `
          ${bars([
            { pct: 50, label: 'until 2030' },
            { pct: 75, label: 'until 2035' },
            { pct: 90, label: 'from 2035', peak: true },
          ], 'Hourly-matching recognition thresholds rising from 50% to 75% to 90%')}
          <p class="op-fine">It's a procurement <em>matching</em> metric, not a location-based hourly calc. Reporting is mandatory for Category A pools ≥10 GWh, with third-party assurance.</p>`),

        section('Say it right', dodont([
          { tone: 'bad', h: 'Don\'t say', t: '"We reduced Scope 2 by 100% through GOs."' },
          { tone: 'good', h: 'Do say', t: '"We matched 100% of consumption with eligible low-carbon electricity instruments, subject to V2 quality & deliverability."' },
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

        callout('amber', 'Don\'t reopen validated 2030 targets', 'If your 2030 Scope 1 & 2 targets are validated, deliver and evidence them — only reopen for recalculation, M&A, non-conformance or strategy. Start designing the 2030–2035 cycle from 2028.'),
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
        `<p class="op-lede">V2.0 turns a one-off submission into a <strong>governed five-year loop</strong>: govern → baseline → set targets → implement → prove, repeated to 2050. You're the integrator who makes every link hold.</p>`,

        stats([
          { big: '5%', label: 'a Scope 3 category at/above this share is in your near-term boundary' },
          { big: '15 mo', label: 'to publish the transition plan after validation (Category A)' },
          { big: '5 yr', label: 'cycle: 4 annual reports + an End-of-Cycle Assessment' },
        ]),

        section('Get the foundations right (Ch.1–2)', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>Board accountability (C1)</h5><p>Your highest governing body must <em>formally take accountability</em> for the targets — not just note them. Document the governance structure and a review process.</p></div>
            <div class="op-kp"><h5>Transition plan at validation (C2)</h5><p>Board-approved, aligned to corporate strategy, fossil-revenue phase-out where relevant. Category A publishes within 15 months — <strong>but no grace period</strong> if you set Scope 1 intensity or asset-transition targets (publish at validation). Reviewed ≥ every 5 years.</p></div>
            <div class="op-kp"><h5>Rolling base year + assurance (C4, C7)</h5><p>Re-select the most recent comprehensive-data year each cycle — a continuation, not a reset. <strong>Limited assurance of the base-year inventory is now required</strong> (Category A).</p></div>
            <div class="op-kp"><h5>Emissions-intensive activities (C6)</h5><p>Identify & quantify EIAs from the SBTi reference list; significant at ≥5% of Scope 3; report absolute + share, and plan to decarbonise them. Recalculate on a material/5% change (C8).</p></div>
          </div>`),

        section('Scope 3 is now a decision system (C14–C16)', `
          <p class="op-fine">Two questions replace "did you cover two-thirds?": <strong>(1)</strong> which categories clear the 5% boundary, and <strong>(2)</strong> which Table 3 lever fits each. Seven codified exclusion routes exist — each needs the condition, the emissions excluded (absolute + %), and a mitigation intent. Category 11 has an escape hatch (equivalent volume elsewhere, or an exception with a long-term target, embedded plan and annual reporting).</p>
          ${table(
            ['Target type', 'Scope 1', 'Scope 2', 'Scope 3'],
            [
              ['Near-term (5-yr)', 'Required', 'Required', 'Required (Cat A) · Optional (Cat B)'],
              ['Long-term (2050)', 'Route-dependent', 'Optional', 'Optional'],
            ])}
          <p class="op-fine">A combined net-zero target is optional for everyone (C17).</p>`),

        section('Delivery is graded — the mitigation hierarchy (C21–C26)', ladder([
          { n: 1, tier: 'Activity level', title: 'Cut at source', text: 'Efficiency, fuel switching, behind-the-meter generation, supplier & customer engagement.', earns: 'Company-level reduction — lands in your inventory.' },
          { n: 2, tier: 'Activity pools', title: 'Act within shared systems', text: 'Grids, supply sheds, logistics — PPAs, EACs, mass-balance, book & claim.', earns: 'System-contribution claim, reported separately.' },
          { n: 3, tier: 'Sector level', title: 'Only while constrained', text: 'Requires a documented structural constraint — never cost or preference.', earns: 'System-contribution claim — never a substitute for cuts.' },
        ])),

        section('Prove it — say only what you can show (C36–C37)', `
          <p class="op-fine">Annual progress reports in years 1–4; an End-of-Cycle Assessment in year 5 reissues your status. Three claim types, each with its own evidence bar:</p>
          ${table(
            ['Claim', 'Basis'],
            [
              ['Emissions reduction', 'A change in your physical GHG inventory vs base year (strongest)'],
              ['Net-zero alignment', 'Activity-level actions producing measurable change'],
              ['System contribution', 'Activity-pool / sector actions — outside the inventory'],
            ])}
          <p class="op-fine">A single missed milestone isn't fatal if you explain it and adjust the plan — but persistent, unexplained underperformance can mean a downgrade or removal from the dashboard.</p>`),

        callout('teal', 'On your radar for 2035', 'Ongoing Emissions Responsibility is voluntary now (Engaged/Advanced/Leadership tiers) — but from 2035, supporting eligible removals becomes mandatory, from 1% of ongoing emissions rising to 100% by your net-zero year.'),
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
        `<p class="op-lede">V2.0 moves net-zero out of the sustainability function and into the boardroom. It grades <strong>how</strong> you decarbonise, puts a <strong>price</strong> on what you haven't, and lets the SBTi <strong>downgrade or remove</strong> companies that under-deliver.</p>`,

        stats([
          { big: 'Board', label: 'your highest governing body is now formally accountable (C1)' },
          { big: '$20–$80', label: 'per tCO₂e — the cost of ongoing-emissions responsibility' },
          { big: '2050', label: 'net-zero deadline: residuals ~10%, 100% neutralised yearly' },
        ]),

        section('Four things that change the risk picture', `
          <div class="op-keypoints">
            <div class="op-kp"><h5>1 · The board is on the hook (C1)</h5><p>Accountability for the targets sits with the highest governing body — explicit governance, not delegated sign-off.</p></div>
            <div class="op-kp"><h5>2 · The transition plan is a strategy document (C2.3)</h5><p>It must be aligned to — or built into — corporate strategy, board-approved, and reviewed ≥ every 5 years. Unabated-fossil revenue needs a phase-out commitment. Not a CSR appendix.</p></div>
            <div class="op-kp"><h5>3 · Delivery is earned, not bought (C21–C23)</h5><p>Cut at source first; every step down the hierarchy must be justified by a structural constraint. Offsetting your way to a reduction claim is gone.</p></div>
            <div class="op-kp"><h5>4 · Claims are policed (C37)</h5><p>You may say only what the End-of-Cycle Assessment shows. Persistent under-delivery → status downgrade or removal from the public dashboard. Reputational exposure is now structural.</p></div>
          </div>`),

        section('It has a price — Ongoing Emissions Responsibility', `
          ${costTiers()}
          <p class="op-fine">Voluntary tiers today; from 2035, supporting eligible removals is mandatory — 1% of ongoing emissions rising linearly to 100% by your net-zero year. Budget for it now; it builds the removals capacity you'll need at the finish line.</p>`),

        section('The clock to 2050', dates([
          { when: '11 Jun 2026', what: 'V2.0 published', tone: 'teal' },
          { when: '1 Feb 2027', what: 'V2.0 effective — pre-existing power contracts grandfathered from here', tone: 'teal' },
          { when: 'End 2027', what: 'V1 closes to new targets', tone: 'gray' },
          { when: 'From 2028', what: 'First cohort renews — 2030–2035 targets set under V2.0', tone: 'teal' },
          { when: '2035', what: 'Ongoing-responsibility removals phase in; hourly-matching bar hits 90%', tone: 'amber' },
          { when: 'By 2050', what: 'Net-zero: residuals ~10% or less, 100% neutralised with removals', tone: 'amber' },
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
        <p class="kicker">CNZS V2.0 · One-pager</p>
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
