-- =============================================================================
-- Payments/escrow test (pgTAP). award_quote_paid opens a held escrow with the
-- split; mark_paid releases it (wallet credit + payout); parties see the payment,
-- others don't. Split numbers are the lib/pricing worked check (base $280, SEED).
-- =============================================================================
begin;
select plan(9);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','user_A',true, false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_V',false,true);

insert into public.provider_profiles (member_id, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','{water}');

insert into public.requests (id, requester_id, category, title, status) values
  ('11111111-1111-1111-1111-111111111111','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','water','Leak','finding');

insert into public.quotes (request_id, provider_id, price, status) values
  ('11111111-1111-1111-1111-111111111111','cccccccc-cccc-cccc-cccc-cccccccccccc',280.00,'open');

set local role authenticated;

-- requester pays & awards (split: all-in 30800, fee 2800, payout 28000, margin 770)
set local request.jwt.claims = '{"sub":"user_A"}';
select lives_ok(
  $$ select public.award_quote_paid(
       (select id from public.quotes where request_id='11111111-1111-1111-1111-111111111111'),
       30800, 2800, 28000, 770, 'mock_1') $$,
  'requester pays & awards → escrow opened');
select is((select status::text from public.payments where request_id='11111111-1111-1111-1111-111111111111'), 'held', 'payment is held');
select is((select payout_cents from public.payments where request_id='11111111-1111-1111-1111-111111111111'), 28000, 'net payout split recorded');

-- the granted provider (party) sees the payment
set local request.jwt.claims = '{"sub":"user_V"}';
select is((select count(*) from public.payments)::int, 1, 'provider (party) sees the payment');

-- provider marks paid → release
select lives_ok(
  $$ select public.mark_paid('11111111-1111-1111-1111-111111111111') $$,
  'provider marks paid → escrow released');
select is((select status::text from public.payments where request_id='11111111-1111-1111-1111-111111111111'), 'released', 'payment released');
select is((select available_to_cashout from public.provider_wallets where member_id='cccccccc-cccc-cccc-cccc-cccccccccccc'), 280.00, 'wallet credited the net payout');
select is((select amount from public.payouts where provider_id='cccccccc-cccc-cccc-cccc-cccccccccccc'), 280.00, 'a payout row was written');

-- a non-party sees nothing
set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.payments)::int, 0, 'a non-party sees no payments');

select * from finish();
rollback;
