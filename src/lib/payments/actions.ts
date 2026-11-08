"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { rateCard, activeFeeConfig, dollarsToCents } from "@/lib/pricing";
import { notifyMember } from "@/lib/email/notify";
import { jobAwarded, paymentReleased } from "@/lib/email/templates";
import { paymentAdapter } from "./adapter";

/**
 * Pay & award — the requester confirms a quote: compute the fee split (lib/pricing,
 * cents), open escrow via the adapter, then award + record the held payment. Money
 * math lives in lib/pricing, not SQL.
 */
export async function payAndAward(formData: FormData): Promise<void> {
  const quoteId = String(formData.get("quoteId") || "");
  if (!quoteId) return;

  const sb = await createServerSupabaseClient();
  const { data: q } = await sb.from("quotes").select("id, request_id, price, provider_id").eq("id", quoteId).maybeSingle();
  if (!q) return;

  const base = dollarsToCents(Number(q.price));
  const rc = rateCard(base, activeFeeConfig);
  const { ref } = await paymentAdapter.createEscrow({ requestId: q.request_id, totalCents: rc.requesterAllIn });

  await sb.rpc("award_quote_paid", {
    p_quote_id: quoteId,
    p_total_cents: rc.requesterAllIn,
    p_fee_cents: rc.requesterFee,
    p_payout_cents: rc.providerPayout,
    p_margin_cents: rc.paymentsMargin,
    p_intent_ref: ref,
  });

  // Email the winning Pro that they got the job (paid payout = their quote price).
  const { data: req } = await sb.from("requests").select("title").eq("id", q.request_id).maybeSingle();
  await notifyMember(sb, q.provider_id, (name) =>
    jobAwarded(name, req?.title ?? "your job", Number(q.price).toFixed(2)),
  );

  redirect(`/app/jobs/${q.request_id}/track`);
}

/**
 * Release & pay — the provider marks the job paid: release escrow via the adapter,
 * then the RPC moves held → released (wallet credit + payout). Replaces the direct
 * mark_paid call.
 */
export async function releaseAndPay(requestId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  const { data: p } = await sb
    .from("payments")
    .select("intent_ref")
    .eq("request_id", requestId)
    .eq("status", "held")
    .maybeSingle();
  if (p?.intent_ref) await paymentAdapter.releaseEscrow(p.intent_ref);

  // Grab the customer + job details for the receipt before the status moves.
  const { data: req } = await sb
    .from("requests")
    .select("requester_id, title, agreed_price")
    .eq("id", requestId)
    .maybeSingle();

  await sb.rpc("mark_paid", { p_request_id: requestId });

  // Email the customer a completion receipt.
  if (req?.requester_id) {
    await notifyMember(sb, req.requester_id, (name) =>
      paymentReleased(name, req.title ?? "your job", req.agreed_price ? Number(req.agreed_price).toFixed(2) : ""),
    );
  }

  revalidatePath("/work/jobs/active");
}
