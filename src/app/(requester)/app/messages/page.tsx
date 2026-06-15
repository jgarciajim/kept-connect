import Link from "next/link";
import { Avatar } from "@/components/ui";
import { getMyThreads } from "@/lib/requester/mock";
import { AppHeader } from "../../_components/AppHeader";
import { BottomNav } from "../../_components/BottomNav";

// The requester's message threads (/app/messages) — one per booked job.
export default async function MessagesScreen() {
  const threads = await getMyThreads();

  return (
    <>
      <AppHeader title="Messages" backHref="/app" />
      <main style={{ flex: 1, overflowY: "auto", padding: "4px 16px 16px" }}>
        {threads.length === 0 ? (
          <p style={{ fontSize: 13.5, color: "var(--ink-3)", fontFamily: "var(--font-ui)", padding: "24px 4px", textAlign: "center" }}>
            Messages open once you&rsquo;ve booked a pro.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {threads.map((t) => (
              <Link key={t.id} href={`/app/messages/${t.id}`} style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 12, textDecoration: "none" }}>
                <Avatar name={t.providerName} size={42} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)", fontFamily: "var(--font-ui)" }}>{t.providerName}</span>
                    <span style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)", flex: "0 0 auto" }}>{t.when}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--ink-2)", marginTop: 1, fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.lastMessage}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <BottomNav active="messages" />
    </>
  );
}
