-- =============================================================================
-- Trip charge — fast-track auto-clear (§4/§8 step 5) + enforcement ladder
-- (§5/§8 step 6). The deferred tails of the scope-adjustment spec.
--
-- FAST-TRACK (step 5): a clean abort — good arrival proof + evidence photos +
-- a provider with a clean history — auto-clears toward near-instant release
-- instead of waiting on a human. Config-gated (trip_charge_config.fast_track_
-- enabled) and OFF by default: the §8-step-4 human gate stays the safe default
-- until there's volume to trust the auto-clear. Ambiguous/flagged cases always
-- fall through to a human.
--
-- ENFORCEMENT LADDER (step 6): graduated, never insta-ban —
--   flag → warning → dispatch suspension → removal — driven by a VIOLATION COUNT
-- so a single legitimate understatement can't sink a provider. Monitors BOTH
-- sides (providers: failed trip-charge reviews; requesters: serial declines past
-- a threshold). A suspended/removed member is gated out of the ranker, making the
-- ladder consequential. Each rung is an enforcement_events row with its evidence.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Config (the §10 confirm-knobs): fast-track toggle + the requester serial-
-- decline threshold below which declining is simply free (never punished).
-- ----------------------------------------------------------------------------
create table public.trip_charge_config (
  id                       int primary key default 1 check (id = 1),
  fast_track_enabled       boolean not null default false,
  serial_decline_threshold int     not null default 5
);
insert into public.trip_charge_config (id) values (1) on conflict (id) do nothing;

alter table public.trip_charge_config enable row level security;
revoke all on public.trip_charge_config from anon;
grant select on public.trip_charge_config to authenticated;
create policy trip_charge_config_select_all on public.trip_charge_config for select using (true);

-- ----------------------------------------------------------------------------
-- The ladder mapping: a violation count → its rung. Graduated and monotonic.
-- ----------------------------------------------------------------------------
create or replace function public.enforcement_action_for_count(p_count int)
returns public.enforcement_action
language sql
immutable
as $$
  select (case
            when p_count <= 1 then 'flag'
            when p_count  = 2 then 'warning'
            when p_count  = 3 then 'suspension'
            else 'removal'
          end)::public.enforcement_action
$$;

-- Record the rung for a member's current violation count (SECURITY DEFINER: the
-- enforcement log has no client write path).
create or replace function public.record_enforcement(
  p_member_id       uuid,
  p_role            public.review_role,
  p_signal          text,
  p_evidence_ref    text,
  p_notes           text,
  p_violation_count int
)
returns public.enforcement_action
language plpgsql
security definer
set search_path = public
as $$
declare v_action public.enforcement_action;
begin
  v_action := public.enforcement_action_for_count(p_violation_count);
  insert into public.enforcement_events (member_id, role, signal, action, evidence_ref, notes)
    values (p_member_id, p_role, p_signal, v_action, p_evidence_ref, p_notes);
  return v_action;
end $$;

-- Requester side: escalate ONLY once declines pass the threshold — below it,
-- declining is genuinely free (classification-critical, §0/§4.2).
create or replace function public.evaluate_requester_enforcement(p_requester_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_threshold int; v_declines int;
begin
  select serial_decline_threshold into v_threshold from public.trip_charge_config where id = 1;
  select count(*) into v_declines
    from public.scope_adjustments sa
    join public.requests rq on rq.id = sa.request_id
   where rq.requester_id = p_requester_id and sa.status = 'declined';
  if v_declines >= v_threshold then
    perform public.record_enforcement(
      p_requester_id, 'requester', 'serial_decliner', null,
      'declines=' || v_declines, v_declines - v_threshold + 1);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Shared capture — the "trip charge passes" money move, used by both a human
-- PASS and a fast-track auto-clear. Writes the review row, releases the charge,
-- credits the provider, records the payout, notifies.
-- ----------------------------------------------------------------------------
create or replace function public._capture_trip_charge(
  p_trip_charge_id uuid,
  p_reviewer_id    uuid,          -- null for fast-track
  p_fast_tracked   boolean,
  p_checklist_json jsonb,
  p_notes          text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare tc public.trip_charges;
begin
  select * into tc from public.trip_charges where id = p_trip_charge_id;

  insert into public.trip_charge_reviews
    (trip_charge_id, reviewer_id, checklist_json, decision, fast_tracked, notes)
  values
    (p_trip_charge_id, p_reviewer_id, coalesce(p_checklist_json, '{}'::jsonb), 'pass', p_fast_tracked, p_notes);

  update public.trip_charges set status = 'released', resolved_at = now() where id = tc.id;

  insert into public.provider_wallets (member_id, available_to_cashout)
    values (tc.provider_id, tc.amount_cents / 100.0)
    on conflict (member_id) do update
      set available_to_cashout = public.provider_wallets.available_to_cashout + excluded.available_to_cashout;
  insert into public.payouts (request_id, provider_id, job_label, amount, status, paid_at)
    values (tc.request_id, tc.provider_id, 'Trip charge', tc.amount_cents / 100.0, 'paid', now());

  perform public.create_notification(
    tc.provider_id, 'trip_charge_paid', 'Trip charge approved',
    case when p_fast_tracked then 'Auto-cleared and paid' else 'Passed review and paid' end,
    tc.request_id);
end $$;

-- ----------------------------------------------------------------------------
-- Fast-track: auto-clear a clean abort. Returns true when it cleared. Clean =
-- arrival proof present + no prior warning/suspension/removal + no failed review.
-- ----------------------------------------------------------------------------
create or replace function public.try_fast_track(p_trip_charge_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  tc        public.trip_charges;
  v_enabled boolean;
  v_clean   boolean;
begin
  select fast_track_enabled into v_enabled from public.trip_charge_config where id = 1;
  if not coalesce(v_enabled, false) then return false; end if;

  select * into tc from public.trip_charges where id = p_trip_charge_id;
  if tc.id is null or tc.status <> 'under_review' then return false; end if;

  -- arrival proof is mandatory (§2, §9) — never fast-track a drive-by.
  if not exists (select 1 from public.arrival_checkins
                 where request_id = tc.request_id and provider_id = tc.provider_id) then
    return false;
  end if;

  v_clean :=
        not exists (select 1 from public.enforcement_events
                    where member_id = tc.provider_id and action in ('warning','suspension','removal'))
    and not exists (select 1 from public.trip_charge_reviews r
                    join public.trip_charges t on t.id = r.trip_charge_id
                    where t.provider_id = tc.provider_id and r.decision = 'fail');
  if not v_clean then return false; end if;

  perform public._capture_trip_charge(
    p_trip_charge_id, null, true, '{"fast_track":true}'::jsonb,
    'auto-cleared: arrival proof + clean history');
  return true;
end $$;

-- ----------------------------------------------------------------------------
-- Redefine review_trip_charge: PASS routes through the shared capture; FAIL voids
-- and escalates the ladder by the provider's failed-review count (1st→flag, …).
-- ----------------------------------------------------------------------------
create or replace function public.review_trip_charge(
  p_trip_charge_id uuid,
  p_decision       public.trip_charge_decision,
  p_checklist_json jsonb   default '{}'::jsonb,
  p_fast_tracked   boolean default false,
  p_notes          text    default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me           uuid := public.current_member_id();
  tc           public.trip_charges;
  v_fail_count int;
begin
  if not public.current_member_is_admin() then raise exception 'admin only'; end if;

  select * into tc from public.trip_charges where id = p_trip_charge_id;
  if tc.id is null then raise exception 'trip charge not found'; end if;
  if tc.status <> 'under_review' then raise exception 'trip charge is % , not under_review', tc.status; end if;

  if not exists (select 1 from public.arrival_checkins
                 where request_id = tc.request_id and provider_id = tc.provider_id) then
    raise exception 'no arrival proof — trip charge cannot be released';
  end if;

  if p_decision = 'pass' then
    perform public._capture_trip_charge(p_trip_charge_id, me, p_fast_tracked, p_checklist_json, p_notes);
  else
    insert into public.trip_charge_reviews
      (trip_charge_id, reviewer_id, checklist_json, decision, fast_tracked, notes)
    values
      (p_trip_charge_id, me, coalesce(p_checklist_json, '{}'::jsonb), 'fail', p_fast_tracked, p_notes);
    update public.trip_charges set status = 'voided', resolved_at = now() where id = tc.id;

    -- graduated enforcement (§5): rung follows the provider's failed-review count.
    select count(*) into v_fail_count
      from public.trip_charge_reviews r
      join public.trip_charges t on t.id = r.trip_charge_id
     where t.provider_id = tc.provider_id and r.decision = 'fail';
    perform public.record_enforcement(
      tc.provider_id, 'provider', 'trip_charge_review_failed',
      tc.request_id::text, p_notes, v_fail_count);

    perform public.create_notification(
      tc.provider_id, 'trip_charge_voided', 'Trip charge not approved',
      'Your trip charge did not pass review', tc.request_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Redefine _abort_to_trip_charge to attempt fast-track after routing to review.
-- (Body identical to 20260630120300 plus the closing try_fast_track call.)
-- ----------------------------------------------------------------------------
create or replace function public._abort_to_trip_charge(
  p_request_id  uuid,
  p_provider_id uuid,
  p_amount_cents int default null,
  p_fee_cents    int default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_tc public.trip_charges;
begin
  select * into v_tc from public.trip_charges where request_id = p_request_id;
  if v_tc.id is null then
    if p_amount_cents is null then
      raise exception 'a trip-charge amount is required to abort';
    end if;
    insert into public.trip_charges
      (request_id, provider_id, amount_cents, service_fee_cents, status, credited_to_job)
    values
      (p_request_id, p_provider_id, p_amount_cents, coalesce(p_fee_cents, 0), 'under_review', false)
    returning * into v_tc;
  else
    update public.trip_charges
       set status = 'under_review', credited_to_job = false
     where id = v_tc.id;
  end if;

  update public.payments set status = 'refunded'
   where request_id = p_request_id and status = 'held';

  update public.requests set status = 'aborted_trip_charge' where id = p_request_id;

  -- clean cases auto-clear (§8 step 5); when disabled/ineligible this is a no-op
  -- and the charge waits for a human (§8 step 4).
  perform public.try_fast_track(v_tc.id);
end $$;

-- ----------------------------------------------------------------------------
-- Redefine respond_scope_adjustment to evaluate requester enforcement on decline.
-- (Body identical to 20260630120300 plus the evaluate call in the decline branch.)
-- ----------------------------------------------------------------------------
create or replace function public.respond_scope_adjustment(
  p_adjustment_id uuid,
  p_approve       boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  a public.scope_adjustments;
  r public.requests;
begin
  select * into a from public.scope_adjustments where id = p_adjustment_id;
  if a.id is null then raise exception 'adjustment not found'; end if;
  if not public.member_owns_request(a.request_id) then
    raise exception 'not authorized to respond to this adjustment';
  end if;
  if a.status <> 'submitted' then raise exception 'adjustment already %', a.status; end if;
  select * into r from public.requests where id = a.request_id;

  if p_approve then
    update public.scope_adjustments set status = 'approved', responded_at = now() where id = a.id;
    if a.kind = 'replacement' then
      update public.requests
         set status = 'enroute', agreed_price = a.proposed_amount_cents / 100.0
       where id = r.id;
      update public.trip_charges
         set status = 'released', credited_to_job = true, resolved_at = now()
       where request_id = r.id and status = 'authorized';
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_approved', 'Scope change approved',
        'The client approved the re-quote — proceed', r.id);
    else
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_approved', 'Additional work approved',
        'The client approved the extra work', r.id);
    end if;
  else
    update public.scope_adjustments set status = 'declined', responded_at = now() where id = a.id;
    if a.kind = 'additive' then
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_declined', 'Extra work declined',
        'The client declined the extra work — the original job continues', r.id);
    else
      perform public._abort_to_trip_charge(r.id, r.awarded_provider_id);
      perform public.create_notification(
        r.awarded_provider_id, 'aborted', 'Job declined',
        'The client declined the re-quote — your trip charge is under review', r.id);
    end if;
    -- both sides monitored (§5): a serial decliner past the threshold escalates.
    perform public.evaluate_requester_enforcement(r.requester_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Redefine rank_providers to gate suspended / removed members (making the ladder
-- consequential). (Body identical to 20260701090000 plus the two gate branches.)
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
