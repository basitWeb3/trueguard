import fs from "node:fs";
import path from "node:path";
import { createPublicClient, createWalletClient, defineChain, http, keccak256, parseEther, stringToHex } from "viem";
import { privateKeyToAccount } from "viem/accounts";

const xLayerTestnet = defineChain({
  id: 1952,
  name: "X Layer Testnet",
  nativeCurrency: { name: "OKB", symbol: "OKB", decimals: 18 },
  rpcUrls: { default: { http: ["https://testrpc.xlayer.tech/terigon"] } },
  blockExplorers: { default: { name: "OKLink", url: "https://www.okx.com/web3/explorer/xlayer-test" } },
  testnet: true,
});

const key = process.env.XLAYER_PRIVATE_KEY;
if (!key?.startsWith("0x") || key.length !== 66) throw new Error("Set XLAYER_PRIVATE_KEY to a funded X Layer testnet deployer key.");
const account = privateKeyToAccount(key as `0x${string}`);
const wallet = createWalletClient({ account, chain: xLayerTestnet, transport: http() });
const publicClient = createPublicClient({ chain: xLayerTestnet, transport: http() });

const readArtifact = (name: string) => JSON.parse(fs.readFileSync(path.resolve("artifacts", `${name}.json`), "utf8")) as { abi: unknown[]; bytecode: `0x${string}` };
async function deploy(name: string, args: readonly unknown[] = []) {
  const artifact = readArtifact(name);
  const hash = await wallet.deployContract({ abi: artifact.abi, bytecode: artifact.bytecode, args } as never);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error(`${name} deployment did not return an address`);
  console.log(`${name}: ${receipt.contractAddress}`);
  return receipt.contractAddress;
}

const researchPackRegistry = await deploy("ResearchPackRegistry");
const productIdentityRegistry = await deploy("ProductIdentityRegistry");
const intentCheckRegistry = await deploy("IntentCheckRegistry");
const executionGuard = await deploy("ExecutionGuard", [researchPackRegistry, productIdentityRegistry, intentCheckRegistry]);
const demoRwaToken = await deploy("MockERC20", ["TrueGuard Demo SPCX Reference", "tgSPCX", parseEther("20000")]);
const demoUsdToken = await deploy("MockERC20", ["TrueGuard Demo USD", "tgUSD", 0n]);
const exitTogetherCoordinator = await deploy("ExitTogetherCoordinator", [account.address]);

const demoRwaArtifact = readArtifact("MockERC20");
const coordinatorArtifact = readArtifact("ExitTogetherCoordinator");
const seededSellAmount = parseEther("37250");
const seededMinimumBuy = parseEther("36691.25");
const demoLiquidity = parseEther("1000000");
const deadline = BigInt(Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60));
const productId = keccak256(stringToHex("demo-spcx-reference"));

async function writeAndWait(label: string, request: Parameters<typeof wallet.writeContract>[0]) {
  const hash = await wallet.writeContract(request);
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (receipt.status !== "success") throw new Error(`${label} failed: ${hash}`);
  console.log(`${label}: ${hash}`);
}

await writeAndWait("Mint seeded tgSPCX", { account, chain: xLayerTestnet, address: demoRwaToken, abi: demoRwaArtifact.abi, functionName: "mint", args: [account.address, seededSellAmount] } as never);
await writeAndWait("Mint maker tgUSD", { account, chain: xLayerTestnet, address: demoUsdToken, abi: demoRwaArtifact.abi, functionName: "mint", args: [account.address, demoLiquidity] } as never);
await writeAndWait("Create ExitTogether batch", { account, chain: xLayerTestnet, address: exitTogetherCoordinator, abi: coordinatorArtifact.abi, functionName: "createBatch", args: [productId, demoRwaToken, demoUsdToken, parseEther("50000"), deadline] } as never);
await writeAndWait("Approve seeded tgSPCX", { account, chain: xLayerTestnet, address: demoRwaToken, abi: demoRwaArtifact.abi, functionName: "approve", args: [exitTogetherCoordinator, seededSellAmount] } as never);
await writeAndWait("Seed ExitTogether batch", { account, chain: xLayerTestnet, address: exitTogetherCoordinator, abi: coordinatorArtifact.abi, functionName: "joinBatch", args: [1n, seededSellAmount, seededMinimumBuy] } as never);

fs.mkdirSync(path.resolve("deployments"), { recursive: true });
fs.writeFileSync(path.resolve("deployments/xlayer-testnet.json"), JSON.stringify({
  chainId: xLayerTestnet.id,
  deployedAt: new Date().toISOString(),
  deployer: account.address,
  researchPackRegistry,
  productIdentityRegistry,
  intentCheckRegistry,
  executionGuard,
  exitTogetherCoordinator,
  demoRwaToken,
  demoUsdToken,
  demoBatchId: 1,
  demoProductId: productId,
  demoNotice: "tgSPCX is a testnet reference token. It is not SpaceX equity and is not the OKX SPCXUSD X-Perp."
}, null, 2));
