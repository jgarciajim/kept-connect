-- =============================================================================
-- Requester-side price estimates from REAL provider pricing.
--
-- provider_subjob_rates is owner-only (a provider can't read a competitor's rates).
-- But the requester app wants a live "~$X near you" estimate per sub-job, drawn from
-- what local pros actually charge. This SECURITY DEFINER aggregate exposes ONLY the
-- low/median/high + a count across VERIFIED providers' active FLAT rates — never an
-- individual row. The composer prefers this over the static benchmark when present.
-- =============================================================================
create or replace function public.subjob_price_estimates()
returns table (service_slug text, option_slug text, low numeric, mid numeric, high numeric, n int)
language sql
stable
security definer
set search_path = public
as $$
  select r.service_slug,
         r.option_slug,
         min(r.amount)::numeric(10,2),
         (percentile_cont(0.5) within group (order by r.amount))::numeric(10,2),
         max(r.amount)::numeric(10,2),
         count(*)::int
  from public.provider_subjob_rates r
  join public.provider_profiles p on p.member_id = r.member_id
  where r.active and r.price_model = 'flat' and p.verified
  group by r.service_slug, r.option_slug;
$$;

grant execute on function public.subjob_price_estimates() to authenticated;
