-- =============================================================================
-- Ranker v1 — cold-start exploration term (spec §4.1, build step 5).
--
-- The score alone buries a freshly-vetted provider who has no R/C/S history, so
-- they never get a first job and churn. Two protections, both already partly in
-- place + completed here:
--   * Prior, not zero — the Bayesian prior (§3) + reliability/responsiveness
--     defaults already give new providers a non-zero starting score (shipped in
--     20260701090000_ranker_v1.sql).
--   * Exploration term (THIS migration) — with small probability ε (config
--     exploration_epsilon, ~0.10) route the offer to an under-sampled ELIGIBLE
--     provider instead of the top-ranked one, to gather data on them. Logged with
--     exploration = true so these rows are distinguishable in analysis (a light
--     epsilon-greedy / multi-armed-bandit posture).
--
-- Determinism: production rolls random(); a p_force_roll argument lets tests pin
-- the roll. Tests that assert exact ranking set exploration_epsilon = 0.
-- =============================================================================

-- Replace the 1-arg logger with a version that can explore. dispatch_next_offer's
-- call dispatch_score_and_log(r.id) still resolves here via the default arg.
drop function if exists public.dispatch_score_and_log(uuid);

create or replace function public.dispatch_score_and_log(
  p_request_id uuid,
  p_force_roll numeric default null   -- test hook: null → random()
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_eps     numeric;
  v_roll    numeric;
  v_top     uuid;
  v_explore uuid;
  v_chosen  uuid;
  v_is_expl boolean := false;
begin
  select exploration_epsilon into v_eps from public.ranker_config where id = 1;

  select provider_id into v_top
  from public.rank_providers(p_request_id)
  where rank_position = 1;

  v_roll := coalesce(p_force_roll, random());

  -- explore only when the dice say so AND there is a DIFFERENT eligible provider
  -- to explore toward. "Under-sampled" = fewest offers seen so far, then newest.
  if v_top is not null and v_roll < v_eps then
    select rp.provider_id into v_explore
    from public.rank_providers(p_request_id) rp
    join public.provider_profiles pp on pp.member_id = rp.provider_id
    where rp.eligible and rp.provider_id <> v_top
    order by (select count(*) from public.offers o where o.provider_id = rp.provider_id) asc,
             pp.created_at desc,
             md5(rp.provider_id::text)
    limit 1;
  end if;

  if v_explore is not null then
    v_chosen := v_explore;
    v_is_expl := true;
  else
    v_chosen := v_top;
  end if;

  -- log the whole pass; only the actually-offered exploration pick is flagged.
  insert into public.ranker_scores
    (request_id, provider_id, score, factors_json, eligible, gate_reason, exploration, rank_position)
  select p_request_id, provider_id, score, factors, eligible, gate_reason,
         (provider_id = v_chosen and v_is_expl), rank_position
  from public.rank_providers(p_request_id);

  return v_chosen;
end $$;

grant execute on function public.dispatch_score_and_log(uuid, numeric) to authenticated;
