import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryKey } from "@/components/ui";
import type { Offer, ScheduledJob, ActiveJob, Payout, EarningsSummary, ProviderSelf } from "./mock";

/**
 * Provider data layer — PURE query functions (take a Supabase client; no Clerk/
 * Next coupling), unit-testable against the local stack. The accessors in
 * ./mock.ts create the RLS-scoped client and delegate here.
 */

function money(v: unknown): string {
  if (v === null || v === undefined) return "0.00";
  return Number(v).toFixed(2);
}
function thousands(v: unknown): string {
  return Number(v ?? 0).toLocaleString("en-US");
}
function relativeWhen(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function myMemberId(c: SupabaseClient): Promise<string | null> {
  const { data } = await c.from("members").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function qGetProviderSelf(c: SupabaseClient): Promise<ProviderSelf | null> {
  const meId = await myMemberId(c);
  if (!meId) return null;
  const { data: p } = await c.from("provider_profiles").select("*").eq("member_id", meId).maybeSingle();
  if (!p) return null;
  const { data: w } = await c.from("provider_wallets").select("*").eq("member_id", meId).maybeSingle();
  return {
    id: p.member_id,
    name: p.display_name ?? "",
    rating: Number(p.rating),
    jobsDone: p.jobs_done,
    yearsOnKept: p.years_on_kept,
    verified: p.verified,
    online: p.online,
    availableToCashOut: money(w?.available_to_cashout),
    credentials: p.credentials ?? [],
    trades: p.trade_labels ?? [],
  };
}

export async function qGetCurrentOffer(c: SupabaseClient): Promise<Offer | null> {
  const { data: o } = await c
    .from("offers")
    .select("id, request_id, pay, note, respond_by, distance_label")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!o) return null;
  const { data: r } = await c
    .from("requests")
    .select("category, title, location_label")
    .eq("id", o.request_id)
    .maybeSingle();
  const respondSeconds = o.respond_by
    ? Math.max(0, Math.round((new Date(o.respond_by).getTime() - Date.now()) / 1000))
    : 0;
  return {
    id: o.id,
    requestId: o.request_id,
    trade: (r?.category ?? "fixtures") as CategoryKey,
    title: r?.title ?? "",
    place: r?.location_label ?? "",
    distance: o.distance_label ?? "",
    pay: money(o.pay),
    note: o.note ?? "",
    respondSeconds,
  };
}

export async function qGetScheduledJobs(c: SupabaseClient): Promise<ScheduledJob[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("id, category, title, location_label, agreed_price")
    .eq("awarded_provider_id", meId)
    .eq("status", "awarded")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    trade: (r.category ?? "fixtures") as CategoryKey,
    title: r.title ?? "",
    place: r.location_label ?? "",
    time: "Today",
    pay: money(r.agreed_price),
  }));
}

export async function qGetActiveJob(c: SupabaseClient, id: string): Promise<ActiveJob | null> {
  const meId = await myMemberId(c);
  if (!meId) return null;
  let query = c
    .from("requests")
    .select("id, category, title, requester_name, location_label, agreed_price")
    .eq("awarded_provider_id", meId)
    .in("status", ["awarded", "enroute"]);
  if (UUID.test(id)) query = query.eq("id", id);
  const { data: r } = await query.order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!r) return null;
  return {
    id: r.id,
    trade: (r.category ?? "fixtures") as CategoryKey,
    title: r.title ?? "",
    customerName: r.requester_name ?? "",
    addressLine: r.location_label ?? "",
    payout: money(r.agreed_price),
  };
}

export async function qGetEarnings(c: SupabaseClient): Promise<EarningsSummary> {
  const meId = await myMemberId(c);
  const empty: EarningsSummary = { availableToCashOut: "0.00", thisWeek: "0", jobsThisWeek: 0, rating: 0, payouts: [] };
  if (!meId) return empty;

  const { data: w } = await c.from("provider_wallets").select("*").eq("member_id", meId).maybeSingle();
  const { data: p } = await c.from("provider_profiles").select("rating").eq("member_id", meId).maybeSingle();
  const { data: rows } = await c
    .from("payouts")
    .select("id, job_label, payer_name, amount, status, created_at")
    .eq("provider_id", meId)
    .order("created_at", { ascending: false });

  const payouts: Payout[] = (rows ?? []).map((r) => ({
    id: r.id,
    job: r.job_label ?? "",
    who: r.payer_name ?? "",
    when: relativeWhen(r.created_at),
    amount: money(r.amount),
    status: r.status === "paid" ? "Paid" : "Pending",
  }));

  return {
    availableToCashOut: money(w?.available_to_cashout),
    thisWeek: thousands(w?.week_total),
    jobsThisWeek: w?.week_jobs ?? 0,
    rating: Number(p?.rating ?? 0),
    payouts,
  };
}
