import type { SupabaseClient } from "@supabase/supabase-js";
import type { CategoryKey } from "@/components/ui";
import type { Job, JobStatus, ProviderProfile, Quote, Review, Thread, Member, Property, ThreadSummary, InstantService } from "./mock";

/**
 * Requester data layer — PURE query functions (take a Supabase client; no Clerk/
 * Next coupling) so they're unit-testable against the local stack. The screen-
 * facing accessors in ./mock.ts create the RLS-scoped client and delegate here.
 * RLS does the row filtering; these just shape rows into the view-model types.
 */

// ---- tiny formatters --------------------------------------------------------
function money(v: unknown): string | undefined {
  if (v === null || v === undefined) return undefined;
  return Number(v).toFixed(2);
}
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return name;
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
function clockTime(iso: string): string {
  const d = new Date(iso);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
function relativeWhen(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return "last month";
}
function jobStatus(dbStatus: string): JobStatus {
  switch (dbStatus) {
    case "finding": return "finding";
    case "quoted": return "quoted";
    case "awarded":
    case "enroute": return "enroute";
    default: return "complete"; // complete / paid / rated
  }
}

// ---- member -----------------------------------------------------------------
export async function myMemberId(c: SupabaseClient): Promise<string | null> {
  const { data } = await c.from("members").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function qGetCurrentMember(c: SupabaseClient): Promise<Member | null> {
  const { data } = await c.from("members").select("*").limit(1).maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    clerkUserId: data.clerk_user_id,
    isRequester: data.is_requester,
    isProvider: data.is_provider,
    displayName: data.display_name ?? null,
    avatarUrl: data.avatar_url ?? null,
    createdAt: data.created_at,
  };
}

// A requester's saved addresses (RLS scopes to the owner). Default first.
export async function qGetMyProperties(c: SupabaseClient): Promise<Property[]> {
  const { data } = await c
    .from("properties")
    .select("id, label, address_line, is_default")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  return (data ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    addressLine: p.address_line,
    isDefault: p.is_default,
  }));
}

// Reviews written ABOUT the current member as a requester (the two-sided trust
// surface, requester side — party-readable).
export async function qGetReviewsAboutMe(c: SupabaseClient): Promise<Review[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("reviews")
    .select("id, stars, body, author_name, created_at")
    .eq("subject_id", meId)
    .eq("subject_role", "requester")
    .order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    author: r.author_name ?? "",
    when: relativeWhen(r.created_at),
    stars: r.stars,
    text: r.body ?? "",
  }));
}

// ---- instant (fixed-price) services — the round-robin dispatch catalog ------
export async function qGetInstantServices(c: SupabaseClient): Promise<InstantService[]> {
  const { data } = await c
    .from("services")
    .select("id, category, name, base_price")
    .eq("active", true)
    .order("category", { ascending: true })
    .order("base_price", { ascending: true });
  return (data ?? []).map((s) => ({
    id: s.id,
    category: (s.category ?? "fixtures") as CategoryKey,
    name: s.name,
    price: money(s.base_price) ?? "0.00",
  }));
}

// ---- provider profile (public) ---------------------------------------------
export async function qGetProvider(
  c: SupabaseClient,
  memberId: string,
  withReviews = true,
): Promise<ProviderProfile | null> {
  const { data: p } = await c.from("provider_profiles").select("*").eq("member_id", memberId).maybeSingle();
  if (!p) return null;

  let reviews: Review[] = [];
  if (withReviews) {
    const { data: rv } = await c
      .from("reviews")
      .select("id, stars, body, author_name, created_at")
      .eq("subject_id", memberId)
      .eq("subject_role", "provider")
      .order("created_at", { ascending: false });
    reviews = (rv ?? []).map((r) => ({
      id: r.id,
      author: r.author_name ?? "",
      when: relativeWhen(r.created_at),
      stars: r.stars,
      text: r.body ?? "",
    }));
  }

  return {
    id: p.member_id,
    name: p.display_name ?? "",
    rating: Number(p.rating),
    jobsDone: p.jobs_done,
    yearsOnKept: p.years_on_kept,
    verified: p.verified,
    credentials: p.credentials ?? [],
    trades: p.trade_labels ?? [],
    reviews,
  };
}

// ---- jobs -------------------------------------------------------------------
type RequestRow = {
  id: string; requester_id: string; category: CategoryKey | null; description: string | null;
  title: string | null; status: string; location_label: string | null;
  awarded_provider_id: string | null; agreed_price: unknown; eta_minutes: number | null; created_at: string;
};

async function mapJob(c: SupabaseClient, row: RequestRow): Promise<Job> {
  const provider = row.awarded_provider_id
    ? (await qGetProvider(c, row.awarded_provider_id, false)) ?? undefined
    : undefined;
  return {
    id: row.id,
    request: {
      id: row.id,
      requesterId: row.requester_id,
      trade: (row.category ?? "fixtures") as CategoryKey,
      description: row.description ?? "",
      createdAt: row.created_at,
    },
    title: row.title ?? "",
    status: jobStatus(row.status),
    dbStatus: row.status,
    locationLabel: row.location_label ?? "",
    provider,
    price: money(row.agreed_price),
    etaMinutes: row.eta_minutes ?? undefined,
  };
}

export async function qGetActiveJobs(c: SupabaseClient): Promise<Job[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("*")
    .eq("requester_id", meId)
    .in("status", ["finding", "quoted", "awarded", "enroute"])
    .order("created_at", { ascending: false });
  return Promise.all((data ?? []).map((r) => mapJob(c, r as RequestRow)));
}

// All of the member's requests, any status (the Activity list).
export async function qGetAllJobs(c: SupabaseClient): Promise<Job[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("*")
    .eq("requester_id", meId)
    .order("created_at", { ascending: false });
  return Promise.all((data ?? []).map((r) => mapJob(c, r as RequestRow)));
}

// The member's job threads (one per request with an awarded provider).
export async function qGetMyThreads(c: SupabaseClient): Promise<ThreadSummary[]> {
  const meId = await myMemberId(c);
  if (!meId) return [];
  const { data } = await c
    .from("requests")
    .select("id, title, awarded_provider_id, created_at")
    .eq("requester_id", meId)
    .not("awarded_provider_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(20);
  const rows = data ?? [];
  return Promise.all(
    rows.map(async (r) => {
      const prov = r.awarded_provider_id ? await qGetProvider(c, r.awarded_provider_id, false) : null;
      const { data: msg } = await c
        .from("messages")
        .select("body, created_at")
        .eq("request_id", r.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return {
        id: r.id,
        providerName: prov ? shortName(prov.name) : "Your pro",
        jobTitle: r.title ?? "Job",
        lastMessage: msg?.body ?? "Tap to message",
        when: relativeWhen(msg?.created_at ?? r.created_at),
      };
    }),
  );
}

export async function qGetJob(c: SupabaseClient, id: string): Promise<Job | null> {
  const { data } = await c.from("requests").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return mapJob(c, data as RequestRow);
}

// ---- quotes -----------------------------------------------------------------
export async function qGetQuotes(c: SupabaseClient, requestId: string): Promise<Quote[]> {
  const { data } = await c
    .from("quotes")
    .select("id, request_id, provider_id, price, eta_label, created_at")
    .eq("request_id", requestId)
    .order("price", { ascending: true });
  const rows = data ?? [];
  return Promise.all(
    rows.map(async (q) => ({
      id: q.id,
      requestId: q.request_id,
      provider: (await qGetProvider(c, q.provider_id, false)) ?? {
        id: q.provider_id, name: "", rating: 0, jobsDone: 0, yearsOnKept: 0, verified: false,
        credentials: [], trades: [], reviews: [],
      },
      price: money(q.price) ?? "0.00",
      eta: q.eta_label ?? "",
    })),
  );
}

// ---- thread -----------------------------------------------------------------
export async function qGetThread(c: SupabaseClient, requestId: string): Promise<Thread | null> {
  const { data: req } = await c
    .from("requests")
    .select("id, title, location_label, awarded_provider_id")
    .eq("id", requestId)
    .maybeSingle();
  if (!req) return null;

  const meId = await myMemberId(c);
  let providerName = "";
  if (req.awarded_provider_id) {
    const prof = await qGetProvider(c, req.awarded_provider_id, false);
    providerName = prof ? shortName(prof.name) : "";
  }

  const { data: msgs } = await c
    .from("messages")
    .select("id, sender_id, body, has_photo, created_at")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  return {
    id: req.id,
    jobId: req.id,
    providerName,
    jobContext: `${req.title ?? "Job"} · ${req.location_label ?? ""}`,
    messages: (msgs ?? []).map((m) => ({
      id: m.id,
      from: m.sender_id === meId ? "me" : "them",
      text: m.body,
      time: clockTime(m.created_at),
      photo: m.has_photo || undefined,
    })),
  };
}
