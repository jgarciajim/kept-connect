import Link from "next/link";
import { VBottomNav } from "./VBottomNav";

/**
 * Shown when the signed-in member has no provider_profiles row yet (a brand-new
 * account). The entry point into onboarding — become a provider in-app.
 */
export function ProviderEmptyState({ tab }: { tab: "jobs" | "active" | "earnings" | "you" }) {
  return (
    <>
      <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: 32, textAlign: "center" }}>
        <div>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 22, color: "var(--chrome-cream)", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
            Work that comes to you<span style={{ color: "var(--terracotta-bright)" }}>.</span>
          </p>
          <p style={{ fontFamily: "var(--font-ui)", color: "var(--chrome-dim)", fontSize: 14, lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>
            Set your rates, accept the offers you want, cash out instantly. Get set up in under a minute.
          </p>
        </div>
        <Link
          href="/work/start"
          style={{ borderRadius: 16, padding: "14px 22px", fontSize: 15, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", textDecoration: "none", fontFamily: "var(--font-ui)" }}
        >
          Become a provider
        </Link>
      </main>
      <VBottomNav active={tab} />
    </>
  );
}
