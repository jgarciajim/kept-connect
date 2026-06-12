-- =============================================================================
-- D12 marketplace isolation test (pgTAP). Proves the new tables' RLS:
--   * a provider sees only their OWN quote, never a competitor's
--   * a requester is blind to provider payouts
--   * provider_profiles + provider-subject reviews are a PUBLIC trust surface
--   * messages/quotes/offers are strictly party-scoped
--   * the SECURITY DEFINER helpers don't reintroduce RLS recursion
-- Seeding runs as the table owner (RLS bypassed); assertions run as `authenticated`
-- with a per-member JWT.
-- =============================================================================
begin;
select plan(25);

-- ---- members: A,B requesters · V,D,W providers ------------------------------
insert into public.members (id, clerk_user_id, is_requester, is_provider, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false,'Ann Req'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false,'Bo Req'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true, 'Vic Pro'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_D',false,true, 'Dee Pro'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_W',false,true, 'Wes Pro');

insert into public.provider_profiles (member_id, rating, jobs_done, verified) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',4.9,120,true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd',4.7,40, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',5.0,30, true);

-- ---- requests: rA (owner A), rB (owner B) -----------------------------------
insert into public.requests (id, requester_id, category, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Leak','quoted'),
  ('22222222-2222-2222-2222-222222222222','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','structure','Drywall','finding');

-- grants: V and W can see rA; D has none --------------------------------------
insert into public.job_grants (request_id, provider_id) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

-- two competing quotes on rA (V and W) ----------------------------------------
insert into public.quotes (request_id, provider_id, price) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',295.00),
  ('11111111-1111-1111-1111-111111111111','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',340.00);

-- one offer to V on rA --------------------------------------------------------
insert into public.offers (request_id, provider_id, pay) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',120.00);

-- two messages on rA (A and V) ------------------------------------------------
insert into public.messages (request_id, sender_id, body) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Hi'),
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc','On my way');

-- reviews: public (about provider V) + party-scoped (about requester A) --------
insert into public.reviews (request_id, author_id, subject_id, subject_role, stars) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','cccccccc-cccc-cccc-cccc-cccccccccccc','provider',5),
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','requester',5);

-- one payout for V ------------------------------------------------------------
insert into public.payouts (provider_id, amount, status) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc',120.00,'paid');

-- ===== Requester A (owns rA) =================================================
set local role authenticated;
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.quotes)::int, 2, 'A (owner) sees BOTH quotes on their request');
select is((select count(*) from public.offers)::int, 1, 'A (owner) sees the offer on their request');
select is((select count(*) from public.messages)::int, 2, 'A sees the full thread on their request');
select is((select count(*) from public.payouts)::int, 0, 'A (requester) is BLIND to provider payouts');
select is((select count(*) from public.provider_profiles where member_id in ('cccccccc-cccc-cccc-cccc-cccccccccccc','dddddddd-dddd-dddd-dddd-dddddddddddd','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'))::int, 3, 'A sees the public provider catalog');
select is((select count(*) from public.reviews where subject_id='cccccccc-cccc-cccc-cccc-cccccccccccc' and subject_role='provider')::int, 1, 'A sees the public provider review');
select is((select count(*) from public.reviews where subject_role='requester')::int, 1, 'A (party) sees the review written about them');

-- ===== Provider V (granted rA, quoted) ======================================
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.quotes)::int, 1, 'V sees ONLY their own quote, never a competitor''s');
select is((select count(*) from public.requests)::int, 1, 'V sees only the granted request');
select is((select count(*) from public.requests where id='22222222-2222-2222-2222-222222222222')::int, 0, 'V sees ZERO of B''s request');
select is((select count(*) from public.offers)::int, 1, 'V sees their own offer');
select is((select count(*) from public.messages)::int, 2, 'V (party) sees the thread');
select is((select count(*) from public.payouts)::int, 1, 'V sees their own payout');
select is((select count(*) from public.provider_profiles where member_id in ('cccccccc-cccc-cccc-cccc-cccccccccccc','dddddddd-dddd-dddd-dddd-dddddddddddd','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'))::int, 3, 'V sees the public catalog');

-- ===== Provider D (no grants) ===============================================
set local request.jwt.claims = '{"sub":"user_D"}';
select is((select count(*) from public.requests)::int, 0, 'D (ungranted) sees zero requests');
select is((select count(*) from public.quotes)::int, 0, 'D sees zero quotes');
select is((select count(*) from public.messages)::int, 0, 'D sees zero messages');
select is((select count(*) from public.payouts)::int, 0, 'D sees zero payouts');
select is((select count(*) from public.provider_profiles where member_id in ('cccccccc-cccc-cccc-cccc-cccccccccccc','dddddddd-dddd-dddd-dddd-dddddddddddd','eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'))::int, 3, 'D can still browse the public catalog');

-- ===== Requester B (owns rB, unrelated to rA) ===============================
set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.quotes)::int, 0, 'B sees zero quotes (none on rB, blind to rA)');
select is((select count(*) from public.messages)::int, 0, 'B sees zero of A''s messages');
select is((select count(*) from public.payouts)::int, 0, 'B is blind to provider payouts');
select is((select count(*) from public.reviews where subject_role='requester')::int, 0, 'B does NOT see the party-scoped review about A');

-- ===== Recursion smoke — the new tables must not loop in policy =============
select lives_ok($$ select * from public.quotes $$,   'no RLS recursion on quotes');
select lives_ok($$ select * from public.messages $$, 'no RLS recursion on messages');

select * from finish();
rollback;
