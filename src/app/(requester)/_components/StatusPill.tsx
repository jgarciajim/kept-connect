import type { RequestStatus } from "@/lib/requester/requests";

/**
 * StatusPill — the request lifecycle status as a small pill. Only the live state
 * (`enroute`) carries terracotta (with a dot); every other state is neutral ink,
 * keeping the action color reserved for what's actually moving.
 */
const LABELS: Record<RequestStatus, string> = {
  finding: "Finding pros",
  quoted: "Quote in",
  awarded: "Booked",
  enroute: "On the way",
  complete: "Complete",
  paid: "Paid",
  rated: "Rated",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: RequestStatus }) {
  const live = status === "enroute";
  const muted = status === "cancelled";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 11.5,
        fontWeight: 600,
        fontFamily: "var(--font-ui)",
        color: live ? "var(--terracotta)" : muted ? "var(--ink-3)" : "var(--ink-2)",
        background: live ? "var(--terracotta-tint)" : "var(--neutral)",
        padding: "3px 9px",
        borderRadius: "var(--r-pill)",
      }}
    >
      {live && <span style={{ width: 6, height: 6, borderRadius: "var(--r-pill)", background: "var(--terracotta)" }} />}
      {LABELS[status]}
    </span>
  );
}
