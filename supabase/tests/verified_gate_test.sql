-- =============================================================================
-- Verified-gate test (pgTAP). A provider is NOT eligible for matching until an
-- admin approves them: an unverified online provider can't see open requests,
-- can't send an offer, and isn't dispatch-eligible. approve_verification flips
-- verified + online and they become eligible everywhere.
-- =============================================================================
begin;
select plan(8);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A', true, false,false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V', false,true, false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_AD',false,false,true);

-- isolate dispatch from the seeded catalog (Marco is water+online+verified)
update public.provider_profiles set online = false;

insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', false, true, '{water}');  -- online but NOT verified
insert into public.provider_rates (member_id, service_slug, amount, rate_source) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','plumbing',150,'own');

insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','plumbing','Leak','finding');

set local role authenticated;

-- unverified provider is blind + blocked
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.requests where status='finding')::int, 0,
  'an unverified provider does NOT see open requests in their trade');
select throws_ok(
  $$ select public.send_offer('11111111-1111-1111-1111-111111111111') $$,
  'not approved yet', 'an unverified provider cannot send an offer');

reset role;
select is(public.dispatch_eligible_provider('11111111-1111-1111-1111-111111111111'), null,
  'no dispatch-eligible provider while the only candidate is unverified');

-- admin approves V
set local role authenticated;
set local request.jwt.claims = '{"sub":"user_AD"}';
select lives_ok(
  $$ select public.approve_verification('cccccccc-cccc-cccc-cccc-cccccccccccc') $$,
  'admin approves V');

reset role;
select is((select verified and online from public.provider_profiles where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  true, 'approval flips V to verified AND online');

-- now V is eligible everywhere
set local role authenticated;
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.requests where status='finding')::int, 1,
  'a verified provider sees the open request in their trade');
select lives_ok(
  $$ select public.send_offer('11111111-1111-1111-1111-111111111111') $$,
  'a verified provider can send an offer');

reset role;
select is(public.dispatch_eligible_provider('11111111-1111-1111-1111-111111111111'),
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'the approved provider is now dispatch-eligible');

select * from finish();
rollback;
