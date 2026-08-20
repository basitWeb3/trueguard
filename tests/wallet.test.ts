/// <reference types="vite/client" />

import { describe, expect, it, vi } from "vitest";
import type { EIP1193Provider } from "viem";
import { connectXLayer, xLayerTestnetWalletParameters } from "../src/contracts/exitTogether";

const address = "0x1111111111111111111111111111111111111111";

describe("X Layer wallet connection", () => {
  it("connects an authorized wallet that is already on X Layer testnet", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_requestAccounts") return [address];
      if (method === "eth_chainId") return "0x7a0";
      throw new Error(`Unexpected method: ${method}`);
    });

    const result = await connectXLayer({ request } as unknown as EIP1193Provider);

    expect(result).toBe(address);
    expect(request).toHaveBeenCalledTimes(3);
  });

  it("adds X Layer when a wallet nests its unknown-chain error", async () => {
    let chainId = "0x1";
    const request = vi.fn(async ({ method, params }: { method: string; params?: unknown }) => {
      if (method === "eth_requestAccounts") return [address];
      if (method === "eth_chainId") return chainId;
      if (method === "wallet_switchEthereumChain" && chainId === "0x1") {
        throw { code: -32603, data: { originalError: { code: 4902, message: "Unrecognized chain" } } };
      }
      if (method === "wallet_addEthereumChain") {
        expect(params).toEqual([xLayerTestnetWalletParameters]);
        chainId = "0x7a0";
        return null;
      }
      if (method === "wallet_switchEthereumChain") return null;
      throw new Error(`Unexpected method: ${method}`);
    });

    await expect(connectXLayer({ request } as unknown as EIP1193Provider)).resolves.toBe(address);
    expect(request).toHaveBeenCalledWith({ method: "wallet_addEthereumChain", params: [xLayerTestnetWalletParameters] });
  });

  it("does not turn a user rejection into an add-network request", async () => {
    const rejection = { code: 4001, message: "User rejected the request" };
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_requestAccounts") return [address];
      if (method === "eth_chainId") return "0x1";
      if (method === "wallet_switchEthereumChain") throw rejection;
      throw new Error(`Unexpected method: ${method}`);
    });

    await expect(connectXLayer({ request } as unknown as EIP1193Provider)).rejects.toBe(rejection);
    expect(request).not.toHaveBeenCalledWith(expect.objectContaining({ method: "wallet_addEthereumChain" }));
  });
});
