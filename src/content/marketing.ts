export type MarketingCopyMode = "refined" | "classic";

export type MarketingCopy = {
  heroKicker: string;
  heroLineOne: string;
  heroLineTwo: string;
  heroBody: string;
  heroApi: string;
  trueGuardTitle: string;
  trueGuardBody: string;
  exitTogetherTitle: string;
  exitTogetherBody: string;
  promiseKicker: string;
  promiseTitle: string;
  promiseBody: string;
  developerKicker: string;
  developerTitle: string;
  developerBody: string;
  exitTitle: string;
  exitBody: string;
  finalTitle: string;
  finalBody: string;
};

export const marketingCopy: Record<MarketingCopyMode, MarketingCopy> = {
  refined: {
    heroKicker: "The RWA understanding layer for people, products and AI agents.",
    heroLineOne: "Know what you own.",
    heroLineTwo: "Exit with others.",
    heroBody: "TrueGuard shows what the real asset does, what its token actually gives you, and helps small holders pool matching sell orders for a better large-order quote.",
    heroApi: "Products and AI agents get the same verified answer through one API.",
    trueGuardTitle: "See the real business behind the hype.",
    trueGuardBody: "Understand the company, commodity or cash flow and the exact token rights attached to it.",
    exitTogetherTitle: "Pool compatible small sell orders.",
    exitTogetherBody: "Matching holders combine their orders and seek one larger block or RFQ quote.",
    promiseKicker: "One question in. The full truth out.",
    promiseTitle: "An RWA should not take ten tabs to understand.",
    promiseBody: "TrueGuard joins the real-world story and the onchain product in one answer. Every important claim remains linked to proof.",
    developerKicker: "RWA infrastructure for products and agents",
    developerTitle: "Add RWA truth and coordinated exits to your product.",
    developerBody: "One integration explains the asset, checks the token, catches intent mismatches and exposes compatible ExitTogether batches.",
    exitTitle: "Small sellers become one large order.",
    exitBody: "ExitTogether finds holders selling the exact same token. Everyone keeps a minimum price. The batch only sells when one quote works for every holder.",
    finalTitle: "Know the asset. Check the token. Exit together.",
    finalBody: "Clear RWA answers for people, products and AI agents—plus a better way for small holders to sell together.",
  },
  classic: {
    heroKicker: "The RWA understanding layer for people, products and AI agents.",
    heroLineOne: "Understand the RWA.",
    heroLineTwo: "Exit together.",
    heroBody: "TrueGuard shows what the real asset does, what its token actually gives you, and helps small holders pool matching sell orders for a better large-order quote.",
    heroApi: "Products and AI agents get the same answer through one API.",
    trueGuardTitle: "See the real business behind the hype.",
    trueGuardBody: "Understand the company, commodity or cash flow and the exact token rights attached to it.",
    exitTogetherTitle: "Pool compatible small sell orders.",
    exitTogetherBody: "Matching holders combine their orders and seek one larger block or RFQ quote.",
    promiseKicker: "One question in. The full truth out.",
    promiseTitle: "An RWA should not take ten tabs to understand.",
    promiseBody: "TrueGuard joins the real-world story and the onchain product in one answer. Every important claim remains linked to proof.",
    developerKicker: "Infrastructure, not another trading app",
    developerTitle: "Give your product the full RWA answer.",
    developerBody: "One integration explains the real asset, verifies the token, catches intent mismatches and quotes an ExitTogether batch.",
    exitTitle: "Small holders should not exit alone.",
    exitBody: "TrueGuard groups people selling the same RWA product. Their small orders become one larger order that can ask for a block quote.",
    finalTitle: "Understand the RWA. Verify the token. Exit together.",
    finalBody: "One evidence layer for people, products and AI agents.",
  },
};

export function selectedMarketingCopy(): MarketingCopyMode {
  return new URLSearchParams(window.location.search).get("copy") === "classic" ? "classic" : "refined";
}
