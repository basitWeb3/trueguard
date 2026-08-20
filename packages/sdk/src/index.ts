export type TrueGuardClientOptions = { baseUrl?: string; fetcher?: typeof fetch };

export type IntentStatus = "MATCH" | "PARTIAL_MATCH" | "MISMATCH" | "UNKNOWN";

export type IntentCheckResult = {
  id: string;
  intent: string;
  assetId: string;
  productId: string;
  status: IntentStatus;
  headline: string;
  explanation: string;
  passed: string[];
  failed: string[];
  warnings: string[];
  researchPackHash: `0x${string}`;
  checkedAt: string;
};

type ApiEnvelope<T> = { data: T; error?: never } | { data?: never; error: string };

export class TrueGuardClient {
  private readonly baseUrl: string;
  private readonly fetcher: typeof fetch;

  constructor(options: TrueGuardClientOptions = {}) {
    this.baseUrl = (options.baseUrl ?? "http://localhost:8787").replace(/\/$/, "");
    this.fetcher = options.fetcher ?? fetch;
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.fetcher(`${this.baseUrl}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    const result = await response.json() as ApiEnvelope<T>;
    if (!response.ok || result.error) throw new Error(result.error ?? `TrueGuard request failed with ${response.status}`);
    return result.data as T;
  }

  searchAssets(query = "") { return this.request<unknown[]>(`/v1/assets?query=${encodeURIComponent(query)}`); }
  explainAsset(assetId: string) { return this.request<Record<string, unknown>>(`/v1/assets/${encodeURIComponent(assetId)}`); }
  getRealityGraph(assetId: string) { return this.request<unknown[]>(`/v1/assets/${encodeURIComponent(assetId)}/reality`); }
  getEvidence(evidenceId: string) { return this.request<Record<string, unknown>>(`/v1/evidence/${encodeURIComponent(evidenceId)}`); }
  getTokenRights(productId: string) { return this.request<Record<string, unknown>>(`/v1/products/${encodeURIComponent(productId)}/rights`); }
  checkIntent(intent: string, productId: string) { return this.request<IntentCheckResult>("/v1/check-intent", { method: "POST", body: JSON.stringify({ intent, productId }) }); }
  compareProducts(productIds: string[]) { return this.request<unknown[]>("/v1/compare", { method: "POST", body: JSON.stringify({ productIds }) }); }
  getExitRoutes(productId: string, amountUsd: number) { return this.request<unknown[]>("/v1/exit-routes", { method: "POST", body: JSON.stringify({ productId, amountUsd }) }); }
  getExitTogetherPool(productId: string) { return this.request<Record<string, unknown>>(`/v1/exit-together/pools/${encodeURIComponent(productId)}`); }
  quoteExitTogether(productId: string, amountUsd: number) { return this.request<Record<string, unknown>>("/v1/exit-together/quote", { method: "POST", body: JSON.stringify({ productId, amountUsd }) }); }
  getExitTogetherDeployment() { return this.request<Record<string, unknown>>("/v1/exit-together/deployment"); }
  getOnchainBatch(batchId: number | string) { return this.request<Record<string, unknown>>(`/v1/exit-together/onchain/${encodeURIComponent(batchId)}`); }
  getExecutionProviders() { return this.request<unknown[]>("/v1/execution/providers"); }
  getOkxDexQuote(input: { fromTokenAddress: string; toTokenAddress: string; amount: string; slippagePercent: string }) { return this.request<Record<string, unknown>>("/v1/execution/okx-dex/quote", { method: "POST", body: JSON.stringify(input) }); }
  verifyResearchPack(assetId: string, hash: string) { return this.request<Record<string, unknown>>("/v1/verify-research-pack", { method: "POST", body: JSON.stringify({ assetId, hash }) }); }
}
