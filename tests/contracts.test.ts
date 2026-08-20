import { describe, expect, it } from "vitest";
import { encodeAbiParameters, keccak256, recoverAddress, stringToHex, type Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import coordinatorArtifact from "../artifacts/ExitTogetherCoordinator.json";
import { quoteProviderStatuses } from "../src/domain/quoteProviders";

describe("ExitTogether protocol surface", () => {
  it("compiles the escrow, cancellation, settlement and claim interface", () => {
    const functions = coordinatorArtifact.abi.filter((item) => item.type === "function").map((item) => item.name);
    expect(functions).toEqual(expect.arrayContaining(["createBatch", "joinBatch", "cancelOrder", "settleBatch", "claim", "quoteDigest"]));
    const events = coordinatorArtifact.abi.filter((item) => item.type === "event").map((item) => item.name);
    expect(events).toEqual(expect.arrayContaining(["OrderJoined", "OrderCancelled", "BatchSettled", "ProceedsClaimed"]));
  });

  it("binds a signed quote to the chain, coordinator, batch, amounts, expiry, quote ID and executor", async () => {
    const account = privateKeyToAccount("0x1000000000000000000000000000000000000000000000000000000000000001");
    const quoteTypehash = keccak256(stringToHex("ExitTogetherQuote(uint256 chainId,address coordinator,uint64 batchId,uint128 sellAmount,uint128 buyAmount,uint64 validUntil,bytes32 quoteId,address executor)"));
    const digest = keccak256(encodeAbiParameters(
      [
        { type: "bytes32" }, { type: "uint256" }, { type: "address" }, { type: "uint64" },
        { type: "uint128" }, { type: "uint128" }, { type: "uint64" }, { type: "bytes32" }, { type: "address" },
      ],
      [quoteTypehash, 1952n, "0x1111111111111111111111111111111111111111", 1n, 50_000n, 49_625n, 2_000_000_000n, keccak256(stringToHex("quote-1")), "0x2222222222222222222222222222222222222222"],
    ));
    const signature = await account.sign({ hash: digest });
    expect(await recoverAddress({ hash: digest, signature: signature as Hex })).toBe(account.address);
  });

  it("does not claim that SPCX is eligible for either onchain or block execution", () => {
    const dex = quoteProviderStatuses.find((provider) => provider.id === "OKX_DEX_RFQ")!;
    const block = quoteProviderStatuses.find((provider) => provider.id === "OKX_BLOCK_RFQ")!;
    expect(dex.limitation).toContain("cannot settle SPCXUSD");
    expect(block.availability).toBe("ELIGIBILITY_UNCONFIRMED");
  });
});
