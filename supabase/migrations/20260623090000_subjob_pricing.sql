-- =============================================================================
-- Per-sub-job pricing — the provider classification spine, one level finer.
--
-- Today a provider prices per SERVICE (provider_rates). The onboarding funnel lets
-- a contractor pick a trade (a service: handyman, plumber…), select which SUB-JOBS
-- within it they perform (the service's `options` — Drywall patch, TV mount…), and
-- price EACH with a flexible model:
--   * flat     — a fixed fee ($95 drywall patch)
--   * per_unit — a rate × a unit ($3.50/sqft flooring, hourly for odd jobs)
--   * tiered   — small/medium/large bands (rows live in provider_subjob_tiers)
--   * quote    — "odd job / on-site quote", no fixed price
-- A reserved per-trade catch-all sub-job ('__other') is always a quote.
--
-- option_slug uses the existing optionSlug() kebab output (src/lib/requester/
-- services.ts); '__other' can never collide (that helper never emits a '__' prefix).
-- Owner-only RLS, mirroring provider_rates — self-pricing needs no SECURITY DEFINER.
-- provider_rates stays for the per-service benchmark/classification audit trail.
-- =============================================================================

create type public.price_model as enum ('flat', 'per_unit', 'tiered', 'quote');
create type public.rate_unit  as enum ('sqft', 'hour', 'linear_ft', 'room', 'item');

create table public.provider_subjob_rates (
  member_id      uuid not null references public.members(id) on delete cascade,
  service_slug   text not null,             -- a SERVICES[].slug (handyman, plumbing…)
  option_slug    text not null,             -- optionSlug(label), or '__other' catch-all
  price_model    public.price_model not null,
  amount         numeric(10,2),             -- flat fee OR per-unit rate; null for quote/tiered
  unit           public.rate_unit,          -- required for per_unit; null otherwise
  active         boolean not null default true,
  effective_from timestamptz not null default now(),
  primary key (member_id, service_slug, option_slug),
  constraint subjob_rate_model_ck check (
    case price_model
      when 'flat'     then amount is not null and unit is null
      when 'per_unit' then amount is not null and unit is not null
      when 'quote'    then amount is null     and unit is null
      when 'tiered'   then amount is null     and unit is null
    end
  )
);
create index provider_subjob_rates_member_idx  on public.provider_subjob_rates (member_id) where active;
create index provider_subjob_rates_service_idx on public.provider_subjob_rates (service_slug) where active;

-- Tiered bands (small/med/large). Ships now; the editor is a follow-up.
create table public.provider_subjob_tiers (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null,
  service_slug text not null,
  option_slug  text not null,
  label        text not null,
  amount       numeric(10,2) not null,
  sort         int not null default 0,
  foreign key (member_id, service_slug, option_slug)
    references public.provider_subjob_rates (member_id, service_slug, option_slug) on delete cascade
);
create index provider_subjob_tiers_parent_idx on public.provider_subjob_tiers (member_id, service_slug, option_slug);

-- The set of services a provider OFFERS = services they priced ≥1 active sub-job for.
-- Derived, so it never drifts. security_invoker → the querying member's RLS applies.
create view public.provider_services with (security_invoker = true) as
  select distinct member_id, service_slug
  from public.provider_subjob_rates
  where active;

-- A request may name the chosen sub-job (the requester composer captures `option`).
-- Drives finer offer pricing + (later) option-level tailoring. Null = service-level.
alter table public.requests add column option_slug text;

-- ----------------------------------------------------------------------------
-- RLS + privileges — owner manages their own pricing (mirror provider_rates).
-- ----------------------------------------------------------------------------
alter table public.provider_subjob_rates enable row level security;
alter table public.provider_subjob_tiers enable row level security;
revoke all on public.provider_subjob_rates, public.provider_subjob_tiers from anon;
grant select, insert, update, delete on public.provider_subjob_rates to authenticated;
grant select, insert, update, delete on public.provider_subjob_tiers to authenticated;
grant select on public.provider_services to authenticated;

create policy provider_subjob_rates_rw_own on public.provider_subjob_rates
  for all using (member_id = public.current_member_id())
          with check (member_id = public.current_member_id());

create policy provider_subjob_tiers_rw_own on public.provider_subjob_tiers
  for all using (member_id = public.current_member_id())
          with check (member_id = public.current_member_id());
