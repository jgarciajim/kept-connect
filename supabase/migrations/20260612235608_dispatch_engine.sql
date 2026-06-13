-- =============================================================================
-- D13 (2/2) — the round-robin dispatch engine.
--
-- For 'instant' (fixed-price) requests: offer the job to eligible providers one
-- at a time, at the set price, with a respond timer; first to Accept wins.
-- All engine functions are SECURITY DEFINER so they bypass RLS for their internal
-- bookkeeping while still scoping by the request/provider in question.
--
-- pg_cron is NOT created here (kept portable); the hosted handoff enables it to
-- run dispatch_tick() on a schedule. Locally, call dispatch_tick() directly.
-- =============================================================================

-- Pick the next eligible provider for a request, or null:
-- trade matches, online, not the requester, and not already offered this request.
-- Round-robin fairness: fewest total offers first, then highest rating.
create or replace function public.dispatch_eligible_provider(p_request_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select pp.member_id
  from public.requests r
  join public.provider_profiles pp on r.category = any(pp.trades)
  where r.id = p_request_id
    and pp.online = true
    and pp.member_id <> r.requester_id
    and not exists (
      select 1 from public.offers o
      where o.request_id = r.id and o.provider_id = pp.member_id
    )
  order by (select count(*) from public.offers o2 where o2.provider_id = pp.member_id) asc,
           pp.rating desc
  limit 1
$$;

-- Offer the job to the next eligible provider (one pending offer at a time).
create or replace function public.dispatch_next_offer(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
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

  -- already a live offer out? wait for it.
  if exists (select 1 from public.offers o where o.request_id = r.id and o.status = 'pending') then
    return;
  end if;

  prov := public.dispatch_eligible_provider(r.id);
  if prov is null then return; end if;  -- exhausted; leave 'finding'

  select base_price into px from public.services where id = r.service_id;

  -- offer implies a grant (so the provider can see the request + accept it).
  insert into public.job_grants (request_id, provider_id)
    values (r.id, prov) on conflict do nothing;

  insert into public.offers (request_id, provider_id, pay, note, status, respond_by, distance_label)
    values (r.id, prov, coalesce(px, r.agreed_price, 0),
            'set rate · paid on completion', 'pending', now() + interval '45 seconds', 'nearby');
end $$;

-- Kick off dispatch the moment an instant request is posted.
create or replace function public.dispatch_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if NEW.dispatch_mode = 'instant' and NEW.status = 'finding' then
    perform public.dispatch_next_offer(NEW.id);
  end if;
  return NEW;
end $$;

create trigger requests_dispatch_after_insert
  after insert on public.requests
  for each row execute function public.dispatch_on_insert();

-- The periodic tick: expire stale offers, then advance any stalled instant job.
-- Idempotent — safe to run on a schedule (pg_cron) or by hand.
create or replace function public.dispatch_tick()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare rec record;
begin
  update public.offers set status = 'expired'
    where status = 'pending' and respond_by < now();

  for rec in
    select r.id from public.requests r
    where r.dispatch_mode = 'instant'
      and r.status = 'finding'
      and r.awarded_provider_id is null
      and not exists (select 1 from public.offers o where o.request_id = r.id and o.status = 'pending')
  loop
    perform public.dispatch_next_offer(rec.id);
  end loop;
end $$;

-- accept_offer (redefined from D12): now also supersedes the round's other pending
-- offers so first-accept-wins truly ends the round.
create or replace function public.accept_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare o public.offers;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.provider_id <> public.current_member_id() then raise exception 'not your offer'; end if;

  update public.offers set status = 'accepted' where id = o.id;
  update public.offers set status = 'superseded'
    where request_id = o.request_id and id <> o.id and status = 'pending';

  insert into public.job_grants (request_id, provider_id)
    values (o.request_id, o.provider_id) on conflict do nothing;
  update public.requests
    set status = 'awarded', awarded_provider_id = o.provider_id, agreed_price = o.pay
    where id = o.request_id;
end $$;

-- Provider declines their offer → advance the round immediately.
create or replace function public.decline_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare o public.offers;
begin
  select * into o from public.offers where id = p_offer_id;
  if o.id is null then raise exception 'offer not found'; end if;
  if o.provider_id <> public.current_member_id() then raise exception 'not your offer'; end if;

  update public.offers set status = 'declined' where id = o.id;
  perform public.dispatch_next_offer(o.request_id);
end $$;
