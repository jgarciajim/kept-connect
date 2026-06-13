import { describe, it, expect } from "vitest";
import { isInSeason, type Season } from "./seasonality";
import { getAvailableServices, getFeaturedServices, optionSlug, getServiceOptionLabel, SERVICES } from "./services";

const SNOW: Season = { fromMonth: 11, toMonth: 4 }; // Nov–Apr, year-wrapping

// UTC so the assertions don't depend on the runner's timezone.
const DEC = new Date("2026-12-15T12:00:00Z");
const FEB = new Date("2026-02-15T12:00:00Z");
const JUL = new Date("2026-07-15T12:00:00Z");

describe("isInSeason (year-wrap)", () => {
  it("is in season inside a wrapping range (December, February)", () => {
    expect(isInSeason(DEC, SNOW)).toBe(true);
    expect(isInSeason(FEB, SNOW)).toBe(true);
  });

  it("is out of season outside the range (July)", () => {
    expect(isInSeason(JUL, SNOW)).toBe(false);
  });

  it("treats both ends as inclusive", () => {
    expect(isInSeason(new Date("2026-11-01T00:00:00Z"), SNOW)).toBe(true); // fromMonth
    expect(isInSeason(new Date("2026-04-30T00:00:00Z"), SNOW)).toBe(true); // toMonth
    expect(isInSeason(new Date("2026-05-01T00:00:00Z"), SNOW)).toBe(false); // just past
  });

  it("handles a non-wrapping range", () => {
    const summer: Season = { fromMonth: 6, toMonth: 8 };
    expect(isInSeason(JUL, summer)).toBe(true);
    expect(isInSeason(DEC, summer)).toBe(false);
  });
});

describe("getAvailableServices", () => {
  it("excludes snow in summer", () => {
    const slugs = getAvailableServices({ now: JUL }).map((s) => s.slug);
    expect(slugs).not.toContain("snow-removal");
  });

  it("includes snow in winter", () => {
    const slugs = getAvailableServices({ now: DEC }).map((s) => s.slug);
    expect(slugs).toContain("snow-removal");
  });

  it("always includes year-round services", () => {
    for (const now of [DEC, JUL]) {
      const slugs = getAvailableServices({ now }).map((s) => s.slug);
      expect(slugs).toContain("plumbing");
      expect(slugs).toContain("electrical");
    }
  });
});

describe("getFeaturedServices", () => {
  it("drops a featured-but-out-of-season service (snow in July)", () => {
    const slugs = getFeaturedServices({ now: JUL }).map((s) => s.slug);
    expect(slugs).not.toContain("snow-removal");
    expect(slugs).toContain("yard");
  });

  it("includes snow on the featured row once in season (December)", () => {
    const slugs = getFeaturedServices({ now: DEC }).map((s) => s.slug);
    expect(slugs).toContain("snow-removal");
  });
});

describe("service options", () => {
  it("every service has a non-empty options array", () => {
    for (const service of SERVICES) {
      expect(service.options.length).toBeGreaterThan(0);
    }
  });

  it("derives stable kebab-case slugs from labels", () => {
    expect(optionSlug("Water heater")).toBe("water-heater");
    expect(optionSlug("Faucet repair or replace")).toBe("faucet-repair-or-replace");
    expect(optionSlug("AC / mini-split service")).toBe("ac-mini-split-service");
    expect(optionSlug("Interior + exterior")).toBe("interior-exterior");
  });

  it("derived option slugs are unique within each service", () => {
    for (const service of SERVICES) {
      const slugs = service.options.map(optionSlug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
  });

  it("resolves a stored option slug back to its label", () => {
    expect(getServiceOptionLabel("plumbing", optionSlug("Water heater"))).toBe("Water heater");
  });

  it("returns null for an unset option or an unknown service/option", () => {
    expect(getServiceOptionLabel("plumbing", null)).toBeNull();
    expect(getServiceOptionLabel("plumbing", "not-a-real-option")).toBeNull();
    expect(getServiceOptionLabel("not-a-service", "water-heater")).toBeNull();
  });
});
