import { VerifiedCheck, Tag } from "@/components/ui";

/**
 * TrustStrip — the trust treatment (brief §2.2): restraint as reassurance.
 * A stranger is coming to someone's home, so credentials are visible but quiet —
 * the emerald verified check + calm credential tags, never a loud badge.
 */
const CREDENTIALS = ["Licensed", "Insured", "Background checked"];

export function TrustStrip() {
  return (
    <section style={{ padding: "72px 24px", background: "var(--moment)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <VerifiedCheck size={22} />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(24px, 3.5vw, 32px)", letterSpacing: "-0.01em", color: "var(--ink)" }}>
            Every pro is vetted.
          </span>
        </span>

        <p style={{ fontFamily: "var(--font-ui)", fontSize: 16, lineHeight: 1.55, color: "var(--ink-2)", margin: 0, maxWidth: 560 }}>
          A stranger is coming to your home. Before anyone gets matched, we check
          who they are — and your payment is held safely until the job&rsquo;s done.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 8 }}>
          {CREDENTIALS.map((c) => (
            <Tag key={c}>{c}</Tag>
          ))}
        </div>
      </div>
    </section>
  );
}
