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
    intro: 'New companies register, optionally commit, then submit targets for validation. Companies already holding validated v1 targets re-register and renew under V2.0. Once your targets are validated, you implement, report every year, and face an end-of-cycle assessment — a cycle that turns every five years.',
    rows: [
      { q: 'Where is your company in its science-based target journey?' },
      { branch: [
        { label: 'New company enters CNZS V2.0', rows: [
          { node: N('cycle-register', 'Company registers to learn whether it lands in Category A or Category B', 'all',
            'Size and geography set your category: large companies anywhere, plus medium-sized companies in high-income countries, land in Category A. Category A carries mandatory scope 3 near-term targets and third-party assurance; Category B carries a lighter regime.', '#category') },
          { node: N('cycle-commitment', 'Company may publicly announce its intent to set science-based targets here', 'opt',
            'A commitment formally and publicly pledges to submit targets for validation within 24 months, and it shows on the SBTi Target Dashboard. Optional — but once you make it, the clock is real.', '#timeline') },
          { node: N('cycle-sector', 'Check whether any SBTi Sector Standard or guidance applies', 'all',
            'Where an SBTi Sector Standard modifies or supersedes Corporate Net-Zero Standard requirements for certain activities, that Sector Standard governs those emissions sources. Check the sector list before you design targets.') },
          { node: N('cycle-submit', 'Company submits targets for validation (before the commitment deadline, if one was made)', 'all',
            'V2 takes effect on 1 February 2027, and v1 closes to new targets at the end of 2027. If you committed, you must submit before the 24-month deadline.', '#timeline') },
        ] },
        { label: 'Existing company with validated targets', rows: [
          { node: N('cycle-reregister', 'Company re-registers to confirm whether it is Category A or Category B', 'all',
            'Transitioning companies re-run the categorization under V2.0: size and geography decide Category A or B, and with it whether scope 3 targets and assurance turn mandatory.', '#category') },
          { node: N('cycle-resubmit', 'Company submits new targets under CNZS V2.0 — up to 24 months before, and no later than 12 months after, the end of the current target timeframe', 'all',
            'Renewal opens a window: from 24 months before to 12 months after your validated targets’ timeframe ends. The first big cohort renews from 2028, setting 2030–2035 targets under V2.', '#timeline') },
        ] },
      ] },
    ],
  },

  {
    id: 'found',
    name: 'Foundations',
    intro: 'Before any target, pick the base year, fix the organizational boundary, and account for the GHG inventory. Category A companies add third-party assurance.',
    rows: [
      { node: N('found-baseyear', 'Company selects the most recent year as its near-term target base year', 'all',
        'The base year rolls forward: each cycle you pick the most recent year with comprehensive data — a continuation, not a reset. Near-term targets run five years; long-term and net-zero targets land by 2050 at the latest.', '#baseline') },
      { node: N('found-consolidation', 'Choose the consolidation approach for your organizational boundary, based on the GHG Protocol (equity, financial or operational control, or as required by regulation)', 'all',
        'Your organizational boundary follows the GHG Protocol: equity share, financial control, operational control, or whatever a regulation compels. It fixes which emissions count as “yours” for the whole cycle.', '#baseline') },
      { node: N('found-inventory', 'Account and report your base year GHG inventory, together with the associated base year metrics', 'all',
        'You draw up the inventory to GHG Protocol standards, alongside the base-year metrics your targets then build on.', '#baseline') },
      { node: N('found-assurance', 'Category A: obtain third-party assurance for the GHG inventory, low-carbon electricity calculations, scope 3 emissions from significant EIAs, and target-setting metrics', 'cata',
        'Category A companies must obtain limited third-party assurance over the base-year inventory, the low-carbon electricity calculations, scope 3 emissions from significant emissions-intensive activities, and the metrics behind target setting.', '#baseline') },
    ],
  },

  {
    id: 'select',
    name: 'Target selection',
    intro: 'A net-zero target is your choice. Choose one and you owe near-term and long-term targets across every scope; skip it and scope 1 and 2 near-term targets become the floor, with Category A adding scope 3.',
    rows: [
      { q: 'Decide whether your company will set a net-zero target' },
      { branch: [
        { label: 'Net-zero target is set', rows: [
          { node: N('sel-nz', 'Near-term and long-term targets are required over 100% of scope 1, 2 and 3 emissions, and residual emissions are neutralized', 'all',
            'A net-zero target commits you to cut every scope to residual levels by 2050 or sooner, then neutralize what remains with eligible removals. It pulls near-term and long-term targets across scopes 1, 2 and 3 into scope.', '#category') },
        ] },
        { label: 'Net-zero target is not set', rows: [
          { node: N('sel-s12', 'All companies are required to set scope 1 and scope 2 near-term targets', 'all',
            'Every company sets scope 1 and 2 near-term targets — both categories, every cycle, no exceptions.', '#category') },
          { node: N('sel-s3', 'Category A companies are required to set scope 3 near-term targets', 'cata',
            'Scope 3 near-term targets are mandatory for Category A. The 5% significance test then sets the boundary, category by category.', '#scope-3') },
          { node: N('sel-s1lt', 'Category A companies using the emissions intensity and/or asset transition methods are required to set scope 1 long-term targets', 'cata',
            'Pick the intensity or asset-transition route and you gain flexibility today, but you owe two things in return: a long-term scope 1 target, and a transition plan published at validation.', '#scope-1') },
          { node: N('sel-ltopt', 'Scope 2 and 3 long-term targets may be optionally set', 'opt',
            'Skip the net-zero target and long-term scope 2 and 3 targets remain yours to take or leave — yet many companies set them regardless, anchoring the trajectory to 2050.', '#category') },
        ] },
      ] },
    ],
  },

  {
    id: 's1',
    name: 'Scope 1 target setting',
    intro: 'Three routes lead to the same place — net-zero by 2050 at the latest: a straight-line absolute cut, an intensity target on a sector pathway, or an asset-transition plan for lumpy capital stock.',
    rows: [
      { node: N('s1-tool', 'Use the SBTi target-setting tool to enter target base year scope 1 emissions (total or broken down by activity)') },
      { q: 'Choose your scope 1 near-term target' },
      { branch: [
        { rows: [ { node: N('s1-absolute', 'Absolute emissions reduction — calculated from base year emissions along a linear trajectory to net-zero', 'all',
          'The SBTi tool draws a straight line from your base year down to net-zero by 2050 at the latest. Easy to explain, hard to hit.', '#scope-1') } ] },
        { rows: [ { node: N('s1-asset', 'Asset transition target — based on science-based milestones and/or a science-based carbon budget', 'all',
          'When capital stock refuses to decarbonize in a straight line, you set asset phase-out milestones and/or a science-based carbon budget instead. The price of entry: a transition plan published at validation.', '#scope-1') } ] },
        { rows: [ { node: N('s1-intensity', 'Emissions intensity reduction — calculated via the SBTi tool from sector-specific pathways', 'all',
          'You target emissions per unit of output, tracking your sector’s decarbonization pathway. Choose this route as a Category A company and a long-term scope 1 target comes attached.', '#scope-1') } ] },
      ] },
    ],
  },

  {
    id: 's2',
    name: 'Scope 2 target setting',
    intro: 'You have two target forms to combine — low-carbon electricity alignment and/or an absolute cut — with an optional hourly-matching recognition program on top. Whatever you choose, heat, steam and cooling always need an absolute target.',
    rows: [
      { node: N('s2-tool', 'Use the SBTi tool to enter base year scope 2 location-based emissions from electricity and heat, steam and cooling, together with the low-carbon share of electricity consumption') },
      { q: 'Choose your scope 2 near-term target(s)' },
      { node: N('s2-growth', 'Category A companies with high electricity demand growth are required to set an absolute emissions reduction target at a minimum', 'cata',
        'When projected average annual electricity consumption grows more than 20% over the target cycle, an absolute scope 2 target becomes mandatory — an LCE alignment target can only sit on top.', '#s2-target-options') },
      { branch: [
        { rows: [ { node: N('s2-lce', 'Low-carbon electricity alignment — targeted low-carbon share calculated using the SBTi tool', 'all',
          'An LCE target grows the share of low-carbon electricity you source and match, and the SBTi tool sets the target share. Instruments must meet V2 quality and deliverability rules.', '#s2-target-options') } ] },
        { rows: [ { node: N('s2-abs', 'Absolute emissions reduction — calculated from base year emissions along a linear trajectory', 'all',
          'A straight-line cut of scope 2 emissions from the base year. Either way, heat, steam and cooling need coverage by an absolute target.', '#s2-target-options') } ] },
      ] },
      { node: N('s2-hourly', 'Optional scope 2 hourly matching recognition program', 'opt',
        'Match your consumption to low-carbon power hour by hour — 50% until 2030, 75% until 2035, 90% from 2035 — and the Target Dashboard recognizes it. Category A companies must report hourly matching for any electricity pool ≥10 GWh/year.', '#s2-hourly-matching') },
    ],
  },

  {
    id: 's3',
    name: 'Scope 3 target setting',
    intro: 'Any category worth ≥5% of scope 3 on its own counts as “significant” and has to be covered. From there you pick your levers: an overarching absolute target, supplier or customer alignment, and/or category-specific methods that split upstream from downstream.',
    rows: [
      { node: N('s3-tool', 'Use the SBTi tool to enter base year scope 3 emissions and identify significant categories — those individually representing 5% or more of total scope 3 (categories 1–14)', 'all',
        'A scope 3 category that reaches 5% or more of the total on its own is “significant,” and every significant category sits inside the target boundary. This rule replaces v1’s two-thirds coverage test.', '#scope-3') },
      { node: N('s3-exclusions', 'Optionally exclude eligible scope 3 activities from the target boundary, e.g. second-hand goods, employee commuting', 'opt',
        'You may exclude certain activities regardless of size — but you must report each exclusion with its condition, its volume in absolute and percentage terms, and how you plan to mitigate those emissions anyway.', '#scope-3') },
      { q: 'Choose your scope 3 near-term target(s) — one or a combination of methods to cover significant categories' },
      { branch: [
        { rows: [ { node: N('s3-abs', 'Overarching scope 3 absolute emissions reduction target', 'all',
          'A single absolute reduction target spanning the entire scope 3 boundary — the bluntest lever on the board, and the one that needs no footnotes.', '#scope-3') } ] },
        { rows: [ { node: N('s3-align', 'Overarching supplier / customer alignment target', 'all',
          'You get a share of your Tier 1 suppliers or customers to set science-based targets of their own — pushing the real work out into the value chain.', '#scope-3') } ] },
        { rows: [ { node: N('s3-specific', 'Category- or activity-specific targets', 'all',
          'Tailored methods per category or activity, with the options differing upstream vs downstream and by whether a sector pathway exists. You can aggregate targets that share a method.', '#scope-3') } ] },
      ] },
      { tree: true },
      { node: N('s3-headline', 'Headline ambition — scope 3 targets may be aggregated into a single figure for communication purposes', 'opt',
        'You can roll several scope 3 targets into a single headline ambition figure — a number for communication, never for assessment.', '#scope-3') },
    ],
  },

  {
    id: 'oer',
    name: 'Ongoing emissions responsibility',
    intro: 'A voluntary recognition program that rewards you for owning the emissions you still cause on the way to net-zero — at Engaged, Advanced or Leadership level. Opting out requires a justification.',
    rows: [
      { bridge: 'Once targets are set…' },
      { q: 'Does the company take part in the optional Ongoing Emissions Responsibility program?' },
      { branch: [
        { label: 'Yes', rows: [
          { node: N('oer-calc', 'Calculate indicative emissions in MtCO₂ using the SBTi target tool, to inform level selection', 'opt',
            'From your base year and submitted pathways, the tool projects ongoing emissions across the target period — a guide only. The OER assessment later runs on actual out-turn at the end of the timeframe.', '#oer') },
          { node: N('oer-choose', 'Choose your ongoing emissions responsibility level for the next target timeframe') },
          { chips: [
            N('oer-engaged', 'Engaged', 'opt', 'Take responsibility for at least 1% of ongoing scope 1, 2 and 3 emissions — the entry level, and no carbon price is mandated.', '#oer'),
            N('oer-advanced', 'Advanced', 'opt', 'Cover 100% of scope 1 + 2 plus at least 10% of total ongoing emissions, with the option of a contribution budget at $20/tCO₂e.', '#oer'),
            N('oer-leadership', 'Leadership', 'opt', 'Take responsibility for 100% of ongoing emissions, funded through a contribution budget at $80/tCO₂e.', '#oer'),
          ] },
          { node: N('oer-approach', 'Choose one approach for delivering climate contributions: support verified mitigation outcomes, or establish and use a contribution budget', 'opt',
            'You deliver one of two ways: buy verified mitigation outcomes matching the volume of covered emissions, or set up a contribution budget priced at your level. Leadership companies take the budget route.', '#oer') },
        ] },
        { label: 'No', rows: [
          { node: N('oer-justify', 'Provide justification for not taking part in the program', 'all',
            'You may opt out, but not silently — you must justify why you are not taking part.', '#oer') },
          { node: N('oer-2035', 'From 2035, Category A companies take responsibility for at least 1% of ongoing emissions, rising linearly to 100% by the net-zero year', 'cata',
            'From 2035, Category A companies support eligible carbon removals for at least 1% of ongoing emissions, then scale that share linearly to 100% by their net-zero year — and no later than 2050.', '#oer') },
        ] },
      ] },
    ],
  },

  {
    id: 'impl',
    name: 'Implementation hierarchy',
    intro: 'A hierarchy grades how you deliver: cut at the source first, act within shared systems next, and turn to sector-level instruments only when a documented structural constraint blocks everything closer.',
    rows: [
      { bridge: 'Company then chooses its implementation actions, following the implementation hierarchy' },
      { node: N('impl-activity', 'Activity level — prioritize action that directly targets the emissions sources in the inventory: reduced energy consumption, fuel switching, lower-carbon input materials', 'all',
        'Start at the source — efficiency, fuel switching, lower-carbon inputs, supplier and customer engagement. Activity-level action is the only kind that shows up in your own inventory as a reduction.', '#implement') },
      { bridge: 'Where emissions arise within an activity pool…' },
      { node: N('impl-pool', 'Activity pool level — act within the pool the activity arises from (electricity grids, supply sheds, logistics networks), e.g. commodity certificates from the pool, supply-shed measures', 'all',
        'When emissions sit in shared systems — grids, supply sheds, logistics networks — you can act inside the pool itself: deliverable PPAs, EACs, supply-shed measures, each meeting the integrity criteria. The reward is a system-contribution claim, which you report separately.', '#implement') },
      { bridge: 'Where structural constraints prevent action at the activity or activity pool level…' },
      { node: N('impl-sector', 'Sector level — act at sector level and document constraints (early-stage technology, infrastructure, regulatory, supply), e.g. commodity certificates from the same system', 'all',
        'Sector-level instruments are a last resort: you need a documented structural constraint, and the action must complement — never substitute for — more direct cuts.', '#implement') },
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
          N('s3-up-red', 'Emissions reduction', 'all', 'Set an absolute or intensity reduction target that follows the commodity’s sector-specific pathway.', '#scope-3'),
          N('s3-up-sup', 'Supplier alignment', 'all', 'Grow the share of your Tier 1 suppliers that hold science-based targets of their own.', '#scope-3'),
          N('s3-up-vol', 'Volume alignment', 'all', 'Raise the share of purchased commodities or transport that is low-carbon aligned.', '#scope-3'),
        ] },
        { label: 'Not covered by sector-specific pathways', chips: [
          N('s3-upn-red', 'Emissions reduction', 'all', 'Where no sector-specific pathway exists, set an emissions reduction target in absolute terms.', '#scope-3'),
          N('s3-upn-sup', 'Supplier alignment', 'all', 'Align your Tier 1 suppliers by getting them to set science-based targets of their own.', '#scope-3'),
        ] },
      ],
    },
    {
      label: 'Downstream categories',
      subs: [
        { label: 'Method options', chips: [
          N('s3-dn-red', 'Emissions reduction', 'all', 'Target downstream emissions with a reduction target, set in absolute or intensity terms.', '#scope-3'),
          N('s3-dn-cust', 'Customer alignment', 'all', 'Grow the share of your Tier 1 customers that hold science-based targets of their own.', '#scope-3'),
          N('s3-dn-use', 'Product use alignment', 'all', 'Raise the share of sold products that are low/zero-carbon aligned (category 11). A narrow fallback waits for cases where no downstream option reasonably applies.', '#scope-3'),
          N('s3-dn-eol', 'Product end-of-life alignment', 'all', 'Raise the share of products you design for a circular end of life.', '#scope-3'),
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
      shortcut straight to the chapter that covers it in depth.</p>
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
  go: 'Walk the roadmap →',
  build: renderRoadmap,
  enhance: enhanceRoadmap,
};
