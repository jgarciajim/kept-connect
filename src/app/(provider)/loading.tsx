// Route-group loading state — shown while a provider screen's server component
// fetches during navigation. Renders inside the dark work-tool column.
export default function Loading() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--chrome-dim)" }}>
      <span
        className="kc-spin"
        style={{ width: 26, height: 26, borderRadius: "var(--r-pill)", border: "2.5px solid var(--chrome-line)", borderTopColor: "var(--terracotta-bright)", display: "block" }}
      />
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>Loading…</span>
      <style>{"@keyframes kc-spin{to{transform:rotate(360deg)}}.kc-spin{animation:kc-spin .8s linear infinite}@media (prefers-reduced-motion:reduce){.kc-spin{animation:none}}"}</style>
    </div>
  );
}
