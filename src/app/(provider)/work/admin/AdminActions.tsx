"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveVerification, rejectVerification } from "@/lib/admin/actions";

/** Approve / reject controls for one verification application. */
export function AdminActions({ memberId }: { memberId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const approve = () => start(async () => { await approveVerification(memberId); router.refresh(); });
  const reject = () =>
    start(async () => {
      await rejectVerification(memberId, reason);
      router.refresh();
    });

  if (rejecting) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (shown to the provider)"
          style={{ background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "10px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 13.5, outline: "none" }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" disabled={pending || !reason.trim()} onClick={reject} style={{ ...btn, background: "var(--terracotta-bright)", color: "var(--cream)", opacity: pending || !reason.trim() ? 0.5 : 1 }}>Confirm reject</button>
          <button type="button" onClick={() => setRejecting(false)} style={{ ...btn, background: "transparent", color: "var(--chrome-dim)", border: "1px solid var(--chrome-line)" }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
      <button type="button" disabled={pending} onClick={approve} style={{ ...btn, flex: 1, background: "var(--verified-bright)", color: "var(--cream)", opacity: pending ? 0.5 : 1 }}>Approve</button>
      <button type="button" disabled={pending} onClick={() => setRejecting(true)} style={{ ...btn, background: "transparent", color: "var(--chrome-dim)", border: "1px solid var(--chrome-line)" }}>Reject</button>
    </div>
  );
}

const btn: React.CSSProperties = { borderRadius: "var(--r-pill)", padding: "10px 16px", fontSize: 13.5, fontWeight: 500, border: "none", cursor: "pointer", fontFamily: "var(--font-ui)" };
