-- =============================================================================
-- Provider loop — the classification spine + open-request visibility.
--
-- Closes the marketplace loop on real Supabase (ticket #6): a provider sets their
-- OWN rate (or opts into a benchmark, logged), browses OPEN requests in their
-- trade, and sends an offer — which persists as a `quote` (the requester-accepted
-- bid; `offers` here are the separate provider-accepted round-robin artifact). The
-- requester accepts via award_quote, which now writes the job_grant that gives the
-- provider visibility (D11 isolation, validated through the real UI).
--
-- Classification guardrail (kept-connect-dispatch-spec.md): the platform NEVER sets
-- a provider's price. Every offered price traces to provider_rates (the provider's
-- own row) or a logged benchmark opt-in. quotes.rate_source records the provenance.
--
-- Reuses the D11/D12 SECURITY DEFINER pattern (current_member_id / member_has_grant
-- / member_owns_request) so the policy dependency graph stays a DAG rooted at members.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enum + columns
-- ----------------------------------------------------------------------------
create type public.rate_source_kind as enum ('own','benchmark');

-- Provenance of an offered price — own rate or an opted-into benchmark.
alter table public.quotes add column rate_source public.rate_source_kind;

-- The catalog service slug behind a request (the 12 requester tiles). `category`
-- (8-family enum) drives trade matching/visibility; `service_slug` keys pricing
-- (provider_rates + the lib/pricing benchmark), which is finer-grained than category.
alter table public.requests add column service_slug text;

-- ----------------------------------------------------------------------------
-- provider_rates — provider-OWNED pricing per service. The offer reads from here,
-- never a platform table. rate_source records whether the amount is the provider's
-- own number or a benchmark they opted into (audit trail below).
-- ----------------------------------------------------------------------------
create table public.provider_rates (
  member_id      uuid not null references public.members(id) on delete cascade,
  service_slug   text not null,
  amount         numeric(10,2) not null,
  rate_source    public.rate_source_kind not null default 'own',
  effective_from timestamptz not null default now(),
  primary key (member_id, service_slug)
);

-- benchmark_optins — the classification audit trail: every benchmark opt-in is an
-- explicit, timestamped, versioned event. Append-only.
create table public.benchmark_optins (
  id                uuid primary key default gen_random_uuid(),
  member_id         uuid not null references public.members(id) on delete cascade,
  service_slug      text not null,
  benchmark_version text not null,
  opted_in_at       timestamptz not null default now()
);
create index benchmark_optins_member_idx on public.benchmark_optins (member_id);

-- ----------------------------------------------------------------------------
-- Helpers (SECURITY DEFINER) — break RLS recursion, scope to the current member.
-- ----------------------------------------------------------------------------

-- Does the current member provide this trade (category in their provider profile)?
create or replace function public.member_provides_trade(p_category public.category_key)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.provider_profiles p
    where p.member_id = public.current_member_id()
      and p_category = any (p.trades)
  )
$$;

-- Is this request OPEN (finding) and in the current member's trade? (the gate for
-- quoting an un-granted request — the new quote-before-grant supply path).
create or replace function public.request_is_open_in_my_trade(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.requests r
    join public.provider_profiles p on p.member_id = public.current_member_id()
    where r.id = p_request_id
      and r.status = 'finding'
      and r.category = any (p.trades)
  )
$$;

-- ----------------------------------------------------------------------------
-- RLS + privileges for the new tables
-- ----------------------------------------------------------------------------
alter table public.provider_rates   enable row level security;
alter table public.benchmark_optins enable row level security;

revoke all on public.provider_rates, public.benchmark_optins from anon;
grant select, insert, update on public.provider_rates   to authenticated;
grant select, insert         on public.benchmark_optins to authenticated;

-- provider_rates: owner-only (provider manages their own pricing).
create policy provider_rates_rw_own on public.provider_rates
  for all using (member_id = public.current_member_id())
          with check (member_id = public.current_member_id());

-- benchmark_optins: owner-only, append + read own.
create policy benchmark_optins_select_own on public.benchmark_optins
  for select using (member_id = public.current_member_id());
create policy benchmark_optins_insert_own on public.benchmark_optins
  for insert with check (member_id = public.current_member_id());

-- ----------------------------------------------------------------------------
-- New visibility: a provider may SELECT OPEN (finding) requests in their trade.
-- This is the supply feed. Tightly scoped: finding-only, in-trade-only — once a
-- request is awarded it leaves this policy, and only the granted provider keeps
-- visibility (via the existing member_has_grant policy). Additive (OR'd) with the
-- D11 owner/granted-provider select policies.
-- ----------------------------------------------------------------------------
create policy requests_select_open_for_trade_provider on public.requests
  for select using (
    status = 'finding'
    and category is not null
    and public.member_provides_trade(category)
  );

-- ----------------------------------------------------------------------------
-- Quoting an OPEN request pre-grant. Replaces the grant-required insert policy
-- with: provider may insert their own quote on a request that is either open in
-- their trade (new supply path) OR already granted to them (legacy path).
-- ----------------------------------------------------------------------------
drop policy quotes_insert_provider on public.quotes;
create policy quotes_insert_provider on public.quotes
  for insert with check (
    provider_id = public.current_member_id()
    and (
      public.request_is_open_in_my_trade(request_id)
      or public.member_has_grant(request_id)
    )
  );

-- ----------------------------------------------------------------------------
-- send_offer — provider sends an offer (priced from their OWN/opted rate) or a
-- custom sealed quote. Persists as a `quote` with rate_source. Asserts the request
-- is open and in the provider's trade. The price NEVER comes from a platform table.
-- ----------------------------------------------------------------------------
create or replace function public.send_offer(p_request_id uuid, p_custom_amount numeric default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me       uuid := public.current_member_id();
  r        public.requests;
  v_rate   public.provider_rates;
  v_amount numeric(10,2);
  v_source public.rate_source_kind;
  v_id     uuid;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.status <> 'finding' then raise exception 'request is not open'; end if;
  if not exists (
    select 1 from public.provider_profiles p
    where p.member_id = me and r.category = any (p.trades)
  ) then
    raise exception 'not in your trade';
  end if;

  if p_custom_amount is not null then
    v_amount := p_custom_amount;     -- a custom sealed quote is the provider's own number
    v_source := 'own';
  else
    select * into v_rate from public.provider_rates
      where member_id = me and service_slug = r.service_slug;
    if v_rate.member_id is null then
      raise exception 'no rate set for this service';
    end if;
    v_amount := v_rate.amount;
    v_source := v_rate.rate_source;  -- 'own' or a logged 'benchmark' opt-in
  end if;

  insert into public.quotes (request_id, provider_id, price, rate_source, status)
    values (p_request_id, me, v_amount, v_source, 'open')
    on conflict (request_id, provider_id) do update
      set price = excluded.price, rate_source = excluded.rate_source, status = 'open'
    returning id into v_id;
  return v_id;
end $$;

-- ----------------------------------------------------------------------------
-- Fix award_quote — on award, also write the job_grant so the accepted provider
-- gains request visibility (D11 isolation bridge). Without this the awarded job is
-- invisible to the provider. Idempotent. (Full redefinition.)
-- ----------------------------------------------------------------------------
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

  -- The isolation bridge: the accepted provider now sees this request.
  insert into public.job_grants (request_id, provider_id)
    values (q.request_id, q.provider_id)
    on conflict (request_id, provider_id) do nothing;

  update public.quotes set status = 'awarded' where id = q.id;
  update public.quotes set status = 'declined'
   where request_id = q.request_id and id <> q.id and status = 'open';
end $$;
