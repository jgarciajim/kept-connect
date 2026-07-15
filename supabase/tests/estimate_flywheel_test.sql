-- =============================================================================
-- Estimate flywheel test (pgTAP). The terminal trigger snapshots exactly one
-- labeled example per terminal job: a clean settle -> 'completed'; a settle with
-- an approved scope change -> 'adjusted'; the snapshot is idempotent; predictions
-- join on request_id; RLS scopes examples to parties + admin, predictions to admin.
-- =============================================================================
begin;
select plan(11);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true,  false),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_Z',false,false, true);

-- a clean job, awarded, with geo + price, no scope change
insert into public.requests
  (id, requester_id, category, title, description, status, agreed_price, location_lat, location_lng,
   awarded_provider_id)
values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'water','Swap a faucet','kitchen faucet drips','awarded',140.00,39.480000,-106.040000,
   'cccccccc-cccc-cccc-cccc-cccccccccccc');
insert into public.job_grants (request_id, provider_id) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc');

-- a second job that will settle WITH an approved replacement adjustment
insert into public.requests
  (id, requester_id, category, title, status, agreed_price, location_lat, location_lng,
   awarded_provider_id)
values
  ('33333333-3333-3333-3333-333333333333','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
   'water','Patch drywall','awarded',95.00,39.490000,-106.050000,
   'cccccccc-cccc-cccc-cccc-cccccccccccc');
insert into public.job_grants (request_id, provider_id) values
  ('33333333-3333-3333-3333-333333333333','cccccccc-cccc-cccc-cccc-cccccccccccc');
insert into public.scope_adjustments
  (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, evidence_photos, status, responded_at)
values
  ('33333333-3333-3333-3333-333333333333','cccccccc-cccc-cccc-cccc-cccccccccccc',
   'replacement','Water damage remediation behind drywall',60000,'{damage1.jpg}','approved',now());

-- nothing captured before the terminal transition
select is((select count(*) from public.estimate_examples)::int, 0, 'no example before the job goes terminal');

-- terminal transition fires the trigger (status -> paid). Done as table owner;
-- the trigger is what we are exercising, not the money RPC.
update public.requests set status = 'paid', paid_at = now()
  where id = '11111111-1111-1111-1111-111111111111';
update public.requests set status = 'paid', paid_at = now()
  where id = '33333333-3333-3333-3333-333333333333';

select is((select count(*) from public.estimate_examples)::int, 2, 'one labeled example per terminal job');
select is((select outcome::text from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          'completed', 'a clean settle is captured as completed');
select is((select outcome::text from public.estimate_examples where request_id='33333333-3333-3333-3333-333333333333'),
          'adjusted', 'a settle with an approved scope change is captured as adjusted');
select is((select final_price_cents from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          14000, 'final price is snapshotted in integer cents from agreed_price');
select is((select final_scope from public.estimate_examples where request_id='33333333-3333-3333-3333-333333333333'),
          'Water damage remediation behind drywall', 'adjusted final scope comes from the approved adjustment');
select is((select geo_lat from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          39.480000, 'geo is captured on every example');

-- snapshot is frozen: editing the source request does not rewrite the label
update public.requests set agreed_price = 999.00, title = 'EDITED'
  where id = '11111111-1111-1111-1111-111111111111';
select is((select final_price_cents from public.estimate_examples where request_id='11111111-1111-1111-1111-111111111111'),
          14000, 'snapshot does not move when the source row is edited later');

-- idempotent: re-running capture does not duplicate the example
select public.capture_estimate_example('11111111-1111-1111-1111-111111111111','completed');
select is((select count(*) from public.estimate_examples)::int, 2, 'capture is idempotent (unique per request)');

-- a prediction joins to the actual on request_id (benchmark wired before estimator)
insert into public.estimate_predictions
  (request_id, model_version, predicted_typical_cents, confidence)
values ('11111111-1111-1111-1111-111111111111','v0-test',13000,0.800);

set local role authenticated;

-- party sees their examples; predictions are admin-only
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.estimate_examples)::int, 2, 'owning requester (party) sees their examples');
select is((select count(*) from public.estimate_predictions)::int, 0, 'a non-admin does NOT see predictions');

select * from finish();
rollback;
