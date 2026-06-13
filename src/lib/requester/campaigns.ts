import type { CategoryKey } from "@/components/ui";
import { isWithinWindow } from "./seasonality";
import { CAMPAIGNS, AREA_INSIGHT, type AreaInsight } from "./campaigns.mock";

export type { AreaInsight };

/**
 * Campaigns — the seasonal marketing/editorial layer behind the requester home.
 * A campaign is content: a dated, region-scoped push (fall sprinkler blowouts,
 * summer defensible-space cleanup) that the marketing surfaces render whenever
 * it's live for the viewer's region today. Nothing here is member data — it's
 * the same for everyone in a region — which is why the eventual table is
 * public-read (see getActiveCampaigns).
 *
 * The resolver (resolveCampaigns) is a pure function so it can be unit-tested
 * without a DB; getActiveCampaigns is the single data-access seam.
 */

// A service family — identical to the wayfinding CategoryKey, aliased so a
// campaign's targetCategory lines up with requests.trade and the service catalog.
export type ServiceFamily = CategoryKey;

// Drives the card art / background tint ONLY — never the CTA or any action.
export type CampaignTheme = "winter" | "fall" | "spring" | "summer" | "neutral";

// Where a campaign is allowed to surface. One campaign can power several.
export type Placement = "hero" | "rail" | "tileBadge";

export interface Campaign {
  id: string;
  slug: string;
  kicker: string; // e.g. "Seasonal · Summit County"
  title: string; // e.g. "Winter's coming"
  subtitle: string; // one line
  ctaLabel: string; // e.g. "Schedule a blowout"
  targetCategory: ServiceFamily; // CTA pre-fills a request in this family
  region: string | null; // e.g. "summit-co"; null = everywhere
  startsOn: string; // ISO date, inclusive
  endsOn: string; // ISO date, inclusive
  theme: CampaignTheme; // drives card art/tint ONLY
  badge?: string; // e.g. "Seasonal" | "Popular"
  placements: Placement[]; // hero / rail / tileBadge — any combination
  priority: number; // higher surfaces first
  active: boolean;
}

/**
 * Pure resolver — the testable heart of the system. Given every campaign and a
 * { region, now }, returns the ones live for that region today, ordered for
 * display. Does NOT slice: the UI decides how many to show per placement.
 *
 *  - active only
 *  - region matches the viewer's region, OR is null (everywhere)
 *  - now within [startsOn, endsOn] inclusive
 *  - sort by priority desc, then startsOn asc
 */
export function resolveCampaigns(
  all: Campaign[],
  opts: { region: string; now: Date },
): Campaign[] {
  const { region, now } = opts;
  return all
    .filter((c) => c.active)
    .filter((c) => c.region === region || c.region === null)
    .filter((c) => isWithinWindow(now, c.startsOn, c.endsOn))
    .sort((a, b) => b.priority - a.priority || a.startsOn.localeCompare(b.startsOn));
}

/**
 * The seam — the ONLY place that knows where campaigns come from. Today it reads
 * the mock seed and runs it through the pure resolver. When the hosted schema is
 * ready this body becomes a Supabase `select` (public read for any authenticated
 * member, admin write) — the signature and everything downstream stay the same.
 */
export async function getActiveCampaigns(opts: { region: string; now?: Date }): Promise<Campaign[]> {
  const now = opts.now ?? new Date();
  return resolveCampaigns(CAMPAIGNS, { region: opts.region, now });
}

/**
 * Area-insight seam — static today, same swap-the-body pattern as campaigns.
 * Region param kept so the signature is ready for a real per-region aggregate.
 */
export async function getAreaInsight(opts: { region: string }): Promise<AreaInsight> {
  // Single-region mock today; echo the requested region so the shape is already
  // correct for a real per-region aggregate behind this seam.
  return { ...AREA_INSIGHT, region: opts.region };
}

// --- placement selectors --------------------------------------------------
// Called by the page against the already-resolved list. Each placement decides
// what it pulls; a campaign opts into a placement via its `placements` array.

/** First campaign eligible for the hero (already priority-ordered), or null. */
export function pickHero(campaigns: Campaign[]): Campaign | null {
  return campaigns.find((c) => c.placements.includes("hero")) ?? null;
}

/** All campaigns eligible for the editorial rail, in resolved order. */
export function pickRail(campaigns: Campaign[]): Campaign[] {
  return campaigns.filter((c) => c.placements.includes("rail"));
}

/**
 * The badge string for a category tile of `family`, if any live campaign targets
 * it via the tileBadge placement — else null (so the UI shows no pill).
 */
export function badgeFor(campaigns: Campaign[], family: ServiceFamily): string | null {
  const hit = campaigns.find(
    (c) => c.placements.includes("tileBadge") && c.targetCategory === family && c.badge,
  );
  return hit?.badge ?? null;
}
