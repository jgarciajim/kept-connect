import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryKey } from "@/components/ui";
import type { Offer, ScheduledJob, ActiveJob, Payout, EarningsSummary, ProviderSelf, ProviderRate, OpenRequest, ProviderReview, JobHistoryItem, MyVerification } from "./mock";

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
    tradeKeys: (p.trades ?? []) as CategoryKey[],
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
    time: "Scheduled",
    pay: money(r.agreed_price),
  }));
}

// The provider's in-flight jobs (awarded + enroute) — the Active tab list.
export async function qGetActiveJobsList(c: SupabaseClient): Promise<ScheduledJob[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("id, category, title, location_label, agreed_price, status")
    .eq("awarded_provider_id", meId)
    .in("status", ["awarded", "enroute"])
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    trade: (r.category ?? "fixtures") as CategoryKey,
    title: r.title ?? "",
    place: r.location_label ?? "",
    time: r.status === "enroute" ? "On the way" : "Scheduled",
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

export async function qGetProviderRates(c: SupabaseClient): Promise<ProviderRate[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("provider_rates")
    .select("service_slug, amount, rate_source")
    .eq("member_id", meId);
  return (data ?? []).map((r) => ({
    serviceSlug: r.service_slug,
    amount: money(r.amount),
    rateSource: r.rate_source === "benchmark" ? "benchmark" : "own",
  }));
}

function mapOpenRequest(r: {
  id: string; category: CategoryKey | null; service_slug: string | null;
  title: string | null; description: string | null; location_label: string | null;
  urgency: string | null; created_at: string;
}): OpenRequest {
  return {
    id: r.id,
    trade: (r.category ?? "fixtures") as CategoryKey,
    serviceSlug: r.service_slug ?? null,
    title: r.title ?? "",
    place: r.location_label ?? "",
    description: r.description ?? "",
    urgency: r.urgency ?? "same_day",
    when: relativeWhen(r.created_at),
  };
}

// Open (finding) requests in the provider's trade — RLS does the trade/status
// filtering (requests_select_open_for_trade_provider). Excludes the member's own.
export async function qGetOpenRequests(c: SupabaseClient): Promise<OpenRequest[]> {
  const meId = await myMemberId(c);
  const { data } = await c
    .from("requests")
    .select("id, category, service_slug, title, description, location_label, urgency, created_at, requester_id")
    .eq("status", "finding")
    .order("created_at", { ascending: false });
  return (data ?? []).filter((r) => r.requester_id !== meId).map(mapOpenRequest);
}

export async function qGetOpenRequest(c: SupabaseClient, id: string): Promise<OpenRequest | null> {
  const { data } = await c
    .from("requests")
    .select("id, category, service_slug, title, description, location_label, urgency, created_at")
    .eq("id", id)
    .eq("status", "finding")
    .maybeSingle();
  if (!data) return null;
  return mapOpenRequest(data);
}

export async function qGetMyVerification(c: SupabaseClient): Promise<MyVerification> {
  const { data } = await c
    .from("provider_verifications")
    .select("status, license_type, license_number, insurance_carrier, coi_expiry, years_in_trade, reason")
    .limit(1)
    .maybeSingle();
  if (!data) return { status: "unsubmitted", licenseType: null, licenseNumber: null, insuranceCarrier: null, coiExpiry: null, yearsInTrade: null, reason: null };
  return {
    status: data.status,
    licenseType: data.license_type ?? null,
    licenseNumber: data.license_number ?? null,
    insuranceCarrier: data.insurance_carrier ?? null,
    coiExpiry: data.coi_expiry ?? null,
    yearsInTrade: data.years_in_trade ?? null,
    reason: data.reason ?? null,
  };
}

export async function qGetMyReviews(c: SupabaseClient): Promise<ProviderReview[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("reviews")
    .select("id, stars, body, author_name, created_at")
    .eq("subject_id", meId)
    .eq("subject_role", "provider")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    author: r.author_name ?? "",
    when: relativeWhen(r.created_at),
    stars: r.stars,
    text: r.body ?? "",
  }));
}

export async function qGetJobHistory(c: SupabaseClient): Promise<JobHistoryItem[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("id, category, title, agreed_price, status, completed_at, created_at")
    .eq("awarded_provider_id", meId)
    .in("status", ["complete", "paid", "rated"])
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    trade: (r.category ?? "fixtures") as CategoryKey,
    title: r.title ?? "",
    when: relativeWhen(r.completed_at ?? r.created_at),
    payout: money(r.agreed_price),
    status: r.status,
  }));
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
