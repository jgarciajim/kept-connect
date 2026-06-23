-- =============================================================================
-- Sub-job matching test (pgTAP). Selection tailors the feed at SERVICE level: a
-- provider who priced a service sees that service's requests; a provider who went
-- granular in the same family but didn't price that service does NOT; a legacy
-- provider (family in trades, zero sub-job rows) still sees family work (fallback).
-- All are verified (the gate) so visibility reflects tailoring, not the gate.
-- =============================================================================
begin;
select plan(5);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A', true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_F', false,true),  -- priced flooring
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_P', false,true),  -- priced only painting
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_L', false,true);  -- legacy: no sub-job rows

insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, '{surfaces}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', true, true, '{surfaces}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', true, true, '{surfaces}');

insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model, amount) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','flooring','new-install','flat',500),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','painting','interior-room','flat',300);

insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('f1111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','surfaces','flooring','New floor','finding');

set local role authenticated;

-- F priced flooring → sees the flooring request
set local request.jwt.claims = '{"sub":"user_F"}';
select is((select count(*) from public.requests where status='finding')::int, 1,
  'F who priced flooring sees the flooring request');

-- P went granular (priced painting) → does NOT see the flooring request
set local request.jwt.claims = '{"sub":"user_P"}';
select is((select count(*) from public.requests where status='finding')::int, 0,
  'P who priced only painting does NOT see the flooring request');

-- L has no sub-job rows → family fallback → sees the flooring request
set local request.jwt.claims = '{"sub":"user_L"}';
select is((select count(*) from public.requests where status='finding')::int, 1,
  'legacy L (no sub-job rows) still sees family work');

-- add a painting request in the same family
reset role;
insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('f2222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','surfaces','painting','Repaint','finding');
set local role authenticated;

-- P now sees exactly the painting one (not the flooring one)
set local request.jwt.claims = '{"sub":"user_P"}';
select is((select count(*) from public.requests where status='finding')::int, 1,
  'P sees the painting request they priced, but still not flooring');

-- L sees both (family fallback)
set local request.jwt.claims = '{"sub":"user_L"}';
select is((select count(*) from public.requests where status='finding')::int, 2,
  'legacy L sees both surfaces requests');

select * from finish();
rollback;
