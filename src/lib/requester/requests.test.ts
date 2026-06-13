import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  createRequest,
  getRequest,
  getQuotesForRequest,
  awardQuote,
  listMyRequests,
  __resetStore,
  FINDING_MS,
  ENROUTE_MS,
  type NewRequestInput,
} from "./requests";

function input(over: Partial<NewRequestInput> = {}): NewRequestInput {
  return {
    serviceSlug: "plumbing",
    category: "water",
    description: "Leak under the kitchen sink.",
    locationLabel: "14 Birch Lane",
    urgency: "same_day",
    ...over,
  };
}

beforeEach(() => {
  __resetStore();
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("createRequest", () => {
  it("returns a unique id and status 'finding'", async () => {
    const a = await createRequest(input());
    const b = await createRequest(input());
    expect(a.id).not.toBe(b.id);
    expect(a.status).toBe("finding");
    expect(b.status).toBe("finding");
  });

  it("persists the request so getRequest/listMyRequests find it", async () => {
    const r = await createRequest(input({ description: "Patch ceiling" }));
    expect(await getRequest(r.id)).toMatchObject({ id: r.id, description: "Patch ceiling" });
    expect(await listMyRequests()).toHaveLength(1);
  });
});

describe("getQuotesForRequest", () => {
  it("returns the seeded quote once the request exists", async () => {
    const r = await createRequest(input());
    const quotes = await getQuotesForRequest(r.id);
    expect(quotes).toHaveLength(1);
    expect(quotes[0]).toMatchObject({ providerName: "Marco R.", verified: true, price: 120, status: "open" });
  });

  it("returns [] for an unknown request", async () => {
    expect(await getQuotesForRequest("nope")).toEqual([]);
  });
});

describe("awardQuote", () => {
  it("transitions status to 'awarded' and records the award on the request", async () => {
    const r = await createRequest(input());
    const [quote] = await getQuotesForRequest(r.id);

    const updated = await awardQuote(r.id, quote.id);
    expect(updated.status).toBe("awarded");
    expect(updated.awardedQuoteId).toBe(quote.id);
    expect(updated.awardedProviderId).toBe(quote.providerId);
    expect(updated.agreedPrice).toBe(120);
    expect(updated.etaMinutes).toBe(12); // parsed from "12 min"

    const stored = await getRequest(r.id);
    expect(stored?.status).toBe("awarded");
  });

  it("throws for an unknown quote", async () => {
    const r = await createRequest(input());
    await expect(awardQuote(r.id, "quote_999")).rejects.toThrow();
  });
});

describe("lifecycle timers", () => {
  it("drifts finding → quoted after FINDING_MS", async () => {
    const r = await createRequest(input());
    expect((await getRequest(r.id))?.status).toBe("finding");
    await vi.advanceTimersByTimeAsync(FINDING_MS);
    expect((await getRequest(r.id))?.status).toBe("quoted");
  });

  it("drifts awarded → enroute for a same_day job, but a 'whenever' job stays awarded", async () => {
    const now = await createRequest(input({ urgency: "same_day" }));
    const [q1] = await getQuotesForRequest(now.id);
    await awardQuote(now.id, q1.id);
    await vi.advanceTimersByTimeAsync(ENROUTE_MS);
    expect((await getRequest(now.id))?.status).toBe("enroute");

    const later = await createRequest(input({ urgency: "whenever" }));
    const [q2] = await getQuotesForRequest(later.id);
    await awardQuote(later.id, q2.id);
    await vi.advanceTimersByTimeAsync(ENROUTE_MS);
    expect((await getRequest(later.id))?.status).toBe("awarded");
  });
});
