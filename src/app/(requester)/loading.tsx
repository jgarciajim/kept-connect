// Route-group loading state — shown while a requester screen's server component
// fetches during navigation. Renders inside the warm app column (Surface tone).
export default function Loading() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, color: "var(--ink-3)" }}>
      <span
        className="kc-spin"
        style={{ width: 26, height: 26, borderRadius: "var(--r-pill)", border: "2.5px solid var(--hairline)", borderTopColor: "var(--terracotta)", display: "block" }}
      />
      <span style={{ fontFamily: "var(--font-ui)", fontSize: 13 }}>Loading…</span>
      <style>{"@keyframes kc-spin{to{transform:rotate(360deg)}}.kc-spin{animation:kc-spin .8s linear infinite}@media (prefers-reduced-motion:reduce){.kc-spin{animation:none}}"}</style>
    </div>
  );
}
