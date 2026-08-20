# TrueGuard

> **The RWA understanding layer for people, products and AI agents.**

TrueGuard explains the real asset, verifies what the token gives its holder, and helps compatible small holders pool sell orders for a better large-order quote. A person, wallet, trading product or AI agent can use the same evidence and ExitTogether layer.

The build includes three very different RWA examples:

- **SpaceX / SPCX:** a private-company story connected to a price derivative. It does not give SpaceX ownership.
- **Tesla / TSLAx:** a tokenized tracker certificate. It tracks Tesla's share price but is not a Tesla share.
- **Gold / PAXG:** a token representing allocated physical gold, with eligibility and minimums for physical redemption.

## What is built

- Interactive 3D business/asset models with **Live**, **Building**, **Vision**, and **Risk** views.
- Source drawer with publisher, claim extract, retrieval date, confidence, and content hash.
- Deterministic intent engine with `MATCH`, `PARTIAL_MATCH`, `MISMATCH`, and `UNKNOWN` results.
- Product-rights comparison across a derivative, stock tracker, and allocated commodity token.
- ExitTogether engine with compatible product pools, target progress, individual-versus-batch proceeds, assumptions, and holder safeguards.
- X Layer `ExitTogetherCoordinator` with exact-token escrow, holder minimum proceeds, cancellation, signed-quote verification, replay protection, atomic settlement and pro-rata claims.
- Testnet wallet flow for faucet, approval, join, cancellation, settlement refresh and claim.
- Credential-gated OKX OnchainOS DEX quote adapter plus an explicit provider-readiness API.
- Generic sell, close, and redemption routes as supporting exit context.
- Replayable AI-agent pre-trade simulation showing product resolution, evidence, rights, intent and exit checks.
- Hono API, TypeScript SDK, OpenAPI document, and agent tool definitions.
- Six X Layer Solidity contracts: four verification/guard contracts, the ExitTogether coordinator and a testnet-only ERC-20 implementation.
- Deployment and research publishing scripts for X Layer testnet.
- Strict type checking and automated domain/API tests.

## Run locally

Requires Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

In a second terminal, either change into the project:

```bash
cd /Users/basit_web3/trueguard
pnpm api
```

Or run the workspace shortcut from a fresh terminal opened at `/Users/basit_web3`:

```bash
pnpm api
```

From any directory, the explicit command is:

```bash
pnpm --dir /Users/basit_web3/trueguard api
```

The web app runs at `http://localhost:5173`. The API runs at `http://localhost:8787`, and its OpenAPI document is at `http://localhost:8787/openapi.json`.

Production frontend and API: [`https://trueguard-rwa.netlify.app`](https://trueguard-rwa.netlify.app)  
Production OpenAPI document: [`https://trueguard-rwa.netlify.app/openapi.json`](https://trueguard-rwa.netlify.app/openapi.json)

## API examples

```bash
curl http://localhost:8787/v1/assets/spacex

curl -X POST http://localhost:8787/v1/check-intent \
  -H 'Content-Type: application/json' \
  -d '{"intent":"I want to own SpaceX stock","productId":"spcx-xperp"}'

curl -X POST http://localhost:8787/v1/exit-routes \
  -H 'Content-Type: application/json' \
  -d '{"productId":"paxg","amountUsd":5000}'

curl -X POST http://localhost:8787/v1/exit-together/quote \
  -H 'Content-Type: application/json' \
  -d '{"productId":"spcx-xperp","amountUsd":5000}'

curl http://localhost:8787/v1/execution/providers

curl http://localhost:8787/v1/exit-together/deployment
```

SDK entry point: [`sdk/index.ts`](./sdk/index.ts)  
Agent tool definitions: [`agent/trueguard-tools.json`](./agent/trueguard-tools.json)

The publishable SDK package lives in [`packages/sdk`](./packages/sdk). Build or create its local npm tarball with:

```bash
pnpm sdk:build
pnpm sdk:pack
```

The generated local package is `trueguard-sdk-0.1.0.tgz`. It can be installed into another local project with:

```bash
pnpm add /Users/basit_web3/trueguard/trueguard-sdk-0.1.0.tgz
```

The public package command shown by the frontend is `pnpm add @trueguard/sdk`; publishing that package to the npm registry is an external release step.

## Verify the complete build

```bash
pnpm verify
```

This runs strict TypeScript checks, all tests, Solidity compilation, and the production web build.

## X Layer testnet

The deployment configuration uses the official X Layer testnet values:

- Chain ID: `1952`
- RPC: `https://testrpc.xlayer.tech/terigon`
- Explorer: `https://www.okx.com/web3/explorer/xlayer-test`

Compile and deploy. The script also deploys testnet-only `tgSPCX` and `tgUSD`, creates a 50,000-token batch and seeds 37,250 tokens:

```bash
pnpm contracts:compile
export XLAYER_PRIVATE_KEY=0xYOUR_FUNDED_TESTNET_KEY
pnpm contracts:deploy:xlayer
pnpm contracts:publish:xlayer
```

Deployment writes public contract addresses to `deployments/xlayer-testnet.json`. No private key is written to disk.
Use the [official X Layer testnet faucet](https://web3.okx.com/nl/xlayer/faucet) to fund the deployer and demo wallet with testnet OKB.

Copy the deployment addresses into `.env.local` using `.env.example`, restart Vite, and join the remaining testnet batch through the frontend. Once the target is reached, the configured maker/quote signer can settle it:

```bash
pnpm contracts:settle:xlayer
```

The settlement script signs a quote for the exact current batch and supplies the demo buy token. Holders then claim through the frontend. These tokens have no real-world value.

## Project map

```text
src/data/          Versioned assets, claims, sources, products and exit routes
src/domain/        Research, intent, comparison, exit and ExitTogether engines
src/components/    3D scenes and evidence interface
public/            Self-contained agent and ExitTogether simulations
api/               Public TrueGuard API
sdk/               Integration client
agent/             AI-agent tool schemas
contracts/         X Layer registries, execution guard and ExitTogether settlement
scripts/           Compile, deploy and publish tooling
tests/             Domain and API tests
```

The complete product and acceptance requirements are in [`PRD.md`](./PRD.md). See [`EXECUTION_RESEARCH.md`](./EXECUTION_RESEARCH.md) for the verified venue/chain boundary and [`DEMO_AND_SUBMISSION.md`](./DEMO_AND_SUBMISSION.md) for the 90-second demo.

## Important boundary

TrueGuard explains and verifies product facts. It does not predict prices or claim an investment is safe. ExitTogether does not assume aggregation is always better: production must compare a firm batch quote with the holder's alternative after every fee, then execute only inside each signed limit. The displayed savings are declared demo assumptions. `tgSPCX` is not SpaceX equity and is not OKX's SPCXUSD X-Perp.
