/* =========================================================================
   Theme toggle — the sun/moon button in the header.

   boot.js already stamped <html data-theme="light|dark"> before paint;
   this module just keeps it current:
     - click → flip the theme and remember the choice (localStorage nz-theme)
     - no stored choice → keep following the OS preference live
     - every change → NZ.emit('theme:change', { dark }) so canvas scenes
       (hero3d.js) can re-tint without a reload
   ========================================================================= */

const STORAGE_KEY = 'nz-theme';
const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function isDark() {
  return root.dataset.theme === 'dark';
}

function setTheme(dark) {
  // Freeze transitions for the swap so the whole page jumps to the new
  // palette in one repaint — see .theme-switching in experience.css. The
  // class is set before the attribute flips (so the no-transition style is
  // active when colors change) and cleared after the paint commits.
  root.classList.add('theme-switching');
  root.dataset.theme = dark ? 'dark' : 'light';
  updateButton();
  window.NZ?.emit('theme:change', { dark });
  requestAnimationFrame(() => {
    requestAnimationFrame(() => root.classList.remove('theme-switching'));
  });
}

function updateButton() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  btn.setAttribute('aria-label', isDark() ? 'Switch to light theme' : 'Switch to dark theme');
}

function init() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const dark = !isDark();
    try { localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light'); } catch (e) { /* private mode */ }
    setTheme(dark);
  });

  // follow the OS while the visitor hasn't made an explicit choice
  systemDark.addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) { /* private mode */ }
    if (!stored) setTheme(e.matches);
  });

  updateButton();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
