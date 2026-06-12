"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CategoryIcon } from "@/components/ui";
import type { Offer } from "@/lib/provider/mock";

/**
 * OfferCard — the round-robin dispatch mechanic as UI. One offer at a time, a
 * live respond timer, accept at the SET rate (no bidding war), or decline.
 * First-accept wins. Client: the countdown ticks and Accept/Decline mutate.
 */
function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function OfferCard({ offer, activeHref }: { offer: Offer; activeHref: string }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState(offer.respondSeconds);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  if (dismissed) {
    return (
      <div style={{ color: "var(--chrome-dim)", fontSize: 13, padding: "14px 4px", fontFamily: "var(--font-ui)" }}>
        Offer declined — we&rsquo;ll send the next one.
      </div>
    );
  }

  const expired = remaining <= 0;

  return (
    <div style={{ position: "relative", background: "var(--chrome-card-2)", border: "1px solid var(--terracotta-deep)", borderRadius: 18, padding: 14 }}>
      <span style={{ position: "absolute", top: 12, right: 14, fontSize: 11, color: "var(--terracotta-bright)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-ui)" }}>
        {expired ? "expired" : fmt(remaining)}
      </span>

      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <CategoryIcon category={offer.trade} size={42} />
        <div>
          <div style={{ fontSize: 14.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{offer.title}</div>
          <div style={{ fontSize: 12, color: "var(--chrome-dim)", marginTop: 1, fontFamily: "var(--font-ui)" }}>{offer.place} · {offer.distance}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "12px 0" }}>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 24, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>${offer.pay}</span>
        <span style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{offer.note}</span>
      </div>

      <div style={{ display: "flex", gap: 9 }}>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          style={{ flex: 1, borderRadius: "var(--r-pill)", padding: 11, fontSize: 13.5, fontWeight: 500, background: "transparent", color: "var(--chrome-dim)", border: "1px solid var(--chrome-line)", cursor: "pointer", fontFamily: "var(--font-ui)" }}
        >
          Decline
        </button>
        <button
          type="button"
          disabled={expired}
          onClick={() => router.push(activeHref)}
          style={{ flex: 1, borderRadius: "var(--r-pill)", padding: 11, fontSize: 13.5, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: expired ? "not-allowed" : "pointer", opacity: expired ? 0.5 : 1, fontFamily: "var(--font-ui)" }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
