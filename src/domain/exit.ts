import type { ExitQuote, ExitRoute, ProductTruth } from "../types";

const money = (value: number) => Math.round(value * 100) / 100;

export function quoteRoute(route: ExitRoute, amountUsd: number, now = new Date()): ExitQuote {
  const safeAmount = Number.isFinite(amountUsd) && amountUsd > 0 ? amountUsd : 0;
  const venueFeeUsd = safeAmount * (route.variableFeeBps / 10_000);
  const spreadCostUsd = safeAmount * (route.estimatedSpreadBps / 10_000);
  const totalCostUsd = venueFeeUsd + spreadCostUsd + route.fixedFeeUsd;
  return {
    routeId: route.id,
    routeName: route.name,
    method: route.method,
    grossValueUsd: money(safeAmount),
    venueFeeUsd: money(venueFeeUsd),
    spreadCostUsd: money(spreadCostUsd),
    fixedFeeUsd: money(route.fixedFeeUsd),
    estimatedNetUsd: money(Math.max(0, safeAmount - totalCostUsd)),
    totalCostUsd: money(totalCostUsd),
    totalCostPercent: safeAmount ? money((totalCostUsd / safeAmount) * 100) : 0,
    eligible: safeAmount >= route.minimumUsd,
    assumptions: [
      `Trading or redemption fee: ${route.variableFeeBps} bps`,
      `Estimated spread or slippage: ${route.estimatedSpreadBps} bps`,
      "Price movement, taxes, gas and previously paid funding are not included unless stated.",
    ],
    restrictions: safeAmount < route.minimumUsd ? [`Minimum estimated value: $${route.minimumUsd.toLocaleString()}`, ...route.restrictions] : route.restrictions,
    freshness: now.toISOString(),
  };
}

export function getExitQuotes(product: ProductTruth, amountUsd: number, now = new Date()) {
  return product.exitRoutes
    .map((route) => ({ route, quote: quoteRoute(route, amountUsd, now) }))
    .sort((a, b) => Number(b.quote.eligible) - Number(a.quote.eligible) || b.quote.estimatedNetUsd - a.quote.estimatedNetUsd);
}
