/**
 * Pricing engine types. All money is integer USD cents; percentages are decimals
 * (0.10 = 10%). Mirrors the handoff data model (docs/kept-pricing-engine-handoff.md
 * §2) adapted off Prisma to a framework-free TS module.
 */

export type BillingBasis =
  | "FLAT"
  | "HOURLY"
  | "PER_SQFT"
  | "PER_UNIT"
  | "PER_INCH"
  | "SEASONAL"
  | "RECURRING_MONTHLY"
  | "RECURRING_ANNUAL";

export type FeeMode = "SEED" | "MATURE";

// Market adjustment knobs. mountainFactor multiplies national; snowAccessBump is
// added on top for snow / roof / hard-access lines (mountainBump = true).
export interface MarketConfig {
  mountainFactor: number;
  snowAccessBump: number;
}

// Connect rate-card economics inputs (decimals).
export interface FeeConfig {
  requesterServiceFeePct: number;
  providerCommissionPct: number;
  paymentsMarginPct: number;
}

// A catalog service with money normalized to integer cents.
export interface SeedService {
  slug: string;
  category: string;
  name: string;
  unit: string;
  billingBasis: BillingBasis;
  nationalLow: number; // cents
  nationalTypical: number; // cents
  nationalHigh: number; // cents
  mountainBump: boolean;
  notes: string;
}

export interface StrTier {
  size: string;
  beds: number;
  baths: number;
  low: number; // cents
  typical: number; // cents
  high: number; // cents
  notes: string;
}

export interface StrAddOn {
  name: string;
  unit: string;
  low: number; // cents
  typical: number; // cents
  high: number; // cents
  notes: string;
}

export interface StrTurnover {
  deepCleanMultiplier: number;
  tiers: StrTier[];
  addOns: StrAddOn[];
}

// The Connect rate-card breakdown for one base price. All cents except
// connectTakePct, which is a decimal share of the all-in (NOT the base).
export interface RateCard {
  providerPayout: number;
  requesterFee: number;
  requesterAllIn: number;
  connectTake: number;
  connectTakePct: number;
  paymentsMargin: number;
  connectNet: number;
}
