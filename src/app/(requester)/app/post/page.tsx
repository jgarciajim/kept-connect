"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, CategoryIcon, type CategoryKey } from "@/components/ui";
import { AppHeader } from "../../_components/AppHeader";
import { IconPin, IconChevron } from "../../_components/icons";

const TRADES: { cat: CategoryKey; label: string }[] = [
  { cat: "water", label: "Plumbing" },
  { cat: "power", label: "Electrical" },
  { cat: "surfaces", label: "Painting" },
  { cat: "grounds", label: "Yard" },
];

const URGENCIES = ["Whenever", "Same day", "Emergency"];

export default function ComposerScreen() {
  const router = useRouter();
  const [trade, setTrade] = useState<CategoryKey>("water");
  const [urgency, setUrgency] = useState("Same day");

  return (
    <>
      <AppHeader title="Post a job" backHref="/app" />

      <main style={{ flex: 1, overflowY: "auto", padding: "0 18px 20px" }}>
        {/* warm moment hero */}
        <div style={{ background: "var(--moment)", borderRadius: "var(--r-lg)", padding: "22px 20px", marginBottom: 18 }}>
          <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, lineHeight: 1.12, letterSpacing: "-0.015em", margin: 0, color: "var(--ink)" }}>
            What needs doing<span style={{ color: "var(--terracotta)" }}>?</span>
          </p>
          <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "8px 0 0", fontFamily: "var(--font-ui)" }}>
            Describe it once. We&rsquo;ll match you with vetted providers nearby.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field
            label="What's the job?"
            multiline
            rows={3}
            defaultValue="Kitchen faucet is leaking at the base — water pooling under the sink."
          />

          {/* trade picker */}
          <div>
            <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>Trade</span>
            <div style={{ display: "flex", gap: 10 }}>
              {TRADES.map((t) => {
                const on = trade === t.cat;
                return (
                  <button
                    key={t.cat}
                    type="button"
                    onClick={() => setTrade(t.cat)}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 7,
                      padding: "12px 4px",
                      borderRadius: "var(--r-chip)",
                      cursor: "pointer",
                      background: on ? "var(--terracotta-tint)" : "var(--paper)",
                      border: `1.5px solid ${on ? "var(--terracotta)" : "var(--hairline)"}`,
                    }}
                  >
                    <CategoryIcon category={t.cat} size={36} />
                    <span style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 500, color: on ? "var(--terracotta-deep)" : "var(--ink-2)" }}>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* location */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-chip)" }}>
            <span style={{ color: "var(--terracotta)", display: "flex" }}><IconPin /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>14 Birch Lane</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-3)" }}>Saved property · Home</div>
            </div>
            <span style={{ color: "var(--ink-3)", display: "flex" }}><IconChevron size={18} /></span>
          </div>

          {/* urgency */}
          <div>
            <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>When?</span>
            <div style={{ display: "flex", gap: 9 }}>
              {URGENCIES.map((u) => {
                const on = urgency === u;
                return (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUrgency(u)}
                    style={{
                      flex: 1,
                      padding: "10px 6px",
                      borderRadius: "var(--r-pill)",
                      cursor: "pointer",
                      background: on ? "var(--ink)" : "var(--paper)",
                      border: `1.5px solid ${on ? "var(--ink)" : "var(--hairline)"}`,
                      color: on ? "var(--cream)" : "var(--ink-2)",
                      fontFamily: "var(--font-ui)",
                      fontWeight: 500,
                      fontSize: 12.5,
                    }}
                  >
                    {u}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* one terracotta action */}
      <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hairline)", background: "var(--canvas)" }}>
        <Button fullWidth size="lg" onClick={() => router.push("/app/jobs/quoted")}>
          Post
        </Button>
      </div>
    </>
  );
}
