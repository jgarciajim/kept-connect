-- =============================================================================
-- D12 seed — public provider catalog + dev demo functions.
--
-- This ships seed/demo data in a migration ON PURPOSE so `supabase db push`
-- delivers it to the hosted project the app reads from. It is DEMO data — remove
-- (or gate behind an env) before a real launch.
--
--   * Public catalog: synthetic provider members + profiles + wallets + reviews,
--     visible to every authenticated user (the browse/quote/profile surface).
--   * seed_demo_for(sub) / seed_demo_provider_for(sub): a dev runs these once with
--     their own Clerk sub (Supabase SQL editor) to materialize the mock fixture on
--     their own account — needed because RLS shows a user only their OWN rows.
-- =============================================================================

-- Reviews may be imported/historical (no live request) → allow null request_id so
-- the public catalog can carry reviews without fabricating a request per review.
alter table public.reviews alter column request_id drop not null;

-- ----------------------------------------------------------------------------
-- Public catalog (fixed UUIDs; placeholder clerk ids that can never be a real sub)
-- ----------------------------------------------------------------------------
insert into public.members (id, clerk_user_id, is_provider, display_name) values
  ('10000000-0000-0000-0000-000000000001','seed_provider_marco', true,'Marco Reyes'),
  ('10000000-0000-0000-0000-000000000002','seed_provider_summit',true,'Summit Drywall'),
  ('10000000-0000-0000-0000-000000000003','seed_provider_vega',  true,'A. Vega Finishes'),
  ('10000000-0000-0000-0000-000000000004','seed_provider_peak',  true,'Peak Interiors')
on conflict (id) do nothing;

-- reviewer members (the authors shown on profiles)
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

-- provider-subject reviews (public trust content; null request_id = imported)
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
-- seed_demo_for(sub) — materialize the requester mock fixture on a real account.
-- Idempotent: clears the caller's prior demo requests first.
-- ----------------------------------------------------------------------------
create or replace function public.seed_demo_for(p_clerk_sub text)
returns void language plpgsql security definer set search_path = public as $$
declare
  m uuid;
  marco  uuid := '10000000-0000-0000-0000-000000000001';
  summit uuid := '10000000-0000-0000-0000-000000000002';
  vega   uuid := '10000000-0000-0000-0000-000000000003';
  peak   uuid := '10000000-0000-0000-0000-000000000004';
  r_enroute uuid;
  r_quoted  uuid;
begin
  insert into members (clerk_user_id, is_requester, display_name)
    values (p_clerk_sub, true, 'Demo User')
    on conflict (clerk_user_id) do update set is_requester = true
    returning id into m;

  delete from requests where requester_id = m;  -- idempotent re-run

  -- en-route job with Marco
  insert into requests (requester_id, requester_name, category, title, description, status, urgency, location_label, awarded_provider_id, agreed_price, eta_minutes)
    values (m,'Demo User','water','Leak under kitchen sink','Kitchen faucet is leaking at the base — water pooling under the sink.','enroute','same_day','14 Birch Lane', marco, 120.00, 12)
    returning id into r_enroute;
  insert into job_grants (request_id, provider_id) values (r_enroute, marco) on conflict do nothing;
  insert into messages (request_id, sender_id, body, has_photo, created_at) values
    (r_enroute, marco, 'Hi! On my way — about 12 minutes out. I''ll text when I''m parked.', false, now() - interval '20 min'),
    (r_enroute, m,     'Great, thanks. The leak is under the kitchen sink, cabinet on the left.', false, now() - interval '19 min'),
    (r_enroute, marco, 'Found it — the supply line fitting is cracked. Easy fix, I have the part.', true, now() - interval '2 min'),
    (r_enroute, m,     'Amazing. Go ahead.', false, now() - interval '1 min');

  -- quoted job with three sealed quotes
  insert into requests (requester_id, requester_name, category, title, description, status, urgency, location_label)
    values (m,'Demo User','structure','Drywall repair','Water-stained drywall on the hallway ceiling needs patching and repaint.','quoted','same_day','14 Birch Lane')
    returning id into r_quoted;
  insert into job_grants (request_id, provider_id) values (r_quoted, summit),(r_quoted, vega),(r_quoted, peak) on conflict do nothing;
  insert into quotes (request_id, provider_id, price, eta_label) values
    (r_quoted, summit, 295.00, 'Can start tomorrow'),
    (r_quoted, vega,   340.00, 'This week'),
    (r_quoted, peak,   410.00, 'Next week');
end $$;

-- ----------------------------------------------------------------------------
-- seed_demo_provider_for(sub) — make the caller a provider with an offer, an
-- awarded job, and payout history (the provider mock fixture).
-- ----------------------------------------------------------------------------
create or replace function public.seed_demo_provider_for(p_clerk_sub text)
returns void language plpgsql security definer set search_path = public as $$
declare
  m uuid;
  cust uuid;
  r_active uuid;
  r_offer  uuid;
begin
  insert into members (clerk_user_id, is_provider, display_name)
    values (p_clerk_sub, true, 'Marco Reyes')
    on conflict (clerk_user_id) do update set is_provider = true
    returning id into m;

  insert into provider_profiles (member_id, display_name, rating, jobs_done, years_on_kept, verified, online, credentials, trades, trade_labels)
    values (m, 'Marco Reyes', 4.9, 212, 4, true, true, array['Licensed','Insured','Background checked'], array['water']::category_key[], array['Plumbing','Drains','Water heater'])
    on conflict (member_id) do update set online = true, rating = 4.9, jobs_done = 212, verified = true, display_name = 'Marco Reyes';
  insert into provider_wallets (member_id, available_to_cashout, week_total, week_jobs)
    values (m, 340.00, 3180.00, 14)
    on conflict (member_id) do update set available_to_cashout = 340.00, week_total = 3180.00, week_jobs = 14;

  insert into members (clerk_user_id, is_requester, display_name)
    values ('seed_customer_sarah', true, 'Sarah K.')
    on conflict (clerk_user_id) do update set display_name = 'Sarah K.'
    returning id into cust;

  delete from requests where awarded_provider_id = m and requester_id = cust;
  delete from offers   where provider_id = m;
  delete from payouts  where provider_id = m;

  -- awarded/active job
  insert into requests (requester_id, requester_name, category, title, status, location_label, awarded_provider_id, agreed_price)
    values (cust,'Sarah K.','water','Faucet replacement','awarded','142 Ski Hill Rd · gate code in notes', m, 120.00)
    returning id into r_active;
  insert into job_grants (request_id, provider_id) values (r_active, m) on conflict do nothing;

  -- pending round-robin offer
  insert into requests (requester_id, requester_name, category, title, status, location_label)
    values (cust,'Sarah K.','water','Faucet replacement','finding','Breckenridge')
    returning id into r_offer;
  insert into job_grants (request_id, provider_id) values (r_offer, m) on conflict do nothing;
  insert into offers (request_id, provider_id, pay, note, status, respond_by, distance_label)
    values (r_offer, m, 120.00, 'est. 45 min · paid on completion', 'pending', now() + interval '45 seconds', '1.2 mi away');

  -- payout history
  insert into payouts (provider_id, job_label, payer_name, amount, status, created_at, paid_at) values
    (m,'Clear shower drain','Joan Ek',   120.00,'pending', now(),                  null),
    (m,'Faucet replacement','Priya Nair',180.00,'paid',    now() - interval '1 day', now() - interval '1 day'),
    (m,'Leak repair',       'Theo Vance',240.00,'paid',    now() - interval '3 day', now() - interval '3 day'),
    (m,'Water heater flush','Sam Cole',  160.00,'paid',    now() - interval '5 day', now() - interval '5 day');
end $$;
