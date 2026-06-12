import { getEarnings } from "@/lib/provider/mock";
import { VBottomNav } from "../../_components/VBottomNav";

export default async function EarningsScreen() {
  const earnings = await getEarnings();
  const stats: [string, string][] = [
    ["This week", `$${earnings.thisWeek}`],
    ["Jobs", String(earnings.jobsThisWeek)],
    ["Rating", earnings.rating.toFixed(1)],
  ];

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 16px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          Earnings<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>

        {/* instant cash out — the supply-retention lever */}
        <div style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 18 }}>
          <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Available to cash out</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 32, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums", marginTop: 2 }}>${earnings.availableToCashOut}</div>
          <button
            type="button"
            style={{ marginTop: 13, width: "100%", height: 44, borderRadius: "var(--r-pill)", border: "none", background: "var(--terracotta-bright)", color: "var(--cream)", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 15, cursor: "pointer" }}
          >
            Cash out instantly
          </button>
        </div>

        {/* stats */}
        <div style={{ display: "flex", gap: 11, margin: "12px 0 20px" }}>
          {stats.map(([label, value]) => (
            <div key={label} style={{ flex: 1, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 12, padding: "12px 10px" }}>
              <div style={{ fontSize: 17, fontWeight: 500, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-ui)" }}>{value}</div>
              <div style={{ fontSize: 11, color: "var(--chrome-dim)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* payout history — tabular */}
        <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", margin: "0 4px 9px", fontFamily: "var(--font-ui)" }}>Recent payouts</div>
        <div style={{ background: "var(--chrome-card)", borderRadius: 16, overflow: "hidden", border: "1px solid var(--chrome-line)" }}>
          {earnings.payouts.map((r, i) => (
            <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderTop: i ? "1px solid var(--chrome-line)" : "none" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{r.job}</div>
                <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", marginTop: 1, fontFamily: "var(--font-ui)" }}>{r.who} · {r.when}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-ui)" }}>${r.amount}</div>
                <div style={{ fontSize: 10.5, color: r.status === "Paid" ? "var(--verified-bright)" : "var(--terracotta-bright)", marginTop: 1, fontFamily: "var(--font-ui)" }}>{r.status}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <VBottomNav active="earnings" />
    </>
  );
}
