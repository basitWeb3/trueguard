import { describe, expect, it } from "vitest";
import { findProduct } from "../src/data/assets";
import { checkIntent, parseIntent } from "../src/domain/intent";

const at = new Date("2026-08-16T12:00:00.000Z");

describe("TrueGuard intent engine", () => {
  it("detects a request for real company ownership", () => {
    expect(parseIntent("I want to own SpaceX stock")).toMatchObject({ companyOwnership: true, shareholderRights: true });
  });

  it("blocks a SpaceX derivative when the user asks for SpaceX stock", () => {
    const result = findProduct("spcx-xperp")!;
    const check = checkIntent("I want to own SpaceX stock", result.asset, result.product, at);
    expect(check.status).toBe("MISMATCH");
    expect(check.failed).toContain("Does not make the holder a shareholder in the company");
    expect(check.researchPackHash).toMatch(/^0x[0-9a-f]{64}$/);
  });

  it("allows price exposure but returns derivative warnings", () => {
    const result = findProduct("spcx-xperp")!;
    const check = checkIntent("I want leveraged SpaceX price exposure", result.asset, result.product, at);
    expect(check.status).toBe("PARTIAL_MATCH");
    expect(check.failed).toHaveLength(0);
    expect(check.warnings.some((warning) => warning.includes("Funding"))).toBe(true);
  });

  it("matches PAXG when physical redemption is requested", () => {
    const result = findProduct("paxg")!;
    const check = checkIntent("I want gold I can redeem physically", result.asset, result.product, at);
    expect(check.status).toBe("MATCH");
    expect(check.passed).toContain("Physical redemption exists, subject to terms");
  });

  it("explains an ordinary gold ownership question as gold, not company stock", () => {
    const result = findProduct("paxg")!;
    const check = checkIntent("How do I own gold?", result.asset, result.product, at);
    expect(check.status).toBe("MATCH");
    expect(check.headline).toContain("allocated physical gold");
    expect(check.failed).not.toContain("Does not make the holder a shareholder in the company");
  });
});
