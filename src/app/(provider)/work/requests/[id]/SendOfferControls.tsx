"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { sendOffer, sendQuote } from "@/lib/provider/actions";

/**
 * SendOfferControls — the provider's two ways to bid: send an offer at their own
 * set rate (the primary path), or a custom sealed quote. Both persist as a quote
 * the requester accepts. If no rate is set for this service, the offer path points
 * to /work/rates first (the platform never invents a price).
 */
export function SendOfferControls({
  requestId,
  ownRate,
  rateSource,
}: {
  requestId: string;
  ownRate: string | null; // dollars, or null if no rate set
  rateSource: "own" | "benchmark" | null;
}) {
  const [custom, setCustom] = useState("");
  const [pending, startTransition] = useTransition();

  const offer = () => startTransition(() => sendOffer(requestId));
  const quote = () => {
    const amount = parseFloat(custom);
    if (!(amount > 0)) return;
    startTransition(() => sendQuote(requestId, amount));
  };

  return (
    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {ownRate ? (
        <button
          type="button"
          onClick={offer}
          disabled={pending}
          style={{ width: "100%", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}
        >
          Send offer · ${ownRate}
          <span style={{ fontSize: 11.5, opacity: 0.85, fontWeight: 400 }}> ({rateSource === "benchmark" ? "benchmark" : "your rate"})</span>
        </button>
      ) : (
        <Link
          href="/work/rates"
          style={{ width: "100%", borderRadius: 16, padding: 15, fontSize: 14, fontWeight: 500, background: "var(--chrome-card)", color: "var(--chrome-cream)", border: "1px solid var(--chrome-line)", textAlign: "center", textDecoration: "none", fontFamily: "var(--font-ui)" }}
        >
          Set a rate for this service first →
        </Link>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", fontSize: 15 }}>$</span>
        <input
          inputMode="decimal"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="custom quote"
          style={{ flex: 1, minWidth: 0, background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "11px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 14, fontVariantNumeric: "tabular-nums", outline: "none" }}
        />
        <button
          type="button"
          onClick={quote}
          disabled={pending}
          style={{ borderRadius: "var(--r-pill)", padding: "11px 16px", fontSize: 13.5, fontWeight: 500, background: "transparent", color: "var(--chrome-cream)", border: "1px solid var(--chrome-line)", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1, fontFamily: "var(--font-ui)", flex: "0 0 auto" }}
        >
          Send quote
        </button>
      </div>
    </div>
  );
}
