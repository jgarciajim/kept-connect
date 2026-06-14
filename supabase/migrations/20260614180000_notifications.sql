-- =============================================================================
-- Notifications — in-app, event-driven.
--
-- A recipient-owned notifications table written by the existing transition RPCs
-- (each notifies the OTHER party). RLS is read-only for the owner; rows are created
-- only by SECURITY DEFINER functions, and marked read via an RPC. Email/push and
-- per-type preferences are later layers behind this table.
-- =============================================================================

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references public.members(id) on delete cascade,  -- recipient
  type       text not null,
  title      text not null,
  body       text,
  request_id uuid references public.requests(id) on delete set null,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_member_created_idx on public.notifications (member_id, created_at desc);

alter table public.notifications enable row level security;
revoke all on public.notifications from anon;
grant select on public.notifications to authenticated;  -- read own; created/updated via RPCs only

create policy notifications_select_own on public.notifications
  for select using (member_id = public.current_member_id());

-- ----------------------------------------------------------------------------
-- create_notification — the single insertion point (SECURITY DEFINER). No-op on
-- a null recipient so callers can pass a column that might be unset.
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
begin
  if p_member_id is null then return; end if;
  insert into public.notifications (member_id, type, title, body, request_id)
    values (p_member_id, p_type, p_title, p_body, p_request_id);
end $$;

-- Mark the caller's unread notifications read.
create or replace function public.mark_notifications_read()
returns void
language sql
security definer
set search_path = public
as $$
  update public.notifications
     set read_at = now()
   where member_id = public.current_member_id() and read_at is null;
$$;

grant execute on function public.mark_notifications_read() to authenticated;

-- ----------------------------------------------------------------------------
-- Wire notifications into the transition RPCs (full redefinitions). Each notifies
-- the party who DIDN'T take the action.
-- ----------------------------------------------------------------------------

-- send_offer → notify the request owner.
create or replace function public.send_offer(p_request_id uuid, p_custom_amount numeric default null)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me       uuid := public.current_member_id();
  r        public.requests;
  v_rate   public.provider_rates;
  v_amount numeric(10,2);
  v_source public.rate_source_kind;
  v_id     uuid;
begin
  select * into r from public.requests where id = p_request_id;
  if r.id is null then raise exception 'request not found'; end if;
  if r.status <> 'finding' then raise exception 'request is not open'; end if;
  if not exists (
    select 1 from public.provider_profiles p
    where p.member_id = me and r.category = any (p.trades)
  ) then
    raise exception 'not in your trade';
  end if;

  if p_custom_amount is not null then
    v_amount := p_custom_amount;
    v_source := 'own';
  else
    select * into v_rate from public.provider_rates
      where member_id = me and service_slug = r.service_slug;
    if v_rate.member_id is null then
      raise exception 'no rate set for this service';
    end if;
    v_amount := v_rate.amount;
    v_source := v_rate.rate_source;
  end if;

  insert into public.quotes (request_id, provider_id, price, rate_source, status)
    values (p_request_id, me, v_amount, v_source, 'open')
    on conflict (request_id, provider_id) do update
      set price = excluded.price, rate_source = excluded.rate_source, status = 'open'
    returning id into v_id;

  perform public.create_notification(
    r.requester_id, 'offer', 'New offer',
    '$' || v_amount::text || ' on ' || coalesce(r.title, 'your request'), r.id);
  return v_id;
end $$;

-- award_quote → notify the awarded provider.
create or replace function public.award_quote(p_quote_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare q public.quotes;
begin
  select * into q from public.quotes where id = p_quote_id;
  if q.id is null then raise exception 'quote not found'; end if;
  if not public.member_owns_request(q.request_id) then
    raise exception 'not authorized to award this request';
  end if;

  update public.requests
     set status = 'awarded',
         awarded_provider_id = q.provider_id,
         awarded_quote_id    = q.id,
         agreed_price        = q.price
   where id = q.request_id;

  insert into public.job_grants (request_id, provider_id)
    values (q.request_id, q.provider_id)
    on conflict (request_id, provider_id) do nothing;

  update public.quotes set status = 'awarded' where id = q.id;
  update public.quotes set status = 'declined'
   where request_id = q.request_id and id <> q.id and status = 'open';

  perform public.create_notification(
    q.provider_id, 'awarded', 'Quote accepted', 'Your quote was accepted', q.request_id);
end $$;

-- start_job → notify the request owner.
create or replace function public.start_job(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_req uuid;
begin
  update public.requests set status = 'enroute'
   where id = p_request_id
     and awarded_provider_id = public.current_member_id()
     and status = 'awarded'
   returning requester_id into v_req;
  if v_req is null then raise exception 'cannot start this job'; end if;
  perform public.create_notification(v_req, 'enroute', 'On the way', 'Your pro is on the way', p_request_id);
end $$;

-- complete_job → notify the request owner.
create or replace function public.complete_job(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare v_req uuid;
begin
  update public.requests set status = 'complete', completed_at = now()
   where id = p_request_id
     and awarded_provider_id = public.current_member_id()
     and status = 'enroute'
   returning requester_id into v_req;
  if v_req is null then raise exception 'cannot complete this job'; end if;
  perform public.create_notification(v_req, 'complete', 'Job complete', 'Job complete — rate your pro', p_request_id);
end $$;

-- mark_paid → notify the provider.
create or replace function public.mark_paid(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare r public.requests;
begin
  select * into r from public.requests where id = p_request_id;
  if r.awarded_provider_id <> public.current_member_id() then
    raise exception 'not your job';
  end if;

  update public.requests set status = 'paid', paid_at = now() where id = r.id;
  insert into public.payouts (request_id, provider_id, job_label, amount, status, paid_at)
    values (r.id, r.awarded_provider_id, r.title, coalesce(r.agreed_price, 0), 'paid', now());

  perform public.create_notification(
    r.awarded_provider_id, 'paid', 'You were paid',
    '$' || coalesce(r.agreed_price, 0)::text, r.id);
end $$;
