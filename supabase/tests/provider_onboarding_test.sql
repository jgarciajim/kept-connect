-- =============================================================================
-- Provider onboarding test (pgTAP). Proves become_provider turns the CURRENT
-- member into an online provider (profile + wallet + is_provider) and touches
-- no one else.
-- =============================================================================
begin;
select plan(6);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false),  -- requester onboarding as a provider too
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false);  -- bystander

set local role authenticated;
set local request.jwt.claims = '{"sub":"user_A"}';

select lives_ok(
  $$ select public.become_provider('Casey Pro', array['water','power']::public.category_key[]) $$,
  'A completes onboarding as a provider');

select is(
  (select is_provider from public.members where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  true, 'members.is_provider is now true');
select is(
  (select 'water'::public.category_key = any(trades) from public.provider_profiles where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  true, 'provider_profiles has the chosen trade');
select is(
  (select online from public.provider_profiles where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
  false, 'the new provider starts OFFLINE — goes live only on approval');
select is(
  (select count(*) from public.provider_wallets where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')::int,
  1, 'a wallet row was created');

-- B (a different member) is untouched.
select is(
  (select count(*) from public.provider_profiles where member_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')::int,
  0, 'onboarding affected only the calling member');

select * from finish();
rollback;
