"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Provider write actions. State transitions go through the SECURITY DEFINER RPCs
 * (accept_offer / start_job / complete_job / mark_paid), which assert the caller's
 * role and mutate only the intended columns — RLS is row-level, not column-level.
 */

/** Accept a round-robin offer at the set rate → grants + awards the job. */
export async function acceptOffer(offerId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("accept_offer", { p_offer_id: offerId });
  redirect("/work/jobs/active");
}

/** Decline a round-robin offer → the engine advances to the next provider. */
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
