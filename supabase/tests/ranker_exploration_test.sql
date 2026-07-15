-- =============================================================================
-- Ranker exploration test (pgTAP) — spec §4.1 step 5.
-- With the roll above ε the pass returns the top-ranked provider (no diversion);
-- with the roll below ε it diverts the offer to an under-sampled eligible provider
-- and flags that logged row exploration=true; exploration never targets a gated
-- provider. Runs as table owner (rank/log functions take the request id).
-- =============================================================================
begin;
select plan(7);

delete from public.provider_profiles;
-- keep the default exploration_epsilon (0.10); we pin the roll explicitly instead.

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','ex_A', true, false),
  ('c1111111-1111-1111-1111-111111111111','ex_TOP',false,true),  -- strong, well-sampled
  ('c2222222-2222-2222-2222-222222222222','ex_NEW',false,true),  -- new, under-sampled
  ('c9999999-9999-9999-9999-999999999999','ex_OFF',false,true);  -- offline (gated)

insert into public.provider_profiles (member_id, rating, jobs_done, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111',4.8,40,true,true,  '{water}'),
  ('c2222222-2222-2222-2222-222222222222',0.0, 0,true,true,  '{water}'),
  ('c9999999-9999-9999-9999-999999999999',5.0,50,true,false, '{water}');

-- give TOP some offer history so NEW is the under-sampled one (fewest offers).
-- 'declined' keeps them off the availability load (only pending/active count for A).
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('d1111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','d1','finding','quote'),
  ('d2222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','water','d2','finding','quote');
insert into public.offers (request_id, provider_id, pay, status) values
  ('d1111111-1111-1111-1111-111111111111','c1111111-1111-1111-1111-111111111111',0,'declined'),
  ('d2222222-2222-2222-2222-222222222222','c1111111-1111-1111-1111-111111111111',0,'declined');

-- two target requests (so the two passes log independently)
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('11111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','T1','finding','quote'),
  ('22222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','water','T2','finding','quote');

-- TOP is genuinely rank 1
select is((select provider_id from public.rank_providers('11111111-1111-1111-1111-111111111111') where rank_position=1),
          'c1111111-1111-1111-1111-111111111111'::uuid, 'the strong provider is ranked #1');

-- roll ABOVE epsilon → no exploration → returns the top pick
select is(public.dispatch_score_and_log('11111111-1111-1111-1111-111111111111', 0.99),
          'c1111111-1111-1111-1111-111111111111'::uuid, 'roll ≥ ε returns the top-ranked provider');
select is((select count(*) from public.ranker_scores
             where request_id='11111111-1111-1111-1111-111111111111' and exploration)::int,
          0, 'a non-exploration pass flags no rows');

-- roll BELOW epsilon → explore → diverts to the under-sampled eligible provider
select is(public.dispatch_score_and_log('22222222-2222-2222-2222-222222222222', 0.0),
          'c2222222-2222-2222-2222-222222222222'::uuid, 'roll < ε diverts to the under-sampled provider');
select is((select provider_id from public.ranker_scores
             where request_id='22222222-2222-2222-2222-222222222222' and exploration),
          'c2222222-2222-2222-2222-222222222222'::uuid, 'the explored offer is logged exploration=true');
select is((select count(*) from public.ranker_scores
             where request_id='22222222-2222-2222-2222-222222222222' and exploration)::int,
          1, 'exactly one row is flagged as exploration');
-- the offline provider is gated and is never the exploration target
select is((select exploration from public.ranker_scores
             where request_id='22222222-2222-2222-2222-222222222222'
               and provider_id='c9999999-9999-9999-9999-999999999999'),
          false, 'a gated provider is never chosen for exploration');

select * from finish();
rollback;
