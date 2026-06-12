/* =========================================================================
   SBTi "Net-Zero Loop" — Hero 3D scene
   A field of soft bubbles (the chaos of value-chain emissions) in three
   depth layers that resolves into a single descending 2026→2050 trajectory
   as the visitor scrolls. Cinematic layer: GSAP camera dolly on entry,
   pointer parallax, atmospheric fog, and a drawn trajectory line that
   materializes as the bubbles settle.

   Loaded lazily by experience.js (only when WebGL present & motion allowed).
   Owns: adaptive particle count, lazy init, full dispose past the hero,
   poster fallback on failure. Three.js pinned r160, no build step.
   ========================================================================= */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

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
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;

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
    { share: 0.62, size: lowPower ? 0.16 : 0.14, opacity: dark ? 0.95 : 0.9  },
    { share: 0.28, size: lowPower ? 0.30 : 0.27, opacity: dark ? 0.6  : 0.55 },
    { share: 0.10, size: lowPower ? 0.55 : 0.5,  opacity: dark ? 0.4  : 0.3  }
  ];

  const SPAN_X = 22;   // 2026 (left) → 2050 (right)
  const DROP = 7.5;    // descent height
  const group = new THREE.Group();
  scene.add(group);

  const layers = LAYERS.map((cfg, li) => {
    const n = Math.round(COUNT * cfg.share);
    const chaos = new Float32Array(n * 3);
    const target = new Float32Array(n * 3);
    const positions = new Float32Array(n * 3);
    const colors = new Float32Array(n * 3);

    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
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

      const c = tealColor.clone().lerp(amberColor, Math.pow(t, 1.6) * 0.85);
      colors[i3] = c.r; colors[i3 + 1] = c.g; colors[i3 + 2] = c.b;

      positions[i3] = chaos[i3];
      positions[i3 + 1] = chaos[i3 + 1];
      positions[i3 + 2] = chaos[i3 + 2];
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

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
    return { n, chaos, target, geo, mat, cfg, phase: li * 2.1 };
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
    const c = tealColor.clone().lerp(amberColor, Math.pow(t, 1.6) * 0.85);
    lineCol[i * 3] = c.r; lineCol[i * 3 + 1] = c.g; lineCol[i * 3 + 2] = c.b;
  }
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
  lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3));
  const lineMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 });
  const trajectory = new THREE.Line(lineGeo, lineMat);
  group.add(trajectory);

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

    layers.forEach((L) => {
      const pos = L.geo.attributes.position.array;
      for (let i = 0; i < L.n; i++) {
        const i3 = i * 3;
        // chaos shimmer fades as the field resolves; each layer drifts offset
        const dx = Math.sin(drift + i + L.phase) * 0.14 * wob;
        const dy = Math.cos(drift * 0.8 + i * 1.3 + L.phase) * 0.14 * wob;
        pos[i3]     = L.chaos[i3]     + (L.target[i3]     - L.chaos[i3])     * s + dx;
        pos[i3 + 1] = L.chaos[i3 + 1] + (L.target[i3 + 1] - L.chaos[i3 + 1]) * s + dy;
        pos[i3 + 2] = L.chaos[i3 + 2] + (L.target[i3 + 2] - L.chaos[i3 + 2]) * s;
      }
      L.geo.attributes.position.needsUpdate = true;
      // breathing: bubbles gently swell and shrink while in chaos
      const breathe = 1 + Math.sin(drift * 0.9 + L.phase) * 0.06 * wob;
      L.mat.size = L.cfg.size * (1 - s * 0.3) * breathe;
      L.mat.opacity = L.cfg.opacity * intro.t;
    });

    // trajectory line fades in over the back half of the resolve
    lineMat.opacity = Math.max(0, (s - 0.45) / 0.55) * (dark ? 0.9 : 0.7) * intro.t;

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

    // ambient life after the resolve: the whole field breathes very slowly
    group.position.y = Math.sin(drift * 0.35) * 0.18 * s;

    // linger past the hero: ease the field aside and fade it out slowly
    group.position.x = linger * 6.5;
    wrap.style.opacity = Math.pow(1 - linger, 1.35).toFixed(3);
  }

  // ---- scroll → progress over the hero ------------------------------------
  scrollTrigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.9,
    onUpdate: (self) => { progress = self.progress; }
  });

  // ---- ambient persistence ------------------------------------------------
  // The field lingers as a quiet backdrop for ~2.5 screens past the hero,
  // drifting aside and fading slowly, then pauses (RAF stopped, canvas
  // hidden) rather than disposing — so scrolling back up always works.
  // Low-power devices and phones skip the linger: the scene pauses right at
  // the hero's edge. Cinematic where it's cheap, frugal where it isn't.
  let linger = 0;      // 0 at hero bottom → 1 fully faded out
  let paused = false;
  function pauseScene() { if (paused || disposed) return; paused = true; wrap.style.visibility = 'hidden'; }
  function resumeScene() { if (!paused || disposed) return; paused = false; wrap.style.visibility = ''; loop(); }

  const PERSIST = !lowPower && window.innerWidth >= 768;
  if (PERSIST) {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top',
      end: '+=250%',
      scrub: 0.8,
      onUpdate: (self) => { linger = self.progress; },
      onLeave: () => pauseScene(),
      onEnterBack: () => resumeScene()
    });
  } else {
    ScrollTrigger.create({
      trigger: hero,
      start: 'bottom top',
      onEnter: () => pauseScene(),
      onLeaveBack: () => resumeScene()
    });
  }

  // ---- render loop (pause when tab hidden) ---------------------------------
  let running = true;
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
