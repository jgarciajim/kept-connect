-- =============================================================================
-- Abuse guards for the private beta.
--
-- 1. Per-member rate limits on user-created rows (requests, messages, offers,
--    quotes, reviews, properties). Enforced in the DB so they hold no matter which
--    path writes (client, server action, SECURITY DEFINER RPC). Only applies when a
--    signed-in member is the author; system writers (pg_cron dispatch, seeds) have
--    no JWT and are never limited.
-- 2. Length caps on human free text (NOT VALID: enforced on new writes, existing
--    rows untouched).
-- 3. Size + type limits on the private verification-docs upload bucket.
-- 4. Internal engine functions (dispatch_tick, dispatch_score_and_log,
--    recompute_eta_calibration) are no longer callable by signed-in users; the app
--    never calls them, pg_cron runs them as postgres.
-- =============================================================================

-- --- 1. rate limits ---------------------------------------------------------
-- Raises SQLSTATE 'P0429' with a readable message when `p_owner` has created
-- `p_max` or more rows in `p_table` within `p_window`.
create or replace function public.enforce_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_col text   := tg_argv[0];
  max_rows  int    := tg_argv[1]::int;
  win       interval := tg_argv[2]::interval;
  what      text   := tg_argv[3];
  me        uuid   := public.current_member_id();
  owner_id  uuid;
  recent    int;
begin
  if me is null then
    return new; -- system / cron / seed writes are not rate limited
  end if;

  execute format('select ($1).%I', owner_col) into owner_id using new;
  if owner_id is distinct from me then
    return new; -- only limit what the caller authors themselves
  end if;

  execute format(
    'select count(*) from %I.%I where %I = $1 and created_at > now() - $2',
    tg_table_schema, tg_table_name, owner_col
  ) into recent using me, win;

  if recent >= max_rows then
    raise exception 'Too many % in a short time. Please wait a bit and try again.', what
      using errcode = 'P0429';
  end if;
  return new;
end
$$;

revoke all on function public.enforce_rate_limit() from public, anon, authenticated;

-- Supporting indexes so each check is a cheap range scan.
create index if not exists requests_requester_created_idx on public.requests (requester_id, created_at);
create index if not exists messages_sender_created_idx   on public.messages (sender_id, created_at);
create index if not exists offers_provider_created_idx   on public.offers (provider_id, created_at);
create index if not exists quotes_provider_created_idx   on public.quotes (provider_id, created_at);
create index if not exists reviews_author_created_idx    on public.reviews (author_id, created_at);
create index if not exists properties_member_created_idx on public.properties (member_id, created_at);

-- Generous for real people, hard stops for scripts. Two windows where bursts matter.
create trigger rate_limit_requests_hour  before insert on public.requests
  for each row execute function public.enforce_rate_limit('requester_id', '10',  '1 hour',     'job posts');
create trigger rate_limit_requests_day   before insert on public.requests
  for each row execute function public.enforce_rate_limit('requester_id', '30',  '1 day',      'job posts');
create trigger rate_limit_messages_burst before insert on public.messages
  for each row execute function public.enforce_rate_limit('sender_id',    '20',  '1 minute',   'messages');
create trigger rate_limit_messages_hour  before insert on public.messages
  for each row execute function public.enforce_rate_limit('sender_id',    '200', '1 hour',     'messages');
create trigger rate_limit_offers_hour    before insert on public.offers
  for each row execute function public.enforce_rate_limit('provider_id',  '60',  '1 hour',     'offers');
create trigger rate_limit_quotes_hour    before insert on public.quotes
  for each row execute function public.enforce_rate_limit('provider_id',  '60',  '1 hour',     'quotes');
create trigger rate_limit_reviews_day    before insert on public.reviews
  for each row execute function public.enforce_rate_limit('author_id',    '15',  '1 day',      'reviews');
create trigger rate_limit_properties_day before insert on public.properties
  for each row execute function public.enforce_rate_limit('member_id',    '15',  '1 day',      'properties');

-- --- 2. length caps on free text ----------------------------------------------
alter table public.members
  add constraint members_display_name_len check (char_length(display_name) <= 80) not valid,
  add constraint members_avatar_url_len   check (char_length(avatar_url) <= 2048) not valid;

alter table public.requests
  add constraint requests_title_len          check (char_length(title) <= 140) not valid,
  add constraint requests_description_len    check (char_length(description) <= 4000) not valid,
  add constraint requests_location_label_len check (char_length(location_label) <= 200) not valid,
  add constraint requests_requester_name_len check (char_length(requester_name) <= 80) not valid;

alter table public.messages
  add constraint messages_body_len check (char_length(body) between 1 and 4000) not valid;

alter table public.offers
  add constraint offers_note_len check (char_length(note) <= 1000) not valid;

alter table public.reviews
  add constraint reviews_body_len        check (char_length(body) <= 2000) not valid,
  add constraint reviews_author_name_len check (char_length(author_name) <= 80) not valid;

alter table public.properties
  add constraint properties_label_len             check (char_length(label) <= 80) not valid,
  add constraint properties_address_line_len      check (char_length(address_line) <= 300) not valid,
  add constraint properties_formatted_address_len check (char_length(formatted_address) <= 300) not valid,
  add constraint properties_access_notes_len      check (char_length(access_notes) <= 2000) not valid;

alter table public.provider_profiles
  add constraint provider_profiles_display_name_len check (char_length(display_name) <= 80) not valid;

alter table public.provider_verifications
  add constraint pv_legal_first_name_len  check (char_length(legal_first_name) <= 80) not valid,
  add constraint pv_legal_last_name_len   check (char_length(legal_last_name) <= 80) not valid,
  add constraint pv_insurance_carrier_len check (char_length(insurance_carrier) <= 120) not valid,
  add constraint pv_license_number_len    check (char_length(license_number) <= 60) not valid,
  add constraint pv_license_type_len      check (char_length(license_type) <= 80) not valid,
  add constraint pv_reason_len            check (char_length(reason) <= 1000) not valid;

-- --- 3. upload limits on verification documents --------------------------------
update storage.buckets
set file_size_limit    = 10 * 1024 * 1024, -- 10 MB
    allowed_mime_types = array['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
where id = 'verification-docs';

-- --- 4. engine internals: cron only --------------------------------------------
revoke execute on function public.dispatch_tick() from public, anon, authenticated;
revoke execute on function public.recompute_eta_calibration() from public, anon, authenticated;
revoke execute on function public.dispatch_score_and_log(uuid, numeric) from public, anon, authenticated;
