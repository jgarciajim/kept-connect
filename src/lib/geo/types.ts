/**
 * Provider-neutral geocoding contract. The app (component, routes, DB) speaks
 * only these shapes; a single adapter per provider (mapbox.ts, later google.ts)
 * translates. Swapping providers = new adapter + env flag, no app changes.
 */

/** One autocomplete suggestion (what the type-ahead dropdown lists). */
export interface GeoSuggestion {
  /** Opaque provider id, passed back to `retrieve` to get full coords. */
  ref: string;
  /** Primary line, e.g. "123 Main St". */
  primary: string;
  /** Context line, e.g. "Breckenridge, CO 80424". */
  secondary: string;
}

/** A resolved place with coordinates (from retrieve or reverse). */
export interface GeoResult {
  lat: number;
  lng: number;
  /** Canonical one-line address from the provider. */
  formatted: string;
  /** Provider place id (debug/dedup only, never load-bearing). */
  ref: string | null;
}

/** The structured value an address field emits and a form submits. */
export interface GeoValue {
  /** Display text — the formatted address, or the user's typed text. */
  address: string;
  lat: number | null;
  lng: number | null;
  formatted: string | null;
  /** true when chosen from the geocoder or reverse-geocoded; false when the user
   *  confirmed a typed address the geocoder didn't recognize. */
  verified: boolean;
  ref: string | null;
}

/** What every provider adapter implements. */
export interface Geocoder {
  readonly provider: string;
  suggest(query: string, opts: { session: string; proximity?: { lat: number; lng: number } }): Promise<GeoSuggestion[]>;
  retrieve(ref: string, opts: { session: string }): Promise<GeoResult | null>;
  reverse(lat: number, lng: number): Promise<GeoResult | null>;
}
