/**
 * Seed adapter — the single import site for the pricing data. Reads the handoff's
 * shipping artifact (docs/kept-pricing-seed.json, the source of record) and
 * normalizes every dollar value to integer cents at load. Everything downstream
 * consumes these typed, cents-denominated structures.
 *
 * Seed prices are planning baselines, not quotes (see _meta in the JSON). They
 * never set a provider's price — they're informational benchmarks only.
 */

import raw from "../../../docs/kept-pricing-seed.json";
import { dollarsToCents } from "./money";
import type { FeeConfig, FeeMode, MarketConfig, SeedService, StrTurnover } from "./types";

export const marketConfig: MarketConfig = {
  mountainFactor: raw.marketConfig.mountainFactor,
  snowAccessBump: raw.marketConfig.snowAccessBump,
};

export const feeConfig: Record<FeeMode, FeeConfig> = {
  SEED: {
    requesterServiceFeePct: raw.connectFeeConfig.seed.requesterServiceFeePct,
    providerCommissionPct: raw.connectFeeConfig.seed.providerCommissionPct,
    paymentsMarginPct: raw.connectFeeConfig.seed.paymentsMarginPct,
  },
  MATURE: {
    requesterServiceFeePct: raw.connectFeeConfig.mature.requesterServiceFeePct,
    providerCommissionPct: raw.connectFeeConfig.mature.providerCommissionPct,
    paymentsMarginPct: raw.connectFeeConfig.mature.paymentsMarginPct,
  },
};

// Active fee mode at launch — SEED per the seed JSON and the confirmed default.
export const activeFeeMode: FeeMode = raw.connectFeeConfig.active === "mature" ? "MATURE" : "SEED";
export const activeFeeConfig: FeeConfig = feeConfig[activeFeeMode];

// 94 catalog services, money in cents.
export const services: SeedService[] = raw.services.map((s) => ({
  slug: s.slug,
  category: s.category,
  name: s.name,
  unit: s.unit,
  billingBasis: s.billingBasis as SeedService["billingBasis"],
  nationalLow: dollarsToCents(s.nationalLow),
  nationalTypical: dollarsToCents(s.nationalTypical),
  nationalHigh: dollarsToCents(s.nationalHigh),
  mountainBump: s.mountainBump,
  notes: s.notes ?? "",
}));

// STR turnover tiers + add-ons, money in cents.
export const strTurnover: StrTurnover = {
  deepCleanMultiplier: raw.strTurnover.deepCleanMultiplier,
  tiers: raw.strTurnover.tiers.map((t) => ({
    size: t.size,
    beds: t.beds,
    baths: t.baths,
    low: dollarsToCents(t.low),
    typical: dollarsToCents(t.typical),
    high: dollarsToCents(t.high),
    notes: t.notes ?? "",
  })),
  addOns: raw.strTurnover.addOns.map((a) => ({
    name: a.name,
    unit: a.unit,
    low: dollarsToCents(a.low),
    typical: dollarsToCents(a.typical),
    high: dollarsToCents(a.high),
    notes: a.notes ?? "",
  })),
};
