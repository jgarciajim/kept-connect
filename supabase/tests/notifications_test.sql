-- =============================================================================
-- Notifications test (pgTAP). The transition RPCs notify the OTHER party; rows are
-- recipient-only (RLS), and mark_notifications_read clears the caller's unread.
-- =============================================================================
begin;
select plan(7);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true);

insert into public.provider_profiles (member_id, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', true, '{water}');
insert into public.provider_rates (member_id, service_slug, amount, rate_source) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','plumbing',175.00,'own');

insert into public.requests (id, requester_id, category, service_slug, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','plumbing','Leak','finding');

set local role authenticated;

-- V sends an offer → notifies the requester (A).
set local request.jwt.claims = '{"sub":"user_V"}';
select lives_ok(
  $$ select public.send_offer('11111111-1111-1111-1111-111111111111') $$,
  'V sends an offer');

set local request.jwt.claims = '{"sub":"user_A"}';
select is((select count(*) from public.notifications)::int, 1, 'A (requester) got one notification');
select is((select type from public.notifications limit 1), 'offer', 'it is an offer notification');

set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.notifications)::int, 0, 'V sees none of A''s notifications (recipient-only)');

-- A awards V's quote → notifies the provider (V).
set local request.jwt.claims = '{"sub":"user_A"}';
select lives_ok(
  $$ select public.award_quote((select id from public.quotes where request_id='11111111-1111-1111-1111-111111111111')) $$,
  'A awards the quote');

set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.notifications where type='awarded')::int, 1, 'V got the awarded notification');

-- A marks read.
set local request.jwt.claims = '{"sub":"user_A"}';
select public.mark_notifications_read();
select is((select count(*) from public.notifications where read_at is null)::int, 0, 'A has no unread after mark-read');

select * from finish();
rollback;
