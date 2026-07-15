-- =============================================================================
-- Trip-charge data model test (pgTAP). The schema enforces the spec's guardrails:
-- the adjusted price is ALWAYS the provider's own rate (rate_source CHECK), no
-- adjustment/checkin without evidence photos (non-empty CHECK), the request_status
-- enum is extended, and RLS scopes evidence/charges to parties + admin while the
-- review checklist is admin-only. Rows are seeded as the table owner because the
-- behavior RPCs (the only client write path) are not built yet.
-- =============================================================================
begin;
select plan(11);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true,  false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_Z',false,false, true);

insert into public.requests (id, requester_id, category, title, status, agreed_price) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Leak','awarded',280.00);
-- grant the provider visibility (party) so the party RLS check has something to pass
insert into public.job_grants (request_id, provider_id) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc');

-- enum extended (spec §7)
select ok(
  'aborted_trip_charge' = any(enum_range(null::public.request_status)::text[]),
  'request_status enum gained aborted_trip_charge');

-- guardrail: classification — rate_source must be the provider's own rate
select throws_ok(
  $$ insert into public.scope_adjustments
       (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, rate_source, evidence_photos)
     values ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',
             'replacement','Full repipe',120000,'platform','{photo1.jpg}') $$,
  '23514',  -- check_violation
  null,
  'platform-set adjustment price is rejected (rate_source must be own)');

-- guardrail: evidence — no photos = invalid adjustment
select throws_ok(
  $$ insert into public.scope_adjustments
       (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, evidence_photos)
     values ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',
             'replacement','Full repipe',120000,'{}') $$,
  '23514',
  null,
  'an adjustment with no evidence photos is rejected');

-- a valid replacement adjustment (provider own rate + evidence) inserts
select lives_ok(
  $$ insert into public.scope_adjustments
       (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, evidence_photos)
     values ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',
             'replacement','Full repipe',120000,'{repipe1.jpg,repipe2.jpg}') $$,
  'a valid replacement adjustment (own rate + evidence) is accepted');

-- guardrail: arrival proof needs photos too
select throws_ok(
  $$ insert into public.arrival_checkins (request_id, provider_id, geo_lat, geo_lng, assessment_photos)
     values ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',
             39.480000,-106.040000,'{}') $$,
  '23514', null,
  'an arrival check-in with no assessment photos is rejected');

-- a trip charge + its review (authorize-then-capture state; review = training log)
insert into public.trip_charges (id, request_id, provider_id, amount_cents, service_fee_cents, status)
  values ('22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',
          'cccccccc-cccc-cccc-cccc-cccccccccccc',7500,1125,'under_review');
insert into public.trip_charge_reviews (trip_charge_id, reviewer_id, checklist_json, decision, fast_tracked)
  values ('22222222-2222-2222-2222-222222222222','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
          '{"arrival_proof":true,"photos_show_surprise":true,"scope_plausible":true,"provider_history_ok":true,"client_history_ok":true}'::jsonb,
          'pass', false);

select is((select status::text from public.trip_charges where id='22222222-2222-2222-2222-222222222222'),
          'under_review', 'trip charge holds in under_review (authorize-then-capture)');

set local role authenticated;

-- party (requester) sees the charge + adjustment; the review checklist is hidden
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.trip_charges)::int, 1, 'owning requester (party) sees the trip charge');
select is((select count(*) from public.scope_adjustments)::int, 1, 'owning requester (party) sees the adjustment');
select is((select count(*) from public.trip_charge_reviews)::int, 0, 'a party does NOT see the internal review checklist');

-- non-party sees nothing
set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.trip_charges)::int, 0, 'a non-party sees no trip charges');

-- admin sees the review checklist (the triage training data)
set local request.jwt.claims = '{"sub":"user_Z"}';
select is((select count(*) from public.trip_charge_reviews)::int, 1, 'an admin sees the review checklist');

select * from finish();
rollback;
