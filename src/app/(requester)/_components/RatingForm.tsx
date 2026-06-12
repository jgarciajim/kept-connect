"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar, StatusRing, Field, Button } from "@/components/ui";
import { submitReview } from "@/lib/requester/actions";
import { IconStar } from "./icons";

/**
 * RatingForm — two-sided ratings (§3.5): a warm --moment moment, one-tap
 * terracotta stars + optional note, then a "Thanks." confirmation. On submit it
 * inserts a real review (RLS-scoped) for the rated provider.
 */
export function RatingForm({
  providerName,
  jobSummary,
  requestId,
  subjectId,
}: {
  providerName: string;
  jobSummary: string;
  requestId: string;
  subjectId: string;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (stars === 0 || saving) return;
    setSaving(true);
    await submitReview(requestId, subjectId, stars, note);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--moment)" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 32px", textAlign: "center" }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ marginBottom: 20 }}>
            <circle cx="12" cy="12" r="11" fill="var(--terracotta)" />
            <path d="M7 12.4 L10.6 16 L17 8.6" stroke="var(--cream)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 34, margin: 0, letterSpacing: "-0.015em", color: "var(--ink)" }}>
            Thanks<span style={{ color: "var(--terracotta)" }}>.</span>
          </p>
          <p style={{ fontSize: 15, color: "var(--ink-2)", margin: "12px 0 0", lineHeight: 1.5, maxWidth: 260, fontFamily: "var(--font-ui)" }}>
            Your rating helps keep the network trustworthy for everyone.
          </p>
        </div>
        <div style={{ padding: "14px 18px 24px" }}>
          <Button fullWidth size="lg" onClick={() => router.push("/app")}>Back to home</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--moment)" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", textAlign: "center" }}>
        <StatusRing state="awarded" size={72}>
          <Avatar name={providerName} size={72} />
        </StatusRing>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, margin: "18px 0 0", letterSpacing: "-0.015em", color: "var(--ink)" }}>
          How was {providerName.split(" ")[0]}?
        </p>
        <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "8px 0 0", fontFamily: "var(--font-ui)" }}>{jobSummary}</p>

        <div style={{ display: "flex", gap: 8, margin: "24px 0 20px" }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: n <= stars ? "var(--terracotta)" : "var(--ink-3)", opacity: n <= stars ? 1 : 0.4 }}
            >
              <IconStar size={36} />
            </button>
          ))}
        </div>

        <div style={{ width: "100%", maxWidth: 320 }}>
          <Field multiline rows={2} placeholder="Add a note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>

      <div style={{ padding: "14px 18px 24px" }}>
        <Button fullWidth size="lg" disabled={stars === 0 || saving} onClick={submit}>
          {saving ? "Submitting…" : "Submit rating"}
        </Button>
      </div>
    </div>
  );
}
