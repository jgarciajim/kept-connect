-- =============================================================================
-- Profiles — requester account scaffolding + safe provider profile edits.
--
-- Adds `properties` (a requester's saved addresses, owner-scoped) and an RPC for
-- a provider to edit ONLY the safe columns of their own profile. The direct UPDATE
-- on provider_profiles is revoked: RLS is row-level, so the prior self-update grant
-- let a provider set their own rating/verified/jobs_done. Edits now route through
-- update_provider_profile, which writes only display_name/trades/credentials/online.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- properties — a member's saved addresses (the requester account scaffolding).
-- ----------------------------------------------------------------------------
create table public.properties (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid not null references public.members(id) on delete cascade,
  label        text not null,
  address_line text not null,
  is_default   boolean not null default false,
  created_at   timestamptz not null default now()
);
create index properties_member_idx on public.properties (member_id);

alter table public.properties enable row level security;
revoke all on public.properties from anon;
grant select, insert, update, delete on public.properties to authenticated;

-- Owner-only: a member reads/writes only their own properties.
create policy properties_rw_own on public.properties
  for all using (member_id = public.current_member_id())
          with check (member_id = public.current_member_id());

-- ----------------------------------------------------------------------------
-- update_provider_profile — safe, column-scoped self-edit. coalesce keeps any
-- argument left null unchanged, so callers can patch a single field (e.g. just
-- toggle `online`). Trust columns (rating/verified/jobs_done) are NOT writable.
-- ----------------------------------------------------------------------------
create or replace function public.update_provider_profile(
  p_display_name text             default null,
  p_trades       public.category_key[] default null,
  p_credentials  text[]           default null,
  p_online       boolean          default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provider_profiles
     set display_name = coalesce(p_display_name, display_name),
         trades       = coalesce(p_trades, trades),
         credentials  = coalesce(p_credentials, credentials),
         online       = coalesce(p_online, online)
   where member_id = public.current_member_id();
  if not found then raise exception 'no provider profile for current member'; end if;
end $$;

-- Close the self-set-trust-columns hole: edits go through the RPC, reads stay public.
revoke update on public.provider_profiles from authenticated;
grant execute on function public.update_provider_profile(text, public.category_key[], text[], boolean) to authenticated;
