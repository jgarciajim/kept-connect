import Link from "next/link";
import { KeptConnectLogo } from "@/components/ui";
import { ButtonLink } from "./ButtonLink";

/**
 * MarketingHeader — sticky warm header. Logo lockup home, a quiet "Sign in"
 * text link, and the terracotta "Get started" CTA into Clerk sign-up.
 */
export function MarketingHeader() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 24px",
        background: "color-mix(in srgb, var(--canvas) 88%, transparent)",
        backdropFilter: "saturate(1.1) blur(8px)",
        borderBottom: "1px solid var(--hairline)",
      }}
    >
      <Link href="/" aria-label="Kept Connect home" style={{ display: "inline-flex" }}>
        <KeptConnectLogo variant="lockup" treatment="on-light" size={28} />
      </Link>

      <nav style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Link
          href="/sign-in"
          style={{
            fontFamily: "var(--font-ui)",
            fontWeight: 500,
            fontSize: 14,
            color: "var(--ink-2)",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
        <ButtonLink href="/sign-up" size="sm">
          Get started
        </ButtonLink>
      </nav>
    </header>
  );
}
