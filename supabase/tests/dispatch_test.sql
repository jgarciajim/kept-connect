-- =============================================================================
-- D13 dispatch engine test (pgTAP). Proves the round-robin instant dispatch:
--   * an instant Post offers to ONE eligible provider (trade match + online)
--   * ineligible providers (wrong trade / offline) are never offered
--   * expiry/tick advances to the next provider (round-robin)
--   * accept_offer awards the request AND supersedes the round's siblings
--   * a quote-mode request gets NO auto-offer
-- Seeding runs as the table owner (RLS bypassed). Round-robin order is made
-- deterministic via rating (V1 5.0 > V2 4.5) so each step is assertable.
-- =============================================================================
begin;
select plan(10);

-- members: A requester; V1/V2 eligible water providers; W wrong-trade; X offline
insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','user_A', true,  false),
  ('c1111111-1111-1111-1111-111111111111','user_V1',false, true),
  ('c2222222-2222-2222-2222-222222222222','user_V2',false, true),
  ('d1111111-1111-1111-1111-111111111111','user_W', false, true),
  ('d2222222-2222-2222-2222-222222222222','user_X', false, true);

-- isolate from the seeded public catalog (Marco is water+online): take all
-- pre-existing profiles offline so only this test's providers are eligible.
update public.provider_profiles set online = false;

insert into public.provider_profiles (member_id, rating, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111',5.0,true,true,  array['water']::public.category_key[]),
  ('c2222222-2222-2222-2222-222222222222',4.5,true,true,  array['water']::public.category_key[]),
  ('d1111111-1111-1111-1111-111111111111',5.0,true,true,  array['structure']::public.category_key[]),  -- wrong trade
  ('d2222222-2222-2222-2222-222222222222',5.0,true,false, array['water']::public.category_key[]);       -- offline

insert into public.services (id, category, name, base_price) values
  ('51111111-1111-1111-1111-111111111111','water','Test fixed job',100.00);

-- ---- instant Post fires the trigger → one offer to the best eligible provider --
insert into public.requests (id, requester_id, category, title, status, dispatch_mode, service_id) values
  ('11111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','Quick job','finding','instant','51111111-1111-1111-1111-111111111111');

select is((select count(*) from public.offers where request_id='11111111-1111-1111-1111-111111111111' and status='pending')::int, 1,
  'instant Post creates exactly one pending offer');
select is((select provider_id from public.offers where request_id='11111111-1111-1111-1111-111111111111'),
  'c1111111-1111-1111-1111-111111111111'::uuid,
  'offered to V1 first (eligible, highest rating)');

-- ---- quote-mode request gets NO auto-offer -----------------------------------
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('22222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','structure','Big project','finding','quote');
select is((select count(*) from public.offers where request_id='22222222-2222-2222-2222-222222222222')::int, 0,
  'quote-mode request is NOT auto-dispatched');

-- ---- expire V1''s offer + tick → advance to V2 -------------------------------
update public.offers set respond_by = now() - interval '1 minute'
  where request_id='11111111-1111-1111-1111-111111111111';
select public.dispatch_tick();

select is((select count(distinct provider_id) from public.offers where request_id='11111111-1111-1111-1111-111111111111')::int, 2,
  'after expiry the round advances to the second provider');
select is((select count(*) from public.offers where request_id='11111111-1111-1111-1111-111111111111' and status='pending')::int, 1,
  'still exactly one pending offer after advancing');
select is((select provider_id from public.offers where request_id='11111111-1111-1111-1111-111111111111' and status='pending'),
  'c2222222-2222-2222-2222-222222222222'::uuid,
  'the live offer is now to V2');

-- ---- ineligible providers are never offered ----------------------------------
select is((select count(*) from public.offers where provider_id='d1111111-1111-1111-1111-111111111111')::int, 0,
  'wrong-trade provider W is never offered');
select is((select count(*) from public.offers where provider_id='d2222222-2222-2222-2222-222222222222')::int, 0,
  'offline provider X is never offered');

-- ---- V2 accepts → request awarded + siblings superseded ----------------------
set local role authenticated;
set local request.jwt.claims = '{"sub":"user_V2"}';
select public.accept_offer((select id from public.offers where request_id='11111111-1111-1111-1111-111111111111' and status='pending'));

reset role;
select is((select status::text from public.requests where id='11111111-1111-1111-1111-111111111111'), 'awarded',
  'accept awards the request');
select is((select count(*) from public.offers where request_id='11111111-1111-1111-1111-111111111111' and status='pending')::int, 0,
  'no pending offers remain after first-accept-wins');

select * from finish();
rollback;
