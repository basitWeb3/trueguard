# ExitTogether execution research

**Checked:** 2026-08-17  
**Rule:** Product existence, venue mechanics and chain support are separate facts. TrueGuard does not combine them into an unsupported integration claim.

## What is verified

| Question | Verified answer | Product consequence | Primary source |
|---|---|---|---|
| Is there a current SpaceX-linked OKX market? | Yes. `SPCXUSD` is an equity-linked X-Perp. It is a derivative and can use leverage. | TrueGuard may explain and verify this product, but must not call it SpaceX equity. | [OKX X-Perps specifications](https://www.okx.com/en-us/help/x-perps-contract-specifications), [OKX SPCXUSD listing](https://www.okx.com/en-sg/help/okx-to-list-spcxusd-expiry-perp-x-perp) |
| Can OKX block trading reduce visible order-book impact? | Yes. OKX documents privately negotiated RFQs and a minimum notional. | A centralized ExitTogether adapter is plausible for eligible instruments and accounts. | [OKX block trading basics](https://www.okx.com/en-gb/help/block-trading-basics), [Building RFQs](https://www.okx.com/en-gb/help/building-rfqs) |
| Is SPCXUSD itself enabled for OKX block RFQ? | Not proven by current public documentation. | The UI and API report `ELIGIBILITY_UNCONFIRMED`. TrueGuard must not offer it as executable yet. | [OKX API documentation](https://www.okx.com/docs-v5/en/) |
| Does OKX have an onchain RFQ system? | Yes. A maker returns a firm signed quote and a taker settles it onchain. | TrueGuard can build an OKX DEX RFQ adapter for supported onchain token pairs. | [OKX DEX market-maker integration](https://web3.okx.com/build/dev-docs-v5/dex-api/dex-api-market-maker) |
| Is X Layer supported by OKX DEX infrastructure? | Yes. X Layer is listed with chain index `196`. | The production adapter is technically aligned with X Layer mainnet. | [OKX DEX supported chains](https://web3.okx.com/vi/onchainos/dev-docs-v5/dex-api/dex-supported-chain), [OKX DEX contracts](https://web3.okx.com/build/docs/waas/dex-smart-contract) |
| Does that make SPCXUSD settleable by the DEX RFQ? | No. `SPCXUSD` is a centralized derivative, not an ERC-20 pair on X Layer. | TrueGuard separates the centralized and onchain lanes. | The two product definitions above; this is an inference from their incompatible settlement models. |
| Why does X Layer care about RWAs? | X Layer publicly positions itself for tokenized securities, funds and other onchain markets, and has RWA data infrastructure. | An RWA verification and coordinated-settlement layer fits the chain's stated direction. | [X Layer and BitGo](https://web3.okx.com/sv/learn/bitgo-xlayer), [Chainlink Data Streams on X Layer](https://web3.okx.com/it/learn/xlayer-chainlink-data-streams), [Exchange OS whitepaper](https://web3.okx.com/zh-hans/whitepaper/okx-exchange-os.pdf) |

## What the MVP proves

The X Layer testnet demo proves the coordination and settlement rules without making a false market claim:

1. Several holders escrow the same exact test token.
2. Each holder sets minimum proceeds and a deadline.
3. A quote signer signs the exact batch amount, result, expiry, quote ID and executor.
4. The coordinator rejects undersized, expired, replayed or below-limit quotes.
5. Settlement exchanges the whole batch and lets holders claim pro rata.

`tgSPCX` and `tgUSD` exist only for the testnet demo. They have no real-world value and no claim on SpaceX, stock or cash.

## Production activation gates

- Verify the exact RWA token contract and transfer rules.
- Verify usable X Layer liquidity for the same pair.
- Obtain OKX OnchainOS credentials and configure an allowlisted pair.
- Onboard at least one maker willing to sign executable quotes.
- Compare the batch quote and the individual alternative at the same time after every fee.
- Complete contract audit, compliance review and incident controls before real value moves.
