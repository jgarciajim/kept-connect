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
export type RateModel = "flat" | "per_unit" | "tiered" | "quote";
export interface TierDraft {
  label: string;
  amount: string;
}
export interface RateDraft {
  serviceSlug: string;
  optionSlug: string;
  model: RateModel;
  amount: string; // string for the input; parsed at submit
  unit: string; // rate_unit for per_unit
  tiers: TierDraft[]; // bands, for the tiered model
}
export type RateMap = Record<string, RateDraft>;

const UNITS = ["sqft", "hour", "linear_ft", "room", "item"] as const;
const UNIT_LABEL: Record<string, string> = { sqft: "/ sq ft", hour: "/ hour", linear_ft: "/ linear ft", room: "/ room", item: "/ item" };
const MODEL_LABEL: Record<RateModel, string> = { flat: "Flat", per_unit: "Per unit", tiered: "Tiers", quote: "Quote" };
export const OTHER_SLUG = "__other";
export const rateKey = (serviceSlug: string, optionSlug: string) => `${serviceSlug}:${optionSlug}`;

// A sub-job row is complete: catch-all/quote need nothing; tiered needs ≥1 full band;
// flat/per-unit need a positive amount.
export function rateDraftOk(r: RateDraft): boolean {
  if (r.optionSlug === OTHER_SLUG || r.model === "quote") return true;
  if (r.model === "tiered") return r.tiers.length > 0 && r.tiers.every((t) => t.label.trim() !== "" && Number(t.amount) > 0);
  return Number(r.amount) > 0;
}

export function SubjobPricingEditor({ rates, onChange }: { rates: RateMap; onChange: (next: RateMap) => void }) {
  const [open, setOpen] = useState<string | null>(SERVICES[0]?.slug ?? null);

  const countFor = (slug: string) => Object.values(rates).filter((r) => r.serviceSlug === slug).length;

  const toggle = (serviceSlug: string, optionSlug: string) => {
    const k = rateKey(serviceSlug, optionSlug);
    const next = { ...rates };
    if (next[k]) delete next[k];
    else next[k] = { serviceSlug, optionSlug, model: optionSlug === OTHER_SLUG ? "quote" : "flat", amount: "", unit: "sqft", tiers: [] };
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
                        <div style={{ marginTop: 8, paddingLeft: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                            {(["flat", "per_unit", "tiered", "quote"] as RateModel[]).map((m) => (
                              <button key={m} type="button" onClick={() => update(k, { model: m })} style={chip(draft.model === m)}>
                                {MODEL_LABEL[m]}
                              </button>
                            ))}
                            {(draft.model === "flat" || draft.model === "per_unit") && (
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
                          {draft.model === "tiered" && (
                            <TierEditor tiers={draft.tiers} onChange={(t) => update(k, { tiers: t })} />
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

// Tier bands (e.g. Small room $X / Large room $Y). The request doesn't pick a tier,
// so a tiered sub-job quotes on contact — these are the provider's posted bands.
function TierEditor({ tiers, onChange }: { tiers: TierDraft[]; onChange: (t: TierDraft[]) => void }) {
  const set = (i: number, patch: Partial<TierDraft>) => onChange(tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {tiers.map((t, i) => (
        <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={t.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="e.g. Small room" style={{ ...amountInput, flex: 1 }} />
          <span style={{ color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", fontSize: 14 }}>$</span>
          <input inputMode="decimal" value={t.amount} onChange={(e) => set(i, { amount: e.target.value })} placeholder="price" style={{ ...amountInput, width: 70 }} />
          <button type="button" onClick={() => onChange(tiers.filter((_, j) => j !== i))} aria-label="Remove tier"
            style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "var(--r-pill)", background: "transparent", color: "var(--chrome-dim)", border: "1px solid var(--chrome-line)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>×</button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...tiers, { label: "", amount: "" }])}
        style={{ alignSelf: "flex-start", borderRadius: "var(--r-pill)", padding: "6px 12px", fontSize: 12, fontWeight: 500, background: "transparent", color: "var(--terracotta-bright)", border: "1px dashed var(--chrome-line)", cursor: "pointer", fontFamily: "var(--font-ui)" }}>
        + Add tier
      </button>
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
