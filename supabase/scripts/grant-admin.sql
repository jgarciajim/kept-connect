-- =============================================================================
-- Grant yourself admin — one-time, run in the hosted SQL Editor.
--
-- Admin is required to open /work/admin and approve (or reject) Pro verification
-- applications. members.is_admin defaults FALSE and there is deliberately NO
-- self-serve way to become admin (a Pro must never be able to self-verify), so
-- the first admin is set by hand here.
--
-- Prereq: you have signed in to the app at least once, so your member row exists.
-- =============================================================================

-- 1. Find your member row. Yours is the one whose clerk_user_id is NOT a seed_*
--    value (the seed Pros/reviewers are seed_provider_*/seed_reviewer_*).
select id, clerk_user_id, display_name, is_provider, is_requester, is_admin
from public.members
order by is_admin desc, display_name;

-- 2. Flag yourself admin. Copy YOUR clerk_user_id from step 1 into the quotes,
--    then uncomment and run this line (left commented so you can't flag the
--    wrong row by accident):
-- update public.members set is_admin = true
--   where clerk_user_id = 'user_XXXXXXXXXXXXXXXXXXXXXXXXXX';

-- 3. Verify exactly one admin (you):
-- select display_name, clerk_user_id, is_admin from public.members where is_admin;
