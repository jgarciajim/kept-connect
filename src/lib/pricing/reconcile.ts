/**
 * Catalog reconciliation — the bridge between the 12 requester tiles
 * (src/lib/requester/services.ts) and the 94-service seed catalog. Each Connect
 * tile is family-level (the tile IS the unit; there are no per-tile line items
 * yet), so a tile's benchmark is the mountain-adjusted typical RANGE across the
 * seed jobs it covers.
 *
 * The mapping below is explicit and reviewable (the editorial decision the
 * handoff flags for George's eye). Where a tile has no seed match it goes on the
 * GAP list and resolves to null — we never invent a price for a gap.
 */

import { SERVICES } from "../requester/services";
import { mountainPrice } from "./calc";
import { marketConfig, services } from "./seed";
import type { SeedService } from "./types";

// A rule either matches seed services (range over them) or is a declared gap.
type MatchRule = { category: string; match: (s: SeedService) => boolean };
type Rule = MatchRule | { gap: true; reason: string };

function cat(category: string): MatchRule {
  return { category, match: (s) => s.category === category };
}
function subset(category: string, pred: (s: SeedService) => boolean): MatchRule {
  return { category, match: (s) => s.category === category && pred(s) };
}

// Connect's "Home Care" tile = the core cleaning jobs (not window/carpet/pressure/
// gutter, which are their own tiles or out of scope). Explicit so it's auditable.
const HOME_CARE_SLUGS = new Set([
  "cleaning-standard-house-clean",
  "cleaning-deep-clean",
  "cleaning-move-in-move-out-clean",
  "cleaning-str-airbnb-turnover-clean",
  "cleaning-cleaning-labor-per-cleaner",
]);

// Connect slug → seed match (or gap). Keyed by the slugs in requester/services.ts.
export const CONNECT_BENCHMARK_MAP: Record<string, Rule> = {
  plumbing: cat("Plumbing"),
  electrical: cat("Electrical"),
  heating: cat("HVAC"),
  handyman: cat("Handyman"),
  painting: cat("Painting"),
  yard: cat("Landscaping"),
  "snow-removal": cat("Snow & ice"),
  appliances: cat("Appliance & misc"),
  "window-cleaning": subset("Cleaning", (s) => s.slug.startsWith("cleaning-window-")),
  "home-care": subset("Cleaning", (s) => HOME_CARE_SLUGS.has(s.slug)),
  roofing: { gap: true, reason: "no Roofing category in the seed catalog" },
  flooring: { gap: true, reason: "no Flooring category in the seed catalog" },
};

// A mountain-adjusted typical range (cents) for a family-level tile.
export interface Benchmark {
  low: number; // cents
  high: number; // cents
  count: number; // seed services spanned
  category: string;
}

/**
 * The benchmark range for a Connect tile, or null when the tile is a gap (or
 * unmapped). Ranges over each matched seed service's mountain-adjusted typical.
 */
export function benchmarkFor(slug: string): Benchmark | null {
  const rule = CONNECT_BENCHMARK_MAP[slug];
  if (!rule || "gap" in rule) return null;
  const matched = services.filter(rule.match);
  if (matched.length === 0) return null;
  const adjusted = matched.map((s) => mountainPrice(s.nationalTypical, marketConfig, s.mountainBump));
  return {
    low: Math.min(...adjusted),
    high: Math.max(...adjusted),
    count: matched.length,
    category: rule.category,
  };
}

/**
 * A single representative benchmark amount (cents) for a service — the midpoint of
 * the family range — used when a provider opts into the benchmark as their rate
 * (an offer needs one number, not a range). null for gap tiles (no benchmark).
 */
export function benchmarkMidpoint(slug: string): number | null {
  const b = benchmarkFor(slug);
  if (!b) return null;
  return Math.round((b.low + b.high) / 2);
}

export interface CatalogMatch {
  slug: string;
  label: string;
  category: string;
  low: number;
  high: number;
  count: number;
}

export interface CatalogGap {
  slug: string;
  label: string;
  reason: string;
}

export interface Reconciliation {
  matched: CatalogMatch[];
  gaps: CatalogGap[];
}

/**
 * Run the map over all 12 Connect tiles → matches + gap list. The gap list is the
 * "don't silently invent prices" audit artifact: every tile is either priced from
 * the seed or explicitly listed as having no benchmark.
 */
export function reconcileCatalog(): Reconciliation {
  const matched: CatalogMatch[] = [];
  const gaps: CatalogGap[] = [];
  for (const svc of SERVICES) {
    const rule = CONNECT_BENCHMARK_MAP[svc.slug];
    if (!rule || "gap" in rule) {
      gaps.push({ slug: svc.slug, label: svc.label, reason: rule && "gap" in rule ? rule.reason : "no benchmark mapping" });
      continue;
    }
    const b = benchmarkFor(svc.slug);
    if (!b) {
      gaps.push({ slug: svc.slug, label: svc.label, reason: "mapped category matched no seed services" });
      continue;
    }
    matched.push({ slug: svc.slug, label: svc.label, category: b.category, low: b.low, high: b.high, count: b.count });
  }
  return { matched, gaps };
}
