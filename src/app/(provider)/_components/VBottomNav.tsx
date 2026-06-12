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
        padding: "10px 18px 16px",
        borderTop: "1px solid var(--chrome-line)",
        background: "var(--chrome)",
      }}
    >
      {ITEMS.map(({ id, label, href, Icon }) => {
        const on = id === active;
        return (
          <Link
            key={id}
            href={href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
              textDecoration: "none",
              color: on ? "var(--terracotta-bright)" : "var(--chrome-dim)",
            }}
          >
            <Icon size={22} sw={on ? 2.2 : 2} />
            <span style={{ fontSize: 9.5, fontWeight: 500 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
