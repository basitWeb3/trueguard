import { describe, expect, it } from "vitest";
import { app } from "../api/app";
import { assets } from "../src/data/assets";
import { researchPackHash } from "../src/domain/research";

describe("TrueGuard API", () => {
  it("returns supported assets", async () => {
    const response = await app.request("/v1/assets?query=space");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data[0].id).toBe("spacex");
  });

  it("returns a deterministic mismatch to an agent", async () => {
    const response = await app.request("/v1/check-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent: "I want to own SpaceX stock", productId: "spcx-xperp" }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.status).toBe("MISMATCH");
  });

  it("returns exit routes with declared non-live assumptions", async () => {
    const response = await app.request("/v1/exit-routes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "paxg", amountUsd: 1000 }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.liveQuote).toBe(false);
    expect(body.data.length).toBe(2);
  });

  it("quotes an ExitTogether batch without pretending it is live", async () => {
    const response = await app.request("/v1/exit-together/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "spcx-xperp", amountUsd: 5000 }),
    });
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.batchValueUsd).toBe(42250);
    expect(body.data.estimatedSavingsUsd).toBe(82.5);
    expect(body.data.liveQuote).toBe(false);
  });

  it("reports execution readiness without upgrading SPCX to a supported route", async () => {
    const response = await app.request("/v1/execution/providers");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.data.find((provider: { id: string }) => provider.id === "OKX_BLOCK_RFQ").availability).toBe("ELIGIBILITY_UNCONFIRMED");
    expect(body.data.find((provider: { id: string }) => provider.id === "OKX_DEX_RFQ").limitation).toContain("cannot settle SPCXUSD");
  });

  it("does not call an undeployed coordinator live", async () => {
    const response = await app.request("/v1/exit-together/deployment");
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(typeof body.data.deployed).toBe("boolean");
    expect(body.data.chainId).toBe(1952);
  });

  it("verifies a matching research-pack hash", async () => {
    const hash = researchPackHash(assets[0]);
    const response = await app.request("/v1/verify-research-pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId: "spacex", hash }),
    });
    expect((await response.json()).data.valid).toBe(true);
  });

  it("rejects incomplete input", async () => {
    const response = await app.request("/v1/check-intent", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    expect(response.status).toBe(400);
  });
});
