-- =============================================================================
-- Hosted scheduler setup — run ONCE in the Supabase SQL editor (Dashboard →
-- SQL Editor) against the hosted project. NOT a migration on purpose: pg_cron is
-- kept out of migrations so the local stack and the pgTAP test suite stay
-- portable (they call these functions directly instead).
--
-- These two functions are designed to run on a timer but nothing schedules them
-- in code — without this, offers never auto-expire and stalled dispatch rounds
-- never advance, and ETA calibration never self-updates.
-- =============================================================================

create extension if not exists pg_cron;

-- Round-robin dispatch sweep: expire the 45s offer timer, advance stalled instant
-- jobs. pg_cron's finest granularity is 1 minute (fine for testing).
select cron.schedule(
  'guildry-dispatch-tick',
  '* * * * *',
  $$ select public.dispatch_tick(); $$
);

-- ETA calibration flywheel: recompute per-geo correction nightly at 03:00 UTC.
select cron.schedule(
  'guildry-eta-calibration',
  '0 3 * * *',
  $$ select public.recompute_eta_calibration(); $$
);

-- Verify / inspect:
--   select jobname, schedule, active from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 20;
-- To remove:  select cron.unschedule('guildry-dispatch-tick');
