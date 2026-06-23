-- =============================================================================
-- Option-level matching (opt-in). By default a verified pro sees every request in
-- a SERVICE they priced (service-level — the safe default, so thin early feeds
-- don't starve). A pro can opt into PRECISE matching: then they only see requests
-- for the exact sub-jobs (options) they priced. Off by default; per-provider.
--
-- Only the open-request RLS uses member_provides_service, so this widens that
-- helper's signature to include the request's option_slug.
-- =============================================================================
alter table public.provider_profiles add column precise_matching boolean not null default false;

-- Provider toggles their own match precision.
create or replace function public.set_match_precision(p_precise boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.provider_profiles
     set precise_matching = coalesce(p_precise, false)
   where member_id = public.current_member_id();
end $$;
grant execute on function public.set_match_precision(boolean) to authenticated;

-- New 3-arg eligibility: precise (opt-in, needs the request's option) narrows to the
-- exact priced sub-job; otherwise service-level + the legacy/family fallback.
create or replace function public.member_provides_service(p_service_slug text, p_option_slug text, p_category public.category_key)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_option_slug is not null
         and exists (select 1 from public.provider_profiles p where p.member_id = public.current_member_id() and p.precise_matching)
         and exists (select 1 from public.provider_subjob_rates r where r.member_id = public.current_member_id() and r.active)
    then exists (
      select 1 from public.provider_subjob_rates r
      where r.member_id = public.current_member_id()
        and r.service_slug = p_service_slug and r.option_slug = p_option_slug and r.active)
    else
      (p_service_slug is not null and exists (
        select 1 from public.provider_subjob_rates r
        where r.member_id = public.current_member_id() and r.service_slug = p_service_slug and r.active))
      or exists (
        select 1 from public.provider_profiles p
        where p.member_id = public.current_member_id() and p_category = any (p.trades)
          and (p_service_slug is null
               or not exists (select 1 from public.provider_subjob_rates r2 where r2.member_id = p.member_id and r2.active)))
  end
$$;

-- Repoint the open-request feed policy at the 3-arg helper, then drop the 2-arg one.
drop policy requests_select_open_for_trade_provider on public.requests;
create policy requests_select_open_for_trade_provider on public.requests
  for select using (
    status = 'finding'
    and category is not null
    and public.current_member_is_verified()
    and public.member_provides_service(service_slug, option_slug, category)
  );

drop function public.member_provides_service(text, public.category_key);
