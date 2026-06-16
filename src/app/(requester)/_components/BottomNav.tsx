import Link from "next/link";
import { IconHome, IconJobs, IconChat, IconUser } from "./icons";

/**
 * BottomNav — the app's persistent tab bar. Active tab in terracotta.
 */
type Tab = "home" | "jobs" | "messages" | "you";

const ITEMS: { id: Tab; label: string; href: string; Icon: typeof IconHome }[] = [
  { id: "home", label: "Home", href: "/app", Icon: IconHome },
  { id: "jobs", label: "Jobs", href: "/app/jobs", Icon: IconJobs },
  { id: "messages", label: "Messages", href: "/app/messages", Icon: IconChat },
  { id: "you", label: "You", href: "/app/you", Icon: IconUser },
];

export function BottomNav({ active = "home" }: { active?: Tab }) {
  return (
    <nav
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 30,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        gap: 4,
        margin: "0 14px",
        marginBottom: "max(12px, env(safe-area-inset-bottom))",
        padding: 7,
        background: "var(--paper)",
        border: "1px solid var(--hairline)",
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
              color: on ? "var(--terracotta)" : "var(--ink-3)",
              background: on ? "var(--terracotta-tint)" : "transparent",
            }}
          >
            <Icon size={23} sw={on ? 2.2 : 2} />
          </Link>
        );
      })}
    </nav>
  );
}
