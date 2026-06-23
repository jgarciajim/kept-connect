-- =============================================================================
-- Provider verification test (pgTAP). Self-submit is provider-scoped; only an
-- admin can approve/reject; approval flips provider_profiles.verified.
-- =============================================================================
begin;
select plan(12);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_P',false,true, false),  -- provider applying
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','user_P2',false,true,false),  -- second provider
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false,false),  -- bystander
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_AD',false,false,true);  -- admin

insert into public.provider_profiles (member_id) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');

set local role authenticated;

-- provider submits an application
set local request.jwt.claims = '{"sub":"user_P"}';
select lives_ok(
  $$ select public.submit_verification(
       'Pat','Plumber','1990-01-01', true, 'mock_bg','mock_id','user_P/id.jpg',
       'Plumbing','PL-123','Acme Ins','2027-01-01',5,
       'user_P/w9.pdf','user_P/coi.pdf','user_P/license.jpg', true) $$,
  'provider submits a verification application');
select is((select count(*) from public.provider_verifications)::int, 1, 'provider sees their own application');

set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.provider_verifications)::int, 0, 'a bystander sees no applications');

-- second provider submits (for the reject path)
set local request.jwt.claims = '{"sub":"user_P2"}';
select public.submit_verification(
  'Erin','Electric','1988-05-05', true, 'mock_bg2','mock_id2','user_P2/id.jpg',
  'Electrical','EL-9','Beta Ins','2027-03-01',3,
  'user_P2/w9.pdf','user_P2/coi.pdf','user_P2/license.jpg', true);

-- a non-admin cannot approve, and verified stays false
set local request.jwt.claims = '{"sub":"user_P"}';
select throws_ok(
  $$ select public.approve_verification('cccccccc-cccc-cccc-cccc-cccccccccccc') $$,
  'admin only',
  'a non-admin cannot approve');
select is((select verified from public.provider_profiles where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'), false, 'still not verified');

-- admin reviews
set local request.jwt.claims = '{"sub":"user_AD"}';
select is((select count(*) from public.provider_verifications)::int, 2, 'admin sees all applications');
select lives_ok(
  $$ select public.approve_verification('cccccccc-cccc-cccc-cccc-cccccccccccc') $$,
  'admin approves provider P');
select lives_ok(
  $$ select public.reject_verification('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee','Blurry license photo') $$,
  'admin rejects provider P2');

select is((select status::text from public.provider_verifications where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'), 'verified', 'P application is verified');
select is((select verified from public.provider_profiles where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'), true, 'P profile shows the verified badge');
select is((select status::text from public.provider_verifications where member_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), 'rejected', 'P2 application is rejected');
select is((select reason from public.provider_verifications where member_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'), 'Blurry license photo', 'P2 has the rejection reason');

select * from finish();
rollback;
