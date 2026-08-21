import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  ink: "#07150E",
  black: "#030806",
  paper: "#F4F6F1",
  white: "#FFFFFF",
  mint: "#67E7A0",
  green: "#137A51",
  red: "#FF4D5B",
  amber: "#F4B860",
  line: "rgba(255,255,255,.14)",
  muted: "#AFC1B7",
};

const sans = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const mono = '"SFMono-Regular", Menlo, Monaco, monospace';
const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const enter = (frame: number, start = 0, span = 12) =>
  clamp(interpolate(frame, [start, start + span], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));

const sceneOpacity = (frame: number, duration: number, edge = 10) =>
  interpolate(frame, [0, edge, duration - edge, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const ImpactNoise: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 80,
      pointerEvents: "none",
      opacity: 0.085,
      mixBlendMode: "screen",
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.6'/%3E%3C/svg%3E\")",
    }}
  />
);

const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      zIndex: 75,
      pointerEvents: "none",
      opacity: 0.12,
      background: "repeating-linear-gradient(180deg, transparent 0 3px, rgba(255,255,255,.055) 4px)",
    }}
  />
);

const Brand: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div
    style={{
      position: "absolute",
      left: compact ? 52 : 70,
      top: compact ? 38 : 50,
      zIndex: 60,
      display: "flex",
      alignItems: "center",
      gap: 12,
      color: C.white,
      font: `760 ${compact ? 17 : 20}px ${sans}`,
      letterSpacing: "-.02em",
    }}
  >
    <span
      style={{
        width: compact ? 34 : 40,
        height: compact ? 34 : 40,
        display: "grid",
        placeItems: "center",
        borderRadius: 10,
        background: C.mint,
        color: C.ink,
        fontWeight: 850,
      }}
    >
      T
    </span>
    TrueGuard
  </div>
);

const SourceTag: React.FC<{ children: React.ReactNode; right?: boolean; dark?: boolean }> = ({ children, right, dark }) => (
  <div
    style={{
      position: "absolute",
      bottom: 48,
      left: right ? undefined : 70,
      right: right ? 70 : undefined,
      zIndex: 65,
      maxWidth: 760,
      color: dark ? "rgba(7,21,14,.62)" : "rgba(255,255,255,.68)",
      font: `650 12px/1.5 ${mono}`,
      letterSpacing: ".04em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const SectionCode: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: C.mint, font: `750 14px ${mono}`, letterSpacing: ".16em", marginBottom: 24 }}>
    {children}
  </div>
);

const ColdOpen: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const cut = Math.floor(frame / 12);
  const shakeX = Math.sin(frame * 2.8) * (frame < 45 ? 4 : 1.5);
  const zoom = 1.04 + frame * 0.0016;
  const headlines = ["BREAKING", "PRICE SPIKE", "NEW TICKER", "BUY NOW?", "WHO OWNS WHAT?", "CHECK THE PRODUCT"];
  const headline = headlines[cut % headlines.length];
  return (
    <AbsoluteFill style={{ background: C.black, opacity: sceneOpacity(frame, duration, 4), overflow: "hidden" }}>
      <Img
        src={staticFile("trueguard-impact-newsroom.png")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translateX(${shakeX}px) scale(${zoom})`,
          filter: `contrast(${1.06 + (cut % 2) * 0.12}) saturate(${0.85 + (cut % 3) * 0.13})`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,8,6,.9), rgba(3,8,6,.18) 58%, rgba(3,8,6,.54))" }} />
      {Array.from({ length: 7 }).map((_, index) => {
        const x = ((index * 317 + frame * (12 + index * 1.8)) % 2200) - 180;
        const y = 120 + index * 122;
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 210 + (index % 3) * 120,
              height: 2,
              background: index % 3 === 0 ? C.red : C.mint,
              opacity: 0.36,
            }}
          />
        );
      })}
      <div style={{ position: "absolute", left: 86, top: 230, zIndex: 10 }}>
        <div style={{ color: headline.includes("?") ? C.amber : C.red, font: `800 18px ${mono}`, letterSpacing: ".2em" }}>
          {headline}
        </div>
        <div style={{ marginTop: 16, color: C.white, font: `850 112px/.88 ${sans}`, letterSpacing: "-.07em" }}>
          {frame < 40 ? <>Markets move<br />in seconds.</> : <>Hype moves<br /><span style={{ color: C.mint }}>faster.</span></>}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 70,
          top: 48,
          color: C.white,
          font: `700 13px ${mono}`,
          letterSpacing: ".12em",
        }}
      >
        LIVE / 00:{String(Math.floor(frame / 24)).padStart(2, "0")}
      </div>
      <ImpactNoise />
      <Scanlines />
    </AbsoluteFill>
  );
};

const NewsMontage: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stories = [
    {
      from: 0,
      to: 44,
      src: "trueguard-impact-news-bloomberg.png",
      code: "01 / WRONG COMPANY",
      source: "BLOOMBERG LAW · MARCH 26, 2020",
      accent: C.red,
    },
    {
      from: 44,
      to: 64,
      src: "trueguard-impact-news-sec.png",
      code: "OFFICIAL RECORD",
      source: "U.S. SEC · TRADING SUSPENSIONS",
      accent: C.red,
    },
    {
      from: 64,
      to: 122,
      src: "trueguard-impact-news-techcrunch.png",
      code: "02 / TOKEN IS NOT EQUITY",
      source: "TECHCRUNCH · JULY 2, 2025",
      accent: C.mint,
    },
    {
      from: 122,
      to: duration,
      src: "trueguard-impact-news-cointelegraph.png",
      code: "03 / LIQUIDITY FRAGMENTS",
      source: "COINTELEGRAPH · MAY 22, 2026",
      accent: C.amber,
    },
  ] as const;
  const story = stories.find((item) => frame >= item.from && frame < item.to) ?? stories[stories.length - 1];
  const local = frame - story.from;
  const reveal = enter(local, 0, 7);
  const stamp = spring({ frame: frame - 18, fps, config: { damping: 12, stiffness: 180, mass: 0.6 } });
  const warningScan = interpolate(frame, [12, 42], [-8, 108], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const flash = interpolate(local, [0, 1, 4], [0.94, 0.32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: C.black, opacity: sceneOpacity(frame, duration, 4), overflow: "hidden" }}>
      <Img
        src={staticFile(story.src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center top",
          opacity: 0.28,
          filter: "blur(34px) saturate(.75) brightness(.65)",
          transform: "scale(1.16)",
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(3,8,6,.3), rgba(3,8,6,.78))" }} />
      <div
        style={{
          position: "absolute",
          left: 105,
          right: 105,
          top: 64,
          height: 900,
          overflow: "hidden",
          borderRadius: 24,
          border: `1px solid ${story.accent}66`,
          background: C.paper,
          boxShadow: "0 44px 120px rgba(0,0,0,.48)",
          transform: `translateY(${(1 - reveal) * 38}px) scale(${0.985 + reveal * 0.015 + local * 0.00018})`,
          opacity: reveal,
        }}
      >
        <Img
          src={staticFile(story.src)}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 -120px 110px rgba(3,8,6,.2)" }} />
        {frame < 64 && (
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: `${warningScan}%`,
                height: 5,
                background: C.red,
                boxShadow: "0 0 24px 8px rgba(255,77,91,.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                right: 82,
                top: 610,
                padding: "20px 34px",
                border: `6px solid ${C.red}`,
                color: C.red,
                background: "rgba(255,255,255,.9)",
                font: `900 35px ${mono}`,
                letterSpacing: ".1em",
                transform: `rotate(-7deg) scale(${stamp})`,
                boxShadow: "0 12px 35px rgba(255,77,91,.18)",
              }}
            >
              SUSPENDED
            </div>
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 128,
          bottom: 72,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "13px 18px",
          borderRadius: 999,
          background: "rgba(3,8,6,.9)",
          border: `1px solid ${story.accent}88`,
          color: story.accent,
          font: `760 13px ${mono}`,
          letterSpacing: ".11em",
        }}
      >
        {story.code}
      </div>
      <div style={{ position: "absolute", right: 128, bottom: 84, zIndex: 10, color: C.white, font: `700 12px ${mono}`, letterSpacing: ".08em" }}>
        {story.source}
      </div>
      <AbsoluteFill style={{ zIndex: 30, background: C.white, opacity: flash, pointerEvents: "none" }} />
      <ImpactNoise />
      <Scanlines />
    </AbsoluteFill>
  );
};

const ProductNameScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const p = enter(frame, 4, 18);
  const cards = [
    { label: "REAL COMPANY", title: "SpaceX", sub: "Launches · satellites · connectivity", color: C.white },
    { label: "PRICE PRODUCT", title: "SPCXUSD X-Perp", sub: "Price exposure · funding · venue liquidity", color: C.mint },
    { label: "QUESTION", title: "What do I own?", sub: "The name alone cannot answer this.", color: C.amber },
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: sceneOpacity(frame, duration, 8), overflow: "hidden" }}>
      <Img
        src={staticFile("trueguard-master-key-visual-16x9.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.24, transform: `scale(${1.08 + frame * 0.0007})` }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(7,21,14,.96), rgba(7,21,14,.76), rgba(7,21,14,.88))" }} />
      <Brand compact />
      <div style={{ position: "absolute", left: 90, top: 190, right: 90 }}>
        <SectionCode>THE ONCHAIN PROBLEM</SectionCode>
        <div style={{ color: C.white, font: `850 92px/.92 ${sans}`, letterSpacing: "-.065em" }}>
          Same story.<br /><span style={{ color: C.mint }}>Different product.</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: 20, marginTop: 62 }}>
          {cards.map((card, index) => {
            const cp = enter(frame, 18 + index * 11, 13);
            return (
              <div
                key={card.title}
                style={{
                  minHeight: 235,
                  padding: "30px 32px",
                  borderRadius: 24,
                  border: `1px solid ${index === 1 ? "rgba(103,231,160,.7)" : C.line}`,
                  background: index === 1 ? "rgba(103,231,160,.08)" : "rgba(255,255,255,.045)",
                  transform: `translateY(${(1 - cp) * 55}px) scale(${0.97 + cp * 0.03})`,
                  opacity: cp * p,
                }}
              >
                <div style={{ color: index === 1 ? C.mint : C.muted, font: `750 12px ${mono}`, letterSpacing: ".13em" }}>{card.label}</div>
                <div style={{ color: card.color, font: `800 ${index === 1 ? 39 : 42}px/1.05 ${sans}`, letterSpacing: "-.04em", marginTop: 22 }}>{card.title}</div>
                <div style={{ color: C.muted, font: `520 17px/1.45 ${sans}`, marginTop: 24 }}>{card.sub}</div>
              </div>
            );
          })}
        </div>
      </div>
      <SourceTag>Product shown: TrueGuard research example · Not a claim of equity ownership</SourceTag>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const RightsScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const line = enter(frame, 20, 20);
  const rights = [
    ["Company ownership", false],
    ["Shareholder voting rights", false],
    ["Price exposure", true],
    ["Venue-dependent exit", true],
  ] as const;
  return (
    <AbsoluteFill style={{ background: C.black, opacity: sceneOpacity(frame, duration, 8), overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 72% 50%, rgba(103,231,160,.15), transparent 37%)" }} />
      <Brand compact />
      <div style={{ position: "absolute", left: 88, top: 188, width: 880 }}>
        <SectionCode>THE NAME IS NOT THE RIGHT</SectionCode>
        <div style={{ color: C.white, font: `850 88px/.94 ${sans}`, letterSpacing: "-.065em" }}>
          Price exposure<br /><span style={{ color: C.red }}>is not ownership.</span>
        </div>
        <div style={{ marginTop: 38, color: C.muted, font: `520 22px/1.45 ${sans}`, maxWidth: 760 }}>
          TrueGuard separates the real-world story from the exact rights attached to the onchain product.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 96,
          top: 164,
          width: 690,
          border: `1px solid ${C.line}`,
          borderRadius: 30,
          background: "rgba(8,22,14,.88)",
          boxShadow: "0 34px 100px rgba(0,0,0,.35)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "28px 32px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between" }}>
          <div>
            <div style={{ color: C.mint, font: `750 12px ${mono}`, letterSpacing: ".14em" }}>PRODUCT CHECK</div>
            <div style={{ color: C.white, font: `800 30px ${sans}`, marginTop: 10 }}>SPCXUSD X-Perp</div>
          </div>
          <div style={{ alignSelf: "center", color: C.amber, font: `750 13px ${mono}` }}>EXAMPLE</div>
        </div>
        {rights.map(([label, value], index) => {
          const rp = enter(frame, 18 + index * 10, 12);
          return (
            <div
              key={label}
              style={{
                padding: "25px 32px",
                display: "flex",
                justifyContent: "space-between",
                borderBottom: index < rights.length - 1 ? `1px solid ${C.line}` : undefined,
                opacity: rp,
                transform: `translateX(${(1 - rp) * 45}px)`,
              }}
            >
              <span style={{ color: C.white, font: `650 20px ${sans}` }}>{label}</span>
              <span style={{ color: value ? C.mint : C.red, font: `850 22px ${mono}` }}>{value ? "YES" : "NO"}</span>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 88, right: 96, bottom: 116, height: 2, background: "rgba(255,255,255,.12)" }}>
        <div style={{ width: `${line * 100}%`, height: "100%", background: C.mint, boxShadow: "0 0 22px rgba(103,231,160,.8)" }} />
      </div>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const TrueGuardScan: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const scan = interpolate(frame, [12, duration - 18], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const checks = ["Real asset", "Token rights", "User intent"];
  return (
    <AbsoluteFill style={{ background: C.paper, opacity: sceneOpacity(frame, duration, 8), overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 75% 25%, rgba(103,231,160,.22), transparent 42%)" }} />
      <div style={{ position: "absolute", left: 90, top: 175, width: 650 }}>
        <SectionCode>TRUEGUARD / ONE CHECK</SectionCode>
        <div style={{ color: C.ink, font: `850 86px/.94 ${sans}`, letterSpacing: "-.065em" }}>
          Ask what you<br />actually want.
        </div>
        <div style={{ color: "#5D6962", font: `530 21px/1.5 ${sans}`, marginTop: 32, maxWidth: 590 }}>
          TrueGuard checks the business, the product and the user’s intent before money moves.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 88,
          top: 132,
          width: 940,
          height: 735,
          borderRadius: 34,
          background: C.ink,
          boxShadow: "0 36px 100px rgba(7,21,14,.26)",
          color: C.white,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "25px 30px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.mint, color: C.ink, display: "grid", placeItems: "center", font: `850 16px ${sans}` }}>T</div>
            <div style={{ font: `760 18px ${sans}` }}>TrueGuard intent check</div>
          </div>
          <div style={{ color: C.mint, font: `700 12px ${mono}` }}>RUNNING</div>
        </div>
        <div style={{ padding: "30px 32px" }}>
          <div style={{ color: C.muted, font: `700 11px ${mono}`, letterSpacing: ".12em" }}>USER ASKED</div>
          <div style={{ marginTop: 12, padding: "22px 24px", borderRadius: 17, border: `1px solid ${C.line}`, font: `680 22px ${sans}` }}>
            “Buy $5,000 of SpaceX stock.”
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 24 }}>
            {checks.map((check, index) => {
              const cp = enter(frame, 18 + index * 15, 12);
              return (
                <div key={check} style={{ padding: "22px 20px", borderRadius: 17, background: "rgba(255,255,255,.055)", border: `1px solid ${C.line}`, opacity: cp }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: C.mint, color: C.ink, display: "grid", placeItems: "center", font: `900 14px ${sans}` }}>✓</div>
                  <div style={{ marginTop: 18, font: `700 17px ${sans}` }}>{check}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 24, padding: "25px 26px", borderRadius: 18, background: "rgba(255,77,91,.08)", border: "1px solid rgba(255,77,91,.42)" }}>
            <div style={{ color: C.red, font: `780 12px ${mono}`, letterSpacing: ".12em" }}>CLEAR EXPLANATION</div>
            <div style={{ marginTop: 10, font: `760 24px/1.3 ${sans}` }}>This product tracks a price. It does not make you a shareholder.</div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: `${scan}%`, height: 2, background: C.mint, boxShadow: "0 0 24px 8px rgba(103,231,160,.24)" }} />
      </div>
    </AbsoluteFill>
  );
};

const ProofScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const tiles = [
    { top: "SEC ORDER", bottom: "Source document", color: C.red },
    { top: "PRODUCT DOCS", bottom: "Token rights", color: C.mint },
    { top: "ONCHAIN", bottom: "Contract facts", color: C.amber },
  ];
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: sceneOpacity(frame, duration, 7), overflow: "hidden" }}>
      <Brand compact />
      <div style={{ position: "absolute", left: 92, top: 210 }}>
        <SectionCode>ONE SOURCE OF TRUTH</SectionCode>
        <div style={{ color: C.white, font: `850 92px/.92 ${sans}`, letterSpacing: "-.065em" }}>
          One answer.<br /><span style={{ color: C.mint }}>Every claim linked.</span>
        </div>
      </div>
      <div style={{ position: "absolute", right: 88, top: 220, width: 690, display: "grid", gap: 16 }}>
        {tiles.map((tile, index) => {
          const p = enter(frame, index * 9 + 4, 10);
          return (
            <div
              key={tile.top}
              style={{
                padding: "24px 28px",
                borderRadius: 18,
                border: `1px solid ${C.line}`,
                background: "rgba(255,255,255,.045)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transform: `translateX(${(1 - p) * 90}px)`,
                opacity: p,
              }}
            >
              <div>
                <div style={{ color: tile.color, font: `760 13px ${mono}`, letterSpacing: ".12em" }}>{tile.top}</div>
                <div style={{ color: C.white, font: `700 21px ${sans}`, marginTop: 8 }}>{tile.bottom}</div>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 999, border: `1px solid ${tile.color}`, color: tile.color, display: "grid", placeItems: "center", font: `900 16px ${sans}` }}>✓</div>
            </div>
          );
        })}
      </div>
      <SourceTag>Products and AI agents receive the same proof-linked answer through one API.</SourceTag>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const LiquidityScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const zoom = 1.02 + frame * 0.0011;
  const impact = enter(frame, 26, 22);
  return (
    <AbsoluteFill style={{ background: C.black, opacity: sceneOpacity(frame, duration, 8), overflow: "hidden" }}>
      <Img src={staticFile("trueguard-impact-small-holder.png")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,8,6,.93), rgba(3,8,6,.53) 52%, rgba(3,8,6,.14))" }} />
      <Brand compact />
      <div style={{ position: "absolute", left: 86, top: 215, width: 810 }}>
        <SectionCode>THE SMALL-HOLDER PROBLEM</SectionCode>
        <div style={{ color: C.white, font: `850 84px/.92 ${sans}`, letterSpacing: "-.065em" }}>
          Small order.<br />Shallow liquidity.<br /><span style={{ color: C.red }}>Price moves.</span>
        </div>
        <div style={{ display: "flex", gap: 14, marginTop: 38 }}>
          {["$900", "$1,350", "$1,100"].map((value, index) => (
            <div key={value} style={{ padding: "15px 20px", borderRadius: 999, background: "rgba(255,255,255,.08)", border: `1px solid ${C.line}`, color: C.white, font: `750 18px ${mono}`, opacity: enter(frame, 10 + index * 8, 10) }}>
              {value}
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          right: 86,
          bottom: 122,
          width: 570,
          padding: "25px 28px",
          borderRadius: 22,
          background: "rgba(3,8,6,.78)",
          border: "1px solid rgba(255,77,91,.4)",
          transform: `translateY(${(1 - impact) * 42}px)`,
          opacity: impact,
        }}
      >
        <div style={{ color: C.red, font: `760 12px ${mono}`, letterSpacing: ".13em" }}>EXECUTION REALITY</div>
        <div style={{ color: C.white, font: `750 25px/1.3 ${sans}`, marginTop: 12 }}>The price on screen is not always the price received.</div>
        <div style={{ color: C.muted, font: `520 15px/1.45 ${sans}`, marginTop: 13 }}>Illustrative visualization. No order has been placed.</div>
      </div>
      <SourceTag>Investor.gov: execution depends on available liquidity · MAS: tokenised markets need deeper liquidity</SourceTag>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const ExitTogetherScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const merge = spring({ frame: frame - 34, fps, config: { damping: 18, stiffness: 110, mass: 0.85 } });
  const holders = [
    { value: "$900", x: 140, y: 390 },
    { value: "$1,350", x: 140, y: 570 },
    { value: "$1,100", x: 430, y: 390 },
    { value: "$1,650", x: 430, y: 570 },
  ];
  const targetX = 930;
  const targetY = 365;
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: sceneOpacity(frame, duration, 8), overflow: "hidden" }}>
      <Brand compact />
      <div style={{ position: "absolute", left: 86, top: 145 }}>
        <SectionCode>EXITTOGETHER</SectionCode>
        <div style={{ color: C.white, font: `850 70px/.96 ${sans}`, letterSpacing: "-.06em" }}>Small sellers become<br /><span style={{ color: C.mint }}>one large order.</span></div>
      </div>
      {holders.map((holder, index) => {
        const hp = enter(frame, index * 7, 10);
        const x = interpolate(merge, [0, 1], [holder.x, targetX - 30 + (index % 2) * 60]);
        const y = interpolate(merge, [0, 1], [holder.y, targetY - 28 + Math.floor(index / 2) * 56]);
        return (
          <div
            key={holder.value}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 235,
              height: 112,
              borderRadius: 22,
              border: `1px solid rgba(103,231,160,${0.28 + hp * 0.4})`,
              background: "rgba(255,255,255,.055)",
              display: "grid",
              placeItems: "center",
              color: C.white,
              font: `800 30px ${mono}`,
              opacity: hp * (1 - merge),
              transform: `scale(${0.92 + hp * 0.08 - merge * 0.12})`,
            }}
          >
            {holder.value}
          </div>
        );
      })}
      <div
        style={{
          position: "absolute",
          left: 885,
          top: 315,
          width: 340,
          height: 210,
          borderRadius: 34,
          border: `2px solid ${C.mint}`,
          background: "rgba(103,231,160,.1)",
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          boxShadow: `0 0 ${70 * merge}px rgba(103,231,160,.28)`,
          opacity: merge,
          transform: `scale(${0.72 + merge * 0.28})`,
        }}
      >
        <div>
          <div style={{ color: C.mint, font: `760 12px ${mono}`, letterSpacing: ".13em" }}>COMPATIBLE BATCH</div>
          <div style={{ color: C.white, font: `850 50px ${sans}`, marginTop: 12 }}>$5,000</div>
          <div style={{ color: C.muted, font: `560 15px ${sans}`, marginTop: 10 }}>Seek one quote</div>
        </div>
      </div>
      <div style={{ position: "absolute", right: 88, top: 190, width: 500, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {["SAME TOKEN", "SAME DIRECTION", "EACH MINIMUM"].map((item, index) => (
          <div key={item} style={{ padding: "12px 16px", borderRadius: 999, background: "rgba(255,255,255,.06)", border: `1px solid ${C.line}`, color: C.mint, font: `720 11px ${mono}`, letterSpacing: ".1em", opacity: enter(frame, 50 + index * 8, 10) }}>{item}</div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 1290, top: 348, width: 510, height: 145, borderRadius: 24, border: `1px solid ${C.line}`, background: "rgba(255,255,255,.045)", padding: "26px 28px", opacity: enter(frame, 72, 15), transform: `translateX(${(1 - enter(frame, 72, 15)) * 55}px)` }}>
        <div style={{ color: C.mint, font: `750 12px ${mono}`, letterSpacing: ".12em" }}>LARGE-ORDER QUOTE</div>
        <div style={{ color: C.white, font: `800 31px ${sans}`, marginTop: 13 }}>Take it only if it works.</div>
      </div>
      <SourceTag>ExitTogether seeks a quote. It does not guarantee a better price or execution.</SourceTag>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{ duration: number }> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 18, stiffness: 120, mass: 0.85 } });
  const finalBeat = frame > 68;
  return (
    <AbsoluteFill style={{ background: C.black, opacity: sceneOpacity(frame, duration, 5), overflow: "hidden", display: "grid", placeItems: "center" }}>
      <div style={{ position: "absolute", width: 1100, height: 1100, borderRadius: "50%", background: "radial-gradient(circle, rgba(103,231,160,.22), transparent 65%)", filter: "blur(20px)" }} />
      <div style={{ textAlign: "center", transform: `scale(${0.9 + p * 0.1})`, opacity: p, zIndex: 2 }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, background: C.mint, color: C.ink, display: "grid", placeItems: "center", margin: "0 auto 28px", font: `900 40px ${sans}`, boxShadow: "0 0 80px rgba(103,231,160,.32)" }}>T</div>
        <div style={{ color: C.white, font: `850 92px/.96 ${sans}`, letterSpacing: "-.065em" }}>
          {finalBeat ? <>Understand it. Verify it.<br /><span style={{ color: C.mint }}>Exit together.</span></> : <>Know what you own.<br /><span style={{ color: C.mint }}>Protect how you exit.</span></>}
        </div>
        <div style={{ color: C.muted, font: `560 20px ${sans}`, marginTop: 28 }}>The RWA understanding layer for people, products and AI agents.</div>
        <div style={{ color: C.mint, font: `760 15px ${mono}`, marginTop: 30, letterSpacing: ".06em" }}>trueguard.app</div>
      </div>
      <div style={{ position: "absolute", bottom: 30, color: "rgba(255,255,255,.45)", font: `520 12px ${sans}` }}>Research is not investment advice.</div>
      <ImpactNoise />
    </AbsoluteFill>
  );
};

const GlobalFlash: React.FC = () => {
  const frame = useCurrentFrame();
  const points = [12, 39, 71, 244, 373, 486, 590, 653, 728, 865, 935];
  const distance = Math.min(...points.map((point) => Math.abs(frame - point)));
  const opacity = distance === 0 ? 0.8 : distance === 1 ? 0.18 : 0;
  return <AbsoluteFill style={{ zIndex: 92, background: frame % 2 ? C.mint : C.white, opacity, pointerEvents: "none" }} />;
};

const ImpactSoundtrack: React.FC = () => (
  <>
    <Audio
      src={staticFile("trueguard-impact-music.wav")}
      volume={(frame) =>
        interpolate(frame, [0, 10, 40, 882, 940, 959], [0.48, 0.36, 0.19, 0.19, 0.34, 0.15], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      }
    />
    <Sequence from={8}>
      <Audio src={staticFile("trueguard-impact-voiceover.wav")} volume={1} />
    </Sequence>
    {[0, 72, 244, 373, 486, 590, 653, 728, 865].map((from) => (
      <Sequence key={`hit-${from}`} from={from} durationInFrames={22}>
        <Audio src={staticFile("trueguard-impact-hit.wav")} volume={from === 0 ? 0.72 : 0.42} />
      </Sequence>
    ))}
    {[60, 232, 361, 474, 578, 641, 716, 853].map((from) => (
      <Sequence key={`whoosh-${from}`} from={from} durationInFrames={14}>
        <Audio src={staticFile("trueguard-impact-whoosh.wav")} volume={0.55} />
      </Sequence>
    ))}
    {[12, 27, 40, 55, 78, 92, 118].map((from) => (
      <Sequence key={`glitch-${from}`} from={from} durationInFrames={5}>
        <Audio src={staticFile("trueguard-impact-glitch.wav")} volume={0.38} />
      </Sequence>
    ))}
    {[72, 116, 136, 194].map((from, index) => (
      <Sequence key={`news-click-${from}`} from={from} durationInFrames={5}>
        <Audio src={staticFile("trueguard-impact-click.wav")} volume={index === 1 ? 0.48 : 0.72} />
      </Sequence>
    ))}
  </>
);

const captionSegments = [
  [9, 47, "Markets move in seconds."],
  [48, 78, "Hype moves faster."],
  [79, 146, "The SEC suspended ZOOM after investors confused it with Zoom Video."],
  [147, 205, "OpenAI warned that Robinhood’s tokens were not OpenAI equity."],
  [206, 270, "Researchers warn that tokenized stocks can fragment liquidity."],
  [271, 380, "Familiar names can hide very different products."],
  [381, 493, "A token can track a price without giving you ownership, voting rights, or redemption."],
  [494, 597, "TrueGuard checks the real asset, the token rights, and what the user actually wants."],
  [598, 660, "Then it links every important answer to proof."],
  [661, 726, "And when small holders of the same token want to sell,"],
  [727, 811, "ExitTogether combines compatible orders to seek one large-order quote,"],
  [812, 872, "while each holder keeps a minimum."],
  [873, 894, "Know what you own."],
  [895, 924, "Protect how you exit."],
  [925, 944, "TrueGuard."],
] as const;

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const cue = captionSegments.find(([from, to]) => frame >= from && frame <= to);
  if (!cue) return null;
  const [from, to, text] = cue;
  const opacity = interpolate(frame, [from, from + 3, to - 3, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 35,
        transform: "translateX(-50%)",
        zIndex: 90,
        maxWidth: 1450,
        padding: "11px 20px 12px",
        borderRadius: 999,
        background: "rgba(3,8,6,.82)",
        border: "1px solid rgba(255,255,255,.16)",
        color: C.white,
        font: `680 17px ${sans}`,
        whiteSpace: "nowrap",
        opacity,
      }}
    >
      {text}
    </div>
  );
};

const ImpactCoverFrame: React.FC = () => (
  <AbsoluteFill style={{ background: C.black, overflow: "hidden" }}>
    <Img src={staticFile("trueguard-impact-newsroom.png")} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.58 }} />
    <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,8,6,.96), rgba(3,8,6,.4), rgba(3,8,6,.72))" }} />
    <Brand />
    <div style={{ position: "absolute", left: 92, top: 280 }}>
      <SectionCode>THE RWA UNDERSTANDING LAYER</SectionCode>
      <div style={{ color: C.white, font: `850 110px/.88 ${sans}`, letterSpacing: "-.07em" }}>
        Know what<br />you own.<br /><span style={{ color: C.mint }}>Protect the exit.</span>
      </div>
    </div>
    <ImpactNoise />
  </AbsoluteFill>
);

export const TrueGuardImpact: React.FC = () => (
  <AbsoluteFill style={{ background: C.black }}>
    <ImpactSoundtrack />
    <Sequence from={0} durationInFrames={84}><ColdOpen duration={84} /></Sequence>
    <Sequence from={72} durationInFrames={184}><NewsMontage duration={184} /></Sequence>
    <Sequence from={244} durationInFrames={144}><ProductNameScene duration={144} /></Sequence>
    <Sequence from={373} durationInFrames={129}><RightsScene duration={129} /></Sequence>
    <Sequence from={486} durationInFrames={124}><TrueGuardScan duration={124} /></Sequence>
    <Sequence from={590} durationInFrames={80}><ProofScene duration={80} /></Sequence>
    <Sequence from={653} durationInFrames={99}><LiquidityScene duration={99} /></Sequence>
    <Sequence from={728} durationInFrames={157}><ExitTogetherScene duration={157} /></Sequence>
    <Sequence from={865} durationInFrames={95}><EndScene duration={95} /></Sequence>
    <Captions />
    <GlobalFlash />
    <Sequence from={0} durationInFrames={3}><ImpactCoverFrame /></Sequence>
  </AbsoluteFill>
);

export const TrueGuardImpactCover: React.FC = ImpactCoverFrame;
