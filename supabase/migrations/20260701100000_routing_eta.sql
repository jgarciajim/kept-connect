-- =============================================================================
-- Routing & ETA (v1) + the ETA calibration flywheel (v2).
--
-- PRODUCT SHAPE (deliberately not live GPS tracking): the provider taps
-- "On my way" → the client sees status + a CONSERVATIVE ETA WINDOW. No live pin
-- is streamed to the client (provider safety + independent-contractor posture:
-- share status, not surveillance — same minimization as the masked thread). The
-- provider navigates with their own maps app via a Google Maps deep link built
-- client-side: https://www.google.com/maps/dir/?api=1&destination=<lat>,<lng>.
--
-- v1: mark_on_my_way computes a conservative straight-line-based ETA (haversine ×
--     road factor ÷ a conservative speed, rounded to a wide window) from the
--     provider's current position (captured by browser geolocation at tap and
--     passed in) or their saved base location, to the request location.
-- v2: every enroute→arrival pair is logged as predicted-vs-actual (the arrival
--     time already lives in arrival_checkins). recompute_eta_calibration() turns
--     that into a per-geo correction factor — the same "capture now, calibrate
--     later" flywheel as the ranker / trip-charge / estimate logs.
--
-- BONUS: provider location also feeds two ranker gaps that were neutral defaults —
-- real proximity (P) and the coverage-geo eligibility gate. Provider coordinates
-- live in a SEPARATE owner/admin-scoped table (NOT the public provider_profiles),
-- so a provider's home is never exposed on the public trust surface.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- provider_locations — private. Read by the owner + admins; the ranker/ETA read
-- it as SECURITY DEFINER. Never joined into the public profile.
-- ----------------------------------------------------------------------------
create table public.provider_locations (
  member_id         uuid primary key references public.members(id) on delete cascade,
  base_lat          numeric(9,6) not null,
  base_lng          numeric(9,6) not null,
  service_radius_km numeric not null default 50,   -- coverage radius (D9 gate)
  updated_at        timestamptz not null default now()
);
alter table public.provider_locations enable row level security;
revoke all on public.provider_locations from anon;
grant select on public.provider_locations to authenticated;   -- own/admin; written via RPC
create policy provider_locations_select_self_or_admin on public.provider_locations
  for select using (member_id = public.current_member_id() or public.current_member_is_admin());

create or replace function public.set_provider_location(
  p_lat numeric, p_lng numeric, p_radius_km numeric default 50
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := public.current_member_id();
begin
  if me is null then raise exception 'not authenticated'; end if;
  insert into public.provider_locations (member_id, base_lat, base_lng, service_radius_km)
    values (me, p_lat, p_lng, coalesce(p_radius_km, 50))
    on conflict (member_id) do update
      set base_lat = excluded.base_lat, base_lng = excluded.base_lng,
          service_radius_km = excluded.service_radius_km, updated_at = now();
end $$;
grant execute on function public.set_provider_location(numeric, numeric, numeric) to authenticated;

-- ----------------------------------------------------------------------------
-- ETA config (the conservative knobs) + calibration store.
-- ----------------------------------------------------------------------------
create table public.eta_config (
  id            int primary key default 1 check (id = 1),
  road_factor   numeric not null default 1.4,   -- roads aren't straight lines
  avg_speed_kmh numeric not null default 40,     -- ~25 mph: conservative, mountain-town roads/weather
  bucket_min    int     not null default 10,     -- round the window to 10-min buckets
  min_eta_min   int     not null default 10,     -- never promise faster than this
  min_samples   int     not null default 5       -- samples needed before a geo is calibrated
);
insert into public.eta_config (id) values (1) on conflict (id) do nothing;
alter table public.eta_config enable row level security;
revoke all on public.eta_config from anon;
grant select on public.eta_config to authenticated;
create policy eta_config_select_all on public.eta_config for select using (true);

create table public.eta_geo_calibration (
  geo_key    text primary key,          -- coarse lat,lng bucket of the destination
  factor     numeric not null default 1.0,
  sample_n   int     not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.eta_geo_calibration enable row level security;
revoke all on public.eta_geo_calibration from anon;
grant select on public.eta_geo_calibration to authenticated;
create policy eta_geo_calibration_select_all on public.eta_geo_calibration for select using (true);

-- ----------------------------------------------------------------------------
-- Geometry helpers.
-- ----------------------------------------------------------------------------
create or replace function public.haversine_km(
  p_lat1 numeric, p_lng1 numeric, p_lat2 numeric, p_lng2 numeric
)
returns numeric
language sql
immutable
as $$
  select 6371.0 * 2 * asin(sqrt(
    power(sin(radians((p_lat2 - p_lat1) / 2)), 2)
    + cos(radians(p_lat1)) * cos(radians(p_lat2))
      * power(sin(radians((p_lng2 - p_lng1) / 2)), 2)
  ))
$$;

create or replace function public.eta_geo_key(p_lat numeric, p_lng numeric)
returns text
language sql
immutable
as $$
  select round(p_lat, 1)::text || ',' || round(p_lng, 1)::text
$$;

-- A conservative ETA WINDOW (low, high minutes) for a distance, applying the
-- per-geo calibration factor when one exists (v2), clamped to sensible bounds.
create or replace function public.estimate_eta_window(p_dist_km numeric, p_geo_key text)
returns table (eta_low int, eta_high int)
language sql
stable
security definer
set search_path = public
as $$
  with c as (select * from public.eta_config where id = 1),
  cal as (select coalesce((select factor from public.eta_geo_calibration where geo_key = p_geo_key), 1.0) as f),
  m as (
    select (p_dist_km * c.road_factor / c.avg_speed_kmh * 60 * cal.f) as base_min,
           c.bucket_min, c.min_eta_min
    from c, cal
  )
  select greatest(m.min_eta_min, (floor(m.base_min / m.bucket_min) * m.bucket_min)::int) as eta_low,
         greatest(m.min_eta_min + m.bucket_min, ((floor(m.base_min / m.bucket_min) + 1) * m.bucket_min)::int) as eta_high
  from m
$$;

-- ----------------------------------------------------------------------------
-- ETA snapshot on the request (the live value the client sees + flywheel inputs).
-- eta_minutes already exists → holds the conservative HIGH end of the window.
-- ----------------------------------------------------------------------------
alter table public.requests
  add column eta_min_low     int,
  add column eta_computed_at timestamptz,
  add column eta_origin_km   numeric;

-- ----------------------------------------------------------------------------
-- mark_on_my_way — the location-aware "On my way" (supersedes start_job for
-- located jobs; both do awarded→enroute). Origin = the geolocation captured at
-- tap (passed in) or the provider's saved base location; no origin/destination
-- geo → still transitions + notifies, just without an ETA.
-- ----------------------------------------------------------------------------
create or replace function public.mark_on_my_way(
  p_request_id uuid,
  p_lat        numeric default null,   -- provider's current position at tap (browser geolocation)
  p_lng        numeric default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me    uuid := public.current_member_id();
  r     public.requests;
  o_lat numeric := p_lat;
  o_lng numeric := p_lng;
  d     numeric;
  w     record;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.awarded_provider_id <> me then raise exception 'not your job'; end if;
  if r.status <> 'awarded' then raise exception 'cannot start a job in status %', r.status; end if;

  update public.requests set status = 'enroute' where id = r.id;

  if o_lat is null then
    select base_lat, base_lng into o_lat, o_lng from public.provider_locations where member_id = me;
  end if;

  if o_lat is not null and r.location_lat is not null then
    d := public.haversine_km(o_lat, o_lng, r.location_lat, r.location_lng);
    select * into w from public.estimate_eta_window(d, public.eta_geo_key(r.location_lat, r.location_lng));
    update public.requests
       set eta_minutes = w.eta_high, eta_min_low = w.eta_low,
           eta_origin_km = round(d, 2), eta_computed_at = now()
     where id = r.id;
    perform public.create_notification(
      r.requester_id, 'enroute', 'On the way',
      'Your pro is on the way — ETA ' || w.eta_low || '–' || w.eta_high || ' min', r.id);
  else
    perform public.create_notification(
      r.requester_id, 'enroute', 'On the way', 'Your pro is on the way', r.id);
  end if;
end $$;
grant execute on function public.mark_on_my_way(uuid, numeric, numeric) to authenticated;

-- ----------------------------------------------------------------------------
-- v2 flywheel — predicted vs actual. actual_min = minutes from "On my way" to the
-- arrival check-in (the true arrival time we already capture for the trip-charge
-- evidence spine). security_invoker so RLS applies to the caller.
-- ----------------------------------------------------------------------------
create view public.eta_accuracy with (security_invoker = true) as
  select r.id as request_id,
         r.eta_min_low  as predicted_low_min,
         r.eta_minutes  as predicted_high_min,
         r.eta_origin_km,
         r.eta_computed_at,
         ac.checked_in_at as arrived_at,
         round(extract(epoch from (ac.checked_in_at - r.eta_computed_at)) / 60.0)::int as actual_min,
         public.eta_geo_key(r.location_lat, r.location_lng) as geo_key
  from public.requests r
  join public.arrival_checkins ac on ac.request_id = r.id
  where r.eta_computed_at is not null;

grant select on public.eta_accuracy to authenticated;

-- Recompute per-geo calibration from observed predicted-vs-actual. factor =
-- median(actual / predicted_high), clamped to [0.5, 3]; only geos with enough
-- samples. factor > 1 means we were optimistic there → future ETAs scale up.
create or replace function public.recompute_eta_calibration()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare v_rows int;
begin
  insert into public.eta_geo_calibration (geo_key, factor, sample_n, updated_at)
  select geo_key,
         least(3.0, greatest(0.5,
           percentile_cont(0.5) within group (order by actual_min::numeric / nullif(predicted_high_min, 0)))),
         count(*),
         now()
  from public.eta_accuracy
  where actual_min is not null and actual_min >= 0 and predicted_high_min > 0
  group by geo_key
  having count(*) >= (select min_samples from public.eta_config where id = 1)
  on conflict (geo_key) do update
    set factor = excluded.factor, sample_n = excluded.sample_n, updated_at = now();
  get diagnostics v_rows = row_count;
  return v_rows;
end $$;
grant execute on function public.recompute_eta_calibration() to authenticated;

-- ----------------------------------------------------------------------------
-- Wire real proximity (P) + the coverage-geo gate into the ranker from the new
-- provider location data. (rank_providers body = 20260701094000 version, with a
-- provider_locations join, a real distance-decay P, and an 'outside_geo' gate.)
-- No provider_locations row → P falls back to the neutral default + no geo gate,
-- so existing behavior is unchanged.
-- ----------------------------------------------------------------------------
alter table public.ranker_config
  add column p_max_radius_km numeric not null default 40,
  add column p_floor         numeric not null default 0.15;

create or replace function public.rank_providers(p_request_id uuid)
returns table (
  provider_id  uuid,
  eligible     boolean,
  gate_reason  text,
  score        numeric,
  factors      jsonb,
  rank_position int
)
language sql
stable
security definer
set search_path = public
as $$
  with cfg as (select * from public.ranker_config where id = 1),
  req as (select id, category, requester_id, location_lat, location_lng
          from public.requests where id = p_request_id),
  cand as (
    select pp.member_id, pp.online, pp.verified
    from public.provider_profiles pp, req
    where req.category = any (pp.trades)
      and pp.member_id <> req.requester_id
      and not exists (
        select 1 from public.offers o
        where o.request_id = req.id and o.provider_id = pp.member_id
      )
  ),
  scored as (
    select
      c.member_id,
      case
        when not c.online   then 'unavailable'
        when not c.verified then 'not_verified'
        when exists (select 1 from public.enforcement_events e
                      where e.member_id = c.member_id and e.action = 'removal') then 'removed'
        when exists (select 1 from public.enforcement_events e
                      where e.member_id = c.member_id and e.action = 'suspension') then 'suspended'
        when pv.coi_expiry is not null and pv.coi_expiry < current_date then 'credentials_expired'
        when pl.member_id is not null and req.location_lat is not null
             and public.haversine_km(pl.base_lat, pl.base_lng, req.location_lat, req.location_lng) > pl.service_radius_km
          then 'outside_geo'
        when (select count(*) from public.offers o
               where o.provider_id = c.member_id and o.status = 'pending') >= cfg.concurrent_offer_cap
          then 'at_offer_cap'
        else null
      end as gate_reason,
      public.ranker_bayesian_rating(c.member_id, req.category) as r_score,
      (select case when count(*) = 0 then cfg.reliability_default
                   else (count(*) filter (where status in ('complete','paid','rated'))::numeric
                         / count(*)) * 1.0
              end
         from public.requests aj where aj.awarded_provider_id = c.member_id) as c_score,
      case
        when pl.member_id is not null and req.location_lat is not null then
          greatest(cfg.p_floor, least(1.0,
            1 - public.haversine_km(pl.base_lat, pl.base_lng, req.location_lat, req.location_lng)
                / nullif(cfg.p_max_radius_km, 0)))
        else cfg.proximity_default
      end as p_score,
      (1.0 / (1 + (
          (select count(*) from public.offers o
             where o.provider_id = c.member_id and o.status = 'pending')
        + (select count(*) from public.requests aj
             where aj.awarded_provider_id = c.member_id
               and aj.status in ('awarded','enroute','awaiting_assessment','adjustment_pending'))
      ))) as a_score,
      (select case when count(*) filter (where status in ('accepted','declined','expired')) = 0
                   then cfg.responsiveness_default
                   else count(*) filter (where status in ('accepted','declined'))::numeric
                        / count(*) filter (where status in ('accepted','declined','expired'))
              end
         from public.offers o where o.provider_id = c.member_id) as s_score
    from cand c
    cross join cfg
    cross join req
    left join public.provider_verifications pv on pv.member_id = c.member_id
    left join public.provider_locations     pl on pl.member_id = c.member_id
  ),
  composed as (
    select s.*,
      (cfg.w_rating*s.r_score + cfg.w_reliability*s.c_score + cfg.w_proximity*s.p_score
       + cfg.w_availability*s.a_score + cfg.w_responsiveness*s.s_score) as composite
    from scored s cross join cfg
  ),
  ranked as (
    select c.*,
      (c.gate_reason is null) as is_eligible,
      row_number() over (
        order by (c.gate_reason is null) desc,
                 c.composite desc,
                 c.s_score desc,
                 c.p_score desc,
                 md5(c.member_id::text)
      ) as pos
    from composed c
  )
  select
    r.member_id as provider_id,
    r.is_eligible as eligible,
    r.gate_reason,
    case when r.is_eligible then round(r.composite, 4) end as score,
    jsonb_build_object(
      'R', round(r.r_score,4), 'C', round(r.c_score,4), 'P', round(r.p_score,4),
      'A', round(r.a_score,4), 'S', round(r.s_score,4),
      'weights', jsonb_build_object(
        'wR', cfg.w_rating, 'wC', cfg.w_reliability, 'wP', cfg.w_proximity,
        'wA', cfg.w_availability, 'wS', cfg.w_responsiveness),
      'bayes_m', cfg.bayes_m,
      'gate_reason', r.gate_reason
    ) as factors,
    case when r.is_eligible then r.pos::int end as rank_position
  from ranked r cross join cfg
  order by r.is_eligible desc, r.pos
$$;
