import type { AssetModel, IntentCheck, IntentRequirements, ProductTruth } from "../types";
import { researchPackHash } from "./research";

export function parseIntent(intent: string): IntentRequirements {
  const text = intent.toLowerCase();
  const ownership = /\b(own|ownership|shareholder|real share|company stock|equity)\b/.test(text);
  return {
    companyOwnership: ownership,
    shareholderRights: /\b(vote|voting|shareholder|shareholder rights?|real shares?|company stock|stocks?|shares?|equity)\b/.test(text),
    dividendRights: /\b(dividend|income|distribution)\b/.test(text),
    physicalRedemption: /\b(physical|bar|delivery|redeem.*gold|gold.*redeem)\b/.test(text),
    wantsLeverage: /\b(leverage|leveraged|short|perp|perpetual|margin)\b/.test(text),
    priceExposure: /\b(price|track|exposure|trade|speculate|long|short)\b/.test(text) || !ownership,
  };
}

function humanProduct(product: ProductTruth) {
  return `${product.symbol} is ${product.productType.toLowerCase()}`;
}

export function checkIntent(intent: string, asset: AssetModel, product: ProductTruth, now = new Date()): IntentCheck {
  const requirements = parseIntent(intent);
  const isCompanyAsset = /company/i.test(asset.kind);
  const passed: string[] = [];
  const failed: string[] = [];
  const warnings: string[] = [];

  if (requirements.companyOwnership) {
    if (isCompanyAsset) {
      (product.rights.ownsUnderlying && product.rights.shareholderRights ? passed : failed).push(
        product.rights.ownsUnderlying && product.rights.shareholderRights
          ? "Provides the requested company ownership"
          : "Does not make the holder a shareholder in the company",
      );
    } else {
      (product.rights.ownsUnderlying ? passed : failed).push(
        product.rights.ownsUnderlying
          ? "Provides a claim on the named underlying asset"
          : "Does not provide ownership of the named underlying asset",
      );
    }
  }
  if (requirements.shareholderRights && isCompanyAsset) {
    (product.rights.shareholderRights ? passed : failed).push(product.rights.shareholderRights ? "Includes shareholder rights" : "No direct shareholder rights");
  }
  if (requirements.dividendRights) {
    (product.rights.dividendRights === "passed through" ? passed : failed).push(
      product.rights.dividendRights === "passed through" ? "Passes through dividend rights" : `Dividend treatment is: ${product.rights.dividendRights}`,
    );
  }
  if (requirements.physicalRedemption) {
    (product.rights.physicalRedemption ? passed : failed).push(product.rights.physicalRedemption ? "Physical redemption exists, subject to terms" : "No physical redemption right");
  }
  if (requirements.wantsLeverage) {
    (product.rights.canUseLeverage ? passed : failed).push(product.rights.canUseLeverage ? "Supports leveraged exposure" : "The product itself is not leveraged");
  }
  if (requirements.priceExposure) passed.push("Provides price exposure to the named underlying");

  if (product.rights.canUseLeverage) warnings.push("Leverage can cause liquidation and losses larger than the initial price move.");
  if (product.funding !== "None" && product.funding !== "No periodic derivatives funding") warnings.push(`Funding applies: ${product.funding}.`);
  if (!product.rights.issuerRedemption && !product.rights.ownsUnderlying) warnings.push("Exit depends on venue liquidity; there is no issuer redemption path.");

  const status = failed.length > 0 ? "MISMATCH" : passed.length > 0 ? (warnings.length > 0 ? "PARTIAL_MATCH" : "MATCH") : "UNKNOWN";
  const ownershipMismatch = requirements.companyOwnership && (isCompanyAsset
    ? (!product.rights.ownsUnderlying || !product.rights.shareholderRights)
    : !product.rights.ownsUnderlying);
  const headline = status === "MISMATCH"
    ? ownershipMismatch
      ? `This follows ${asset.name}'s price, but it is not ${asset.name} stock`
      : "This product works differently from what you described"
    : status === "MATCH"
      ? asset.id === "gold"
        ? "PAXG gives you a claim on allocated physical gold"
        : "This product matches the stated need"
      : status === "PARTIAL_MATCH"
        ? "It matches, with important limits"
        : "Tell us which rights or exposure matter to you";
  const explanation = status === "MISMATCH"
    ? ownershipMismatch
      ? `${humanProduct(product)}. Buying it gives you price exposure to ${asset.name}, but no company shares, voting rights or direct ownership.`
      : `${humanProduct(product)}. The important difference is that it ${failed[0].charAt(0).toLowerCase()}${failed[0].slice(1)}.`
    : status === "MATCH"
      ? asset.id === "gold"
        ? "You can hold PAXG in fractional amounts. Each token represents allocated gold held by Paxos, but taking a physical bar home is a separate redemption process with verification, fees and a large minimum."
        : `${humanProduct(product)} and supports the rights you requested.`
      : status === "PARTIAL_MATCH"
        ? `${humanProduct(product)} and gives the requested exposure, but its risks still matter.`
        : "Tell TrueGuard whether you want ownership, price exposure, income, leverage or physical redemption.";

  return {
    id: `tg_${asset.id}_${product.id}_${now.getTime()}`,
    intent,
    assetId: asset.id,
    productId: product.id,
    status,
    headline,
    explanation,
    requirements,
    passed,
    failed,
    warnings,
    researchPackHash: researchPackHash(asset),
    checkedAt: now.toISOString(),
  };
}
