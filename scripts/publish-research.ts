import fs from "node:fs";
import path from "node:path";
import { concatHex, createPublicClient, createWalletClient, defineChain, http, keccak256, toBytes, zeroAddress } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { assets } from "../src/data/assets";
import { researchPackHash } from "../src/domain/research";

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
const deploymentPath = path.resolve("deployments/xlayer-testnet.json");
if (!fs.existsSync(deploymentPath)) throw new Error("Deploy the registries first with pnpm contracts:deploy:xlayer.");

const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as { researchPackRegistry: `0x${string}`; productIdentityRegistry: `0x${string}` };
const researchArtifact = JSON.parse(fs.readFileSync(path.resolve("artifacts/ResearchPackRegistry.json"), "utf8")) as { abi: unknown[] };
const productArtifact = JSON.parse(fs.readFileSync(path.resolve("artifacts/ProductIdentityRegistry.json"), "utf8")) as { abi: unknown[] };
const account = privateKeyToAccount(key as `0x${string}`);
const wallet = createWalletClient({ account, chain: xLayerTestnet, transport: http() });
const publicClient = createPublicClient({ chain: xLayerTestnet, transport: http() });

for (const asset of assets) {
  const assetKey = keccak256(toBytes(asset.id));
  const evidenceRoot = keccak256(concatHex(asset.evidence.map((item) => item.contentHash)));
  const validUntil = BigInt(Math.floor(new Date(asset.validUntil).getTime() / 1000));
  const packHash = researchPackHash(asset);
  const packTx = await wallet.writeContract({
    address: deployment.researchPackRegistry,
    abi: researchArtifact.abi,
    functionName: "publish",
    args: [assetKey, evidenceRoot, packHash, validUntil, 1, `trueguard://research-packs/${asset.id}/${asset.researchVersion}`],
  } as never);
  await publicClient.waitForTransactionReceipt({ hash: packTx });
  console.log(`Published research pack: ${asset.id} (${packTx})`);

  for (const product of asset.products) {
    const productKey = keccak256(toBytes(product.id));
    const rightsHash = keccak256(toBytes(JSON.stringify(product.rights)));
    const productClass = keccak256(toBytes(product.productType));
    const chainId = product.id === "paxg" || product.id === "tslax" ? 1n : 0n;
    const token = Object.values(product.contractAddresses)[0] ?? zeroAddress;
    const productTx = await wallet.writeContract({
      address: deployment.productIdentityRegistry,
      abi: productArtifact.abi,
      functionName: "publish",
      args: [productKey, assetKey, chainId, token, productClass, rightsHash, validUntil, `trueguard://products/${product.id}`],
    } as never);
    await publicClient.waitForTransactionReceipt({ hash: productTx });
    console.log(`Published product identity: ${product.id} (${productTx})`);
  }
}
