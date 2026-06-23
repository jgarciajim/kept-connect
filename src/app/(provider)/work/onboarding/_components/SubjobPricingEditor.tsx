"use client";

import { useState, type CSSProperties } from "react";
import { SERVICES, optionSlug } from "@/lib/requester/services";

/**
 * SubjobPricingEditor — the heart of onboarding. The contractor expands a trade
 * (a service), selects the sub-jobs they perform, and prices EACH with a model:
 *   • Flat — a fixed fee        • Per unit — a rate × $/sqft, $/hr…
 *   • Quote — on-site / odd job (no fixed price)
 * Plus a per-trade "Other / custom job" catch-all (always a quote). Controlled:
 * all state lives in `rates` (keyed serviceSlug:optionSlug) on the parent wizard.
 */
export type RateModel = "flat" | "per_unit" | "quote";
export interface RateDraft {
  serviceSlug: string;
  optionSlug: string;
  model: RateModel;
  amount: string; // string for the input; parsed at submit
  unit: string; // rate_unit for per_unit
}
export type RateMap = Record<string, RateDraft>;

const UNITS = ["sqft", "hour", "linear_ft", "room", "item"] as const;
const UNIT_LABEL: Record<string, string> = { sqft: "/ sq ft", hour: "/ hour", linear_ft: "/ linear ft", room: "/ room", item: "/ item" };
export const OTHER_SLUG = "__other";
export const rateKey = (serviceSlug: string, optionSlug: string) => `${serviceSlug}:${optionSlug}`;

export function SubjobPricingEditor({ rates, onChange }: { rates: RateMap; onChange: (next: RateMap) => void }) {
  const [open, setOpen] = useState<string | null>(SERVICES[0]?.slug ?? null);

  const countFor = (slug: string) => Object.values(rates).filter((r) => r.serviceSlug === slug).length;

  const toggle = (serviceSlug: string, optionSlug: string) => {
    const k = rateKey(serviceSlug, optionSlug);
    const next = { ...rates };
    if (next[k]) delete next[k];
    else next[k] = { serviceSlug, optionSlug, model: optionSlug === OTHER_SLUG ? "quote" : "flat", amount: "", unit: "sqft" };
    onChange(next);
  };
  const update = (k: string, patch: Partial<RateDraft>) => onChange({ ...rates, [k]: { ...rates[k], ...patch } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {SERVICES.map((s) => {
        const expanded = open === s.slug;
        const n = countFor(s.slug);
        return (
          <div key={s.slug} style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, overflow: "hidden" }}>
            <button
              type="button"
              onClick={() => setOpen(expanded ? null : s.slug)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", padding: "13px 14px", cursor: "pointer", textAlign: "left" }}
            >
              <span style={{ fontSize: 14.5, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", flex: 1 }}>{s.label}</span>
              {n > 0 && <span style={{ fontSize: 11.5, color: "var(--terracotta-bright)", fontFamily: "var(--font-ui)" }}>{n} priced</span>}
              <span style={{ color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", transform: expanded ? "rotate(90deg)" : "none", transition: "transform var(--dur-fast) var(--ease)" }}>›</span>
            </button>

            {expanded && (
              <div style={{ borderTop: "1px solid var(--chrome-line)", padding: "6px 10px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
                {[...s.options.map((label) => ({ label, slug: optionSlug(label) })), { label: "Other / custom job", slug: OTHER_SLUG }].map((opt) => {
                  const k = rateKey(s.slug, opt.slug);
                  const draft = rates[k];
                  const on = Boolean(draft);
                  return (
                    <div key={opt.slug} style={{ padding: "6px 4px" }}>
                      <label style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}>
                        <input type="checkbox" checked={on} onChange={() => toggle(s.slug, opt.slug)} style={{ accentColor: "var(--terracotta-bright)" }} />
                        <span style={{ fontSize: 13.5, color: on ? "var(--chrome-cream)" : "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>{opt.label}</span>
                      </label>

                      {on && opt.slug !== OTHER_SLUG && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8, paddingLeft: 24, alignItems: "center" }}>
                          {(["flat", "per_unit", "quote"] as RateModel[]).map((m) => (
                            <button key={m} type="button" onClick={() => update(k, { model: m })}
                              style={chip(draft.model === m)}>
                              {m === "flat" ? "Flat" : m === "per_unit" ? "Per unit" : "Quote"}
                            </button>
                          ))}
                          {draft.model !== "quote" && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                              <span style={{ color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", fontSize: 14 }}>$</span>
                              <input inputMode="decimal" value={draft.amount} onChange={(e) => update(k, { amount: e.target.value })}
                                placeholder={draft.model === "per_unit" ? "rate" : "price"} style={{ ...amountInput, width: 80 }} />
                              {draft.model === "per_unit" && (
                                <select value={draft.unit} onChange={(e) => update(k, { unit: e.target.value })} style={unitSelect}>
                                  {UNITS.map((u) => <option key={u} value={u}>{UNIT_LABEL[u]}</option>)}
                                </select>
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function chip(active: boolean): CSSProperties {
  return {
    padding: "6px 11px", borderRadius: "var(--r-pill)", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500,
    background: active ? "var(--terracotta-bright)" : "transparent", color: active ? "var(--cream)" : "var(--chrome-dim)",
    border: active ? "1px solid var(--terracotta-bright)" : "1px solid var(--chrome-line)",
  };
}
const amountInput: CSSProperties = { background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "7px 10px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 13.5, fontVariantNumeric: "tabular-nums", outline: "none" };
const unitSelect: CSSProperties = { background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "7px 8px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 12.5, outline: "none" };
