-- =============================================================================
-- Trip-charge fast-track + enforcement ladder test (pgTAP) — spec §4/§5, steps 5-6.
-- The ladder escalates flag→warning→suspension→removal by violation count; a
-- suspended/removed provider is gated out of the ranker; fast-track (when enabled)
-- auto-clears a clean abort but never a provider with a bad history; a requester is
-- only escalated for declines PAST the free-decline threshold.
-- =============================================================================
begin;
select plan(15);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','ft_A', true, false, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','ft_V', false,true,  false),  -- laddered to removal
  ('cccccccc-cccc-cccc-cccc-cccccccccc02','ft_W', false,true,  false),  -- clean, fast-tracked
  ('cccccccc-cccc-cccc-cccc-cccccccccc03','ft_U', false,true,  false),  -- has a prior fail
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','ft_Z', false,false, true);
insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, '{water}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', true, true, '{water}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', true, true, '{water}');

-- ---- the ladder mapping is graduated + monotonic ----
select is(public.enforcement_action_for_count(1)::text,'flag',      'count 1 → flag');
select is(public.enforcement_action_for_count(2)::text,'warning',   'count 2 → warning');
select is(public.enforcement_action_for_count(3)::text,'suspension','count 3 → suspension');
select is(public.enforcement_action_for_count(5)::text,'removal',   'count 4+ → removal');

-- four aborted jobs for V, each with arrival proof + an under_review trip charge
insert into public.requests (id, requester_id, category, title, status, awarded_provider_id) values
  ('11111111-0000-0000-0000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','r1','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('11111111-0000-0000-0000-000000000002','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','r2','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('11111111-0000-0000-0000-000000000003','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','r3','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('11111111-0000-0000-0000-000000000004','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','r4','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccccc');
insert into public.arrival_checkins (request_id, provider_id, geo_lat, geo_lng, assessment_photos)
  select id, 'cccccccc-cccc-cccc-cccc-cccccccccccc', 39.48, -106.04, '{a.jpg}'
  from public.requests where title in ('r1','r2','r3','r4');
insert into public.trip_charges (id, request_id, provider_id, amount_cents, status)
  select ('22222222-0000-0000-0000-00000000000'||right(title,1))::uuid, id,
         'cccccccc-cccc-cccc-cccc-cccccccccccc', 5000, 'under_review'
  from public.requests where title in ('r1','r2','r3','r4');

set local role authenticated;
set local request.jwt.claims = '{"sub":"ft_Z"}';
select public.review_trip_charge('22222222-0000-0000-0000-000000000001','fail');
select public.review_trip_charge('22222222-0000-0000-0000-000000000002','fail');
select public.review_trip_charge('22222222-0000-0000-0000-000000000003','fail');
select public.review_trip_charge('22222222-0000-0000-0000-000000000004','fail');
reset role;

select is((select action::text from public.enforcement_events where evidence_ref='11111111-0000-0000-0000-000000000001'),
          'flag',      '1st failed review → flag');
select is((select action::text from public.enforcement_events where evidence_ref='11111111-0000-0000-0000-000000000002'),
          'warning',   '2nd failed review → warning');
select is((select action::text from public.enforcement_events where evidence_ref='11111111-0000-0000-0000-000000000003'),
          'suspension','3rd failed review → suspension');
select is((select action::text from public.enforcement_events where evidence_ref='11111111-0000-0000-0000-000000000004'),
          'removal',   '4th failed review → removal');

-- ---- a removed provider is gated out of the ranker ----
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('33333333-0000-0000-0000-000000000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','gate','finding','quote');
select is((select gate_reason from public.rank_providers('33333333-0000-0000-0000-000000000000')
             where provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
          'removed', 'a removed provider is gated out of the ranker');

-- ---- fast-track: enable it, then a clean provider''s abort auto-clears ----
update public.trip_charge_config set fast_track_enabled = true where id = 1;
insert into public.requests (id, requester_id, category, title, status, agreed_price, awarded_provider_id) values
  ('44444444-0000-0000-0000-000000000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','ftjob','awarded',100.00,'cccccccc-cccc-cccc-cccc-cccccccccc02');
insert into public.job_grants (request_id, provider_id) values
  ('44444444-0000-0000-0000-000000000000','cccccccc-cccc-cccc-cccc-cccccccccc02');

set local role authenticated;
set local request.jwt.claims = '{"sub":"ft_W"}';
select public.arrival_check_in('44444444-0000-0000-0000-000000000000',39.48,-106.04,'{w.jpg}');
select public.submit_scope_adjustment('44444444-0000-0000-0000-000000000000','replacement',
  'orig','Whole rebuild',80000,'{w2.jpg}',6000,900);
set local request.jwt.claims = '{"sub":"ft_A"}';
select public.respond_scope_adjustment(
  (select id from public.scope_adjustments where request_id='44444444-0000-0000-0000-000000000000'), false);
reset role;

select is((select status::text from public.trip_charges where request_id='44444444-0000-0000-0000-000000000000'),
          'released', 'a clean abort auto-clears when fast-track is enabled');
select is((select fast_tracked and reviewer_id is null from public.trip_charge_reviews r
             join public.trip_charges t on t.id=r.trip_charge_id
             where t.request_id='44444444-0000-0000-0000-000000000000'),
          true, 'the auto-clear is logged fast_tracked with no human reviewer');

-- ---- fast-track refuses a provider with a bad history ----
insert into public.requests (id, requester_id, category, title, status, awarded_provider_id) values
  ('55555555-0000-0000-0000-000000000000','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','ufail','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccc03'),
  ('55555555-0000-0000-0000-000000000009','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','uprior','aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccc03');
insert into public.arrival_checkins (request_id, provider_id, geo_lat, geo_lng, assessment_photos) values
  ('55555555-0000-0000-0000-000000000000','cccccccc-cccc-cccc-cccc-cccccccccc03',39.48,-106.04,'{u.jpg}');
-- a prior failed review makes U not-clean
insert into public.trip_charges (id, request_id, provider_id, amount_cents, status) values
  ('66666666-0000-0000-0000-000000000009','55555555-0000-0000-0000-000000000009','cccccccc-cccc-cccc-cccc-cccccccccc03',5000,'voided'),
  ('66666666-0000-0000-0000-000000000000','55555555-0000-0000-0000-000000000000','cccccccc-cccc-cccc-cccc-cccccccccc03',5000,'under_review');
insert into public.trip_charge_reviews (trip_charge_id, reviewer_id, decision) values
  ('66666666-0000-0000-0000-000000000009','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','fail');
select is(public.try_fast_track('66666666-0000-0000-0000-000000000000'), false,
          'fast-track refuses a provider with a prior failed review');
select is((select status::text from public.trip_charges where id='66666666-0000-0000-0000-000000000000'),
          'under_review', 'that trip charge waits for a human instead');

-- ---- requester side: free below the threshold, escalates at it ----
-- threshold defaults to 5; seed 5 declined adjustments for a fresh requester
insert into public.members (id, clerk_user_id, is_requester) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99','ft_SD', true);
insert into public.requests (id, requester_id, category, title, status)
  select ('77777777-0000-0000-0000-00000000000'||g)::uuid,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99','water','sd'||g,'awarded'
  from generate_series(1,5) g;
insert into public.scope_adjustments (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, evidence_photos, status, responded_at)
  select id,'cccccccc-cccc-cccc-cccc-cccccccccccc','replacement','x',1000,'{p.jpg}','declined',now()
  from public.requests where requester_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99';
-- with only 4 declines counted, no escalation yet
delete from public.scope_adjustments where request_id='77777777-0000-0000-0000-000000000005';
select public.evaluate_requester_enforcement('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99');
select is((select count(*) from public.enforcement_events where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99')::int,
          0, 'a requester below the decline threshold is not punished');
-- restore the 5th decline → now at threshold → escalate
insert into public.scope_adjustments (request_id, provider_id, kind, proposed_scope, proposed_amount_cents, evidence_photos, status, responded_at)
  values ('77777777-0000-0000-0000-000000000005','cccccccc-cccc-cccc-cccc-cccccccccccc','replacement','x',1000,'{p.jpg}','declined',now());
select public.evaluate_requester_enforcement('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99');
select is((select action::text from public.enforcement_events
             where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa99' and signal='serial_decliner'),
          'flag', 'a serial decliner at the threshold is flagged (start of the ladder)');

select * from finish();
rollback;
