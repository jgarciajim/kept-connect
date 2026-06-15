"use client";

import { useState, useTransition } from "react";
import { setNotificationPref } from "@/lib/notifications/actions";
import type { NotificationPrefs as Prefs } from "@/lib/notifications";

/**
 * NotificationPrefs — per-category mute toggles, used on both You pages. `tone`
 * picks the light (requester) or dark (provider) token set. Each toggle flips
 * optimistically and persists via setNotificationPref.
 */
type CatKey = "offers" | "job_updates" | "payments";

const ROWS: { cat: CatKey; label: string; hint: string }[] = [
  { cat: "offers", label: "Offers & quotes", hint: "When a pro offers / your quote is accepted" },
  { cat: "job_updates", label: "Job updates", hint: "On the way, job complete" },
  { cat: "payments", label: "Payments", hint: "Payouts and receipts" },
];

export function NotificationPrefs({ prefs, tone }: { prefs: Prefs; tone: "light" | "dark" }) {
  const [state, setState] = useState<Record<CatKey, boolean>>({
    offers: prefs.offers,
    job_updates: prefs.jobUpdates,
    payments: prefs.payments,
  });
  const [pending, start] = useTransition();

  const t =
    tone === "dark"
      ? { card: "var(--chrome-card)", line: "var(--chrome-line)", text: "var(--chrome-cream)", dim: "var(--chrome-dim)", on: "var(--terracotta-bright)", off: "var(--chrome-card-2)", knob: "var(--cream)" }
      : { card: "var(--paper)", line: "var(--hairline)", text: "var(--ink)", dim: "var(--ink-3)", on: "var(--terracotta)", off: "var(--neutral)", knob: "var(--paper)" };

  const toggle = (cat: CatKey) => {
    const next = !state[cat];
    setState((s) => ({ ...s, [cat]: next }));
    start(() => setNotificationPref(cat, next));
  };

  return (
    <div style={{ background: t.card, border: `1px solid ${t.line}`, borderRadius: "var(--r-card)", overflow: "hidden" }}>
      {ROWS.map((row, i) => {
        const on = state[row.cat];
        return (
          <div
            key={row.cat}
            style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderTop: i === 0 ? "none" : `1px solid ${t.line}` }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: t.text, fontFamily: "var(--font-ui)" }}>{row.label}</div>
              <div style={{ fontSize: 11.5, color: t.dim, fontFamily: "var(--font-ui)", marginTop: 1 }}>{row.hint}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={row.label}
              disabled={pending}
              onClick={() => toggle(row.cat)}
              style={{
                width: 42,
                height: 25,
                borderRadius: "var(--r-pill)",
                border: "none",
                background: on ? t.on : t.off,
                position: "relative",
                cursor: pending ? "not-allowed" : "pointer",
                flex: "0 0 auto",
                transition: "background var(--dur-fast) var(--ease)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: on ? 20 : 3,
                  width: 19,
                  height: 19,
                  borderRadius: "var(--r-pill)",
                  background: t.knob,
                  transition: "left var(--dur-fast) var(--ease)",
                  boxShadow: "var(--shadow-sm)",
                }}
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}
