"use client";

import { useState, useTransition } from "react";
import { saveSubjobRates, setMatchPrecision } from "@/lib/provider/actions";
import { SubjobPricingEditor, rateDraftOk, type RateMap } from "../onboarding/_components/SubjobPricingEditor";

/**
 * RatesManager — edit-later wrapper around the sub-job pricing editor. Loads the
 * provider's current rates, lets them adjust, and saves the whole set in one go
 * (saveSubjobRates replaces their rows). Dark chrome; terracotta = save.
 */
export function RatesManager({ initial, initialPrecise }: { initial: RateMap; initialPrecise: boolean }) {
  const [rates, setRates] = useState<RateMap>(initial);
  const [precise, setPrecise] = useState(initialPrecise);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const [, startPrecise] = useTransition();

  const togglePrecise = () => {
    const next = !precise;
    setPrecise(next);
    startPrecise(() => setMatchPrecision(next));
  };

  const valid = Object.values(rates).every(rateDraftOk);

  const save = () =>
    start(async () => {
      await saveSubjobRates(
        Object.values(rates).map((r) => ({
          serviceSlug: r.serviceSlug,
          optionSlug: r.optionSlug,
          model: r.model,
          amount: r.model === "flat" || r.model === "per_unit" ? Number(r.amount) : null,
          unit: r.model === "per_unit" ? r.unit : null,
          tiers: r.model === "tiered" ? r.tiers.map((t) => ({ label: t.label, amount: Number(t.amount) })) : undefined,
        })),
      );
      setSaved(true);
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* opt-in: narrow the feed from service-level to the exact sub-jobs you priced */}
      <button type="button" onClick={togglePrecise}
        style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "12px 14px", cursor: "pointer" }}>
        <span style={{ flex: 1 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>Only show jobs I've listed</span>
          <span style={{ display: "block", fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", marginTop: 2 }}>
            {precise ? "You only see requests for the exact sub-jobs you priced." : "You see every request in your trades (broader reach)."}
          </span>
        </span>
        <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 24, borderRadius: "var(--r-pill)", background: precise ? "var(--terracotta-bright)" : "var(--chrome-line)", position: "relative", transition: "background var(--dur-fast) var(--ease)" }}>
          <span style={{ position: "absolute", top: 3, left: precise ? 19 : 3, width: 18, height: 18, borderRadius: "var(--r-pill)", background: "var(--cream)", transition: "left var(--dur-fast) var(--ease)" }} />
        </span>
      </button>

      <SubjobPricingEditor
        rates={rates}
        onChange={(n) => {
          setRates(n);
          setSaved(false);
        }}
      />
      <div style={{ position: "sticky", bottom: 0, paddingBottom: 8, background: "linear-gradient(to top, var(--chrome) 70%, transparent)" }}>
        <button
          type="button"
          onClick={save}
          disabled={!valid || pending}
          style={{ width: "100%", borderRadius: 14, padding: 14, fontSize: 14.5, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: !valid || pending ? "not-allowed" : "pointer", opacity: !valid || pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}
        >
          {pending ? "Saving…" : saved ? "Saved ✓" : "Save pricing"}
        </button>
      </div>
    </div>
  );
}
