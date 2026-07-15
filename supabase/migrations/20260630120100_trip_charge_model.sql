-- =============================================================================
-- Scope adjustment / trip charge / human review — DATA MODEL ONLY.
--
-- Guildry scope-adjustment-trip-charge spec §7. This migration lands the schema
-- (the evidence spine + the review/enforcement logs) ahead of the behavior, per
-- the build-batch README: "land the logging tables first ... even before the
-- behavior that consumes them is finished." The state machine, authorize-then-
-- capture money flow, the human-review queue and the enforcement ladder (spec §8
-- steps 1-6) are built in later migrations as SECURITY DEFINER RPCs against these
-- tables. NO behavior here — tables, enums, constraints, RLS only.
--
-- Naming: a request IS the job (no jobs table). Spec `job_id` -> `request_id`.
-- Money: integer cents, consistent with public.payments.
-- Classification guardrail (spec §0): the adjusted price is ALWAYS the provider's
--   own rate — enforced in the DB by scope_adjustments.rate_source CHECK ('own').
-- Evidence guardrail (spec §2): no photos = invalid — enforced by non-empty
--   array CHECKs on assessment_photos / evidence_photos.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------
create type public.scope_adjustment_kind   as enum ('additive', 'replacement');
create type public.scope_adjustment_status as enum ('submitted', 'approved', 'declined', 'expired');
create type public.trip_charge_status      as enum ('authorized', 'under_review', 'released', 'voided');
create type public.trip_charge_decision    as enum ('pass', 'fail');
create type public.enforcement_action      as enum ('flag', 'warning', 'suspension', 'removal');
-- enforcement_events.role reuses the existing public.review_role enum ('requester','provider').

-- Extend the request lifecycle (spec §7). New values are committed by this
-- migration and first USED by the later behavior migration (PG forbids using a
-- freshly-added enum value in the same transaction — we don't, so this is safe).
alter type public.request_status add value if not exists 'awaiting_assessment';
alter type public.request_status add value if not exists 'adjustment_pending';
alter type public.request_status add value if not exists 'aborted_trip_charge';

-- ----------------------------------------------------------------------------
-- arrival_checkins — §2 arrival proof. A provider cannot collect a trip charge
-- for a drive-by: geo check-in + server timestamp + assessment photos, required.
-- ----------------------------------------------------------------------------
create table public.arrival_checkins (
  id                uuid primary key default gen_random_uuid(),
  request_id        uuid not null references public.requests(id) on delete cascade,
  provider_id       uuid not null references public.members(id)  on delete cascade,
  geo_lat           numeric(9,6) not null,
  geo_lng           numeric(9,6) not null,
  assessment_photos text[] not null,        -- durable storage paths; required (§2)
  checked_in_at     timestamptz not null default now(),
  constraint arrival_checkins_photos_present check (cardinality(assessment_photos) > 0),
  unique (request_id, provider_id)
);
create index arrival_checkins_request_idx on public.arrival_checkins (request_id);

-- ----------------------------------------------------------------------------
-- scope_adjustments — §1 state machine. Additive (separate line, decline is
-- non-punitive) vs replacement (re-quote; decline -> abort -> trip charge).
-- proposed_amount is the PROVIDER'S OWN re-quote (never platform-set).
-- ----------------------------------------------------------------------------
create table public.scope_adjustments (
  id                   uuid primary key default gen_random_uuid(),
  request_id           uuid not null references public.requests(id) on delete cascade,
  provider_id          uuid not null references public.members(id)  on delete cascade,
  kind                 public.scope_adjustment_kind   not null,
  original_scope_ref   text,
  proposed_scope       text not null,
  proposed_amount_cents int  not null check (proposed_amount_cents >= 0),
  rate_source          text not null default 'own'
                         constraint scope_adjustments_rate_own check (rate_source = 'own'),
  evidence_photos      text[] not null,      -- required; no photos = invalid (§2)
  status               public.scope_adjustment_status not null default 'submitted',
  submitted_at         timestamptz not null default now(),
  responded_at         timestamptz,
  constraint scope_adjustments_evidence_present check (cardinality(evidence_photos) > 0)
);
create index scope_adjustments_request_idx on public.scope_adjustments (request_id);

-- ----------------------------------------------------------------------------
-- trip_charges — §3 authorize-then-capture. credited_to_job=true on proceed,
-- false on abort. status walks authorized -> under_review -> released | voided.
-- ----------------------------------------------------------------------------
create table public.trip_charges (
  id                uuid primary key default gen_random_uuid(),
  request_id        uuid not null references public.requests(id) on delete cascade,
  provider_id       uuid not null references public.members(id)  on delete cascade,
  amount_cents      int not null check (amount_cents >= 0),
  service_fee_cents int not null default 0 check (service_fee_cents >= 0),
  credited_to_job   boolean not null default false,   -- true on proceed, false on abort
  status            public.trip_charge_status not null default 'authorized',
  created_at        timestamptz not null default now(),
  resolved_at       timestamptz,
  unique (request_id)
);
create index trip_charges_provider_idx on public.trip_charges (provider_id, created_at);

-- ----------------------------------------------------------------------------
-- trip_charge_reviews — §4 client-protection gate. The fixed reviewer checklist
-- logged verbatim: audit trail now, auto-triage training set later (the flywheel).
-- ----------------------------------------------------------------------------
create table public.trip_charge_reviews (
  id             uuid primary key default gen_random_uuid(),
  trip_charge_id uuid not null references public.trip_charges(id) on delete cascade,
  reviewer_id    uuid references public.members(id),      -- null when fast-track auto-cleared
  checklist_json jsonb not null default '{}'::jsonb,      -- the §4 fields, verbatim
  decision       public.trip_charge_decision not null,
  fast_tracked   boolean not null default false,
  notes          text,
  decided_at     timestamptz not null default now()
);
create index trip_charge_reviews_charge_idx on public.trip_charge_reviews (trip_charge_id);

-- ----------------------------------------------------------------------------
-- enforcement_events — §5 abuse ladder: flag -> warning -> suspension -> removal.
-- Each step a terms violation with its evidence (clean records matter for
-- contractor-status / removal-for-cause). Monitors BOTH sides.
-- ----------------------------------------------------------------------------
create table public.enforcement_events (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references public.members(id) on delete cascade,
  role         public.review_role not null,        -- 'provider' | 'requester'
  signal       text not null,                       -- what tripped it (abort-rate, serial-decline, dispute-upheld, ...)
  action       public.enforcement_action not null,
  evidence_ref text,
  notes        text,
  created_at   timestamptz not null default now()
);
create index enforcement_events_member_idx on public.enforcement_events (member_id, created_at);

-- ----------------------------------------------------------------------------
-- RLS — read posture only. Writes route through SECURITY DEFINER RPCs added with
-- the behavior (spec §8); no INSERT/UPDATE grant or policy exists yet, so nothing
-- but a definer function (or service role) can mutate these. Mirrors payments.
-- ----------------------------------------------------------------------------
alter table public.arrival_checkins    enable row level security;
alter table public.scope_adjustments   enable row level security;
alter table public.trip_charges        enable row level security;
alter table public.trip_charge_reviews enable row level security;
alter table public.enforcement_events  enable row level security;

revoke all on public.arrival_checkins, public.scope_adjustments, public.trip_charges,
  public.trip_charge_reviews, public.enforcement_events from anon;

grant select on public.arrival_checkins    to authenticated;
grant select on public.scope_adjustments   to authenticated;
grant select on public.trip_charges        to authenticated;
grant select on public.trip_charge_reviews to authenticated;
grant select on public.enforcement_events  to authenticated;

-- Evidence + money rows: visible to the two parties of the request, and to admins.
create policy arrival_checkins_select_party on public.arrival_checkins
  for select using (public.member_is_party(request_id) or public.current_member_is_admin());

create policy scope_adjustments_select_party on public.scope_adjustments
  for select using (public.member_is_party(request_id) or public.current_member_is_admin());

create policy trip_charges_select_party on public.trip_charges
  for select using (public.member_is_party(request_id) or public.current_member_is_admin());

-- Review checklists are internal triage data → admins only (the provider learns
-- the OUTCOME via trip_charges.status, not the reviewer's internal notes).
create policy trip_charge_reviews_select_admin on public.trip_charge_reviews
  for select using (public.current_member_is_admin());

-- A member may read enforcement events about themselves (contractor-status
-- transparency); admins read all.
create policy enforcement_events_select_self_or_admin on public.enforcement_events
  for select using (member_id = public.current_member_id() or public.current_member_is_admin());
