/* =========================================================================
   Pre-paint boot — loaded as a blocking classic script in <head> so both
   jobs below finish before the first frame renders:

   1 · Hash redirects — anchors from the old tabbed site land on the right
       chapter before paint (experience.js guards later hashchange events).
   2 · Theme — resolve dark/light from the stored toggle choice (nz-theme)
       or the OS preference, and stamp it on <html data-theme="...">.
       Doing this pre-paint avoids a light-mode flash for dark users.
       assets/theme.js owns the header toggle from here on.

   Keep this file tiny: it blocks rendering by design.
   ========================================================================= */
(function () {
  // 1 · hash redirects (old tab/page anchors → new chapters)
  var redirects = {
    '#horizon': '#timeline',
    '#targets': '#scope-1',
    '#contact': '#about'
  };
  var hash = location.hash;
  if (redirects[hash]) {
    // rewrite without adding a history entry; experience.js scrolls on load
    history.replaceState(null, '', location.pathname + location.search + redirects[hash]);
  }

  // 2 · theme
  var stored = null;
  try { stored = localStorage.getItem('nz-theme'); } catch (e) { /* private mode */ }
  var dark = stored ? stored === 'dark'
    : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');

  // 3 · Vercel Speed Insights queue shim (static-site integration)
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };

  // 4 · Vercel Web Analytics queue shim (static-site integration)
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
})();
