"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/ui";
import { markOnMyWay, completeJob } from "@/lib/provider/actions";
import { releaseAndPay } from "@/lib/payments/actions";
import type { ActiveJob } from "@/lib/provider/mock";
import { PIconPhone, PIconChat, PIconCam, PIconCheck } from "./icons";

/**
 * ActiveJobFlow — the live job. One terracotta action per state:
 * On my way → Mark complete → Mark paid → "Paid — nice work." Each tap runs the
 * matching SECURITY DEFINER RPC (column-safe transition), then advances. "On my
 * way" opens a quick pick — the provider self-reports how far out they are ("10 min
 * away"), which the customer sees. No location tracking. "Mark paid" releases the
 * held escrow (payout to the provider's wallet).
 */
const STAGES = ["On my way", "Mark complete", "Mark paid"] as const;
/** Jobber-style self-reported ETA presets (minutes). */
const ETA_OPTIONS = [5, 10, 15, 20, 30, 45] as const;

export function ActiveJobFlow({ job }: { job: ActiveJob }) {
  // Start past "On my way" if the job is already enroute (so a reload can't re-fire it).
  const [stage, setStage] = useState(job.status === "enroute" ? 1 : 0);
  const [busy, setBusy] = useState(false);
  const [picking, setPicking] = useState(false); // showing the ETA quick-pick
  const done = stage >= STAGES.length;

  // Stage 0: provider taps an ETA (or "Not sure" → null). Transitions awarded→enroute.
  async function declareEta(mins: number | null) {
    if (busy) return;
    setBusy(true);
    try {
      await markOnMyWay(job.id, mins);
      setPicking(false);
      setStage(1);
    } finally {
      setBusy(false);
    }
  }

  // Stages 1–2: complete → pay. Advances only when the transition succeeded.
  async function advance() {
    if (busy || done || stage === 0) return;
    setBusy(true);
    try {
      if (stage === 1) await completeJob(job.id);
      else await releaseAndPay(job.id);
      setStage((s) => s + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ flex: 1, overflowY: "auto", padding: "0 16px 16px", display: "flex", flexDirection: "column" }}>
      {/* map — colors tokenized (no hardcoded hex) */}
      <div style={{ height: 120, borderRadius: 16, overflow: "hidden", border: "1px solid var(--chrome-line)" }}>
        <svg viewBox="0 0 280 120" preserveAspectRatio="xMidYMid slice" style={{ display: "block", width: "100%", height: "100%" }}>
          <rect width="280" height="120" fill="var(--chrome-card)" />
          <g stroke="var(--chrome-card-2)" strokeWidth="6" strokeLinecap="round">
            <path d="M-10 36 H290" /><path d="M-10 92 H290" /><path d="M80 -10 V130" /><path d="M205 -10 V130" />
          </g>
          <path d="M80 92 L80 60 L205 60 L205 36" fill="none" stroke="var(--terracotta-bright)" strokeWidth="4" strokeLinecap="round" />
          <circle cx="80" cy="92" r="7" fill="var(--terracotta-bright)" stroke="var(--chrome)" strokeWidth="3" />
          <g transform="translate(205 36)">
            <path d="M0 6 C0 6 8 0 8 -6 A8 8 0 1 0 -8 -6 C-8 0 0 6 0 6 z" fill="var(--chrome-cream)" />
            <circle cx="0" cy="-6" r="3" fill="var(--chrome)" />
          </g>
        </svg>
      </div>

      {/* masked customer */}
      <div style={{ display: "flex", alignItems: "center", gap: 11, background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 16, padding: 12, marginTop: 12 }}>
        <Avatar name={job.customerName} size={38} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{job.customerName}</div>
          <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{job.addressLine}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/work/jobs/active" aria-label="Call" style={iconBtn}><PIconPhone size={17} /></Link>
          <Link href="/work/jobs/active" aria-label="Message" style={iconBtn}><PIconChat size={17} /></Link>
        </div>
      </div>

      {/* before / after proof capture */}
      <div style={{ display: "flex", gap: 9, marginTop: 12 }}>
        {["Before", "After"].map((l) => (
          <div key={l} style={{ flex: 1, height: 62, border: "1.5px dashed var(--chrome-line)", borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, color: "var(--chrome-dim)", fontSize: 10.5, fontFamily: "var(--font-ui)" }}>
            <PIconCam size={18} /><span>{l}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 13, fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
        <span>Payout on completion</span>
        <b style={{ color: "var(--chrome-cream)", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>${job.payout}</b>
      </div>

      {/* one action per state */}
      <div style={{ marginTop: "auto", paddingTop: 16 }}>
        {done ? (
          <div style={{ textAlign: "center", color: "var(--verified-bright)", fontWeight: 500, fontSize: 15, padding: 15, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-ui)" }}>
            <PIconCheck size={20} /> Paid — nice work.
          </div>
        ) : stage === 0 && picking ? (
          <div>
            <div style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", marginBottom: 9, textAlign: "center" }}>
              How far out are you?
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {ETA_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => declareEta(m)}
                  disabled={busy}
                  style={{ background: "var(--chrome-card)", color: "var(--chrome-cream)", border: "1px solid var(--chrome-line)", borderRadius: 13, padding: "13px 0", fontSize: 14.5, fontWeight: 500, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.5 : 1, fontFamily: "var(--font-ui)", fontVariantNumeric: "tabular-nums" }}
                >
                  {m} min
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => declareEta(null)}
              disabled={busy}
              style={{ width: "100%", background: "transparent", color: "var(--chrome-dim)", border: "none", padding: "12px 0 2px", fontSize: 12.5, cursor: busy ? "not-allowed" : "pointer", fontFamily: "var(--font-ui)" }}
            >
              Not sure — just let them know I’m coming
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={stage === 0 ? () => setPicking(true) : advance}
            disabled={busy}
            style={{ width: "100%", background: "var(--terracotta-bright)", color: "var(--cream)", textAlign: "center", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500, border: "none", cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, fontFamily: "var(--font-ui)" }}
          >
            {busy ? "…" : STAGES[stage]}
          </button>
        )}
      </div>
    </main>
  );
}

const iconBtn = {
  width: 36,
  height: 36,
  borderRadius: "var(--r-pill)",
  background: "var(--chrome-card-2)",
  color: "var(--chrome-cream)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
} as const;
