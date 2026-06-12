import { VBottomNav } from "./VBottomNav";

/**
 * Shown when the signed-in member has no provider_profiles row yet (e.g. a brand
 * new account, or before running the provider demo seed). Keeps the dark shell.
 */
export function ProviderEmptyState({ tab }: { tab: "jobs" | "active" | "earnings" | "you" }) {
  return (
    <>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-ui)", color: "var(--chrome-dim)", fontSize: 14, lineHeight: 1.5, maxWidth: 280 }}>
          No provider profile yet. Once you&rsquo;re set up as a provider, your jobs and earnings show up here.
        </p>
      </main>
      <VBottomNav active={tab} />
    </>
  );
}
