import type { ServiceFamily } from "./campaigns";
import { isInSeason, type Season } from "./seasonality";

/**
 * Service catalog — the single source of truth for the 12 services on the
 * requester surface. Config, not hardcode: the discovery/marketing surfaces (the
 * home "Popular this season" row and the full Services grid) render entirely from
 * this list, so nothing pins an icon or label per tile.
 *
 * Icons are the glossy 3D PNGs under /icons/services/ — a two-tier rule applies:
 * these belong to DISCOVERY/MARKETING surfaces only. Functional product UI (job
 * lists, tracking, nav, status) keeps the existing line glyphs; a 3D render at
 * 16px turns to mud.
 *
 * Seasonality reuses the shared helpers in ./seasonality — services use the
 * recurring month-range form (snow every Nov–Apr); campaigns use dated windows.
 *
 * Later this becomes a `services` table (same columns): public read for
 * authenticated members, admin write. Only the source behind the resolvers
 * swaps; callers don't change.
 */

export type { ServiceFamily, Season };

export interface Service {
  slug: string; // 'plumbing'
  label: string; // 'Plumbing'
  family: ServiceFamily; // drives the --cat-* accent
  icon: string; // filename under /icons/services/
  season?: Season; // omitted = year-round
  featured?: boolean; // surfaces on the home "Popular this season" row
  options: string[]; // common jobs (quick-pick chips); a stable slug is derived per label
}

export const SERVICES: Service[] = [
  {
    slug: "plumbing",
    label: "Plumbing",
    family: "water",
    icon: "water-plumbing.png",
    featured: true,
    options: ["Leak repair", "Clogged drain", "Faucet repair or replace", "Toilet repair", "Water heater", "Sprinkler blowout / winterization", "Frozen pipe", "Garbage disposal"],
  },
  {
    slug: "electrical",
    label: "Electrical",
    family: "power",
    icon: "power-electrical.png",
    featured: true,
    options: ["Outlet or switch", "Light fixture install", "Ceiling fan", "Panel or breaker", "EV charger", "Power troubleshooting", "Smoke / CO detectors"],
  },
  {
    slug: "heating",
    label: "Heating & Cooling",
    family: "climate",
    icon: "climate-heating.png",
    featured: true,
    options: ["Furnace tune-up", "No heat (repair)", "Thermostat install", "AC / mini-split service", "Boiler service", "Filter change", "Vent cleaning"],
  },
  {
    slug: "handyman",
    label: "Handyman",
    family: "structure",
    icon: "structure-handyman.png",
    featured: true,
    options: ["Mount TV or shelves", "Drywall patch", "Door repair", "Furniture assembly", "Caulking", "General repairs", "Punch list"],
  },
  {
    slug: "roofing",
    label: "Roofing",
    family: "structure",
    icon: "structure-roofing.png",
    featured: true,
    options: ["Leak repair", "Roof inspection", "Ice dam removal", "Gutter repair", "Shingle replacement"],
  },
  {
    slug: "painting",
    label: "Painting",
    family: "surfaces",
    icon: "surfaces-paint.png",
    featured: true,
    options: ["Interior room", "Exterior", "Touch-ups", "Deck or fence stain", "Cabinet refinish"],
  },
  {
    slug: "window-cleaning",
    label: "Window Cleaning",
    family: "surfaces",
    icon: "surfaces-window.png",
    options: ["Interior + exterior", "Exterior only", "Screens", "Track cleaning", "Hard-water removal"],
  },
  {
    slug: "flooring",
    label: "Flooring",
    family: "surfaces",
    icon: "surfaces-flooring.png",
    featured: true,
    options: ["Floor repair", "New install", "Refinish hardwood", "Tile", "Carpet"],
  },
  {
    slug: "yard",
    label: "Yard & Landscaping",
    family: "grounds",
    icon: "grounds-yard.png",
    featured: true,
    options: ["Mowing", "Leaf cleanup", "Tree or shrub trim", "Weeding / beds", "Mulch", "Spring or fall cleanup", "Irrigation"],
  },
  {
    slug: "snow-removal",
    label: "Snow Removal",
    family: "grounds",
    icon: "grounds-snow.png",
    season: { fromMonth: 11, toMonth: 4 }, // Nov–Apr, wraps the year
    featured: true, // only ever reaches the home row while in season (resolver gates it)
    options: ["Driveway clear", "Walkway & steps", "Roof rake", "Seasonal contract", "Ice dam", "De-icing"],
  },
  {
    slug: "home-care",
    label: "Home Care",
    family: "care",
    icon: "care-homecare.png",
    featured: true,
    options: ["Home check visit", "Vacancy watch", "Key / access", "Storm check", "Pre-arrival check", "Pest"],
  },
  {
    slug: "appliances",
    label: "Appliances",
    family: "fixtures",
    icon: "fixtures-appliance.png",
    featured: true,
    options: ["Appliance repair", "New install", "Washer / dryer", "Dishwasher", "Refrigerator", "Oven / range", "Haul away old"],
  },
];

/**
 * Services available right now: year-round services plus any whose recurring
 * season includes `now`. Out-of-season services drop off (snow disappears in
 * summer). This is the source for the full Services grid.
 */
export function getAvailableServices(opts: { now: Date }): Service[] {
  return SERVICES.filter((s) => !s.season || isInSeason(opts.now, s.season));
}

/**
 * The home "Popular this season" subset: available services flagged featured.
 * Because availability is applied first, a featured-but-out-of-season service
 * (snow in July) is correctly absent — and rejoins automatically in November.
 */
export function getFeaturedServices(opts: { now: Date }): Service[] {
  // Cap at 8 so the home "Popular this season" row stays two clean rows of four
  // (in array order), regardless of how many are featured or seasonally available.
  return getAvailableServices(opts)
    .filter((s) => s.featured)
    .slice(0, 8);
}

/**
 * Stable kebab-case slug for a quick-pick option label. This is what the request
 * carries (not the label), so a label tweak doesn't silently churn the slug —
 * when options move to the DB they keep these derived slugs. Pure + deterministic.
 */
export function optionSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Resolve a stored option slug back to its human label for display
 * (e.g. "Plumbing · Water heater"). Returns null if the service or option is
 * unknown — the caller falls back to the service title alone.
 */
export function getServiceOptionLabel(serviceSlug: string, optionSlugValue: string | null | undefined): string | null {
  if (!optionSlugValue) return null;
  const service = SERVICES.find((s) => s.slug === serviceSlug);
  return service?.options.find((label) => optionSlug(label) === optionSlugValue) ?? null;
}
