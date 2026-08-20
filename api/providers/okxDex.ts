import { createHmac } from "node:crypto";

export type OkxDexQuoteInput = {
  chainIndex: "196";
  fromTokenAddress: `0x${string}`;
  toTokenAddress: `0x${string}`;
  amount: string;
  slippagePercent: string;
};

const credentials = () => ({
  accessKey: process.env.OKX_ACCESS_KEY,
  secretKey: process.env.OKX_SECRET_KEY,
  passphrase: process.env.OKX_PASSPHRASE,
  projectId: process.env.OKX_PROJECT_ID,
});

export function okxDexConfiguration() {
  const values = credentials();
  const configured = Boolean(values.accessKey && values.secretKey && values.passphrase && values.projectId);
  return {
    configured,
    chainIndex: "196",
    scope: "Supported onchain X Layer token pairs only",
    excludes: "SPCXUSD X-Perp and every other centralized derivative",
    missing: Object.entries(values).filter(([, value]) => !value).map(([name]) => name),
  };
}

export async function getOkxDexQuote(input: OkxDexQuoteInput) {
  const config = credentials();
  if (!okxDexConfiguration().configured) throw new Error("OKX_DEX_CREDENTIALS_REQUIRED");
  const query = new URLSearchParams(input).toString();
  const requestPath = `/api/v6/dex/aggregator/quote?${query}`;
  const timestamp = new Date().toISOString();
  const signature = createHmac("sha256", config.secretKey!).update(`${timestamp}GET${requestPath}`).digest("base64");
  const response = await fetch(`https://web3.okx.com${requestPath}`, {
    headers: {
      "OK-ACCESS-KEY": config.accessKey!,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": config.passphrase!,
      "OK-ACCESS-PROJECT": config.projectId!,
    },
  });
  const result = await response.json() as { code?: string; msg?: string; data?: unknown };
  if (!response.ok || result.code !== "0") throw new Error(result.msg || `OKX_DEX_${response.status}`);
  return { provider: "OKX_DEX_RFQ", chainIndex: "196", fetchedAt: new Date().toISOString(), data: result.data };
}
