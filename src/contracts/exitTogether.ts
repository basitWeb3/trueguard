import { createPublicClient, createWalletClient, custom, decodeEventLog, defineChain, http, parseEther, type Abi, type AddEthereumChainParameter, type Address, type EIP1193Provider, type Hex } from "viem";
import coordinatorArtifact from "../../artifacts/ExitTogetherCoordinator.json";
import tokenArtifact from "../../artifacts/MockERC20.json";

export const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://testrpc.xlayer.tech/terigon"] } },
  blockExplorers: { default: { name: "OKLink", url: "https://www.okx.com/web3/explorer/xlayer-test" } },
  testnet: true,
});

export const xLayerTestnetWalletParameters: AddEthereumChainParameter = {
  chainId: "0x7a0",
  chainName: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: ["https://testrpc.xlayer.tech/terigon"],
  blockExplorerUrls: ["https://www.okx.com/web3/explorer/xlayer-test"],
};

const coordinatorAbi = coordinatorArtifact.abi as Abi;
const tokenAbi = tokenArtifact.abi as Abi;
const asAddress = (value: string | undefined) => value && /^0x[0-9a-fA-F]{40}$/.test(value) ? value as Address : undefined;

export const demoDeployment = {
  coordinator: asAddress(import.meta.env.VITE_EXIT_TOGETHER_ADDRESS),
  sellToken: asAddress(import.meta.env.VITE_DEMO_RWA_TOKEN),
  buyToken: asAddress(import.meta.env.VITE_DEMO_USD_TOKEN),
  batchId: BigInt(import.meta.env.VITE_EXIT_TOGETHER_BATCH_ID || "1"),
};

export const isDemoDeployed = Boolean(demoDeployment.coordinator && demoDeployment.sellToken && demoDeployment.buyToken);
const publicClient = createPublicClient({ chain: xLayerTestnet, transport: http() });

export type WalletStage = "faucet" | "approve" | "join" | "cancel" | "claim";

type ProviderError = {
  code?: number;
  message?: string;
  cause?: unknown;
  data?: { originalError?: unknown } | unknown;
};

function providerErrorCodes(error: unknown, seen = new Set<unknown>()): number[] {
  if (!error || typeof error !== "object" || seen.has(error)) return [];
  seen.add(error);
  const candidate = error as ProviderError;
  const codes = typeof candidate.code === "number" ? [candidate.code] : [];
  const originalError = candidate.data && typeof candidate.data === "object" ? (candidate.data as { originalError?: unknown }).originalError : undefined;
  return [
    ...codes,
    ...providerErrorCodes(candidate.cause, seen),
    ...providerErrorCodes(candidate.data, seen),
    ...providerErrorCodes(originalError, seen),
  ];
}

function providerErrorMessages(error: unknown, seen = new Set<unknown>()): string[] {
  if (!error || typeof error !== "object" || seen.has(error)) return [];
  seen.add(error);
  const candidate = error as ProviderError;
  const messages = typeof candidate.message === "string" ? [candidate.message] : [];
  const originalError = candidate.data && typeof candidate.data === "object" ? (candidate.data as { originalError?: unknown }).originalError : undefined;
  return [
    ...messages,
    ...providerErrorMessages(candidate.cause, seen),
    ...providerErrorMessages(candidate.data, seen),
    ...providerErrorMessages(originalError, seen),
  ];
}

function isUnknownChainError(error: unknown) {
  if (providerErrorCodes(error).includes(4902)) return true;
  return providerErrorMessages(error).some((message) => /unknown chain|unrecognized chain|chain.*not (?:added|found)|unsupported chain/i.test(message));
}

export async function connectXLayer(provider: EIP1193Provider) {
  const accounts = await provider.request({ method: "eth_requestAccounts" }) as Address[];
  if (!accounts[0]) throw new Error("WALLET_ACCOUNT_REQUIRED");

  const currentChainId = await provider.request({ method: "eth_chainId" }).catch(() => undefined);
  if (typeof currentChainId !== "string" || currentChainId.toLowerCase() !== xLayerTestnetWalletParameters.chainId) {
    try {
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: xLayerTestnetWalletParameters.chainId }] });
    } catch (error) {
      if (!isUnknownChainError(error)) throw error;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [xLayerTestnetWalletParameters],
      });
      await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: xLayerTestnetWalletParameters.chainId }] });
    }
  }

  const selectedChainId = await provider.request({ method: "eth_chainId" });
  if (typeof selectedChainId !== "string" || selectedChainId.toLowerCase() !== xLayerTestnetWalletParameters.chainId) {
    throw new Error("XLAYER_TESTNET_REQUIRED");
  }
  return accounts[0];
}

function requireDeployment() {
  if (!demoDeployment.coordinator || !demoDeployment.sellToken || !demoDeployment.buyToken) throw new Error("TESTNET_DEPLOYMENT_PENDING");
  return { coordinator: demoDeployment.coordinator, sellToken: demoDeployment.sellToken, buyToken: demoDeployment.buyToken };
}

export async function joinDemoBatch(provider: EIP1193Provider, account: Address, amount: number, onStage: (stage: WalletStage, hash?: Hex) => void) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("ENTER_A_POSITIVE_ORDER_AMOUNT");
  if (amount > 20000) throw new Error("DEMO_FAUCET_LIMIT_IS_20000_TGSPCX");
  const deployment = requireDeployment();
  const wallet = createWalletClient({ account, chain: xLayerTestnet, transport: custom(provider) });
  const sellAmount = parseEther(amount.toFixed(2));
  const minimumBuy = sellAmount * 9850n / 10000n;
  const balance = await publicClient.readContract({ address: deployment.sellToken, abi: tokenAbi, functionName: "balanceOf", args: [account] }) as bigint;
  if (balance < sellAmount) {
    const claimed = await publicClient.readContract({ address: deployment.sellToken, abi: tokenAbi, functionName: "hasClaimedFaucet", args: [account] }) as boolean;
    if (claimed) throw new Error("DEMO_TOKEN_BALANCE_LOW");
    onStage("faucet");
    const faucetHash = await wallet.writeContract({ address: deployment.sellToken, abi: tokenAbi, functionName: "faucet", account });
    onStage("faucet", faucetHash);
    await publicClient.waitForTransactionReceipt({ hash: faucetHash });
  }
  onStage("approve");
  const approvalHash = await wallet.writeContract({ address: deployment.sellToken, abi: tokenAbi, functionName: "approve", args: [deployment.coordinator, sellAmount], account });
  onStage("approve", approvalHash);
  await publicClient.waitForTransactionReceipt({ hash: approvalHash });
  onStage("join");
  const joinHash = await wallet.writeContract({ address: deployment.coordinator, abi: coordinatorAbi, functionName: "joinBatch", args: [demoDeployment.batchId, sellAmount, minimumBuy], account });
  onStage("join", joinHash);
  const receipt = await publicClient.waitForTransactionReceipt({ hash: joinHash });
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: coordinatorAbi, data: log.data, topics: log.topics });
      if (decoded.eventName === "OrderJoined") return { orderId: (decoded.args as unknown as { orderId: bigint }).orderId, hash: joinHash };
    } catch { /* Ignore unrelated logs. */ }
  }
  throw new Error("ORDER_EVENT_NOT_FOUND");
}

export async function cancelDemoOrder(provider: EIP1193Provider, account: Address, orderId: bigint) {
  const deployment = requireDeployment();
  const wallet = createWalletClient({ account, chain: xLayerTestnet, transport: custom(provider) });
  const hash = await wallet.writeContract({ address: deployment.coordinator, abi: coordinatorAbi, functionName: "cancelOrder", args: [orderId], account });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function claimDemoOrder(provider: EIP1193Provider, account: Address, orderId: bigint) {
  const deployment = requireDeployment();
  const wallet = createWalletClient({ account, chain: xLayerTestnet, transport: custom(provider) });
  const hash = await wallet.writeContract({ address: deployment.coordinator, abi: coordinatorAbi, functionName: "claim", args: [orderId], account });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function readDemoBatch() {
  const deployment = requireDeployment();
  const batch = await publicClient.readContract({ address: deployment.coordinator, abi: coordinatorAbi, functionName: "batches", args: [demoDeployment.batchId] }) as readonly [Hex, Address, Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number, number, Address, Hex];
  return { totalCommitted: batch[5], target: batch[4], participants: batch[10], status: ["OPEN", "SETTLED", "CANCELLED"][batch[11]] ?? "UNKNOWN" };
}
