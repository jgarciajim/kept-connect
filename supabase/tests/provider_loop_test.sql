-- =============================================================================
-- Provider-loop isolation test (pgTAP). Proves the new visibility + classification:
--   * a provider sees OPEN (finding) requests ONLY in their trade
--   * send_offer prices from the provider's OWN rate (never a platform value) and
--     records rate_source; it refuses out-of-trade or no-rate offers
--   * award_quote writes the job_grant (the isolation bridge) so the accepted
--     provider keeps visibility once the request leaves 'finding'
--   * a non-granted, in-trade provider loses visibility once the request is awarded
-- Seeding runs as the table owner (RLS bypassed); assertions run as `authenticated`
-- with a per-member JWT.
-- =============================================================================
begin;
select plan(17);

-- ---- members: A,B requesters · V,D,W providers ------------------------------
insert into public.members (id, clerk_user_id, is_requester, is_provider, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false,'Ann Req'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false,'Bo Req'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true, 'Vic Pro'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_D',false,true, 'Dee Pro'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_W',false,true, 'Wes Pro');

-- V + W work water; D works structure --------------------------------------
insert into public.provider_profiles (member_id, rating, verified, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',4.9,true,'{water}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',4.7,true,'{structure}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',5.0,true,'{water}');

-- V has set an OWN rate for plumbing; W has none --------------------------------
insert into public.provider_rates (member_id, service_slug, amount, rate_source) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','plumbing',175.00,'own');

-- requests: rWater (A, water/plumbing, finding) · rStruct (B, structure, finding)
insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','plumbing','Leak','finding'),
  ('22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','structure','handyman','Drywall','finding');

set local role authenticated;

-- ===== open-request visibility is finding + in-trade only ====================
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.requests where id='11111111-1111-1111-1111-111111111111')::int, 1, 'V (water) sees the open water request');
select is((select count(*) from public.requests where id='22222222-2222-2222-2222-222222222222')::int, 0, 'V does NOT see the structure request (out of trade)');
select is((select count(*) from public.requests)::int, 1, 'V sees exactly one open request');

set local request.jwt.claims = '{"sub":"user_D"}';
select is((select count(*) from public.requests where id='22222222-2222-2222-2222-222222222222')::int, 1, 'D (structure) sees the open structure request');
select is((select count(*) from public.requests where id='11111111-1111-1111-1111-111111111111')::int, 0, 'D does NOT see the water request');

set local request.jwt.claims = '{"sub":"user_W"}';
select is((select count(*) from public.requests where id='11111111-1111-1111-1111-111111111111')::int, 1, 'W (water, ungranted) sees the open water request via trade');

-- ===== send_offer: classification guardrails ================================
-- W has no rate for plumbing → cannot offer (platform never invents a price).
select throws_ok(
  $$ select public.send_offer('11111111-1111-1111-1111-111111111111') $$,
  'no rate set for this service',
  'W cannot send an offer with no rate set');

-- V cannot offer on a request outside their trade.
set local request.jwt.claims = '{"sub":"user_V"}';
select throws_ok(
  $$ select public.send_offer('22222222-2222-2222-2222-222222222222') $$,
  'not in your trade',
  'V cannot offer on an out-of-trade request');

-- V sends an offer at their OWN rate → a quote priced from provider_rates.
select lives_ok(
  $$ select public.send_offer('11111111-1111-1111-1111-111111111111') $$,
  'V sends an offer on the open water request');
select is(
  (select price from public.quotes where request_id='11111111-1111-1111-1111-111111111111' and provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  175.00, 'the quote is priced from V''s own rate (not a platform value)');
select is(
  (select rate_source::text from public.quotes where request_id='11111111-1111-1111-1111-111111111111' and provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'own', 'the quote records rate_source = own (classification audit trail)');

-- ===== requester A awards V's quote → grant + award =========================
set local request.jwt.claims = '{"sub":"user_A"}';
select lives_ok(
  $$ select public.award_quote((select id from public.quotes where request_id='11111111-1111-1111-1111-111111111111' and provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc')) $$,
  'A awards V''s quote');
select is(
  (select count(*) from public.job_grants where request_id='11111111-1111-1111-1111-111111111111' and provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc')::int,
  1, 'award_quote wrote the job_grant (the isolation bridge)');
select is(
  (select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'),
  'awarded', 'the request is now awarded');

-- ===== post-award visibility: grant holds, open-trade no longer applies ======
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.requests where id='11111111-1111-1111-1111-111111111111')::int, 1, 'V still sees the request via the grant after award');

set local request.jwt.claims = '{"sub":"user_W"}';
select is((select count(*) from public.requests where id='11111111-1111-1111-1111-111111111111')::int, 0, 'W (in-trade, ungranted) loses visibility once it is no longer finding');

-- ===== recursion smoke — the new policy must not loop =========================
set local request.jwt.claims = '{"sub":"user_V"}';
select lives_ok($$ select * from public.requests $$, 'no RLS recursion on the open-request policy');

select * from finish();
rollback;
