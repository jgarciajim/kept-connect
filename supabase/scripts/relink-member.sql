-- =============================================================================
-- Re-link an existing member to their new Supabase Auth login — one-time, run in
-- the hosted SQL Editor after the Clerk -> Supabase Auth switch.
--
-- Before the switch, members.auth_user_id held a Clerk id ("user_..."). After the
-- person signs up again with Supabase Auth, the app creates a NEW empty member row
-- for them. This script points their OLD row (with their data + admin flag) at the
-- new login and removes the empty duplicate.
--
-- Prereq: the person has signed in once on the new login.
-- =============================================================================

-- 1. See both rows: the old one (auth_user_id starts with user_) and the new
--    Supabase login (look up its uuid by email).
select id, auth_user_id, display_name, is_admin, created_at
from public.members
where auth_user_id like 'user\_%' or auth_user_id ~ '^[0-9a-f-]{36}$'
order by created_at;

select id as new_auth_user_id, email, created_at from auth.users order by created_at desc;

-- 2. Fill in the two values and run all three statements together:
--    OLD_CLERK_ID  = the old user_... value from step 1
--    NEW_AUTH_ID   = the uuid from auth.users for your email
-- begin;
-- delete from public.members
--   where auth_user_id = 'NEW_AUTH_ID'
--     and created_at > now() - interval '7 days'   -- only the fresh, empty row
--     and not is_admin;
-- update public.members set auth_user_id = 'NEW_AUTH_ID'
--   where auth_user_id = 'OLD_CLERK_ID';
-- commit;

-- 3. Verify:
-- select id, auth_user_id, display_name, is_admin from public.members where auth_user_id = 'NEW_AUTH_ID';
