-- =============================================================================
-- Property details test (pgTAP). The onboarding columns (property_type,
-- access_notes) save under the owner's RLS and stay private to them.
-- =============================================================================
begin;
select plan(3);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','user_O', true, false),
  ('b1111111-1111-1111-1111-111111111111','user_B', true, false);

set local role authenticated;

set local request.jwt.claims = '{"sub":"user_O"}';
select lives_ok(
  $$ insert into public.properties (member_id, label, address_line, property_type, access_notes, is_default)
     values ('a1111111-1111-1111-1111-111111111111','Home','1 Main St','House','Gate code 4242', true) $$,
  'owner saves a property with type + access notes');
select is((select access_notes from public.properties where member_id='a1111111-1111-1111-1111-111111111111'),
  'Gate code 4242', 'the access notes are stored');

set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.properties)::int, 0, 'a bystander sees no properties');

select * from finish();
rollback;
