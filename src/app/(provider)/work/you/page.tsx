import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar, VerifiedCheck, Tag } from "@/components/ui";
import { getProviderSelf } from "@/lib/provider/mock";
import { VBottomNav } from "../../_components/VBottomNav";
import { ProviderEmptyState } from "../../_components/ProviderEmptyState";
import { PIconStar, PIconCheck, PIconWallet } from "../../_components/icons";

export default async function ProfileScreen() {
  const self = await getProviderSelf();
  if (!self) return <ProviderEmptyState tab="you" />;

  return (
    <>
      <main style={{ flex: 1, overflowY: "auto", padding: "12px 16px 16px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 26, margin: "6px 2px 16px", color: "var(--chrome-cream)", letterSpacing: "-0.015em" }}>
          You<span style={{ color: "var(--terracotta-bright)" }}>.</span>
        </h1>

        {/* identity + trust */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 16 }}>
          <Avatar name={self.name} size={56} />
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 19, color: "var(--chrome-cream)", letterSpacing: "-0.01em" }}>{self.name}</span>
              {self.verified && <VerifiedCheck size={16} />}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4, fontSize: 13, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
              <span style={{ color: "var(--terracotta-bright)", display: "flex" }}><PIconStar size={13} /></span>
              <span style={{ fontWeight: 500, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>{self.rating}</span>
              <span>· {self.jobsDone} jobs · {self.yearsOnKept} yr on Kept</span>
            </div>
            {self.online && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11.5, color: "var(--verified-bright)", fontFamily: "var(--font-ui)" }}>
                <span style={{ width: 7, height: 7, borderRadius: "var(--r-pill)", background: "var(--verified-bright)" }} /> Online · taking offers
              </div>
            )}
          </div>
        </div>

        <Section label="Verified credentials">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {self.credentials.map((c) => (
              <Tag key={c} icon={<PIconCheck size={12} />}>{c}</Tag>
            ))}
          </div>
        </Section>

        <Section label="Trades">
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            {self.trades.map((t) => (
              <Tag key={t} variant="trade">{t}</Tag>
            ))}
          </div>
        </Section>

        {/* cash-out shortcut — fast pay is always reachable */}
        <Link
          href="/work/earnings"
          style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 16, textDecoration: "none", marginTop: 4 }}
        >
          <span style={{ width: 38, height: 38, borderRadius: "var(--r-pill)", background: "var(--chrome-card-2)", color: "var(--terracotta-bright)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
            <PIconWallet size={18} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>Available to cash out</div>
            <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>Instant payout, any time</div>
          </div>
          <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 16, color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>${self.availableToCashOut}</span>
        </Link>
      </main>

      <VBottomNav active="you" />
    </>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ margin: "18px 0" }}>
      <div style={{ fontFamily: "var(--font-ui)", fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--chrome-dim)", fontWeight: 500, marginBottom: 9 }}>{label}</div>
      {children}
    </div>
  );
}
