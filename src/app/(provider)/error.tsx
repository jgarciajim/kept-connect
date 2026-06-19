"use client";

import { useEffect } from "react";

/**
 * Route-group error boundary (dark work tool). Catches render/data errors in any
 * provider screen and offers a retry instead of the default crash page.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 32px", textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--chrome-cream)", margin: 0 }}>
        Something went wrong<span style={{ color: "var(--terracotta-bright)" }}>.</span>
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--chrome-dim)", margin: 0, maxWidth: 280 }}>
        That screen hit a snag. Try again — if it keeps happening, head back to your jobs.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{ marginTop: 6, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", borderRadius: "var(--r-pill)", padding: "10px 22px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
      >
        Try again
      </button>
      <a href="/work" style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--chrome-dim)", textDecoration: "none" }}>
        Back to jobs
      </a>
    </div>
  );
}
