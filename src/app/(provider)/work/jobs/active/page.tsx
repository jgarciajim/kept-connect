import Link from "next/link";
import { CategoryIcon } from "@/components/ui";
import { getProviderSelf, getActiveJobsList } from "@/lib/provider/mock";
import { VBottomNav } from "../../../_components/VBottomNav";
import { ProviderEmptyState } from "../../../_components/ProviderEmptyState";

// The provider's active jobs (/work/jobs/active) — awarded + enroute. The "Active"
// tab destination (previously an orphan route).
export default async function ActiveJobsScreen() {
  const [self, jobs] = await Promise.all([getProviderSelf(), getActiveJobsList()]);
  if (!self) return <ProviderEmptyState tab="active" />;

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 16px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          Active jobs<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>

        {jobs.length === 0 ? (
          <p style={{ color: "var(--chrome-dim)", fontSize: 13.5, fontFamily: "var(--font-ui)", padding: "8px 2px" }}>No active jobs right now.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map((j) => (
              <Link key={j.id} href={`/work/jobs/${j.id}`} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "11px 12px", textDecoration: "none" }}>
                <CategoryIcon category={j.trade} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{j.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{j.place} · {j.time}</div>
                </div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums", fontFamily: "var(--font-ui)" }}>${j.pay}</span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <VBottomNav active="active" />
    </>
  );
}
