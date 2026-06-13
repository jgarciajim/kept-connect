import { describe, it, expect } from "vitest";
import { mountainPrice, deepClean, rateCard } from "./calc";
import { marketConfig, feeConfig, services, strTurnover, activeFeeMode } from "./seed";
import type { FeeConfig } from "./types";

// The handoff's worked check (docs/kept-pricing-engine-handoff.md §3), in cents.
const SEED: FeeConfig = { requesterServiceFeePct: 0.1, providerCommissionPct: 0.0, paymentsMarginPct: 0.025 };
const TWELVE: FeeConfig = { requesterServiceFeePct: 0.12, providerCommissionPct: 0.0, paymentsMarginPct: 0.025 };

describe("rateCard — handoff worked check", () => {
  it("base $280 at SEED (10% fee) reproduces the workbook exactly", () => {
    const rc = rateCard(28000, SEED);
    expect(rc.providerPayout).toBe(28000); // $280.00
    expect(rc.requesterFee).toBe(2800); // $28.00
    expect(rc.requesterAllIn).toBe(30800); // $308.00
    expect(rc.connectTake).toBe(2800); // $28.00
    expect(rc.connectTakePct).toBeCloseTo(0.091, 3); // 9.1% of all-in
    expect(rc.paymentsMargin).toBe(770); // $7.70
    expect(rc.connectNet).toBe(3570); // $35.70
  });

  it("base $280 at 12% fee reproduces the workbook variant", () => {
    const rc = rateCard(28000, TWELVE);
    expect(rc.requesterAllIn).toBe(31360); // $313.60
    expect(rc.connectTakePct).toBeCloseTo(0.107, 3); // 10.7%
    expect(rc.connectNet).toBe(4144); // $41.44
  });
});

describe("mountainPrice", () => {
  it("scales national by the mountain factor (no bump)", () => {
    expect(mountainPrice(20000, marketConfig, false)).toBe(28000); // $200 → $280
  });

  it("adds the snow-access bump for mountainBump lines", () => {
    expect(mountainPrice(20000, marketConfig, true)).toBe(32000); // $200 × (1.4 + 0.2) → $320
  });
});

describe("deepClean", () => {
  it("multiplies a turnover by the deep-clean multiplier", () => {
    expect(deepClean(15000, 2.0)).toBe(30000); // $150 × 2 → $300
  });
});

describe("seed — load + normalization", () => {
  it("imports the full catalog (94 services, all in whole cents)", () => {
    expect(services).toHaveLength(94);
    // Standard house clean: $200 → 20000 cents.
    const clean = services.find((s) => s.slug === "cleaning-standard-house-clean");
    expect(clean?.nationalTypical).toBe(20000);
  });

  it("imports the STR turnover tiers and add-ons", () => {
    expect(strTurnover.tiers).toHaveLength(6);
    expect(strTurnover.addOns).toHaveLength(5);
    expect(strTurnover.deepCleanMultiplier).toBe(2.0);
  });

  it("SEED is the active fee config with the documented decimals", () => {
    expect(activeFeeMode).toBe("SEED");
    expect(feeConfig.SEED).toEqual({
      requesterServiceFeePct: 0.1,
      providerCommissionPct: 0.0,
      paymentsMarginPct: 0.025,
    });
  });
});
