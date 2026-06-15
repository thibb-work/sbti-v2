/* =========================================================================
   SBTi "Net-Zero Loop" — #implement chapter behaviour
   The 3-rung implementation-hierarchy ladder (Activity level → Activity
   pools → Sector level) is fully static — all rungs visible, styled by
   CSS alone. (An earlier scroll-pinned version was retired: user testing
   found the pin confusing.)

   The only JS this chapter needs is growing the hourly-matching bars when
   they scroll into view: CSS owns the transition, we just add .is-grown.
   No IntersectionObserver: bars render grown at once.
   ========================================================================= */

// Motion forced on for all visitors (see experience.js) — the bars animate
// regardless of the OS "reduce motion" setting.
const REDUCED = false;

function initHourly() {
  const el = document.getElementById('hourly');
  if (!el) return;
  if (REDUCED || !('IntersectionObserver' in window)) {
    el.classList.add('is-grown');
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { el.classList.add('is-grown'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -15% 0px', threshold: 0.12 });
  io.observe(el);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHourly);
} else {
  initHourly();
}
