-- =============================================================================
-- member_contact (pgTAP). Email comes from auth.users and is returned only to
-- the member themselves, an admin, or a counterparty — never to a stranger.
-- =============================================================================
begin;
select plan(5);

insert into auth.users (id, email, aud, role) values
  ('11111111-1111-1111-1111-111111111111', 'pat@example.com',  'authenticated', 'authenticated'),
  ('22222222-2222-2222-2222-222222222222', 'sam@example.com',  'authenticated', 'authenticated'),
  ('33333333-3333-3333-3333-333333333333', 'ada@example.com',  'authenticated', 'authenticated');

insert into public.members (id, auth_user_id, display_name, is_requester, is_admin) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Pat', true, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Sam', true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Ada', false, true);

set local role authenticated;

set local request.jwt.claims = '{"sub":"11111111-1111-1111-1111-111111111111"}';
select is((select email from public.member_contact('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')),
          'pat@example.com', 'a member can read their own email');
select is((select name from public.member_contact('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')),
          'Pat', 'name comes from members.display_name');
select is((select count(*) from public.member_contact('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'))::int,
          0, 'a stranger gets nothing');

set local request.jwt.claims = '{"sub":"33333333-3333-3333-3333-333333333333"}';
select is((select email from public.member_contact('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')),
          'sam@example.com', 'an admin can read any member''s email');

set local role anon;
set local request.jwt.claims = '{}';
select throws_ok($$ select * from public.member_contact('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') $$,
                 '42501', null, 'anonymous callers are refused');

select * from finish();
rollback;
