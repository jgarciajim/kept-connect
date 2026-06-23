"use client";

import { useState, useTransition } from "react";
import { saveSubjobRates } from "@/lib/provider/actions";
import { SubjobPricingEditor, OTHER_SLUG, type RateMap } from "../onboarding/_components/SubjobPricingEditor";

/**
 * RatesManager — edit-later wrapper around the sub-job pricing editor. Loads the
 * provider's current rates, lets them adjust, and saves the whole set in one go
 * (saveSubjobRates replaces their rows). Dark chrome; terracotta = save.
 */
export function RatesManager({ initial }: { initial: RateMap }) {
  const [rates, setRates] = useState<RateMap>(initial);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const valid = Object.values(rates).every(
    (r) => r.optionSlug === OTHER_SLUG || r.model === "quote" || Number(r.amount) > 0,
  );

  const save = () =>
    start(async () => {
      await saveSubjobRates(
        Object.values(rates).map((r) => ({
          serviceSlug: r.serviceSlug,
          optionSlug: r.optionSlug,
          model: r.model,
          amount: r.model === "quote" ? null : Number(r.amount),
          unit: r.model === "per_unit" ? r.unit : null,
        })),
      );
      setSaved(true);
    });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
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
