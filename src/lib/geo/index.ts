import type { Geocoder } from "./types";
import { mapboxGeocoder } from "./mapbox";

export type { Geocoder, GeoSuggestion, GeoResult, GeoValue } from "./types";

/**
 * Pick the active geocoder from env, or null when no provider is configured
 * (key-optional: the address field then degrades to plain text + "confirm
 * anyway"). GEO_PROVIDER defaults to mapbox. Token is server-side only.
 */
export function getGeocoder(): Geocoder | null {
  const provider = process.env.GEO_PROVIDER ?? "mapbox";
  if (provider === "mapbox") {
    const token = process.env.MAPBOX_TOKEN;
    return token ? mapboxGeocoder(token) : null;
  }
  // future: if (provider === "google") { ... }
  return null;
}

/** Whether geocoding is live — used by the UI to decide autocomplete vs plain text. */
export function geocodingEnabled(): boolean {
  return getGeocoder() !== null;
}
