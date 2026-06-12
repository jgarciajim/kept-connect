import type { CategoryKey } from "@/components/ui";

/**
 * Provider app — the ONLY data access point. Every screen reads from these
 * accessors, never inline literals. Today they return seeded mock data; when the
 * backend is ready, swap each function BODY for a Supabase query — the async
 * signatures already match, so callers don't change.
 *
 * Types are shaped to the D11 identity foundation (members / requests /
 * job_grants) plus view models the schema doesn't carry yet (offers, payouts).
 */

// ---------------------------------------------------------------------------
// Foundation core — mirrors the D11 schema.
// ---------------------------------------------------------------------------
export interface Member {
  id: string;
  clerkUserId: string;
  isRequester: boolean;
  isProvider: boolean;
  createdAt: string;
}

export interface Request {
  id: string;
  requesterId: string;
  trade: CategoryKey;
  description: string;
  createdAt: string;
}

export interface JobGrant {
  id: string;
  requestId: string;
  providerId: string;
  createdAt: string;
}

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
  trades: string[];
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
const MARCO: ProviderSelf = {
  id: "marco",
  name: "Marco Reyes",
  rating: 4.9,
  jobsDone: 212,
  yearsOnKept: 4,
  verified: true,
  online: true,
  availableToCashOut: "340.00",
  credentials: ["Licensed", "Insured", "Background checked"],
  trades: ["Plumbing", "Drains", "Water heater"],
};

const OFFER: Offer = {
  id: "offer-1",
  requestId: "req-faucet",
  trade: "water",
  title: "Faucet replacement",
  place: "Breckenridge",
  distance: "1.2 mi away",
  pay: "120.00",
  note: "est. 45 min · paid on completion",
  respondSeconds: 45,
};

const SCHEDULED: ScheduledJob[] = [
  { id: "sched-1", trade: "power", title: "Outlet install ×3", place: "Frisco", time: "2:30 PM", pay: "180.00" },
];

const ACTIVE: ActiveJob = {
  id: "active",
  trade: "water",
  title: "Faucet replacement",
  customerName: "Sarah K.",
  addressLine: "142 Ski Hill Rd · gate code in notes",
  payout: "120.00",
};

const EARNINGS: EarningsSummary = {
  availableToCashOut: "340.00",
  thisWeek: "3,180",
  jobsThisWeek: 14,
  rating: 4.9,
  payouts: [
    { id: "p1", job: "Clear shower drain", who: "Joan Ek", when: "Today", amount: "120.00", status: "Pending" },
    { id: "p2", job: "Faucet replacement", who: "Priya Nair", when: "Yesterday", amount: "180.00", status: "Paid" },
    { id: "p3", job: "Leak repair", who: "Theo Vance", when: "Mon", amount: "240.00", status: "Paid" },
    { id: "p4", job: "Water heater flush", who: "Sam Cole", when: "Sun", amount: "160.00", status: "Paid" },
  ],
};

// ---------------------------------------------------------------------------
// Accessors — async so a Supabase query can slot in without touching callers.
// ---------------------------------------------------------------------------
export async function getProviderSelf(): Promise<ProviderSelf> {
  return MARCO;
}

export async function getCurrentOffer(): Promise<Offer | null> {
  return OFFER;
}

export async function getScheduledJobs(): Promise<ScheduledJob[]> {
  return SCHEDULED;
}

export async function getActiveJob(id: string): Promise<ActiveJob | null> {
  return id === ACTIVE.id ? ACTIVE : null;
}

export async function getEarnings(): Promise<EarningsSummary> {
  return EARNINGS;
}
