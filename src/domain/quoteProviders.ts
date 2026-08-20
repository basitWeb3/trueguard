import type { ExecutionAvailability, ExitTogetherExecutionMode } from "../types";

export type QuoteProviderStatus = {
  id: ExitTogetherExecutionMode;
  name: string;
  availability: ExecutionAvailability;
  execution: "onchain" | "centralized";
  useFor: string;
  limitation: string;
  requirements: string[];
  primarySources: Array<{ label: string; url: string }>;
};

const sources = {
  xPerps: { label: "OKX X-Perps contract specifications", url: "https://www.okx.com/en-us/help/x-perps-contract-specifications" },
  block: { label: "OKX block trading basics", url: "https://www.okx.com/en-gb/help/block-trading-basics" },
  dexRfq: { label: "OKX DEX market-maker RFQ integration", url: "https://web3.okx.com/build/dev-docs-v5/dex-api/dex-api-market-maker" },
  chains: { label: "OKX DEX supported chains", url: "https://web3.okx.com/vi/onchainos/dev-docs-v5/dex-api/dex-supported-chain" },
};

export const quoteProviderStatuses: QuoteProviderStatus[] = [
  {
    id: "TESTNET_SIGNED_RFQ",
    name: "TrueGuard signed RFQ demo",
    availability: "DEMO_LIVE",
    execution: "onchain",
    useFor: "An end-to-end X Layer testnet settlement using tgSPCX and tgUSD.",
    limitation: "The tokens and price are testnet demonstrations. tgSPCX is not SpaceX equity and is not the OKX SPCXUSD product.",
    requirements: ["Deployed coordinator", "Funded X Layer testnet wallet", "Maker-signed quote"],
    primarySources: [sources.chains],
  },
  {
    id: "OKX_DEX_RFQ",
    name: "OKX OnchainOS DEX RFQ",
    availability: "CREDENTIALS_REQUIRED",
    execution: "onchain",
    useFor: "Supported token pairs deployed on X Layer mainnet.",
    limitation: "This route cannot settle SPCXUSD X-Perp because that is a centralized derivative, not an X Layer ERC-20.",
    requirements: ["OKX API credentials", "Supported X Layer token pair", "Market-maker or aggregator route"],
    primarySources: [sources.dexRfq, sources.chains],
  },
  {
    id: "OKX_BLOCK_RFQ",
    name: "OKX Block Trading RFQ",
    availability: "ELIGIBILITY_UNCONFIRMED",
    execution: "centralized",
    useFor: "Centralized OKX instruments that are enabled for block trading.",
    limitation: "OKX documents SPCXUSD X-Perp and block RFQ separately, but its public docs do not confirm that SPCXUSD is currently block-eligible.",
    requirements: ["Eligible OKX account", "Instrument enabled in block trading", "At least the venue minimum notional"],
    primarySources: [sources.xPerps, sources.block],
  },
];

export function quoteProviderStatus(id: ExitTogetherExecutionMode) {
  return quoteProviderStatuses.find((provider) => provider.id === id)!;
}
