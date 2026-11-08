-- =============================================================================
-- member_clerk_id(p_member_id) — authorization-gated lookup of a member's Clerk
-- user id, so the app layer can resolve their email (held in Clerk, not the DB)
-- to send a transactional email. SECURITY DEFINER because RLS otherwise hides
-- other members' rows; the WHERE clause is the authorization.
--
-- Returns the clerk_user_id ONLY when the caller is:
--   * an admin, or
--   * the member themselves, or
--   * a counterparty who shares a request with the target — via the award
--     (requester <-> awarded_provider), a job_grant, or an offer.
-- Otherwise returns NULL (no enumeration of strangers' identities).
-- =============================================================================
create or replace function public.member_clerk_id(p_member_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select m.clerk_user_id
  from public.members m
  where m.id = p_member_id
    and (
      -- caller is an admin
      exists (
        select 1 from public.members me
        where me.clerk_user_id = auth.jwt() ->> 'sub' and me.is_admin
      )
      -- caller is the member themselves
      or m.clerk_user_id = auth.jwt() ->> 'sub'
      -- caller shares an awarded request with the target (either direction)
      or exists (
        select 1 from public.requests r
        join public.members me on me.clerk_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and r.awarded_provider_id = p_member_id)
           or (r.awarded_provider_id = me.id and r.requester_id = p_member_id)
      )
      -- caller shares a job_grant with the target
      or exists (
        select 1 from public.job_grants g
        join public.requests r on r.id = g.request_id
        join public.members me on me.clerk_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and g.provider_id = p_member_id)
           or (g.provider_id = me.id and r.requester_id = p_member_id)
      )
      -- caller shares an offer with the target
      or exists (
        select 1 from public.offers o
        join public.requests r on r.id = o.request_id
        join public.members me on me.clerk_user_id = auth.jwt() ->> 'sub'
        where (r.requester_id = me.id and o.provider_id = p_member_id)
           or (o.provider_id = me.id and r.requester_id = p_member_id)
      )
    )
$$;

revoke all on function public.member_clerk_id(uuid) from anon;
grant execute on function public.member_clerk_id(uuid) to authenticated;
