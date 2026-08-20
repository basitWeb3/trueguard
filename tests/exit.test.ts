import { describe, expect, it } from "vitest";
import { findProduct } from "../src/data/assets";
import { getExitQuotes, quoteRoute } from "../src/domain/exit";

describe("TrueGuard exit engine", () => {
  it("shows every cost in the net proceeds calculation", () => {
    const route = findProduct("spcx-xperp")!.product.exitRoutes[0];
    const quote = quoteRoute(route, 5000, new Date("2026-08-16T12:00:00.000Z"));
    expect(quote.venueFeeUsd).toBe(2.5);
    expect(quote.spreadCostUsd).toBe(4);
    expect(quote.totalCostUsd).toBe(6.5);
    expect(quote.estimatedNetUsd).toBe(4993.5);
    expect(quote.totalCostPercent).toBe(0.13);
  });

  it("marks a physical gold-bar exit ineligible below its minimum", () => {
    const product = findProduct("paxg")!.product;
    const quotes = getExitQuotes(product, 5000);
    const physical = quotes.find((item) => item.route.id === "paxg-physical")!;
    expect(physical.quote.eligible).toBe(false);
    expect(physical.quote.restrictions[0]).toContain("Minimum estimated value");
  });
});
