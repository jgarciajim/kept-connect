import { getProviderSelf, getSubjobRates } from "@/lib/provider/mock";
import { rateKey, type RateMap } from "../onboarding/_components/SubjobPricingEditor";
import { VBottomNav } from "../../_components/VBottomNav";
import { ProviderEmptyState } from "../../_components/ProviderEmptyState";
import { RatesManager } from "./RatesManager";

/**
 * Rates — the per-sub-job pricing editor (the classification spine). The provider
 * sets their OWN price per sub-job (flat / per-unit / quote); offers read from here.
 * The platform never sets the price.
 */
export default async function RatesScreen() {
  const self = await getProviderSelf();
  if (!self) return <ProviderEmptyState tab="you" />;

  const rates = await getSubjobRates();
  const initial: RateMap = {};
  for (const r of rates) {
    initial[rateKey(r.serviceSlug, r.optionSlug)] = {
      serviceSlug: r.serviceSlug,
      optionSlug: r.optionSlug,
      model: r.model === "per_unit" ? "per_unit" : r.model === "quote" ? "quote" : "flat",
      amount: r.amount ?? "",
      unit: r.unit ?? "sqft",
    };
  }

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 4px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          Your services<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--chrome-dim)", margin: "0 2px 16px", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
          Pick the jobs you take and set your price for each. You only receive requests for what you list —
          your offers always go out at your rate.
        </p>
        <RatesManager initial={initial} />
      </main>
      <VBottomNav active="you" />
    </>
  );
}
