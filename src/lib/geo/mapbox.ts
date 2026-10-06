import type { Geocoder, GeoResult, GeoSuggestion } from "./types";

/**
 * Mapbox adapter — Search Box API for type-ahead (suggest + retrieve, grouped by
 * a session_token for billing) and Geocoding v6 for reverse. Biased to US
 * addresses; pass `proximity` (e.g. the user's current location) to rank nearby
 * results first. The token stays server-side (this runs only in route handlers).
 */
const SEARCHBOX = "https://api.mapbox.com/search/searchbox/v1";
const GEOCODE = "https://api.mapbox.com/search/geocode/v6";

export function mapboxGeocoder(token: string): Geocoder {
  return {
    provider: "mapbox",

    async suggest(query, { session, proximity }) {
      const u = new URL(`${SEARCHBOX}/suggest`);
      u.searchParams.set("q", query);
      u.searchParams.set("access_token", token);
      u.searchParams.set("session_token", session);
      u.searchParams.set("country", "us");
      u.searchParams.set("types", "address");
      u.searchParams.set("limit", "6");
      if (proximity) u.searchParams.set("proximity", `${proximity.lng},${proximity.lat}`);
      const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`mapbox suggest ${res.status}`);
      const json = (await res.json()) as { suggestions?: Array<{ mapbox_id: string; name: string; place_formatted?: string }> };
      return (json.suggestions ?? []).map<GeoSuggestion>((s) => ({
        ref: s.mapbox_id,
        primary: s.name,
        secondary: s.place_formatted ?? "",
      }));
    },

    async retrieve(ref, { session }) {
      const u = new URL(`${SEARCHBOX}/retrieve/${encodeURIComponent(ref)}`);
      u.searchParams.set("access_token", token);
      u.searchParams.set("session_token", session);
      const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`mapbox retrieve ${res.status}`);
      const json = (await res.json()) as {
        features?: Array<{ geometry: { coordinates: [number, number] }; properties: { full_address?: string; place_formatted?: string; name?: string } }>;
      };
      const f = json.features?.[0];
      if (!f) return null;
      const [lng, lat] = f.geometry.coordinates;
      return { lat, lng, formatted: f.properties.full_address ?? f.properties.place_formatted ?? f.properties.name ?? "", ref };
    },

    async reverse(lat, lng) {
      const u = new URL(`${GEOCODE}/reverse`);
      u.searchParams.set("longitude", String(lng));
      u.searchParams.set("latitude", String(lat));
      u.searchParams.set("access_token", token);
      u.searchParams.set("types", "address");
      u.searchParams.set("limit", "1");
      const res = await fetch(u, { signal: AbortSignal.timeout(8000) });
      if (!res.ok) throw new Error(`mapbox reverse ${res.status}`);
      const json = (await res.json()) as {
        features?: Array<{ id?: string; geometry: { coordinates: [number, number] }; properties: { full_address?: string; place_formatted?: string } }>;
      };
      const f = json.features?.[0];
      if (!f) return null;
      const [flng, flat] = f.geometry.coordinates;
      return { lat: flat, lng: flng, formatted: f.properties.full_address ?? f.properties.place_formatted ?? "", ref: f.id ?? null };
    },
  };
}
