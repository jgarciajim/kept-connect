-- =============================================================================
-- Property details — captured during customer onboarding. A saved property can
-- carry its type (house / condo / rental…) and access notes (gate code, where to
-- park, dog in yard) that flow into job requests as useful context. Owner RLS on
-- properties already covers these columns.
-- =============================================================================
alter table public.properties
  add column property_type text,
  add column access_notes  text;
