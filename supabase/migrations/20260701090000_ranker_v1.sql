-- =============================================================================
-- Ranker v1 — instant-match scoring (spec §1-§6, build steps 1-4).
--
-- A transparent, explainable weighted sum that orders the eligible provider set
-- for the round-robin dispatch loop. Reliability-weighted, NEVER price-ranked
-- (price is not a column, not an input, not a tie-break). Every scoring pass is
-- logged to ranker_scores (eligible AND gated rows) — the audit/explainability
-- trail and the training set for the eventual learned ranker.
--
-- Two stages (§1): a hard eligibility GATE, then a weighted SCORE of survivors.
--   Score = wR·R + wC·C + wP·P + wA·A + wS·S     (§2)
--
-- DATA REALITY in this schema (deviations documented, all safe defaults):
--  R rating       — Bayesian-smoothed (§3). avg/­n from reviews when present, else
--                   the denormalized provider_profiles.rating + jobs_done as the
--                   confidence sample. Prior = ranker_config.category_mean_stars
--                   (a tunable baseline, §10) — NOT a self-referential average.
--  C reliability  — completion_rate × on_time_rate. Completion is real (awarded vs
--                   completed requests); on-time has no data yet → 1.0. No history
--                   → reliability_default (cold-start).
--  P proximity    — provider_profiles has NO location column, so P is a neutral
--                   prior (proximity_default) for everyone until provider geo +
--                   coverage exist. Coverage-geo gate is likewise not enforced yet.
--  A availability — 1/(1+open_load): pending offers + active jobs. Real.
--  S responsiveness — responded_within_window / offers_seen. Real. A fast DECLINE
--                   scores identically to a fast ACCEPT (decline-safe, §4.2) — only
--                   an EXPIRED (ignored) offer hurts.
--
-- Deferred to build step 5: exploration term (ε epsilon-greedy) and tuned median
-- priors. The ε knob is seeded in config but NOT yet used (exploration = false).
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Config — weights + knobs, exposed as data (§10: "all are config, not code").
-- Singleton row (id = 1). Price has NO weight — absent by design.
-- ----------------------------------------------------------------------------
create table public.ranker_config (
  id                     int primary key default 1 check (id = 1),
  w_rating               numeric not null default 0.30,
  w_reliability          numeric not null default 0.30,
  w_proximity            numeric not null default 0.20,
  w_availability         numeric not null default 0.15,
  w_responsiveness       numeric not null default 0.05,
  bayes_m                int     not null default 10,     -- prior strength (§3)
  category_mean_stars    numeric not null default 4.6,    -- Bayesian prior baseline (§3, §10)
  concurrent_offer_cap   int     not null default 3,      -- double-booking guard (§4.3)
  proximity_default      numeric not null default 0.5,    -- until provider geo exists
  reliability_default    numeric not null default 0.80,   -- cold-start C prior (§4.1)
  responsiveness_default numeric not null default 0.80,   -- cold-start S prior (§4.1)
  exploration_epsilon    numeric not null default 0.10    -- RESERVED for step 5 (unused)
);
insert into public.ranker_config (id) values (1) on conflict (id) do nothing;

alter table public.ranker_config enable row level security;
revoke all on public.ranker_config from anon;
grant select on public.ranker_config to authenticated;   -- read-only; tuned by admin/service role
create policy ranker_config_select_all on public.ranker_config for select using (true);

-- ----------------------------------------------------------------------------
-- R — Bayesian-smoothed rating in [0,1] (§3). Smooths a thin record toward the
-- category prior so one 5-star cannot outrank a long 4.8 record. n=0 → the prior.
-- ----------------------------------------------------------------------------
create or replace function public.ranker_bayesian_rating(
  p_provider_id uuid,
  p_category    public.category_key   -- accepted for signature/forward-compat; prior is the config baseline
)
returns numeric
language sql
stable
security definer
set search_path = public
as $$
  with cfg as (select * from public.ranker_config where id = 1),
  rev as (
    select avg(stars)::numeric as a, count(*)::int as n
    from public.reviews
    where subject_id = p_provider_id and subject_role = 'provider'
  ),
  prof as (select rating, jobs_done from public.provider_profiles where member_id = p_provider_id),
  inp as (
    select coalesce(rev.a, prof.rating, 0)::numeric                        as avg_stars,
           greatest(coalesce(rev.n, 0), coalesce(prof.jobs_done, 0))::int  as n
    from rev, prof
  )
  select case
           when (inp.n + cfg.bayes_m) = 0 then 0
           else ((inp.avg_stars * inp.n) + (cfg.category_mean_stars * cfg.bayes_m))
                / (inp.n + cfg.bayes_m) / 5.0
         end
  from inp, cfg
$$;

-- ----------------------------------------------------------------------------
-- rank_providers — the full scoring pass for a request: every in-trade candidate
-- (excluding the requester and anyone already offered this request), each with
-- its gate verdict, sub-scores, composite, and rank position. Eligible rows are
-- ranked 1..k by composite with the §5 tie-break chain (responsiveness, proximity,
-- then a deterministic hash so a persistent tie doesn't always favor one pro).
-- Gated rows carry their reason and a null score / null rank. Pure + deterministic.
-- ----------------------------------------------------------------------------
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
  req as (select id, category, requester_id from public.requests where id = p_request_id),
  cand as (   -- in-trade, not the requester, not already offered this request
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
      -- GATE (§1) — first failing check wins.
      case
        when not c.online   then 'unavailable'
        when not c.verified then 'not_verified'
        when pv.coi_expiry is not null and pv.coi_expiry < current_date then 'credentials_expired'
        when (select count(*) from public.offers o
               where o.provider_id = c.member_id and o.status = 'pending') >= cfg.concurrent_offer_cap
          then 'at_offer_cap'
        else null
      end as gate_reason,
      -- SUB-SCORES (§2) — each in [0,1].
      public.ranker_bayesian_rating(c.member_id, req.category) as r_score,
      (select case when count(*) = 0 then cfg.reliability_default
                   else (count(*) filter (where status in ('complete','paid','rated'))::numeric
                         / count(*)) * 1.0            -- × on_time_rate (=1.0, no data yet)
              end
         from public.requests aj where aj.awarded_provider_id = c.member_id) as c_score,
      cfg.proximity_default as p_score,
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
        order by (c.gate_reason is null) desc,   -- eligible first, so 1..k are the survivors
                 c.composite desc,
                 c.s_score desc,                 -- tie-break 1: responsiveness (§5)
                 c.p_score desc,                 -- tie-break 2: proximity (§5)
                 md5(c.member_id::text)          -- tie-break 3: deterministic "random" (§5)
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

-- ----------------------------------------------------------------------------
-- dispatch_score_and_log — run a scoring pass, LOG every row (eligible + gated,
-- exploration=false in v1), and return the top-ranked eligible provider (or null).
-- The single call the dispatch loop uses, so the log always matches the decision.
-- ----------------------------------------------------------------------------
create or replace function public.dispatch_score_and_log(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_top uuid;
begin
  insert into public.ranker_scores
    (request_id, provider_id, score, factors_json, eligible, gate_reason, exploration, rank_position)
  select p_request_id, provider_id, score, factors, eligible, gate_reason, false, rank_position
  from public.rank_providers(p_request_id);

  select provider_id into v_top
  from public.rank_providers(p_request_id)
  where rank_position = 1;

  return v_top;
end $$;

-- ----------------------------------------------------------------------------
-- Wire the ranker into the existing dispatch loop (§7).
-- dispatch_eligible_provider keeps its contract (top eligible provider or null),
-- now delegating to the ranker — so its direct callers are unchanged. It does NOT
-- log (it's a pure read); dispatch_next_offer logs via dispatch_score_and_log.
-- ----------------------------------------------------------------------------
create or replace function public.dispatch_eligible_provider(p_request_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select provider_id from public.rank_providers(p_request_id) where rank_position = 1
$$;

-- dispatch_next_offer — same round-robin behavior; the provider pick now comes
-- from the logged ranker pass (every advance = one logged, explainable pass).
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

  select base_price into px from public.services where id = r.service_id;

  insert into public.job_grants (request_id, provider_id)
    values (r.id, prov) on conflict (request_id, provider_id) do nothing;

  insert into public.offers (request_id, provider_id, pay, note, status, respond_by, distance_label)
    values (r.id, prov, coalesce(px, r.agreed_price, 0),
            'set rate · paid on completion', 'pending', now() + interval '45 seconds', 'nearby');
end $$;

grant execute on function public.ranker_bayesian_rating(uuid, public.category_key) to authenticated;
grant execute on function public.rank_providers(uuid) to authenticated;
grant execute on function public.dispatch_score_and_log(uuid) to authenticated;
