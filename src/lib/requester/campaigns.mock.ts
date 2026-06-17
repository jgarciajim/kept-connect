import type { Campaign } from "./campaigns";

/**
 * Seed campaigns — the mock source behind the getActiveCampaigns seam. Spans the
 * year so the home is never empty and rotates automatically as dates pass.
 * Everything is scoped to Summit County (region: "summit-co"). Dates are 2026 so
 * the demo resolves live content at today's real date.
 *
 * Live in June (demo date): wildfire cleanup (hero), AC tune-up, deck refresh.
 * The fall/winter pushes (sprinkler blowout, furnace, fall yard reset) are the
 * design-reference set — they surface automatically once their windows open.
 *
 * When this becomes a table, these rows move verbatim; only the seam body swaps.
 */
export const CAMPAIGNS: Campaign[] = [
  {
    id: "cmp-wildfire",
    slug: "defensible-space",
    kicker: "Seasonal · Summit County",
    title: "Clear your defensible space",
    subtitle: "Get wildfire-season cleanup done before the dry months peak.",
    ctaLabel: "Book a cleanup",
    targetCategory: "grounds",
    region: "summit-co",
    startsOn: "2026-06-01",
    endsOn: "2026-08-31",
    theme: "summer",
    bannerImage: "defensible-space.png",
    placements: ["hero", "rail"],
    priority: 100,
    active: true,
  },
  {
    id: "cmp-ac-tuneup",
    slug: "ac-tuneup",
    kicker: "Seasonal · Summit County",
    title: "Cool before the heat",
    subtitle: "Tune up the AC or mini-split before the first hot stretch.",
    ctaLabel: "Schedule a tune-up",
    targetCategory: "climate",
    region: "summit-co",
    startsOn: "2026-04-15",
    endsOn: "2026-06-30",
    theme: "spring",
    bannerImage: "ac-tuneup.png",
    placements: ["hero", "rail"],
    priority: 80,
    active: true,
  },
  {
    id: "cmp-deck-refresh",
    slug: "deck-refresh",
    kicker: "Seasonal · Summit County",
    title: "Deck & patio refresh",
    subtitle: "Sand, seal, and stain before patio season hits its stride.",
    ctaLabel: "Refresh my deck",
    targetCategory: "surfaces",
    region: "summit-co",
    startsOn: "2026-05-01",
    endsOn: "2026-08-15",
    theme: "summer",
    badge: "Popular",
    placements: ["tileBadge"],
    priority: 70,
    active: true,
  },
  {
    id: "cmp-sprinkler-blowout",
    slug: "sprinkler-blowout",
    kicker: "Seasonal · Summit County",
    title: "Winter's coming",
    subtitle: "Get your sprinklers blown out before the first hard freeze.",
    ctaLabel: "Schedule a blowout",
    targetCategory: "water",
    region: "summit-co",
    startsOn: "2026-09-01",
    endsOn: "2026-10-31",
    theme: "winter",
    badge: "Seasonal",
    placements: ["hero", "tileBadge"],
    priority: 90,
    active: true,
  },
  {
    id: "cmp-furnace-tuneup",
    slug: "furnace-tuneup",
    kicker: "Seasonal · Summit County",
    title: "Beat the furnace rush",
    subtitle: "Get a heating tune-up booked before the cold sets in.",
    ctaLabel: "Book a tune-up",
    targetCategory: "climate",
    region: "summit-co",
    startsOn: "2026-10-01",
    endsOn: "2026-11-30",
    theme: "neutral",
    placements: ["rail"],
    priority: 60,
    active: true,
  },
  {
    id: "cmp-fall-yard",
    slug: "fall-yard-reset",
    kicker: "Seasonal · Summit County",
    title: "Fall yard reset",
    subtitle: "Leaf haul, gutter cleaning, and bed winterizing in one pass.",
    ctaLabel: "Book a reset",
    targetCategory: "grounds",
    region: "summit-co",
    startsOn: "2026-09-15",
    endsOn: "2026-11-15",
    theme: "fall",
    badge: "Seasonal",
    placements: ["rail", "tileBadge"],
    priority: 75,
    active: true,
  },
];

/**
 * "In your area" insight — static marketing numbers for the moment card. Not
 * member data and not date-resolved today; lives beside the campaigns it sits
 * next to on the home. Swap behind getAreaInsight when real aggregates land.
 */
export interface AreaInsight {
  region: string;
  regionLabel: string;
  headline: string;
  avgQuote: string;
  avgResponse: string;
  prosNearby: number;
}

export const AREA_INSIGHT: AreaInsight = {
  region: "summit-co",
  regionLabel: "Summit County",
  headline: "Pros are responding fast this week.",
  avgQuote: "~$140",
  avgResponse: "2 hrs",
  prosNearby: 38,
};
