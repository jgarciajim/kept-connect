"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Requester write actions. Each runs as the authenticated member through the
 * RLS-scoped Clerk-token client, so the database enforces ownership — these just
 * shape the input. Status transitions that need column-safety go through the
 * SECURITY DEFINER RPCs (award_quote).
 */

async function myMember(sb: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data } = await sb.from("members").select("id, display_name").limit(1).maybeSingle();
  return data as { id: string; display_name: string | null } | null;
}

/** Post a job → inserts a real request (status 'finding'), then opens it. */
export async function postRequest(formData: FormData): Promise<void> {
  const category = String(formData.get("category") || "fixtures");
  const urgency = String(formData.get("urgency") || "same_day");
  const description = String(formData.get("description") || "").trim();

  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) redirect("/app");

  const title = description ? description.split(/[.\n]/)[0].slice(0, 48) : "New job";
  const { data, error } = await sb
    .from("requests")
    .insert({
      requester_id: me!.id,
      requester_name: me!.display_name,
      category,
      urgency,
      description,
      title,
      status: "finding",
      location_label: "14 Birch Lane",
    })
    .select("id")
    .single();

  if (error || !data) redirect("/app");
  redirect(`/app/jobs/${data.id}`);
}

/** Award a sealed quote (SECURITY DEFINER RPC) → opens the live job. */
export async function awardQuote(formData: FormData): Promise<void> {
  const quoteId = String(formData.get("quoteId") || "");
  const requestId = String(formData.get("requestId") || "");
  const sb = await createServerSupabaseClient();
  await sb.rpc("award_quote", { p_quote_id: quoteId });
  redirect(`/app/jobs/${requestId}/track`);
}

/** Send a message in the masked, job-scoped thread. */
export async function sendMessage(formData: FormData): Promise<void> {
  const requestId = String(formData.get("requestId") || "");
  const body = String(formData.get("body") || "").trim();
  if (!body) redirect(`/app/messages/${requestId}`);

  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (me) {
    await sb.from("messages").insert({ request_id: requestId, sender_id: me.id, body });
  }
  revalidatePath(`/app/messages/${requestId}`);
  redirect(`/app/messages/${requestId}`);
}

/** Submit a two-sided rating (requester rates the provider). */
export async function submitReview(requestId: string, subjectId: string, stars: number, body: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) return;
  await sb.from("reviews").insert({
    request_id: requestId,
    author_id: me.id,
    author_name: me.display_name,
    subject_id: subjectId,
    subject_role: "provider",
    stars,
    body: body || null,
  });
  // mark the job rated
  await sb.from("requests").update({ status: "rated" }).eq("id", requestId);
  revalidatePath("/app");
}
