import { KeptConnectLogo } from "@/components/ui";
import { ButtonLink } from "./ButtonLink";

/**
 * Hero — the warmest moment on the site. Fraunces headline with the signature
 * terracotta period on a --moment cream band, the K-link mark, two CTAs.
 * A human moment, so warmth is allowed (no numbers here).
 */
export function Hero() {
  return (
    <section
      style={{
        background: "var(--moment)",
        padding: "96px 24px 104px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
        <KeptConnectLogo variant="mark" treatment="app-icon" size={64} />

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 500,
            fontSize: 12,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
            margin: 0,
          }}
        >
          The Uber for getting things done at a property
        </p>

        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 500,
            fontSize: "clamp(40px, 7vw, 64px)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: "var(--ink)",
            margin: 0,
          }}
        >
          Your property, handled<span style={{ color: "var(--terracotta)" }}>.</span>
        </h1>

        <p
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 400,
            fontSize: "clamp(16px, 2.2vw, 19px)",
            lineHeight: 1.5,
            color: "var(--ink-2)",
            margin: 0,
            maxWidth: 560,
          }}
        >
          Post a job, get matched with a vetted local pro, and watch it get done —
          from a leaky faucet to a full repaint. You never touch the money until
          it&rsquo;s finished.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, marginTop: 4 }}>
          <ButtonLink href="/sign-up" size="lg">
            Post a job
          </ButtonLink>
          <ButtonLink href="#providers" variant="outline" size="lg">
            I&rsquo;m a provider
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
