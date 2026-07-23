/* =========================================================================
   SBTi "Net-Zero Loop" — official roadmap one-pager
   An interactive recreation of SBTi's "Corporate Net-Zero Standard V2.0:
   How to set targets" flowchart (June 2026). Rendered as the 4th option in
   the one-pager chooser (assets/one-pager.js imports ROADMAP_ROLE).
   Clicking a flowchart node opens a small context bubble with a
   plain-English note and a deep link into the matching chapter on the page.
   ========================================================================= */

/* ---- node factory ----
   key: 'all'  — applies to all companies        (teal fill)
        'cata' — required Cat A, optional Cat B  (amber fill)
        'opt'  — optional for the company        (dashed outline)
   teaser present → clickable node with a bubble; absent → static box.
   anchor present → bubble gets a "Read the full section →" link. */
const N = (id, text, key, teaser, anchor) => ({ id, text, key, teaser, anchor });

/* ---- flowchart data, stage by stage, mirroring the PDF ---- */

const STAGES = [
  {
    id: 'cycle',
    name: 'Target cycle',
    intro: 'New companies register, optionally commit, and submit targets for validation. Companies with validated v1 targets re-register and renew under V2.0. Once validated: implement, report annually, then an end-of-cycle assessment — every five years.',
    rows: [
      { q: 'Where is your company in its science-based target journey?' },
      { branch: [
        { label: 'New company enters CNZS V2.0', rows: [
          { node: N('cycle-register', 'Company registers to understand if classified as Category A or Category B', 'all',
            'Category A or B is set by size and geography — large companies anywhere, plus medium-sized companies in high-income countries, are Category A. Category A means mandatory scope 3 near-term targets and third-party assurance; Category B gets a lighter regime.', '#category') },
          { node: N('cycle-commitment', 'Company may publicly communicate its intent to set science-based targets at this stage', 'opt',
            'A commitment is a formal, public expression of intent to submit targets for validation within 24 months, displayed on the SBTi Target Dashboard. Optional — but once made, the clock is real.', '#timeline') },
          { node: N('cycle-sector', 'Identify whether any SBTi Sector Standard or guidance applies', 'all',
            'Where an SBTi Sector Standard modifies or supersedes Corporate Net-Zero Standard requirements for certain activities, the Sector Standard governs those emissions sources. Check the sector list before designing targets.') },
          { node: N('cycle-submit', 'Company submits targets for validation (ahead of the commitment deadline if a commitment was made)', 'all',
            'V2 becomes effective 1 February 2027 and v1 closes to new targets at the end of 2027. If you made a commitment, submission is due before its 24-month deadline.', '#timeline') },
        ] },
        { label: 'Existing company with validated targets', rows: [
          { node: N('cycle-reregister', 'Company re-registers to determine if classified as Category A or Category B', 'all',
            'Transitioning companies re-run the categorization under V2.0 — size and geography decide Category A or B, and with it whether scope 3 targets and assurance become mandatory.', '#category') },
          { node: N('cycle-resubmit', 'Company submits new targets under CNZS V2.0 — up to 24 months before, and no later than 12 months after, the end of the current target timeframe', 'all',
            'Renewal has a window: −24 to +12 months around the end of your validated targets’ timeframe. The first big cohort renews from 2028, setting 2030–2035 targets under V2.', '#timeline') },
        ] },
      ] },
    ],
  },

  {
    id: 'found',
    name: 'Foundations',
    intro: 'Before any target: pick the base year, fix the organizational boundary, and account the GHG inventory. Category A companies add third-party assurance.',
    rows: [
      { node: N('found-baseyear', 'Company selects the most recent year as its near-term target base year', 'all',
        'The base year rolls: each cycle you pick the most recent year with comprehensive data — a continuation, not a reset. Near-term targets run five years; long-term and net-zero targets land by 2050 at the latest.', '#baseline') },
      { node: N('found-consolidation', 'Choose the consolidation approach for your organizational boundary, based on the GHG Protocol (equity, financial or operational control, or as required by regulation)', 'all',
        'Your organizational boundary follows the GHG Protocol — equity share, financial control or operational control, or the boundary a regulation compels. It fixes which emissions are “yours” for the whole cycle.', '#baseline') },
      { node: N('found-inventory', 'Account and report your base year GHG inventory, together with the associated base year metrics', 'all',
        'The inventory is drawn up in line with GHG Protocol standards, alongside the base-year metrics that targets are then built on.', '#baseline') },
      { node: N('found-assurance', 'Category A: obtain third-party assurance for the GHG inventory, low-carbon electricity calculations, scope 3 emissions from significant EIAs, and target-setting metrics', 'cata',
        'Category A companies need limited third-party assurance over the base-year inventory, low-carbon electricity calculations, scope 3 emissions from significant emissions-intensive activities, and the metrics used for target setting.', '#baseline') },
    ],
  },

  {
    id: 'select',
    name: 'Target selection',
    intro: 'Net-zero targets are optional. Setting one commits you to near-term and long-term targets across all scopes; without one, scope 1 and 2 near-term targets are the universal minimum, and Category A adds scope 3.',
    rows: [
      { q: 'Determine whether your company wants to set a net-zero target' },
      { branch: [
        { label: 'Net-zero target is set', rows: [
          { node: N('sel-nz', 'Near-term and long-term targets are required over 100% of scope 1, 2 and 3 emissions, and residual emissions are neutralized', 'all',
            'A net-zero target means reducing all scopes to residual levels by 2050 or sooner, then neutralizing what remains with eligible removals. It pulls near-term and long-term targets across scopes 1, 2 and 3 into scope.', '#category') },
        ] },
        { label: 'Net-zero target is not set', rows: [
          { node: N('sel-s12', 'All companies are required to set scope 1 and scope 2 near-term targets', 'all',
            'Scope 1 and 2 near-term targets are the universal minimum — every company, both categories, every cycle.', '#category') },
          { node: N('sel-s3', 'Category A companies are required to set scope 3 near-term targets', 'cata',
            'Scope 3 near-term targets are mandatory for Category A. The boundary is decided by the 5% significance test, category by category.', '#scope-3') },
          { node: N('sel-s1lt', 'Category A companies using the emissions intensity and/or asset transition methods are required to set scope 1 long-term targets', 'cata',
            'The intensity and asset-transition routes buy flexibility now, at a cost: a long-term scope 1 target, and transition-plan publication at validation.', '#scope-1') },
          { node: N('sel-ltopt', 'Scope 2 and 3 long-term targets may be optionally set', 'opt',
            'Without a net-zero target, long-term scope 2 and 3 targets stay optional — though many companies add them anyway to anchor the 2050 trajectory.', '#category') },
        ] },
      ] },
    ],
  },

  {
    id: 's1',
    name: 'Scope 1 target setting',
    intro: 'Three routes, all converging on net-zero by 2050 at the latest: a straight-line absolute cut, sector-pathway intensity, or an asset-transition plan for lumpy capital stock.',
    rows: [
      { node: N('s1-tool', 'Use the SBTi target-setting tool to enter target base year scope 1 emissions (total or broken down by activity)') },
      { q: 'Choose your scope 1 near-term target' },
      { branch: [
        { rows: [ { node: N('s1-absolute', 'Absolute emissions reduction — calculated from base year emissions along a linear trajectory to net-zero', 'all',
          'A straight line from your base year to net-zero by 2050 at the latest, calculated in the SBTi tool. Simple to communicate, unforgiving to deliver.', '#scope-1') } ] },
        { rows: [ { node: N('s1-asset', 'Asset transition target — based on science-based milestones and/or a science-based carbon budget', 'all',
          'For capital stock that doesn’t decarbonize linearly: phase-out milestones for assets and/or a science-based carbon budget. Comes with transition-plan publication at validation.', '#scope-1') } ] },
        { rows: [ { node: N('s1-intensity', 'Emissions intensity reduction — calculated via the SBTi tool from sector-specific pathways', 'all',
          'Emissions per unit of output, following sector-specific decarbonization pathways. Category A companies choosing this route also owe a long-term scope 1 target.', '#scope-1') } ] },
      ] },
    ],
  },

  {
    id: 's2',
    name: 'Scope 2 target setting',
    intro: 'Two target forms — low-carbon electricity alignment and/or an absolute cut — plus an optional hourly-matching recognition program. Heat, steam and cooling always need an absolute target.',
    rows: [
      { node: N('s2-tool', 'Use the SBTi tool to enter base year scope 2 location-based emissions from electricity and heat, steam and cooling, together with the low-carbon share of electricity consumption') },
      { q: 'Choose your scope 2 near-term target(s)' },
      { node: N('s2-growth', 'Category A companies with high electricity demand growth are required to set an absolute emissions reduction target at a minimum', 'cata',
        'If projected average annual electricity consumption growth exceeds 20% over the target cycle, an absolute scope 2 target is required — an LCE alignment target can only come on top.', '#s2-target-options') },
      { branch: [
        { rows: [ { node: N('s2-lce', 'Low-carbon electricity alignment — targeted low-carbon share calculated using the SBTi tool', 'all',
          'An LCE target grows the share of low-carbon sourced and matched electricity, with the target share calculated by the SBTi tool. Instruments must meet V2 quality and deliverability rules.', '#s2-target-options') } ] },
        { rows: [ { node: N('s2-abs', 'Absolute emissions reduction — calculated from base year emissions along a linear trajectory', 'all',
          'A linear reduction of scope 2 emissions from the base year. Emissions from heat, steam and cooling must be covered by an absolute target either way.', '#s2-target-options') } ] },
      ] },
      { node: N('s2-hourly', 'Optional scope 2 hourly matching recognition program', 'opt',
        'Match consumption with low-carbon power hour by hour — 50% until 2030, 75% until 2035, 90% from 2035 — and earn recognition on the Target Dashboard. Category A companies must report hourly matching for electricity pools ≥10 GWh/year.', '#s2-hourly-matching') },
    ],
  },

  {
    id: 's3',
    name: 'Scope 3 target setting',
    intro: 'Categories individually ≥5% of scope 3 are “significant” and must be covered. Then pick your levers: an overarching absolute target, supplier/customer alignment, and/or category-specific methods that differ upstream vs downstream.',
    rows: [
      { node: N('s3-tool', 'Use the SBTi tool to enter base year scope 3 emissions and identify significant categories — those individually representing 5% or more of total scope 3 (categories 1–14)', 'all',
        'Any scope 3 category individually representing 5% or more of the total is “significant” and must sit inside the target boundary. This replaces v1’s two-thirds coverage rule.', '#scope-3') },
      { node: N('s3-exclusions', 'Optionally exclude eligible scope 3 activities from the target boundary, e.g. second-hand goods, employee commuting', 'opt',
        'Certain activities can be excluded regardless of size — but each exclusion must be reported with its condition, its volume in absolute and percentage terms, and how you intend to mitigate those emissions anyway.', '#scope-3') },
      { q: 'Choose your scope 3 near-term target(s) — one or a combination of methods to cover significant categories' },
      { branch: [
        { rows: [ { node: N('s3-abs', 'Overarching scope 3 absolute emissions reduction target', 'all',
          'One absolute reduction target across the whole scope 3 boundary — the bluntest instrument, and the easiest to explain.', '#scope-3') } ] },
        { rows: [ { node: N('s3-align', 'Overarching supplier / customer alignment target', 'all',
          'Commit a share of Tier 1 suppliers or customers to set science-based targets of their own. Alignment shifts the work into the value chain.', '#scope-3') } ] },
        { rows: [ { node: N('s3-specific', 'Category- or activity-specific targets', 'all',
          'Tailored methods per category or activity, with options differing upstream vs downstream and by whether sector pathways exist. Same-method targets can be aggregated.', '#scope-3') } ] },
      ] },
      { tree: true },
      { node: N('s3-headline', 'Headline ambition — scope 3 targets may be aggregated into a single figure for communication purposes', 'opt',
        'Multiple scope 3 targets may be rolled into one headline ambition figure — for communication only, not for assessment.', '#scope-3') },
    ],
  },

  {
    id: 'oer',
    name: 'Ongoing emissions responsibility',
    intro: 'A voluntary recognition program for taking responsibility for the emissions you still cause on the way to net-zero — at Engaged, Advanced or Leadership level. Opting out requires a justification.',
    rows: [
      { bridge: 'Once targets are set…' },
      { q: 'Does the company take part in the optional Ongoing Emissions Responsibility program?' },
      { branch: [
        { label: 'Yes', rows: [
          { node: N('oer-calc', 'Calculate indicative emissions in MtCO₂ using the SBTi target tool, to inform level selection', 'opt',
            'The tool estimates ongoing emissions over the target period from your base year and submitted pathways — indicative only; the OER assessment uses actual out-turn at the end of the timeframe.', '#oer') },
          { node: N('oer-choose', 'Choose your ongoing emissions responsibility level for the next target timeframe') },
          { chips: [
            N('oer-engaged', 'Engaged', 'opt', 'Cover at least 1% of ongoing scope 1, 2 and 3 emissions — the entry level, with no mandated carbon price.', '#oer'),
            N('oer-advanced', 'Advanced', 'opt', 'Cover 100% of scope 1 + 2 and at least 10% of total ongoing emissions, with a $20/tCO₂e contribution-budget option.', '#oer'),
            N('oer-leadership', 'Leadership', 'opt', 'Cover 100% of ongoing emissions, delivered through a contribution budget at $80/tCO₂e.', '#oer'),
          ] },
          { node: N('oer-approach', 'Choose one approach for delivering climate contributions: support verified mitigation outcomes, or establish and use a contribution budget', 'opt',
            'Two delivery routes: support verified mitigation outcomes equal in volume to the covered emissions, or establish a contribution budget priced at the relevant level. Leadership companies use the budget route.', '#oer') },
        ] },
        { label: 'No', rows: [
          { node: N('oer-justify', 'Provide justification for not taking part in the program', 'all',
            'Opting out is allowed, but not silently — companies provide a justification for not taking part in the program.', '#oer') },
          { node: N('oer-2035', 'From 2035, Category A companies take responsibility for at least 1% of ongoing emissions, rising linearly to 100% by the net-zero year', 'cata',
            'From 2035, Category A companies are expected to support eligible carbon removals covering at least 1% of ongoing emissions, rising linearly to 100% by the net-zero year and no later than 2050.', '#oer') },
        ] },
      ] },
    ],
  },

  {
    id: 'impl',
    name: 'Implementation hierarchy',
    intro: 'Delivery is graded: cut at the source first, act within shared systems second, and reach for sector-level instruments only where a documented structural constraint blocks anything closer.',
    rows: [
      { bridge: 'Company then determines its target implementation actions, in line with the implementation hierarchy' },
      { node: N('impl-activity', 'Activity level — prioritize action that directly targets the emissions sources in the inventory: reduced energy consumption, fuel switching, lower-carbon input materials', 'all',
        'Cut at the source first: efficiency, fuel switching, lower-carbon inputs, supplier and customer engagement. Only activity-level action lands in your own inventory as a reduction.', '#implement') },
      { bridge: 'Where emissions arise within an activity pool…' },
      { node: N('impl-pool', 'Activity pool level — act within the pool the activity arises from (electricity grids, supply sheds, logistics networks), e.g. commodity certificates from the pool, supply-shed measures', 'all',
        'Where emissions arise in shared systems — grids, supply sheds, logistics networks — you may act within that pool: deliverable PPAs, EACs, supply-shed measures, all meeting integrity criteria. This earns a system-contribution claim, reported separately.', '#implement') },
      { bridge: 'Where structural constraints prevent action at the activity or activity pool level…' },
      { node: N('impl-sector', 'Sector level — act at sector level and document constraints (early-stage technology, infrastructure, regulatory, supply), e.g. commodity certificates from the same system', 'all',
        'Sector-level instruments are a last resort: a documented structural constraint is required, and the action must complement — never substitute for — more direct cuts.', '#implement') },
    ],
  },
];

/* Scope 3 category/activity-specific method tree (bespoke row) */
const S3_TREE = {
  groups: [
    {
      label: 'Upstream categories',
      subs: [
        { label: 'Covered by sector-specific pathways', chips: [
          N('s3-up-red', 'Emissions reduction', 'all', 'An absolute or intensity reduction target following the commodity’s sector-specific pathway.', '#scope-3'),
          N('s3-up-sup', 'Supplier alignment', 'all', 'A growing share of Tier 1 suppliers with science-based targets of their own.', '#scope-3'),
          N('s3-up-vol', 'Volume alignment', 'all', 'Grow the share of low-carbon aligned purchased commodities or transport.', '#scope-3'),
        ] },
        { label: 'Not covered by sector-specific pathways', chips: [
          N('s3-upn-red', 'Emissions reduction', 'all', 'An emissions reduction target in absolute terms, where no sector-specific pathway exists.', '#scope-3'),
          N('s3-upn-sup', 'Supplier alignment', 'all', 'Tier 1 supplier alignment — suppliers setting science-based targets of their own.', '#scope-3'),
        ] },
      ],
    },
    {
      label: 'Downstream categories',
      subs: [
        { label: 'Method options', chips: [
          N('s3-dn-red', 'Emissions reduction', 'all', 'An emissions reduction target for downstream emissions, in absolute or intensity terms.', '#scope-3'),
          N('s3-dn-cust', 'Customer alignment', 'all', 'A growing share of Tier 1 customers with science-based targets of their own.', '#scope-3'),
          N('s3-dn-use', 'Product use alignment', 'all', 'Increase the share of low/zero-carbon aligned sold products (category 11). A narrow fallback exists if no downstream option can reasonably be applied.', '#scope-3'),
          N('s3-dn-eol', 'Product end-of-life alignment', 'all', 'Increase the share of products designed with a circular end of life.', '#scope-3'),
        ] },
      ],
    },
  ],
};

/* ---- node index for bubble lookup ---- */

const NODE_INDEX = new Map();
(function indexNodes() {
  const add = (n) => { if (n && n.teaser) NODE_INDEX.set(n.id, n); };
  STAGES.forEach((s) => s.rows.forEach((row) => {
    add(row.node);
    (row.chips || []).forEach(add);
    (row.branch || []).forEach((col) => col.rows.forEach((r) => {
      add(r.node);
      (r.chips || []).forEach(add);
    }));
  }));
  S3_TREE.groups.forEach((g) => g.subs.forEach((sub) => sub.chips.forEach(add)));
})();

/* ---- renderers (HTML strings, same contract as one-pager build()) ---- */

function nodeHtml(n, compact) {
  const key = n.key || 'all';
  const cls = `op-node op-node--${key}${compact ? ' op-node--method' : ''}`;
  if (!n.teaser) return `<span class="${cls} op-node--static">${n.text}</span>`;
  return `<button type="button" class="${cls}" data-node="${n.id}" aria-expanded="false">
    ${n.text}<span class="op-node-go" aria-hidden="true">+</span></button>`;
}

function rowHtml(row) {
  if (row.q) return `<div class="op-flow-item"><p class="op-node op-node--q">${row.q}</p></div>`;
  if (row.bridge) return `<div class="op-flow-item op-flow-item--bridge"><p class="op-flow-bridge">${row.bridge}</p></div>`;
  if (row.node) return `<div class="op-flow-item">${nodeHtml(row.node)}</div>`;
  if (row.chips) return `<div class="op-flow-item"><div class="op-chip-row">${row.chips.map((c) => nodeHtml(c, true)).join('')}</div></div>`;
  if (row.branch) return `
    <div class="op-flow-item op-flow-branch" style="--cols:${row.branch.length}">
      <span class="op-branch-bar" aria-hidden="true"></span>
      ${row.branch.map((col) => `
        <div class="op-flow-col">
          ${col.label ? `<p class="op-flow-col-label">${col.label}</p>` : ''}
          ${col.rows.map(rowHtml).join('')}
        </div>`).join('')}
    </div>`;
  if (row.tree) return `
    <div class="op-flow-item op-tree">
      ${S3_TREE.groups.map((g) => `
        <div class="op-tree-group">
          <p class="op-flow-col-label">${g.label}</p>
          ${g.subs.map((sub) => `
            <div class="op-tree-sub">
              <p class="op-tree-sub-label">${sub.label}</p>
              <div class="op-chip-row">${sub.chips.map((c) => nodeHtml(c, true)).join('')}</div>
            </div>`).join('')}
        </div>`).join('')}
    </div>`;
  return '';
}

function renderRoadmap() {
  return `
    <p class="op-lede">This is the SBTi’s own “How to set targets” roadmap (June 2026), rebuilt as an
      interactive map. Every stage mirrors the official flowchart — tap any step marked
      <span class="op-node-go op-node-go--inline" aria-hidden="true">+</span> for a plain-English note and a
      shortcut to the chapter on this page that covers it in depth.</p>
    <div class="op-key" role="note">
      <span class="op-key-item"><span class="op-key-swatch op-key-swatch--all"></span>Applies to all companies</span>
      <span class="op-key-item"><span class="op-key-swatch op-key-swatch--cata"></span>Required for Category A, optional for Category B</span>
      <span class="op-key-item"><span class="op-key-swatch op-key-swatch--opt"></span>Optional for the company</span>
    </div>
    <div class="op-flow">
      ${STAGES.map((s) => `
        <section class="op-stage op-stage--${s.id}">
          <div class="op-stage-rail">
            <h3 class="op-stage-name">${s.name}</h3>
            <p class="op-stage-intro">${s.intro}</p>
          </div>
          <div class="op-stage-flow">${s.rows.map(rowHtml).join('')}</div>
        </section>`).join('')}
    </div>`;
}

/* ---- context bubble (one element, reused for every node) ---- */

let popEl = null;
let activeBtn = null;
let navigateCb = null;

function closePop() {
  if (popEl) popEl.hidden = true;
  if (activeBtn) { activeBtn.setAttribute('aria-expanded', 'false'); activeBtn = null; }
}

/* Escape coordination: one-pager.js calls this first, so Escape closes the
   bubble before stepping back to the chooser. Returns true if it closed one. */
export function dismissRoadmapPopover() {
  if (popEl && !popEl.hidden && document.contains(popEl)) { closePop(); return true; }
  return false;
}

function openPop(btn, sheet) {
  const node = NODE_INDEX.get(btn.dataset.node);
  if (!node) return;
  closePop();

  popEl.querySelector('.op-pop-text').textContent = node.teaser;
  const link = popEl.querySelector('.op-pop-link');
  if (node.anchor) {
    link.hidden = false;
    link.href = node.anchor;
  } else {
    link.hidden = true;
  }

  /* Position inside the sheet (position:relative): the overlay is the scroll
     container and the bubble scrolls with the content, so no scroll listeners
     are needed. Measure invisibly, then place below the node — or above when
     the viewport bottom is too close. */
  popEl.hidden = false;
  popEl.style.visibility = 'hidden';
  const sheetRect = sheet.getBoundingClientRect();
  const nodeRect = btn.getBoundingClientRect();
  const popW = Math.min(340, sheetRect.width - 16);
  popEl.style.width = popW + 'px';
  const popH = popEl.offsetHeight;

  const centerX = nodeRect.left + nodeRect.width / 2 - sheetRect.left;
  const left = Math.max(8, Math.min(centerX - popW / 2, sheetRect.width - popW - 8));
  const below = nodeRect.bottom + popH + 24 <= window.innerHeight || nodeRect.top - popH - 16 < 0;
  const top = below
    ? nodeRect.bottom - sheetRect.top + 12
    : nodeRect.top - sheetRect.top - popH - 12;

  popEl.classList.toggle('op-pop--above', !below);
  popEl.style.left = left + 'px';
  popEl.style.top = top + 'px';
  popEl.querySelector('.op-pop-arrow').style.left = (centerX - left) + 'px';
  popEl.style.visibility = '';

  activeBtn = btn;
  btn.setAttribute('aria-expanded', 'true');
}

/* Close on any click that lands outside the bubble and off the nodes.
   Registered once at module scope; popEl is recreated per enhance() call
   (the sheet's innerHTML wipe destroys the previous one). */
document.addEventListener('click', (e) => {
  if (!popEl || popEl.hidden || !document.contains(popEl)) return;
  if (e.target.closest('.op-pop') || e.target.closest('.op-node[data-node]')) return;
  closePop();
});

/* ---- wiring, called by one-pager.js after the sheet HTML is injected ---- */

export function enhanceRoadmap(sheet, { onNavigate } = {}) {
  navigateCb = onNavigate || null;

  popEl = document.createElement('div');
  popEl.className = 'op-pop';
  popEl.setAttribute('role', 'note');
  popEl.hidden = true;
  popEl.innerHTML = `
    <span class="op-pop-arrow" aria-hidden="true"></span>
    <button type="button" class="op-pop-close" aria-label="Close note">×</button>
    <p class="op-pop-text"></p>
    <a class="op-pop-link" href="#">Read the full section →</a>`;
  sheet.appendChild(popEl);

  popEl.addEventListener('click', (e) => {
    if (e.target.closest('.op-pop-close')) { closePop(); return; }
    const link = e.target.closest('.op-pop-link');
    if (link && navigateCb) {
      e.preventDefault();
      const anchor = link.getAttribute('href');
      closePop();
      navigateCb(anchor);
    }
  });

  /* Delegate on .op-flow (destroyed with the sheet's innerHTML on re-render,
     so no listener accumulation on the persistent #opSheet element). */
  const flow = sheet.querySelector('.op-flow');
  flow?.addEventListener('click', (e) => {
    const btn = e.target.closest('.op-node[data-node]');
    if (!btn) return;
    if (btn === activeBtn && !popEl.hidden) closePop();
    else openPop(btn, sheet);
  });
}

/* ---- the chooser entry (same shape as a ROLES item) ---- */

export const ROADMAP_ROLE = {
  id: 'roadmap',
  label: 'Official roadmap',
  role: 'The official SBTi roadmap',
  tag: '“How to set targets” — the Standard’s own flowchart, made interactive',
  icon: '<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4"/><path d="M12 12H6v4"/><path d="M12 12h6v4"/>',
  accent: 'teal',
  build: renderRoadmap,
  enhance: enhanceRoadmap,
};
