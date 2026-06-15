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

// ---------------------------------------------------------------------------
// Option-level benchmarks — a specific quick-pick job (composer chip) → the seed
// service that best represents it. Only confident matches are listed; an option
// with no entry has no estimate (the composer shows nothing). Keyed by Connect
// service slug → option slug (services.ts optionSlug) → seed service slug.
// Editorial (George's eye); extend as the catalog firms up.
// ---------------------------------------------------------------------------
const OPTION_BENCHMARKS: Record<string, Record<string, string>> = {
  plumbing: {
    "leak-repair": "plumbing-general-leak-repair",
    "clogged-drain": "plumbing-drain-clog-cleaning",
    "faucet-repair-or-replace": "plumbing-faucet-replacement",
    "toilet-repair": "plumbing-toilet-repair",
    "water-heater": "plumbing-water-heater-repair",
    "garbage-disposal": "plumbing-garbage-disposal-install",
  },
  electrical: {
    "outlet-or-switch": "electrical-outlet-install-replace",
    "light-fixture-install": "electrical-light-fixture-install",
    "ceiling-fan": "electrical-ceiling-fan-install",
    "panel-or-breaker": "electrical-panel-upgrade-100-200a",
    "ev-charger": "electrical-ev-charger-install-level-2",
  },
  heating: {
    "furnace-tune-up": "hvac-tune-up-ac-or-furnace",
    "no-heat-repair": "hvac-common-repair",
    "ac-mini-split-service": "hvac-tune-up-ac-or-furnace",
    "vent-cleaning": "hvac-duct-cleaning",
  },
  handyman: {
    "mount-tv-or-shelves": "handyman-tv-mount",
    "drywall-patch": "handyman-drywall-patch-repair",
    "door-repair": "handyman-interior-door-install",
    "furniture-assembly": "handyman-furniture-assembly",
  },
  roofing: {
    "ice-dam-removal": "snow-ice-roof-ice-dam-clearing",
  },
  painting: {
    "interior-room": "painting-interior-per-room",
    exterior: "painting-exterior-whole-home",
  },
  "window-cleaning": {
    "interior-exterior": "cleaning-window-cleaning-whole-house",
  },
  yard: {
    mowing: "landscaping-lawn-mowing",
    "leaf-cleanup": "landscaping-leaf-removal",
    "tree-or-shrub-trim": "landscaping-tree-trimming",
    mulch: "landscaping-mulch-install",
    "spring-or-fall-cleanup": "landscaping-yard-cleanup",
    "weeding-beds": "landscaping-weed-control",
  },
  "snow-removal": {
    "driveway-clear": "snow-ice-snow-plow-removal",
    "seasonal-contract": "snow-ice-seasonal-contract-residential",
    "ice-dam": "snow-ice-roof-ice-dam-clearing",
    "de-icing": "snow-ice-salt-de-icing-application",
  },
  "home-care": {
    pest: "pest-control-one-time-treatment",
  },
  appliances: {
    "appliance-repair": "appliance-misc-appliance-repair-typical-job",
    "washer-dryer": "appliance-misc-appliance-repair-typical-job",
    dishwasher: "appliance-misc-appliance-repair-typical-job",
    refrigerator: "appliance-misc-appliance-repair-typical-job",
    "oven-range": "appliance-misc-appliance-repair-typical-job",
  },
};

const seedBySlug = new Map(services.map((s) => [s.slug, s]));

/**
 * Mountain-adjusted estimate (cents) for a specific quick-pick option, or null
 * when we don't have a price for it — the composer shows the estimate only when
 * this returns a value.
 */
export function optionBenchmark(serviceSlug: string, optionSlug: string): number | null {
  const seedSlug = OPTION_BENCHMARKS[serviceSlug]?.[optionSlug];
  if (!seedSlug) return null;
  const seed = seedBySlug.get(seedSlug);
  if (!seed) return null;
  return mountainPrice(seed.nationalTypical, marketConfig, seed.mountainBump);
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
