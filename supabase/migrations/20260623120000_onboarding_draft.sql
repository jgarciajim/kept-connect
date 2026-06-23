-- =============================================================================
-- Onboarding draft — resumable signup. Each wizard step persists a DRAFT
-- (status stays 'unsubmitted'); the final submit_verification flips it to
-- 'pending' and kicks the vetting adapter. A contractor who drops off mid-signup
-- (flaky mobile in the field) resumes exactly where they left off. Docs are
-- uploaded to Storage on pick, so only their paths are saved here. SECURITY
-- DEFINER (provider_verifications writes go through RPCs); scoped to the caller.
-- =============================================================================
create or replace function public.save_verification_draft(
  p_legal_first       text,
  p_legal_last        text,
  p_dob               date,
  p_bg_consent        boolean,
  p_id_doc_path       text,
  p_license_type      text,
  p_license_number    text,
  p_insurance_carrier text,
  p_coi_expiry        date,
  p_years_in_trade    int,
  p_w9_path           text,
  p_coi_path          text,
  p_license_photo_path text
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
    (member_id, status, legal_first_name, legal_last_name, dob, bg_check_consent,
     id_doc_path, license_type, license_number, insurance_carrier, coi_expiry,
     years_in_trade, w9_path, coi_path, license_photo_path, submitted_at)
  values
    (me, 'unsubmitted', p_legal_first, p_legal_last, p_dob, coalesce(p_bg_consent, false),
     p_id_doc_path, p_license_type, p_license_number, p_insurance_carrier, p_coi_expiry,
     p_years_in_trade, p_w9_path, p_coi_path, p_license_photo_path, now())
  on conflict (member_id) do update set
    status = 'unsubmitted',  -- a draft; stays out of the admin queue until submit
    legal_first_name = excluded.legal_first_name,
    legal_last_name = excluded.legal_last_name,
    dob = excluded.dob,
    bg_check_consent = excluded.bg_check_consent,
    id_doc_path = excluded.id_doc_path,
    license_type = excluded.license_type,
    license_number = excluded.license_number,
    insurance_carrier = excluded.insurance_carrier,
    coi_expiry = excluded.coi_expiry,
    years_in_trade = excluded.years_in_trade,
    w9_path = excluded.w9_path,
    coi_path = excluded.coi_path,
    license_photo_path = excluded.license_photo_path;
end $$;

grant execute on function public.save_verification_draft(text, text, date, boolean, text, text, text, text, date, int, text, text, text) to authenticated;
