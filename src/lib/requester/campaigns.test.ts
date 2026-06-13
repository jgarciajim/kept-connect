import { describe, it, expect } from "vitest";
import { resolveCampaigns, type Campaign } from "./campaigns";

// A complete campaign with sensible defaults; tests override only what they assert on.
function make(over: Partial<Campaign>): Campaign {
  return {
    id: over.id ?? "c",
    slug: over.slug ?? "c",
    kicker: "k",
    title: "t",
    subtitle: "s",
    ctaLabel: "go",
    targetCategory: "grounds",
    region: "summit-co",
    startsOn: "2026-01-01",
    endsOn: "2026-12-31",
    theme: "neutral",
    placements: ["rail"],
    priority: 0,
    active: true,
    ...over,
  };
}

const NOW = new Date("2026-06-15T12:00:00Z");

describe("resolveCampaigns", () => {
  it("keeps only active campaigns", () => {
    const out = resolveCampaigns(
      [make({ id: "on", active: true }), make({ id: "off", active: false })],
      { region: "summit-co", now: NOW },
    );
    expect(out.map((c) => c.id)).toEqual(["on"]);
  });

  it("filters by region: matches the viewer's region OR null, excludes others", () => {
    const out = resolveCampaigns(
      [
        make({ id: "match", region: "summit-co" }),
        make({ id: "everywhere", region: null }),
        make({ id: "other", region: "denver-co" }),
      ],
      { region: "summit-co", now: NOW },
    );
    expect(out.map((c) => c.id).sort()).toEqual(["everywhere", "match"]);
  });

  it("keeps campaigns whose window includes now (inclusive), drops out-of-window ones", () => {
    const out = resolveCampaigns(
      [
        make({ id: "in", startsOn: "2026-06-01", endsOn: "2026-06-30" }),
        make({ id: "startEdge", startsOn: "2026-06-15", endsOn: "2026-06-20" }), // starts today
        make({ id: "endEdge", startsOn: "2026-06-10", endsOn: "2026-06-15" }), // ends today
        make({ id: "past", startsOn: "2026-01-01", endsOn: "2026-05-31" }),
        make({ id: "future", startsOn: "2026-09-01", endsOn: "2026-10-31" }),
      ],
      { region: "summit-co", now: NOW },
    );
    expect(out.map((c) => c.id).sort()).toEqual(["endEdge", "in", "startEdge"]);
  });

  it("sorts by priority desc, then startsOn asc", () => {
    const out = resolveCampaigns(
      [
        make({ id: "lowPri", priority: 10, startsOn: "2026-02-01" }),
        make({ id: "hiLate", priority: 90, startsOn: "2026-05-01" }),
        make({ id: "hiEarly", priority: 90, startsOn: "2026-01-01" }),
      ],
      { region: "summit-co", now: NOW },
    );
    expect(out.map((c) => c.id)).toEqual(["hiEarly", "hiLate", "lowPri"]);
  });
});
