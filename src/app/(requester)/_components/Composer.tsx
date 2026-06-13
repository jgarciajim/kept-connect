"use client";

import { useState } from "react";
import { Button, Field, CategoryIcon, type CategoryKey } from "@/components/ui";
import { postRequest, postInstantRequest } from "@/lib/requester/actions";
import type { Service } from "@/lib/requester/mock";
import { AppHeader } from "./AppHeader";
import { IconPin, IconChevron, IconCheck } from "./icons";

const TRADES: { cat: CategoryKey; label: string }[] = [
  { cat: "water", label: "Plumbing" },
  { cat: "power", label: "Electrical" },
  { cat: "surfaces", label: "Painting" },
  { cat: "grounds", label: "Yard" },
];

const URGENCIES: { key: string; label: string }[] = [
  { key: "whenever", label: "Whenever" },
  { key: "same_day", label: "Same day" },
  { key: "emergency", label: "Emergency" },
];

type Mode = "quick" | "custom";

export function Composer({ services }: { services: Service[] }) {
  const [mode, setMode] = useState<Mode>("quick");
  const [trade, setTrade] = useState<CategoryKey>("water");
  const [urgency, setUrgency] = useState("same_day");
  const [serviceId, setServiceId] = useState("");

  const tradeServices = services.filter((s) => s.category === trade);
  const canPost = mode === "custom" || serviceId !== "";

  return (
    <>
      <AppHeader title="Post a job" backHref="/app" />

      <form style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <input type="hidden" name="category" value={trade} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="urgency" value={urgency} />

        <main style={{ flex: 1, overflowY: "auto", padding: "0 18px 20px" }}>
          {/* mode toggle */}
          <div style={{ display: "flex", gap: 0, background: "var(--neutral)", borderRadius: "var(--r-pill)", padding: 4, margin: "12px 0 16px" }}>
            {(["quick", "custom"] as Mode[]).map((m) => {
              const on = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  style={{
                    flex: 1, padding: "9px 6px", borderRadius: "var(--r-pill)", border: "none", cursor: "pointer",
                    background: on ? "var(--paper)" : "transparent",
                    color: on ? "var(--ink)" : "var(--ink-2)",
                    fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13,
                    boxShadow: on ? "var(--shadow-sm)" : "none",
                  }}
                >
                  {m === "quick" ? "Quick job" : "Custom project"}
                </button>
              );
            })}
          </div>

          {/* warm hero */}
          <div style={{ background: "var(--moment)", borderRadius: "var(--r-lg)", padding: "22px 20px", marginBottom: 18 }}>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 500, fontSize: 28, lineHeight: 1.12, letterSpacing: "-0.015em", margin: 0, color: "var(--ink)" }}>
              What needs doing<span style={{ color: "var(--terracotta)" }}>?</span>
            </p>
            <p style={{ fontSize: 14, color: "var(--ink-2)", margin: "8px 0 0", fontFamily: "var(--font-ui)" }}>
              {mode === "quick"
                ? "Pick a standard job at a set price — we'll match you with the first available pro."
                : "Describe it once. We'll get you sealed quotes to compare."}
            </p>
          </div>

          {/* trade picker (shared) */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>Trade</span>
            <div style={{ display: "flex", gap: 10 }}>
              {TRADES.map((t) => {
                const on = trade === t.cat;
                return (
                  <button
                    key={t.cat}
                    type="button"
                    onClick={() => { setTrade(t.cat); setServiceId(""); }}
                    style={{
                      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 7,
                      padding: "12px 4px", borderRadius: "var(--r-chip)", cursor: "pointer",
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

          {/* mode-specific middle */}
          {mode === "quick" ? (
            <div style={{ marginBottom: 16 }}>
              <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>Pick a job</span>
              {tradeServices.length === 0 ? (
                <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)" }}>No set-price jobs for this trade yet — try a custom project.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {tradeServices.map((s) => {
                    const on = serviceId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setServiceId(s.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                          padding: "12px 14px", borderRadius: "var(--r-chip)", cursor: "pointer",
                          background: on ? "var(--terracotta-tint)" : "var(--paper)",
                          border: `1.5px solid ${on ? "var(--terracotta)" : "var(--hairline)"}`,
                        }}
                      >
                        <span style={{ width: 18, height: 18, flex: "0 0 auto", display: "inline-flex", alignItems: "center", justifyContent: "center", color: on ? "var(--terracotta)" : "var(--ink-3)" }}>
                          {on ? <IconCheck size={16} /> : null}
                        </span>
                        <span style={{ flex: 1, fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{s.name}</span>
                        <span style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>${s.basePrice}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
              <Field label="What's the job?" name="description" multiline rows={3} placeholder="Describe the project…" />
              <div>
                <span style={{ display: "block", fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>When?</span>
                <div style={{ display: "flex", gap: 9 }}>
                  {URGENCIES.map((u) => {
                    const on = urgency === u.key;
                    return (
                      <button
                        key={u.key}
                        type="button"
                        onClick={() => setUrgency(u.key)}
                        style={{
                          flex: 1, padding: "10px 6px", borderRadius: "var(--r-pill)", cursor: "pointer",
                          background: on ? "var(--ink)" : "var(--paper)",
                          border: `1.5px solid ${on ? "var(--ink)" : "var(--hairline)"}`,
                          color: on ? "var(--cream)" : "var(--ink-2)",
                          fontFamily: "var(--font-ui)", fontWeight: 500, fontSize: 12.5,
                        }}
                      >
                        {u.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* location (shared) */}
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: "var(--paper)", border: "1px solid var(--hairline)", borderRadius: "var(--r-chip)" }}>
            <span style={{ color: "var(--terracotta)", display: "flex" }}><IconPin /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>14 Birch Lane</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-3)" }}>Saved property · Home</div>
            </div>
            <span style={{ color: "var(--ink-3)", display: "flex" }}><IconChevron size={18} /></span>
          </div>
        </main>

        <div style={{ padding: "14px 18px", borderTop: "1px solid var(--hairline)", background: "var(--canvas)" }}>
          <Button type="submit" formAction={mode === "quick" ? postInstantRequest : postRequest} fullWidth size="lg" disabled={!canPost}>
            {mode === "quick" ? "Post — find a pro" : "Post"}
          </Button>
        </div>
      </form>
    </>
  );
}
