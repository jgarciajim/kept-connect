-- =============================================================================
-- Seed the 4 starter Pros' sub-job rates at the MOUNTAIN benchmark so the private
-- test has realistic "near you" estimates (median of verified Pros' flat prices)
-- and real quote pricing. DEMO DATA — env-gate / remove before a public launch,
-- same as 20260612165038_seed_catalog.sql.
--
-- Amounts are the mountain-adjusted benchmark (national typical × mountainFactor,
-- + snowAccessBump where applicable) computed from docs/kept-pricing-seed.json via
-- src/lib/pricing (optionBenchmark). Mountain Pros already quote mountain rates, so
-- the benchmark IS the realistic number — it is stored verbatim as each Pro's own
-- flat price, never re-multiplied. Only options with a known benchmark are seeded.
--
-- Idempotent: re-running updates the amount in place.
-- =============================================================================

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
