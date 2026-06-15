-- =============================================================================
-- Notification preferences — per-category mute toggles.
--
-- A member can mute categories of notifications. The single insertion point
-- create_notification maps the event type → category and checks the RECIPIENT's
-- preference before inserting, so none of the event RPCs change. Default = all on
-- (no row, or unknown category → send).
--   Offers      ← offer, awarded
--   Job updates ← enroute, complete
--   Payments    ← paid
-- =============================================================================

create table public.notification_preferences (
  member_id   uuid primary key references public.members(id) on delete cascade,
  offers      boolean not null default true,
  job_updates boolean not null default true,
  payments    boolean not null default true
);

alter table public.notification_preferences enable row level security;
revoke all on public.notification_preferences from anon;
grant select on public.notification_preferences to authenticated;  -- read own; written via RPC

create policy notification_preferences_select_own on public.notification_preferences
  for select using (member_id = public.current_member_id());

-- Upsert one toggle for the caller.
create or replace function public.set_notification_pref(p_category text, p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare me uuid := public.current_member_id();
begin
  if me is null then raise exception 'no member for current session'; end if;
  insert into public.notification_preferences (member_id) values (me) on conflict (member_id) do nothing;
  update public.notification_preferences
     set offers      = case when p_category = 'offers'      then p_enabled else offers end,
         job_updates = case when p_category = 'job_updates' then p_enabled else job_updates end,
         payments    = case when p_category = 'payments'    then p_enabled else payments end
   where member_id = me;
end $$;

grant execute on function public.set_notification_pref(text, boolean) to authenticated;

-- ----------------------------------------------------------------------------
-- create_notification (full redefinition) — now respects the recipient's prefs.
-- ----------------------------------------------------------------------------
create or replace function public.create_notification(
  p_member_id  uuid,
  p_type       text,
  p_title      text,
  p_body       text,
  p_request_id uuid default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cat     text;
  v_enabled boolean;
begin
  if p_member_id is null then return; end if;

  v_cat := case p_type
             when 'offer'    then 'offers'
             when 'awarded'  then 'offers'
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
end $$;
