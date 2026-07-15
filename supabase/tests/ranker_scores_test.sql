-- =============================================================================
-- Ranker score logging test (pgTAP). log_ranker_score writes eligible AND gated
-- rows; a requester sees passes on their own request; a non-party sees none;
-- price never appears (the row has no price column — structural guarantee).
-- =============================================================================
begin;
select plan(7);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_W',false,true);

insert into public.requests (id, requester_id, category, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Leak','finding');

-- the dispatch loop logs a pass: one eligible scored provider + one gated one.
select lives_ok(
  $$ select public.log_ranker_score(
       '11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',
       0.8123,
       '{"R":0.9,"C":0.8,"P":0.7,"A":1.0,"S":1.0,"weights":{"wR":0.30,"wC":0.30,"wP":0.20,"wA":0.15,"wS":0.05},"bayes_m":10}'::jsonb,
       true, null, false, 1) $$,
  'log_ranker_score writes an eligible, scored row');

select lives_ok(
  $$ select public.log_ranker_score(
       '11111111-1111-1111-1111-111111111111','dddddddd-dddd-dddd-dddd-dddddddddddd',
       null, '{}'::jsonb, false, 'credentials_expired', false, null) $$,
  'log_ranker_score writes a gated row with a reason and a null score');

select is((select count(*) from public.ranker_scores)::int, 2, 'both passes are logged (eligible + gated)');
select is((select gate_reason from public.ranker_scores where eligible = false),
          'credentials_expired', 'the gate reason is recorded for the filtered candidate');

set local role authenticated;

-- the owning requester sees both scoring rows on their request
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.ranker_scores)::int, 2, 'owning requester sees the scoring pass');

-- the scored provider sees their own row
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.ranker_scores where provider_id = public.current_member_id())::int,
          1, 'a provider sees their own ranker row');

-- a non-party requester sees nothing
set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.ranker_scores)::int, 0, 'a non-party sees no ranker rows');

select * from finish();
rollback;
