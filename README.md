# sbti-v2

An interactive explorer for the **SBTi Corporate Net-Zero Standard V2.0** (June 2026).
A single static page with sticky tab navigation across five sections:

- **Timeline** — implementation timeline from publication (11 Jun 2026) to the 2050 net-zero deadline
- **Scope 1** — standalone target, three target-setting routes, accounting rules
- **Scope 2** — separate target, low-carbon electricity, deliverability matching, hourly-matching thresholds
- **Scope 3** — the four-stage decision system, with a tappable Table 3 category explorer
- **About** — author bio (Thibault Guenat), an Arcadia blurb, and sales contact details

## Structure

```
index.html      # shell: Arcadia-branded header, sticky tab nav, iframes
timeline.html   # timeline section (wraps the source SVG)
scope-1.html    # scope 1 section
scope-2.html    # scope 2 section
scope-3.html    # scope 3 section
about.html      # about: author, Arcadia, contact
source/         # original source artifacts the pages were built from
```

Each section is an isolated page embedded via `<iframe>` so the three
distinct design systems never collide; the shell auto-sizes each frame
to its content via `postMessage`.

## Develop

It's plain static HTML — no build step.

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploy

Deployed on Vercel as a static site (no build command, root as output).

---

Prepared as a consultant reference. Verify against the
[published Standard](https://sciencebasedtargets.org/) before client use.
