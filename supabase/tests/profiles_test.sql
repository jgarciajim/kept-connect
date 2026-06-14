-- =============================================================================
-- Profiles isolation test (pgTAP). Proves:
--   * properties are owner-scoped (a member sees only their own)
--   * update_provider_profile edits the safe columns of the caller's own profile
--   * a provider can NO LONGER directly UPDATE provider_profiles (the prior hole
--     that let them self-set rating/verified is closed — privilege revoked)
-- Seeding runs as the table owner (RLS bypassed); assertions run as authenticated.
-- =============================================================================
begin;
select plan(7);

insert into public.members (id, clerk_user_id, is_requester, is_provider, display_name) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false,'Ann Req'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false,'Bo Req'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true, 'Vic Pro');

insert into public.provider_profiles (member_id, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', false, '{}');

insert into public.properties (member_id, label, address_line, is_default) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Home','14 Birch Lane',true);

set local role authenticated;

-- ===== properties are owner-scoped ==========================================
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.properties)::int, 1, 'A sees their one property');
select is((select address_line from public.properties limit 1), '14 Birch Lane', 'A reads their address');

set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.properties)::int, 0, 'B sees ZERO of A''s properties');

-- ===== safe provider self-edit via the RPC ==================================
set local request.jwt.claims = '{"sub":"user_V"}';
select lives_ok(
  $$ select public.update_provider_profile(p_online => true, p_trades => array['water']::public.category_key[]) $$,
  'V edits their own profile via the RPC');
select is(
  (select online from public.provider_profiles where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  true, 'the online toggle persisted');
select is(
  (select 'water'::public.category_key = any(trades) from public.provider_profiles where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  true, 'the trade edit persisted');

-- ===== the trust-column hole is closed ======================================
select throws_ok(
  $$ update public.provider_profiles set verified = true where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc' $$,
  '42501',
  'permission denied for table provider_profiles',
  'V can NO LONGER directly update provider_profiles (verified is not self-settable)');

select * from finish();
rollback;
