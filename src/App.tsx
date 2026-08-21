import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import EvidenceDrawer from "./components/EvidenceDrawer";
import RealityScene from "./components/RealityScene";
import { assets, allEvidence } from "./data/assets";
import { compareProducts } from "./domain/compare";
import { quoteExitTogether } from "./domain/exitTogether";
import { checkIntent } from "./domain/intent";
import { marketingCopy, selectedMarketingCopy } from "./content/marketing";
import type { Evidence, RealityLayer } from "./types";
import { cancelDemoOrder, claimDemoOrder, connectXLayer, demoDeployment, isDemoDeployed, joinDemoBatch, readDemoBatch, type WalletStage } from "./contracts/exitTogether";
import { formatEther, type Address, type EIP1193Provider, type Hex } from "viem";

type Theme = "light" | "dark";
type InstallTab = "sdk" | "api" | "agent";
type AudienceId = "holders" | "wallets" | "agents" | "issuers";
type BatchTxPhase = "idle" | "not-deployed" | "faucet" | "approve" | "join" | "joined" | "cancel" | "cancelled" | "claim" | "claimed" | "error";
type InjectedProvider = EIP1193Provider & { isOkxWallet?: boolean; providers?: InjectedProvider[] };

const layers: Array<{ id: RealityLayer; label: string; helper: string }> = [
  { id: "live", label: "Live", helper: "Working today" },
  { id: "building", label: "Building", helper: "In development" },
  { id: "vision", label: "Vision", helper: "Long-term claim" },
  { id: "risk", label: "Risk", helper: "What can break" },
];

const installCommands: Record<InstallTab, { label: string; command: string; note: string }> = {
  sdk: { label: "TypeScript SDK", command: "pnpm add @trueguard/sdk", note: "Add asset truth, intent checks and ExitTogether quotes to any TypeScript product." },
  api: { label: "REST API", command: "pnpm api", note: "Start the local API from /Users/basit_web3 or connect to the hosted endpoint when deployed." },
  agent: { label: "Agent tools", command: "cp trueguard/agent/trueguard-tools.json ./trueguard-tools.json", note: "Give an AI agent tools to explain an asset, check intent and quote ExitTogether." },
};

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

const audiences: Array<{ id: AudienceId; label: string; title: string; text: string }> = [
  { id: "holders", label: "RWA holders", title: "Understand it. Then exit together.", text: "See what the token really gives you. When a small sell would lose too much, join compatible holders in one larger exit." },
  { id: "wallets", label: "Wallets & exchanges", title: "Explain every RWA inside your product.", text: "Show the real asset, token rights, risks and exit options without building a research desk from scratch." },
  { id: "agents", label: "AI & trading agents", title: "Give agents facts they can check.", text: "Return cited asset data, exact product rights, intent checks and ExitTogether quotes in one structured response." },
  { id: "issuers", label: "RWA issuers", title: "Make the product easy to trust.", text: "Publish a clear, versioned record of what the token represents, which rights it gives and how holders can get out." },
];

const ecosystemItems = [
  { name: "X Layer", mark: "XL", logo: "/logos/x-layer.svg", relation: "Settlement network" },
  { name: "OKX", mark: "OKX", logo: "/logos/okx.svg", relation: "SPCX product source" },
  { name: "OKX Wallet", mark: "OW", logo: "/logos/okx-wallet.svg", relation: "Wallet target" },
  { name: "OKX OnchainOS", mark: "OS", logo: "/logos/okx-onchainos.svg", relation: "Quote adapter ready" },
  { name: "SpaceX", mark: "SX", logo: "/logos/spacex.svg", relation: "Asset explained" },
  { name: "Tesla", mark: "T", logo: "/logos/tesla.svg", relation: "Asset explained" },
  { name: "Backed xStocks", mark: "xS", logo: "/logos/backed-xstocks.svg", relation: "TSLAx product source" },
  { name: "Paxos", mark: "PX", logo: "/logos/paxos.png", relation: "PAXG issuer source" },
  { name: "PAX Gold", mark: "PG", logo: "/logos/pax-gold.png", relation: "Asset explained" },
  { name: "Chainlink", mark: "CL", logo: "/logos/chainlink.svg", relation: "Data integration target" },
] as const;

function assetIdFromQuestion(question: string) {
  const text = question.toLowerCase();
  if (/\b(gold|paxg|bullion|gold bar|precious metal)\b/.test(text)) return "gold";
  if (/\b(tesla|tsla|tslax|electric car|ev stock)\b/.test(text)) return "tesla";
  if (/\b(spacex|spcx|starlink|rocket company)\b/.test(text)) return "spacex";
  return undefined;
}

function BrandMark({ className = "brand-mark" }: { className?: string }) {
  return <span className={className}><img src="/brand/trueguard-mark.png" alt="" /></span>;
}

function AudienceDiagram({ id }: { id: AudienceId }) {
  if (id === "holders") return <div className="audience-diagram holder-diagram" aria-label="Small holder orders joining one larger exit"><div className="small-orders"><span>$180</span><span>$420</span><span>$760</span><span>$1.2k</span></div><i /><div className="tg-node"><b>T</b><small>EXIT<br />TOGETHER</small></div><i /><div className="block-order"><span>ONE BATCH</span><strong>$50K</strong><small>block quote</small></div></div>;
  if (id === "wallets") return <div className="audience-diagram wallet-diagram" aria-label="A wallet requesting one TrueGuard answer"><div className="product-chip"><span>SPCX</span><small>token</small></div><i /><div className="tg-node"><b>T</b><small>TRUEGUARD<br />API</small></div><i /><div className="answer-stack"><span>Real asset</span><span>Exact rights</span><span>Exit options</span></div></div>;
  if (id === "agents") return <div className="audience-diagram agent-diagram" aria-label="An AI agent checking a product before acting"><div className="prompt-chip">“Own SpaceX”</div><i /><div className="tg-node"><b>T</b><small>VERIFY</small></div><i /><div className="decision-chip"><span>!</span><div><b>MISMATCH</b><small>Price exposure only</small></div></div></div>;
  return <div className="audience-diagram issuer-diagram" aria-label="An issuer publishing a verified RWA record"><div className="document-stack"><span>Terms</span><span>Rights</span><span>Exit rules</span></div><i /><div className="tg-node"><b>T</b><small>RESEARCH<br />PACK</small></div><i /><div className="network-node"><span>×</span><small>X LAYER</small></div></div>;
}

function App() {
  const [copyMode] = useState(selectedMarketingCopy);
  const [assetId, setAssetId] = useState("spacex");
  const [activeLayer, setActiveLayer] = useState<RealityLayer>("live");
  const [intent, setIntent] = useState("I want to own SpaceX stock");
  const [amount, setAmount] = useState(12750);
  const [query, setQuery] = useState("");
  const [selectedEvidence, setSelectedEvidence] = useState<Evidence>();
  const [showMachineView, setShowMachineView] = useState(false);
  const [walletLabel, setWalletLabel] = useState("Connect");
  const [walletError, setWalletError] = useState("");
  const [walletAddress, setWalletAddress] = useState<Address>();
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("trueguard-theme") as Theme) || "light");
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [installTab, setInstallTab] = useState<InstallTab>("sdk");
  const [copied, setCopied] = useState(false);
  const [activeAudience, setActiveAudience] = useState<AudienceId>("holders");
  const [batchPreviewed, setBatchPreviewed] = useState(false);
  const [batchTxPhase, setBatchTxPhase] = useState<BatchTxPhase>("idle");
  const [batchTxMessage, setBatchTxMessage] = useState("No funds move until you approve each wallet step.");
  const [batchTxHash, setBatchTxHash] = useState<Hex>();
  const [demoOrderId, setDemoOrderId] = useState<bigint | undefined>(() => {
    const saved = localStorage.getItem("trueguard-demo-order");
    return saved ? BigInt(saved) : undefined;
  });
  const [chainBatch, setChainBatch] = useState<{ totalCommitted: bigint; target: bigint; participants: number; status: string }>();
  const searchInput = useRef<HTMLInputElement>(null);

  const asset = assets.find((item) => item.id === assetId) ?? assets[0];
  const product = asset.products[0];
  const activeNodes = asset.claims.filter((node) => node.layer === activeLayer);
  const intentResult = useMemo(() => checkIntent(intent, asset, product), [intent, asset, product]);
  const exitTogetherQuote = useMemo(() => quoteExitTogether(product.id, amount), [product.id, amount]);
  const comparisons = compareProducts(assets.map((item) => item.products[0]));
  const filteredAssets = assets.filter((item) => `${item.name} ${item.symbol} ${item.kind}`.toLowerCase().includes(query.toLowerCase()));
  const copy = marketingCopy[copyMode];
  const waitingHolderCount = chainBatch?.participants ?? Math.max(0, exitTogetherQuote.participantCount - (amount > 0 ? 1 : 0));
  const waitingValueUsd = chainBatch ? Number(formatEther(chainBatch.totalCommitted)) : Math.max(0, exitTogetherQuote.batchValueUsd - exitTogetherQuote.orderValueUsd);
  const batchTargetUsd = chainBatch ? Number(formatEther(chainBatch.target)) : exitTogetherQuote.targetValueUsd;
  const amountStillNeededUsd = Math.max(0, batchTargetUsd - waitingValueUsd);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("trueguard-theme", theme);
  }, [theme]);

  useEffect(() => {
    const detectedAssetId = assetIdFromQuestion(intent);
    if (detectedAssetId && detectedAssetId !== assetId) {
      setAssetId(detectedAssetId);
      setActiveLayer("live");
      setBatchPreviewed(false);
    }
  }, [intent, assetId]);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const updateHeader = () => {
      ticking = false;
      if (mobileMenuOpen) return;
      const y = window.scrollY;
      setHeaderScrolled(y > 8);
      if (y <= 8) setHeaderHidden(false);
      else if (y > lastY + 4) setHeaderHidden(true);
      else if (y < lastY - 4) setHeaderHidden(false);
      lastY = y;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(updateHeader);
    };
    const onMouseMove = (event: MouseEvent) => {
      if (event.clientY > 90) return;
      if (window.scrollY > 8) setHeaderScrolled(true);
      setHeaderHidden(false);
    };
    updateHeader();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (!isDemoDeployed) return;
    readDemoBatch().then(setChainBatch).catch(() => undefined);
  }, []);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
      if (event.key === "Escape" && document.activeElement === searchInput.current) {
        setQuery("");
        searchInput.current?.blur();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => item.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px" });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [assetId, activeLayer]);

  const chooseAsset = (nextId: string) => {
    const next = assets.find((item) => item.id === nextId);
    if (!next) return;
    setAssetId(nextId);
    setActiveLayer("live");
    setIntent(next.id === "spacex" ? "I want to own SpaceX stock" : next.id === "tesla" ? "I want Tesla price exposure" : "I want gold I can redeem physically");
    setQuery("");
    setBatchPreviewed(false);
  };

  const openEvidence = (id: string) => setSelectedEvidence(allEvidence.find((item) => item.id === id));
  const closeEvidence = useCallback(() => setSelectedEvidence(undefined), []);

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommands[installTab].command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const walletProvider = () => {
    const injected = window as unknown as { okxwallet?: InjectedProvider; ethereum?: InjectedProvider };
    if (injected.okxwallet) return injected.okxwallet;
    return injected.ethereum?.providers?.find((provider) => provider.isOkxWallet) ?? injected.ethereum;
  };

  const walletFailure = (error: unknown) => {
    const candidate = error as { code?: number; message?: string; data?: { originalError?: { code?: number; message?: string } } };
    const code = candidate.code ?? candidate.data?.originalError?.code;
    const detail = candidate.message ?? candidate.data?.originalError?.message ?? "The wallet could not connect.";
    setWalletError(detail);
    if (code === 4001 || /rejected|denied/i.test(detail)) return "Request declined";
    if (code === -32002 || /already pending/i.test(detail)) return "Open wallet";
    if (/chain|network/i.test(detail)) return "Switch network";
    return "Connection failed";
  };

  const connectWallet = async () => {
    const ethereum = walletProvider();
    if (!ethereum) { setWalletLabel("Install wallet"); return; }
    setWalletLabel("Connecting…");
    setWalletError("");
    try {
      const address = await connectXLayer(ethereum);
      setWalletAddress(address);
      setWalletLabel(`${address.slice(0, 5)}…${address.slice(-3)}`);
      return address;
    } catch (error) {
      setWalletLabel(walletFailure(error));
    }
  };

  const handleWalletStage = (stage: WalletStage, hash?: Hex) => {
    setBatchTxPhase(stage);
    if (hash) setBatchTxHash(hash);
    const messages: Record<WalletStage, string> = {
      faucet: hash ? "Demo tokens requested. Waiting for X Layer confirmation…" : "Confirm the one-time test token request in your wallet.",
      approve: hash ? "Token approval submitted. Waiting for X Layer confirmation…" : "Approve only this order amount for the coordinator.",
      join: hash ? "Join submitted. Waiting for the batch event…" : "Confirm your minimum proceeds and join the exact batch.",
      cancel: "Returning your escrowed demo tokens.",
      claim: "Claiming your pro-rata settlement proceeds.",
    };
    setBatchTxMessage(messages[stage]);
  };

  const joinOnchainBatch = async () => {
    if (!isDemoDeployed) {
      setBatchTxPhase("not-deployed");
      setBatchTxMessage("The contracts are compiled and deployment scripts are ready. A funded X Layer testnet deployer key is still required.");
      return;
    }
    const provider = walletProvider();
    if (!provider) { setWalletLabel("Install wallet"); setBatchTxPhase("error"); setBatchTxMessage("Install an EVM wallet to use the X Layer testnet demo."); return; }
    try {
      const account = walletAddress ?? await connectXLayer(provider);
      setWalletAddress(account);
      setWalletLabel(`${account.slice(0, 5)}…${account.slice(-3)}`);
      const result = await joinDemoBatch(provider, account, amount, handleWalletStage);
      setDemoOrderId(result.orderId);
      localStorage.setItem("trueguard-demo-order", result.orderId.toString());
      setBatchTxHash(result.hash);
      setBatchTxPhase("joined");
      setBatchTxMessage(`Order #${result.orderId} is escrowed on X Layer testnet. You can cancel while the batch is open.`);
      setChainBatch(await readDemoBatch());
    } catch (error) {
      setBatchTxPhase("error");
      setBatchTxMessage(error instanceof Error ? error.message.replaceAll("_", " ") : "The wallet transaction did not complete.");
    }
  };

  const cancelOnchainOrder = async () => {
    const provider = walletProvider();
    if (!provider || !walletAddress || !demoOrderId) return;
    try {
      handleWalletStage("cancel");
      const hash = await cancelDemoOrder(provider, walletAddress, demoOrderId);
      setBatchTxHash(hash);
      setBatchTxPhase("cancelled");
      setBatchTxMessage("Order cancelled. The escrowed tgSPCX has been returned to your wallet.");
      localStorage.removeItem("trueguard-demo-order");
      setDemoOrderId(undefined);
      setChainBatch(await readDemoBatch());
    } catch (error) { setBatchTxPhase("error"); setBatchTxMessage(error instanceof Error ? error.message : "Cancellation failed."); }
  };

  const claimOnchainProceeds = async () => {
    const provider = walletProvider();
    if (!provider || !walletAddress || !demoOrderId) return;
    try {
      handleWalletStage("claim");
      const hash = await claimDemoOrder(provider, walletAddress, demoOrderId);
      setBatchTxHash(hash);
      setBatchTxPhase("claimed");
      setBatchTxMessage("Your pro-rata tgUSD proceeds are now in your wallet.");
      localStorage.removeItem("trueguard-demo-order");
      setDemoOrderId(undefined);
    } catch (error) { setBatchTxPhase("error"); setBatchTxMessage(error instanceof Error ? error.message : "Claim failed."); }
  };

  const refreshOnchainBatch = async () => {
    if (!isDemoDeployed) return;
    try { setChainBatch(await readDemoBatch()); } catch { setBatchTxMessage("Could not refresh X Layer state."); }
  };

  const machineResult = JSON.stringify({ schema: "trueguard.intent-check.v1", ...intentResult, product: { id: product.id, type: product.productType, rights: product.rights } }, null, 2);

  return (
    <main>
      <header className={`site-header ${headerScrolled ? "is-scrolled" : ""} ${headerHidden ? "is-hidden" : ""} ${mobileMenuOpen ? "is-menu-open" : ""}`}>
        <button className="mobile-menu-trigger" type="button" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)}><span /><span /><span /></button>
        <a className="brand" href="/" aria-label="TrueGuard home"><BrandMark /><span>TrueGuard</span></a>
        <nav aria-label="Main navigation"><a href="#understand">Understand</a><a href="#check">Verify</a><a href="#exit">Exit</a><a href="#developers">Developers</a></nav>
        <div className="header-actions">
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}><span className="sun">☼</span><span className="moon">◐</span></button>
          <button className="network-pill" type="button" onClick={connectWallet} title={walletError || `Connect to X Layer Testnet`} aria-label={walletError || `${walletLabel}, X Layer Testnet`}><span /> <b>{walletLabel}</b><small>X Layer</small></button>
        </div>
        <button className="mobile-wallet-shortcut" type="button" onClick={connectWallet} aria-label="Connect wallet"><span /><b>{walletAddress ? "✓" : "↗"}</b></button>
      </header>

      <div className={`mobile-navigation-root ${mobileMenuOpen ? "is-open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <button className="mobile-navigation-scrim" type="button" tabIndex={mobileMenuOpen ? 0 : -1} aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />
        <div className="mobile-navigation" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="TrueGuard navigation">
          <nav className="mobile-navigation-links"><a tabIndex={mobileMenuOpen ? 0 : -1} href="#understand" onClick={() => setMobileMenuOpen(false)}>Understand</a><a tabIndex={mobileMenuOpen ? 0 : -1} href="#check" onClick={() => setMobileMenuOpen(false)}>Verify</a><a tabIndex={mobileMenuOpen ? 0 : -1} href="#exit" onClick={() => setMobileMenuOpen(false)}>ExitTogether</a><a tabIndex={mobileMenuOpen ? 0 : -1} href="#developers" onClick={() => setMobileMenuOpen(false)}>Developers</a></nav>
          <div className="mobile-navigation-actions"><button tabIndex={mobileMenuOpen ? 0 : -1} type="button" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark mode" : "Light mode"}<span>{theme === "light" ? "◐" : "☼"}</span></button><button tabIndex={mobileMenuOpen ? 0 : -1} type="button" onClick={() => { void connectWallet(); setMobileMenuOpen(false); }}>Connect wallet <span>↗</span></button></div>
        </div>
      </div>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow hero-kicker">{copy.heroKicker}</p>
          <h1>{copy.heroLineOne}<br /><em>{copy.heroLineTwo}</em></h1>
          <p className="hero-lede"><span>{copy.heroBody}</span><strong>{copy.heroApi}</strong></p>
          <div className="hero-actions"><a className="button primary" href="#understand">Explore an RWA <span>↓</span></a><a className="button secondary" href="#developers">Install TrueGuard <span>↗</span></a></div>
          <div className="asset-search">
            <label className="search-shell"><span>⌕</span><input ref={searchInput} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search SpaceX, Tesla or gold" aria-label="Search an asset" aria-expanded={Boolean(query)} aria-controls="asset-search-results" /><kbd>⌘ K</kbd></label>
            {query && <div className="search-results" id="asset-search-results">{filteredAssets.length ? filteredAssets.map((item) => <button key={item.id} type="button" onClick={() => chooseAsset(item.id)}><span>{item.symbol}</span><strong>{item.name}</strong><small>{item.kind}</small></button>) : <p>No supported asset found.</p>}</div>}
          </div>
        </div>

        <div className="hero-visual" aria-label={`Interactive ${asset.name} model`}>
          <RealityScene activeLayer={activeLayer} scene={asset.scene} accent={asset.accent} />
          <div className="scene-orbit orbit-one" /><div className="scene-orbit orbit-two" />
          <div className="visual-title"><span>NOW EXPLAINING</span><strong>{asset.name}</strong><small>{asset.oneLine}</small></div>
          <div className="floating-proof"><div><span className={`status-dot ${activeLayer}`} /><b>{layers.find((layer) => layer.id === activeLayer)?.label}</b></div><strong>{activeNodes.length} verified claim{activeNodes.length === 1 ? "" : "s"}</strong><small>Drag the model to explore</small></div>
          <div className="scene-switcher">{assets.map((item) => <button aria-label={`Show ${item.name}`} className={item.id === asset.id ? "active" : ""} type="button" key={item.id} onClick={() => chooseAsset(item.id)}><span style={{ background: item.accent }} />{item.symbol}</button>)}</div>
        </div>
      </section>

      <section className="dual-offer-strip" data-reveal aria-label="TrueGuard's two core products">
        <article><span>01 / TRUEGUARD</span><div><h2>{copy.trueGuardTitle}</h2><p>{copy.trueGuardBody}</p></div><a href="#understand">Understand an RWA <b>↓</b></a></article>
        <article><span>02 / EXITTOGETHER</span><div><h2>{copy.exitTogetherTitle}</h2><p>{copy.exitTogetherBody}</p></div><a href="#exit">See the open batch <b>↓</b></a></article>
      </section>

      <section className="promise-section" data-reveal>
        <header><p className="eyebrow">{copy.promiseKicker}</p><h2>{copy.promiseTitle}</h2><p className="promise-emphasis">{copy.promiseBody}</p></header>
        <div className="truth-flow">
          <div className="flow-input"><span>USER OR AGENT ASKS</span><strong>“Can I own SpaceX?”</strong><small>Plain language in</small></div>
          <div className="flow-line"><i /><i /><i /></div>
          <div className="flow-core"><BrandMark /><strong>TrueGuard</strong><small>research pack v1</small></div>
          <div className="flow-answers">
            <article><span>01</span><strong>Real asset</strong><small>What exists today</small></article>
            <article><span>02</span><strong>Exact rights</strong><small>What the token gives you</small></article>
            <article><span>03</span><strong>Intent check</strong><small>Does it match the request?</small></article>
            <article><span>04</span><strong>ExitTogether</strong><small>Can small holders leave as one?</small></article>
          </div>
        </div>
      </section>

      <section className="audience-section" id="who">
        <header data-reveal>
          <p className="eyebrow">Who uses TrueGuard</p>
          <h2>One RWA truth.<br />Four ways to use it.</h2>
          <p>People get a clear answer. Products and agents get the same answer as structured data. Small holders get a new way to leave together.</p>
        </header>
        <div className="audience-accordion" data-reveal>
          {audiences.map((audience, index) => {
            const isOpen = audience.id === activeAudience;
            return <article className={`audience-panel ${isOpen ? "is-open" : ""}`} key={audience.id}>
              <button className="audience-tab" type="button" aria-expanded={isOpen} aria-controls={`audience-${audience.id}`} onClick={() => setActiveAudience(audience.id)} onPointerEnter={() => { if (window.matchMedia("(min-width: 1101px) and (hover: hover)").matches) setActiveAudience(audience.id); }}>
                <span className="audience-plus">{isOpen ? "−" : "+"}</span><span>{String(index + 1).padStart(2, "0")} / {audience.label}</span>
              </button>
              <div className="audience-content" id={`audience-${audience.id}`} aria-hidden={!isOpen}>
                <div className="audience-copy"><p className="eyebrow"><i />{String(index + 1).padStart(2, "0")} / {audience.label}</p><h3>{audience.title}</h3><p>{audience.text}</p>{audience.id === "holders" && <a href="#exit">See ExitTogether <span>↓</span></a>}</div>
                <AudienceDiagram id={audience.id} />
              </div>
            </article>;
          })}
        </div>
      </section>

      <section className="ecosystem-strip" aria-label="Target ecosystem integrations">
        <div className="ecosystem-shell">
          <div className="ecosystem-label"><span>Built for the RWA stack</span><small>Sources and integration targets · not partnership claims</small></div>
          <div className="ecosystem-viewport">
            <div className="ecosystem-track">
              {[...ecosystemItems, ...ecosystemItems].map((item, index) => <span className="ecosystem-item" key={`${item.name}-${index}`} aria-hidden={index >= ecosystemItems.length}><i className="ecosystem-mark"><b>{item.mark}</b><img src={item.logo} alt="" onError={(event) => { event.currentTarget.hidden = true; }} /></i><span><strong>{item.name}</strong><small>{item.relation}</small></span></span>)}
            </div>
          </div>
        </div>
      </section>

      <div className="story-stack" id="understand">
        <section className="reality-section stack-panel" style={{ "--asset-accent": asset.accent } as CSSProperties}>
          <div className="section-heading" data-reveal><div><p className="eyebrow asset-eyebrow"><i />Understand {asset.name}</p><h2>Understand the business.<br />And Separate fact from hype.</h2></div><p>{asset.whyPeopleCare} TrueGuard shows what is live, what is being built, what is only a vision and what can break.</p></div>
          <div className="layer-tabs" role="tablist" aria-label="Reality layers">
            {layers.map((layer) => <button className={activeLayer === layer.id ? `active ${layer.id}` : ""} key={layer.id} onClick={() => setActiveLayer(layer.id)} role="tab" aria-selected={activeLayer === layer.id} type="button"><strong>{layer.label}</strong><span>{layer.helper}</span></button>)}
          </div>
          <div className="claim-grid">
            {activeNodes.map((node, index) => <article className={`claim-card ${node.layer}`} key={node.id} style={{ "--delay": `${index * 60}ms` } as React.CSSProperties} data-reveal><div className="claim-top"><span className="claim-state">{node.state.replaceAll("_", " ")}</span><span>{node.evidence.length} source{node.evidence.length === 1 ? "" : "s"}</span></div><h3>{node.title}</h3><p>{node.description}</p><button type="button" onClick={() => setSelectedEvidence(node.evidence[0])}>{node.evidence[0].publisher} · {node.evidence[0].retrievedAt}<span>View proof ↗</span></button></article>)}
          </div>
        </section>

        <section className="dark-story stack-panel">
          <header data-reveal><p className="eyebrow">Why TrueGuard exists</p><h2>The company story and the product truth are not the same thing.</h2><p>Most RWA interfaces show the ticker and price. TrueGuard explains the relationship underneath.</p></header>
          <div className="reason-grid" data-reveal>
            <article><span>01 / STORY</span><h3>What is the real asset?</h3><p>Understand the company, commodity or cash flow behind the name.</p></article>
            <article><span>02 / REALITY</span><h3>What is real today?</h3><p>Keep operating facts separate from projects, estimates and ambition.</p></article>
            <article><span>03 / RIGHTS</span><h3>What do I actually own?</h3><p>See whether the product is equity, a tracker, a claim or a derivative.</p></article>
            <article><span>04 / EXIT TOGETHER</span><h3>Can small holders leave together?</h3><p>Pool compatible sell orders to seek one better large-order quote.</p></article>
          </div>
        </section>
      </div>

      <section className="truth-section" id="check">
        <div className="truth-copy" data-reveal>
          <p className="eyebrow">TrueGuard Verify</p><h2>Ask what you wish you know. We check what the product gives you in seconds.</h2><p>This is not an AI opinion. The result comes from fixed product-rights rules linked to current evidence.</p>
          <label className="intent-box"><span>WHAT DO YOU WANT?</span><input value={intent} onChange={(event) => setIntent(event.target.value)} aria-label="Describe what you want to buy" /></label>
          <p className="question-context"><span />Checking {asset.name} · {product.symbol}</p>
          <div className={`match-result ${intentResult.status.toLowerCase()}`}><span className="match-icon">{intentResult.status === "MATCH" ? "✓" : intentResult.status === "MISMATCH" ? "i" : "~"}</span><div><em>{intentResult.status === "MISMATCH" ? "Important difference" : intentResult.status.replace("_", " ")}</em><strong>{intentResult.headline}</strong><p>{intentResult.explanation}</p></div></div>
          <div className="check-details">{intentResult.failed.map((item) => <p className="failed" key={item}><span>×</span>{item}</p>)}{intentResult.passed.map((item) => <p className="passed" key={item}><span>✓</span>{item}</p>)}{intentResult.warnings.map((item) => <p className="warning" key={item}><span>!</span>{item}</p>)}</div>
          <button className="machine-toggle" type="button" onClick={() => setShowMachineView((value) => !value)}>{showMachineView ? "Hide agent response" : "See what an AI agent receives"}<span>→</span></button>
          {showMachineView && <pre className="machine-output">{machineResult}</pre>}
        </div>
        <article className="product-card" data-reveal>
          <div className="product-header"><div><span className="product-symbol">EXACT PRODUCT</span><h3>{product.symbol}</h3><p>{product.name}</p></div><span className="risk-label">{product.productType}</span></div>
          <div className="plain-truth"><span>IN PLAIN ENGLISH</span><strong>{product.simpleTruth}</strong></div>
          <dl><div><dt>What it follows</dt><dd>{product.underlying}</dd></div><div><dt>Own the underlying?</dt><dd>{product.rights.ownsUnderlying ? "Yes" : "No"}</dd></div><div><dt>Shareholder rights?</dt><dd>{product.rights.shareholderRights ? "Yes" : "No"}</dd></div><div><dt>Redemption?</dt><dd>{product.rights.issuerRedemption ? "Yes, with conditions" : "No issuer redemption"}</dd></div><div><dt>Leverage</dt><dd>{product.leverage}</dd></div><div><dt>Main risk</dt><dd>{product.keyRisk}</dd></div></dl>
          <button className="text-button" type="button" onClick={() => openEvidence(product.rightsEvidenceId)}>Read the official product source ↗</button>
        </article>
      </section>

      <section className="developer-section" id="developers">
        <header data-reveal><p className="eyebrow">{copy.developerKicker}</p><h2>{copy.developerTitle}</h2><p>{copy.developerBody}</p></header>
        <div className="install-shell" data-reveal>
          <div className="install-copy">
            <span className="install-label">INSTALL TRUEGUARD</span><h3>Start with one command.</h3><p>{installCommands[installTab].note}</p>
            <div className="install-tabs">{(Object.keys(installCommands) as InstallTab[]).map((tab) => <button className={installTab === tab ? "active" : ""} type="button" key={tab} onClick={() => { setInstallTab(tab); setCopied(false); }}>{installCommands[tab].label}</button>)}</div>
            <div className="command-box"><code><span>$</span> {installCommands[installTab].command}</code><button type="button" onClick={copyInstall} aria-live="polite">{copied ? "Copied ✓" : "Copy"}</button></div>
            <small className="package-status"><i /> SDK, REST API and six agent tools are build-ready.</small>
          </div>
          <div className="agent-demo-frame"><iframe src="./trueguard-agent-flow.html" title="Interactive TrueGuard agent pre-trade check" loading="lazy" /></div>
        </div>
        <div className="integration-row" aria-label="TrueGuard capabilities"><span>Explain the asset</span><span>Verify token rights</span><span>Check user intent</span><span>Quote ExitTogether</span><span>Verify research packs</span></div>
      </section>

      <section className="exit-section" id="exit">
        <div className="exit-copy" data-reveal>
          <p className="eyebrow">ExitTogether</p><h2>{copy.exitTitle}</h2>
          <p>{copy.exitBody}</p>
          <div className="exit-demand-summary"><span>OPEN {exitTogetherQuote.symbol} BATCH</span><strong>{waitingHolderCount} holders · {usd.format(waitingValueUsd)} ready</strong><small>{amountStillNeededUsd > 0 ? `${usd.format(amountStillNeededUsd)} more unlocks the target quote size.` : "The batch has reached its target quote size."}</small></div>
          <label className="amount-box"><span>YOUR SELL ORDER</span><div><b>$</b><input type="number" min="0" value={amount} onChange={(event) => { setAmount(Number(event.target.value)); setBatchPreviewed(false); }} /><small>USD</small></div></label>
          <p className="estimate-note">The savings comparison is an estimate. The wallet flow below is a real testnet contract flow. A production batch needs a firm quote for the exact live token pair.</p>
          <div className="exit-steps"><p><span>1</span>Match the exact product</p><p><span>2</span>Build one sell batch</p><p><span>3</span>Take it only if the quote is better</p></div>
        </div>
        <div className="exit-experience">
          <article className="batch-card" data-reveal>
            <div className="batch-top"><div><span>{isDemoDeployed ? "LIVE X LAYER TESTNET POOL" : "X LAYER TESTNET DEMO"}</span><strong>{exitTogetherQuote.symbol} small-holder exit</strong></div><em className={(chainBatch?.status === "SETTLED" ? "ready" : exitTogetherQuote.status.toLowerCase())}>{chainBatch?.status === "SETTLED" ? "Settled" : exitTogetherQuote.status === "READY" ? "Ready to quote" : "Building batch"}</em></div>
            <div className="product-boundary"><strong>Demo asset only</strong><p>{exitTogetherQuote.productNotice}</p></div>
            <div className="batch-demand"><div className="holder-faces"><i>01</i><i>02</i><i>03</i><i>+{Math.max(0, waitingHolderCount - 3)}</i></div><div><span>HOLDERS ALREADY WAITING</span><strong>{waitingHolderCount} small sellers have committed {usd.format(waitingValueUsd)}</strong><p>Your order joins people selling this exact product in the same direction.</p></div></div>
            <div className="batch-progress"><div><span>Combined batch if you join</span><strong>{usd.format(exitTogetherQuote.batchValueUsd)} <small>/ {usd.format(exitTogetherQuote.targetValueUsd)}</small></strong></div><div className="progress-rail"><i style={{ width: `${exitTogetherQuote.progressPercent}%` }} /></div><p><b>{exitTogetherQuote.participantCount} holders together</b><span>{exitTogetherQuote.progressPercent}% full</span></p></div>
            <div className="proceeds-compare">
              <div><span>SELL ALONE</span><strong>{usd.format(exitTogetherQuote.estimatedIndividualProceedsUsd)}</strong><small>Illustrative 2.40% impact</small></div>
              <div className="batch-option"><span>EXIT TOGETHER</span><strong>{usd.format(exitTogetherQuote.estimatedBatchProceedsUsd)}</strong><small>0.60% projected impact + 0.15% fee</small></div>
            </div>
            <div className="batch-saving"><span>Projected value kept by joining</span><strong>+{usd.format(exitTogetherQuote.estimatedSavingsUsd)}</strong></div>
            <button className="batch-action" type="button" onClick={() => { setBatchPreviewed(true); void joinOnchainBatch(); }} disabled={["faucet", "approve", "join", "cancel", "claim"].includes(batchTxPhase)}>{batchTxPhase === "faucet" ? "1 / 3 · Getting demo tokens…" : batchTxPhase === "approve" ? "2 / 3 · Approving order…" : batchTxPhase === "join" ? "3 / 3 · Joining batch…" : batchTxPhase === "joined" ? `Order #${demoOrderId} joined ✓` : batchTxPhase === "claimed" ? "Proceeds claimed ✓" : isDemoDeployed ? `Join ${waitingHolderCount} holders in this batch` : "See how joining this batch works"}</button>
            <div className={`batch-transaction ${batchTxPhase}`} aria-live="polite"><div className="transaction-steps"><span className={["faucet", "approve", "join", "joined", "cancel", "cancelled", "claim", "claimed"].includes(batchTxPhase) ? "active" : ""}>1 Test token</span><span className={["approve", "join", "joined", "cancel", "cancelled", "claim", "claimed"].includes(batchTxPhase) ? "active" : ""}>2 Approve</span><span className={["join", "joined", "cancel", "cancelled", "claim", "claimed"].includes(batchTxPhase) ? "active" : ""}>3 Escrow</span><span className={chainBatch?.status === "SETTLED" || batchTxPhase === "claimed" ? "active" : ""}>4 Settle</span></div><p>{batchTxMessage}</p>{batchTxHash && <a href={`https://www.okx.com/web3/explorer/xlayer-test/tx/${batchTxHash}`} target="_blank" rel="noreferrer">View transaction ↗</a>}</div>
            {demoOrderId && <div className="batch-order-actions">{chainBatch?.status === "SETTLED" ? <button type="button" onClick={claimOnchainProceeds}>Claim proceeds</button> : <button type="button" onClick={cancelOnchainOrder}>Cancel and withdraw</button>}<button type="button" onClick={refreshOnchainBatch}>Refresh settlement</button></div>}
            <p className="batch-disclaimer">{isDemoDeployed ? `Contract ${demoDeployment.coordinator?.slice(0, 8)}… · testnet tokens have no real-world value.` : "Not deployed yet. No order is placed and no funds move."}</p>
            <details><summary>Rules that protect each holder</summary>{exitTogetherQuote.safeguards.map((line) => <p key={line}>• {line}</p>)}</details>
          </article>
          <div className="execution-boundary" data-reveal>
            <article><span>PRODUCT WE EXPLAIN</span><strong>SPCXUSD X-Perp</strong><p>Live on OKX. Price exposure only. Not SpaceX ownership. Public docs do not yet confirm block-RFQ access.</p><em>Verified product · route unconfirmed</em></article>
            <article><span>SETTLEMENT WE PROVE</span><strong>tgSPCX → tgUSD</strong><p>A real X Layer testnet escrow, signed quote and pro-rata claim. Both tokens are demos with no real-world value.</p><em>{isDemoDeployed ? "Contract deployed" : "Deployment ready · funding needed"}</em></article>
            <article><span>PRODUCTION ROUTE</span><strong>Supported RWA token pair</strong><p>Connect OKX OnchainOS only after the exact X Layer token pair, credentials and maker route are verified.</p><em>Adapter built · credentials needed</em></article>
          </div>
          <div className="exit-animation-frame" data-reveal><iframe src="./exittogether-animation.html" title="Interactive ExitTogether batch explanation" loading="lazy" /></div>
        </div>
      </section>

      <section className="compare-section">
        <div className="section-heading" data-reveal><div><p className="eyebrow">Same label. Different rights.</p><h2>“RWA” does not mean one thing.</h2></div><p>A derivative, tokenized tracker and allocated commodity can all be called an RWA. TrueGuard makes the differences obvious.</p></div>
        <div className="compare-table" role="table" aria-label="RWA product comparison"><div className="compare-row compare-head" role="row"><div role="columnheader">Product</div>{assets.map((item) => <button type="button" onClick={() => chooseAsset(item.id)} key={item.id} role="columnheader"><strong>{item.products[0].symbol}</strong><span>{item.name}</span></button>)}</div>{comparisons.map((row) => <div className="compare-row" role="row" key={row.field}><div role="rowheader">{row.field}</div>{assets.map((item) => <div role="cell" key={item.id}>{row.values[item.products[0].id]}</div>)}</div>)}</div>
      </section>

      <section className="final-cta"><div><span>Built on X Layer</span><h2>{copy.finalTitle}</h2><p>{copy.finalBody}</p></div><a className="button primary" href="#developers">Install TrueGuard <span>↗</span></a></section>

      <footer><div className="brand"><BrandMark /><span>TrueGuard</span></div><p>The RWA understanding layer for people, products and AI agents.</p><span>Research is not investment advice.</span></footer>
      <EvidenceDrawer evidence={selectedEvidence} onClose={closeEvidence} />
    </main>
  );
}

export default App;
