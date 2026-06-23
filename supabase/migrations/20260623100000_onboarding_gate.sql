-- =============================================================================
-- Onboarding gate — collect full vetting, approve before going live, tailor by
-- service. Self-serve onboarding is instant, but a provider is NOT eligible for
-- matching/dispatch until an admin approves them (background + ID + license +
-- insurance). Eligibility becomes: online AND verified. Matching also narrows from
-- FAMILY to the SERVICES a provider actually priced (member_provides_service).
--
-- Background check + ID verification: collected now (consent + PII + ID doc) and
-- marked pending; a real provider (Checkr / Stripe Identity) is wired later via the
-- src/lib/vetting adapter (mirrors the Stripe mock-adapter). No SSN is stored — it's
-- collected at the vetting-provider boundary later. bg_provider_ref / id_provider_ref
-- hold the external ids when that lands.
--
-- This migration is newest-dated so its redefinitions of dispatch_eligible_provider,
-- the open-request RLS, send_offer, become_provider, and approve_verification win
-- over the dispatch_engine / notifications / verification migrations.
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 1. Extend provider_verifications with identity + background-check fields.
--    (license_photo_path now = the TRADE license photo; id_doc_path = the ID/DL.)
-- ----------------------------------------------------------------------------
alter table public.provider_verifications
  add column legal_first_name    text,
  add column legal_last_name     text,
  add column dob                 date,
  add column bg_check_consent    boolean not null default false,
  add column bg_check_consented_at timestamptz,
  add column id_doc_path         text,
  add column id_status           public.verification_status not null default 'unsubmitted',
  add column bg_status           public.verification_status not null default 'unsubmitted',
  add column id_provider_ref     text,
  add column bg_provider_ref     text;

-- ----------------------------------------------------------------------------
-- 2. Eligibility helpers (SECURITY DEFINER — DAG rooted at members).
-- ----------------------------------------------------------------------------
create or replace function public.current_member_is_verified()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.provider_profiles p
    where p.member_id = public.current_member_id() and p.verified
  )
$$;

-- Does the current member provide this request's service? Granular when they've
-- priced sub-jobs; falls back to FAMILY for legacy/mid-onboarding providers (no
-- sub-job rows yet) and for service-less requests, so feeds never starve.
create or replace function public.member_provides_service(p_service_slug text, p_category public.category_key)
returns boolean
language sql stable security definer set search_path = public
as $$
  select
    (p_service_slug is not null and exists (
      select 1 from public.provider_subjob_rates r
      where r.member_id = public.current_member_id()
        and r.service_slug = p_service_slug and r.active))
    or exists (
      select 1 from public.provider_profiles p
      where p.member_id = public.current_member_id()
        and p_category = any (p.trades)
        and (p_service_slug is null
             or not exists (select 1 from public.provider_subjob_rates r2
                            where r2.member_id = p.member_id and r2.active)));
$$;

-- ----------------------------------------------------------------------------
-- 3. The verified gate on matching (the ripple).
-- ----------------------------------------------------------------------------

-- Open-request feed: finding + verified + provider offers this service.
drop policy requests_select_open_for_trade_provider on public.requests;
create policy requests_select_open_for_trade_provider on public.requests
  for select using (
    status = 'finding'
    and category is not null
    and public.current_member_is_verified()
    and public.member_provides_service(service_slug, category)
  );

-- Round-robin dispatch eligibility: + verified.
create or replace function public.dispatch_eligible_provider(p_request_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pp.member_id
  from public.requests r
  join public.provider_profiles pp on r.category = any(pp.trades)
  where r.id = p_request_id
    and pp.online = true
    and pp.verified = true
    and pp.member_id <> r.requester_id
    and not exists (
      select 1 from public.offers o
      where o.request_id = r.id and o.provider_id = pp.member_id
    )
  order by (select count(*) from public.offers o2 where o2.provider_id = pp.member_id) asc,
           pp.rating desc
  limit 1
$$;

-- send_offer: + verified guard; price prefers the provider's per-sub-job flat
-- (by service+option), else the service-level rate (own / opted benchmark).
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
  if not exists (select 1 from public.provider_profiles p where p.member_id = me and p.verified) then
    raise exception 'not approved yet';
  end if;
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
    -- 1. the provider's per-sub-job FLAT price when the request names a sub-job
    if r.option_slug is not null then
      select amount into v_amount from public.provider_subjob_rates
        where member_id = me and service_slug = r.service_slug
          and option_slug = r.option_slug and active and price_model = 'flat';
      if v_amount is not null then v_source := 'own'; end if;
    end if;
    -- 2. the service-level rate (own or an opted-into benchmark)
    if v_amount is null then
      select * into v_rate from public.provider_rates
        where member_id = me and service_slug = r.service_slug;
      if v_rate.member_id is not null then
        v_amount := v_rate.amount;
        v_source := v_rate.rate_source;
      end if;
    end if;
    -- 3. fall back to the provider's cheapest flat sub-job for this service
    --    (option-less requests still get a sensible number from a sub-job-only pro)
    if v_amount is null then
      select min(amount) into v_amount from public.provider_subjob_rates
        where member_id = me and service_slug = r.service_slug
          and active and price_model = 'flat';
      if v_amount is not null then v_source := 'own'; end if;
    end if;
    if v_amount is null then
      raise exception 'no rate set for this service';  -- send a custom quote instead
    end if;
  end if;

  insert into public.quotes (request_id, provider_id, price, rate_source, status)
    values (p_request_id, me, v_amount, v_source, 'open')
    on conflict (request_id, provider_id) do update
      set price = excluded.price, rate_source = excluded.rate_source, status = 'open'
    returning id into v_id;

  perform public.create_notification(
    r.requester_id, 'offer', 'New offer',
    '$' || v_amount::text || ' on ' || coalesce(r.title, 'your request'), r.id);
  return v_id;
end $$;

-- ----------------------------------------------------------------------------
-- 4. become_provider — create the profile OFFLINE (online flips on approval) and
--    allow empty trades (the wizard sets them at the trades step). Re-callable.
-- ----------------------------------------------------------------------------
create or replace function public.become_provider(
  p_display_name text,
  p_trades       public.category_key[]
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := public.current_member_id();
begin
  if me is null then raise exception 'no member for current session'; end if;

  update public.members
     set is_provider  = true,
         display_name = coalesce(nullif(btrim(p_display_name), ''), display_name)
   where id = me;

  insert into public.provider_profiles (member_id, display_name, trades, online)
    values (me, nullif(btrim(p_display_name), ''), coalesce(p_trades, '{}'::public.category_key[]), false)
    on conflict (member_id) do update
      set display_name = coalesce(excluded.display_name, public.provider_profiles.display_name),
          -- keep existing trades when called with an empty set (resume / step 1)
          trades = case when array_length(excluded.trades, 1) is null
                        then public.provider_profiles.trades else excluded.trades end;

  insert into public.provider_wallets (member_id)
    values (me)
    on conflict (member_id) do nothing;
end $$;

-- ----------------------------------------------------------------------------
-- 5. Verification RPCs — extended submit (full vetting), approve flips live.
-- ----------------------------------------------------------------------------
drop function public.submit_verification(text, text, text, date, int, text, text, text, boolean);

create or replace function public.submit_verification(
  p_legal_first       text,
  p_legal_last        text,
  p_dob               date,
  p_bg_consent        boolean,
  p_bg_ref            text,
  p_id_ref            text,
  p_id_doc_path       text,
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
    (member_id, status, id_status, bg_status,
     legal_first_name, legal_last_name, dob, bg_check_consent, bg_check_consented_at,
     id_doc_path, id_provider_ref, bg_provider_ref,
     license_type, license_number, insurance_carrier, coi_expiry, years_in_trade,
     w9_path, coi_path, license_photo_path, attested, reason,
     submitted_at, reviewed_at, reviewed_by)
  values
    (me, 'pending', 'pending', 'pending',
     p_legal_first, p_legal_last, p_dob, coalesce(p_bg_consent, false),
     case when p_bg_consent then now() else null end,
     p_id_doc_path, p_id_ref, p_bg_ref,
     p_license_type, p_license_number, p_insurance_carrier, p_coi_expiry, p_years_in_trade,
     p_w9_path, p_coi_path, p_license_photo_path, coalesce(p_attested, false), null,
     now(), null, null)
  on conflict (member_id) do update set
    status = 'pending', id_status = 'pending', bg_status = 'pending',
    legal_first_name = excluded.legal_first_name,
    legal_last_name = excluded.legal_last_name,
    dob = excluded.dob,
    bg_check_consent = excluded.bg_check_consent,
    bg_check_consented_at = excluded.bg_check_consented_at,
    id_doc_path = excluded.id_doc_path,
    id_provider_ref = excluded.id_provider_ref,
    bg_provider_ref = excluded.bg_provider_ref,
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

-- approve → verified + bring the provider live (online) + clear bg/id statuses.
create or replace function public.approve_verification(p_member_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.current_member_is_admin() then raise exception 'admin only'; end if;
  update public.provider_verifications
     set status = 'verified', id_status = 'verified', bg_status = 'verified',
         reason = null, reviewed_at = now(), reviewed_by = public.current_member_id()
   where member_id = p_member_id;
  update public.provider_profiles
     set verified = true, online = true
   where member_id = p_member_id;
end $$;

grant execute on function public.submit_verification(text, text, date, boolean, text, text, text, text, text, text, date, int, text, text, text, boolean) to authenticated;
