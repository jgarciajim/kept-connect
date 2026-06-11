-- =============================================================================
-- D11 isolation test (pgTAP) — the whole point of the foundation.
--
-- Proves grant-based isolation at the DATABASE layer: simulate distinct members
-- by setting request.jwt.claims to {"sub": ...} and assert that RLS lets each one
-- see ONLY what they should. Any unexpected (>0) cross-member row fails the build.
--
-- Run: `supabase db test` (also runs in CI on every push).
-- Seeding happens as the migration owner (RLS bypassed); assertions run as the
-- `authenticated` role with a per-member JWT, so RLS is fully in force.
-- =============================================================================
begin;
select plan(13);

-- ---- Seed (fixed UUIDs so we can reference rows directly in assertions) ------
insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_A', true,  false),  -- requester A
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_B', true,  false),  -- requester B
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'user_V', false, true ),  -- provider  V
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'user_D', false, true );  -- provider  D (no grants)

insert into public.requests (id, requester_id, trade, description) values
  ('11111111-1111-1111-1111-111111111111',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'plumbing',   'A: kitchen leak'),
  ('22222222-2222-2222-2222-222222222222',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'electrical', 'B: panel upgrade');

-- Grant provider V access to A's request ONLY. B's request is granted to nobody.
insert into public.job_grants (request_id, provider_id) values
  ('11111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc');

-- ===== Member A (requester, owns request rA) =================================
set local role authenticated;
set local request.jwt.claims = '{"sub":"user_A"}';

select is(
  (select count(*) from public.requests)::int, 1,
  'A sees exactly 1 request (their own)');
select is(
  (select count(*) from public.requests
     where id = '22222222-2222-2222-2222-222222222222')::int, 0,
  'A sees ZERO of B''s requests (no grant)');
select is(
  (select count(*) from public.members)::int, 1,
  'A sees only their own member row');
select is(
  (select count(*) from public.job_grants)::int, 1,
  'A (owning requester) sees the grant on their request');

-- ===== Member B (requester, owns request rB) ================================
set local request.jwt.claims = '{"sub":"user_B"}';

select is(
  (select count(*) from public.requests)::int, 1,
  'B sees exactly 1 request (their own)');
select is(
  (select count(*) from public.requests
     where id = '11111111-1111-1111-1111-111111111111')::int, 0,
  'B sees ZERO of A''s requests');
select is(
  (select count(*) from public.job_grants)::int, 0,
  'B has no grants and sees none (the grant is on A''s request)');

-- ===== Provider V (granted to rA only) ======================================
set local request.jwt.claims = '{"sub":"user_V"}';

select is(
  (select count(*) from public.requests)::int, 1,
  'V sees exactly 1 request (the one granted)');
select is(
  (select count(*) from public.requests
     where id = '11111111-1111-1111-1111-111111111111')::int, 1,
  'V sees rA — the granted request');
select is(
  (select count(*) from public.requests
     where id = '22222222-2222-2222-2222-222222222222')::int, 0,
  'V sees ZERO of B''s requests (never granted)');
select is(
  (select count(*) from public.job_grants)::int, 1,
  'V (granted provider) sees their own grant');

-- ===== Provider D (no grants at all) ========================================
set local request.jwt.claims = '{"sub":"user_D"}';

select is(
  (select count(*) from public.requests)::int, 0,
  'D (ungranted provider) sees ZERO requests');
select is(
  (select count(*) from public.job_grants)::int, 0,
  'D sees ZERO grants');

select * from finish();
rollback;
