import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface PaymentInfo {
  status: "held" | "released" | "refunded" | "failed";
  totalCents: number;
  feeCents: number;
  payoutCents: number;
}

/** The escrow record for a request (RLS: parties only), or null if none. */
export async function getPayment(requestId: string): Promise<PaymentInfo | null> {
  const sb = await createServerSupabaseClient();
  const { data } = await sb
    .from("payments")
    .select("status, total_cents, fee_cents, payout_cents")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    status: data.status,
    totalCents: data.total_cents,
    feeCents: data.fee_cents,
    payoutCents: data.payout_cents,
  };
}
