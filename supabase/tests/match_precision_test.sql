-- =============================================================================
-- Match precision test (pgTAP). Default (service-level): a verified pro sees every
-- request in a service they priced. Opt into precise matching: they see only the
-- exact sub-jobs (options) they priced.
-- =============================================================================
begin;
select plan(3);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','user_A', true, false),
  ('c1111111-1111-1111-1111-111111111111','user_F', false,true);

insert into public.provider_profiles (member_id, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111', true, true, '{surfaces}');
insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model, amount) values
  ('c1111111-1111-1111-1111-111111111111','flooring','new-install','flat',500);  -- priced ONE flooring sub-job

insert into public.requests (id, requester_id, category, service_slug, option_slug, title, status) values
  ('f1111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','surfaces','flooring','new-install','New floor','finding'),
  ('f2222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','surfaces','flooring','tile','Tile job','finding');

set local role authenticated;
set local request.jwt.claims = '{"sub":"user_F"}';

-- default (precise off): sees BOTH flooring requests (service-level)
select is((select count(*) from public.requests where status='finding')::int, 2,
  'service-level (default): F sees all flooring requests');

-- opt into precise matching
select lives_ok($$ select public.set_match_precision(true) $$, 'F opts into precise matching');

-- precise on: sees ONLY the sub-job they priced (new-install), not tile
select is((select count(*) from public.requests where status='finding')::int, 1,
  'precise: F sees only the exact sub-job they priced');

select * from finish();
rollback;
