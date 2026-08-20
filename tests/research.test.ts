import { describe, expect, it } from "vitest";
import { assets } from "../src/data/assets";
import { evidenceQuality, researchPackHash } from "../src/domain/research";

describe("TrueGuard research packs", () => {
  it("creates deterministic bytes32 hashes", () => {
    const first = researchPackHash(assets[0]);
    const second = researchPackHash(assets[0]);
    expect(first).toBe(second);
    expect(first).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("reports evidence quality without presenting estimates as primary evidence", () => {
    const quality = evidenceQuality(assets[0].evidence);
    expect(quality.totalSources).toBeGreaterThan(0);
    expect(quality.officialSources).toBe(quality.totalSources);
    expect(quality.coverage).toBe(100);
  });
});
