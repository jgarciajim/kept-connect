-- =============================================================================
-- D11 — Identity foundation: schema, grant-based isolation, RLS keyed on Clerk sub.
--
-- Auth model: Clerk's native Third-Party Auth integration. The Clerk session JWT
-- is passed to Supabase via the `accessToken` option, so the verified JWT's `sub`
-- claim (a STRING, e.g. "user_2abc...") is the stable identity. We key RLS on
--   auth.jwt() ->> 'sub'
-- and NEVER on auth.uid() — Clerk ids are not UUIDs, so auth.uid() is null/garbage.
--
-- Isolation invariant: a provider can see a requester's request ONLY through a
-- job_grant. No policy exposes another member's rows without a grant.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- Tables
-- ----------------------------------------------------------------------------

-- A person on the platform. May be a requester, a provider, or both.
create table public.members (
  id            uuid primary key default gen_random_uuid(),
  clerk_user_id text unique not null,          -- the JWT `sub`
  is_requester  boolean not null default false,
  is_provider   boolean not null default false,
  created_at    timestamptz not null default now()
);

-- A requester's request for work. Minimal skeleton — just enough to prove
-- ownership isolation.
create table public.requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.members(id) on delete cascade,
  trade        text not null,
  description  text,
  created_at   timestamptz not null default now()
);

-- The ONLY bridge by which a provider gains visibility of a request.
create table public.job_grants (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.requests(id) on delete cascade,
  provider_id uuid not null references public.members(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (request_id, provider_id)
);

create index requests_requester_id_idx on public.requests (requester_id);
create index job_grants_request_id_idx on public.job_grants (request_id);
create index job_grants_provider_id_idx on public.job_grants (provider_id);

-- ----------------------------------------------------------------------------
-- Helper: resolve the JWT `sub` to a member id.
--
-- SECURITY DEFINER so the lookup bypasses members RLS cleanly when called from
-- other tables' policies (no recursion risk — the members policy never references
-- requests/job_grants). search_path is locked to public to keep the definer safe.
-- ----------------------------------------------------------------------------
create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.members
  where clerk_user_id = auth.jwt() ->> 'sub'
$$;

-- Cross-table visibility checks, also SECURITY DEFINER. These exist to BREAK RLS
-- recursion: the requests policy must look at job_grants and the job_grants policy
-- must look at requests. If those lookups went through the normal client they'd
-- re-trigger each other's policies forever ("infinite recursion detected in policy").
-- Running them as definer bypasses the inner table's RLS, cutting the cycle, while
-- still scoping strictly to the current member.

-- Does the current member hold a grant on this request? (provider's view of a request)
create or replace function public.member_has_grant(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_grants g
    where g.request_id = p_request_id
      and g.provider_id = public.current_member_id()
  )
$$;

-- Does the current member own this request? (requester's view of their grants)
create or replace function public.member_owns_request(p_request_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.requests r
    where r.id = p_request_id
      and r.requester_id = public.current_member_id()
  )
$$;

-- ----------------------------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------------------------
alter table public.members    enable row level security;
alter table public.requests   enable row level security;
alter table public.job_grants enable row level security;

-- ----------------------------------------------------------------------------
-- Table privileges. RLS (above) is the ROW gate; these GRANTs are the TABLE gate
-- — both must pass. `authenticated` only; `anon` (signed-out) gets nothing, since
-- every one of these surfaces requires a signed-in member. No DELETE in the
-- foundation. (Supabase default privileges may pre-grant anon, hence the revoke.)
-- ----------------------------------------------------------------------------
revoke all on public.members, public.requests, public.job_grants from anon;
grant select, insert, update on public.members    to authenticated;
grant select, insert         on public.requests   to authenticated;
grant select, insert         on public.job_grants to authenticated;

-- ----------------------------------------------------------------------------
-- Policies — members: a member may read/update (and self-provision) ONLY their
-- own row, matched on the Clerk sub.
-- ----------------------------------------------------------------------------
create policy members_select_own on public.members
  for select
  using (clerk_user_id = auth.jwt() ->> 'sub');

create policy members_update_own on public.members
  for update
  using (clerk_user_id = auth.jwt() ->> 'sub')
  with check (clerk_user_id = auth.jwt() ->> 'sub');

-- Self-provisioning: an authenticated user may insert exactly one row, and only
-- one whose clerk_user_id is their own sub. Lets ensureMember() upsert via the
-- normal authenticated client — no service-role key in app code.
create policy members_insert_self on public.members
  for insert
  with check (clerk_user_id = auth.jwt() ->> 'sub');

-- ----------------------------------------------------------------------------
-- Policies — requests: a requester sees only their own; a provider sees a
-- request ONLY via a job_grant.
-- ----------------------------------------------------------------------------
create policy requests_select_own_requester on public.requests
  for select
  using (requester_id = public.current_member_id());

create policy requests_select_granted_provider on public.requests
  for select
  using (public.member_has_grant(id));

-- A requester may create requests they own.
create policy requests_insert_own on public.requests
  for insert
  with check (requester_id = public.current_member_id());

-- ----------------------------------------------------------------------------
-- Policies — job_grants: visible to the granted provider AND the owning
-- requester. Only the owning requester may create a grant.
-- ----------------------------------------------------------------------------
create policy job_grants_select_party on public.job_grants
  for select
  using (
    provider_id = public.current_member_id()
    or public.member_owns_request(request_id)
  );

create policy job_grants_insert_by_requester on public.job_grants
  for insert
  with check (public.member_owns_request(request_id));
