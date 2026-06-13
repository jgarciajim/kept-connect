/**
 * Seasonality — the shared date logic behind both seasonal systems on the
 * requester surface. Two small, pure helpers that answer "is this live today?":
 *
 *   - isWithinWindow → dated, one-off windows (campaigns: a specific Sep 1–Oct 31 push)
 *   - isInSeason     → recurring yearly month ranges (services: snow every Nov–Apr)
 *
 * They live together on purpose: campaigns and the service catalog express the
 * same idea two ways, and keeping the date math in one module stops the two from
 * drifting apart. Both are pure (no Date.now() inside) so callers pass an
 * explicit `now` and tests can pin it.
 */

// Recurring yearly season, inclusive on both ends, may wrap the year boundary
// (e.g. Nov–Apr snow season = { fromMonth: 11, toMonth: 4 }).
export interface Season {
  fromMonth: number; // 1–12
  toMonth: number; // 1–12
}

/**
 * True when `now` falls within the recurring [fromMonth, toMonth] range,
 * inclusive. Handles the year-wrap: a range whose start month is greater than
 * its end month (Nov→Apr) spans December into the next year.
 */
export function isInSeason(now: Date, season: Season): boolean {
  const m = now.getUTCMonth() + 1; // 0-indexed → our months are 1–12; UTC to match isWithinWindow
  const { fromMonth, toMonth } = season;

  if (fromMonth <= toMonth) {
    // Same-year range, e.g. Apr–Jun.
    return m >= fromMonth && m <= toMonth;
  }
  // Wrapping range, e.g. Nov–Apr: in season if at/after the start OR at/before the end.
  return m >= fromMonth || m <= toMonth;
}

/**
 * True when `now` falls within the dated window [startsOn, endsOn], inclusive
 * on both ends. Inputs are ISO date strings (e.g. "2026-09-01"); comparison is
 * done at day granularity so a `now` anywhere on the end date still counts.
 */
export function isWithinWindow(now: Date, startsOn: string, endsOn: string): boolean {
  const day = toDayNumber(now);
  return day >= isoToDayNumber(startsOn) && day <= isoToDayNumber(endsOn);
}

// --- internals ------------------------------------------------------------
// Collapse to a UTC day count so the window check is timezone-stable and
// inclusive on the end date regardless of the time-of-day carried by `now`.
function toDayNumber(d: Date): number {
  return Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);
}

function isoToDayNumber(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
}
