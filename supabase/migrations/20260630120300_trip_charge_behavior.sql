-- =============================================================================
-- Scope adjustment / trip charge / human review — BEHAVIOR (spec §8 steps 1-4).
--
-- Builds the on-site change-order flow as SECURITY DEFINER RPCs over the data
-- model in 20260630120100_trip_charge_model.sql. Step 5 (fast-track auto-clear)
-- and step 6 (abuse signals) are deferred per the build-batch README.
--
-- MONEY MODEL — authorize-then-capture, mock adapter (matches public.payments'
-- "real ledger, mocked charge" posture). The existing payment_status enum already
-- carries the semantics: held = AUTHORIZED (money reserved, not captured),
-- released = CAPTURED, refunded = VOIDED. So on abort we VOID the job-estimate
-- authorization (no refund flow, no clawback), and the trip charge waits as an
-- authorization until a human review PASSES (§4). Nothing captures from the client
-- until then — exactly the client-protection property the spec requires.
--
-- DEVIATION (documented): the spec authorizes the trip charge AT BOOKING (§3). The
-- current booking flow (award_quote_paid) does not, so this layer authorizes the
-- provider's disclosed trip charge at scope-adjustment-submit / abort time — the
-- earliest point it becomes relevant in today's architecture. Folding the trip-
-- charge hold into booking is a follow-up once Stripe Connect authorize-then-
-- capture replaces the mock adapter. The benchmark cap on the trip charge (§0,
-- §10) is a confirm-item knob and is not enforced numerically here.
--
-- request IS the job; money in integer cents.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- STEP 1 — arrival check-in. The evidence spine: geo + timestamp + assessment
-- photos, all required (§2). A provider cannot adjust or collect a trip charge
-- without having demonstrably shown up.
-- ----------------------------------------------------------------------------
create or replace function public.arrival_check_in(
  p_request_id uuid,
  p_geo_lat    numeric,
  p_geo_lng    numeric,
  p_photos     text[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me  uuid := public.current_member_id();
  r   public.requests;
  v_id uuid;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.awarded_provider_id <> me then raise exception 'not your job'; end if;
  if r.status not in ('awarded','enroute') then
    raise exception 'cannot check in for a job in status %', r.status;
  end if;
  if p_photos is null or cardinality(p_photos) = 0 then
    raise exception 'assessment photos are required at check-in';
  end if;

  insert into public.arrival_checkins (request_id, provider_id, geo_lat, geo_lng, assessment_photos)
    values (r.id, me, p_geo_lat, p_geo_lng, p_photos)
    on conflict (request_id, provider_id) do update
      set geo_lat = excluded.geo_lat, geo_lng = excluded.geo_lng,
          assessment_photos = excluded.assessment_photos, checked_in_at = now()
    returning id into v_id;

  update public.requests set status = 'awaiting_assessment' where id = r.id;

  perform public.create_notification(
    r.requester_id, 'arrived', 'Your pro arrived',
    'Your pro checked in and is assessing the job', r.id);
  return v_id;
end $$;

-- ----------------------------------------------------------------------------
-- STEP 2 — the state machine.
-- assess_matches: the job is as posted → proceed on the normal loop.
-- ----------------------------------------------------------------------------
create or replace function public.assess_matches(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_req uuid;
begin
  update public.requests set status = 'enroute'
   where id = p_request_id
     and awarded_provider_id = public.current_member_id()
     and status = 'awaiting_assessment'
   returning requester_id into v_req;
  if v_req is null then raise exception 'cannot proceed — not in assessment for your job'; end if;
  perform public.create_notification(v_req, 'assessment_ok', 'Job matches',
    'Your pro confirmed the job and is proceeding', p_request_id);
end $$;

-- submit_scope_adjustment: additive (original proceeds; a separate line) or
-- replacement (re-quote; job pauses for the client's decision). The proposed
-- amount is the PROVIDER'S OWN rate (rate_source CHECK enforces it). For a
-- replacement, the provider's disclosed trip charge is authorized now (held).
create or replace function public.submit_scope_adjustment(
  p_request_id           uuid,
  p_kind                 public.scope_adjustment_kind,
  p_original_scope_ref   text,
  p_proposed_scope       text,
  p_proposed_amount_cents int,
  p_evidence_photos      text[],
  p_trip_charge_cents     int default null,   -- provider's disclosed trip charge (replacement only)
  p_trip_charge_fee_cents int default 0
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me   uuid := public.current_member_id();
  r    public.requests;
  v_id uuid;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.awarded_provider_id <> me then raise exception 'not your job'; end if;
  if r.status not in ('awaiting_assessment','enroute') then
    raise exception 'not in assessment for status %', r.status;
  end if;
  if p_evidence_photos is null or cardinality(p_evidence_photos) = 0 then
    raise exception 'evidence photos are required for an adjustment';
  end if;
  if not exists (select 1 from public.arrival_checkins
                 where request_id = r.id and provider_id = me) then
    raise exception 'arrival check-in required before an adjustment';
  end if;

  insert into public.scope_adjustments
    (request_id, provider_id, kind, original_scope_ref, proposed_scope,
     proposed_amount_cents, evidence_photos, status)
  values
    (r.id, me, p_kind, p_original_scope_ref, p_proposed_scope,
     p_proposed_amount_cents, p_evidence_photos, 'submitted')
  returning id into v_id;

  if p_kind = 'replacement' then
    -- the original posting is wrong; pause for the client to approve/decline.
    update public.requests set status = 'adjustment_pending' where id = r.id;
    -- authorize (hold) the provider's disclosed trip charge — uncaptured.
    if p_trip_charge_cents is not null then
      insert into public.trip_charges
        (request_id, provider_id, amount_cents, service_fee_cents, status, credited_to_job)
      values
        (r.id, me, p_trip_charge_cents, coalesce(p_trip_charge_fee_cents, 0), 'authorized', false)
      on conflict (request_id) do nothing;
    end if;
    perform public.create_notification(
      r.requester_id, 'adjustment', 'Scope change proposed',
      'Your pro found the job differs from the posting — review the re-quote', r.id);
  else
    -- additive: the booked work still stands; keep it moving. The surprise is a
    -- separate approve/decline line; declining it does NOT abort or trip-charge.
    update public.requests set status = 'enroute'
      where id = r.id and status = 'awaiting_assessment';
    perform public.create_notification(
      r.requester_id, 'adjustment', 'Additional work found',
      'Your pro found extra work — approve or decline it separately', r.id);
  end if;
  return v_id;
end $$;

-- ----------------------------------------------------------------------------
-- Internal — route an aborted job to the trip-charge review path. Ensures a trip
-- charge exists (authorized), moves it to under_review, VOIDS the uncaptured
-- job-estimate authorization, and marks the request aborted (which fires the
-- estimate_examples capture trigger with outcome 'aborted'). NOT granted to
-- clients — reachable only through the definer RPCs below.
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

  -- release (VOID) the uncaptured job-estimate authorization — no capture, no
  -- refund flow. The client is never charged for the aborted job estimate.
  update public.payments set status = 'refunded'
   where request_id = p_request_id and status = 'held';

  update public.requests set status = 'aborted_trip_charge' where id = p_request_id;
end $$;

-- respond_scope_adjustment: the client's free approve/decline.
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
      -- continue at the new AGREED (provider's own) price; escrow top-up to the
      -- new amount is computed app-side (lib/pricing) like award_quote_paid.
      update public.requests
         set status = 'enroute', agreed_price = a.proposed_amount_cents / 100.0
       where id = r.id;
      -- trip charge is CREDITED toward the job, not charged on top (§3).
      update public.trip_charges
         set status = 'released', credited_to_job = true, resolved_at = now()
       where request_id = r.id and status = 'authorized';
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_approved', 'Scope change approved',
        'The client approved the re-quote — proceed', r.id);
    else
      -- additive approved: added to the job (escrow tops up app-side); proceed.
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_approved', 'Additional work approved',
        'The client approved the extra work', r.id);
    end if;
  else
    update public.scope_adjustments set status = 'declined', responded_at = now() where id = a.id;
    if a.kind = 'additive' then
      -- the booked work happened → original job continues. NO abort, NO trip charge.
      perform public.create_notification(
        r.awarded_provider_id, 'adjustment_declined', 'Extra work declined',
        'The client declined the extra work — the original job continues', r.id);
    else
      -- replacement declined → ABORT → trip-charge review path (§3).
      perform public._abort_to_trip_charge(r.id, r.awarded_provider_id);
      perform public.create_notification(
        r.awarded_provider_id, 'aborted', 'Job declined',
        'The client declined the re-quote — your trip charge is under review', r.id);
    end if;
  end if;
end $$;

-- abort_no_work: provider-initiated abort when the replacement leaves no real
-- work to do (§1 "no real work left"). Same review path as a declined replacement.
create or replace function public.abort_no_work(
  p_request_id           uuid,
  p_trip_charge_cents     int,
  p_trip_charge_fee_cents int default 0
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := public.current_member_id();
  r  public.requests;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.awarded_provider_id <> me then raise exception 'not your job'; end if;
  if r.status not in ('awaiting_assessment','adjustment_pending') then
    raise exception 'cannot abort from status %', r.status;
  end if;
  if not exists (select 1 from public.arrival_checkins
                 where request_id = r.id and provider_id = me) then
    raise exception 'arrival check-in required before an abort';
  end if;

  perform public._abort_to_trip_charge(r.id, me, p_trip_charge_cents, p_trip_charge_fee_cents);
  perform public.create_notification(
    r.requester_id, 'aborted', 'Job could not proceed',
    'Your pro could not proceed — a trip charge is under review', r.id);
end $$;

-- ----------------------------------------------------------------------------
-- STEP 4 — human review, the client-protection gate. Aborts only. No money moves
-- to the provider until a human passes it; a failed review VOIDS the authorization
-- (client never charged) — no refund needed. Every decision + checklist is logged
-- (the auto-triage training set). A trip charge with no arrival proof cannot be
-- released (§9). Fast-track auto-clear (§8 step 5) is deferred.
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
  me uuid := public.current_member_id();
  tc public.trip_charges;
begin
  if not public.current_member_is_admin() then raise exception 'admin only'; end if;

  select * into tc from public.trip_charges where id = p_trip_charge_id;
  if tc.id is null then raise exception 'trip charge not found'; end if;
  if tc.status <> 'under_review' then raise exception 'trip charge is % , not under_review', tc.status; end if;

  -- cannot resolve a trip charge without arrival proof (§2, §9).
  if not exists (select 1 from public.arrival_checkins
                 where request_id = tc.request_id and provider_id = tc.provider_id) then
    raise exception 'no arrival proof — trip charge cannot be released';
  end if;

  insert into public.trip_charge_reviews
    (trip_charge_id, reviewer_id, checklist_json, decision, fast_tracked, notes)
  values
    (p_trip_charge_id, me, coalesce(p_checklist_json, '{}'::jsonb), p_decision, p_fast_tracked, p_notes);

  if p_decision = 'pass' then
    -- CAPTURE trip charge + service fee from client (mock); pay provider the
    -- trip-charge rate; platform keeps the service fee.
    update public.trip_charges set status = 'released', resolved_at = now() where id = tc.id;
    insert into public.provider_wallets (member_id, available_to_cashout)
      values (tc.provider_id, tc.amount_cents / 100.0)
      on conflict (member_id) do update
        set available_to_cashout = public.provider_wallets.available_to_cashout + excluded.available_to_cashout;
    insert into public.payouts (request_id, provider_id, job_label, amount, status, paid_at)
      values (tc.request_id, tc.provider_id, 'Trip charge', tc.amount_cents / 100.0, 'paid', now());
    perform public.create_notification(
      tc.provider_id, 'trip_charge_paid', 'Trip charge approved',
      'Your trip charge passed review and was paid', tc.request_id);
  else
    -- VOID the authorization — the client is never charged; provider not paid;
    -- provider flagged (§5, first rung of the enforcement ladder).
    update public.trip_charges set status = 'voided', resolved_at = now() where id = tc.id;
    insert into public.enforcement_events (member_id, role, signal, action, evidence_ref, notes)
      values (tc.provider_id, 'provider', 'trip_charge_review_failed', 'flag',
              tc.request_id::text, p_notes);
    perform public.create_notification(
      tc.provider_id, 'trip_charge_voided', 'Trip charge not approved',
      'Your trip charge did not pass review', tc.request_id);
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- Redefine capture_estimate_example so an ABORTED job produces a MEANINGFUL label
-- (spec §5: an understated job is a valuable example — the intake photo missed the
-- real scope). For an abort we snapshot the DISCOVERED reality: the replacement's
-- proposed scope + amount, even though it was declined. completed/adjusted keep
-- the actual-bill logic. Idempotent via unique(request_id).
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
  v_adj      record;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then return; end if;

  -- most relevant scope adjustment: an approved one wins, else the latest.
  select proposed_scope, proposed_amount_cents
    into v_adj
    from public.scope_adjustments
   where request_id = r.id
   order by (status = 'approved') desc, responded_at desc nulls last, submitted_at desc
   limit 1;

  -- final scope: the discovered/approved scope if any, else the posting.
  if v_adj.proposed_scope is not null then
    v_scope := v_adj.proposed_scope;
  else
    v_scope := coalesce(r.title, '') ||
               case when r.description is not null then ' — ' || r.description else '' end;
  end if;

  -- final price:
  if p_outcome = 'aborted' then
    -- the discovered real value (declined replacement), else the estimate.
    v_price := coalesce(v_adj.proposed_amount_cents, round(coalesce(r.agreed_price, 0) * 100)::int);
  else
    -- the actual bill: the captured escrow total (not a voided one), else agreed.
    select total_cents into v_price
      from public.payments
     where request_id = r.id and status <> 'refunded'
     order by created_at desc
     limit 1;
    if v_price is null then
      v_price := round(coalesce(r.agreed_price, 0) * 100)::int;
    end if;
  end if;

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
-- Grants — client-callable RPCs assert the caller's role internally. The internal
-- _abort_to_trip_charge helper is deliberately NOT granted.
-- ----------------------------------------------------------------------------
grant execute on function public.arrival_check_in(uuid, numeric, numeric, text[]) to authenticated;
grant execute on function public.assess_matches(uuid) to authenticated;
grant execute on function public.submit_scope_adjustment(uuid, public.scope_adjustment_kind, text, text, int, text[], int, int) to authenticated;
grant execute on function public.respond_scope_adjustment(uuid, boolean) to authenticated;
grant execute on function public.abort_no_work(uuid, int, int) to authenticated;
grant execute on function public.review_trip_charge(uuid, public.trip_charge_decision, jsonb, boolean, text) to authenticated;
