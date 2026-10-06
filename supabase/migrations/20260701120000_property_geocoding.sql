-- =============================================================================
-- Address geocoding — store structured, verified coordinates alongside the
-- free-text address so the routing/ETA + proximity-ranking engine has real
-- lat/lng for every job (today requests carry only a location_label string).
--
-- PROVIDER-NEUTRAL by design: we store lat/lng + a canonical formatted_address
-- (the same meaning for any geocoder) and only tag which provider produced them.
-- geo_place_ref is kept for debugging/dedup but is NEVER load-bearing — switching
-- Mapbox→Google later needs no re-resolution because the coords already exist.
-- address_verified = false means the user confirmed a typed address the geocoder
-- didn't recognize (new construction, rural mountain lots) — still usable.
-- =============================================================================

alter table public.properties
  add column lat              numeric(9,6),
  add column lng              numeric(9,6),
  add column formatted_address text,
  add column geo_provider     text,       -- 'mapbox' | 'google' | null
  add column geo_place_ref    text,       -- provider place id (debug/dedup only, not load-bearing)
  add column address_verified boolean not null default false;

-- requests already has location_lat / location_lng (added with routing); no change
-- needed there — the post-job action copies the chosen property's coords onto the
-- request so dispatch/ETA/proximity work on real geography.
