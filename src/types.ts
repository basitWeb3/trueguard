export type RealityLayer = "live" | "building" | "vision" | "risk";

export type ClaimState =
  | "VERIFIED_LIVE"
  | "VERIFIED_BUILDING"
  | "COMPANY_VISION"
  | "THIRD_PARTY_ESTIMATE"
  | "DISPUTED"
  | "UNKNOWN";

export type MatchStatus = "MATCH" | "PARTIAL_MATCH" | "MISMATCH" | "UNKNOWN";

export type SourceType =
  | "REGULATOR"
  | "LEGAL_TERMS"
  | "ISSUER"
  | "COMPANY"
  | "AUDITED_REPORT"
  | "VENUE"
  | "RESEARCH";

export type Evidence = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  sourceType: SourceType;
  publishedAt?: string;
  retrievedAt: string;
  extract: string;
  confidence: "high" | "medium" | "low";
  contentHash: `0x${string}`;
};

export type RealityNode = {
  id: string;
  title: string;
  description: string;
  layer: RealityLayer;
  state: ClaimState;
  evidence: Evidence[];
};

export type ProductRights = {
  ownsUnderlying: boolean;
  shareholderRights: boolean;
  votingRights: boolean;
  dividendRights: "none" | "economic adjustment" | "passed through" | "unknown";
  physicalRedemption: boolean;
  issuerRedemption: boolean;
  canUseLeverage: boolean;
};

export type ExitRoute = {
  id: string;
  name: string;
  method: "close" | "sell" | "redeem";
  venue: string;
  description: string;
  variableFeeBps: number;
  estimatedSpreadBps: number;
  fixedFeeUsd: number;
  minimumUsd: number;
  settlement: string;
  marketHours: string;
  liquidity: "venue order book" | "issuer redemption" | "onchain pool";
  restrictions: string[];
  executable: boolean;
  sourceEvidenceId: string;
};

export type ProductTruth = {
  id: string;
  symbol: string;
  name: string;
  productType: string;
  simpleTruth: string;
  venue: string;
  issuer: string;
  underlying: string;
  networks: string[];
  contractAddresses: Record<string, `0x${string}`>;
  rights: ProductRights;
  leverage: string;
  funding: string;
  expiry: string;
  custody: string;
  keyRisk: string;
  rightsEvidenceId: string;
  exitRoutes: ExitRoute[];
};

export type AssetModel = {
  id: string;
  name: string;
  symbol: string;
  kind: string;
  scene: "space" | "mobility" | "gold";
  accent: string;
  oneLine: string;
  whyPeopleCare: string;
  truthSummary: string;
  claims: RealityNode[];
  products: ProductTruth[];
  evidence: Evidence[];
  researchVersion: string;
  validUntil: string;
};

export type IntentRequirements = {
  companyOwnership: boolean;
  shareholderRights: boolean;
  dividendRights: boolean;
  physicalRedemption: boolean;
  wantsLeverage: boolean;
  priceExposure: boolean;
};

export type IntentCheck = {
  id: string;
  intent: string;
  assetId: string;
  productId: string;
  status: MatchStatus;
  headline: string;
  explanation: string;
  requirements: IntentRequirements;
  passed: string[];
  failed: string[];
  warnings: string[];
  researchPackHash: `0x${string}`;
  checkedAt: string;
};

export type ExitQuote = {
  routeId: string;
  routeName: string;
  method: ExitRoute["method"];
  grossValueUsd: number;
  venueFeeUsd: number;
  spreadCostUsd: number;
  fixedFeeUsd: number;
  estimatedNetUsd: number;
  totalCostUsd: number;
  totalCostPercent: number;
  eligible: boolean;
  assumptions: string[];
  restrictions: string[];
  freshness: string;
};

export type ExitTogetherStatus = "FORMING" | "READY";
export type ExitTogetherExecutionMode = "TESTNET_SIGNED_RFQ" | "OKX_DEX_RFQ" | "OKX_BLOCK_RFQ";
export type ExecutionAvailability = "DEMO_LIVE" | "CREDENTIALS_REQUIRED" | "ELIGIBILITY_UNCONFIRMED" | "UNAVAILABLE";

export type ExitTogetherPool = {
  id: string;
  productId: string;
  symbol: string;
  existingValueUsd: number;
  participantCount: number;
  targetValueUsd: number;
  closesAt: string;
  executionMode: ExitTogetherExecutionMode;
  settlementLane: "X_LAYER_TESTNET" | "ONCHAIN_MAINNET" | "CENTRALIZED_VENUE";
  availability: ExecutionAvailability;
  productNotice: string;
};

export type ExitTogetherQuote = {
  poolId: string;
  productId: string;
  symbol: string;
  orderValueUsd: number;
  batchValueUsd: number;
  targetValueUsd: number;
  participantCount: number;
  progressPercent: number;
  status: ExitTogetherStatus;
  individualImpactBps: number;
  projectedBatchImpactBps: number;
  serviceFeeBps: number;
  estimatedIndividualProceedsUsd: number;
  estimatedBatchProceedsUsd: number;
  estimatedSavingsUsd: number;
  executionMode: ExitTogetherExecutionMode;
  settlementLane: ExitTogetherPool["settlementLane"];
  availability: ExecutionAvailability;
  quoteKind: "ILLUSTRATIVE" | "TESTNET_FIRM" | "LIVE_FIRM";
  liveQuote: boolean;
  productNotice: string;
  assumptions: string[];
  safeguards: string[];
  freshness: string;
};

export type ComparisonRow = {
  field: string;
  values: Record<string, string>;
};
