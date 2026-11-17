-- =============================================================================
-- Pro job alerts.
--
-- 1. Instant-offer response window is a SETTING (app_settings), not a constant:
--    starts at 300 s (5 min) while the Pro pool is small; shorten it later with
--      update public.app_settings set value = '120' where key = 'instant_offer_window_seconds';
-- 2. In-app notification to the Pro for every instant offer (type 'job_offer').
-- 3. In-app notification to every matching, verified Pro when a QUOTE job is
--    posted (type 'new_job'). "Matching" = the same rule that lets a Pro see the
--    job (member_provides_service), now callable for any member.
-- 4. Both alert types are also emailed: a trigger on notifications POSTs to the
--    app (pg_net -> /api/hooks/notification-email) with a shared secret from
--    Vault ('notify_hook_secret'). No secret configured => no email, nothing breaks.
--    Muted 'offers' preference => no notification => no email.
-- =============================================================================

create extension if not exists pg_net with schema extensions;

-- --- 1. settings ----------------------------------------------------------------
create table if not exists public.app_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz not null default now()
);
alter table public.app_settings enable row level security;  -- no policies: definer functions only
revoke all on public.app_settings from anon, authenticated;

insert into public.app_settings (key, value) values
  ('instant_offer_window_seconds', '300'),
  ('app_base_url', 'https://guildry.app')
on conflict (key) do nothing;

create or replace function public.app_setting(p_key text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select value from public.app_settings where key = p_key
$$;
revoke all on function public.app_setting(text) from public, anon, authenticated;

-- dispatch_next_offer: window read from settings (was a fixed 45 seconds).
CREATE OR REPLACE FUNCTION public.dispatch_next_offer(p_request_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  r    public.requests;
  prov uuid;
  px   numeric;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null
     or r.dispatch_mode <> 'instant'
     or r.status <> 'finding'
     or r.awarded_provider_id is not null then
    return;
  end if;

  if exists (select 1 from public.offers o where o.request_id = r.id and o.status = 'pending') then
    return;
  end if;

  prov := public.dispatch_score_and_log(r.id);   -- score + log the pass, get the top eligible
  if prov is null then return; end if;            -- exhausted; leave 'finding'

  -- Price strictly from the matched pro's OWN flat rate for this service's sub-job.
  -- The ranker's 'no_rate' gate guarantees this pro has one; the null-guard is defensive.
  select psr.amount into px
  from public.services sv
  join public.provider_subjob_rates psr
    on psr.member_id    = prov
   and psr.service_slug = sv.service_slug
   and psr.option_slug  = sv.option_slug
   and psr.price_model  = 'flat'
   and psr.active
  where sv.id = r.service_id;

  if px is null then return; end if;  -- no own-rate ⇒ never offer at a platform price

  insert into public.job_grants (request_id, provider_id)
    values (r.id, prov) on conflict (request_id, provider_id) do nothing;

  insert into public.offers (request_id, provider_id, pay, note, status, respond_by, distance_label, rate_source)
    values (r.id, prov, px,
            'your rate · paid on completion', 'pending', now() + make_interval(secs => coalesce(public.app_setting('instant_offer_window_seconds')::int, 300)), 'nearby', 'own');
end $function$;

-- create_notification: the new Pro alert types belong to the 'offers' preference.
CREATE OR REPLACE FUNCTION public.create_notification(p_member_id uuid, p_type text, p_title text, p_body text, p_request_id uuid DEFAULT NULL::uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_cat     text;
  v_enabled boolean;
begin
  if p_member_id is null then return; end if;

  v_cat := case p_type
             when 'offer'    then 'offers'
             when 'awarded'  then 'offers'
             when 'job_offer' then 'offers'
             when 'new_job'   then 'offers'
             when 'enroute'  then 'job_updates'
             when 'complete' then 'job_updates'
             when 'paid'     then 'payments'
             else 'other'
           end;

  -- Recipient's preference for this category (definer bypasses RLS to read it).
  select case v_cat
           when 'offers'      then offers
           when 'job_updates' then job_updates
           when 'payments'    then payments
           else true
         end
    into v_enabled
    from public.notification_preferences
   where member_id = p_member_id;

  -- Skip only when the recipient has explicitly muted this category.
  if v_enabled is not null and v_enabled = false then return; end if;

  insert into public.notifications (member_id, type, title, body, request_id)
    values (p_member_id, p_type, p_title, p_body, p_request_id);
end $function$;

-- --- 3. "does this member provide this service" for ANY member -----------------
create or replace function public.member_provides_service_for(
  p_member uuid, p_service_slug text, p_option_slug text, p_category public.category_key)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when p_option_slug is not null
         and exists (select 1 from public.provider_profiles p where p.member_id = p_member and p.precise_matching)
         and exists (select 1 from public.provider_subjob_rates r where r.member_id = p_member and r.active)
    then exists (
      select 1 from public.provider_subjob_rates r
      where r.member_id = p_member
        and r.service_slug = p_service_slug and r.option_slug = p_option_slug and r.active)
    else
      (p_service_slug is not null and exists (
        select 1 from public.provider_subjob_rates r
        where r.member_id = p_member and r.service_slug = p_service_slug and r.active))
      or exists (
        select 1 from public.provider_profiles p
        where p.member_id = p_member and p_category = any (p.trades)
          and (p_service_slug is null
               or not exists (select 1 from public.provider_subjob_rates r2 where r2.member_id = p.member_id and r2.active)))
  end
$$;
revoke all on function public.member_provides_service_for(uuid, text, text, public.category_key) from public, anon, authenticated;

-- The RLS helper now delegates, so visibility and alerts can never disagree.
create or replace function public.member_provides_service(
  p_service_slug text, p_option_slug text, p_category public.category_key)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.member_provides_service_for(public.current_member_id(), p_service_slug, p_option_slug, p_category)
$$;

-- --- 2. instant offer -> notify the Pro ---------------------------------------------
create or replace function public.notify_pro_of_offer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_title text;
  v_mins  int;
begin
  if new.status <> 'pending' then return new; end if;
  select title into v_title from public.requests where id = new.request_id;
  v_mins := greatest(1, ceil(extract(epoch from (new.respond_by - now())) / 60.0))::int;
  perform public.create_notification(
    new.provider_id, 'job_offer', 'New job offer',
    coalesce(v_title, 'A new job') || ' · $' || round(new.pay)::text
      || ' · accept within ' || v_mins || case when v_mins = 1 then ' minute' else ' minutes' end,
    new.request_id);
  return new;
end
$$;

drop trigger if exists offers_notify_pro on public.offers;
create trigger offers_notify_pro after insert on public.offers
  for each row execute function public.notify_pro_of_offer();

-- --- 3. new quote job -> notify matching verified Pros ---------------------------
create or replace function public.notify_pros_of_quote_job()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare pro uuid;
begin
  if new.dispatch_mode <> 'quote' or new.status <> 'finding' or new.category is null then
    return new;
  end if;
  for pro in
    select p.member_id
    from public.provider_profiles p
    where p.verified
      and p.member_id <> new.requester_id
      and public.member_provides_service_for(p.member_id, new.service_slug, new.option_slug, new.category)
  loop
    perform public.create_notification(
      pro, 'new_job', 'New job to quote',
      coalesce(new.title, 'A new job') || coalesce(' · ' || new.location_label, ''),
      new.id);
  end loop;
  return new;
end
$$;

drop trigger if exists requests_notify_pros on public.requests;
create trigger requests_notify_pros after insert on public.requests
  for each row execute function public.notify_pros_of_quote_job();

-- --- 4. email the Pro alerts via the app ------------------------------------------
create or replace function public.email_pro_alert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
  v_base   text;
  v_email  text;
  v_name   text;
  v_title  text;
  v_place  text;
  v_pay    numeric;
  v_due    timestamptz;
begin
  if new.type not in ('job_offer', 'new_job') or new.request_id is null then
    return new;
  end if;

  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'notify_hook_secret' limit 1;
  v_base := public.app_setting('app_base_url');
  if v_secret is null or v_base is null then
    return new; -- email bridge not configured (e.g. local / tests)
  end if;

  select u.email, coalesce(pp.display_name, m.display_name)
    into v_email, v_name
    from public.members m
    join auth.users u on u.id::text = m.auth_user_id
    left join public.provider_profiles pp on pp.member_id = m.id
   where m.id = new.member_id;
  if v_email is null then return new; end if;  -- seed / test Pros have no login

  select title, location_label into v_title, v_place from public.requests where id = new.request_id;

  if new.type = 'job_offer' then
    select pay, respond_by into v_pay, v_due
      from public.offers
     where request_id = new.request_id and provider_id = new.member_id and status = 'pending'
     order by created_at desc limit 1;
  end if;

  perform net.http_post(
    url     := v_base || '/api/hooks/notification-email',
    body    := jsonb_build_object(
                 'type', new.type,
                 'to', v_email,
                 'name', v_name,
                 'job_title', v_title,
                 'pay', v_pay,
                 'respond_seconds', case when v_due is null then null
                                         else greatest(0, extract(epoch from (v_due - now())))::int end,
                 'place', v_place,
                 'request_id', new.request_id),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-guildry-hook-secret', v_secret),
    timeout_milliseconds := 5000);
  return new;
exception when others then
  -- Never let an email problem block a dispatch or a job post.
  raise warning 'email_pro_alert: %', sqlerrm;
  return new;
end
$$;

drop trigger if exists notifications_email_pro_alert on public.notifications;
create trigger notifications_email_pro_alert after insert on public.notifications
  for each row execute function public.email_pro_alert();

revoke all on function public.notify_pro_of_offer() from public, anon, authenticated;
revoke all on function public.notify_pros_of_quote_job() from public, anon, authenticated;
revoke all on function public.email_pro_alert() from public, anon, authenticated;
