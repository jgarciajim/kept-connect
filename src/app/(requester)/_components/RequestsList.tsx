"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/ui";
import { useMyRequests } from "./useRequests";
import { StatusPill } from "./StatusPill";

/**
 * RequestsList — the activity list (/app/requests) of listMyRequests(), newest
 * first, each row linking to its detail. Live from the store, so a status change
 * reflects here too. Empty until you post (store resets on reload).
 */
export function RequestsList() {
  const requests = useMyRequests();

  if (requests.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 16px" }}>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--ink)", margin: "0 0 6px" }}>No requests yet</p>
        <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: "0 0 18px", fontFamily: "var(--font-ui)" }}>Post your first job to see it here.</p>
        <Link href="/app/new" style={{ display: "inline-flex", height: 46, alignItems: "center", padding: "0 22px", borderRadius: "var(--r-pill)", background: "var(--terracotta)", color: "var(--cream)", fontWeight: 600, fontSize: 15, fontFamily: "var(--font-ui)", textDecoration: "none" }}>
          Post a request
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {requests.map((r) => (
        <Link
          key={r.id}
          href={`/app/requests/${r.id}`}
          style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-card)", padding: 12, textDecoration: "none" }}
        >
          <CategoryIcon category={r.category} size={42} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 14, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title ?? r.description}</span>
              <StatusPill status={r.status} />
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ink-2)", margin: "2px 0 0", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.description}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
