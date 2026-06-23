"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { benchmarkMidpoint, BENCHMARK_VERSION } from "@/lib/pricing";
import { vettingAdapter } from "@/lib/vetting";
import { SERVICES } from "@/lib/requester/services";

export type PriceModelInput = "flat" | "per_unit" | "tiered" | "quote";
type RateInput = { serviceSlug: string; optionSlug: string; model: PriceModelInput; amount: number | null; unit: string | null; tiers?: Array<{ label: string; amount: number }> };

/** Build validated provider_subjob_rates rows from the wizard/editor input. */
function buildRateRows(meId: string, rates: RateInput[]): object[] {
  return rates
    .map((r) => {
      const base = { member_id: meId, service_slug: r.serviceSlug, option_slug: r.optionSlug, price_model: r.model, amount: null as number | null, unit: null as string | null, active: true };
      if (r.model === "flat") {
        if (!(typeof r.amount === "number" && r.amount > 0)) return null;
        base.amount = r.amount;
      } else if (r.model === "per_unit") {
        if (!(typeof r.amount === "number" && r.amount > 0) || !r.unit) return null;
        base.amount = r.amount;
        base.unit = r.unit;
      } // tiered / quote: amount + unit stay null
      return base;
    })
    .filter(Boolean) as object[];
}

/** Build provider_subjob_tiers rows for any tiered rates (parent rows must exist first). */
function buildTierRows(meId: string, rates: RateInput[]): object[] {
  const rows: object[] = [];
  for (const r of rates) {
    if (r.model !== "tiered" || !r.tiers) continue;
    r.tiers.forEach((t, i) => {
      if (t.label.trim() && t.amount > 0) rows.push({ member_id: meId, service_slug: r.serviceSlug, option_slug: r.optionSlug, label: t.label.trim(), amount: t.amount, sort: i });
    });
  }
  return rows;
}

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
 * Set (or update) the provider's price for ONE sub-job. Owner-scoped via RLS.
 * The price model decides which fields are required (flat → amount; per_unit →
 * amount + unit; quote → neither). Written immediately so onboarding progress
 * survives. '__other' is the per-trade custom catch-all (always a quote).
 */
export async function setSubjobRate(input: {
  serviceSlug: string;
  optionSlug: string;
  model: PriceModelInput;
  amount?: number | null;
  unit?: string | null;
}): Promise<void> {
  if (!input.serviceSlug || !input.optionSlug) return;
  const sb = await createServerSupabaseClient();
  const meId = await myMemberId(sb);
  if (!meId) return;

  const row: Record<string, unknown> = {
    member_id: meId,
    service_slug: input.serviceSlug,
    option_slug: input.optionSlug,
    price_model: input.model,
    amount: null,
    unit: null,
    active: true,
    effective_from: new Date().toISOString(),
  };
  if (input.model === "flat") {
    if (!(typeof input.amount === "number" && input.amount > 0)) return;
    row.amount = input.amount;
  } else if (input.model === "per_unit") {
    if (!(typeof input.amount === "number" && input.amount > 0) || !input.unit) return;
    row.amount = input.amount;
    row.unit = input.unit;
  } // quote: amount + unit stay null

  await sb.from("provider_subjob_rates").upsert(row, { onConflict: "member_id,service_slug,option_slug" });
  revalidatePath("/work/rates");
  revalidatePath("/work/onboarding");
}

/**
 * Replace the provider's full sub-job pricing set (the /work/rates editor). Deletes
 * the existing rows and inserts the given set — RLS scopes both to the owner. Each
 * row is validated for its model (invalid rows are dropped).
 */
export async function saveSubjobRates(rates: RateInput[]): Promise<void> {
  const sb = await createServerSupabaseClient();
  const meId = await myMemberId(sb);
  if (!meId) return;
  const rows = buildRateRows(meId, rates);
  const tierRows = buildTierRows(meId, rates);
  await sb.from("provider_subjob_rates").delete().eq("member_id", meId); // FK cascades the old tiers
  if (rows.length) await sb.from("provider_subjob_rates").insert(rows);
  if (tierRows.length) await sb.from("provider_subjob_tiers").insert(tierRows);
  revalidatePath("/work/rates");
}

/** Persist the provider's name early (creates the offline profile) so resume keeps it. */
export async function saveProviderName(name: string): Promise<void> {
  if (!name.trim()) return;
  const sb = await createServerSupabaseClient();
  await sb.rpc("become_provider", { p_display_name: name.trim(), p_trades: [] });
}

/**
 * Persist an onboarding DRAFT (status stays 'unsubmitted') so the wizard resumes.
 * Called per step; documents are already uploaded to Storage (paths only here).
 */
export async function saveOnboardingDraft(input: {
  legalFirstName: string;
  legalLastName: string;
  dob: string | null;
  bgConsent: boolean;
  idDocPath: string | null;
  licenseType: string;
  licenseNumber: string;
  insuranceCarrier: string;
  coiExpiry: string | null;
  yearsInTrade: number | null;
  w9Path: string | null;
  coiPath: string | null;
  licensePhotoPath: string | null;
}): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("save_verification_draft", {
    p_legal_first: input.legalFirstName.trim() || null,
    p_legal_last: input.legalLastName.trim() || null,
    p_dob: input.dob || null,
    p_bg_consent: input.bgConsent,
    p_id_doc_path: input.idDocPath,
    p_license_type: input.licenseType.trim() || null,
    p_license_number: input.licenseNumber.trim() || null,
    p_insurance_carrier: input.insuranceCarrier.trim() || null,
    p_coi_expiry: input.coiExpiry || null,
    p_years_in_trade: input.yearsInTrade,
    p_w9_path: input.w9Path,
    p_coi_path: input.coiPath,
    p_license_photo_path: input.licensePhotoPath,
  });
}

/** Remove a sub-job from the provider's offering (RLS scopes the delete to them). */
export async function removeSubjobRate(serviceSlug: string, optionSlug: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  const meId = await myMemberId(sb);
  if (!meId) return;
  await sb
    .from("provider_subjob_rates")
    .delete()
    .eq("member_id", meId)
    .eq("service_slug", serviceSlug)
    .eq("option_slug", optionSlug);
  revalidatePath("/work/rates");
  revalidatePath("/work/onboarding");
}

/**
 * Submit the onboarding application. Creates the provider profile (OFFLINE — goes
 * live only on admin approval), kicks the background-check + ID verification via
 * the vetting adapter (mock until keys are set; nothing fake asserted), and records
 * the full application via the safe RPC (status → 'pending'). Document bytes were
 * uploaded client-side to Storage first; this records the paths. Sub-job pricing is
 * written separately (setSubjobRate) as the contractor configures it.
 */
export async function submitOnboarding(input: {
  displayName: string;
  rates: RateInput[];
  legalFirstName: string;
  legalLastName: string;
  dob: string | null;
  bgConsent: boolean;
  idDocPath: string | null;
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
  const meId = (await myMemberId(sb)) ?? "";
  const subject = {
    memberId: meId,
    legalFirstName: input.legalFirstName.trim(),
    legalLastName: input.legalLastName.trim(),
    dob: input.dob || null,
  };
  const bg = await vettingAdapter.startBackgroundCheck(subject);
  const id = await vettingAdapter.startIdVerification(subject);

  // Trade families are derived from the services the provider priced sub-jobs in.
  const families = Array.from(
    new Set(input.rates.map((r) => SERVICES.find((s) => s.slug === r.serviceSlug)?.family).filter(Boolean)),
  ) as string[];

  await sb.rpc("become_provider", { p_display_name: input.displayName.trim(), p_trades: families });

  // Persist the sub-job pricing (validated rows; RLS scopes to the owner).
  if (meId && input.rates.length) {
    const rows = buildRateRows(meId, input.rates);
    const tierRows = buildTierRows(meId, input.rates);
    if (rows.length) await sb.from("provider_subjob_rates").upsert(rows, { onConflict: "member_id,service_slug,option_slug" });
    await sb.from("provider_subjob_tiers").delete().eq("member_id", meId); // clear any prior bands on resubmit
    if (tierRows.length) await sb.from("provider_subjob_tiers").insert(tierRows);
  }

  await sb.rpc("submit_verification", {
    p_legal_first: input.legalFirstName.trim() || null,
    p_legal_last: input.legalLastName.trim() || null,
    p_dob: input.dob || null,
    p_bg_consent: input.bgConsent,
    p_bg_ref: bg.ref,
    p_id_ref: id.ref,
    p_id_doc_path: input.idDocPath,
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
  redirect("/work/onboarding/done");
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

/** Opt into / out of option-level matching (only see requests for sub-jobs you priced). */
export async function setMatchPrecision(precise: boolean): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("set_match_precision", { p_precise: precise });
  revalidatePath("/work/rates");
  revalidatePath("/work");
}

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
