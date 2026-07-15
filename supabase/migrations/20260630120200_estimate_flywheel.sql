-- =============================================================================
-- Photo-estimate data flywheel — CAPTURE ONLY (not the estimator).
--
-- Guildry photo-estimate-data-flywheel spec. This does NOT build the VLM/estimator.
-- It builds the labeled-example capture so that when the Phase 2 estimator ships,
-- a proprietary `intake -> final scope -> final price` dataset and an accuracy
-- benchmark already exist instead of zero. Same flywheel as ranker_scores and
-- trip_charge_reviews: capture the linkage from job #1.
--
-- Terminal hook: an AFTER UPDATE trigger on requests.status — the single, reliable
-- point a job goes terminal — fires capture_estimate_example(). This is provider-
-- agnostic to WHICH rpc settles the job (mark_paid is redefined in 3 migrations),
-- and it automatically covers spec-1's future 'aborted_trip_charge' transition.
--
-- Naming: request IS the job. Money: integer cents. Snapshot, never live-join (§3):
-- the trigger copies values in at terminal time so later edits to source rows can't
-- rewrite a historical training label.
-- =============================================================================

create type public.estimate_outcome as enum ('completed', 'adjusted', 'aborted');

-- ----------------------------------------------------------------------------
-- estimate_examples — one row per terminal job: the labeled training example.
-- intake_media_refs / proof_media_refs hold DURABLE storage paths (not signed
-- URLs — they must resolve years out, §5). They start empty until intake-photo
-- and before/after-proof capture features land; the columns are ready now so the
-- hook never has to be rebuilt, only enriched.
-- ----------------------------------------------------------------------------
create table public.estimate_examples (
  id                 uuid primary key default gen_random_uuid(),
  request_id         uuid not null references public.requests(id) on delete cascade,
  trade              text,                       -- requests.category (the 8-family key)
  job_type           text,                       -- the standardized service name / request title
  geo_lat            numeric(9,6),               -- local market data is the moat — geo required (§5)
  geo_lng            numeric(9,6),
  intake_media_refs  text[] not null default '{}',  -- snapshot refs to the requester's intake photos
  intake_description text,
  final_scope        text,                       -- request + any approved scope_adjustment
  final_price_cents  int,                        -- the actual bill price (from payments / agreed_price)
  proof_media_refs   text[] not null default '{}',  -- before/after proof photos
  outcome            public.estimate_outcome not null,
  captured_at        timestamptz not null default now(),
  unique (request_id)                            -- exactly one example per terminal job
);
create index estimate_examples_trade_idx on public.estimate_examples (trade);
create index estimate_examples_geo_idx   on public.estimate_examples (geo_lat, geo_lng);

-- ----------------------------------------------------------------------------
-- estimate_predictions — EMPTY until the Phase 2 estimator ships. Wired now so
-- prediction <-> actual is a single join (on request_id) the day the estimator
-- runs its first inference.
--
-- CLASSIFICATION (spec §4): predictions are a requester-facing PLANNING ESTIMATE
-- only — same legal category as the benchmark rate card, informational, NOT a
-- price source. The provider still sets/confirms the real number. If an AI
-- estimate ever became the price, the platform would be price-setting — the exact
-- trap the dispatch spec forbids. This table is data, never a price input.
-- ----------------------------------------------------------------------------
create table public.estimate_predictions (
  id                     uuid primary key default gen_random_uuid(),
  request_id             uuid not null references public.requests(id) on delete cascade,
  model_version          text not null,
  predicted_scope        text,
  predicted_low_cents     int,
  predicted_typical_cents int,
  predicted_high_cents    int,
  confidence             numeric(4,3),
  predicted_at           timestamptz not null default now()
);
create index estimate_predictions_request_idx on public.estimate_predictions (request_id);

-- ----------------------------------------------------------------------------
-- capture_estimate_example — the snapshot. SECURITY DEFINER (bypasses RLS to read
-- source rows + insert the example). Idempotent: unique(request_id) + ON CONFLICT
-- DO NOTHING means a terminal job is logged exactly once, even if the trigger
-- fires more than once. final_price prefers the actual escrow total, falling back
-- to the agreed price.
-- ----------------------------------------------------------------------------
create or replace function public.capture_estimate_example(
  p_request_id uuid,
  p_outcome    public.estimate_outcome
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r          public.requests;
  v_price    int;
  v_scope    text;
  v_job_type text;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then return; end if;

  -- final price: the actual requester all-in if an escrow payment exists, else
  -- the agreed price in cents.
  select total_cents into v_price
    from public.payments
   where request_id = r.id
   order by created_at desc
   limit 1;
  if v_price is null then
    v_price := round(coalesce(r.agreed_price, 0) * 100)::int;
  end if;

  -- final scope: the latest approved replacement/additive scope, else the posting.
  select proposed_scope into v_scope
    from public.scope_adjustments
   where request_id = r.id and status = 'approved'
   order by responded_at desc nulls last, submitted_at desc
   limit 1;
  if v_scope is null then
    v_scope := coalesce(r.title, '') ||
               case when r.description is not null then ' — ' || r.description else '' end;
  end if;

  -- job_type: the standardized service name when present, else the request title.
  select name into v_job_type from public.services where id = r.service_id;
  v_job_type := coalesce(v_job_type, r.title);

  insert into public.estimate_examples
    (request_id, trade, job_type, geo_lat, geo_lng,
     intake_media_refs, intake_description, final_scope, final_price_cents,
     proof_media_refs, outcome)
  values
    (r.id, r.category::text, v_job_type, r.location_lat, r.location_lng,
     '{}', r.description, nullif(v_scope, ''), v_price,
     '{}', p_outcome)
  on conflict (request_id) do nothing;
end $$;

-- ----------------------------------------------------------------------------
-- The terminal hook. Fires once when a request reaches a terminal state, mapping
-- status -> outcome. 'paid' = settled normal/adjusted job; 'aborted_trip_charge'
-- (spec-1, future) = an understated job that became a trip charge — a VALUABLE
-- label (the intake photo understated the real scope), so we capture it too (§5).
-- ----------------------------------------------------------------------------
create or replace function public.estimate_capture_on_terminal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare v_outcome public.estimate_outcome;
begin
  if NEW.status = OLD.status then return NEW; end if;

  if NEW.status = 'paid' then
    -- adjusted if an approved scope change exists on this job, else a clean completion.
    if exists (
      select 1 from public.scope_adjustments
       where request_id = NEW.id and status = 'approved'
    ) then
      v_outcome := 'adjusted';
    else
      v_outcome := 'completed';
    end if;
  elsif NEW.status = 'aborted_trip_charge' then
    v_outcome := 'aborted';
  else
    return NEW;  -- non-terminal transition
  end if;

  perform public.capture_estimate_example(NEW.id, v_outcome);
  return NEW;
end $$;

create trigger requests_capture_estimate_after_update
  after update of status on public.requests
  for each row execute function public.estimate_capture_on_terminal();

-- ----------------------------------------------------------------------------
-- RLS — read posture. Examples are tenant/member-scoped (party or admin); a
-- future training job reads them via an explicit, audited service path, NOT by
-- loosening RLS (§5). Predictions are internal model output → admin only.
-- Writes are definer-only (trigger / estimator); no INSERT grant or policy.
-- ----------------------------------------------------------------------------
alter table public.estimate_examples    enable row level security;
alter table public.estimate_predictions enable row level security;

revoke all on public.estimate_examples, public.estimate_predictions from anon;
grant select on public.estimate_examples    to authenticated;
grant select on public.estimate_predictions to authenticated;

create policy estimate_examples_select_party on public.estimate_examples
  for select using (public.member_is_party(request_id) or public.current_member_is_admin());

create policy estimate_predictions_select_admin on public.estimate_predictions
  for select using (public.current_member_is_admin());

-- ----------------------------------------------------------------------------
-- Internal views (§8 step 3-4). security_invoker = true so the caller's RLS still
-- applies — these are convenience shapes, not a privilege escalation.
-- ----------------------------------------------------------------------------

-- Prediction <-> actual: the accuracy benchmark, ready the estimator's first run.
create view public.estimate_accuracy with (security_invoker = true) as
  select e.request_id,
         e.trade, e.job_type, e.geo_lat, e.geo_lng,
         e.final_price_cents,
         p.model_version,
         p.predicted_low_cents, p.predicted_typical_cents, p.predicted_high_cents,
         p.confidence,
         (e.final_price_cents - p.predicted_typical_cents) as error_cents,
         e.outcome, e.captured_at, p.predicted_at
    from public.estimate_examples e
    left join public.estimate_predictions p on p.request_id = e.request_id;

-- Watch the dataset grow: labeled-example counts by trade.
create view public.labeled_examples_by_trade with (security_invoker = true) as
  select trade,
         count(*)                                        as n_examples,
         count(*) filter (where outcome = 'completed')   as n_completed,
         count(*) filter (where outcome = 'adjusted')    as n_adjusted,
         count(*) filter (where outcome = 'aborted')     as n_aborted
    from public.estimate_examples
   group by trade;

grant select on public.estimate_accuracy, public.labeled_examples_by_trade to authenticated;
