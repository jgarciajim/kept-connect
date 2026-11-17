-- =============================================================================
-- Abuse guards (pgTAP): per-member rate limits, free-text caps, cron-only engine
-- functions, and the verification-docs upload limits.
-- =============================================================================
begin;
select plan(8);

insert into public.members (id, auth_user_id, is_requester) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'user_A', true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'user_B', true);

-- System writes (no JWT, e.g. pg_cron / seeds) are never limited.
insert into public.requests (requester_id, title)
  select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'seeded ' || g from generate_series(1, 12) g;
select pass('system writes skip the rate limit (12 rows inserted with no JWT)');
delete from public.requests;

set local role authenticated;
set local request.jwt.claims = '{"sub":"user_A"}';

-- 10 job posts in an hour are fine ...
select lives_ok(
  $$ insert into public.requests (requester_id, title)
     select 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'job ' || g from generate_series(1, 10) g $$,
  'a member can post 10 jobs in an hour');
-- ... the 11th is refused with the friendly message.
select throws_ok(
  $$ insert into public.requests (requester_id, title) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'job 11') $$,
  'P0429', 'Too many job posts in a short time. Please wait a bit and try again.',
  'the 11th job post within an hour is rate limited');

-- Limits are per member: B is unaffected by A.
set local request.jwt.claims = '{"sub":"user_B"}';
select lives_ok(
  $$ insert into public.requests (requester_id, title) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'first job') $$,
  'another member is not affected by someone else''s limit');

-- Free-text caps.
select throws_ok(
  $$ insert into public.requests (requester_id, title) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', repeat('x', 141)) $$,
  '23514', null, 'a 141-character job title is refused');
select throws_ok(
  $$ insert into public.requests (requester_id, title, description) values ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ok', repeat('x', 4001)) $$,
  '23514', null, 'a 4,001-character description is refused');

-- Engine internals are cron-only.
select throws_ok($$ select public.dispatch_tick() $$, '42501', null,
  'signed-in users cannot run the dispatch engine');

reset role;
select is((select file_size_limit from storage.buckets where id = 'verification-docs'), 10485760::bigint,
  'verification uploads are capped at 10 MB');

select * from finish();
rollback;
