import type { AssetModel, Evidence, RealityNode } from "../types";
import { keccak256, toBytes } from "viem";

const checked = "2026-08-16";

const hash = (seed: string): `0x${string}` => {
  return keccak256(toBytes(seed));
};

const evidence = (
  id: string,
  publisher: string,
  title: string,
  url: string,
  sourceType: Evidence["sourceType"],
  extract: string,
): Evidence => ({
  id,
  publisher,
  title,
  url,
  sourceType,
  retrievedAt: checked,
  extract,
  confidence: "high",
  contentHash: hash(`${id}:${title}:${extract}`),
});

const sxFalcon = evidence("sx-falcon", "SpaceX", "Falcon 9", "https://www.spacex.com/vehicles/falcon-9/", "COMPANY", "Falcon 9 is a reusable, two-stage rocket used to transport people and payloads into orbit.");
const sxStarlink = evidence("sx-starlink", "Starlink", "Starlink", "https://www.starlink.com/", "COMPANY", "Starlink provides high-speed internet through a constellation of satellites in low Earth orbit.");
const sxStarship = evidence("sx-starship", "SpaceX", "Starship", "https://www.spacex.com/vehicles/starship/", "COMPANY", "Starship is under development as a fully reusable transportation system.");
const sxMars = evidence("sx-mars", "SpaceX", "Mars & Beyond", "https://www.spacex.com/humanspaceflight/mars/", "COMPANY", "SpaceX presents Mars settlement as a long-term ambition.");
const sxProduct = evidence("spcx-terms", "OKX", "X Perpetuals contract specifications", "https://www.okx.com/en-us/help/x-perps-contract-specifications", "VENUE", "SPCXUSD is a SpaceX-linked X-Perpetual with funding and expiry. The contract provides price exposure and is not company equity.");
const sxListing = evidence("spcx-listing", "OKX", "Pre-IPO pre-market perpetual futures", "https://www.okx.com/en-us/help/okx-to-list-pre-ipo-pre-market-perpetual-futures-for-spacex-usdt-openai-usdt-and-anthropic-usdt", "VENUE", "The product does not grant equity, shares, ownership rights, voting rights, dividends or other shareholder rights.");

const tslaBusiness = evidence("tsla-report", "Tesla Investor Relations", "2025 annual report", "https://ir.tesla.com/_flysystem/s3/sec/000162828026003952/tsla-20251231-gen.pdf", "AUDITED_REPORT", "Tesla reports automotive and energy generation and storage business operations.");
const tslaInvestor = evidence("tsla-ir", "Tesla Investor Relations", "Investor relations", "https://ir.tesla.com/", "COMPANY", "Tesla publishes company filings, results and shareholder information through its investor relations site.");
const tslaxTerms = evidence("tslax-terms", "Backed", "Tesla xStock product page", "https://assets.backed.fi/products/tesla-xstock", "ISSUER", "TSLAx is a tracker certificate designed to track Tesla's price. The token is not a Tesla share and gives no direct shareholder rights.");
const tslaxVenue = evidence("tslax-venue", "Kraken", "Tesla xStock", "https://www.kraken.com/xstocks/tslax", "VENUE", "TSLAx provides tokenized price exposure and may be sold on a venue or redeemed with the issuer subject to terms and fees.");

const paxgProduct = evidence("paxg-product", "Paxos", "PAX Gold", "https://www.paxos.com/pax-gold", "ISSUER", "Each PAXG token represents one fine troy ounce of allocated London Good Delivery gold held in custody by Paxos.");
const paxgTerms = evidence("paxg-terms", "Paxos", "PAX Gold terms and conditions", "https://www.paxos.com/terms-and-conditions/pax-gold-terms-conditions", "LEGAL_TERMS", "Verified customers can redeem PAXG under the stated eligibility, minimum and settlement conditions.");
const paxgFees = evidence("paxg-fees", "Paxos Support", "PAX Gold fees", "https://support.paxos.com/articles/2899561282-PAX-Gold-Fees", "ISSUER", "Paxos publishes creation and destruction fees, including fixed fees for small amounts.");

const spaceClaims: RealityNode[] = [
  { id: "sx-launch", title: "Rockets fly today", description: "SpaceX runs reusable rockets that carry people and payloads to orbit.", layer: "live", state: "VERIFIED_LIVE", evidence: [sxFalcon] },
  { id: "sx-internet", title: "Satellite internet is live", description: "Starlink sells internet access through a low-orbit satellite network.", layer: "live", state: "VERIFIED_LIVE", evidence: [sxStarlink] },
  { id: "sx-starship-build", title: "Starship is still being built", description: "The larger reusable system is in active development. It is not a finished transport network.", layer: "building", state: "VERIFIED_BUILDING", evidence: [sxStarship] },
  { id: "sx-mars-vision", title: "Mars is the vision", description: "Moving people to Mars is a long-term goal, not a service customers can buy today.", layer: "vision", state: "COMPANY_VISION", evidence: [sxMars] },
  { id: "sx-risk", title: "The product can move without company shares", description: "SPCX is a derivative. Its market, funding and venue rules can affect returns even when the SpaceX story does not change.", layer: "risk", state: "VERIFIED_LIVE", evidence: [sxProduct, sxListing] },
];

export const assets: AssetModel[] = [
  {
    id: "spacex",
    name: "SpaceX",
    symbol: "SPCX",
    kind: "Private space company",
    scene: "space",
    accent: "#66f4a2",
    oneLine: "Rockets, satellite internet and a long-term plan for life beyond Earth.",
    whyPeopleCare: "SpaceX lowers launch costs, runs Starlink and is building a much larger reusable rocket system.",
    truthSummary: "The company story is real, but the tradeable SPCX product is a price contract—not SpaceX stock.",
    claims: spaceClaims,
    products: [{
      id: "spcx-xperp",
      symbol: "SPCXUSD X-Perp",
      name: "SpaceX-linked X-Perpetual",
      productType: "Expiry perpetual derivative",
      simpleTruth: "Price exposure only. You do not own SpaceX.",
      venue: "OKX",
      issuer: "OKX venue contract",
      underlying: "SpaceX-linked reference price",
      networks: ["OKX trading venue"],
      contractAddresses: {},
      rights: { ownsUnderlying: false, shareholderRights: false, votingRights: false, dividendRights: "none", physicalRedemption: false, issuerRedemption: false, canUseLeverage: true },
      leverage: "Up to 10× where available",
      funding: "Every 8 hours",
      expiry: "13 June 2031",
      custody: "Collateral remains within the trading venue",
      keyRisk: "Leverage, funding, liquidation and venue risk",
      rightsEvidenceId: "spcx-listing",
      exitRoutes: [{
        id: "spcx-close", name: "Close on OKX", method: "close", venue: "OKX", description: "Place a market or limit order that closes the derivatives position.",
        variableFeeBps: 5, estimatedSpreadBps: 8, fixedFeeUsd: 0, minimumUsd: 1, settlement: "Trading balance after the close fills", marketHours: "Venue availability", liquidity: "venue order book", restrictions: ["Trading fees depend on account tier", "Funding already paid is not recovered", "Availability depends on jurisdiction"], executable: false, sourceEvidenceId: "spcx-terms",
      }],
    }],
    evidence: [sxFalcon, sxStarlink, sxStarship, sxMars, sxProduct, sxListing],
    researchVersion: "1.0.0",
    validUntil: "2026-09-15",
  },
  {
    id: "tesla",
    name: "Tesla",
    symbol: "TSLAx",
    kind: "Public company / tokenized tracker",
    scene: "mobility",
    accent: "#8aa8ff",
    oneLine: "Electric vehicles, energy storage and charging infrastructure.",
    whyPeopleCare: "Tesla joins a large vehicle business with batteries, charging and energy storage.",
    truthSummary: "TSLAx tracks Tesla's share price, but the token itself is not a Tesla share and does not give direct shareholder rights.",
    claims: [
      { id: "tsla-auto", title: "Cars are the main operating business", description: "Tesla designs, makes and sells electric vehicles and related services.", layer: "live", state: "VERIFIED_LIVE", evidence: [tslaBusiness] },
      { id: "tsla-energy", title: "Energy storage is live", description: "Tesla also sells energy generation and storage products.", layer: "live", state: "VERIFIED_LIVE", evidence: [tslaBusiness] },
      { id: "tsla-network", title: "More autonomy is still being built", description: "Software and autonomous transport ambitions depend on technical and regulatory progress.", layer: "building", state: "VERIFIED_BUILDING", evidence: [tslaInvestor] },
      { id: "tsla-vision", title: "A wider autonomous network is a vision", description: "A large driverless transport network is not the same as today's delivered vehicle business.", layer: "vision", state: "COMPANY_VISION", evidence: [tslaInvestor] },
      { id: "tslax-risk", title: "Token rights are not share rights", description: "TSLAx depends on the tracker certificate, issuer, custody and redemption terms—not only Tesla's share price.", layer: "risk", state: "VERIFIED_LIVE", evidence: [tslaxTerms, tslaxVenue] },
    ],
    products: [{
      id: "tslax",
      symbol: "TSLAx",
      name: "Tesla xStock",
      productType: "Tokenized tracker certificate",
      simpleTruth: "Tracks Tesla's price. It is not a Tesla share.",
      venue: "Supported xStocks venues",
      issuer: "Backed Assets (JE) Limited",
      underlying: "Tesla Inc. common stock price",
      networks: ["Ethereum", "Solana", "Supported EVM networks"],
      contractAddresses: {},
      rights: { ownsUnderlying: false, shareholderRights: false, votingRights: false, dividendRights: "economic adjustment", physicalRedemption: false, issuerRedemption: true, canUseLeverage: false },
      leverage: "None in the token itself",
      funding: "No periodic derivatives funding",
      expiry: "No fixed expiry stated",
      custody: "Backing assets are held through the issuer's custody structure",
      keyRisk: "Issuer, custodian, market-hours and redemption risk",
      rightsEvidenceId: "tslax-terms",
      exitRoutes: [
        { id: "tslax-sell", name: "Sell on a supported venue", method: "sell", venue: "Trading venue", description: "Sell TSLAx into the available order book.", variableFeeBps: 10, estimatedSpreadBps: 15, fixedFeeUsd: 0, minimumUsd: 1, settlement: "Venue balance", marketHours: "Depends on venue and underlying market rules", liquidity: "venue order book", restrictions: ["Fee and spread are demo assumptions", "Liquidity changes by venue", "Availability depends on jurisdiction"], executable: false, sourceEvidenceId: "tslax-venue" },
        { id: "tslax-redeem", name: "Redeem with the issuer", method: "redeem", venue: "Backed", description: "Eligible holders can request issuer redemption under the product terms.", variableFeeBps: 50, estimatedSpreadBps: 0, fixedFeeUsd: 0, minimumUsd: 100, settlement: "Subject to issuer processing", marketHours: "Business-day processing", liquidity: "issuer redemption", restrictions: ["Eligibility and KYC required", "Fee may be up to the stated maximum", "Processing is not instant"], executable: false, sourceEvidenceId: "tslax-terms" },
      ],
    }],
    evidence: [tslaBusiness, tslaInvestor, tslaxTerms, tslaxVenue],
    researchVersion: "1.0.0",
    validUntil: "2026-09-15",
  },
  {
    id: "gold",
    name: "Gold",
    symbol: "PAXG",
    kind: "Allocated commodity token",
    scene: "gold",
    accent: "#c99718",
    oneLine: "A token that represents allocated physical gold held by a regulated custodian.",
    whyPeopleCare: "Gold is used as a store of value. PAXG makes a claim on allocated gold transferable onchain.",
    truthSummary: "PAXG represents allocated gold, but selling a token and collecting a physical bar are different exit paths.",
    claims: [
      { id: "gold-backed", title: "Allocated gold backs the token", description: "Each PAXG represents one fine troy ounce of an allocated London Good Delivery gold bar.", layer: "live", state: "VERIFIED_LIVE", evidence: [paxgProduct] },
      { id: "gold-chain", title: "Ownership can move onchain", description: "The token can be transferred while Paxos keeps the matching physical gold in custody.", layer: "live", state: "VERIFIED_LIVE", evidence: [paxgProduct] },
      { id: "gold-build", title: "More distribution is the build layer", description: "New venue and network support can improve access, but does not change the core gold claim.", layer: "building", state: "VERIFIED_BUILDING", evidence: [paxgProduct] },
      { id: "gold-vision", title: "Always-on gold is the vision", description: "Tokenization aims to make gold easier to move globally, while real redemption still follows legal and operational rules.", layer: "vision", state: "COMPANY_VISION", evidence: [paxgTerms] },
      { id: "gold-risk", title: "A physical bar is not a small exit", description: "Physical bar redemption is for verified users and requires a large minimum. Small holders normally sell or redeem another way.", layer: "risk", state: "VERIFIED_LIVE", evidence: [paxgTerms, paxgFees] },
    ],
    products: [{
      id: "paxg",
      symbol: "PAXG",
      name: "PAX Gold",
      productType: "Allocated gold token",
      simpleTruth: "A legal claim on allocated gold, with redemption rules.",
      venue: "Onchain and supported venues",
      issuer: "Paxos Trust Company",
      underlying: "Allocated London Good Delivery gold",
      networks: ["Ethereum"],
      contractAddresses: { Ethereum: "0x45804880De22913dAFE09f4980848ECE6EcbAf78" },
      rights: { ownsUnderlying: true, shareholderRights: false, votingRights: false, dividendRights: "none", physicalRedemption: true, issuerRedemption: true, canUseLeverage: false },
      leverage: "None in the token itself",
      funding: "None",
      expiry: "None",
      custody: "Allocated gold held by Paxos",
      keyRisk: "Custody, issuer, eligibility and redemption minimums",
      rightsEvidenceId: "paxg-product",
      exitRoutes: [
        { id: "paxg-sell", name: "Sell PAXG", method: "sell", venue: "Supported venue", description: "Sell the token using a supported order book or onchain pool.", variableFeeBps: 10, estimatedSpreadBps: 20, fixedFeeUsd: 0, minimumUsd: 1, settlement: "Venue or wallet balance", marketHours: "Depends on route", liquidity: "venue order book", restrictions: ["Fee and spread are demo assumptions", "Network fees are not included"], executable: false, sourceEvidenceId: "paxg-product" },
        { id: "paxg-physical", name: "Redeem a physical gold bar", method: "redeem", venue: "Paxos", description: "Verified customers may request delivery of full gold bars under Paxos terms.", variableFeeBps: 0, estimatedSpreadBps: 0, fixedFeeUsd: 0, minimumUsd: 860000, settlement: "Business-day processing plus delivery", marketHours: "Business-day processing", liquidity: "issuer redemption", restrictions: ["About 430 PAXG minimum for a full bar", "Verified Paxos account required", "Delivery and handling costs are not included"], executable: false, sourceEvidenceId: "paxg-terms" },
      ],
    }],
    evidence: [paxgProduct, paxgTerms, paxgFees],
    researchVersion: "1.0.0",
    validUntil: "2026-09-15",
  },
];

export const findAsset = (id: string) => assets.find((asset) => asset.id === id);

export const findProduct = (productId: string) => {
  for (const asset of assets) {
    const product = asset.products.find((candidate) => candidate.id === productId);
    if (product) return { asset, product };
  }
  return undefined;
};

export const allEvidence = assets.flatMap((asset) => asset.evidence);
