-- =============================================================================
-- D12 — Marketplace data model + RLS.
--
-- Extends the D11 identity foundation (members/requests/job_grants) into the full
-- marketplace: provider profiles + wallets, quotes, round-robin offers, job-scoped
-- messages, two-sided reviews, payouts. Every cross-table policy reuses the D11
-- SECURITY DEFINER pattern (current_member_id / member_owns_request / member_has_grant)
-- to break RLS recursion — the new tables depend on `requests`, never the reverse,
-- so the policy dependency graph stays a DAG rooted at members.
--
-- Engines deferred (tables exist + seedable, logic stubbed): round-robin dispatch,
-- real payment/payout processing, rating recompute.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.category_key as enum
  ('water','power','climate','structure','surfaces','grounds','care','fixtures');

create type public.urgency_tier as enum ('whenever','same_day','emergency');

create type public.request_status as enum
  ('finding','quoted','awarded','enroute','complete','paid','rated','cancelled');

create type public.offer_status as enum ('pending','accepted','declined','expired','superseded');

create type public.quote_status as enum ('open','awarded','declined','withdrawn');

create type public.payout_status as enum ('pending','paid');

create type public.review_role as enum ('requester','provider');

-- ----------------------------------------------------------------------------
-- Extend members — human identity for threads / payouts / reviews. Contact info
-- (phone/email) is deliberately NEVER a column: that's the structural guarantee
-- behind the masked thread (no raw contact can leak if it isn't stored).
-- ----------------------------------------------------------------------------
alter table public.members
  add column display_name text,
  add column avatar_url   text;

-- ----------------------------------------------------------------------------
-- Extend requests — a request IS the job (no separate jobs table). Adds the
-- lifecycle. `category` (the 8-family enum, the wayfinding/color/dispatch key) is
-- added alongside the legacy `trade text`, whose NOT NULL is dropped so new
-- inserts use `category`. (Keeping `trade` avoids breaking the D11 isolation test,
-- which seeds `trade` literals.)
-- ----------------------------------------------------------------------------
alter table public.requests
  alter column trade drop not null,
  add column category            public.category_key,
  add column title               text,
  add column status              public.request_status not null default 'finding',
  add column urgency             public.urgency_tier   not null default 'same_day',
  add column location_label      text,
  add column location_lat        numeric(9,6),
  add column location_lng        numeric(9,6),
  add column awarded_provider_id uuid references public.members(id),
  add column awarded_quote_id    uuid,  -- FK omitted to avoid the requests<->quotes cycle; award goes through an RPC that validates the quote
  add column agreed_price        numeric(10,2),
  add column platform_fee_bps    int,   -- snapshot at award; the emergency tier sets a higher take-rate
  add column eta_minutes         int,
  add column completed_at        timestamptz,
  add column paid_at             timestamptz;

create index requests_status_idx           on public.requests (status);
create index requests_awarded_provider_idx on public.requests (awarded_provider_id);
create index requests_category_idx         on public.requests (category);

-- ----------------------------------------------------------------------------
-- provider_profiles — the PUBLIC trust surface (rating, credentials, trades).
-- Money lives in provider_wallets (owner-scoped), NOT here.
-- rating / jobs_done are denormalized caches (seeded; engine-recomputed later).
-- ----------------------------------------------------------------------------
create table public.provider_profiles (
  member_id     uuid primary key references public.members(id) on delete cascade,
  rating        numeric(2,1) not null default 0,
  jobs_done     int          not null default 0,
  years_on_kept int          not null default 0,
  verified      boolean      not null default false,
  online        boolean      not null default false,
  credentials   text[]               not null default '{}',
  trades        public.category_key[] not null default '{}',
  trade_labels  text[]               not null default '{}',
  created_at    timestamptz  not null default now()
);
create index provider_profiles_trades_idx on public.provider_profiles using gin (trades);

-- provider_wallets — owner-scoped money (split off the public profile so balances
-- never leak). Caches; the payment engine maintains them later.
create table public.provider_wallets (
  member_id            uuid primary key references public.members(id) on delete cascade,
  available_to_cashout numeric(10,2) not null default 0,
  week_total           numeric(10,2) not null default 0,
  week_jobs            int           not null default 0
);

-- quotes — a provider's sealed bid on a request (requires an existing grant).
create table public.quotes (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  provider_id uuid not null references public.members(id) on delete cascade,
  price       numeric(10,2) not null,
  eta_label   text,
  status      public.quote_status not null default 'open',
  created_at  timestamptz not null default now(),
  unique (request_id, provider_id)
);
create index quotes_request_id_idx  on public.quotes (request_id);
create index quotes_provider_id_idx on public.quotes (provider_id);

-- offers — round-robin dispatch (engine stubbed; rows seeded/created manually).
create table public.offers (
  id             uuid primary key default gen_random_uuid(),
  request_id     uuid not null references public.requests(id) on delete cascade,
  provider_id    uuid not null references public.members(id) on delete cascade,
  pay            numeric(10,2) not null,
  note           text,
  status         public.offer_status not null default 'pending',
  respond_by     timestamptz,
  distance_label text,
  created_at     timestamptz not null default now(),
  unique (request_id, provider_id)
);
create index offers_provider_status_idx on public.offers (provider_id, status);
create index offers_request_id_idx      on public.offers (request_id);

-- messages — job-scoped masked thread (a Thread IS a request; no thread table).
create table public.messages (
  id         uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  sender_id  uuid not null references public.members(id) on delete cascade,
  body       text not null,
  has_photo  boolean not null default false,
  created_at timestamptz not null default now()
);
create index messages_request_created_idx on public.messages (request_id, created_at);

-- reviews — two-sided (per request: requester rates provider, provider rates requester).
create table public.reviews (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.requests(id) on delete cascade,
  author_id    uuid not null references public.members(id),
  subject_id   uuid not null references public.members(id),
  subject_role public.review_role not null,
  stars        int not null check (stars between 1 and 5),
  body         text,
  created_at   timestamptz not null default now(),
  unique (request_id, author_id)
);
create index reviews_subject_idx on public.reviews (subject_id);
create index reviews_request_idx on public.reviews (request_id);

-- payouts — provider earnings (payment engine stubbed; labels denormalized so a
-- payout survives request deletion and leaks nothing extra to the provider).
create table public.payouts (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid references public.requests(id) on delete set null,
  provider_id uuid not null references public.members(id) on delete cascade,
  job_label   text,
  payer_name  text,
  amount      numeric(10,2) not null,
  status      public.payout_status not null default 'pending',
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);
create index payouts_provider_created_idx on public.payouts (provider_id, created_at);

-- ----------------------------------------------------------------------------
-- Helper: is the current member a party to this request? (owner OR granted
-- provider). Built from the two D11 definer helpers, so it inherits their
-- recursion-breaking property — it reads requests/job_grants as definer and
-- never re-enters the policies of quotes/messages/offers/reviews that call it.
-- ----------------------------------------------------------------------------
create or replace function public.member_is_party(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.member_owns_request(p_request_id)
      or public.member_has_grant(p_request_id)
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------
alter table public.provider_profiles enable row level security;
alter table public.provider_wallets  enable row level security;
alter table public.quotes            enable row level security;
alter table public.offers            enable row level security;
alter table public.messages          enable row level security;
alter table public.reviews           enable row level security;
alter table public.payouts           enable row level security;

-- ----------------------------------------------------------------------------
-- Table privileges (the TABLE gate; RLS is the ROW gate). authenticated only.
-- ----------------------------------------------------------------------------
revoke all on public.provider_profiles, public.provider_wallets, public.quotes,
  public.offers, public.messages, public.reviews, public.payouts from anon;

grant select, update         on public.provider_profiles to authenticated; -- update = self edit / online
grant select                 on public.provider_wallets  to authenticated; -- read own; engine writes
grant select, insert         on public.quotes            to authenticated;
grant select, insert, update on public.offers            to authenticated; -- update = accept/decline
grant select, insert         on public.messages          to authenticated;
grant select, insert         on public.reviews           to authenticated;
grant select                 on public.payouts           to authenticated; -- read own; engine writes

-- requests now also needs UPDATE (award + provider transitions go through RPCs,
-- but grant the privilege; the RPCs are SECURITY DEFINER and assert the role).
grant update on public.requests to authenticated;

-- ----------------------------------------------------------------------------
-- Policies — provider_profiles: public read (trust surface), self write.
-- ----------------------------------------------------------------------------
create policy provider_profiles_select_all on public.provider_profiles
  for select using (true);
create policy provider_profiles_insert_self on public.provider_profiles
  for insert with check (member_id = public.current_member_id());
create policy provider_profiles_update_self on public.provider_profiles
  for update using (member_id = public.current_member_id())
              with check (member_id = public.current_member_id());

-- provider_wallets: owner-only.
create policy provider_wallets_select_own on public.provider_wallets
  for select using (member_id = public.current_member_id());

-- quotes: requester (owner) sees all on their request; provider sees only OWN
-- quote (never a competitor's). Provider may quote only a granted request.
create policy quotes_select_party on public.quotes
  for select using (
    provider_id = public.current_member_id()
    or public.member_owns_request(request_id)
  );
create policy quotes_insert_provider on public.quotes
  for insert with check (
    provider_id = public.current_member_id()
    and public.member_has_grant(request_id)
  );

-- offers: provider sees own; owning requester sees offers on their request.
create policy offers_select_party on public.offers
  for select using (
    provider_id = public.current_member_id()
    or public.member_owns_request(request_id)
  );
create policy offers_insert_provider on public.offers
  for insert with check (
    provider_id = public.current_member_id()
    and public.member_has_grant(request_id)
  );
create policy offers_update_own on public.offers
  for update using (provider_id = public.current_member_id())
              with check (provider_id = public.current_member_id());

-- messages: both parties to the request.
create policy messages_select_party on public.messages
  for select using (public.member_is_party(request_id));
create policy messages_insert_party on public.messages
  for insert with check (
    sender_id = public.current_member_id()
    and public.member_is_party(request_id)
  );

-- reviews: provider-subject reviews are public (trust content); requester-subject
-- reviews are party-scoped. Author must be a party and themselves.
create policy reviews_select_public_or_party on public.reviews
  for select using (
    subject_role = 'provider'
    or public.member_is_party(request_id)
  );
create policy reviews_insert_party on public.reviews
  for insert with check (
    author_id = public.current_member_id()
    and public.member_is_party(request_id)
  );

-- payouts: provider-only (the requester is blind to provider earnings).
create policy payouts_select_own on public.payouts
  for select using (provider_id = public.current_member_id());

-- ----------------------------------------------------------------------------
-- Transition RPCs (SECURITY DEFINER). RLS is row-level, not column-level, so
-- state changes route through these to mutate ONLY the intended columns and
-- assert the caller's role — preventing e.g. a provider rewriting price/owner.
-- ----------------------------------------------------------------------------

-- Requester awards a sealed quote: request -> awarded; quote -> awarded.
create or replace function public.award_quote(p_quote_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare q public.quotes;
begin
  select * into q from public.quotes where id = p_quote_id;
  if q.id is null then raise exception 'quote not found'; end if;
  if not public.member_owns_request(q.request_id) then
    raise exception 'not authorized to award this request';
  end if;

  update public.requests
     set status = 'awarded',
         awarded_provider_id = q.provider_id,
         awarded_quote_id    = q.id,
         agreed_price        = q.price
   where id = q.request_id;

  update public.quotes set status = 'awarded' where id = q.id;
  update public.quotes set status = 'declined'
   where request_id = q.request_id and id <> q.id and status = 'open';
end $$;

-- Provider accepts a round-robin offer at the set rate: grant + award the request.
create or replace function public.accept_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare o public.offers;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.provider_id <> public.current_member_id() then
    raise exception 'not your offer';
  end if;

  update public.offers set status = 'accepted' where id = o.id;
  insert into public.job_grants (request_id, provider_id)
    values (o.request_id, o.provider_id)
    on conflict (request_id, provider_id) do nothing;
  update public.requests
     set status = 'awarded', awarded_provider_id = o.provider_id, agreed_price = o.pay
   where id = o.request_id;
end $$;

-- Provider transitions on their awarded job.
create or replace function public.start_job(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.requests set status = 'enroute'
   where id = p_request_id
     and awarded_provider_id = public.current_member_id()
     and status = 'awarded';
  if not found then raise exception 'cannot start this job'; end if;
end $$;

create or replace function public.complete_job(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.requests set status = 'complete', completed_at = now()
   where id = p_request_id
     and awarded_provider_id = public.current_member_id()
     and status = 'enroute';
  if not found then raise exception 'cannot complete this job'; end if;
end $$;

-- Mark paid — stub (no real money): flips status + records a paid payout row.
create or replace function public.mark_paid(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r public.requests;
begin
  select * into r from public.requests where id = p_request_id;
  if r.awarded_provider_id <> public.current_member_id() then
    raise exception 'not your job';
  end if;

  update public.requests set status = 'paid', paid_at = now() where id = r.id;
  insert into public.payouts (request_id, provider_id, job_label, amount, status, paid_at)
    values (r.id, r.awarded_provider_id, r.title, coalesce(r.agreed_price, 0), 'paid', now());
end $$;
