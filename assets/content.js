/* =========================================================================
   SBTi "Net-Zero Loop" — shared content & data
   Reusable data objects for the chapter scripts: Scope 3 Table 3,
   timeline entries, OER tiers, and OER calculator presets.
   Plain ES module — no imports, no side effects beyond named exports.
   ========================================================================= */

/* -------------------------------------------------------------------------
   Scope 3 — Table 3 (CNZS-C15, p.40) ported from scope-3.html.
   D: category data. o = [emissions reduction, volume alignment,
   supplier/customer alignment, product use alignment, end-of-life alignment]
   L: option labels, indexed to match `o`.
   ------------------------------------------------------------------------- */
export const SCOPE3_TABLE3 = {
  c1p: { n: "Cat 1 · Purchased goods & services (commodities with pathways)", g: "Group A", side: "up", share: 0.18, o: [1,1,1,0,0], t: "Pathway commodities — steel, cement, chemicals — can take a sector-trajectory intensity target, or a volume-alignment target that steers purchasing toward lower-carbon supply." },
  c1:  { n: "Cat 1 · Purchased goods & services (all other)", g: "Group B", side: "up", share: 0.22, o: [1,0,1,0,0], t: "Everything without a pathway takes an absolute reduction target or a tier 1 supplier alignment target, measured by emissions or by spend." },
  c2p: { n: "Cat 2 · Capital goods (commodities with pathways)", g: "Group A", side: "up", share: 0.04, o: [1,1,1,0,0], t: "CapEx commodities like steel and cement can follow sector intensity pathways or volume-alignment targets — but only if you know exactly what your capital spend contains, line item by line item." },
  c2:  { n: "Cat 2 · Capital goods (all other)", g: "Group B", side: "up", share: 0.03, o: [1,0,1,0,0], t: "Capital goods without sector pathways fall back to an absolute reduction target or a supplier alignment target." },
  c3:  { n: "Cat 3 · Fuel- & energy-related activities", g: "Group B", side: "up", share: 0.03, o: [1,0,0,0,0], t: "Emissions reduction only — and you can exclude the whole category where scope 1 and scope 2 energy targets already mitigate it." },
  c4:  { n: "Cat 4 · Upstream transportation & distribution", g: "Group A", side: "up", share: 0.06, o: [1,1,1,0,0], t: "Transport carries sector pathways, so intensity targets, lower-carbon volume shares, and carrier alignment all qualify." },
  c5:  { n: "Cat 5 · Waste generated in operations", g: "Group B", side: "up", share: 0.01, o: [1,0,0,0,0], t: "Emissions reduction is the only route — waste gets no alignment options." },
  c6:  { n: "Cat 6 · Business travel", g: "Group A", side: "up", share: 0.02, o: [1,1,0,0,0], t: "Reduce emissions or grow the share of lower-carbon travel — but no supplier alignment option here." },
  c7:  { n: "Cat 7 · Employee commuting", g: "Group B", side: "up", share: 0.02, o: [1,0,0,0,0], t: "Emissions reduction only — though you can exclude the entire category with justification." },
  c8:  { n: "Cat 8 · Upstream leased assets", g: "Group B", side: "up", share: 0.01, o: [1,0,1,0,0], t: "Reduce emissions or align lessors — and exclude the category where you hold no operational control or practical influence over energy use." },
  c9:  { n: "Cat 9 · Downstream transportation & distribution", g: "Group A methods", side: "down", share: 0.03, o: [1,1,1,0,0], t: "Listed downstream, but it uses upstream transport methods — the same pathways as category 4. Exclude it where you have no contractual influence over fuel, route, or mode." },
  c10: { n: "Cat 10 · Processing of sold products", g: "Group C", side: "down", share: 0.05, o: [1,0,1,0,0], t: "Reduce emissions or align tier 1 customers — and exclude the category where processing steps are unknown or no contractual relationship exists." },
  c11: { n: "Cat 11 · Use of sold products", g: "Group C", side: "down", share: 0.24, o: [1,0,1,1,0], t: "The big one for product companies: cut emissions, align customers, or align product use. If none reasonably apply, the escape hatch lets you shift equivalent emissions to another category — or secure an SBTi-approved exception backed by a long-term target, a day-one plan, and annual reporting." },
  c12: { n: "Cat 12 · End-of-life treatment of sold products", g: "Group C", side: "down", share: 0.03, o: [1,0,0,0,1], t: "Reduce emissions or grow the share of products designed for circular end-of-life — the only category where the circularity lever applies." },
  c13: { n: "Cat 13 · Downstream leased assets", g: "Group C", side: "down", share: 0.02, o: [1,0,1,1,0], t: "For the assets you lease out: reduce emissions, align lessees, or align product use." },
  c14: { n: "Cat 14 · Franchises", g: "Group C", side: "down", share: 0.04, o: [1,0,1,0,0], t: "Reduce emissions or align franchisees — and exclude the category where franchisees operate independently or control their own energy use." }
};

export const SCOPE3_OPTION_LABELS = [
  "Emissions reduction",
  "Volume alignment",
  "Supplier/customer alignment",
  "Product use alignment",
  "End-of-life alignment"
];

/* -------------------------------------------------------------------------
   Scope 3 — sector profiles for the 5% boundary tool.
   Each profile gives the share (% of categories 1–14 scope 3 emissions) for a
   representative company in that sector. Shares are illustrative, rounded
   patterns drawn from the typical category breakdowns companies disclose to
   CDP — they show where each sector's value-chain emissions concentrate, not
   any single company's exact footprint.
   ------------------------------------------------------------------------- */
export const SCOPE3_CATEGORY_NAMES = {
  1:  "Cat 1 · Purchased goods & services",
  2:  "Cat 2 · Capital goods",
  3:  "Cat 3 · Fuel- & energy-related activities",
  4:  "Cat 4 · Upstream transport & distribution",
  5:  "Cat 5 · Waste generated in operations",
  6:  "Cat 6 · Business travel",
  7:  "Cat 7 · Employee commuting",
  8:  "Cat 8 · Upstream leased assets",
  9:  "Cat 9 · Downstream transport & distribution",
  10: "Cat 10 · Processing of sold products",
  11: "Cat 11 · Use of sold products",
  12: "Cat 12 · End-of-life treatment of sold products",
  13: "Cat 13 · Downstream leased assets",
  14: "Cat 14 · Franchises"
};

export const SCOPE3_PROFILES = [
  {
    id: "representative",
    label: "Representative",
    blurb: "A balanced illustrative company, emissions spread evenly across the value chain — a neutral place to start.",
    shares: { 1: 32, 2: 5, 3: 3, 4: 6, 5: 1, 6: 2, 7: 2, 8: 1, 9: 3, 10: 5, 11: 28, 12: 3, 13: 2, 14: 5 }
  },
  {
    id: "automotive",
    label: "Automotive OEM",
    blurb: "Tailpipe emissions from vehicles in use dominate: category 11 dwarfs everything else, with purchased materials a distant second.",
    shares: { 1: 14, 2: 2, 3: 1, 4: 3, 5: 1, 6: 1, 7: 1, 8: 0, 9: 2, 10: 1, 11: 70, 12: 2, 13: 0, 14: 0 }
  },
  {
    id: "oilgas",
    label: "Oil & gas",
    blurb: "Burning the fuels they sell makes category 11 overwhelming — often ~85–90% of the whole value chain.",
    shares: { 1: 5, 2: 1, 3: 2, 4: 1, 5: 0, 6: 0, 7: 0, 8: 0, 9: 1, 10: 0, 11: 88, 12: 1, 13: 0, 14: 0 }
  },
  {
    id: "apparel",
    label: "Apparel & retail",
    blurb: "Purchased goods — fabrics, manufacturing, sourcing — dominate, with transport and end-of-life as the secondary hotspots.",
    shares: { 1: 64, 2: 3, 3: 2, 4: 8, 5: 1, 6: 2, 7: 2, 8: 0, 9: 4, 10: 2, 11: 5, 12: 6, 13: 0, 14: 1 }
  },
  {
    id: "food",
    label: "Food & beverage",
    blurb: "Agricultural inputs and ingredients push category 1 to the vast majority of emissions, with transport and end-of-life following.",
    shares: { 1: 74, 2: 2, 3: 2, 4: 6, 5: 2, 6: 1, 7: 1, 8: 0, 9: 3, 10: 2, 11: 2, 12: 4, 13: 0, 14: 1 }
  },
  {
    id: "technology",
    label: "Technology & ICT",
    blurb: "Emissions split between making the hardware (category 1) and powering it in use (category 11) — both clear the boundary.",
    shares: { 1: 45, 2: 6, 3: 2, 4: 4, 5: 1, 6: 3, 7: 2, 8: 0, 9: 2, 10: 1, 11: 30, 12: 3, 13: 0, 14: 0 }
  }
];

/* -------------------------------------------------------------------------
   Timeline — 2026→2050 milestones (#timeline), ported from timeline.html.
   tone: 'teal' | 'gray' | 'amber' drives the dot/marker colour via CSS class.
   ------------------------------------------------------------------------- */
/* Entries may carry per-category notes (a / b): rendered as a "for you" line
   that live-updates once the visitor sets their category in chapter 01.
   Only included where the Standard's A/B split is unambiguous. */
export const TIMELINE_ENTRIES = [
  { date: "11 Jun 2026", tone: "teal", title: "v2 published", text: "SBTi released the final standard after two public consultations." },
  { date: "1 Feb 2027", tone: "teal", title: "v2 effective date", text: "From this date, pre-existing power contracts are grandfathered.",
    a: "Your transition plan is due at Target Validation, with up to 15 months’ flexibility to disclose it.",
    b: "Same target routes, lighter burden: a transition plan is recommended, not required." },
  { date: "End 2027", tone: "gray", title: "v1 closes to new targets", text: "Your last window to submit new targets under v1." },
  { date: "From 2028", tone: "teal", title: "Next-cycle target setting begins", text: "As the first cohort renews, it sets 2030–2035 targets under v2.",
    a: "Scope 1, scope 2 and scope 3 near-term targets, with limited assurance of your base-year inventory.",
    b: "Scope 1 and scope 2 near-term targets; scope 3 targets and base-year assurance are recommended, not required." },
  { date: "2030", tone: "amber", title: "Hourly matching step-up", text: "The scope 2 hourly-matching recognition threshold rises from 50% to 75%.",
    a: "You must report the hourly-matched share in any activity pool consuming 10 GWh+ a year.",
    b: "Hourly-matching reporting stays optional — the recognition programme is open if you opt in." },
  { date: "2035", tone: "amber", title: "Ongoing responsibility phases in", text: "From 2035, companies fund eligible carbon removals covering 1% of ongoing emissions, rising to 100% by their net-zero year (C45); the hourly-matching threshold reaches 90%." },
  { date: "By 2050", tone: "amber", title: "Net-zero deadline", text: "Emissions sit at residual levels (~10% or less); neutralize 100% of those residuals with eligible removals." }
];

/* -------------------------------------------------------------------------
   OER — Table 4 tiers (#oer), CNZS-C40 / Table 4, p.70.
   ------------------------------------------------------------------------- */
export const OER_TIERS = [
  {
    id: "engaged",
    name: "Engaged",
    coverage: "1%",
    coverageDetail: "of total ongoing scope 1, 2 & 3 emissions",
    price: null,
    priceLabel: "No mandated price",
    approach: "Verified mitigation outcomes matching covered emissions in volume (tCO₂e) — or a contribution budget at a price you set."
  },
  {
    id: "advanced",
    name: "Advanced",
    coverage: "10%",
    coverageDetail: "of total ongoing emissions, including 100% of scope 1 + 2",
    price: 20,
    priceLabel: "$20 / tCO₂e",
    approach: "A contribution budget of covered emissions × $20/tCO₂e, or verified mitigation outcomes matching covered emissions in volume."
  },
  {
    id: "leadership",
    name: "Leadership",
    coverage: "100%",
    coverageDetail: "of total ongoing emissions (Category A) — Category B may cover 10% incl. 100% S1+S2",
    price: 80,
    priceLabel: "$80 / tCO₂e",
    approach: "A contribution budget of covered emissions × $80/tCO₂e AND verified mitigation outcomes matching covered emissions in volume."
  }
];

/* -------------------------------------------------------------------------
   OER calculator — 3 illustrative preset company profiles (no free input).
   ongoing: total ongoing scope 1+2+3 emissions, tCO2e/yr (5-yr average).
   ------------------------------------------------------------------------- */
export const OER_PRESETS = [
  { id: "mid-manufacturer", label: "Mid-size manufacturer", detail: "~45,000 tCO₂e/yr ongoing emissions", ongoing: 45000 },
  { id: "regional-retailer", label: "Regional retail group", detail: "~180,000 tCO₂e/yr ongoing emissions", ongoing: 180000 },
  { id: "global-industrial", label: "Large tech company", detail: "~2,100,000 tCO₂e/yr ongoing emissions", ongoing: 2100000 }
];
