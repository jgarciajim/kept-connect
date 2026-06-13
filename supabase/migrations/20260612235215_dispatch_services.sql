-- =============================================================================
-- D13 (1/2) — dispatch mode + the fixed-price service catalog.
--
-- Dispatch mode is driven by the JOB TYPE, not a manual toggle:
--   * 'instant' — standardized, fixed-price jobs (replace toilet valve, install
--     garbage disposal, swap a faucet…). The engine round-robins offers at the
--     set price; first provider to Accept wins.
--   * 'quote'   — larger custom projects (flooring, decks, roofs). The requester
--     compares sealed quotes and awards. (Default — unchanged from D12.)
-- =============================================================================

create type public.dispatch_mode as enum ('instant', 'quote');

-- Standardized, fixed-price jobs that can be round-robin dispatched.
create table public.services (
  id         uuid primary key default gen_random_uuid(),
  category   public.category_key not null,
  name       text not null,
  base_price numeric(10,2) not null,
  active     boolean not null default true,
  created_at timestamptz not null default now()
);
create index services_category_idx on public.services (category) where active;

alter table public.services enable row level security;
revoke all on public.services from anon;
grant select on public.services to authenticated;       -- public catalog (read-only)
create policy services_select_all on public.services for select using (true);

-- A request now knows its dispatch mode + (for instant) which standardized service.
alter table public.requests
  add column dispatch_mode public.dispatch_mode not null default 'quote',
  add column service_id    uuid references public.services(id);

-- ----------------------------------------------------------------------------
-- Seed the fixed-price catalog (demo data — env-gate before launch).
-- ----------------------------------------------------------------------------
insert into public.services (category, name, base_price) values
  ('water',   'Replace toilet valve',      95.00),
  ('water',   'Replace toilet',           260.00),
  ('water',   'Install garbage disposal', 180.00),
  ('water',   'Swap a faucet',            140.00),
  ('power',   'Install an outlet',        120.00),
  ('power',   'Swap a light fixture',     110.00),
  ('climate', 'Replace a thermostat',     130.00),
  ('care',    'Standard home cleaning',   150.00);
