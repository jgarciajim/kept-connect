"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { benchmarkMidpoint, BENCHMARK_VERSION } from "@/lib/pricing";

/**
 * Provider write actions. State transitions go through the SECURITY DEFINER RPCs
 * (accept_offer / start_job / complete_job / mark_paid / send_offer), which assert
 * the caller's role and mutate only the intended columns — RLS is row-level, not
 * column-level.
 */

async function myMemberId(sb: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<string | null> {
  const { data } = await sb.from("members").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

/** Accept a round-robin offer at the set rate → grants + awards the job. */
export async function acceptOffer(offerId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("accept_offer", { p_offer_id: offerId });
  redirect("/work/jobs/active");
}

/** Decline a round-robin offer → the engine advances to the next eligible pro. */
export async function declineOffer(offerId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("decline_offer", { p_offer_id: offerId });
  revalidatePath("/work");
}

export async function startJob(requestId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("start_job", { p_request_id: requestId });
  revalidatePath("/work/jobs/active");
}

export async function completeJob(requestId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("complete_job", { p_request_id: requestId });
  revalidatePath("/work/jobs/active");
}

/** Stub payout: flips status + records a paid payout row (no real money). */
export async function markPaid(requestId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("mark_paid", { p_request_id: requestId });
  revalidatePath("/work/jobs/active");
}

// ---------------------------------------------------------------------------
// Provider rates (the classification spine) + sending an offer.
// ---------------------------------------------------------------------------

/** Set the provider's OWN price for a service (dollars). */
export async function setOwnRate(serviceSlug: string, amount: number): Promise<void> {
  if (!serviceSlug || !(amount > 0)) return;
  const sb = await createServerSupabaseClient();
  const meId = await myMemberId(sb);
  if (!meId) return;
  await sb.from("provider_rates").upsert({
    member_id: meId,
    service_slug: serviceSlug,
    amount,
    rate_source: "own",
    effective_from: new Date().toISOString(),
  });
  revalidatePath("/work/rates");
}

/**
 * Opt into the platform benchmark for a service. The accepted amount is computed
 * server-side from lib/pricing (never trusted from the client), stored as the
 * provider's rate (rate_source 'benchmark'), and the opt-in is logged with version
 * — the classification audit trail.
 */
export async function optInBenchmark(serviceSlug: string): Promise<void> {
  const cents = benchmarkMidpoint(serviceSlug);
  if (cents == null) return; // gap service — no benchmark to opt into
  const amount = cents / 100;
  const sb = await createServerSupabaseClient();
  const meId = await myMemberId(sb);
  if (!meId) return;
  await sb.from("provider_rates").upsert({
    member_id: meId,
    service_slug: serviceSlug,
    amount,
    rate_source: "benchmark",
    effective_from: new Date().toISOString(),
  });
  await sb.from("benchmark_optins").insert({
    member_id: meId,
    service_slug: serviceSlug,
    benchmark_version: BENCHMARK_VERSION,
  });
  revalidatePath("/work/rates");
}

/**
 * Submit (or resubmit) a verification application → status 'pending'. Document
 * bytes are uploaded client-side to Storage first; this records the paths + fields
 * via the safe RPC (a provider can never self-set 'verified').
 */
export async function submitVerification(input: {
  licenseType: string;
  licenseNumber: string;
  insuranceCarrier: string;
  coiExpiry: string | null;
  yearsInTrade: number | null;
  w9Path: string | null;
  coiPath: string | null;
  licensePhotoPath: string | null;
  attested: boolean;
}): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("submit_verification", {
    p_license_type: input.licenseType.trim() || null,
    p_license_number: input.licenseNumber.trim() || null,
    p_insurance_carrier: input.insuranceCarrier.trim() || null,
    p_coi_expiry: input.coiExpiry || null,
    p_years_in_trade: input.yearsInTrade,
    p_w9_path: input.w9Path,
    p_coi_path: input.coiPath,
    p_license_photo_path: input.licensePhotoPath,
    p_attested: input.attested,
  });
  revalidatePath("/work/you");
  redirect("/work/you");
}

/** Send an offer at the provider's own/opted rate → a quote the requester accepts. */
export async function sendOffer(requestId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("send_offer", { p_request_id: requestId });
  redirect("/work");
}

/** Send a custom sealed quote (provider's own number). */
export async function sendQuote(requestId: string, amount: number): Promise<void> {
  if (!(amount > 0)) return;
  const sb = await createServerSupabaseClient();
  await sb.rpc("send_offer", { p_request_id: requestId, p_custom_amount: amount });
  redirect("/work");
}

/**
 * Onboarding — turn the current member into a provider (profile + wallet + online),
 * then send them to set a rate (sending an offer needs one). No SQL seeding.
 */
export async function becomeProvider(displayName: string, trades: string[]): Promise<void> {
  if (!displayName.trim() || trades.length === 0) return;
  const sb = await createServerSupabaseClient();
  await sb.rpc("become_provider", { p_display_name: displayName.trim(), p_trades: trades });
  redirect("/work/rates");
}

// ---------------------------------------------------------------------------
// Profile edits — all via the safe update_provider_profile RPC (trust columns
// like rating/verified are NOT writable).
// ---------------------------------------------------------------------------

/** Toggle availability. Drives the feed's Online state + open-request eligibility. */
export async function setOnline(online: boolean): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("update_provider_profile", { p_online: online });
  revalidatePath("/work/you");
  revalidatePath("/work");
}

/** Edit the provider's name, trades, and/or credentials (any subset). */
export async function updateProviderProfile(input: {
  displayName?: string;
  trades?: string[];
  credentials?: string[];
}): Promise<void> {
  const sb = await createServerSupabaseClient();
  const params: Record<string, unknown> = {};
  if (input.displayName !== undefined) params.p_display_name = input.displayName.trim();
  if (input.trades !== undefined) params.p_trades = input.trades;
  if (input.credentials !== undefined) params.p_credentials = input.credentials;
  await sb.rpc("update_provider_profile", params);
  // keep the private members.display_name in sync
  if (input.displayName !== undefined) {
    const { data: me } = await sb.from("members").select("id").limit(1).maybeSingle();
    if (me) await sb.from("members").update({ display_name: input.displayName.trim() }).eq("id", me.id);
  }
  revalidatePath("/work/you");
}
