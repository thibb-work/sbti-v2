/* =========================================================================
   SBTi "Net-Zero Loop" — Hero 3D scene
   A field of soft bubbles (the chaos of value-chain emissions) in three
   depth layers that resolves into a single descending 2026→2050 trajectory
   as the visitor scrolls. Cinematic layer: GSAP camera dolly on entry,
   pointer parallax, atmospheric fog, and a drawn trajectory line that
   materializes as the bubbles settle. At the page's end the same dots
   re-gather as a gentle band of green foam along the bottom edge — a
   net-zero reprise that signals the foot of the page.

   Loaded lazily by experience.js (only when WebGL present & motion allowed).
   Owns: adaptive particle count, lazy init, full dispose past the hero,
   poster fallback on failure. Three.js pinned r160, no build step.
   ========================================================================= */

// Self-hosted Three.js r160 (assets/vendor/), loaded same-origin so corporate
// proxies (e.g. Zscaler) that block jsdelivr can't strip the hero. Relative to
// this module's URL (assets/hero3d.js) → assets/vendor/three.module.min.js.
const THREE_URL = './vendor/three.module.min.js';

let disposed = false;
let scene, camera, renderer, scrollTrigger, rafId, ro;
let onVisibility, onPointer, introTween;

export async function initHero3D({ gsap, ScrollTrigger }) {
  const THREE = await import(THREE_URL);

  const wrap = document.getElementById('heroCanvasWrap');
  const hero = document.getElementById('top');
  const poster = document.getElementById('heroPoster');
  if (!wrap || !hero) return;

  // ---- adaptive sizing ---------------------------------------------------
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cores = navigator.hardwareConcurrency || 4;
  const lowPower = cores <= 4 || dpr < 1.5;
  const COUNT = lowPower ? 1800 : (cores >= 8 ? 4200 : 3000);
  // boot.js stamps <html data-theme>; theme.js keeps it current and emits
  // 'theme:change', which re-tints this scene below (mutable on purpose)
  let dark = document.documentElement.dataset.theme === 'dark';

  let w = wrap.clientWidth || window.innerWidth;
  let h = wrap.clientHeight || window.innerHeight;

  // ---- renderer ----------------------------------------------------------
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !lowPower, alpha: true, powerPreference: 'low-power' });
  } catch (e) {
    if (poster) poster.classList.add('is-on');
    return;
  }
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  wrap.appendChild(renderer.domElement);

  // ---- scene / camera / atmosphere ---------------------------------------
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
  camera.position.set(0, 0, 17); // intro dolly brings us to 14

  const css = getComputedStyle(document.documentElement);
  const tealColor = new THREE.Color((css.getPropertyValue('--teal').trim() || '#0F6E56'));
  const amberColor = new THREE.Color((css.getPropertyValue('--amber').trim() || '#BA7517'));
  const bgColor = new THREE.Color((css.getPropertyValue('--bg').trim() || (dark ? '#141917' : '#FBFAF7')));
  // fog melts the far bubbles into the page background → depth without cost
  scene.fog = new THREE.Fog(bgColor, 16, 34);

  // ---- soft round bubble sprite (canvas radial gradient) ------------------
  function makeBubbleSprite() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.9)');
    grad.addColorStop(0.7, 'rgba(255,255,255,0.35)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  }
  const sprite = makeBubbleSprite();

  // ---- three depth layers: many small, some medium, few large -------------
  // Size variance is what makes them read as bubbles, not pixels.
  const LAYERS = [
    { share: 0.62, size: lowPower ? 0.16 : 0.14, opacityLight: 0.9,  opacityDark: 0.95 },
    { share: 0.28, size: lowPower ? 0.30 : 0.27, opacityLight: 0.55, opacityDark: 0.6  },
    { share: 0.10, size: lowPower ? 0.55 : 0.5,  opacityLight: 0.3,  opacityDark: 0.4  }
  ];

  const SPAN_X = 22;   // 2026 (left) → 2050 (right)
  const DROP = 7.5;    // descent height
  const FOAM_W = 30;   // net-zero foam band — wider than the view, edge to edge
  const FOAM_Y = -6.8; // …resting low in frame: the foot of the page
  const group = new THREE.Group();
  scene.add(group);

  const layers = LAYERS.map((cfg, li) => {
    const n = Math.round(COUNT * cfg.share);
    const chaos = new Float32Array(n * 3);
    const target = new Float32Array(n * 3);
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);
    // per-bubble random seed → independent float frequency, phase & amplitude
    // so the resolved trajectory keeps breathing as individual dots, never a
    // frozen line.
    const seed = new Float32Array(n);
    // foam-band rest position — where each dot settles during the net-zero
    // reprise at the page's end: a wide tideline pooled low in the frame,
    // clustered near the waterline with a few wisps lifting above, like
    // sea-foam come to rest on sand.
    const foam = new Float32Array(n * 3);

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      seed[i] = Math.random();
      chaos[i3]     = (Math.random() - 0.5) * 26;
      chaos[i3 + 1] = (Math.random() - 0.5) * 16;
      chaos[i3 + 2] = (Math.random() - 0.5) * (16 + li * 4); // big bubbles roam deeper

      const t = i / Math.max(1, n - 1);
      const x = (t - 0.5) * SPAN_X;
      const ease = 1 - Math.pow(1 - t, 2.2); // fast early cuts, residual tail
      const y = (DROP / 2) - ease * DROP;
      // larger bubbles settle looser around the line — a beam with a halo
      const spread = 0.4 + li * 0.55;
      target[i3]     = x;
      target[i3 + 1] = y + (Math.random() - 0.5) * spread;
      target[i3 + 2] = (Math.random() - 0.5) * spread;

      foam[i3]     = (Math.random() - 0.5) * FOAM_W;
      foam[i3 + 1] = FOAM_Y + Math.pow(Math.random(), 2.2) * (2.2 + li * 0.9) - 0.4;
      foam[i3 + 2] = (Math.random() - 0.5) * (2 + li * 1.6);

      const c = amberColor.clone().lerp(tealColor, Math.pow(t, 1.4) * 0.9);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;

      positions[i3] = chaos[i3];
      positions[i3 + 1] = chaos[i3 + 1];
      positions[i3 + 2] = chaos[i3 + 2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    // keep the untinted amber→teal ramp so the net-zero reprise can lerp the
    // live colours toward teal and back without losing the original gradient
    const baseCol = colors.slice();

    const mat = new THREE.PointsMaterial({
      size: cfg.size,
      map: sprite,
      vertexColors: true,
      transparent: true,
      opacity: 0,                 // intro fades layers in
      depthWrite: false,
      sizeAttenuation: true,
      blending: dark ? THREE.AdditiveBlending : THREE.NormalBlending
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);
    return { n, chaos, target, foam, seed, baseCol, geo, mat, cfg, phase: li * 2.1 };
  });

  // ---- the trajectory line that materializes as bubbles settle ------------
  const LINE_PTS = 90;
  const linePos = new Float32Array(LINE_PTS * 3);
  const lineCol = new Float32Array(LINE_PTS * 3);
  for (let i = 0; i < LINE_PTS; i++) {
    const t = i / (LINE_PTS - 1);
    const ease = 1 - Math.pow(1 - t, 2.2);
    linePos[i * 3]     = (t - 0.5) * SPAN_X;
    linePos[i * 3 + 1] = (DROP / 2) - ease * DROP;
    linePos[i * 3 + 2] = 0;
    const c = amberColor.clone().lerp(tealColor, Math.pow(t, 1.4) * 0.9);
    lineCol[i * 3] = c.r; lineCol[i * 3 + 1] = c.g; lineCol[i * 3 + 2] = c.b;
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 });
  const trajectory = new THREE.Line(lineGeo, lineMat);
  group.add(trajectory);

  // ---- net-zero reprise tint — lerp the live colours from the base ramp
  // toward teal as the closing reprise reaches full, so the field reads as
  // "everything has arrived at net zero". Driven from the reprise ScrollTrigger
  // (scroll-rate, not per frame) and skipped unless it moved meaningfully.
  let lastTint = -1;
  function applyRepriseTint(rp) {
    if (rp === lastTint) return;
    if (rp > 0 && rp < 1 && Math.abs(rp - lastTint) < 0.02) return;
    lastTint = rp;
    const k = rp * 0.92;                 // how far toward teal at full reprise
    const tr = tealColor.r, tg = tealColor.g, tb = tealColor.b;
    layers.forEach((L) => {
      const cols = L.geo.attributes.color.array;
      const base = L.baseCol;
      for (let i = 0; i < L.n * 3; i += 3) {
        cols[i]     = base[i]     + (tr - base[i])     * k;
        cols[i + 1] = base[i + 1] + (tg - base[i + 1]) * k;
        cols[i + 2] = base[i + 2] + (tb - base[i + 2]) * k;
      }
      L.geo.attributes.color.needsUpdate = true;
    });
  }

  // ---- theme reactivity — re-tint everything when the header toggle flips --
  function applyTheme() {
    if (disposed) return;
    dark = document.documentElement.dataset.theme === 'dark';
    const vars = getComputedStyle(document.documentElement);
    tealColor.set(vars.getPropertyValue('--teal').trim() || '#0F6E56');
    amberColor.set(vars.getPropertyValue('--amber').trim() || '#BA7517');
    bgColor.set(vars.getPropertyValue('--bg').trim() || (dark ? '#141917' : '#FBFAF7'));
    scene.fog.color.copy(bgColor);

    layers.forEach((L) => {
      const base = L.baseCol;
      for (let i = 0; i < L.n; i++) {
        const t = i / Math.max(1, L.n - 1);
        const c = amberColor.clone().lerp(tealColor, Math.pow(t, 1.4) * 0.9);
        base[i * 3] = c.r; base[i * 3 + 1] = c.g; base[i * 3 + 2] = c.b;
      }
      L.geo.attributes.color.array.set(base);
      L.geo.attributes.color.needsUpdate = true;
      L.mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      L.mat.needsUpdate = true;
    });
    // re-apply the reprise tint over the refreshed ramp if it's active
    lastTint = -1;
    if (reprise > 0) applyRepriseTint(reprise);
    for (let i = 0; i < LINE_PTS; i++) {
      const t = i / (LINE_PTS - 1);
      const c = amberColor.clone().lerp(tealColor, Math.pow(t, 1.4) * 0.9);
      lineCol[i * 3] = c.r; lineCol[i * 3 + 1] = c.g; lineCol[i * 3 + 2] = c.b;
    }
    lineGeo.attributes.color.needsUpdate = true;
  }
  window.NZ?.on('theme:change', applyTheme);

  // ---- progress + cinematic state -----------------------------------------
  let progress = 0;   // scroll target: 0 = chaos, 1 = resolved trajectory
  let smoothP = 0;    // lerped follower — silky under scroll jitter
  let drift = 0;      // ambient time
  const intro = { t: 0 };
  introTween = gsap.to(intro, { t: 1, duration: 2.4, ease: 'power3.out', delay: 0.15 });

  // pointer parallax (desktop pointers only — not touch)
  let px = 0, py = 0, sx = 0, sy = 0;
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    onPointer = (e) => {
      const r = hero.getBoundingClientRect();
      px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      py = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    hero.addEventListener('pointermove', onPointer, { passive: true });
  }

  function applyFrame() {
    const p = smoothP;
    const s = p * p * p * (p * (p * 6 - 15) + 10); // smootherstep
    const wob = (1 - s);
    // during the closing "net-zero arrival" reprise the whole field calms —
    // the turbulence is over, the destination reached.
    const calm = 1 - reprise * 0.5;

    layers.forEach((L) => {
      const pos = L.geo.attributes.position.array;
      // chaos shimmer (dies as the field resolves) + a persistent, gentle
      // float that lives on at full resolve — bigger bubbles drift more.
      const chaosAmp = 0.14 * wob;
      const floatBase = 0.05 + L.cfg.size * 0.42;
      const foamW = L.foam;
      for (let i = 0; i < L.n; i++) {
        const i3 = i * 3;
        const sd = L.seed[i];
        const f = 0.45 + sd * 0.95;          // each bubble its own slow tempo
        const ph = L.phase + sd * 6.2832;    // …and its own phase
        const amp = (chaosAmp + floatBase * s * (0.55 + sd * 0.9)) * calm;
        let dx = Math.sin(drift * f + ph) * amp;
        let dy = Math.cos(drift * f * 0.82 + ph * 1.3) * amp;
        let dz = Math.sin(drift * f * 0.6 + ph * 0.7) * amp * 1.25;
        // the resting target migrates from the trajectory to the foam band as
        // the reprise rises — the curve recedes like a wave, leaving foam.
        const tx = L.target[i3]     + (foamW[i3]     - L.target[i3])     * reprise;
        const ty = L.target[i3 + 1] + (foamW[i3 + 1] - L.target[i3 + 1]) * reprise;
        const tz = L.target[i3 + 2] + (foamW[i3 + 2] - L.target[i3 + 2]) * reprise;
        if (reprise > 0) {
          // gentle sea-foam motion: a slow swell travelling along the band,
          // plus a soft per-bubble bob — heavier on the wisps that lift away.
          const wph = drift * 0.7 + foamW[i3] * 0.45 + ph;
          dx += Math.cos(drift * 0.32 + ph) * 0.14 * reprise;
          dy += Math.sin(wph) * (0.14 + sd * 0.3) * reprise;
          dz += Math.sin(wph * 0.7) * 0.1 * reprise;
        }
        pos[i3]     = L.chaos[i3]     + (tx - L.chaos[i3]) * s + dx;
        pos[i3 + 1] = L.chaos[i3 + 1] + (ty - L.chaos[i3 + 1]) * s + dy;
        pos[i3 + 2] = L.chaos[i3 + 2] + (tz - L.chaos[i3 + 2]) * s + dz;
      }
      L.geo.attributes.position.needsUpdate = true;
      // breathing: bubbles gently swell and shrink (keeps a little life after resolve)
      const breathe = 1 + Math.sin(drift * 0.9 + L.phase) * (0.06 * wob + 0.02 * s);
      L.mat.size = L.cfg.size * (1 - s * 0.22) * breathe;
      L.mat.opacity = (dark ? L.cfg.opacityDark : L.cfg.opacityLight) * intro.t;
    });

    // trajectory: a FAINT guide only — and it fades right out as the foam
    // band forms, so the reprise reads purely as drifting dots, no stray line.
    lineMat.opacity = Math.max(0, (s - 0.5) / 0.5) * (dark ? 0.34 : 0.22) * intro.t * (1 - reprise);

    // cinematic camera: intro dolly 17→14, slight pull-back as the line lands,
    // pointer parallax eased on top
    sx += (px - sx) * 0.04;
    sy += (py - sy) * 0.04;
    camera.position.x = sx * 1.1 * (1 - s * 0.5);
    camera.position.y = -sy * 0.7 * (1 - s * 0.5);
    camera.position.z = 17 - 3 * intro.t + s * 1.4;
    camera.lookAt(0, 0, 0);

    // whole field tilts almost imperceptibly while chaotic
    group.rotation.z = wob * 0.05 * Math.sin(drift * 0.5);

    // ambient life after the resolve: the whole field breathes very slowly.
    // No lateral drift — leaving the hero the trajectory dissolves in place so
    // content reads on clean paper; the net-zero reprise re-forms the dots as
    // a foam band positioned low in world space (above), so the camera holds.
    group.position.y = Math.sin(drift * 0.35) * 0.16 * s;
    group.position.x = 0;

    // The field is a bold presence behind the hero while it churns (chaos,
    // s≈0) and settles to a calmer backdrop once it has resolved into the graph
    // (s≈1), so the storm reads loudest and the graph reads as a quiet diagram
    // behind the timeline. Two fades then share the canvas, never overlapping:
    // the linger dissolve over the foot of the timeline and the net-zero foam
    // fade-in (page's end). Whichever wants the field more visible wins.
    const backdrop = 1 - s * 0.35;
    const lingerOpacity = backdrop * Math.pow(1 - linger, 1.6);
    const repriseOpacity = reprise * (dark ? 0.58 : 0.5);
    wrap.style.opacity = Math.max(lingerOpacity, repriseOpacity).toFixed(3);
  }

  // ---- scroll → progress: chaos in the hero, slow drift across "A or B" -----
  // The field holds its chaotic hero scatter through the hero (the first
  // section), then the particles drift slowly into the descending 2026→2050
  // trajectory across the whole "Category A or B" section — fully resolved by
  // the time that section ends, i.e. the start of the #horizon timeline, where
  // the graph then holds. #horizon already carries a diffused page-colour scrim
  // + type halos (experience.css) to keep its text legible over the field.
  // Falls back to the hero's own scroll if #category is ever absent.
  const aOrB = document.getElementById('category');     // "Category A or B"
  const timeline = document.getElementById('horizon');  // the dated timeline
  scrollTrigger = ScrollTrigger.create({
    trigger: aOrB || hero,
    start: aOrB ? 'top bottom' : 'top top',
    end: 'bottom top',
    scrub: 0.9,
    onUpdate: (self) => { progress = self.progress; }
  });

  // ---- ambient persistence ------------------------------------------------
  // The field lives on as the graph backdrop all the way to the foot of the
  // #horizon timeline, then fades out over its last stretch and pauses (RAF
  // stopped, canvas hidden) rather than disposing — so scrolling back up always
  // works. Low-power devices and phones skip the fade: the scene simply pauses
  // at the foot of the timeline. Cinematic where it's cheap, frugal where it
  // isn't. (Falls back to the hero's edge if #horizon is absent.)
  let linger = 0;      // 0 through the timeline → 1 fully faded out at its foot
  let reprise = 0;     // 0 = off, 1 = full net-zero reprise behind page end
  let paused = false;
  let running = true;
  function pauseScene() { if (paused || disposed) return; paused = true; wrap.style.visibility = 'hidden'; }
  function resumeScene() { if (!paused || disposed) return; paused = false; wrap.style.visibility = ''; loop(); }

  const PERSIST = !lowPower && window.innerWidth >= 768;
  const CONTENT_TOP = 72;
  const tail = timeline || hero;   // the field lives until the foot of the timeline
  function syncStaticVisibility() {
    if (PERSIST) return;
    if (tail.getBoundingClientRect().bottom <= CONTENT_TOP) pauseScene();
    else resumeScene();
  }
  if (PERSIST) {
    ScrollTrigger.create({
      trigger: tail,
      start: timeline ? 'bottom 75%' : 'bottom top',
      end: timeline ? 'bottom top' : '+=170%',
      scrub: 0.8,
      onUpdate: (self) => { linger = self.progress; },
      onLeave: () => pauseScene(),
      onEnterBack: () => resumeScene()
    });
  } else {
    ScrollTrigger.create({
      trigger: tail,
      start: `bottom ${CONTENT_TOP}px`,
      onEnter: () => pauseScene(),
      onLeaveBack: () => resumeScene(),
      onRefresh: syncStaticVisibility
    });
    requestAnimationFrame(syncStaticVisibility);
    window.addEventListener('load', syncStaticVisibility, { once: true });
  }

  // ---- net-zero reprise (desktop only) ------------------------------------
  // At the page's end the dots re-gather as a gentle band of green foam along
  // the bottom edge — net zero reached — as the reader arrives at the closing
  // About / Arcadia / contact sections. It reuses THIS instance (no second
  // WebGL context): resume the paused scene, scrub the foam in, re-pause when
  // it's gone. Gated to PERSIST so phones/low-power devices stay frugal.
  if (PERSIST) {
    const closing = document.getElementById('about');
    if (closing) {
      // Scrub-driven (not edge callbacks): the reprise fades in as the closing
      // region rises into view and holds at full past the end, so it stays a
      // calm backdrop through the footer. onUpdate fires continuously while in
      // range — robust even though this trigger is created post-layout, after
      // the lazy import, when an onEnter edge can be silently mis-evaluated.
      ScrollTrigger.create({
        trigger: closing,
        start: 'top 85%',
        end: 'top 30%',
        scrub: 0.6,
        onUpdate: (self) => {
          reprise = self.progress;
          applyRepriseTint(reprise);             // cool the field toward teal
          if (reprise > 0.001) resumeScene();    // idempotent: wakes the paused scene
        },
        onLeaveBack: () => { reprise = 0; applyRepriseTint(0); pauseScene(); } // dismiss
      });
    }
  }

  // ---- render loop (pause when tab hidden) ---------------------------------
  onVisibility = () => { running = !document.hidden; if (running) loop(); };
  document.addEventListener('visibilitychange', onVisibility);

  function loop() {
    if (disposed || !running || paused) return;
    drift += 0.012;
    smoothP += (progress - smoothP) * 0.075;
    if (Math.abs(progress - smoothP) < 0.0004) smoothP = progress;
    applyFrame();
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  }

  // ---- resize ---------------------------------------------------------------
  function resize() {
    if (disposed) return;
    w = wrap.clientWidth || window.innerWidth;
    h = wrap.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(wrap);
  } else {
    window.addEventListener('resize', resize);
  }

  applyFrame();
  loop();

  return { dispose };

  // ---- full teardown ---------------------------------------------------------
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (scrollTrigger) scrollTrigger.kill();
    if (introTween) introTween.kill();
    if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
    if (onPointer) hero.removeEventListener('pointermove', onPointer);
    if (ro) ro.disconnect();
    try {
      layers.forEach((L) => { L.geo.dispose(); L.mat.dispose(); });
      lineGeo.dispose();
      lineMat.dispose();
      sprite.dispose();
      scene.remove(group);
      renderer.dispose();
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
      const ctx = el && el.getContext('webgl');
      const lose = ctx && ctx.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) { /* noop */ }
    scene = camera = renderer = null;
  }
}
