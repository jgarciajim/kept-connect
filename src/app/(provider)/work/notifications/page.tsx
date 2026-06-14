import Link from "next/link";
import type { ReactNode } from "react";
import { getNotifications, type Notification } from "@/lib/notifications";
import { MarkReadOnView } from "@/components/MarkReadOnView";
import { PIconBack } from "../../_components/icons";

// Provider notifications (/work/notifications). Opening the list marks all read.
export default async function ProviderNotificationsScreen() {
  const items = await getNotifications();

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px 12px" }}>
        <Link href="/work" aria-label="Back" style={{ width: 30, height: 30, borderRadius: "var(--r-pill)", background: "var(--chrome-card)", color: "var(--chrome-cream)", display: "inline-flex", alignItems: "center", justifyContent: "center", flex: "0 0 auto" }}>
          <PIconBack size={20} />
        </Link>
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 17, color: "var(--chrome-cream)" }}>Notifications</span>
      </div>
      <MarkReadOnView />

      <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px" }}>
        {items.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", padding: "24px 4px", textAlign: "center" }}>
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: 14 }}>
      <span style={{ width: 8, height: 8, borderRadius: "var(--r-pill)", marginTop: 5, flex: "0 0 auto", background: n.read ? "transparent" : "var(--terracotta-bright)" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-ui)", fontWeight: 600, fontSize: 14, color: "var(--chrome-cream)" }}>{n.title}</div>
        {n.body && <div style={{ fontSize: 13, color: "var(--chrome-dim)", marginTop: 2, fontFamily: "var(--font-ui)" }}>{n.body}</div>}
        <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", marginTop: 4, fontFamily: "var(--font-ui)", opacity: 0.75 }}>{n.when}</div>
      </div>
    </div>
  );
  return n.requestId ? (
    <Link href={`/work/jobs/${n.requestId}`} style={{ textDecoration: "none" }}>{inner}</Link>
  ) : (
    (inner as ReactNode)
  );
}
