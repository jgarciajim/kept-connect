import Link from "next/link";
import { IconHome, IconJobs, IconChat, IconUser } from "./icons";

/**
 * BottomNav — the app's persistent tab bar. Active tab in terracotta.
 * (Jobs/Messages point at Home for now — those index screens aren't built yet.)
 */
type Tab = "home" | "jobs" | "messages" | "you";

const ITEMS: { id: Tab; label: string; href: string; Icon: typeof IconHome }[] = [
  { id: "home", label: "Home", href: "/app", Icon: IconHome },
  { id: "jobs", label: "Jobs", href: "/app", Icon: IconJobs },
  { id: "messages", label: "Messages", href: "/app", Icon: IconChat },
  { id: "you", label: "You", href: "/app/you", Icon: IconUser },
];

export function BottomNav({ active = "home" }: { active?: Tab }) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-around",
        padding: "10px 18px 16px",
        borderTop: "1px solid var(--hairline)",
        background: "var(--canvas)",
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
              color: on ? "var(--terracotta)" : "var(--ink-3)",
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
