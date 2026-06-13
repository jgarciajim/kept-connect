/**
 * The calculation engine — pure, deterministic functions ported one-to-one from
 * the handoff workbook formulas (docs/kept-pricing-engine-handoff.md §3). All
 * inputs/outputs are integer cents except the fee/market decimals. Framework-free
 * so the same functions later run per Connect job object.
 */

import type { MarketConfig, FeeConfig, RateCard } from "./types";

/**
 * Market adjustment: national cents → mountain-adjusted cents.
 *   mountainPrice = round(national * (mountainFactor + (bump ? snowAccessBump : 0)))
 */
export function mountainPrice(
  nationalCents: number,
  { mountainFactor, snowAccessBump }: MarketConfig,
  mountainBump: boolean,
): number {
  return Math.round(nationalCents * (mountainFactor + (mountainBump ? snowAccessBump : 0)));
}

/** STR deep clean = round(turnover * deepCleanMultiplier). */
export function deepClean(turnoverCents: number, deepCleanMultiplier: number): number {
  return Math.round(turnoverCents * deepCleanMultiplier);
}

/**
 * Connect rate-card economics. `base` is the provider's price in cents (their
 * entered rate, else the mountain typical). connectTakePct is a share of the
 * all-in, not the base — surface both the headline fee % and this.
 */
export function rateCard(baseCents: number, fee: FeeConfig): RateCard {
  const providerPayout = Math.round(baseCents * (1 - fee.providerCommissionPct));
  const requesterFee = Math.round(baseCents * fee.requesterServiceFeePct);
  const requesterAllIn = baseCents + requesterFee;
  const connectTake = requesterAllIn - providerPayout; // = fee + commission
  const connectTakePct = connectTake / requesterAllIn;
  const paymentsMargin = Math.round(requesterAllIn * fee.paymentsMarginPct);
  const connectNet = connectTake + paymentsMargin;
  return {
    providerPayout,
    requesterFee,
    requesterAllIn,
    connectTake,
    connectTakePct,
    paymentsMargin,
    connectNet,
  };
}
