-- =============================================================================
-- Auth: Clerk -> Supabase Auth.
--
-- The JWT `sub` is now the Supabase auth.users.id (a uuid, as text) instead of a
-- Clerk user id. members.clerk_user_id is renamed to auth_user_id; RLS policies
-- reference the column by attnum, so they follow the rename automatically. SQL /
-- plpgsql function bodies are stored as text, so every function that names the
-- column is recreated here.
--
-- Existing members keep their old Clerk ids in auth_user_id until re-linked to
-- their new Supabase user (see supabase/scripts/relink-member.sql).
-- =============================================================================

alter table public.members rename column clerk_user_id to auth_user_id;
comment on column public.members.auth_user_id is
  'Supabase auth.users.id (text) — the JWT sub. Seed rows use seed_* placeholders.';

-- --- identity helpers --------------------------------------------------------
create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.members
  where auth_user_id = auth.jwt() ->> 'sub'
$$;

create or replace function public.current_member_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where auth_user_id = auth.jwt() ->> 'sub' and is_admin
  )
$$;

-- --- contact lookup: email now comes from auth.users --------------------------
-- Same authorization as the old member_clerk_id (admin / self / counterparty on
-- a shared request), but returns the email + display name directly.
drop function if exists public.member_clerk_id(uuid);

create or replace function public.member_contact(p_member_id uuid)
returns table (email text, name text)
language sql
stable
security definer
set search_path = public
as $$
  select u.email::text, m.display_name
  from public.members m
  join auth.users u on u.id::text = m.auth_user_id
  where m.id = p_member_id
    and (
      exists (
        select 1 from public.members me
        where me.auth_user_id = auth.jwt() ->> 'sub' and me.is_admin
      )
      or m.auth_user_id = auth.jwt() ->> 'sub'
      or exists (
        select 1 from public.requests r
        join public.members me on me.auth_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and r.awarded_provider_id = p_member_id)
           or (r.awarded_provider_id = me.id and r.requester_id = p_member_id)
      )
      or exists (
        select 1 from public.job_grants g
        join public.requests r on r.id = g.request_id
        join public.members me on me.auth_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and g.provider_id = p_member_id)
           or (g.provider_id = me.id and r.requester_id = p_member_id)
      )
      or exists (
        select 1 from public.offers o
        join public.requests r on r.id = o.request_id
        join public.members me on me.auth_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and o.provider_id = p_member_id)
           or (o.provider_id = me.id and r.requester_id = p_member_id)
      )
    )
$$;

revoke all on function public.member_contact(uuid) from public, anon;
grant execute on function public.member_contact(uuid) to authenticated;

-- --- opt-in demo helpers (dev only; defining them injects nothing) ------------
drop function if exists public.seed_demo_for(text);
drop function if exists public.seed_demo_provider_for(text);

create or replace function public.seed_demo_for(p_auth_sub text)
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
  insert into members (auth_user_id, is_requester, display_name)
    values (p_auth_sub, true, 'Demo User')
    on conflict (auth_user_id) do update set is_requester = true
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
create or replace function public.seed_demo_provider_for(p_auth_sub text)
returns void language plpgsql security definer set search_path = public as $$
declare
  m uuid;
  cust uuid;
  r_active uuid;
  r_offer  uuid;
begin
  insert into members (auth_user_id, is_provider, display_name)
    values (p_auth_sub, true, 'Marco Reyes')
    on conflict (auth_user_id) do update set is_provider = true
    returning id into m;

  insert into provider_profiles (member_id, display_name, rating, jobs_done, years_on_kept, verified, online, credentials, trades, trade_labels)
    values (m, 'Marco Reyes', 4.9, 212, 4, true, true, array['Licensed','Insured','Background checked'], array['water']::category_key[], array['Plumbing','Drains','Water heater'])
    on conflict (member_id) do update set online = true, rating = 4.9, jobs_done = 212, verified = true, display_name = 'Marco Reyes';
  insert into provider_wallets (member_id, available_to_cashout, week_total, week_jobs)
    values (m, 340.00, 3180.00, 14)
    on conflict (member_id) do update set available_to_cashout = 340.00, week_total = 3180.00, week_jobs = 14;

  insert into members (auth_user_id, is_requester, display_name)
    values ('seed_customer_sarah', true, 'Sarah K.')
    on conflict (auth_user_id) do update set display_name = 'Sarah K.'
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
