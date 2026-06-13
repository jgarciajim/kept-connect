"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeRequests,
  getMyRequestsSnapshot,
  getServerRequestsSnapshot,
  getRequestSnapshot,
  getQuotesSnapshot,
  type ServiceRequest,
  type Quote,
} from "@/lib/requester/requests";

/**
 * Client hooks over the request lifecycle store. They re-render their screens as
 * the mock store's timers advance the lifecycle (finding → quoted → enroute).
 * Snapshot references are cached in the store, so these are loop-safe.
 */

export function useMyRequests(): ServiceRequest[] {
  return useSyncExternalStore(subscribeRequests, getMyRequestsSnapshot, getServerRequestsSnapshot);
}

export function useRequest(id: string): ServiceRequest | null {
  return useSyncExternalStore(
    subscribeRequests,
    () => getRequestSnapshot(id),
    () => null,
  );
}

export function useQuotes(requestId: string): Quote[] {
  return useSyncExternalStore(
    subscribeRequests,
    () => getQuotesSnapshot(requestId),
    () => getQuotesSnapshot(requestId),
  );
}
