import Link from "next/link";

/** Route-group 404 (warm app) — e.g. a job id that doesn't exist or isn't yours. */
export default function NotFound() {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 32px", textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)", margin: 0 }}>
        Not found<span style={{ color: "var(--terracotta)" }}>.</span>
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-2)", margin: 0, maxWidth: 280 }}>
        We couldn’t find that page — it may have moved, or it isn’t yours to view.
      </p>
      <Link
        href="/app"
        style={{ marginTop: 6, background: "var(--terracotta)", color: "var(--cream)", borderRadius: "var(--r-pill)", padding: "10px 22px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}
      >
        Back to home
      </Link>
    </div>
  );
}
