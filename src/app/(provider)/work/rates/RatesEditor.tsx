"use client";

import { useState, useTransition } from "react";
import { setOwnRate, optInBenchmark } from "@/lib/provider/actions";

/**
 * RatesEditor — per-service rate rows. Each row: the current rate (with its source
 * tag), an input to set your own price, and a one-tap "use benchmark" opt-in. Dark
 * chrome; terracotta = the action. Writes through the provider rate actions.
 */
export interface RateRow {
  slug: string;
  label: string;
  currentAmount: string | null; // dollars
  currentSource: "own" | "benchmark" | null;
  benchmarkRange: string | null; // "$140–$2,520"
  benchmarkMid: string | null; // "$1,330"
}

export function RatesEditor({ rows }: { rows: RateRow[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {rows.map((row) => (
        <RateRowEditor key={row.slug} row={row} />
      ))}
    </div>
  );
}

function RateRowEditor({ row }: { row: RateRow }) {
  const [value, setValue] = useState(row.currentAmount ?? "");
  const [pending, startTransition] = useTransition();

  const saveOwn = () => {
    const amount = parseFloat(value);
    if (!(amount > 0)) return;
    startTransition(() => setOwnRate(row.slug, amount));
  };
  const useBenchmark = () => startTransition(() => optInBenchmark(row.slug));

  return (
    <div style={{ background: "var(--chrome-card)", border: "1px solid var(--chrome-line)", borderRadius: 14, padding: "12px 13px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--chrome-cream)", fontFamily: "var(--font-ui)" }}>{row.label}</span>
        {row.currentAmount && (
          <span style={{ fontSize: 11.5, color: "var(--chrome-dim)", fontFamily: "var(--font-ui)" }}>
            now ${" "}
            <span style={{ color: "var(--chrome-cream)", fontVariantNumeric: "tabular-nums" }}>{row.currentAmount}</span>
            {row.currentSource === "benchmark" ? " · benchmark" : " · your rate"}
          </span>
        )}
      </div>

      {row.benchmarkRange && (
        <div style={{ fontSize: 11.5, color: "var(--chrome-dim)", marginTop: 4, fontFamily: "var(--font-ui)" }}>
          benchmark {row.benchmarkRange} · not a quote
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <span style={{ color: "var(--chrome-dim)", fontFamily: "var(--font-ui)", fontSize: 15 }}>$</span>
        <input
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="your price"
          style={{ flex: 1, minWidth: 0, background: "var(--chrome-card-2)", border: "1px solid var(--chrome-line)", borderRadius: "var(--r-chip)", padding: "9px 12px", color: "var(--chrome-cream)", fontFamily: "var(--font-ui)", fontSize: 14, fontVariantNumeric: "tabular-nums", outline: "none" }}
        />
        <button
          type="button"
          onClick={saveOwn}
          disabled={pending}
          style={{ borderRadius: "var(--r-pill)", padding: "9px 15px", fontSize: 13, fontWeight: 500, background: "var(--terracotta-bright)", color: "var(--cream)", border: "none", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1, fontFamily: "var(--font-ui)", flex: "0 0 auto" }}
        >
          Save
        </button>
      </div>

      {row.benchmarkMid && (
        <button
          type="button"
          onClick={useBenchmark}
          disabled={pending}
          style={{ marginTop: 8, width: "100%", borderRadius: "var(--r-pill)", padding: "8px 12px", fontSize: 12.5, fontWeight: 500, background: "transparent", color: "var(--chrome-cream)", border: "1px solid var(--chrome-line)", cursor: pending ? "not-allowed" : "pointer", opacity: pending ? 0.5 : 1, fontFamily: "var(--font-ui)" }}
        >
          Use benchmark ({row.benchmarkMid})
        </button>
      )}
    </div>
  );
}
