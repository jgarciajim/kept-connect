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
  const { data } = await sb.from("members").select("id, display_name, is_provider").limit(1).maybeSingle();
  return data as { id: string; display_name: string | null; is_provider: boolean } | null;
}

/**
 * Post a job → inserts a real request (status 'finding'), then opens it. Accepts
 * the composer's full shape (service slug, headline title, chosen option, location)
 * and stays backward-compatible with the simpler /app/post form (those fields just
 * default). `service_slug` keys provider pricing; `category` keys trade matching.
 */
export async function postRequest(formData: FormData): Promise<void> {
  const serviceSlug = String(formData.get("serviceSlug") || "").trim();
  const category = String(formData.get("category") || "fixtures");
  const urgency = String(formData.get("urgency") || "same_day");
  const description = String(formData.get("description") || "").trim();
  const locationLabel = String(formData.get("locationLabel") || "").trim() || "14 Birch Lane";
  const titleInput = String(formData.get("title") || "").trim();
  const optionSlug = String(formData.get("option") || "").trim();

  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) redirect("/app");

  const title = titleInput || (description ? description.split(/[.\n]/)[0].slice(0, 48) : "New job");
  const { data, error } = await sb
    .from("requests")
    .insert({
      requester_id: me!.id,
      requester_name: me!.display_name,
      category,
      service_slug: serviceSlug || null,
      urgency,
      description,
      title,
      status: "finding",
      location_label: locationLabel,
      option_slug: optionSlug || null,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/app");
  redirect(`/app/jobs/${data.id}`);
}

/**
 * Book an instant, fixed-price job. Inserts an 'instant' request at status
 * 'finding'; the DB trigger (dispatch_on_insert) immediately offers it to the
 * first eligible provider — the round-robin engine takes it from there. The
 * requester lands on the job page and watches the match arrive (Realtime).
 */
export async function postInstantJob(formData: FormData): Promise<void> {
  const serviceId = String(formData.get("serviceId") || "").trim();
  const locationLabel = String(formData.get("locationLabel") || "").trim() || "14 Birch Lane";
  if (!serviceId) redirect("/app/book");

  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) redirect("/app");

  // Pull the catalog row server-side — the requester never sets category/title/mode.
  const { data: svc } = await sb
    .from("services")
    .select("category, name")
    .eq("id", serviceId)
    .eq("active", true)
    .maybeSingle();
  if (!svc) redirect("/app/book");

  const { data, error } = await sb
    .from("requests")
    .insert({
      requester_id: me!.id,
      requester_name: me!.display_name,
      category: svc!.category,
      title: svc!.name,
      status: "finding",
      urgency: "same_day",
      dispatch_mode: "instant",
      service_id: serviceId,
      location_label: locationLabel,
    })
    .select("id")
    .single();

  if (error || !data) redirect("/app/book");
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

// ---------------------------------------------------------------------------
// Account: name + saved properties.
// ---------------------------------------------------------------------------

/** Edit the member's display name. Syncs the public provider name if they're a provider. */
export async function updateMyName(name: string): Promise<void> {
  const clean = name.trim();
  if (!clean) return;
  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) return;
  await sb.from("members").update({ display_name: clean }).eq("id", me.id);
  if (me.is_provider) {
    // safe column-scoped RPC keeps the public provider_profiles name in sync
    await sb.rpc("update_provider_profile", { p_display_name: clean });
  }
  revalidatePath("/app/you");
}

/** Add a saved property. The first one becomes the default. */
export async function addProperty(label: string, address: string): Promise<void> {
  const addr = address.trim();
  if (!addr) return;
  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) return;
  const { count } = await sb.from("properties").select("id", { count: "exact", head: true });
  await sb.from("properties").insert({
    member_id: me.id,
    label: label.trim() || "Property",
    address_line: addr,
    is_default: (count ?? 0) === 0,
  });
  revalidatePath("/app/you");
}

export async function updateProperty(id: string, label: string, address: string): Promise<void> {
  const addr = address.trim();
  if (!addr) return;
  const sb = await createServerSupabaseClient();
  await sb.from("properties").update({ label: label.trim() || "Property", address_line: addr }).eq("id", id);
  revalidatePath("/app/you");
}

export async function deleteProperty(id: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.from("properties").delete().eq("id", id);
  revalidatePath("/app/you");
}

/** Make one property the default (clears the others). RLS scopes both writes to the owner. */
export async function setDefaultProperty(id: string): Promise<void> {
  const sb = await createServerSupabaseClient();
  const me = await myMember(sb);
  if (!me) return;
  await sb.from("properties").update({ is_default: false }).eq("member_id", me.id);
  await sb.from("properties").update({ is_default: true }).eq("id", id);
  revalidatePath("/app/you");
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
