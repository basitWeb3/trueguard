import type { ExitTogetherPool, ExitTogetherQuote } from "../types";

const money = (value: number) => Math.round(value * 100) / 100;

export const exitTogetherPools: Record<string, ExitTogetherPool> = {
  "spcx-xperp": {
    id: "spcx-aug-18",
    productId: "spcx-xperp",
    symbol: "SPCX",
    existingValueUsd: 37_250,
    participantCount: 11,
    targetValueUsd: 50_000,
    closesAt: "2026-08-18T16:00:00.000Z",
    executionMode: "TESTNET_SIGNED_RFQ",
    settlementLane: "X_LAYER_TESTNET",
    availability: "DEMO_LIVE",
    productNotice: "tgSPCX is a testnet reference token. It is not SpaceX equity and it is not OKX SPCXUSD X-Perp.",
  },
  tslax: {
    id: "tslax-aug-18",
    productId: "tslax",
    symbol: "TSLAx",
    existingValueUsd: 68_400,
    participantCount: 18,
    targetValueUsd: 100_000,
    closesAt: "2026-08-18T16:00:00.000Z",
    executionMode: "TESTNET_SIGNED_RFQ",
    settlementLane: "X_LAYER_TESTNET",
    availability: "DEMO_LIVE",
    productNotice: "The displayed batch is a testnet settlement demonstration, not a live TSLAx venue pool.",
  },
  paxg: {
    id: "paxg-aug-18",
    productId: "paxg",
    symbol: "PAXG",
    existingValueUsd: 29_000,
    participantCount: 9,
    targetValueUsd: 50_000,
    closesAt: "2026-08-18T16:00:00.000Z",
    executionMode: "TESTNET_SIGNED_RFQ",
    settlementLane: "X_LAYER_TESTNET",
    availability: "DEMO_LIVE",
    productNotice: "The displayed batch is a testnet settlement demonstration, not a live PAXG venue pool.",
  },
};

export function quoteExitTogether(productId: string, amountUsd: number, now = new Date()): ExitTogetherQuote {
  const pool = exitTogetherPools[productId];
  if (!pool) throw new Error("EXIT_TOGETHER_POOL_NOT_FOUND");

  const safeAmount = Number.isFinite(amountUsd) && amountUsd > 0 ? amountUsd : 0;
  const batchValueUsd = pool.existingValueUsd + safeAmount;
  const progressPercent = Math.min(100, money((batchValueUsd / pool.targetValueUsd) * 100));

  // These demo inputs make the value of batching visible. Production adapters replace
  // them with an individual venue quote and a firm block/RFQ quote for the same asset.
  const individualImpactBps = 240;
  const projectedBatchImpactBps = 60;
  const serviceFeeBps = 15;
  const individualCost = safeAmount * (individualImpactBps / 10_000);
  const batchCost = safeAmount * ((projectedBatchImpactBps + serviceFeeBps) / 10_000);

  return {
    poolId: pool.id,
    productId,
    symbol: pool.symbol,
    orderValueUsd: money(safeAmount),
    batchValueUsd: money(batchValueUsd),
    targetValueUsd: pool.targetValueUsd,
    participantCount: pool.participantCount + (safeAmount > 0 ? 1 : 0),
    progressPercent,
    status: batchValueUsd >= pool.targetValueUsd ? "READY" : "FORMING",
    individualImpactBps,
    projectedBatchImpactBps,
    serviceFeeBps,
    estimatedIndividualProceedsUsd: money(Math.max(0, safeAmount - individualCost)),
    estimatedBatchProceedsUsd: money(Math.max(0, safeAmount - batchCost)),
    estimatedSavingsUsd: money(Math.max(0, individualCost - batchCost)),
    executionMode: pool.executionMode,
    settlementLane: pool.settlementLane,
    availability: pool.availability,
    quoteKind: "ILLUSTRATIVE",
    liveQuote: false,
    productNotice: pool.productNotice,
    assumptions: [
      "Illustrative only: the individual route assumes 2.40% price impact.",
      "Illustrative only: a completed batch assumes a 0.60% block quote plus a 0.15% service fee.",
      "A production quote must use live order-book and RFQ prices for the same product and time.",
    ],
    safeguards: [
      "Only orders for the same product and sell direction can share a batch.",
      "Every holder sets a maximum slippage and deadline before joining.",
      "The batch does not execute unless its quote is inside every holder's limit.",
    ],
    freshness: now.toISOString(),
  };
}
