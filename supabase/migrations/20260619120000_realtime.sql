-- =============================================================================
-- Realtime — push live updates to the app instead of polling.
--
-- The screens already re-fetch through their RLS-scoped server components; we just
-- swap the timer trigger for Supabase Realtime postgres_changes on the tables that
-- drive the live screens:
--   * requests — status transitions (finding → awarded → enroute → complete) for
--     the requester's job + track screens
--   * offers   — round-robin dispatch offers for the provider feed
--   * quotes   — sealed bids arriving on the requester's match screen
--
-- postgres_changes enforces the table's RLS per subscriber (using the Clerk JWT,
-- same as the rest of the app), so a client only receives rows it may already read.
-- replica identity FULL makes the full row available so RLS + column filters apply
-- to UPDATE/DELETE events, not just INSERT. Idempotent — guarded for re-runs.
-- =============================================================================

-- The platform creates `supabase_realtime`; guard in case a bare stack hasn't.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter table public.requests replica identity full;
alter table public.offers   replica identity full;
alter table public.quotes   replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'requests') then
    alter publication supabase_realtime add table public.requests;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'offers') then
    alter publication supabase_realtime add table public.offers;
  end if;
  if not exists (select 1 from pg_publication_tables
                 where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'quotes') then
    alter publication supabase_realtime add table public.quotes;
  end if;
end $$;
