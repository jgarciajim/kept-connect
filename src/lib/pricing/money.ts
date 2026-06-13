/**
 * USD money helpers. The engine works in integer cents to avoid float drift; the
 * seed arrives in dollars (some fractional, e.g. 0.18, 3.0) and is normalized to
 * cents at load. Display is dollars.
 */

/** Dollars (possibly fractional) → integer cents. */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Integer cents → dollars (float, for formatting only). */
export function centsToDollars(cents: number): number {
  return cents / 100;
}

const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Format integer cents as USD. Whole dollars by default ($140, $2,520) to match
 * the existing requester UI; pass { cents: true } for $7.70-style precision.
 */
export function formatUsd(cents: number, opts?: { cents?: boolean }): string {
  const dollars = centsToDollars(cents);
  return (opts?.cents ? USD_CENTS : USD_WHOLE).format(dollars);
}
