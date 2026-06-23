-- =============================================================================
-- Notification preferences test (pgTAP). A muted category is suppressed for that
-- recipient; other categories and members (no prefs row = default on) still fire.
-- =============================================================================
begin;
select plan(5);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true);

insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', true, true, '{water}');
insert into public.provider_rates (member_id, service_slug, amount, rate_source) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','plumbing',175.00,'own');

insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','plumbing','Leak','finding');

set local role authenticated;

-- A mutes the Offers category.
set local request.jwt.claims = '{"sub":"user_A"}';
select public.set_notification_pref('offers', false);
select is((select offers from public.notification_preferences where member_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), false, 'offers muted for A');

-- V sends an offer → A's 'offer' notification is suppressed.
set local request.jwt.claims = '{"sub":"user_V"}';
select public.send_offer('11111111-1111-1111-1111-111111111111');
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.notifications)::int, 0, 'A gets no offer notification (muted)');

-- A awards → V (no prefs row) gets the awarded notification (default on).
select public.award_quote((select id from public.quotes where request_id='11111111-1111-1111-1111-111111111111'));
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.notifications)::int, 1, 'V (no prefs) still gets notifications');

-- V starts → A's job-updates category is not muted, so it delivers.
select public.start_job('11111111-1111-1111-1111-111111111111');
set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.notifications)::int, 1, 'A still gets job-update notifications');
select is((select type from public.notifications limit 1), 'enroute', 'the delivered one is the job update');

select * from finish();
rollback;
