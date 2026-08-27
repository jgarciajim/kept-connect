-- =============================================================================
-- Provider-declared ETA — the Jobber-style "5 / 10 / 15 min away" quick pick.
--
-- The provider taps "On my way" and chooses how far out they are; the customer
-- sees that number. No location, no permission prompt, no tracking — the pro just
-- self-reports. This becomes the PRIMARY on-my-way UX; the distance-computed window
-- (v1) stays available as a dormant fallback for anyone who does pass coordinates.
--
-- The declared number is stored verbatim as a single value (no window), tagged
-- eta_source = 'declared' so the distance-calibration flywheel never learns from a
-- human guess — it stays a measure of the distance model alone.
-- =============================================================================

-- Tag where an ETA came from. NULL on pre-existing rows = treat as computed (they
-- predate declared ETAs), so the flywheel keeps counting them.
alter table public.requests add column eta_source text;   -- 'declared' | 'computed' | null

-- Redefine mark_on_my_way with a provider-declared ETA option. p_eta_minutes is
-- added LAST so the existing positional (request, lat, lng) calls keep working.
-- Precedence: a declared ETA wins; else the computed window; else status only.
drop function if exists public.mark_on_my_way(uuid, numeric, numeric);

create or replace function public.mark_on_my_way(
  p_request_id  uuid,
  p_lat         numeric default null,   -- optional: provider position (computed path)
  p_lng         numeric default null,
  p_eta_minutes int     default null    -- provider's self-reported "X min away"
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

  -- 1. Provider-declared ETA — the primary path. A single number, no location.
  if p_eta_minutes is not null and p_eta_minutes > 0 then
    update public.requests
       set eta_minutes = p_eta_minutes, eta_min_low = null,
           eta_origin_km = null, eta_computed_at = now(), eta_source = 'declared'
     where id = r.id;
    perform public.create_notification(
      r.requester_id, 'enroute', 'On the way',
      'Your pro is on the way — ETA about ' || p_eta_minutes || ' min', r.id);
    return;
  end if;

  -- 2. Computed conservative window from live/base location (dormant fallback).
  if o_lat is null then
    select base_lat, base_lng into o_lat, o_lng from public.provider_locations where member_id = me;
  end if;

  if o_lat is not null and r.location_lat is not null then
    d := public.haversine_km(o_lat, o_lng, r.location_lat, r.location_lng);
    select * into w from public.estimate_eta_window(d, public.eta_geo_key(r.location_lat, r.location_lng));
    update public.requests
       set eta_minutes = w.eta_high, eta_min_low = w.eta_low,
           eta_origin_km = round(d, 2), eta_computed_at = now(), eta_source = 'computed'
     where id = r.id;
    perform public.create_notification(
      r.requester_id, 'enroute', 'On the way',
      'Your pro is on the way — ETA ' || w.eta_low || '–' || w.eta_high || ' min', r.id);
  else
    perform public.create_notification(
      r.requester_id, 'enroute', 'On the way', 'Your pro is on the way', r.id);
  end if;
end $$;
grant execute on function public.mark_on_my_way(uuid, numeric, numeric, int) to authenticated;

-- Keep the distance-calibration flywheel honest: it learns only from computed
-- predictions, never provider self-reports. (is distinct from 'declared' keeps the
-- NULL-source legacy rows counting, and excludes only the declared ones.)
create or replace view public.eta_accuracy with (security_invoker = true) as
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
  where r.eta_computed_at is not null
    and r.eta_source is distinct from 'declared';

grant select on public.eta_accuracy to authenticated;
