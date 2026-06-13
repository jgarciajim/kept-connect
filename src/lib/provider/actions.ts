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
