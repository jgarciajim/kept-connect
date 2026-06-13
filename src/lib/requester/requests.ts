import type { ServiceFamily } from "./campaigns";

/**
 * Request lifecycle — the single data seam for the core job loop (post → finding
 * → quote → award → tracking). UI never touches the store directly; it calls the
 * async functions below. Today they run a client-side in-memory mock; when the
 * D11/D12 `requests` foundation lands, each function BODY swaps to a Supabase
 * call and nothing upstream changes.
 *
 * ⚠️ Names mirror the real schema (supabase/migrations/20260612164441_marketplace.sql
 * on main), which is the source of truth — NOT the original ticket draft:
 *   - status vocabulary  → public.request_status
 *   - urgency            → public.urgency_tier
 *   - the accepted bid    → public.quotes (+ request.awarded_quote_id), NOT "offers"
 *     ("offers" are the provider-side round-robin dispatch artifact.)
 * Fields marked "(view-model — not persisted)" have no column in `requests` yet;
 * they're held client-side for the slice and flagged for reconciliation.
 */

// Mirrors public.request_status. Note: `awarded` is the booked-but-not-yet-moving
// state; `enroute` is the provider actually on the way (live ETA).
export type RequestStatus =
  | "finding"
  | "quoted"
  | "awarded"
  | "enroute"
  | "complete"
  | "paid"
  | "rated"
  | "cancelled";

// Mirrors public.urgency_tier. (No `scheduledFor` column exists yet — see below.)
export type Urgency = "whenever" | "same_day" | "emergency";

// Mirrors public.quote_status.
export type QuoteStatus = "open" | "awarded" | "declined" | "withdrawn";

export interface ServiceRequest {
  id: string; // requests.id
  requesterId: string; // requests.requester_id — later current_member_id()
  category: ServiceFamily; // requests.category (public.category_key)
  title: string | null; // requests.title
  description: string; // requests.description
  locationLabel: string; // requests.location_label
  urgency: Urgency; // requests.urgency
  status: RequestStatus; // requests.status
  etaMinutes: number | null; // requests.eta_minutes (set when a quote is awarded)
  agreedPrice: number | null; // requests.agreed_price (set at award)
  awardedQuoteId: string | null; // requests.awarded_quote_id
  awardedProviderId: string | null; // requests.awarded_provider_id
  createdAt: string; // requests.created_at

  // --- view-model only — NO column in `requests` yet (reconcile later) ----
  serviceSlug: string; // catalog slug; schema persists `category`, not the slug
  option: string | null; // chosen quick-pick option slug (catalog-derived); NO column yet — FLAG
  photos: string[]; // object URLs; real photo storage is a later subsystem
  scheduledFor: string | null; // chosen date/time; NO `scheduledFor` column exists — FLAG
}

export interface Quote {
  id: string; // quotes.id
  requestId: string; // quotes.request_id
  providerId: string; // quotes.provider_id (a member id)
  price: number; // quotes.price
  etaLabel: string | null; // quotes.eta_label
  status: QuoteStatus; // quotes.status
  // joined from provider_profiles (view-model; not columns on quotes itself):
  providerName: string; // provider_profiles.display_name
  verified: boolean; // provider_profiles.verified
  rating: number; // provider_profiles.rating
}

export interface NewRequestInput {
  serviceSlug: string;
  category: ServiceFamily;
  title?: string;
  description: string;
  option?: string | null;
  photos?: string[];
  locationLabel: string;
  urgency: Urgency;
  scheduledFor?: string | null;
}

// ---------------------------------------------------------------------------
// Mock store — client-side, in-memory, resets on full reload (fine for the
// slice). A tiny pub/sub lets client screens re-render as the timers advance
// the lifecycle. Everything here is what the Supabase swap will replace.
// ---------------------------------------------------------------------------
const MOCK_MEMBER_ID = "mem-grace"; // matches mock.ts ME; later current_member_id()

// Demo timings — how long the simulated lifecycle steps take.
export const FINDING_MS = 3200; // finding → quoted (a pro "responds")
export const ENROUTE_MS = 4000; // awarded → enroute, for jobs that start now

const requests = new Map<string, ServiceRequest>();
const quotesByRequest = new Map<string, Quote[]>();
const listeners = new Set<() => void>();
let seq = 0;

// Stable empty references — returned as the SSR/initial snapshot so
// useSyncExternalStore never sees a fresh array and loop-renders.
const EMPTY_REQUESTS: ServiceRequest[] = [];
const EMPTY_QUOTES: Quote[] = [];

// Cached newest-first list; its reference changes ONLY on emit(), so the client
// hook's getSnapshot is stable between mutations.
let requestsSnapshot: ServiceRequest[] = EMPTY_REQUESTS;

function rebuildSnapshot() {
  requestsSnapshot = [...requests.values()].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
  );
}

function emit() {
  rebuildSnapshot();
  for (const l of listeners) l();
}

/** Subscribe to store changes (used by client hooks). Returns an unsubscribe. */
export function subscribeRequests(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// --- synchronous snapshots for client hooks (useSyncExternalStore) ---------
// References stay stable between emits; server snapshots are the empty consts.
export function getMyRequestsSnapshot(): ServiceRequest[] {
  return requestsSnapshot;
}
export function getServerRequestsSnapshot(): ServiceRequest[] {
  return EMPTY_REQUESTS;
}
export function getRequestSnapshot(id: string): ServiceRequest | null {
  return requests.get(id) ?? null;
}
export function getQuotesSnapshot(requestId: string): Quote[] {
  return quotesByRequest.get(requestId) ?? EMPTY_QUOTES;
}

function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq}`;
}

// The one seeded quote — proves the loop. Provider details mirror what a
// provider_profiles join would supply. Dispatch/ranking is a later subsystem.
function seedQuote(requestId: string): Quote {
  return {
    id: nextId("quote"),
    requestId,
    providerId: "marco",
    price: 120,
    etaLabel: "12 min",
    status: "open",
    providerName: "Marco R.",
    verified: true,
    rating: 4.9,
  };
}

// ---------------------------------------------------------------------------
// The seam — all async, so the Supabase swap is a body change only.
// ---------------------------------------------------------------------------

export async function createRequest(input: NewRequestInput): Promise<ServiceRequest> {
  const id = nextId("req");
  const request: ServiceRequest = {
    id,
    requesterId: MOCK_MEMBER_ID,
    category: input.category,
    title: input.title ?? null,
    description: input.description,
    locationLabel: input.locationLabel,
    urgency: input.urgency,
    status: "finding",
    etaMinutes: null,
    agreedPrice: null,
    awardedQuoteId: null,
    awardedProviderId: null,
    createdAt: nowIso(),
    serviceSlug: input.serviceSlug,
    option: input.option ?? null,
    photos: input.photos ?? [],
    scheduledFor: input.scheduledFor ?? null,
  };
  requests.set(id, request);
  // Seed the quote now so getQuotesForRequest can resolve it; the status flip
  // below is what drives the "finding…" → offer-card transition in the UI.
  quotesByRequest.set(id, [seedQuote(id)]);
  emit();

  scheduleStatus(id, "quoted", FINDING_MS, (r) => r.status === "finding");
  return request;
}

export async function getRequest(id: string): Promise<ServiceRequest | null> {
  return requests.get(id) ?? null;
}

export async function listMyRequests(): Promise<ServiceRequest[]> {
  // Newest first — served from the cached snapshot (maintained by emit()).
  return requestsSnapshot;
}

export async function getQuotesForRequest(requestId: string): Promise<Quote[]> {
  return quotesByRequest.get(requestId) ?? [];
}

export async function awardQuote(requestId: string, quoteId: string): Promise<ServiceRequest> {
  const request = requests.get(requestId);
  if (!request) throw new Error(`awardQuote: request ${requestId} not found`);
  const quotes = quotesByRequest.get(requestId) ?? [];
  const quote = quotes.find((q) => q.id === quoteId);
  if (!quote) throw new Error(`awardQuote: quote ${quoteId} not found on ${requestId}`);

  // Mark the winning quote; competing quotes (none in the mock) would go 'declined'.
  // New array reference so client snapshots see the change.
  quotesByRequest.set(
    requestId,
    quotes.map((q) => (q.id === quoteId ? { ...q, status: "awarded" } : q)),
  );

  const updated: ServiceRequest = {
    ...request,
    status: "awarded",
    awardedQuoteId: quote.id,
    awardedProviderId: quote.providerId,
    agreedPrice: quote.price,
    etaMinutes: parseEtaMinutes(quote.etaLabel),
  };
  requests.set(requestId, updated);
  emit();

  // Jobs that start now drift to 'enroute' (live tracking). A scheduled/"whenever"
  // job stays 'awarded' (booked) until its time — no live ETA yet.
  if (updated.urgency !== "whenever" && !updated.scheduledFor) {
    scheduleStatus(requestId, "enroute", ENROUTE_MS, (r) => r.status === "awarded");
  }
  return updated;
}

// --- internals ------------------------------------------------------------

// Advance a request to `next` after `ms`, but only if `guard` still holds (so a
// cancel or manual change isn't clobbered by a stale timer).
function scheduleStatus(
  id: string,
  next: RequestStatus,
  ms: number,
  guard: (r: ServiceRequest) => boolean,
): void {
  setTimeout(() => {
    const r = requests.get(id);
    if (!r || !guard(r)) return;
    requests.set(id, { ...r, status: next });
    emit();
  }, ms);
}

function parseEtaMinutes(label: string | null): number | null {
  if (!label) return null;
  const m = label.match(/\d+/);
  return m ? Number(m[0]) : null;
}

function nowIso(): string {
  return new Date().toISOString();
}

/** Test-only: clear the in-memory store between cases. */
export function __resetStore(): void {
  requests.clear();
  quotesByRequest.clear();
  listeners.clear();
  requestsSnapshot = EMPTY_REQUESTS;
  seq = 0;
}
