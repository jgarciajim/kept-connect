-- =============================================================================
-- Routing & ETA test (pgTAP) — v1 conservative ETA + v2 calibration flywheel,
-- plus the ranker proximity/coverage wiring the same location data unlocks.
-- =============================================================================
begin;
select plan(17);

delete from public.provider_profiles;
delete from public.eta_geo_calibration;   -- clean slate for calibration assertions

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','rt_A', true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','rt_V', false,true),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01','rt_PN',false,true),   -- near
  ('cccccccc-cccc-cccc-cccc-cccccccccc02','rt_PF',false,true),   -- far (in coverage, low P)
  ('cccccccc-cccc-cccc-cccc-cccccccccc03','rt_PC',false,true);   -- outside coverage
insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, '{water}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc01', true, true, '{water}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc02', true, true, '{water}'),
  ('cccccccc-cccc-cccc-cccc-cccccccccc03', true, true, '{water}');

-- ---- geometry + conservative ETA math ----
select cmp_ok(round(public.haversine_km(0,0,0,1),2), '>', 111.0::numeric, 'haversine ~111 km for 1° of longitude');
select is(public.haversine_km(39.5,-106.0,39.5,-106.0), 0::numeric, 'haversine of a point to itself is 0');
select is((select eta_low  from public.estimate_eta_window(15,'x')), 30, '15 km → conservative window low 30 min');
select is((select eta_high from public.estimate_eta_window(15,'x')), 40, '15 km → conservative window high 40 min');
select is((select eta_low  from public.estimate_eta_window(0.2,'x')), 10, 'a very short trip is floored at the minimum ETA');

-- ---- set_provider_location + mark_on_my_way (v1) ----
insert into public.requests (id, requester_id, category, title, status, awarded_provider_id, location_lat, location_lng) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','R1','awarded','cccccccc-cccc-cccc-cccc-cccccccccccc',39.53,-106.04),
  ('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','R2','awarded','cccccccc-cccc-cccc-cccc-cccccccccccc',39.53,-106.04);

set local role authenticated;
set local request.jwt.claims = '{"sub":"rt_V"}';
select public.set_provider_location(39.60,-106.10,50);
-- tap "On my way" with the geolocation captured at tap
select public.mark_on_my_way('11111111-1111-1111-1111-111111111111', 39.54, -106.05);
-- no geolocation passed → falls back to the saved base location
select public.mark_on_my_way('22222222-2222-2222-2222-222222222222');
-- guard: cannot re-fire on a job that is no longer awarded (still as the provider)
select throws_ok(
  $$ select public.mark_on_my_way('11111111-1111-1111-1111-111111111111') $$,
  'cannot start a job in status enroute', 'mark_on_my_way is rejected once the job left awarded');

reset role;   -- assert request/ledger state as owner (RLS would hide these from the provider)

select is((select round(base_lat,2) from public.provider_locations where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
          39.60, 'a provider can save their base location');
select is((select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'),
          'enroute', 'mark_on_my_way moves the job to enroute');
select ok((select eta_minutes is not null and eta_computed_at is not null
             from public.requests where id='11111111-1111-1111-1111-111111111111'),
          'a conservative ETA is computed and stamped from the tap-time position');
select ok((select eta_origin_km > 0 from public.requests where id='22222222-2222-2222-2222-222222222222'),
          'ETA falls back to the provider base location when no geolocation is given');

-- ---- v2 flywheel: predicted vs actual → per-geo calibration ----
-- five jobs in one geo where the true trip took ~50 min but we predicted 20
insert into public.requests (id, requester_id, category, title, status, awarded_provider_id,
                             location_lat, location_lng, eta_minutes, eta_min_low, eta_computed_at)
  select ('33333333-0000-0000-0000-00000000000'||g)::uuid,'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','C'||g,
         'aborted_trip_charge','cccccccc-cccc-cccc-cccc-cccccccccccc',39.53,-106.04,20,10, now() - interval '50 minutes'
  from generate_series(1,5) g;
insert into public.arrival_checkins (request_id, provider_id, geo_lat, geo_lng, assessment_photos, checked_in_at)
  select id,'cccccccc-cccc-cccc-cccc-cccccccccccc',39.53,-106.04,'{a.jpg}', now()
  from public.requests where title in ('C1','C2','C3','C4','C5');

select is((select actual_min from public.eta_accuracy where request_id='33333333-0000-0000-0000-000000000001'),
          50, 'eta_accuracy derives actual travel minutes from the arrival check-in');
select is(public.recompute_eta_calibration(), 1, 'calibration recomputes the one qualifying geo');
select ok((select factor between 2.0 and 3.0 and sample_n = 5
             from public.eta_geo_calibration where geo_key = public.eta_geo_key(39.53,-106.04)),
          'the geo learns a correction factor (~2.5) from predicted-vs-actual');
select cmp_ok(
  (select eta_high from public.estimate_eta_window(15, public.eta_geo_key(39.53,-106.04))), '>',
  (select eta_high from public.estimate_eta_window(15, 'uncalibrated')),
  'calibration raises future ETAs where we were optimistic');

-- ---- proximity (P) + coverage gate from the same location data ----
insert into public.requests (id, requester_id, category, title, status, dispatch_mode, location_lat, location_lng) values
  ('44444444-4444-4444-4444-444444444444','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','RP','finding','quote',39.50,-106.00);
insert into public.provider_locations (member_id, base_lat, base_lng, service_radius_km) values
  ('cccccccc-cccc-cccc-cccc-cccccccccc01',39.50,-106.00, 50),   -- on top of the job
  ('cccccccc-cccc-cccc-cccc-cccccccccc02',39.90,-106.00, 50),   -- ~44 km: within coverage, beyond max_radius
  ('cccccccc-cccc-cccc-cccc-cccccccccc03',39.90,-106.00, 10);   -- ~44 km with a 10 km radius: outside coverage

select is((select (factors->>'P')::numeric from public.rank_providers('44444444-4444-4444-4444-444444444444')
             where provider_id='cccccccc-cccc-cccc-cccc-cccccccccc01'),
          1.0, 'a provider on top of the job gets maximum proximity');
select is((select (factors->>'P')::numeric from public.rank_providers('44444444-4444-4444-4444-444444444444')
             where provider_id='cccccccc-cccc-cccc-cccc-cccccccccc02'),
          0.15, 'a far (but in-coverage) provider is floored, never zeroed');
select is((select gate_reason from public.rank_providers('44444444-4444-4444-4444-444444444444')
             where provider_id='cccccccc-cccc-cccc-cccc-cccccccccc03'),
          'outside_geo', 'a provider beyond their service radius is gated outside_geo');

select * from finish();
rollback;
