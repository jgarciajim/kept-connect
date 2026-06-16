import Link from "next/link";
import { PIconJobs, PIconActive, PIconWallet, PIconUser } from "./icons";

/**
 * VBottomNav — the provider tab bar. Dark chrome; active tab in terracotta-bright.
 */
type Tab = "jobs" | "active" | "earnings" | "you";

const ITEMS: { id: Tab; label: string; href: string; Icon: typeof PIconJobs }[] = [
  { id: "jobs", label: "Jobs", href: "/work", Icon: PIconJobs },
  { id: "active", label: "Active", href: "/work/jobs/active", Icon: PIconActive },
  { id: "earnings", label: "Earnings", href: "/work/earnings", Icon: PIconWallet },
  { id: "you", label: "You", href: "/work/you", Icon: PIconUser },
];

export function VBottomNav({ active = "jobs" }: { active?: Tab }) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        gap: 4,
        margin: "0 14px",
        marginBottom: "max(12px, env(safe-area-inset-bottom))",
        padding: 7,
        background: "var(--chrome-card)",
        border: "1px solid var(--chrome-line)",
        borderRadius: "var(--r-pill)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {ITEMS.map(({ id, label, href, Icon }) => {
        const on = id === active;
        return (
          <Link
            key={id}
            href={href}
            aria-label={label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 46,
              height: 40,
              borderRadius: "var(--r-pill)",
              textDecoration: "none",
              color: on ? "var(--terracotta-bright)" : "var(--chrome-dim)",
              background: on ? "var(--chrome-card-2)" : "transparent",
            }}
          >
            <Icon size={23} sw={on ? 2.2 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
