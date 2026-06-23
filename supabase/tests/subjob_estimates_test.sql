-- =============================================================================
-- Sub-job estimate test (pgTAP). subjob_price_estimates() exposes ONLY an
-- aggregate (low/median/high + count) over VERIFIED pros' active FLAT rates — a
-- requester gets the "near you" number without being able to read any individual
-- rate (owner-only RLS stays intact). Non-flat models never produce an estimate.
-- =============================================================================
begin;
select plan(5);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('a1111111-1111-1111-1111-111111111111','user_A', true, false),
  ('c1111111-1111-1111-1111-111111111111','user_V1',false,true),
  ('c2222222-2222-2222-2222-222222222222','user_V2',false,true),
  ('c3333333-3333-3333-3333-333333333333','user_V3',false,true);

insert into public.provider_profiles (member_id, verified, online, trades) values
  ('c1111111-1111-1111-1111-111111111111', true,  true,  '{water}'),
  ('c2222222-2222-2222-2222-222222222222', true,  false, '{water}'),
  ('c3333333-3333-3333-3333-333333333333', false, true,  '{water}');  -- unverified → excluded

insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model, amount) values
  ('c1111111-1111-1111-1111-111111111111','plumbing','leak-repair','flat',150),
  ('c2222222-2222-2222-2222-222222222222','plumbing','leak-repair','flat',250),
  ('c3333333-3333-3333-3333-333333333333','plumbing','leak-repair','flat',999);  -- unverified, excluded
insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model, amount, unit) values
  ('c1111111-1111-1111-1111-111111111111','plumbing','clogged-drain','per_unit',5,'hour');  -- non-flat
insert into public.provider_subjob_rates (member_id, service_slug, option_slug, price_model) values
  ('c1111111-1111-1111-1111-111111111111','plumbing','__other','quote');  -- non-flat

set local role authenticated;
set local request.jwt.claims = '{"sub":"user_A"}';

select is((select n from public.subjob_price_estimates() where service_slug='plumbing' and option_slug='leak-repair'),
  2, 'the estimate counts only the 2 verified pros (unverified excluded)');
select is((select mid from public.subjob_price_estimates() where service_slug='plumbing' and option_slug='leak-repair'),
  200.00, 'median of 150 & 250 is 200');
select is((select low from public.subjob_price_estimates() where service_slug='plumbing' and option_slug='leak-repair'),
  150.00, 'low is 150');
select is((select count(*) from public.subjob_price_estimates() where option_slug in ('clogged-drain','__other'))::int,
  0, 'per-unit and quote sub-jobs produce no flat estimate');

-- privacy: the requester gets the aggregate but cannot read individual rates
select is((select count(*) from public.provider_subjob_rates)::int, 0,
  'the requester cannot read raw provider rates — only the aggregate RPC');

select * from finish();
rollback;
