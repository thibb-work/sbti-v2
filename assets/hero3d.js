/* =========================================================================
   SBTi "Net-Zero Loop" — Hero 3D scene (M2)
   Three.js particle field (the chaos of value-chain emissions) that
   resolves into a single descending 2026→2050 trajectory line as the
   visitor scrolls through the hero.

   Loaded lazily by experience.js (only when WebGL present & motion allowed).
   Owns: adaptive particle count, lazy init, full dispose past the hero,
   poster fallback on failure.

   Three.js pinned via import map below (r160). No build step.
   ========================================================================= */

const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

let disposed = false;
let scene, camera, renderer, particles, trajectory, scrollTrigger, rafId, ro;
let onVisibility;

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
  // a few thousand particles, scaled to the device
  const COUNT = lowPower ? 1800 : (cores >= 8 ? 4200 : 3000);

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

  // ---- scene / camera ----------------------------------------------------
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
  camera.position.set(0, 0, 14);

  // brand teal as particle colour; resolve from CSS so dark-mode tracks
  const css = getComputedStyle(document.documentElement);
  const tealHex = (css.getPropertyValue('--teal').trim() || '#0F6E56');
  const amberHex = (css.getPropertyValue('--amber').trim() || '#BA7517');
  const tealColor = new THREE.Color(tealHex);
  const amberColor = new THREE.Color(amberHex);

  // ---- geometry: each particle has a CHAOS position and a TARGET position
  // on the descending trajectory line. We lerp between them by `progress`.
  const chaos = new Float32Array(COUNT * 3);
  const target = new Float32Array(COUNT * 3);
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const SPAN_X = 22;          // 2026 (left) → 2050 (right)
  const DROP = 7.5;           // descent height
  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    // chaos cloud
    chaos[i3]     = (Math.random() - 0.5) * 26;
    chaos[i3 + 1] = (Math.random() - 0.5) * 16;
    chaos[i3 + 2] = (Math.random() - 0.5) * 16;

    // target: a descending curve from top-left to bottom-right with a little
    // jitter so the line reads as a dense beam rather than a hairline.
    const t = i / (COUNT - 1);
    const x = (t - 0.5) * SPAN_X;
    // ease-out descent (fast early reductions, residual tail)
    const ease = 1 - Math.pow(1 - t, 2.2);
    const y = (DROP / 2) - ease * DROP;
    target[i3]     = x;
    target[i3 + 1] = y + (Math.random() - 0.5) * 0.5;
    target[i3 + 2] = (Math.random() - 0.5) * 0.6;

    // colour: teal cloud cooling to amber residual at the 2050 tail
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
    size: lowPower ? 0.085 : 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    sizeAttenuation: true
  });
  particles = new THREE.Points(geo, mat);
  scene.add(particles);

  // ---- progress state ----------------------------------------------------
  let progress = 0;   // 0 = chaos, 1 = fully resolved trajectory
  let drift = 0;      // ambient time for chaos shimmer

  function applyProgress() {
    const pos = geo.attributes.position.array;
    const p = progress;
    // smootherstep for an organic settle
    const s = p * p * p * (p * (p * 6 - 15) + 10);
    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // chaos shimmer fades out as we resolve
      const wob = (1 - s);
      const dx = Math.sin(drift + i) * 0.12 * wob;
      const dy = Math.cos(drift * 0.8 + i) * 0.12 * wob;
      pos[i3]     = chaos[i3]     + (target[i3]     - chaos[i3])     * s + dx;
      pos[i3 + 1] = chaos[i3 + 1] + (target[i3 + 1] - chaos[i3 + 1]) * s + dy;
      pos[i3 + 2] = chaos[i3 + 2] + (target[i3 + 2] - chaos[i3 + 2]) * s;
    }
    geo.attributes.position.needsUpdate = true;
    // tighten points as they resolve
    mat.size = (lowPower ? 0.085 : 0.07) * (1 - s * 0.35);
  }

  // ---- scroll → progress over the hero ----------------------------------
  scrollTrigger = ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: 'bottom top',
    scrub: 0.4,
    onUpdate: (self) => { progress = self.progress; }
  });

  // dispose fully once the hero is comfortably out of view
  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom top',
    onEnter: () => dispose(),         // scrolled past → free GPU/CPU
    onLeaveBack: () => { /* still above; keep alive */ }
  });

  // ---- render loop (pause when tab hidden) -------------------------------
  let running = true;
  onVisibility = () => { running = !document.hidden; if (running) loop(); };
  document.addEventListener('visibilitychange', onVisibility);

  function loop() {
    if (disposed || !running) return;
    drift += 0.012;
    applyProgress();
    // gentle parallax rotation on the cloud only (subtle)
    particles.rotation.z = (1 - progress) * 0.04 * Math.sin(drift * 0.5);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  }

  // ---- resize ------------------------------------------------------------
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

  applyProgress();
  loop();

  // expose for debugging / QA
  return { dispose };

  // ---- full teardown -----------------------------------------------------
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (rafId) cancelAnimationFrame(rafId);
    if (scrollTrigger) scrollTrigger.kill();
    if (onVisibility) document.removeEventListener('visibilitychange', onVisibility);
    if (ro) ro.disconnect();
    try {
      geo.dispose();
      mat.dispose();
      if (trajectory) { trajectory.geometry.dispose(); trajectory.material.dispose(); }
      scene.remove(particles);
      renderer.dispose();
      const el = renderer.domElement;
      if (el && el.parentNode) el.parentNode.removeChild(el);
      // force-lose the GL context so the GPU buffer is reclaimed
      const ctx = el && el.getContext('webgl');
      const lose = ctx && ctx.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (e) { /* noop */ }
    scene = camera = renderer = particles = trajectory = null;
  }
}
