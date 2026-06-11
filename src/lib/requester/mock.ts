import type { CategoryKey } from "@/components/ui";

/**
 * Requester app — the ONLY data access point. Every screen reads from these
 * accessors, never from inline literals. Today they return seeded mock data;
 * when the backend is ready, swap each function BODY for a Supabase query —
 * the async signatures already match, so callers don't change.
 *
 * Types are shaped to the D11 identity foundation (members / requests /
 * job_grants) plus view models the schema doesn't carry yet (providers, quotes,
 * threads, reviews).
 */

// ---------------------------------------------------------------------------
// Foundation core — mirrors the D11 schema (supabase/migrations).
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
  trade: CategoryKey; // requests.trade
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
// View models — richer than the foundation; not yet in the schema.
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
  price: string; // decimal string — tabular money, never rounded for show
  eta: string;
}

export type JobStatus = "finding" | "quoted" | "enroute" | "complete";

export interface Job {
  id: string; // == request id
  request: Request;
  title: string; // short human label, e.g. "Leak under kitchen sink"
  status: JobStatus;
  locationLabel: string;
  provider?: ProviderProfile; // matched / en route
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
  jobContext: string; // "Leak under kitchen sink · 14 Birch Lane"
  messages: Message[];
}

export interface CategoryShortcut {
  category: CategoryKey;
  label: string;
}

// ---------------------------------------------------------------------------
// Seed
// ---------------------------------------------------------------------------
const ME: Member = {
  id: "mem-grace",
  clerkUserId: "user_grace",
  isRequester: true,
  isProvider: false,
  createdAt: "2026-01-04T00:00:00Z",
};

const MARCO: ProviderProfile = {
  id: "marco",
  name: "Marco Reyes",
  rating: 4.9,
  jobsDone: 212,
  yearsOnKept: 4,
  verified: true,
  credentials: ["Licensed", "Insured", "Background checked"],
  trades: ["Plumbing", "Drains", "Water heater"],
  reviews: [
    { id: "r1", author: "Priya N.", when: "2 weeks ago", stars: 5, text: "Fixed a stubborn leak fast and left the cabinet cleaner than he found it. Walked me through what went wrong." },
    { id: "r2", author: "Theo V.", when: "last month", stars: 5, text: "On time, clear quote, no upsell. Exactly what you want when a stranger is in your home." },
  ],
};

const SUMMIT: ProviderProfile = {
  id: "summit",
  name: "Summit Drywall",
  rating: 4.9,
  jobsDone: 128,
  yearsOnKept: 5,
  verified: true,
  credentials: ["Licensed", "Insured", "Background checked"],
  trades: ["Drywall", "Plaster", "Texture & finish"],
  reviews: [
    { id: "r3", author: "Dana L.", when: "3 weeks ago", stars: 5, text: "Patched a ceiling so well you can't tell where the damage was. Tidy and careful." },
    { id: "r4", author: "Marcus B.", when: "last month", stars: 5, text: "Clear sealed quote, started when they said, cleaned up after. No surprises." },
  ],
};

const VEGA: ProviderProfile = {
  id: "vega",
  name: "A. Vega Finishes",
  rating: 4.8,
  jobsDone: 74,
  yearsOnKept: 3,
  verified: true,
  credentials: ["Licensed", "Background checked"],
  trades: ["Drywall", "Painting"],
  reviews: [],
};

const PEAK: ProviderProfile = {
  id: "peak",
  name: "Peak Interiors",
  rating: 5.0,
  jobsDone: 41,
  yearsOnKept: 2,
  verified: true,
  credentials: ["Insured"],
  trades: ["Drywall", "Carpentry"],
  reviews: [],
};

const PROVIDERS: Record<string, ProviderProfile> = {
  marco: MARCO,
  summit: SUMMIT,
  vega: VEGA,
  peak: PEAK,
};

const JOBS: Job[] = [
  {
    id: "enroute",
    request: { id: "enroute", requesterId: ME.id, trade: "water", description: "Kitchen faucet is leaking at the base — water pooling under the sink.", createdAt: "2026-06-11T13:10:00Z" },
    title: "Leak under kitchen sink",
    status: "enroute",
    locationLabel: "14 Birch Lane",
    provider: MARCO,
    price: "120.00",
    etaMinutes: 12,
  },
  {
    id: "quoted",
    request: { id: "quoted", requesterId: ME.id, trade: "structure", description: "Water-stained drywall on the hallway ceiling needs patching and repaint.", createdAt: "2026-06-11T09:30:00Z" },
    title: "Drywall repair",
    status: "quoted",
    locationLabel: "14 Birch Lane",
  },
];

const QUOTES: Record<string, Quote[]> = {
  quoted: [
    { id: "q1", requestId: "quoted", provider: SUMMIT, price: "295.00", eta: "Can start tomorrow" },
    { id: "q2", requestId: "quoted", provider: VEGA, price: "340.00", eta: "This week" },
    { id: "q3", requestId: "quoted", provider: PEAK, price: "410.00", eta: "Next week" },
  ],
};

const THREADS: Record<string, Thread> = {
  marco: {
    id: "marco",
    jobId: "enroute",
    providerName: "Marco R.",
    jobContext: "Leak under kitchen sink · 14 Birch Lane",
    messages: [
      { id: "m1", from: "them", text: "Hi! On my way — about 12 minutes out. I'll text when I'm parked.", time: "1:48 PM" },
      { id: "m2", from: "me", text: "Great, thanks. The leak is under the kitchen sink, cabinet on the left.", time: "1:49 PM" },
      { id: "m3", from: "them", text: "Found it — the supply line fitting is cracked. Easy fix, I have the part.", time: "2:06 PM", photo: true },
      { id: "m4", from: "me", text: "Amazing. Go ahead.", time: "2:07 PM" },
    ],
  },
};

const CATEGORY_SHORTCUTS: CategoryShortcut[] = [
  { category: "water", label: "Plumbing" },
  { category: "power", label: "Electrical" },
  { category: "surfaces", label: "Painting" },
  { category: "grounds", label: "Yard" },
];

// ---------------------------------------------------------------------------
// Accessors — async so a Supabase query can slot in without touching callers.
// ---------------------------------------------------------------------------
export async function getCurrentMember(): Promise<Member> {
  return ME;
}

export async function getCategoryShortcuts(): Promise<CategoryShortcut[]> {
  return CATEGORY_SHORTCUTS;
}

export async function getActiveJobs(): Promise<Job[]> {
  return JOBS;
}

export async function getJob(id: string): Promise<Job | null> {
  return JOBS.find((j) => j.id === id) ?? null;
}

export async function getQuotes(jobId: string): Promise<Quote[]> {
  return QUOTES[jobId] ?? [];
}

export async function getProvider(id: string): Promise<ProviderProfile | null> {
  return PROVIDERS[id] ?? null;
}

export async function getThread(id: string): Promise<Thread | null> {
  return THREADS[id] ?? null;
}
