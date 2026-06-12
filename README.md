# sbti-v2 — The Net-Zero Loop

An interactive, single-page experience for the **SBTi Corporate Net-Zero Standard V2.0** (June 2026), built for sustainability consultants, sustainability managers, and energy-procurement teams: walk the five-year target cycle and learn the key changes without reading the 105-page Standard.

## The experience

One scrollytelling journey through the Standard's own loop:

| Chapter | Anchor | Interaction |
|---|---|---|
| Hero | `#top` | Three.js particle field resolving into the 2026→2050 trajectory |
| Which rules apply to you? | `#category` | Category A/B selector (Table 2 logic) — flips every Required/Optional badge on the page, persists in `localStorage` |
| Govern | `#govern` | Board sign-off + transition-plan flip cards |
| Baseline | `#baseline` | V1 historical vs V2 latest-data base-year slider |
| Set targets | `#targets` | S1 routes, S2 options, S3 5% boundary slider + tappable Table 3 explorer |
| Implement | `#implement` | Pinned scroll descent of the 3-rung implementation hierarchy; hourly-matching bars 50/75/90 |
| Prove it | `#prove` | Claim-type cards (company-level vs system contribution) |
| Stay responsible | `#oer` | OER tier cards (Engaged / Advanced / Leadership) + preset illustrations |
| The horizon | `#horizon` | 2026→2050 key-dates timeline |
| About | `#about` | Author, Arcadia, contact |

Legacy hashes (`#timeline`, `#scope-1/2/3`) redirect to the matching chapters.

## Structure

```
index.html             # the whole experience (chapters + shell)
assets/experience.css  # design tokens, chassis, chapter styles (dark mode via prefers-color-scheme)
assets/experience.js   # GSAP/ScrollTrigger chassis, reveals, progress rail, NZ event bus
assets/hero3d.js       # Three.js hero (lazy init, full dispose, poster fallback)
assets/chapters.js     # chapter interactives (tabs, sliders, Table 3 explorer, OER presets)
assets/content.js      # data: Table 3, OER tiers, timeline entries
assets/personalize.js  # Category A/B engine + req-badge flip system
assets/implement.js    # pinned hierarchy sequence + hourly bars
source/                # source artifacts incl. extracted Standard text (not deployed)
```

Motion respects `prefers-reduced-motion` (no pinning, no particles, full content parity) and falls back statically on mobile for the pinned section.

## Develop

Plain static HTML — no build step.

```bash
python3 -m http.server 8000   # open http://localhost:8000
```

GSAP 3.12.5 and three 0.160.0 are pinned via CDN.

## Deploy

Vercel static site (no build command). `source/` and `*.pdf` are excluded via `.vercelignore`.
