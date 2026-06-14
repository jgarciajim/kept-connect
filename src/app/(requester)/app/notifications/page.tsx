import Link from "next/link";
import type { ReactNode } from "react";
import { getNotifications, type Notification } from "@/lib/notifications";
import { MarkReadOnView } from "@/components/MarkReadOnView";
import { AppHeader } from "../../_components/AppHeader";

// Requester notifications (/app/notifications). Opening the list marks all read.
export default async function NotificationsScreen() {
  const items = await getNotifications();

  return (
    <>
      <AppHeader title="Notifications" backHref="/app" />
      <MarkReadOnView />

      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", fontFamily: "var(--font-ui)", padding: "24px 4px", textAlign: "center" }}>
            No notifications yet.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {items.map((n) => (
              <Row key={n.id} n={n} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function Row({ n }: { n: Notification }) {
  const inner = (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 14 }}>
      <span style={{ width: 8, height: 8, borderRadius: "var(--r-pill)", marginTop: 5, flex: "0 0 auto", background: n.read ? "transparent" : "var(--terracotta)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--ink)" }}>{n.title}</div>
        {n.body && <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{n.body}</div>}
        <div style={{ fontSize: 11.5, color: "var(--ink-3)", marginTop: 4, fontFamily: "var(--font-ui)" }}>{n.when}</div>
      </div>
    </div>
  );
  return n.requestId ? (
    <Link href={`/app/jobs/${n.requestId}`} style={{ textDecoration: "none" }}>{inner}</Link>
  ) : (
    (inner as ReactNode)
  );
}
