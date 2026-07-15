-- =============================================================================
-- Trip-charge behavior test (pgTAP) — spec §9 acceptance criteria.
-- Flows: arrival -> replacement -> client declines -> ABORT (trip charge under
-- review, job estimate VOIDED not refunded, aborted example captured) -> admin
-- review FAIL (void + provider flagged, not paid) and PASS (provider paid, needs
-- arrival proof); replacement APPROVE (new price, trip charge credited, no review);
-- additive DECLINE (original continues, no trip charge); non-admin cannot review.
-- =============================================================================
begin;
select plan(25);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true,  false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_Z',false,false, true);
insert into public.provider_profiles (member_id, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','{water}');

-- five awarded water jobs for provider V, requester A
insert into public.requests (id, requester_id, category, title, status, agreed_price, awarded_provider_id) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Patch','awarded',95.00,'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Faucet','awarded',140.00,'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Drain','awarded',110.00,'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('44444444-4444-4444-4444-444444444444','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Valve','awarded',120.00,'cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('55555555-5555-5555-5555-555555555555','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','NoProof','awarded',90.00,'cccccccc-cccc-cccc-cccc-cccccccccccc');
insert into public.job_grants (request_id, provider_id)
  select id, 'cccccccc-cccc-cccc-cccc-cccccccccccc' from public.requests;
-- held escrow (authorized job estimate) on the abort job, to prove it gets voided
insert into public.payments (request_id, requester_id, provider_id, total_cents, fee_cents, payout_cents, margin_cents, status)
  values ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','cccccccc-cccc-cccc-cccc-cccccccccccc',10450,950,9500,0,'held');
-- an under_review trip charge on a job with NO arrival check-in (seeded as owner,
-- since direct writes to trip_charges are locked to definer RPCs / the owner).
insert into public.trip_charges (id, request_id, provider_id, amount_cents, status)
  values ('66666666-6666-6666-6666-666666666666','55555555-5555-5555-5555-555555555555',
          'cccccccc-cccc-cccc-cccc-cccccccccccc',5000,'under_review');

set local role authenticated;

-- ---- FLOW 1: abort via declined replacement, then admin FAIL ----
set local request.jwt.claims = '{"sub":"user_V"}';
select lives_ok(
  $$ select public.arrival_check_in('11111111-1111-1111-1111-111111111111',39.48,-106.04,'{a1.jpg}') $$,
  'provider checks in with geo + assessment photo');
select is((select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'),
          'awaiting_assessment', 'check-in moves the job to awaiting_assessment');
-- evidence guardrail: no photos on an adjustment is rejected
select throws_ok(
  $$ select public.submit_scope_adjustment('11111111-1111-1111-1111-111111111111','replacement',null,'Full repipe',120000,'{}') $$,
  'P0001', null, 'an adjustment with no evidence photos is rejected');
select lives_ok(
  $$ select public.submit_scope_adjustment('11111111-1111-1111-1111-111111111111','replacement',
       'patch','Full repipe',120000,'{repipe1.jpg}',7500,1125) $$,
  'provider submits a replacement adjustment + disclosed trip charge');
select is((select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'),
          'adjustment_pending', 'a replacement pauses the job at adjustment_pending');
select is((select status::text from public.trip_charges where request_id='11111111-1111-1111-1111-111111111111'),
          'authorized', 'the trip charge is authorized (held, uncaptured)');

-- client declines -> abort
set local request.jwt.claims = '{"sub":"user_A"}';
select lives_ok(
  $$ select public.respond_scope_adjustment(
       (select id from public.scope_adjustments where request_id='11111111-1111-1111-1111-111111111111'), false) $$,
  'client declines the re-quote → abort');
select is((select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'),
          'aborted_trip_charge', 'declined replacement aborts the job');
select is((select status::text from public.trip_charges where request_id='11111111-1111-1111-1111-111111111111'),
          'under_review', 'the trip charge routes to human review');
select is((select status::text from public.payments where request_id='11111111-1111-1111-1111-111111111111'),
          'refunded', 'the job-estimate authorization is VOIDED (no capture, no refund flow)');
-- aborted job is captured as a valuable labeled example (discovered reality)
select is((select outcome::text from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          'aborted', 'the aborted job is captured for the flywheel');
select is((select final_scope from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          'Full repipe', 'the aborted example snapshots the discovered scope');
select is((select final_price_cents from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          120000, 'the aborted example snapshots the discovered price');

-- a non-admin cannot review
select throws_ok(
  $$ select public.review_trip_charge(
       (select id from public.trip_charges where request_id='11111111-1111-1111-1111-111111111111'),'pass') $$,
  'admin only', 'a non-admin cannot resolve a trip charge');

-- admin FAILs the review → void + flag, provider not paid
set local request.jwt.claims = '{"sub":"user_Z"}';
select lives_ok(
  $$ select public.review_trip_charge(
       (select id from public.trip_charges where request_id='11111111-1111-1111-1111-111111111111'),
       'fail','{"arrival_proof":true,"photos_show_surprise":false}'::jsonb, false, 'photos do not show it') $$,
  'admin fails the review');
select is((select status::text from public.trip_charges where request_id='11111111-1111-1111-1111-111111111111'),
          'voided', 'a failed review voids the trip charge (client never charged)');
select is((select action::text from public.enforcement_events where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
          'flag', 'a failed review flags the provider (enforcement ladder rung 1)');
-- payouts are owner-scoped (RLS): assert as the provider so we read true state
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.payouts where provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc')::int,
          0, 'a failed review pays the provider nothing');

-- ---- FLOW 2: replacement APPROVED → new price, trip charge credited, NO review ----
set local request.jwt.claims = '{"sub":"user_V"}';
select public.arrival_check_in('22222222-2222-2222-2222-222222222222',39.48,-106.04,'{b1.jpg}');
select public.submit_scope_adjustment('22222222-2222-2222-2222-222222222222','replacement',
  'faucet','Repipe under sink',30000,'{b2.jpg}',5000,750);
set local request.jwt.claims = '{"sub":"user_A"}';
select public.respond_scope_adjustment(
  (select id from public.scope_adjustments where request_id='22222222-2222-2222-2222-222222222222'), true);
select is((select agreed_price from public.requests where id='22222222-2222-2222-2222-222222222222'),
          300.00, 'an approved replacement continues at the new provider price');
select is((select status::text || ':' || credited_to_job::text
             from public.trip_charges where request_id='22222222-2222-2222-2222-222222222222'),
          'released:true', 'the trip charge is credited toward the job on proceed');
-- trip_charge_reviews are admin-only (RLS): assert as admin to read true state
set local request.jwt.claims = '{"sub":"user_Z"}';
select is((select count(*) from public.trip_charge_reviews r
             join public.trip_charges t on t.id=r.trip_charge_id
             where t.request_id='22222222-2222-2222-2222-222222222222')::int,
          0, 'a proceeded job never enters human review');

-- ---- FLOW 3: additive DECLINE → original continues, NO trip charge ----
set local request.jwt.claims = '{"sub":"user_V"}';
select public.arrival_check_in('33333333-3333-3333-3333-333333333333',39.48,-106.04,'{c1.jpg}');
select public.submit_scope_adjustment('33333333-3333-3333-3333-333333333333','additive',
  'drain','Also clear a second drain',4000,'{c2.jpg}');
set local request.jwt.claims = '{"sub":"user_A"}';
select public.respond_scope_adjustment(
  (select id from public.scope_adjustments where request_id='33333333-3333-3333-3333-333333333333'), false);
select is((select status::text from public.requests where id='33333333-3333-3333-3333-333333333333'),
          'enroute', 'a declined additive leaves the original job proceeding');
select is((select count(*) from public.trip_charges where request_id='33333333-3333-3333-3333-333333333333')::int,
          0, 'a declined additive creates no trip charge');

-- ---- FLOW 4: review PASS pays the provider (with arrival proof) ----
set local request.jwt.claims = '{"sub":"user_V"}';
select public.arrival_check_in('44444444-4444-4444-4444-444444444444',39.48,-106.04,'{d1.jpg}');
select public.submit_scope_adjustment('44444444-4444-4444-4444-444444444444','replacement',
  'valve','Whole manifold',80000,'{d2.jpg}',8000,1200);
set local request.jwt.claims = '{"sub":"user_A"}';
select public.respond_scope_adjustment(
  (select id from public.scope_adjustments where request_id='44444444-4444-4444-4444-444444444444'), false);
set local request.jwt.claims = '{"sub":"user_Z"}';
select public.review_trip_charge(
  (select id from public.trip_charges where request_id='44444444-4444-4444-4444-444444444444'),
  'pass','{"arrival_proof":true,"photos_show_surprise":true}'::jsonb);
-- wallet is owner-scoped (RLS): assert as the provider
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select available_to_cashout from public.provider_wallets where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
          80.00, 'a passed review pays the provider the trip-charge rate');

-- ---- guardrail: a trip charge with NO arrival proof cannot be released ----
-- (the under_review charge on request 5 was seeded above; it has no check-in)
set local request.jwt.claims = '{"sub":"user_Z"}';
select throws_ok(
  $$ select public.review_trip_charge('66666666-6666-6666-6666-666666666666','pass') $$,
  'no arrival proof — trip charge cannot be released',
  'a trip charge with no arrival proof cannot be released');

select * from finish();
rollback;
