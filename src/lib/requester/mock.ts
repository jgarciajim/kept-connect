import type { CategoryKey } from "@/components/ui";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import * as q from "./queries";

/**
 * Requester app data layer — the ONLY data access point for the screens. The
 * view-model TYPES below are the data contract; the accessors at the bottom are
 * thin wrappers that create the RLS-scoped Supabase client (via Clerk) and
 * delegate to the pure query functions in ./queries.ts.
 *
 * (Filename kept as mock.ts so the screens' imports don't change; the data is
 * now real, read from the D11/D12 schema. `getCategoryShortcuts` stays static —
 * it's UI config, not data.)
 */

// ---------------------------------------------------------------------------
// Foundation core — mirrors the schema (supabase/migrations).
// ---------------------------------------------------------------------------
export interface Member {
  id: string;
  clerkUserId: string;
  isRequester: boolean;
  isProvider: boolean;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

/** A requester's saved address (account scaffolding). */
export interface Property {
  id: string;
  label: string;
  addressLine: string;
  isDefault: boolean;
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
export interface Review {
  id: string;
  author: string;
  when: string;
  stars: number;
  text: string;
}

export interface ProviderProfile {
  id: string; // member id
  name: string;
  rating: number;
  jobsDone: number;
  yearsOnKept: number;
  verified: boolean;
  credentials: string[];
  trades: string[];
  reviews: Review[];
}

export interface Quote {
  id: string;
  requestId: string;
  provider: ProviderProfile;
  price: string; // decimal string — tabular money
  eta: string;
}

export type JobStatus = "finding" | "quoted" | "enroute" | "complete";

export interface Job {
  id: string; // == request id
  request: Request;
  title: string;
  status: JobStatus;
  /** Raw DB request status (finding/quoted/awarded/enroute/complete/paid/rated) —
   *  `status` collapses awarded+enroute, so screens that must tell "matched" from
   *  "on the way" read this. */
  dbStatus: string;
  locationLabel: string;
  provider?: ProviderProfile;
  price?: string;
  etaMinutes?: number;
}

export interface Message {
  id: string;
  from: "me" | "them";
  text: string;
  time: string;
  photo?: boolean;
}

export interface Thread {
  id: string;
  jobId: string;
  providerName: string;
  jobContext: string;
  messages: Message[];
}

export interface CategoryShortcut {
  category: CategoryKey;
  label: string;
}

/** A standardized, fixed-price job that can be booked instantly (round-robin dispatch). */
export interface InstantService {
  id: string;
  category: CategoryKey;
  name: string;
  price: string; // dollars, tabular
}

/** A row in the requester's Messages list (one per job thread). */
export interface ThreadSummary {
  id: string; // request id
  providerName: string;
  jobTitle: string;
  lastMessage: string;
  when: string;
}

// ---------------------------------------------------------------------------
// Static UI config (not data).
// ---------------------------------------------------------------------------
const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { category: "water", label: "Plumbing" },
  { category: "power", label: "Electrical" },
  { category: "surfaces", label: "Painting" },
  { category: "grounds", label: "Yard" },
];

// ---------------------------------------------------------------------------
// Accessors — create the RLS-scoped client and delegate to ./queries.ts.
// ---------------------------------------------------------------------------
export async function getCurrentMember(): Promise<Member | null> {
  return q.qGetCurrentMember(await createServerSupabaseClient());
}

export async function getCategoryShortcuts(): Promise<CategoryShortcut[]> {
  return CATEGORY_SHORTCUTS;
}

export async function getActiveJobs(): Promise<Job[]> {
  return q.qGetActiveJobs(await createServerSupabaseClient());
}

export async function getJob(id: string): Promise<Job | null> {
  return q.qGetJob(await createServerSupabaseClient(), id);
}

export async function getQuotes(requestId: string): Promise<Quote[]> {
  return q.qGetQuotes(await createServerSupabaseClient(), requestId);
}

export async function getProvider(id: string): Promise<ProviderProfile | null> {
  return q.qGetProvider(await createServerSupabaseClient(), id, true);
}

export async function getThread(id: string): Promise<Thread | null> {
  return q.qGetThread(await createServerSupabaseClient(), id);
}

export async function getAllJobs(): Promise<Job[]> {
  return q.qGetAllJobs(await createServerSupabaseClient());
}

export async function getMyThreads(): Promise<ThreadSummary[]> {
  return q.qGetMyThreads(await createServerSupabaseClient());
}

export async function getMyProperties(): Promise<Property[]> {
  return q.qGetMyProperties(await createServerSupabaseClient());
}

export async function getReviewsAboutMe(): Promise<Review[]> {
  return q.qGetReviewsAboutMe(await createServerSupabaseClient());
}

export async function getInstantServices(): Promise<InstantService[]> {
  return q.qGetInstantServices(await createServerSupabaseClient());
}
