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
}

export const SERVICES: Service[] = [
  { slug: "plumbing", label: "Plumbing", family: "water", icon: "water-plumbing.png", featured: true },
  { slug: "electrical", label: "Electrical", family: "power", icon: "power-electrical.png", featured: true },
  { slug: "heating", label: "Heating & Cooling", family: "climate", icon: "climate-heating.png", featured: true },
  { slug: "handyman", label: "Handyman", family: "structure", icon: "structure-handyman.png", featured: true },
  { slug: "roofing", label: "Roofing", family: "structure", icon: "structure-roofing.png", featured: true },
  { slug: "painting", label: "Painting", family: "surfaces", icon: "surfaces-paint.png", featured: true },
  { slug: "window-cleaning", label: "Window Cleaning", family: "surfaces", icon: "surfaces-window.png" },
  { slug: "flooring", label: "Flooring", family: "surfaces", icon: "surfaces-flooring.png", featured: true },
  { slug: "yard", label: "Yard & Landscaping", family: "grounds", icon: "grounds-yard.png", featured: true },
  {
    slug: "snow-removal",
    label: "Snow Removal",
    family: "grounds",
    icon: "grounds-snow.png",
    season: { fromMonth: 11, toMonth: 4 }, // Nov–Apr, wraps the year
    featured: true, // only ever reaches the home row while in season (resolver gates it)
  },
  { slug: "home-care", label: "Home Care", family: "care", icon: "care-homecare.png", featured: true },
  { slug: "appliances", label: "Appliances", family: "fixtures", icon: "fixtures-appliance.png", featured: true },
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
  return getAvailableServices(opts).filter((s) => s.featured);
}
