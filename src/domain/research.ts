import { keccak256, toBytes } from "viem";
import type { AssetModel, Evidence } from "../types";

export function researchPackHash(asset: AssetModel): `0x${string}` {
  const canonical = JSON.stringify({
    assetId: asset.id,
    version: asset.researchVersion,
    validUntil: asset.validUntil,
    evidence: asset.evidence.map(({ id, contentHash }) => ({ id, contentHash })).sort((a, b) => a.id.localeCompare(b.id)),
    products: asset.products.map((product) => ({ id: product.id, rightsEvidenceId: product.rightsEvidenceId })),
  });
  return keccak256(toBytes(canonical));
}

export function evidenceQuality(items: Evidence[]) {
  const official = items.filter((item) => item.sourceType !== "RESEARCH").length;
  const highConfidence = items.filter((item) => item.confidence === "high").length;
  return {
    totalSources: items.length,
    officialSources: official,
    highConfidence,
    coverage: items.length ? Math.round((highConfidence / items.length) * 100) : 0,
  };
}
