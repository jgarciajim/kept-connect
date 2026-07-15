-- =============================================================================
-- Ranker v1 — score logging (the training set + the explainability trail).
--
-- Guildry ranker-v1 spec §6. The v1 ranker is a transparent weighted sum; the
-- moat is the data it logs, not the formula. Write ONE row per (request, provider)
-- per scoring pass — INCLUDING gated/ineligible candidates, with the gate reason —
-- so "why didn't provider X get offered" is answerable for both providers and
-- counsel, and so the learned ranker has training data from day one.
--
-- NOTE on naming: a request IS the job here (no jobs table — marketplace §). The
-- spec's `job_id` is `request_id` throughout. Money is not involved (price is never
-- a ranker input, by design), so there are no cents columns.
--
-- Posture matches payments/verification: no direct INSERT grant — rows are written
-- only through the SECURITY DEFINER log_ranker_score() helper the dispatch loop
-- calls. Reads are party-scoped (a requester sees passes on their request) or admin.
-- =============================================================================

create table public.ranker_scores (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.requests(id) on delete cascade,
  provider_id   uuid not null references public.members(id)  on delete cascade,
  score         numeric(6,4),            -- composite [0,1]; null when gated out (no score computed)
  factors_json  jsonb not null default '{}'::jsonb,
                                         -- { R, C, P, A, S, weights:{wR..wS}, bayes_m }
  eligible      boolean not null,        -- false rows are kept too: they record WHY filtered
  gate_reason   text,                    -- null when eligible; e.g. 'credentials_expired','outside_geo','at_offer_cap','unavailable'
  exploration   boolean not null default false,  -- §4.1 — was this an epsilon-greedy exploration offer
  rank_position int,                     -- where they landed this pass (null for gated rows)
  created_at    timestamptz not null default now()
);
create index ranker_scores_request_idx  on public.ranker_scores (request_id, created_at);
create index ranker_scores_provider_idx on public.ranker_scores (provider_id, created_at);

alter table public.ranker_scores enable row level security;
revoke all on public.ranker_scores from anon;
grant select on public.ranker_scores to authenticated;  -- read own/party/admin; written via RPC only

-- A requester sees the scoring passes on their own request; the scored provider
-- sees their own rows; admins (and the dispatch engine, as definer) see all.
create policy ranker_scores_select_party on public.ranker_scores
  for select using (
    provider_id = public.current_member_id()
    or public.member_owns_request(request_id)
    or public.current_member_is_admin()
  );

-- ----------------------------------------------------------------------------
-- log_ranker_score — the only write path. SECURITY DEFINER so the dispatch loop
-- can record a pass (eligible or gated) without a client INSERT privilege, while
-- the table stays append-only from the app's perspective.
-- ----------------------------------------------------------------------------
create or replace function public.log_ranker_score(
  p_request_id    uuid,
  p_provider_id   uuid,
  p_score         numeric,
  p_factors_json  jsonb,
  p_eligible      boolean,
  p_gate_reason   text,
  p_exploration   boolean,
  p_rank_position int
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  insert into public.ranker_scores
    (request_id, provider_id, score, factors_json, eligible, gate_reason, exploration, rank_position)
  values
    (p_request_id, p_provider_id, p_score, coalesce(p_factors_json, '{}'::jsonb),
     p_eligible, p_gate_reason, coalesce(p_exploration, false), p_rank_position)
  returning id into v_id;
  return v_id;
end $$;

grant execute on function
  public.log_ranker_score(uuid, uuid, numeric, jsonb, boolean, text, boolean, int)
  to authenticated;
