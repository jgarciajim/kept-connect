-- =============================================================================
-- Instant dispatch prices from the PROVIDER'S OWN RATE — classification spine.
--
-- Dispatch-spec §0/§2: "The platform must never unilaterally set a provider's
-- price." Until now the instant round-robin offered at `services.base_price`
-- (a platform number, identical for every pro) — exactly the Uber/Handy/AB5
-- reclassification trap the spec warns against. This migration makes the offered
-- price read from the matched pro's own `provider_subjob_rates`, records where the
-- number came from (`offers.rate_source`), and gates out any pro who hasn't priced
-- the job (so we never fall back to a platform price).
--
-- Taxonomy bridge: the instant `services` catalog (category/name) wasn't linked to
-- the provider-rate taxonomy (service_slug/option_slug). We add that mapping on
-- `services` and backfill the seeded catalog. A service with no mapping is simply
-- not instant-dispatchable (no pro can price-match it) — never offered at a
-- platform price.
--
-- base_price is KEPT (a rough requester-facing benchmark / legacy field) but is no
-- longer the source of any offer price.
--
-- NOTE: rank_providers below is the CURRENT cumulative version (from
-- 20260701100000_routing_eta.sql: proximity P-score + outside_geo + removed/
-- suspended gates), re-pasted VERBATIM with only two additions — the services
-- join and the 'no_rate' gate. Do not diff it against ranker_v1 (that one is
-- two revisions stale).
-- =============================================================================

-- 1. offers carry the price's provenance (audit trail, spec §6). Null for
--    quote/direct offers; 'own' | 'benchmark' for instant.
alter table public.offers
  add column rate_source text
  check (rate_source is null or rate_source in ('own', 'benchmark'));
comment on column public.offers.rate_source is
  'Instant offers: provenance of `pay` — ''own'' = provider''s own stored rate, '
  '''benchmark'' = a benchmark the provider opted into. Null for quote/direct '
  'offers. Part of the classification audit trail (dispatch-spec §6).';

-- 2. Map each fixed-price service to the provider-rate taxonomy.
alter table public.services
  add column service_slug text,
  add column option_slug  text;
comment on column public.services.service_slug is
  'Maps this fixed-price service to provider_subjob_rates.service_slug (SERVICES[].slug). '
  'Null = unmapped, i.e. not instant-dispatchable.';
comment on column public.services.option_slug is
  'The sub-job within service_slug (provider_subjob_rates.option_slug / optionSlug()).';

-- Backfill the seeded catalog (slugs per src/lib/requester/services.ts + optionSlug()).
update public.services set service_slug = 'plumbing',   option_slug = 'toilet-repair'
  where category = 'water'   and name in ('Replace toilet valve', 'Replace toilet');
update public.services set service_slug = 'plumbing',   option_slug = 'garbage-disposal'
  where category = 'water'   and name = 'Install garbage disposal';
update public.services set service_slug = 'plumbing',   option_slug = 'faucet-repair-or-replace'
  where category = 'water'   and name = 'Swap a faucet';
update public.services set service_slug = 'electrical', option_slug = 'outlet-or-switch'
  where category = 'power'   and name = 'Install an outlet';
update public.services set service_slug = 'electrical', option_slug = 'light-fixture-install'
  where category = 'power'   and name = 'Swap a light fixture';
update public.services set service_slug = 'heating',    option_slug = 'thermostat-install'
  where category = 'climate' and name = 'Replace a thermostat';
-- 'Standard home cleaning' (care) stays unmapped: no cleaning sub-job exists in the
-- rate catalog yet, so it is not instant-dispatchable until a cleaning trade is added.

-- 3. Ranker gate: an instant pro who hasn't set an active FLAT rate for the job's
--    sub-job is ineligible ('no_rate'), so the loop never offers at a platform
--    price and never hands dispatch_next_offer a pro without an own-rate to read.
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
  req as (select id, category, requester_id, dispatch_mode, service_id, location_lat, location_lng
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
        -- instant pricing is classification-gated: the pro must have their OWN
        -- active flat rate for this service's sub-job, or they are not offered.
        when req.dispatch_mode = 'instant'
             and not exists (
               select 1 from public.provider_subjob_rates psr
               where psr.member_id    = c.member_id
                 and sl.service_slug is not null
                 and psr.service_slug = sl.service_slug
                 and psr.option_slug  = sl.option_slug
                 and psr.price_model  = 'flat'
                 and psr.active
             )
          then 'no_rate'
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
    left join public.services               sl on sl.id        = req.service_id
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

-- 4. Offer at the matched pro's OWN rate (never services.base_price), stamped 'own'.
create or replace function public.dispatch_next_offer(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r    public.requests;
  prov uuid;
  px   numeric;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null
     or r.dispatch_mode <> 'instant'
     or r.status <> 'finding'
     or r.awarded_provider_id is not null then
    return;
  end if;

  if exists (select 1 from public.offers o where o.request_id = r.id and o.status = 'pending') then
    return;
  end if;

  prov := public.dispatch_score_and_log(r.id);   -- score + log the pass, get the top eligible
  if prov is null then return; end if;            -- exhausted; leave 'finding'

  -- Price strictly from the matched pro's OWN flat rate for this service's sub-job.
  -- The ranker's 'no_rate' gate guarantees this pro has one; the null-guard is defensive.
  select psr.amount into px
  from public.services sv
  join public.provider_subjob_rates psr
    on psr.member_id    = prov
   and psr.service_slug = sv.service_slug
   and psr.option_slug  = sv.option_slug
   and psr.price_model  = 'flat'
   and psr.active
  where sv.id = r.service_id;

  if px is null then return; end if;  -- no own-rate ⇒ never offer at a platform price

  insert into public.job_grants (request_id, provider_id)
    values (r.id, prov) on conflict (request_id, provider_id) do nothing;

  insert into public.offers (request_id, provider_id, pay, note, status, respond_by, distance_label, rate_source)
    values (r.id, prov, px,
            'your rate · paid on completion', 'pending', now() + interval '45 seconds', 'nearby', 'own');
end $$;
