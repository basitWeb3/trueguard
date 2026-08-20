import { Hono } from "hono";
import { assets, allEvidence, findAsset, findProduct } from "../src/data/assets";
import { compareProducts } from "../src/domain/compare";
import { getExitQuotes } from "../src/domain/exit";
import { exitTogetherPools, quoteExitTogether } from "../src/domain/exitTogether";
import { checkIntent } from "../src/domain/intent";
import { evidenceQuality, researchPackHash } from "../src/domain/research";
import { quoteProviderStatuses } from "../src/domain/quoteProviders";
import { deploymentStatus, readBatch } from "./exitTogetherChain";
import { getOkxDexQuote, okxDexConfiguration } from "./providers/okxDex";

export const app = new Hono();

app.use("*", async (context, next) => {
  await next();
  context.header("Access-Control-Allow-Origin", "*");
  context.header("Access-Control-Allow-Headers", "Content-Type");
  context.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  context.header("X-TrueGuard-Schema", "v1");
});

app.options("*", (context) => context.body(null, 204));

app.get("/health", (context) => context.json({ ok: true, service: "trueguard-api", version: "1.0.0" }));

app.get("/v1/assets", (context) => {
  const query = (context.req.query("query") ?? "").toLowerCase();
  const matches = assets.filter((asset) => `${asset.name} ${asset.symbol} ${asset.kind}`.toLowerCase().includes(query));
  return context.json({ data: matches.map(({ claims, products, evidence, ...asset }) => ({ ...asset, claimCount: claims.length, productCount: products.length, sourceCount: evidence.length })) });
});

app.get("/v1/assets/:assetId", (context) => {
  const asset = findAsset(context.req.param("assetId"));
  if (!asset) return context.json({ error: "ASSET_NOT_FOUND" }, 404);
  return context.json({ data: { ...asset, researchPackHash: researchPackHash(asset), evidenceQuality: evidenceQuality(asset.evidence) } });
});

app.get("/v1/assets/:assetId/reality", (context) => {
  const asset = findAsset(context.req.param("assetId"));
  if (!asset) return context.json({ error: "ASSET_NOT_FOUND" }, 404);
  return context.json({ data: asset.claims, researchPackHash: researchPackHash(asset) });
});

app.get("/v1/evidence/:evidenceId", (context) => {
  const record = allEvidence.find((item) => item.id === context.req.param("evidenceId"));
  if (!record) return context.json({ error: "EVIDENCE_NOT_FOUND" }, 404);
  return context.json({ data: record });
});

app.get("/v1/products/:productId/rights", (context) => {
  const result = findProduct(context.req.param("productId"));
  if (!result) return context.json({ error: "PRODUCT_NOT_FOUND" }, 404);
  return context.json({ data: { productId: result.product.id, assetId: result.asset.id, productType: result.product.productType, simpleTruth: result.product.simpleTruth, rights: result.product.rights, evidenceId: result.product.rightsEvidenceId, researchPackHash: researchPackHash(result.asset) } });
});

app.post("/v1/check-intent", async (context) => {
  const body = await context.req.json<{ intent?: string; productId?: string }>().catch(() => ({} as { intent?: string; productId?: string }));
  if (!body.intent || !body.productId) return context.json({ error: "intent and productId are required" }, 400);
  const result = findProduct(body.productId);
  if (!result) return context.json({ error: "PRODUCT_NOT_FOUND" }, 404);
  return context.json({ data: checkIntent(body.intent, result.asset, result.product) });
});

app.post("/v1/compare", async (context) => {
  const body = await context.req.json<{ productIds?: string[] }>().catch(() => ({} as { productIds?: string[] }));
  if (!body.productIds?.length) return context.json({ error: "productIds is required" }, 400);
  const resolved = body.productIds.map(findProduct);
  if (resolved.some((item) => !item)) return context.json({ error: "One or more products were not found" }, 404);
  return context.json({ data: compareProducts(resolved.map((item) => item!.product)) });
});

app.post("/v1/exit-routes", async (context) => {
  const body = await context.req.json<{ productId?: string; amountUsd?: number }>().catch(() => ({} as { productId?: string; amountUsd?: number }));
  if (!body.productId || typeof body.amountUsd !== "number" || body.amountUsd < 0) return context.json({ error: "productId and a non-negative amountUsd are required" }, 400);
  const result = findProduct(body.productId);
  if (!result) return context.json({ error: "PRODUCT_NOT_FOUND" }, 404);
  return context.json({ data: getExitQuotes(result.product, body.amountUsd), currency: "USD", liveQuote: false, notice: "Costs use declared assumptions. Integrators should supply live fee and liquidity adapters." });
});

app.get("/v1/exit-together/pools/:productId", (context) => {
  const pool = exitTogetherPools[context.req.param("productId")];
  if (!pool) return context.json({ error: "EXIT_TOGETHER_POOL_NOT_FOUND" }, 404);
  return context.json({ data: pool, live: false, notice: "Demo pool state. Production pools are read from the settlement adapter." });
});

app.get("/v1/exit-together/deployment", (context) => context.json({ data: deploymentStatus() }));

app.get("/v1/exit-together/onchain/:batchId", async (context) => {
  try {
    const batchId = BigInt(context.req.param("batchId"));
    return context.json({ data: await readBatch(batchId), live: true });
  } catch (error) {
    const code = error instanceof Error ? error.message : "CHAIN_READ_FAILED";
    return context.json({ error: code }, code === "EXIT_TOGETHER_NOT_DEPLOYED" ? 503 : 502);
  }
});

app.get("/v1/execution/providers", (context) => context.json({
  data: quoteProviderStatuses,
  okxDex: okxDexConfiguration(),
  notice: "Provider readiness is reported separately from product eligibility. No route is called live unless credentials and an exact supported token pair are configured.",
}));

app.post("/v1/execution/okx-dex/quote", async (context) => {
  type QuoteBody = { fromTokenAddress?: `0x${string}`; toTokenAddress?: `0x${string}`; amount?: string; slippagePercent?: string };
  const body = await context.req.json<QuoteBody>().catch(() => ({} as QuoteBody));
  if (!body.fromTokenAddress || !body.toTokenAddress || !body.amount || !body.slippagePercent) return context.json({ error: "fromTokenAddress, toTokenAddress, amount and slippagePercent are required" }, 400);
  if (!/^0x[0-9a-fA-F]{40}$/.test(body.fromTokenAddress) || !/^0x[0-9a-fA-F]{40}$/.test(body.toTokenAddress)) return context.json({ error: "INVALID_TOKEN_ADDRESS" }, 400);
  try {
    return context.json({ data: await getOkxDexQuote({ chainIndex: "196", fromTokenAddress: body.fromTokenAddress, toTokenAddress: body.toTokenAddress, amount: body.amount, slippagePercent: body.slippagePercent }) });
  } catch (error) {
    const code = error instanceof Error ? error.message : "OKX_DEX_QUOTE_FAILED";
    return context.json({ error: code }, code === "OKX_DEX_CREDENTIALS_REQUIRED" ? 503 : 502);
  }
});

app.post("/v1/exit-together/quote", async (context) => {
  const body = await context.req.json<{ productId?: string; amountUsd?: number }>().catch(() => ({} as { productId?: string; amountUsd?: number }));
  if (!body.productId || typeof body.amountUsd !== "number" || body.amountUsd < 0) return context.json({ error: "productId and a non-negative amountUsd are required" }, 400);
  if (!findProduct(body.productId)) return context.json({ error: "PRODUCT_NOT_FOUND" }, 404);
  if (!exitTogetherPools[body.productId]) return context.json({ error: "EXIT_TOGETHER_POOL_NOT_FOUND" }, 404);
  return context.json({ data: quoteExitTogether(body.productId, body.amountUsd), notice: "Illustrative quote. No order has been placed and no funds have moved." });
});

app.get("/v1/research-packs/:assetId", (context) => {
  const asset = findAsset(context.req.param("assetId"));
  if (!asset) return context.json({ error: "ASSET_NOT_FOUND" }, 404);
  return context.json({ data: { assetId: asset.id, version: asset.researchVersion, hash: researchPackHash(asset), validUntil: asset.validUntil, evidenceQuality: evidenceQuality(asset.evidence), xLayerRegistry: null, registryStatus: "READY_TO_PUBLISH" } });
});

app.post("/v1/verify-research-pack", async (context) => {
  const body = await context.req.json<{ assetId?: string; hash?: string }>().catch(() => ({} as { assetId?: string; hash?: string }));
  const asset = body.assetId ? findAsset(body.assetId) : undefined;
  if (!asset || !body.hash) return context.json({ error: "assetId and hash are required" }, 400);
  const expected = researchPackHash(asset);
  return context.json({ data: { valid: expected.toLowerCase() === body.hash.toLowerCase(), expected, supplied: body.hash, version: asset.researchVersion, validUntil: asset.validUntil } });
});

app.get("/openapi.json", (context) => context.json({
  openapi: "3.1.0",
  info: { title: "TrueGuard API", version: "1.0.0", description: "The RWA understanding layer for people, products and AI agents." },
  servers: [{ url: new URL(context.req.url).origin }],
  paths: {
    "/v1/assets": { get: { summary: "Search supported RWA assets" } },
    "/v1/assets/{assetId}": { get: { summary: "Explain an RWA asset" } },
    "/v1/products/{productId}/rights": { get: { summary: "Get exact product rights" } },
    "/v1/check-intent": { post: { summary: "Check user intent against product rights" } },
    "/v1/compare": { post: { summary: "Compare RWA products" } },
    "/v1/exit-routes": { post: { summary: "Calculate transparent exit routes" } },
    "/v1/exit-together/pools/{productId}": { get: { summary: "Get an ExitTogether batch" } },
    "/v1/exit-together/quote": { post: { summary: "Estimate a pooled small-holder exit" } },
    "/v1/exit-together/deployment": { get: { summary: "Get the X Layer coordinator deployment" } },
    "/v1/exit-together/onchain/{batchId}": { get: { summary: "Read a live ExitTogether batch from X Layer" } },
    "/v1/execution/providers": { get: { summary: "Inspect execution-provider readiness and limitations" } },
    "/v1/execution/okx-dex/quote": { post: { summary: "Request an OKX DEX quote for a configured X Layer token pair" } },
    "/v1/verify-research-pack": { post: { summary: "Verify a research-pack hash" } },
  },
}));

app.notFound((context) => context.json({ error: "NOT_FOUND" }, 404));
