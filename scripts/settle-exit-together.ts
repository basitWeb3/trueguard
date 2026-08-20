import fs from "node:fs";
import { createPublicClient, createWalletClient, defineChain, http, keccak256, stringToHex, type Address, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import coordinatorArtifact from "../artifacts/ExitTogetherCoordinator.json";
import tokenArtifact from "../artifacts/MockERC20.json";

const chain = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://testrpc.xlayer.tech/terigon"] } },
  blockExplorers: { default: { name: "OKLink", url: "https://www.okx.com/web3/explorer/xlayer-test" } },
  testnet: true,
});

const key = process.env.XLAYER_PRIVATE_KEY;
if (!key?.startsWith("0x") || key.length !== 66) throw new Error("Set XLAYER_PRIVATE_KEY to the quote-signer/maker key used during deployment.");
const deployment = JSON.parse(fs.readFileSync("deployments/xlayer-testnet.json", "utf8")) as { exitTogetherCoordinator: Address; demoUsdToken: Address; demoBatchId: number };
const account = privateKeyToAccount(key as Hex);
const wallet = createWalletClient({ account, chain, transport: http() });
const publicClient = createPublicClient({ chain, transport: http() });
const batch = await publicClient.readContract({ address: deployment.exitTogetherCoordinator, abi: coordinatorArtifact.abi, functionName: "batches", args: [BigInt(deployment.demoBatchId)] }) as readonly [Hex, Address, Address, bigint, bigint, bigint, bigint, bigint, bigint, bigint, number, number, Address, Hex];
const totalCommitted = batch[5];
const minBatchSellAmount = batch[4];
const totalMinimumBuy = batch[6];
if (batch[11] !== 0) throw new Error("The demo batch is not open.");
if (totalCommitted < minBatchSellAmount) throw new Error(`The batch has not reached its minimum. Committed: ${totalCommitted}; required: ${minBatchSellAmount}.`);

const quotedBuyAmount = totalCommitted * 9925n / 10000n;
if (quotedBuyAmount < totalMinimumBuy) throw new Error("The 0.75% demo quote is outside at least one holder's minimum proceeds.");
const validUntil = BigInt(Math.floor(Date.now() / 1000) + 600);
const quoteId = keccak256(stringToHex(`trueguard-demo-${Date.now()}`));
const digest = await publicClient.readContract({
  address: deployment.exitTogetherCoordinator,
  abi: coordinatorArtifact.abi,
  functionName: "quoteDigest",
  args: [BigInt(deployment.demoBatchId), totalCommitted, quotedBuyAmount, validUntil, quoteId, account.address],
}) as Hex;
const signature = await account.sign({ hash: digest });

const approval = await wallet.writeContract({ address: deployment.demoUsdToken, abi: tokenArtifact.abi, functionName: "approve", args: [deployment.exitTogetherCoordinator, quotedBuyAmount] });
await publicClient.waitForTransactionReceipt({ hash: approval });
const settlement = await wallet.writeContract({ address: deployment.exitTogetherCoordinator, abi: coordinatorArtifact.abi, functionName: "settleBatch", args: [BigInt(deployment.demoBatchId), quotedBuyAmount, validUntil, quoteId, signature] });
const receipt = await publicClient.waitForTransactionReceipt({ hash: settlement });
if (receipt.status !== "success") throw new Error(`Settlement failed: ${settlement}`);
console.log(`ExitTogether batch ${deployment.demoBatchId} settled: ${settlement}`);
