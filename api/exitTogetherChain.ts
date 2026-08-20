import fs from "node:fs";
import path from "node:path";
import { createPublicClient, defineChain, formatEther, http, type Address } from "viem";
import coordinatorArtifact from "../artifacts/ExitTogetherCoordinator.json";

const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://testrpc.xlayer.tech/terigon"] } },
  blockExplorers: { default: { name: "OKLink", url: "https://www.okx.com/web3/explorer/xlayer-test" } },
  testnet: true,
});

type Deployment = { exitTogetherCoordinator?: Address; demoRwaToken?: Address; demoUsdToken?: Address; demoBatchId?: number; deployedAt?: string };

export function exitTogetherDeployment(): Deployment | undefined {
  if (process.env.EXIT_TOGETHER_ADDRESS) {
    return {
      exitTogetherCoordinator: process.env.EXIT_TOGETHER_ADDRESS as Address,
      demoRwaToken: process.env.DEMO_RWA_TOKEN as Address | undefined,
      demoUsdToken: process.env.DEMO_USD_TOKEN as Address | undefined,
      demoBatchId: Number(process.env.EXIT_TOGETHER_BATCH_ID || 1),
    };
  }
  try {
    return JSON.parse(fs.readFileSync(path.resolve("deployments/xlayer-testnet.json"), "utf8")) as Deployment;
  } catch {
    return undefined;
  }
}

export function deploymentStatus() {
  const deployment = exitTogetherDeployment();
  return {
    deployed: Boolean(deployment?.exitTogetherCoordinator),
    chainId: 1952,
    network: "X Layer Testnet",
    explorer: "https://www.okx.com/web3/explorer/xlayer-test",
    ...deployment,
    demoNotice: "tgSPCX and tgUSD are testnet-only tokens with no claim on SpaceX, stock, cash, or any real-world asset.",
  };
}

export async function readBatch(batchId: bigint) {
  const deployment = exitTogetherDeployment();
  if (!deployment?.exitTogetherCoordinator) throw new Error("EXIT_TOGETHER_NOT_DEPLOYED");
  const client = createPublicClient({ chain: xLayerTestnet, transport: http() });
  const result = await client.readContract({
    address: deployment.exitTogetherCoordinator,
    abi: coordinatorArtifact.abi,
    functionName: "batches",
    args: [batchId],
  }) as readonly [string, Address, Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number, number, Address, string];
  return {
    batchId: batchId.toString(),
    productId: result[0],
    sellToken: result[1],
    buyToken: result[2],
    deadline: new Date(Number(result[3]) * 1000).toISOString(),
    minBatchSellAmount: formatEther(result[4]),
    totalCommitted: formatEther(result[5]),
    totalMinimumBuy: formatEther(result[6]),
    settledBuyAmount: formatEther(result[7]),
    claimedSellAmount: formatEther(result[8]),
    claimedBuyAmount: formatEther(result[9]),
    activeOrderCount: result[10],
    status: ["OPEN", "SETTLED", "CANCELLED"][result[11]] ?? "UNKNOWN",
    creator: result[12],
    settlementQuoteId: result[13],
    contract: deployment.exitTogetherCoordinator,
    chainId: 1952,
    readAt: new Date().toISOString(),
  };
}
