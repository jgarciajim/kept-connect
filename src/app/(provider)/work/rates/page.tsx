import { getProviderSelf, getProviderRates } from "@/lib/provider/mock";
import { SERVICES } from "@/lib/requester/services";
import { benchmarkFor, benchmarkMidpoint, formatUsd } from "@/lib/pricing";
import { VBottomNav } from "../../_components/VBottomNav";
import { ProviderEmptyState } from "../../_components/ProviderEmptyState";
import { RatesEditor, type RateRow } from "./RatesEditor";

/**
 * Rates — the classification spine as UI. The provider sets their OWN price per
 * service, or opts into the platform benchmark (logged). Every offer later reads
 * from here; the platform never sets the price. Services shown = those in the
 * provider's trades.
 */
export default async function RatesScreen() {
  const self = await getProviderSelf();
  if (!self) return <ProviderEmptyState tab="you" />;

  const rates = await getProviderRates();
  const byService = new Map(rates.map((r) => [r.serviceSlug, r]));

  const rows: RateRow[] = SERVICES.filter((s) => self.tradeKeys.includes(s.family)).map((s) => {
    const range = benchmarkFor(s.slug);
    const mid = benchmarkMidpoint(s.slug);
    const current = byService.get(s.slug);
    return {
      slug: s.slug,
      label: s.label,
      currentAmount: current?.amount ?? null,
      currentSource: current?.rateSource ?? null,
      benchmarkRange: range ? `${formatUsd(range.low)}–${formatUsd(range.high)}` : null,
      benchmarkMid: mid != null ? formatUsd(mid) : null,
    };
  });

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 4px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          Your rates<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>
        <p style={{ fontSize: 12.5, color: "var(--chrome-dim)", margin: "0 2px 16px", fontFamily: "var(--font-ui)", lineHeight: 1.45 }}>
          Set your own price, or opt into the local benchmark. Your offers always go out at your rate —
          benchmarks are a planning baseline, not a quote.
        </p>

        {rows.length === 0 ? (
          <div style={{ color: "var(--chrome-dim)", fontSize: 13, padding: "8px 4px", fontFamily: "var(--font-ui)" }}>
            No trades on your profile yet.
          </div>
        ) : (
          <RatesEditor rows={rows} />
        )}
      </main>

      <VBottomNav active="you" />
    </>
  );
}
