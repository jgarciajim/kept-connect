import Link from "next/link";
import { KeptConnectLogo } from "@/components/ui";
import { ButtonLink } from "./ButtonLink";

/**
 * MarketingFooter — a final warm CTA band, then quiet footer links + fine print.
 */
const LINKS: { label: string; href: string }[] = [
  { label: "How it works", href: "#how-it-works" },
  { label: "For providers", href: "#providers" },
  { label: "Sign in", href: "/sign-in" },
];

export function MarketingFooter() {
  return (
    <footer>
      {/* Closing CTA — a human moment, warm cream. */}
      <section style={{ background: "var(--moment)", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 620, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: "clamp(28px, 4.5vw, 42px)", letterSpacing: "-0.015em", color: "var(--ink)", margin: 0 }}>
            Something need doing<span style={{ color: "var(--terracotta)" }}>?</span>
          </h2>
          <ButtonLink href="/sign-up" size="lg">
            Post a job
          </ButtonLink>
        </div>
      </section>

      {/* Quiet footer bar. */}
      <div
        style={{
          background: "var(--canvas)",
          borderTop: "1px solid var(--hairline)",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1040,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <KeptConnectLogo variant="lockup" treatment="on-light" size={24} />
          <nav style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-2)", textDecoration: "none" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-3)", margin: 0 }}>
            © 2026 Kept Connect
          </p>
        </div>
      </div>
    </footer>
  );
}
