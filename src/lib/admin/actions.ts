"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { notifyMember } from "@/lib/email/notify";
import { verificationApproved, verificationRejected } from "@/lib/email/templates";

/** Approve a provider's verification → flips their verified badge (admin-only RPC). */
export async function approveVerification(memberId: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("approve_verification", { p_member_id: memberId });
  await notifyMember(sb, memberId, verificationApproved);
  revalidatePath("/work/admin");
}

/** Reject a provider's verification with a reason (admin-only RPC). */
export async function rejectVerification(memberId: string, reason: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  const clean = reason.trim() || "Not approved";
  await sb.rpc("reject_verification", { p_member_id: memberId, p_reason: clean });
  await notifyMember(sb, memberId, (name) => verificationRejected(name, clean));
  revalidatePath("/work/admin");
}
