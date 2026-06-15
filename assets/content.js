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
  c1p: { n: "Cat 1 · Purchased goods & services (commodities with pathways)", g: "Group A", side: "up", share: 0.18, o: [1,1,1,0,0], t: "Pathway commodities — steel, cement, chemicals — can take sector-trajectory intensity targets or volume-alignment targets for lower-carbon purchasing." },
  c1:  { n: "Cat 1 · Purchased goods & services (all other)", g: "Group B", side: "up", share: 0.22, o: [1,0,1,0,0], t: "Non-pathway purchases take an absolute reduction or tier 1 supplier alignment target, measured by emissions or spend." },
  c2p: { n: "Cat 2 · Capital goods (commodities with pathways)", g: "Group A", side: "up", share: 0.04, o: [1,1,1,0,0], t: "CapEx commodities like steel and cement can follow sector intensity pathways or volume-alignment targets — which requires knowing exactly what your capital spend contains, line item by line item." },
  c2:  { n: "Cat 2 · Capital goods (all other)", g: "Group B", side: "up", share: 0.03, o: [1,0,1,0,0], t: "Capital goods without sector pathways fall back to an absolute reduction or supplier alignment target." },
  c3:  { n: "Cat 3 · Fuel- & energy-related activities", g: "Group B", side: "up", share: 0.03, o: [1,0,0,0,0], t: "Emissions reduction only — and the whole category is excludable where it is mitigated through scope 1 and 2 energy targets." },
  c4:  { n: "Cat 4 · Upstream transportation & distribution", g: "Group A", side: "up", share: 0.06, o: [1,1,1,0,0], t: "Transport has sector pathways: intensity targets, lower-carbon volume shares, or carrier alignment all qualify." },
  c5:  { n: "Cat 5 · Waste generated in operations", g: "Group B", side: "up", share: 0.01, o: [1,0,0,0,0], t: "Emissions reduction is the only route — no alignment options for waste." },
  c6:  { n: "Cat 6 · Business travel", g: "Group A", side: "up", share: 0.02, o: [1,1,0,0,0], t: "Reduce emissions or grow the share of lower-carbon travel — notably, no supplier alignment option here." },
  c7:  { n: "Cat 7 · Employee commuting", g: "Group B", side: "up", share: 0.02, o: [1,0,0,0,0], t: "Emissions reduction only — though the entire category can be excluded with justification." },
  c8:  { n: "Cat 8 · Upstream leased assets", g: "Group B", side: "up", share: 0.01, o: [1,0,1,0,0], t: "Reduce emissions or align lessors; excludable where the company has no operational control or practical influence over energy use." },
  c9:  { n: "Cat 9 · Downstream transportation & distribution", g: "Group A methods", side: "down", share: 0.03, o: [1,1,1,0,0], t: "Listed downstream but uses upstream transport methods — the same pathways as category 4. Excludable without contractual influence over fuel, route, or mode." },
  c10: { n: "Cat 10 · Processing of sold products", g: "Group C", side: "down", share: 0.05, o: [1,0,1,0,0], t: "Reduce emissions or align tier 1 customers; excludable where processing steps are unknown or there is no contractual relationship." },
  c11: { n: "Cat 11 · Use of sold products", g: "Group C", side: "down", share: 0.24, o: [1,0,1,1,0], t: "The big one for product companies: emissions cuts, customer alignment, or product use alignment. If none reasonably apply, the escape hatch allows swapping equivalent emissions to another category, or an SBTi-approved exception with a long-term target, a day-one plan, and annual reporting." },
  c12: { n: "Cat 12 · End-of-life treatment of sold products", g: "Group C", side: "down", share: 0.03, o: [1,0,0,0,1], t: "Reduce emissions or grow the share of products designed with circular end-of-life solutions — the only category where the circularity lever applies." },
  c13: { n: "Cat 13 · Downstream leased assets", g: "Group C", side: "down", share: 0.02, o: [1,0,1,1,0], t: "Emissions reduction, lessee alignment, or product use alignment for the assets you lease out." },
  c14: { n: "Cat 14 · Franchises", g: "Group C", side: "down", share: 0.04, o: [1,0,1,0,0], t: "Reduce emissions or align franchisees; excludable where franchisees operate independently or control their own energy use." }
};

export const SCOPE3_OPTION_LABELS = [
  "Emissions reduction",
  "Volume alignment",
  "Supplier/customer alignment",
  "Product use alignment",
  "End-of-life alignment"
];

/* -------------------------------------------------------------------------
   Timeline — 2026→2050 milestones (#timeline), ported from timeline.html.
   tone: 'teal' | 'gray' | 'amber' drives the dot/marker colour via CSS class.
   ------------------------------------------------------------------------- */
/* Entries may carry per-category notes (a / b): rendered as a "for you" line
   that live-updates once the visitor sets their category in chapter 01.
   Only included where the Standard's A/B split is unambiguous. */
export const TIMELINE_ENTRIES = [
  { date: "11 Jun 2026", tone: "teal", title: "V2.0 published", text: "Final standard released after two public consultations." },
  { date: "1 Feb 2027", tone: "teal", title: "V2.0 effective date", text: "Pre-existing power contracts grandfathered from this date.",
    a: "Transition plan due at Target Validation, with up to 15 months’ flexibility to disclose.",
    b: "Same target routes, lighter burden — disclosing a transition plan is recommended, not required." },
  { date: "End 2027", tone: "gray", title: "V1 closes to new targets", text: "Last window to submit new targets under Version 1." },
  { date: "From 2028", tone: "teal", title: "Next-cycle target setting begins", text: "2030–2035 targets set under V2.0 as the first cohort renews.",
    a: "Scope 1, scope 2 and scope 3 near-term targets, with limited assurance of your base-year inventory.",
    b: "Scope 1 and scope 2 near-term targets; scope 3 targets and base-year assurance are recommended, not required." },
  { date: "2030", tone: "amber", title: "Hourly matching step-up", text: "Scope 2 hourly-matching recognition threshold rises from 50% to 75%.",
    a: "Reporting the hourly-matched share is mandatory in any activity pool consuming 10 GWh+ a year.",
    b: "Hourly-matching reporting stays optional — the recognition programme is open if you opt in." },
  { date: "2035", tone: "amber", title: "Ongoing responsibility phases in", text: "From 2035, companies support eligible carbon removals from 1% of ongoing emissions, rising to 100% by their net-zero year (C45); hourly-matching threshold reaches 90%." },
  { date: "By 2050", tone: "amber", title: "Net-zero deadline", text: "Emissions at residual levels (~10% or less); neutralize 100% of residuals with eligible removals." }
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
    approach: "Verified mitigation outcomes equal in volume (tCO₂e) to covered emissions — or a contribution budget at a price you choose."
  },
  {
    id: "advanced",
    name: "Advanced",
    coverage: "10%",
    coverageDetail: "of total ongoing emissions, including 100% of scope 1 + 2",
    price: 20,
    priceLabel: "$20 / tCO₂e",
    approach: "Contribution budget of covered emissions × $20/tCO₂e, or verified mitigation outcomes equal in volume to covered emissions."
  },
  {
    id: "leadership",
    name: "Leadership",
    coverage: "100%",
    coverageDetail: "of total ongoing emissions (Category A) — Category B may cover 10% incl. 100% S1+S2",
    price: 80,
    priceLabel: "$80 / tCO₂e",
    approach: "Contribution budget of covered emissions × $80/tCO₂e AND verified mitigation outcomes equal in volume to covered emissions."
  }
];

/* -------------------------------------------------------------------------
   OER calculator — 3 illustrative preset company profiles (no free input).
   ongoing: total ongoing scope 1+2+3 emissions, tCO2e/yr (5-yr average).
   ------------------------------------------------------------------------- */
export const OER_PRESETS = [
  { id: "mid-manufacturer", label: "Mid-size manufacturer", detail: "~45,000 tCO₂e/yr ongoing emissions", ongoing: 45000 },
  { id: "regional-retailer", label: "Regional retail group", detail: "~180,000 tCO₂e/yr ongoing emissions", ongoing: 180000 },
  { id: "global-industrial", label: "Global industrial group", detail: "~2,100,000 tCO₂e/yr ongoing emissions", ongoing: 2100000 }
];
