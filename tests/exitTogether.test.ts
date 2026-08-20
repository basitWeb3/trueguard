import { describe, expect, it } from "vitest";
import { quoteExitTogether } from "../src/domain/exitTogether";

describe("ExitTogether", () => {
  it("adds a small order to the compatible batch and exposes every assumption", () => {
    const quote = quoteExitTogether("spcx-xperp", 5000, new Date("2026-08-16T12:00:00.000Z"));
    expect(quote.batchValueUsd).toBe(42250);
    expect(quote.participantCount).toBe(12);
    expect(quote.progressPercent).toBe(84.5);
    expect(quote.estimatedIndividualProceedsUsd).toBe(4880);
    expect(quote.estimatedBatchProceedsUsd).toBe(4962.5);
    expect(quote.estimatedSavingsUsd).toBe(82.5);
    expect(quote.assumptions).toHaveLength(3);
    expect(quote.safeguards).toHaveLength(3);
  });

  it("marks a pool ready when the target is reached", () => {
    expect(quoteExitTogether("spcx-xperp", 12750).status).toBe("READY");
  });

  it("rejects unsupported products", () => {
    expect(() => quoteExitTogether("missing", 100)).toThrow("EXIT_TOGETHER_POOL_NOT_FOUND");
  });
});
