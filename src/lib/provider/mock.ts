import type { CategoryKey } from "@/components/ui";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as q from "./queries";

/**
 * Provider app data layer — the ONLY data access point for the screens. The
 * view-model TYPES below are the data contract; the accessors at the bottom create
 * the RLS-scoped Supabase client (via Clerk) and delegate to ./queries.ts.
 * (Filename kept as mock.ts so screen imports don't change; data is now real.)
 */

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------
/** Round-robin dispatch offer — one at a time, accept at the set rate, no bidding. */
export interface Offer {
  id: string;
  requestId: string;
  trade: CategoryKey;
  title: string;
  place: string;
  distance: string;
  pay: string; // tabular money
  note: string;
  respondSeconds: number; // the respond timer
}

export interface ScheduledJob {
  id: string;
  trade: CategoryKey;
  title: string;
  place: string;
  time: string;
  pay: string;
}

export interface ActiveJob {
  id: string;
  trade: CategoryKey;
  title: string;
  customerName: string;
  addressLine: string;
  payout: string;
}

export interface Payout {
  id: string;
  job: string;
  who: string;
  when: string;
  amount: string;
  status: "Paid" | "Pending";
}

export interface EarningsSummary {
  availableToCashOut: string;
  thisWeek: string;
  jobsThisWeek: number;
  rating: number;
  payouts: Payout[];
}

export interface ProviderSelf {
  id: string;
  name: string;
  rating: number;
  jobsDone: number;
  yearsOnKept: number;
  verified: boolean;
  online: boolean;
  availableToCashOut: string;
  credentials: string[];
  trades: string[]; // display labels
  tradeKeys: CategoryKey[]; // the category enum keys (for matching services)
}

/** A provider's own price for a service (the classification spine). */
export interface ProviderRate {
  serviceSlug: string;
  amount: string; // dollars, tabular
  rateSource: "own" | "benchmark";
}

/** An open (finding) request in the provider's trade — the supply feed. */
export interface OpenRequest {
  id: string;
  trade: CategoryKey;
  serviceSlug: string | null;
  title: string;
  place: string;
  description: string;
  urgency: string;
  when: string;
}

// ---------------------------------------------------------------------------
// Accessors — create the RLS-scoped client and delegate to ./queries.ts.
// ---------------------------------------------------------------------------
export async function getProviderSelf(): Promise<ProviderSelf | null> {
  return q.qGetProviderSelf(await createServerSupabaseClient());
}

export async function getCurrentOffer(): Promise<Offer | null> {
  return q.qGetCurrentOffer(await createServerSupabaseClient());
}

export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  return q.qGetScheduledJobs(await createServerSupabaseClient());
}

export async function getActiveJob(id: string): Promise<ActiveJob | null> {
  return q.qGetActiveJob(await createServerSupabaseClient(), id);
}

export async function getEarnings(): Promise<EarningsSummary> {
  return q.qGetEarnings(await createServerSupabaseClient());
}

export async function getProviderRates(): Promise<ProviderRate[]> {
  return q.qGetProviderRates(await createServerSupabaseClient());
}

export async function getOpenRequests(): Promise<OpenRequest[]> {
  return q.qGetOpenRequests(await createServerSupabaseClient());
}

export async function getOpenRequest(id: string): Promise<OpenRequest | null> {
  return q.qGetOpenRequest(await createServerSupabaseClient(), id);
}
