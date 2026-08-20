# TrueGuard 90-second demo and submission pack

## One-line pitch

**TrueGuard shows what an RWA really gives you, then lets small holders combine matching sell orders and accept one better quote without giving up their own price limit.**

## The problem in simple English

RWA buyers often understand the famous company or asset, but not the product they bought. When they want to leave, a small sell can get a poor price in a thin market. Research tools explain. Trading tools execute. Neither keeps the product truth and the exit rules together.

## The demo story — 90 seconds

**0–12 seconds — Understand**  
Search SpaceX. Rotate the visual model. Switch between Live, Building, Vision and Risk. Say: “TrueGuard separates what exists today from what is still a promise.”

**12–28 seconds — Verify the product**  
Open SPCX. Show: “Price exposure. No SpaceX ownership.” Enter “I want to own SpaceX stock.” Show the mismatch. Open the official source.

**28–43 seconds — Explain ExitTogether**  
Scroll to the animated small orders becoming one batch. Say: “Small holders keep their own minimum price. TrueGuard only combines the same token and the same sell direction.”

**43–68 seconds — Join on X Layer**  
Enter `12,750`. Connect a wallet. Request test tokens, approve the exact amount and join. Show the X Layer explorer transaction. State clearly: “tgSPCX is a testnet reference token, not SpaceX equity.”

**68–82 seconds — Settle and claim**  
Run `pnpm contracts:settle:xlayer` in the prepared terminal. Refresh settlement, then claim tgUSD. Show the transaction. Say: “The contract rejected any quote below a holder's minimum and distributed the accepted quote pro rata.”

**82–90 seconds — Infrastructure**  
Show the install command and provider-status API. End with: “People see the truth. Products and AI agents get the same answer. Small holders can exit together.”

## Demo preparation

```bash
cd /Users/basit_web3/trueguard
pnpm verify
export XLAYER_PRIVATE_KEY=0xYOUR_FUNDED_TESTNET_KEY
pnpm contracts:deploy:xlayer
```

Copy the three addresses from `deployments/xlayer-testnet.json` into `.env.local` using `.env.example`, restart Vite, and fund the demo wallet with testnet OKB for gas. After the UI batch reaches its target:

Official faucet: [X Layer testnet faucet](https://web3.okx.com/nl/xlayer/faucet)

```bash
pnpm contracts:settle:xlayer
```

## What to show judges

- Human explanation and machine-readable API use the same product data.
- The SPCX ownership mismatch is deterministic, not an AI opinion.
- Every material claim opens a primary source.
- The ExitTogether contract is on X Layer and the explorer shows join, settle and claim transactions.
- The test token warning is visible before the wallet button.
- Provider status never calls an unverified route “live.”

## Submission checklist

- [ ] Add deployed contract addresses and explorer links.
- [ ] Add repository URL and public frontend URL.
- [ ] Record the 90-second flow above.
- [ ] Confirm the event's current eligibility, deadline, team and submission-field rules from the official event page.
- [ ] Include `EXECUTION_RESEARCH.md` as the integration evidence note.
- [ ] State which pieces are testnet demos and which external providers still require credentials.
- [ ] Do not claim OKX, X Layer or issuer partnership unless formally confirmed.
