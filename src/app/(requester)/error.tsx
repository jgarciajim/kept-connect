"use client";

import { useEffect } from "react";

/**
 * Route-group error boundary (warm app). Catches render/data errors in any
 * requester screen and offers a retry instead of the default crash page.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "0 32px", textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--ink)", margin: 0 }}>
        Something went wrong<span style={{ color: "var(--terracotta)" }}>.</span>
      </h2>
      <p style={{ fontFamily: "var(--font-ui)", fontSize: 13.5, color: "var(--ink-2)", margin: 0, maxWidth: 280 }}>
        That screen hit a snag. Try again — if it keeps happening, head back home.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{ marginTop: 6, background: "var(--terracotta)", color: "var(--cream)", border: "none", borderRadius: "var(--r-pill)", padding: "10px 22px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
      >
        Try again
      </button>
      <a href="/app" style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", textDecoration: "none" }}>
        Back to home
      </a>
    </div>
  );
}
