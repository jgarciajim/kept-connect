"use client";

import { useState, useTransition } from "react";
import type { CategoryKey } from "@/components/ui";
import { becomeProvider } from "@/lib/provider/actions";
import { TRADE_LABELS, ALL_TRADES } from "@/lib/provider/trades";

/**
 * OnboardingForm — name + trades → become a provider. On Continue it creates the
 * provider profile (online) and routes to /work/rates to set a rate. Dark chrome;
 * terracotta is the action.
 */
export function OnboardingForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [trades, setTrades] = useState<CategoryKey[]>([]);
  const [pending, start] = useTransition();

  const valid = name.trim().length > 0 && trades.length > 0;
  const toggle = (k: CategoryKey) => setTrades((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <Field label="Your name">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Casey Rivera"
          style={{ width: "100%", background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "12px 14px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 15, outline: "none" }}
        />
      </Field>

      <Field label="What do you do?" hint="Pick all that apply">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ALL_TRADES.map((k) => {
            const on = trades.includes(k);
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggle(k)}
                style={{ padding: "9px 14px", borderRadius: "var(--r-pill)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 13.5, fontWeight: 500, background: on ? "var(--terracotta-bright)" : "var(--chrome-card)", color: on ? "var(--cream)" : "var(--chrome-dim)", border: on ? "1px solid var(--terracotta-bright)" : "1px solid var(--chrome-line)" }}
              >
                {TRADE_LABELS[k]}
              </button>
            );
          })}
        </div>
      </Field>

      <p style={{ fontSize: 12.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", lineHeight: 1.5, margin: 0 }}>
        You&rsquo;ll go online and start seeing open requests in your trades. Next you&rsquo;ll set your rates.
      </p>

      <button
        type="button"
        disabled={!valid || pending}
        onClick={() => start(() => becomeProvider(name, trades))}
        style={{ width: "100%", borderRadius: 16, padding: 15, fontSize: 15, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: !valid || pending ? "not-allowed" : "pointer", opacity: !valid || pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}
      >
        {pending ? "Setting up…" : "Continue"}
      </button>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--chrome-dim)" }}>{label}</span>
        {hint && <span style={{ fontSize: 12, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
