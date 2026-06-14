"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Mark all of the caller's notifications read (via the SECURITY DEFINER RPC). */
export async function markAllRead(): Promise<void> {
  const sb = await createServerSupabaseClient();
  await sb.rpc("mark_notifications_read");
  revalidatePath("/app/notifications");
  revalidatePath("/work/notifications");
  revalidatePath("/app");
  revalidatePath("/work");
}
