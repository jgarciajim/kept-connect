-- =============================================================================
-- Payments & escrow — real money flow behind a mock adapter.
--
-- A payment is held when the requester confirms (award) and released when the
-- provider's job is marked paid: the net payout credits the provider wallet, a
-- payout row is written, and the platform fee/margin are recorded on the payment.
-- The fee split is computed in lib/pricing (cents) and passed in — never duplicated
-- in SQL. The actual charge/transfer is mocked (adapter); this is the real ledger.
-- =============================================================================

create type public.payment_status as enum ('held', 'released', 'refunded', 'failed');

create table public.payments (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.requests(id) on delete cascade,
  requester_id uuid not null references public.members(id) on delete cascade,
  provider_id  uuid not null references public.members(id) on delete cascade,
  total_cents  int not null,   -- requester all-in (base + service fee)
  fee_cents    int not null,   -- requester service fee
  payout_cents int not null,   -- provider net payout
  margin_cents int not null,   -- payments margin (Connect net component)
  status       public.payment_status not null default 'held',
  intent_ref   text,           -- payment provider ref (mock now)
  created_at   timestamptz not null default now(),
  released_at  timestamptz
);
create index payments_request_idx on public.payments (request_id);

alter table public.payments enable row level security;
revoke all on public.payments from anon;
grant select on public.payments to authenticated;  -- read by parties; written via RPCs only

-- Both parties to the request can see the payment (escrow status / receipt).
create policy payments_select_party on public.payments
  for select using (public.member_is_party(request_id));

-- ----------------------------------------------------------------------------
-- award_quote_paid — award + open escrow. Everything award_quote does, plus a
-- 'held' payment row carrying the split (computed by the caller via lib/pricing).
-- ----------------------------------------------------------------------------
create or replace function public.award_quote_paid(
  p_quote_id     uuid,
  p_total_cents  int,
  p_fee_cents    int,
  p_payout_cents int,
  p_margin_cents int,
  p_intent_ref   text
)
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

  insert into public.payments
    (request_id, requester_id, provider_id, total_cents, fee_cents, payout_cents, margin_cents, status, intent_ref)
    select q.request_id, r.requester_id, q.provider_id,
           p_total_cents, p_fee_cents, p_payout_cents, p_margin_cents, 'held', p_intent_ref
      from public.requests r where r.id = q.request_id;

  perform public.create_notification(
    q.provider_id, 'awarded', 'Quote accepted', 'Your quote was accepted — payment is held', q.request_id);
end $$;

grant execute on function public.award_quote_paid(uuid, int, int, int, int, text) to authenticated;

-- ----------------------------------------------------------------------------
-- mark_paid (rewritten) — release the held escrow: credit the provider wallet by
-- the net payout, write the payout, mark the request paid, notify. Falls back to
-- agreed_price when there is no escrow payment (old award path / tests).
-- ----------------------------------------------------------------------------
create or replace function public.mark_paid(p_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r public.requests;
  p public.payments;
  v_payout numeric(10,2);
begin
  select * into r from public.requests where id = p_request_id;
  if r.awarded_provider_id <> public.current_member_id() then
    raise exception 'not your job';
  end if;

  select * into p from public.payments
    where request_id = r.id and status = 'held'
    order by created_at desc limit 1;

  update public.requests set status = 'paid', paid_at = now() where id = r.id;

  if p.id is not null then
    v_payout := p.payout_cents / 100.0;
    update public.payments set status = 'released', released_at = now() where id = p.id;
    insert into public.provider_wallets (member_id, available_to_cashout)
      values (r.awarded_provider_id, v_payout)
      on conflict (member_id) do update
        set available_to_cashout = public.provider_wallets.available_to_cashout + excluded.available_to_cashout;
  else
    v_payout := coalesce(r.agreed_price, 0);
  end if;

  insert into public.payouts (request_id, provider_id, job_label, amount, status, paid_at)
    values (r.id, r.awarded_provider_id, r.title, v_payout, 'paid', now());

  perform public.create_notification(
    r.awarded_provider_id, 'paid', 'You were paid',
    '$' || to_char(v_payout, 'FM999990.00'), r.id);
end $$;
