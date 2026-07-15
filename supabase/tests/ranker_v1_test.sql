-- =============================================================================
-- Ranker v1 test (pgTAP) — spec §9 acceptance criteria.
-- Price appears in no factor; the eligibility gate filters with reasons (expired
-- credentials / unverified / offline / at cap); Bayesian smoothing means a long
-- 4.8 record beats a single 5-star; new providers get a non-zero prior; a fast
-- DECLINE scores the same as a fast ACCEPT (only ignoring hurts); every pass is
-- logged (eligible + gated). rank_providers takes the request id, so the whole
-- test runs as the table owner (RLS bypassed for direct state assertions).
-- =============================================================================
begin;
select plan(15);

-- isolate: drop the seeded demo profiles so only this test's providers score
delete from public.provider_profiles;
-- deterministic: disable exploration so dispatch_score_and_log returns the top pick
update public.ranker_config set exploration_epsilon = 0 where id = 1;

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','rk_A', true, false),
  ('c1111111-1111-1111-1111-111111111111','rk_P1',false,true),  -- 1x 5.0 (thin)
  ('c2222222-2222-2222-2222-222222222222','rk_P2',false,true),  -- 50x 4.8 (long)
  ('c3333333-3333-3333-3333-333333333333','rk_NEW',false,true), -- brand new
  ('c4444444-4444-4444-4444-444444444444','rk_D',false,true),   -- fast decliner
  ('c5555555-5555-5555-5555-555555555555','rk_E',false,true),   -- fast accepter
  ('c6666666-6666-6666-6666-666666666666','rk_F',false,true),   -- ignores offers
  ('c7777777-7777-7777-7777-777777777777','rk_GEx',false,true), -- expired COI
  ('c8888888-8888-8888-8888-888888888888','rk_GUn',false,true), -- unverified
  ('c9999999-9999-9999-9999-999999999999','rk_GOf',false,true), -- offline
  ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','rk_GCp',false,true); -- at offer cap

insert into public.provider_profiles (member_id, rating, jobs_done, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111',5.0, 1, true, true,  '{water}'),
  ('c2222222-2222-2222-2222-222222222222',4.8, 50,true, true,  '{water}'),
  ('c3333333-3333-3333-3333-333333333333',0.0, 0, true, true,  '{water}'),
  ('c4444444-4444-4444-4444-444444444444',4.0, 5, true, true,  '{water}'),
  ('c5555555-5555-5555-5555-555555555555',4.0, 5, true, true,  '{water}'),
  ('c6666666-6666-6666-6666-666666666666',4.0, 5, true, true,  '{water}'),
  ('c7777777-7777-7777-7777-777777777777',4.9, 20,true, true,  '{water}'),
  ('c8888888-8888-8888-8888-888888888888',4.9, 20,false,true,  '{water}'),
  ('c9999999-9999-9999-9999-999999999999',4.9, 20,true, false, '{water}'),
  ('caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',4.9, 20,true, true,  '{water}');

-- expired certificate of insurance for the credential-gate provider
insert into public.provider_verifications (member_id, coi_expiry)
  values ('c7777777-7777-7777-7777-777777777777', current_date - 1);

-- dummy requests to carry the offer history (quote-mode: no auto-dispatch)
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('d1111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','d1','finding','quote'),
  ('d2222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','water','d2','finding','quote'),
  ('d3333333-3333-3333-3333-333333333333','a1111111-1111-1111-1111-111111111111','water','d3','finding','quote');

-- responsiveness history: D declines both, E accepts both (both RESPONDED),
-- F responds to one and ignores (expires) the other.
insert into public.offers (request_id, provider_id, pay, status) values
  ('d1111111-1111-1111-1111-111111111111','c4444444-4444-4444-4444-444444444444',0,'declined'),
  ('d2222222-2222-2222-2222-222222222222','c4444444-4444-4444-4444-444444444444',0,'declined'),
  ('d1111111-1111-1111-1111-111111111111','c5555555-5555-5555-5555-555555555555',0,'accepted'),
  ('d2222222-2222-2222-2222-222222222222','c5555555-5555-5555-5555-555555555555',0,'accepted'),
  ('d1111111-1111-1111-1111-111111111111','c6666666-6666-6666-6666-666666666666',0,'accepted'),
  ('d2222222-2222-2222-2222-222222222222','c6666666-6666-6666-6666-666666666666',0,'expired'),
  -- at-cap provider: 3 live (pending) offers == concurrent_offer_cap default
  ('d1111111-1111-1111-1111-111111111111','caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',0,'pending'),
  ('d2222222-2222-2222-2222-222222222222','caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',0,'pending'),
  ('d3333333-3333-3333-3333-333333333333','caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',0,'pending');

-- the target request everyone is scored against (no offers on it yet)
insert into public.requests (id, requester_id, category, title, status, dispatch_mode) values
  ('11111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','Target','finding','quote');

-- ---- price is not an input anywhere in the score ----
select ok( not (factors ? 'price') and not (factors->'weights' ? 'wPrice') and not (factors->'weights' ? 'price'),
  'price appears in no ranker factor or weight')
  from public.rank_providers('11111111-1111-1111-1111-111111111111')
  where provider_id = 'c2222222-2222-2222-2222-222222222222';

-- ---- Bayesian smoothing (§3): 50 @ 4.8 beats 1 @ 5.0 ----
select cmp_ok(
  public.ranker_bayesian_rating('c2222222-2222-2222-2222-222222222222','water'), '>',
  public.ranker_bayesian_rating('c1111111-1111-1111-1111-111111111111','water'),
  'a long 4.8 record outranks a single 5-star (Bayesian, not raw mean)');
select is(round(public.ranker_bayesian_rating('c1111111-1111-1111-1111-111111111111','water'),4), 0.9273,
  'thin 1x5.0 record is smoothed toward the prior');
select is(round(public.ranker_bayesian_rating('c2222222-2222-2222-2222-222222222222','water'),4), 0.9533,
  'established 50x4.8 record stays near its mean');

-- ---- cold-start: a brand-new provider gets a non-zero prior, not a zero ----
select cmp_ok(public.ranker_bayesian_rating('c3333333-3333-3333-3333-333333333333','water'), '>', 0::numeric,
  'a new provider inherits a non-zero rating prior');

-- ---- the gate filters with a reason for each cause ----
select is((select gate_reason from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='c7777777-7777-7777-7777-777777777777'),
          'credentials_expired', 'expired COI → credentials_expired');
select is((select gate_reason from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='c8888888-8888-8888-8888-888888888888'),
          'not_verified', 'unverified provider → not_verified');
select is((select gate_reason from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='c9999999-9999-9999-9999-999999999999'),
          'unavailable', 'offline provider → unavailable');
select is((select gate_reason from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='caaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
          'at_offer_cap', 'a provider at the concurrent-offer cap → at_offer_cap');

-- ---- eligible rows get a rank + score; gated rows get neither ----
select is((select (score is not null and rank_position is not null)
             from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='c2222222-2222-2222-2222-222222222222'),
          true, 'an eligible provider has a score and a rank position');
select is((select (score is null and rank_position is null)
             from public.rank_providers('11111111-1111-1111-1111-111111111111')
             where provider_id='c7777777-7777-7777-7777-777777777777'),
          true, 'a gated provider has null score and null rank');

-- ---- decline is free: a fast decline scores the same as a fast accept (§4.2) ----
select is(
  (select factors->>'S' from public.rank_providers('11111111-1111-1111-1111-111111111111')
     where provider_id='c4444444-4444-4444-4444-444444444444'),
  (select factors->>'S' from public.rank_providers('11111111-1111-1111-1111-111111111111')
     where provider_id='c5555555-5555-5555-5555-555555555555'),
  'a fast decline and a fast accept produce the same responsiveness');
select cmp_ok(
  (select (factors->>'S')::numeric from public.rank_providers('11111111-1111-1111-1111-111111111111')
     where provider_id='c5555555-5555-5555-5555-555555555555'), '>',
  (select (factors->>'S')::numeric from public.rank_providers('11111111-1111-1111-1111-111111111111')
     where provider_id='c6666666-6666-6666-6666-666666666666'),
  'ignoring an offer (expiry) lowers responsiveness below a responder');

-- ---- logging: dispatch_score_and_log writes the pass and returns the top ----
select is(public.dispatch_score_and_log('11111111-1111-1111-1111-111111111111'),
          'c2222222-2222-2222-2222-222222222222'::uuid,
          'the pass returns the top-ranked eligible provider');
select is((select gate_reason from public.ranker_scores
             where request_id='11111111-1111-1111-1111-111111111111'
               and provider_id='c7777777-7777-7777-7777-777777777777'),
          'credentials_expired',
          'a gated candidate is logged to ranker_scores with its reason');

select * from finish();
rollback;
