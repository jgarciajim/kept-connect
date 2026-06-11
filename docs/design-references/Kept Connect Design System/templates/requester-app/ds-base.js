// Kept Connect design system — base loader for templates.
// One file, one line to edit: point `base` at the design system root.
// In THIS design system, '../..' resolves to the project root. In a consuming
// project, point it at the bound _ds/<folder> tree relative to this page.
(() => {
  const base = '../..';
  for (const p of ['styles.css']) {
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + '/' + p;
    document.head.appendChild(l);
  }
  const s = document.createElement('script');
  s.src = base + '/_ds_bundle.js';
  s.onerror = () => console.error('ds-base.js: failed to load ' + s.src +
    ' — in a consuming project point the base line at the bound _ds/<folder> tree; in a fresh design system the bundle may not be compiled yet');
  document.head.appendChild(s);
})();
