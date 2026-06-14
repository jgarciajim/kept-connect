-- =============================================================================
-- Provider onboarding — become a provider in-app (no SQL seeding).
--
-- One SECURITY DEFINER RPC that turns the current member into a provider: flips
-- members.is_provider, creates their provider_profiles row (online, but UNVERIFIED
-- — a self-signup isn't vetted), and seeds an empty wallet (authenticated can't
-- insert wallets directly, so the definer does it). Scoped to current_member_id().
-- =============================================================================

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
  if p_trades is null or array_length(p_trades, 1) is null then
    raise exception 'pick at least one trade';
  end if;

  update public.members
     set is_provider  = true,
         display_name = coalesce(nullif(btrim(p_display_name), ''), display_name)
   where id = me;

  insert into public.provider_profiles (member_id, display_name, trades, online)
    values (me, nullif(btrim(p_display_name), ''), p_trades, true)
    on conflict (member_id) do update
      set display_name = coalesce(excluded.display_name, public.provider_profiles.display_name),
          trades       = excluded.trades,
          online       = true;

  insert into public.provider_wallets (member_id)
    values (me)
    on conflict (member_id) do nothing;
end $$;

grant execute on function public.become_provider(text, public.category_key[]) to authenticated;
