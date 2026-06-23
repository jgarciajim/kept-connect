import Link from "next/link";
import { PIconCheck } from "../../../_components/icons";

/** Onboarding submitted — the provider is in review and goes live on approval. */
export default function OnboardingDone() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: "0 28px", textAlign: "center" }}>
      <span style={{ width: 56, height: 56, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", color: "var(--terracotta-bright)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <PIconCheck size={26} />
      </span>
      <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 23, color: "var(--chrome-cream)", margin: 0 }}>
        You&rsquo;re in review<span style={{ color: "var(--terracotta-bright)" }}>.</span>
      </h1>
      <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", margin: 0, maxWidth: 300, lineHeight: 1.5 }}>
        Thanks — we&rsquo;re reviewing your background check, ID, license, and insurance. We&rsquo;ll let you know
        the moment you&rsquo;re approved to go live and start receiving jobs.
      </p>
      <Link href="/work/you" style={{ marginTop: 6, background: "var(--terracotta-bright)", color: "var(--cream)", borderRadius: "var(--r-pill)", padding: "11px 22px", fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
        Go to your profile
      </Link>
    </main>
  );
}
