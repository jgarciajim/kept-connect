import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as q from "./queries";

export type { PendingVerification } from "./queries";

/** Is the signed-in member an admin? (members RLS returns only their own row.) */
export async function isCurrentMemberAdmin(): Promise<boolean> {
  const sb = await createServerSupabaseClient();
  const { data } = await sb.from("members").select("is_admin").limit(1).maybeSingle();
  return data?.is_admin ?? false;
}

export async function getPendingVerifications() {
  return q.qGetPendingVerifications(await createServerSupabaseClient());
}

/** Short-lived signed URL for a verification document (admin storage read). */
export async function getDocUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const sb = await createServerSupabaseClient();
  const { data } = await sb.storage.from("verification-docs").createSignedUrl(path, 300);
  return data?.signedUrl ?? null;
}
