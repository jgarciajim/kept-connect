-- =============================================================================
-- Sub-job pricing test (pgTAP). Owner-only RLS; the model CHECK constraint across
-- flat/per_unit/quote; the provider_services view; the '__other' catch-all = quote.
-- =============================================================================
begin;
select plan(14);

insert into public.members (id, clerk_user_id, is_requester, is_provider) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','user_P',false,true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','user_B',true, false);
insert into public.provider_profiles (member_id, verified, online, trades) values
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', false, false, '{structure,surfaces}');

set local role authenticated;
set local request.jwt.claims = '{"sub":"user_P"}';

-- valid models insert
select lives_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model,amount)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','handyman','drywall-patch','flat',95) $$,
  'a flat sub-job rate inserts');
select lives_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model,amount,unit)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','flooring','new-install','per_unit',3.50,'sqft') $$,
  'a per-unit sub-job rate inserts');
select lives_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','handyman','__other','quote') $$,
  'the __other quote catch-all inserts');

-- tiered model: parent has no amount; bands live in provider_subjob_tiers
select lives_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','painting','interior-room','tiered') $$,
  'a tiered sub-job rate inserts (amount null)');
select lives_ok(
  $$ insert into public.provider_subjob_tiers(member_id,service_slug,option_slug,label,amount,sort) values
       ('cccccccc-cccc-cccc-cccc-cccccccccccc','painting','interior-room','Small room',180,0),
       ('cccccccc-cccc-cccc-cccc-cccccccccccc','painting','interior-room','Large room',320,1) $$,
  'tier bands insert under the tiered sub-job');
select is((select count(*) from public.provider_subjob_tiers)::int, 2, 'both tier bands are stored');

-- model CHECK violations (23514 = check_violation)
select throws_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','handyman','door-repair','flat') $$,
  '23514', NULL, 'a flat rate WITHOUT an amount is rejected');
select throws_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model,amount)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','flooring','tile','per_unit',4) $$,
  '23514', NULL, 'a per-unit rate WITHOUT a unit is rejected');
select throws_ok(
  $$ insert into public.provider_subjob_rates(member_id,service_slug,option_slug,price_model,amount)
     values ('cccccccc-cccc-cccc-cccc-cccccccccccc','handyman','caulking','quote',50) $$,
  '23514', NULL, 'a quote rate WITH an amount is rejected');

-- provider_services view = the distinct services they priced (handyman, flooring, painting)
select is((select count(distinct service_slug) from public.provider_services)::int, 3,
  'provider_services lists the 3 services they priced a sub-job in');
select is((select price_model::text from public.provider_subjob_rates where option_slug = '__other'),
  'quote', 'the __other catch-all is stored as a quote');

-- owner-only RLS: a bystander sees nothing
set local request.jwt.claims = '{"sub":"user_B"}';
select is((select count(*) from public.provider_subjob_rates)::int, 0, 'a bystander sees no sub-job rates');
select is((select count(*) from public.provider_services)::int, 0, 'a bystander sees no provider_services');
select is((select count(*) from public.provider_subjob_tiers)::int, 0, 'a bystander sees no tier bands');

select * from finish();
rollback;
