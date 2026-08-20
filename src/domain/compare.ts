import type { ComparisonRow, ProductTruth } from "../types";

const yesNo = (value: boolean) => value ? "Yes" : "No";

export function compareProducts(products: ProductTruth[]): ComparisonRow[] {
  const rows: Array<[string, (product: ProductTruth) => string]> = [
    ["What it is", (product) => product.productType],
    ["Owns underlying", (product) => yesNo(product.rights.ownsUnderlying)],
    ["Shareholder rights", (product) => yesNo(product.rights.shareholderRights)],
    ["Voting rights", (product) => yesNo(product.rights.votingRights)],
    ["Dividend treatment", (product) => product.rights.dividendRights],
    ["Issuer redemption", (product) => yesNo(product.rights.issuerRedemption)],
    ["Physical redemption", (product) => yesNo(product.rights.physicalRedemption)],
    ["Leverage", (product) => product.leverage],
    ["Funding", (product) => product.funding],
    ["Main risk", (product) => product.keyRisk],
  ];
  return rows.map(([field, read]) => ({ field, values: Object.fromEntries(products.map((product) => [product.id, read(product)])) }));
}
