"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * RealtimeRefresh — the live seam. Subscribes to Supabase Realtime
 * postgres_changes on the given tables/filters and calls router.refresh() when a
 * relevant row changes, re-running the page's RLS-scoped server fetch (no full
 * reload, no lost client state). This replaces LiveRefresh's interval polling.
 *
 * RLS is enforced per subscriber via the Clerk token (carried by the browser
 * client's accessToken), so a client only receives rows it can already read. A
 * slow fallback poll runs ONLY while the channel isn't subscribed (socket/token
 * not ready), so the screen still updates if Realtime is unavailable. Renders
 * nothing; pass enabled=false at terminal states to detach.
 */
export interface RealtimeWatch {
  table: string;
  /** A postgres_changes filter, e.g. "id=eq.<uuid>" or "provider_id=eq.<uuid>". Omit to watch all (RLS-scoped) rows. */
  filter?: string;
}

export function RealtimeRefresh({
  topic,
  watch,
  enabled = true,
  fallbackMs = 20000,
}: {
  topic: string;
  watch: RealtimeWatch[];
  enabled?: boolean;
  fallbackMs?: number;
}) {
  const router = useRouter();
  const supabase = useSupabaseBrowserClient();
  const key = JSON.stringify(watch); // stable dep for the watch list

  useEffect(() => {
    if (!enabled) return;
    let live = false;

    const channel = supabase.channel(`rt:${topic}`);
    for (const w of watch) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: w.table, ...(w.filter ? { filter: w.filter } : {}) },
        () => router.refresh(),
      );
    }
    channel.subscribe((status) => {
      live = status === "SUBSCRIBED";
    });

    const id = setInterval(() => {
      if (!live && document.visibilityState === "visible") router.refresh();
    }, fallbackMs);

    return () => {
      clearInterval(id);
      supabase.removeChannel(channel);
    };
  }, [supabase, router, topic, key, enabled, fallbackMs, watch]);

  return null;
}
