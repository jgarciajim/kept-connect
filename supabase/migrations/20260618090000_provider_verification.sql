-- =============================================================================
-- Provider vetting — application + documents + admin review → verified badge.
--
-- A provider submits a verification application (license fields + uploaded W-9,
-- COI, driver's-license photo); it sits 'pending'; an admin approves/rejects.
-- Approval flips provider_profiles.verified. Documents live in a private Storage
-- bucket (owner + admins only). Writes route through SECURITY DEFINER RPCs so a
-- provider can NEVER self-set verified (RLS is row-level, not column-level).
-- =============================================================================

alter table public.members add column is_admin boolean not null default false;

create or replace function public.current_member_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where clerk_user_id = auth.jwt() ->> 'sub' and is_admin
  )
$$;

create type public.verification_status as enum ('unsubmitted', 'pending', 'verified', 'rejected');

create table public.provider_verifications (
  member_id          uuid primary key references public.members(id) on delete cascade,
  status             public.verification_status not null default 'pending',
  license_type       text,
  license_number     text,
  insurance_carrier  text,
  coi_expiry         date,
  years_in_trade     int,
  w9_path            text,
  coi_path           text,
  license_photo_path text,
  attested           boolean not null default false,
  reason             text,        -- rejection note
  submitted_at       timestamptz not null default now(),
  reviewed_at        timestamptz,
  reviewed_by        uuid references public.members(id)
);

alter table public.provider_verifications enable row level security;
revoke all on public.provider_verifications from anon;
grant select on public.provider_verifications to authenticated; -- read own / admin; writes via RPCs only

-- Owner reads their own application; admins read all.
create policy provider_verifications_select on public.provider_verifications
  for select using (member_id = public.current_member_id() or public.current_member_is_admin());

-- ----------------------------------------------------------------------------
-- Storage: private bucket for verification documents. Object path is
-- "<clerk-sub>/<doc>-<ts>.<ext>" so the owner check keys on the first folder.
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('verification-docs', 'verification-docs', false)
  on conflict (id) do nothing;

create policy verification_docs_owner_read on storage.objects
  for select to authenticated
  using (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

create policy verification_docs_owner_write on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verification-docs' and (storage.foldername(name))[1] = (auth.jwt() ->> 'sub'));

create policy verification_docs_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'verification-docs' and public.current_member_is_admin());

-- ----------------------------------------------------------------------------
-- RPCs. submit is provider-self (only safe fields, always 'pending'); approve/
-- reject are admin-only and own the trust transition.
-- ----------------------------------------------------------------------------
create or replace function public.submit_verification(
  p_license_type      text,
  p_license_number    text,
  p_insurance_carrier text,
  p_coi_expiry        date,
  p_years_in_trade    int,
  p_w9_path           text,
  p_coi_path          text,
  p_license_photo_path text,
  p_attested          boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := public.current_member_id();
begin
  if me is null then raise exception 'no member for current session'; end if;
  insert into public.provider_verifications
    (member_id, status, license_type, license_number, insurance_carrier, coi_expiry,
     years_in_trade, w9_path, coi_path, license_photo_path, attested, reason,
     submitted_at, reviewed_at, reviewed_by)
  values
    (me, 'pending', p_license_type, p_license_number, p_insurance_carrier, p_coi_expiry,
     p_years_in_trade, p_w9_path, p_coi_path, p_license_photo_path, coalesce(p_attested, false), null,
     now(), null, null)
  on conflict (member_id) do update set
    status = 'pending',
    license_type = excluded.license_type,
    license_number = excluded.license_number,
    insurance_carrier = excluded.insurance_carrier,
    coi_expiry = excluded.coi_expiry,
    years_in_trade = excluded.years_in_trade,
    w9_path = excluded.w9_path,
    coi_path = excluded.coi_path,
    license_photo_path = excluded.license_photo_path,
    attested = excluded.attested,
    reason = null,
    submitted_at = now(),
    reviewed_at = null,
    reviewed_by = null;
end $$;

create or replace function public.approve_verification(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_member_is_admin() then raise exception 'admin only'; end if;
  update public.provider_verifications
     set status = 'verified', reason = null, reviewed_at = now(), reviewed_by = public.current_member_id()
   where member_id = p_member_id;
  update public.provider_profiles set verified = true where member_id = p_member_id;
end $$;

create or replace function public.reject_verification(p_member_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_member_is_admin() then raise exception 'admin only'; end if;
  update public.provider_verifications
     set status = 'rejected', reason = p_reason, reviewed_at = now(), reviewed_by = public.current_member_id()
   where member_id = p_member_id;
end $$;

grant execute on function public.submit_verification(text, text, text, date, int, text, text, text, boolean) to authenticated;
grant execute on function public.approve_verification(uuid) to authenticated;
grant execute on function public.reject_verification(uuid, text) to authenticated;
