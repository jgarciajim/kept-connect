-- =============================================================================
-- Guildry — LOCAL / DEV seed (env-gate for demo data).
--
-- This file is loaded by `supabase db reset` (config.toml [db.seed] sql_paths)
-- and is NEVER run by `supabase db push`. That is the gate: all demo/test data
-- lives here, so a fresh *production* `db push` gets schema + functions only —
-- no synthetic Pros, reviews, catalog, or rates auto-injected (the trap called
-- out in docs/go-live.md Phase 2).
--
-- Where the demo data IS wanted (local dev, pgTAP, and the current hosted TEST
-- project) it is loaded intentionally:
--   * local  — automatically, on every `supabase db reset`.
--   * hosted test — the rows are already present (seeded by the original
--     migrations before they were slimmed to schema-only); to re-seed a fresh
--     environment on purpose, run this file against it once:
--       psql "$DATABASE_URL" -f supabase/seed.sql
--
-- Idempotent: safe to run more than once (on-conflict / empty-guards throughout).
-- Keep in sync with src/lib/requester/services.ts (slugs) + docs/kept-pricing-seed.json.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Public catalog — synthetic Pros visible to every authenticated user, plus the
-- reviewer members and public reviews shown on their profiles.
-- ----------------------------------------------------------------------------
insert into public.members (id, clerk_user_id, is_provider, display_name) values
  ('10000000-0000-0000-0000-000000000001','seed_provider_marco', true,'Marco Reyes'),
  ('10000000-0000-0000-0000-000000000002','seed_provider_summit',true,'Summit Drywall'),
  ('10000000-0000-0000-0000-000000000003','seed_provider_vega',  true,'A. Vega Finishes'),
  ('10000000-0000-0000-0000-000000000004','seed_provider_peak',  true,'Peak Interiors')
on conflict (id) do nothing;

insert into public.members (id, clerk_user_id, is_requester, display_name) values
  ('20000000-0000-0000-0000-000000000001','seed_reviewer_priya', true,'Priya N.'),
  ('20000000-0000-0000-0000-000000000002','seed_reviewer_theo',  true,'Theo V.'),
  ('20000000-0000-0000-0000-000000000003','seed_reviewer_dana',  true,'Dana L.'),
  ('20000000-0000-0000-0000-000000000004','seed_reviewer_marcus',true,'Marcus B.')
on conflict (id) do nothing;

insert into public.provider_profiles
  (member_id, display_name, rating, jobs_done, years_on_kept, verified, online, credentials, trades, trade_labels) values
  ('10000000-0000-0000-0000-000000000001','Marco Reyes',4.9,212,4,true,true,
   array['Licensed','Insured','Background checked'], array['water']::public.category_key[], array['Plumbing','Drains','Water heater']),
  ('10000000-0000-0000-0000-000000000002','Summit Drywall',4.9,128,5,true,false,
   array['Licensed','Insured','Background checked'], array['structure']::public.category_key[], array['Drywall','Plaster','Texture & finish']),
  ('10000000-0000-0000-0000-000000000003','A. Vega Finishes',4.8,74,3,true,false,
   array['Licensed','Background checked'], array['structure','surfaces']::public.category_key[], array['Drywall','Painting']),
  ('10000000-0000-0000-0000-000000000004','Peak Interiors',5.0,41,2,true,false,
   array['Insured'], array['structure']::public.category_key[], array['Drywall','Carpentry'])
on conflict (member_id) do nothing;

insert into public.provider_wallets (member_id, available_to_cashout, week_total, week_jobs) values
  ('10000000-0000-0000-0000-000000000001',340.00,3180.00,14)
on conflict (member_id) do nothing;

-- provider-subject reviews (public trust content; null request_id = imported).
-- Delete-then-insert keyed on the seed reviewer ids so re-runs don't duplicate.
delete from public.reviews
  where request_id is null
    and author_id in ('20000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002',
                      '20000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000004');
insert into public.reviews (request_id, author_id, author_name, subject_id, subject_role, stars, body, created_at) values
  (null,'20000000-0000-0000-0000-000000000001','Priya N.','10000000-0000-0000-0000-000000000001','provider',5,
   'Fixed a stubborn leak fast and left the cabinet cleaner than he found it. Walked me through what went wrong.', now() - interval '14 days'),
  (null,'20000000-0000-0000-0000-000000000002','Theo V.','10000000-0000-0000-0000-000000000001','provider',5,
   'On time, clear quote, no upsell. Exactly what you want when a stranger is in your home.', now() - interval '30 days'),
  (null,'20000000-0000-0000-0000-000000000003','Dana L.','10000000-0000-0000-0000-000000000002','provider',5,
   'Patched a ceiling so well you can''t tell where the damage was. Tidy and careful.', now() - interval '21 days'),
  (null,'20000000-0000-0000-0000-000000000004','Marcus B.','10000000-0000-0000-0000-000000000002','provider',5,
   'Clear sealed quote, started when they said, cleaned up after. No surprises.', now() - interval '30 days');

-- ----------------------------------------------------------------------------
-- Instant fixed-price catalog — the /app/book tiles. service_slug/option_slug
-- map each to the provider-rate taxonomy (see 20260702090000); baked in here so
-- the rows are complete on a from-scratch reset. Seed only when empty.
-- ----------------------------------------------------------------------------
insert into public.services (category, name, base_price, service_slug, option_slug)
select * from (values
  ('water'::public.category_key,   'Replace toilet valve',      95.00, 'plumbing',   'toilet-repair'),
  ('water'::public.category_key,   'Replace toilet',           260.00, 'plumbing',   'toilet-repair'),
  ('water'::public.category_key,   'Install garbage disposal', 180.00, 'plumbing',   'garbage-disposal'),
  ('water'::public.category_key,   'Swap a faucet',            140.00, 'plumbing',   'faucet-repair-or-replace'),
  ('power'::public.category_key,   'Install an outlet',        120.00, 'electrical', 'outlet-or-switch'),
  ('power'::public.category_key,   'Swap a light fixture',     110.00, 'electrical', 'light-fixture-install'),
  ('climate'::public.category_key, 'Replace a thermostat',     130.00, 'heating',    'thermostat-install'),
  ('care'::public.category_key,    'Standard home cleaning',   150.00, null,         null)
) as v(category, name, base_price, service_slug, option_slug)
where not exists (select 1 from public.services);

-- ----------------------------------------------------------------------------
-- Starter-Pro sub-job rates at the mountain benchmark (realistic "near you"
-- estimates + instant-offer pricing). Verbatim from the mountain benchmark —
-- never re-multiplied. Idempotent via upsert.
-- ----------------------------------------------------------------------------
insert into public.provider_subjob_rates
  (member_id, service_slug, option_slug, price_model, amount, active)
values
  ('10000000-0000-0000-0000-000000000001','plumbing','leak-repair','flat',700.00,true),
  ('10000000-0000-0000-0000-000000000001','plumbing','clogged-drain','flat',280.00,true),
  ('10000000-0000-0000-0000-000000000001','plumbing','faucet-repair-or-replace','flat',420.00,true),
  ('10000000-0000-0000-0000-000000000001','plumbing','toilet-repair','flat',280.00,true),
  ('10000000-0000-0000-0000-000000000001','plumbing','water-heater','flat',560.00,true),
  ('10000000-0000-0000-0000-000000000001','plumbing','garbage-disposal','flat',560.00,true),
  ('10000000-0000-0000-0000-000000000002','handyman','mount-tv-or-shelves','flat',280.00,true),
  ('10000000-0000-0000-0000-000000000002','handyman','drywall-patch','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000002','handyman','door-repair','flat',350.00,true),
  ('10000000-0000-0000-0000-000000000002','handyman','furniture-assembly','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000002','roofing','ice-dam-removal','flat',800.00,true),
  ('10000000-0000-0000-0000-000000000003','handyman','mount-tv-or-shelves','flat',280.00,true),
  ('10000000-0000-0000-0000-000000000003','handyman','drywall-patch','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000003','handyman','door-repair','flat',350.00,true),
  ('10000000-0000-0000-0000-000000000003','handyman','furniture-assembly','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000003','roofing','ice-dam-removal','flat',800.00,true),
  ('10000000-0000-0000-0000-000000000003','painting','interior-room','flat',873.60,true),
  ('10000000-0000-0000-0000-000000000003','painting','exterior','flat',5120.00,true),
  ('10000000-0000-0000-0000-000000000003','window-cleaning','interior-exterior','flat',350.00,true),
  ('10000000-0000-0000-0000-000000000004','handyman','mount-tv-or-shelves','flat',280.00,true),
  ('10000000-0000-0000-0000-000000000004','handyman','drywall-patch','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000004','handyman','door-repair','flat',350.00,true),
  ('10000000-0000-0000-0000-000000000004','handyman','furniture-assembly','flat',210.00,true),
  ('10000000-0000-0000-0000-000000000004','roofing','ice-dam-removal','flat',800.00,true)
on conflict (member_id, service_slug, option_slug) do update
  set price_model = excluded.price_model, amount = excluded.amount, active = excluded.active;
