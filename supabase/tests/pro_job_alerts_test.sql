-- =============================================================================
-- Pro job alerts (pgTAP):
--   * instant offers use the app_settings window (default 5 min), and the
--     window can be changed without a migration
--   * every instant offer creates a 'job_offer' notification for that Pro
--   * a quote job notifies matching VERIFIED Pros only ('new_job'), never the
--     wrong trade, an unverified Pro, or the customer themselves
--   * a Pro who muted "offers" gets no alert
--   * with no Vault secret configured, the email bridge is a silent no-op
-- =============================================================================
begin;
select plan(10);

insert into public.members (id, auth_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','user_A', true,  false),  -- customer
  ('c1111111-1111-1111-1111-111111111111','user_V1',false, true),   -- verified water pro
  ('c2222222-2222-2222-2222-222222222222','user_V2',false, true),   -- verified water pro, muted offers
  ('d1111111-1111-1111-1111-111111111111','user_W', false, true),   -- verified, wrong trade
  ('d2222222-2222-2222-2222-222222222222','user_U', false, true);   -- water, NOT verified

update public.provider_profiles set online = false, verified = false;  -- isolate from seed Pros
update public.ranker_config set exploration_epsilon = 0 where id = 1;

insert into public.provider_profiles (member_id, rating, jobs_done, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111',5.0,40,true, true, array['water']::public.category_key[]),
  ('c2222222-2222-2222-2222-222222222222',4.5,40,true, true, array['water']::public.category_key[]),
  ('d1111111-1111-1111-1111-111111111111',5.0,40,true, true, array['structure']::public.category_key[]),
  ('d2222222-2222-2222-2222-222222222222',5.0,40,false,true, array['water']::public.category_key[]);

insert into public.notification_preferences (member_id, offers) values
  ('c2222222-2222-2222-2222-222222222222', false);

insert into public.services (id, category, name, base_price, service_slug, option_slug) values
  ('51111111-1111-1111-1111-111111111111','water','Test fixed job',100.00,'plumbing','leak-repair');
insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model, amount) values
  ('c1111111-1111-1111-1111-111111111111','plumbing','leak-repair','flat',150.00);

-- ---- instant offer: 5-minute window + notification --------------------------------
insert into public.requests (id, requester_id, category, title, status, dispatch_mode, service_id) values
  ('11111111-1111-1111-1111-111111111111','a1111111-1111-1111-1111-111111111111','water','Leaky sink','finding','instant','51111111-1111-1111-1111-111111111111');

select ok((select respond_by from public.offers where request_id = '11111111-1111-1111-1111-111111111111')
          between now() + interval '299 seconds' and now() + interval '301 seconds',
  'instant offer window defaults to 5 minutes');

select is((select count(*) from public.notifications
            where member_id = 'c1111111-1111-1111-1111-111111111111' and type = 'job_offer')::int, 1,
  'the offered Pro gets a job_offer notification');
select ok((select body from public.notifications
            where member_id = 'c1111111-1111-1111-1111-111111111111' and type = 'job_offer') like 'Leaky sink · $150 · accept within 5 minutes',
  'the alert names the job, the pay and the time to accept');

-- The window is a setting: shorten it and the next offer uses it.
update public.app_settings set value = '90' where key = 'instant_offer_window_seconds';
update public.offers set respond_by = now() - interval '1 minute', status = 'expired'
  where request_id = '11111111-1111-1111-1111-111111111111';
delete from public.offers where request_id = '11111111-1111-1111-1111-111111111111';
select public.dispatch_next_offer('11111111-1111-1111-1111-111111111111');
select ok((select respond_by from public.offers where request_id = '11111111-1111-1111-1111-111111111111' and status = 'pending')
          between now() + interval '89 seconds' and now() + interval '91 seconds',
  'changing instant_offer_window_seconds changes the next offer''s window');

-- ---- quote job: fan-out to matching verified Pros ---------------------------------
delete from public.notifications;
insert into public.requests (id, requester_id, category, title, status, dispatch_mode, location_label) values
  ('22222222-2222-2222-2222-222222222222','a1111111-1111-1111-1111-111111111111','water','Replace water heater','finding','quote','Breckenridge');

select is((select count(*) from public.notifications
            where member_id = 'c1111111-1111-1111-1111-111111111111' and type = 'new_job')::int, 1,
  'a matching verified Pro is alerted to the quote job');
select is((select body from public.notifications
            where member_id = 'c1111111-1111-1111-1111-111111111111' and type = 'new_job'),
  'Replace water heater · Breckenridge', 'the alert names the job and the place');
select is((select count(*) from public.notifications where member_id = 'd1111111-1111-1111-1111-111111111111')::int, 0,
  'a Pro in another trade is not alerted');
select is((select count(*) from public.notifications where member_id = 'd2222222-2222-2222-2222-222222222222')::int, 0,
  'an unverified Pro is not alerted');
select is((select count(*) from public.notifications where member_id = 'c2222222-2222-2222-2222-222222222222')::int, 0,
  'a Pro who muted offers is not alerted');

-- ---- email bridge with no secret configured is a silent no-op ---------------------
select is((select count(*) from net.http_request_queue)::int, 0,
  'with no Vault secret, no email request is queued');

select * from finish();
rollback;
