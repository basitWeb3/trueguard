# TrueGuard Product Requirements Document

**Status:** Implemented MVP v0.3 — testnet deployment pending funding  
**Product:** TrueGuard Protocol and TrueGuard Explore  
**Primary network:** X Layer  
**First reference market:** SpaceX / SPCX  
**Document owner:** TrueGuard team  

## 1. Product definition

### Core belief

> Every RWA should be able to explain itself.

### Category statement

> **The RWA understanding layer for people, products and AI agents.**

### Product statement

TrueGuard is the universal intelligence and verification layer for real-world assets. It turns a token into a living, evidence-backed model of:

- the real company or asset behind the story;
- what exists today and what is still only promised;
- the exact rights the token gives its holder;
- the risks, dependencies, fees and failure points;
- whether the product matches the user's real intention; and
- the available path back to cash; and
- whether a small exit can join a larger, compatible ExitTogether batch.

### Primary message

> **Understand the RWA. Verify the token. Exit together.**

### Short description

TrueGuard explains the real asset, verifies what the token gives its holder, and helps compatible small holders pool sell orders for a better large-order quote. The same result is machine-readable for products and AI agents.

### What TrueGuard is not

TrueGuard is not a price-prediction bot, a buy/sell signal service, a generic research dashboard or a promise that an investment is safe. It is the evidence and decision-context layer used before, during and after an RWA transaction.

## 2. Problem

RWA products join two different realities:

1. A real company, security, commodity, property or cash flow.
2. A token, wrapper, note, fund interest or derivative that references it.

Most users understand only the first reality. They buy the story of SpaceX, Tesla or gold without understanding what the selected onchain product legally and economically represents.

This creates five connected problems:

### 2.1 Story-product confusion

A user may intend to own a company but accidentally buy a perpetual contract, debt claim or synthetic price tracker.

### 2.2 Hype-reality confusion

Operating products, projects under development and long-term ambitions are presented as if they are equally real.

### 2.3 Fragmented evidence

The company story, issuer terms, smart contract, custody model, fees and exit rules live in different places and use different language.

### 2.4 No intent check

Trading interfaces can execute the selected token without checking whether it matches what the user said they wanted.

### 2.5 Small-holder exit penalty

Small RWA holders can face the worst execution. Their order is too small for block or RFQ routes, yet it can still lose meaningful value to a thin order book, spread, gas or fixed fees. Each holder exits alone even when many holders want to sell the same product at the same time.

## 3. Product goal

Before any person, product or agent uses an RWA, TrueGuard must answer six questions in plain language:

1. What real asset or company is this connected to?
2. What is operating now, what is being built, and what is only a future claim?
3. What exactly does this token give its holder?
4. Does this product match the user's stated intention?
5. What can go wrong?
6. How can the holder exit, what will that exit cost, and can compatible small orders exit together for a better quote?

## 4. Users

### 4.1 Retail explorer

Wants to understand a hyped company or asset without reading many documents.

**Job:** “Help me understand why people care, then tell me what I would actually be buying.”

### 4.2 RWA trader

Already trades tokenized stocks, commodities or RWA derivatives.

**Job:** “Show me the rights and costs, then help my small order reach a better exit.”

### 4.3 AI trading agent

Needs structured facts and deterministic checks before proposing or executing a transaction.

**Job:** “Resolve the user's intent, verify the product type and find or quote a compatible exit batch.”

### 4.4 Wallet or trading product

Needs an embeddable RWA explanation and pre-trade verification layer.

**Job:** “Add trustworthy RWA context and ExitTogether quoting without building both systems.”

### 4.5 RWA issuer or market operator

Needs a clear, versioned representation of its product and evidence.

**Job:** “Make the asset understandable and reduce product misunderstanding.”

## 5. Product surfaces

### 5.1 TrueGuard Explore

The human-facing visual experience.

- Search by company, asset, ticker or contract address.
- Explore a visual model of the real business or asset.
- Switch between **Live**, **Building**, **Vision** and **Risk** layers.
- Open any object or claim to see its source and verification date.
- Move from the real-world story into the exact token product.

### 5.2 TrueGuard Verify

The intent and product-matching engine.

- Extract the user's intended exposure.
- Classify the selected product: direct security, custodial token, fund share, debt claim, synthetic token, spot wrapper, perpetual or other derivative.
- Compare desired rights with actual rights.
- Return `MATCH`, `PARTIAL_MATCH`, `MISMATCH` or `UNKNOWN`.
- Explain the result in plain language.
- Require explicit confirmation before a material mismatch can proceed.

### 5.3 ExitTogether

The small-holder exit coordination layer.

- Find holders who want to sell the same RWA product in the same direction.
- Pool compatible orders until the batch reaches a useful block or RFQ size.
- Compare the holder's individual venue quote with the batch quote at the same time.
- Show the batch total, participant count, target, deadline, fees and projected savings.
- Let every holder set a maximum slippage and deadline.
- Execute only when one firm quote satisfies every included holder's limit.
- Allocate the result pro rata and return a verifiable execution receipt.
- Keep centralized venue products and onchain token settlement in separate, clearly labelled execution lanes.

Generic sell, close and redemption routes remain supporting context. They are not ExitTogether.

### 5.4 TrueGuard Protocol

The shared infrastructure for products and agents.

- Versioned asset records.
- Evidence roots and source metadata.
- Token-to-underlying mappings.
- Product classification and rights schema.
- Intent-check attestations.
- Exit-route quotes and ExitTogether batch commitments.
- Onchain verification of the exact research version used for a decision.

### 5.5 TrueGuard API and SDK

Initial interface:

```text
searchAssets(query)
explainAsset(assetId)
getRealityGraph(assetId)
getEvidence(claimId)
getTokenRights(chainId, contract)
checkIntent(intent, productId)
compareProducts(productIds, userContext)
getExitRoutes(productId, amount, userContext)
getExitTogetherPool(productId, userContext)
quoteExitTogether(productId, amount, constraints)
joinExitTogether(poolId, order, signedLimits)
verifyResearchPack(packHash)
```

## 6. Core experience: SpaceX / SPCX

### 6.1 User entry

The user searches “SpaceX” or “SPCX”.

### 6.2 Visual reality model

The initial scene shows Earth, the satellite network, launch infrastructure, reusable rockets and future destinations.

The user can switch between:

- **Live:** verified operating products and infrastructure.
- **Building:** projects with active development evidence.
- **Vision:** long-term company claims and ambitions.
- **Risk:** technical, financial, regulatory and dependency risks.

### 6.3 Product truth

TrueGuard displays the available SPCX-linked product and states, above the fold:

> This product gives price exposure. It does not give ownership of SpaceX.

The product card includes product type, issuer or venue, underlying reference, leverage, funding, expiry, shareholder rights, dividends and exit method.

### 6.4 Intent mismatch

User intent:

> “I want to own SpaceX stock.”

Selected product:

> SPCX price derivative.

TrueGuard result:

> **Mismatch:** This product tracks SpaceX's price but does not make you a SpaceX shareholder.

### 6.5 ExitTogether preview

The user enters a small SPCX-linked exit. TrueGuard first shows an illustrative comparison. The executable hackathon demo then uses `tgSPCX`, a clearly labelled X Layer testnet reference token. `tgSPCX` is not SpaceX equity and is not OKX's SPCXUSD X-Perp.

TrueGuard keeps two routes separate:

- **Onchain token route:** escrow and settlement through `ExitTogetherCoordinator` on X Layer. The demo uses a maker-signed testnet quote. OKX OnchainOS can be used only when the exact RWA token pair is supported on X Layer mainnet and credentials are configured.
- **Centralized derivative route:** an OKX block RFQ adapter can be used only if the user's account and the exact instrument are eligible. Public OKX documentation does not currently prove that SPCXUSD is block-RFQ eligible, so the product must show this route as unconfirmed.

### 6.6 Transaction context

The final action references the exact TrueGuard research-pack hash and intent-check result registered on X Layer.

## 7. Information design

### 7.1 Claim states

Every material statement must be assigned one state:

- `VERIFIED_LIVE`
- `VERIFIED_BUILDING`
- `COMPANY_VISION`
- `THIRD_PARTY_ESTIMATE`
- `DISPUTED`
- `UNKNOWN`

### 7.2 Evidence requirements

Every material claim must contain:

- claim text;
- source URL;
- source publisher;
- source type;
- publication date;
- retrieval date;
- quoted or extracted evidence span;
- confidence;
- review status; and
- content hash.

### 7.3 Source priority

1. Regulator, government registry or court record.
2. Issuer prospectus, filing, legal terms or audited report.
3. Company investor relations or official technical documentation.
4. Reputable independent reporting or research.
5. Community discussion used only as evidence of user sentiment or confusion.

### 7.4 Visual rules

3D is used for physical systems and relationships, not for decorative financial charts.

Use 3D for:

- infrastructure;
- supply chains;
- facilities and locations;
- physical flows;
- business dependencies; and
- timelines that benefit from spatial context.

Use simple 2D cards for:

- legal rights;
- fees;
- risk warnings;
- product comparisons;
- exit estimates; and
- evidence citations.

## 8. AI requirements

### 8.1 Research agent

- Finds and prioritises primary sources.
- Extracts claims and supporting evidence.
- Detects conflicts and missing information.
- Never upgrades a company claim into a verified fact.

### 8.2 Product-classification agent

- Reads issuer terms and contract metadata.
- Produces a structured product classification.
- Identifies ownership, economic exposure, voting, distributions, transfer controls, leverage and expiry.

### 8.3 Reality-graph agent

- Extracts entities and relationships.
- Separates live infrastructure from projects and ambitions.
- Produces scene-ready structured JSON.

### 8.4 Intent agent

- Converts natural-language intent into required product properties.
- Does not execute trades.
- Returns a result that deterministic policy checks can validate.

### 8.5 Explanation agent

- Adapts explanations to the user's knowledge level.
- Uses short sentences and plain language.
- Always links material claims to evidence.

### 8.6 AI boundaries

- AI may propose claims; it may not self-attest them as true.
- Legal rights must be derived from cited terms and marked for human review when ambiguous.
- Numerical fees and quotes must come from deterministic calculations and current data.
- Unsupported facts must be shown as unknown.

## 9. X Layer architecture

### 9.1 Onchain contracts

#### ResearchPackRegistry

Stores:

- asset ID;
- product ID;
- research-pack hash;
- evidence Merkle root;
- schema version;
- publisher or attester;
- creation time;
- expiry or review time; and
- status.

#### ProductIdentityRegistry

Maps a chain and contract address to:

- the referenced real-world asset;
- product classification;
- issuer identity;
- official document hashes; and
- current research pack.

#### IntentCheckRegistry

Optionally records a privacy-safe hash of:

- requested exposure;
- selected product;
- match result;
- research version; and
- timestamp.

No private user text is stored onchain.

#### ExecutionAdapter

- Accepts supported trade or route requests.
- Requires a current research pack.
- Requires explicit confirmation for `MISMATCH` results.
- References the intent-check and research-pack hashes in emitted events.

#### ExitTogetherCoordinator

- Registers a batch for one exact product ID, sell token, buy token, minimum size and deadline.
- Escrows each holder's sell token and records that holder's minimum proceeds.
- Allows the holder to cancel and withdraw while the batch remains open.
- Accepts only a quote signed by the authorised quote signer for the exact chain, coordinator, batch, aggregate sell amount, buy amount, expiry, quote ID and executor.
- Rejects a quote below the aggregate of all holder minimums, below the batch size or after its deadline.
- Prevents quote replay, transfers the aggregate sell token atomically and receives settlement tokens.
- Lets each holder claim pro-rata settlement proceeds, with final-claim dust handling.

### 9.2 Offchain services

- Source ingestion and document storage.
- AI research and claim extraction.
- Human-review queue.
- Reality-graph generation.
- 3D scene configuration.
- Market and exit-route data.
- Batch formation, RFQ adapters and settlement coordination for ExitTogether.
- API gateway and SDK.

### 9.3 Why X Layer is necessary

X Layer is the shared verification and execution environment. It makes a TrueGuard research version portable between wallets, market interfaces and agents, and binds the explanation used before a transaction to the transaction context itself.

## 10. Data model

### Asset

```ts
type Asset = {
  id: string;
  name: string;
  category: "company" | "commodity" | "fund" | "credit" | "property";
  summary: string;
  realityGraphId: string;
  products: string[];
};
```

### Product

```ts
type Product = {
  id: string;
  assetId: string;
  chainId?: number;
  contractAddress?: string;
  productType: string;
  rights: ProductRights;
  costs: ProductCosts;
  exitMethods: ExitMethod[];
  researchPackHash: string;
};
```

### Claim

```ts
type Claim = {
  id: string;
  assetId: string;
  text: string;
  state: ClaimState;
  evidence: Evidence[];
  confidence: number;
  lastVerifiedAt: string;
};
```

### ExitTogetherBatch

```ts
type ExitTogetherBatch = {
  id: string;
  productId: string;
  side: "sell";
  targetValueUsd: number;
  committedValueUsd: number;
  participantCount: number;
  closesAt: string;
  status: "FORMING" | "QUOTING" | "READY" | "EXECUTED" | "EXPIRED";
  maxSlippageRoot: string;
  quoteHash?: string;
  allocationRoot?: string;
};
```

## 11. Functional requirements

### P0: Hackathon MVP

- Search and open SpaceX/SPCX.
- Render an interactive visual reality model.
- Filter Live, Building, Vision and Risk claims.
- Show citations for every material claim.
- Display the exact SPCX product type and holder rights.
- Run the “own stock” versus “buy derivative” mismatch check.
- Show an illustrative ExitTogether comparison and a separate, clearly labelled X Layer testnet settlement path.
- Publish a research-pack hash to X Layer testnet.
- Expose `explainAsset`, `getTokenRights`, `checkIntent`, `getExitRoutes`, `getExitTogetherPool` and `quoteExitTogether` through an API.
- Provide a 90-second end-to-end demo.

### P1: Expanded MVP

- Add Tesla/xTSLA and tokenized gold.
- Compare multiple products linked to one underlying asset.
- Add wallet integration. **Implemented.**
- Add execution adapter. **Implemented as an interface with signed testnet RFQ and credential-gated OKX DEX adapter.**
- Add signed batch joining and one live RFQ or venue adapter. **Signed onchain batch implemented; production provider activation still needs credentials, an eligible pair and maker onboarding.**
- Publish TypeScript SDK and agent tool definitions.

### P2: Post-hackathon

- Open asset-submission and attestation network.
- Continuous monitoring and research-pack expiry.
- More RWA categories.
- Embeddable visual components.
- Institution and issuer dashboards.
- Monetised API plans.

## 12. Non-goals for the first release

- Predicting future prices.
- Recommending that a user buy or sell.
- Automatically generating perfect 3D worlds for every asset.
- Proving offchain facts without a trusted source or attester.
- Supporting every jurisdiction.
- Guaranteeing redemption or liquidity.
- Claiming that aggregation always reduces slippage. ExitTogether executes only when the firm batch quote beats the holder's permitted alternative after fees.

## 13. Success metrics

### User understanding

- At least 80% of test users correctly identify what the product represents after the experience.
- At least 80% can explain that ExitTogether groups compatible small sell orders to seek a better large-order quote.
- Time to a correct basic understanding is under three minutes.

### Product usefulness

- Intent mismatch is detected in all defined test cases.
- Every material UI claim has a working evidence link.
- ExitTogether clearly separates demo assumptions, indicative quotes and executable firm quotes.
- No batch executes outside any included holder's signed slippage limit.

### Infrastructure adoption

- One external agent or demo integration calls the API.
- Research pack is verifiable on X Layer.
- The same asset record is consumed by both the human UI and an agent endpoint.

## 14. Security and trust model

### Main risks

- AI hallucination.
- Stale or changed issuer terms.
- Source poisoning.
- Incorrect contract-to-product mapping.
- Promotional bias.
- False certainty around legal rights.
- Stale market data in exit estimates.
- Batch manipulation, last-look abuse or an RFQ quote that worsens before settlement.
- Unfair allocation, cancellation races, mixed products or mixed directions in one batch.
- False marketing that treats projected savings as guaranteed savings.
- User privacy leakage through intent records.

### Required controls

- Primary-source ranking.
- Evidence spans and content hashes.
- Claim expiry and review timestamps.
- Independent contract-address verification.
- Clear distinction between fact, claim, estimate and vision.
- Human review for ambiguous legal classification.
- No raw user intent stored onchain.
- Explicit freshness shown on all quotes.
- Exact-product and same-direction batch checks.
- Signed maximum slippage, deadline and cancellation rules for every order.
- Firm-quote comparison after all fees before execution.
- Pro-rata allocation and auditable batch receipts.

## 15. Business model

- Free TrueGuard Explore for users.
- Paid API usage for wallets, agents and trading products.
- Enterprise monitoring and integration plans.
- Issuer-sponsored asset pages with strict labelling and no control over independent risk findings.
- Verification and attestation fees for research-pack publication.

Payment by an issuer must never change claim status, risk presentation or product classification.

## 16. Build plan

### Day 1: Product foundation

- Freeze schema and user journey.
- Build SpaceX visual shell.
- Create initial claim and evidence dataset.

### Day 2: Product truth and intent

- Build product-rights card.
- Implement intent parser and deterministic mismatch rules.
- Add evidence drawer.

### Day 3: ExitTogether and protocol

- Build the ExitTogether pool, quote comparison and batch-progress view.
- Keep generic exit-route information as supporting context.
- Deploy ResearchPackRegistry to X Layer testnet.
- Connect research version to the UI.

### Day 4: Agent and integration layer

- Publish API endpoints and tool schemas.
- Add one external-agent demo.
- Add Tesla or gold as the second asset.

### Day 5: Reliability and submission

- Verify every claim and link.
- Complete end-to-end tests.
- Record the 90-second demo.
- Publish contracts, repository and integration documentation.

## 17. MVP acceptance criteria

The MVP is complete when a new user can:

1. Search SpaceX.
2. Understand the operating business, current projects and future vision visually.
3. Open SPCX and immediately see that the product is not company ownership.
4. Ask to own SpaceX stock and receive a clear mismatch warning.
5. Enter a small exit, see the declared comparison, and join/cancel/claim a clearly labelled testnet batch through a wallet.
6. Verify the sources behind each claim.
7. Verify the research-pack version on X Layer.

An AI agent must be able to obtain the same core result through the API without using the visual interface.

## 18. Open decisions

- Final product logo and visual identity.
- Initial attester and research-pack update policy.
- First production RWA token pair with verified X Layer liquidity and legal transfer eligibility.
- OKX block-RFQ eligibility for SPCXUSD or another exact centralized instrument.
- Production market-maker onboarding and commercial quote terms.
- Whether intent receipts remain local by default or are optionally published as hashes.

## 19. Current implementation status

Implemented in the repository:

- Six compiled Solidity contracts, including `ExitTogetherCoordinator` and two testnet-only ERC-20s.
- A seeded testnet deployment script and a maker-signed settlement script.
- Exact-token escrow, holder minimum proceeds, deadline, cancellation, quote replay protection, atomic settlement and pro-rata claims.
- Wallet connect, faucet, approval, join, cancel, settlement refresh and claim states in the frontend.
- Execution-provider status API, X Layer contract-state API and credential-gated OKX DEX quote adapter.
- SDK methods and agent-readable endpoints for pool, provider and contract state.

Not yet completed because it requires external credentials or funds:

- X Layer testnet deployment address and transaction links.
- A production OKX API key and supported RWA token pair.
- Confirmation from OKX that the exact SPCXUSD instrument is block-RFQ eligible.
- Recorded video and final submission form.
