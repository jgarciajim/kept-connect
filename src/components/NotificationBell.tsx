import Link from "next/link";

/**
 * NotificationBell — a bell with an unread badge, surface-agnostic (inherits
 * currentColor; badge uses the bright terracotta when present, else terracotta).
 * Server component: just a link; the count is fetched by the page.
 */
export function NotificationBell({ href, count }: { href: string; count: number }) {
  return (
    <Link href={href} aria-label="Notifications" style={{ position: "relative", display: "inline-flex", color: "inherit" }}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
        <path d="M10.5 20a1.5 1.5 0 0 0 3 0" />
      </svg>
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -5,
            right: -5,
            minWidth: 16,
            height: 16,
            padding: "0 4px",
            borderRadius: "var(--r-pill)",
            background: "var(--terracotta-bright, var(--terracotta))",
            color: "var(--cream)",
            fontSize: 10,
            fontWeight: 600,
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-ui)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
