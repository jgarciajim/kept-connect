"use client";

import Link from "next/link";
import { CategoryIcon } from "@/components/ui";
import { useMyRequests } from "./useRequests";
import { StatusPill } from "./StatusPill";

const ACTIVE = new Set(["finding", "quoted", "awarded", "enroute"]);

/**
 * InProgressRequests — the home's live in-progress rows from the lifecycle store
 * (active requests, newest first, linking to their detail). Renders nothing when
 * empty, so the home's seeded example jobs show through until you post one.
 */
export function InProgressRequests() {
  const active = useMyRequests().filter((r) => ACTIVE.has(r.status));
  if (active.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 10 }}>
      {active.map((r) => (
        <Link
          key={r.id}
          href={`/app/requests/${r.id}`}
          style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: 16, padding: 12, textDecoration: "none" }}
        >
          <CategoryIcon category={r.category} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", fontFamily: "var(--font-ui)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {r.title ?? r.description}
            </div>
            <div style={{ marginTop: 3 }}>
              <StatusPill status={r.status} />
            </div>
          </div>
          {r.agreedPrice != null && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 500, fontVariantNumeric: "tabular-nums", color: "var(--ink)", fontFamily: "var(--font-ui)" }}>${r.agreedPrice}</div>
              {r.etaMinutes != null && r.status === "enroute" && <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-ui)" }}>{r.etaMinutes} min</div>}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}
