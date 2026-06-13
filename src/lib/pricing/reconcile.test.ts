import { describe, it, expect } from "vitest";
import { SERVICES } from "../requester/services";
import { benchmarkFor, reconcileCatalog } from "./reconcile";

describe("reconcileCatalog", () => {
  const { matched, gaps } = reconcileCatalog();

  it("accounts for every one of the 12 Connect tiles (matched ∪ gaps)", () => {
    expect(matched.length + gaps.length).toBe(SERVICES.length);
    expect(SERVICES.length).toBe(12);
  });

  it("flags exactly Roofing and Flooring as gaps (no seed category)", () => {
    expect(gaps.map((g) => g.slug).sort()).toEqual(["flooring", "roofing"]);
  });

  it("matches the other ten tiles to a benchmark", () => {
    expect(matched.map((m) => m.slug).sort()).toEqual(
      ["appliances", "electrical", "handyman", "heating", "home-care", "painting", "plumbing", "snow-removal", "window-cleaning", "yard"].sort(),
    );
  });
});

describe("benchmarkFor", () => {
  it("ranges Plumbing over its mountain-adjusted typicals ($140–$2,520)", () => {
    const b = benchmarkFor("plumbing");
    expect(b).not.toBeNull();
    expect(b!.low).toBe(14000); // service trip $100 × 1.4
    expect(b!.high).toBe(252000); // water heater install $1,800 × 1.4
    expect(b!.count).toBe(10);
  });

  it("returns null for gap tiles — never invents a price", () => {
    expect(benchmarkFor("roofing")).toBeNull();
    expect(benchmarkFor("flooring")).toBeNull();
  });

  it("scopes Window Cleaning to the window subset of Cleaning", () => {
    const b = benchmarkFor("window-cleaning");
    expect(b).not.toBeNull();
    expect(b!.category).toBe("Cleaning");
    expect(b!.count).toBe(2); // per-pane + whole-house window cleaning
  });

  it("returns null for an unknown slug", () => {
    expect(benchmarkFor("nope")).toBeNull();
  });
});
