-- =============================================================================
-- Onboarding draft test (pgTAP). save_verification_draft persists a resumable
-- draft that stays 'unsubmitted' and OUT of the admin review queue; the final
-- submit_verification flips it to 'pending' (into the queue).
-- =============================================================================
begin;
select plan(5);

insert into public.members (id, clerk_user_id, is_requester, is_provider, is_admin) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_P', false,true, false),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd','user_AD',false,false,true);

set local role authenticated;

-- provider saves a draft mid-onboarding
set local request.jwt.claims = '{"sub":"user_P"}';
select lives_ok(
  $$ select public.save_verification_draft('Pat','Plumber','1990-01-01', true, 'user_P/id.jpg',
       'Plumbing','PL-1','Acme','2027-01-01',5,'user_P/w9.pdf','user_P/coi.pdf','user_P/lic.jpg') $$,
  'provider saves an onboarding draft');
select is((select status::text from public.provider_verifications where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'unsubmitted', 'the draft stays unsubmitted');

-- the draft is NOT in the admin review queue
set local request.jwt.claims = '{"sub":"user_AD"}';
select is((select count(*) from public.provider_verifications where status='pending')::int, 0,
  'a draft does NOT appear in the admin queue');

-- provider submits → flips to pending (into the queue)
set local request.jwt.claims = '{"sub":"user_P"}';
select lives_ok(
  $$ select public.submit_verification('Pat','Plumber','1990-01-01', true, 'mock_bg','mock_id','user_P/id.jpg',
       'Plumbing','PL-1','Acme','2027-01-01',5,'user_P/w9.pdf','user_P/coi.pdf','user_P/lic.jpg', true) $$,
  'provider submits the application');
select is((select status::text from public.provider_verifications where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'),
  'pending', 'submit flips the draft to pending');

select * from finish();
rollback;
