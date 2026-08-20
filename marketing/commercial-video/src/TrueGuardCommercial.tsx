import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  paper: "#F4F6F1",
  white: "#FFFFFF",
  ink: "#111713",
  muted: "#637068",
  line: "rgba(17, 23, 19, 0.14)",
  green: "#137A51",
  mint: "#67E7A0",
  dark: "#07150E",
  red: "#C53F49",
  gold: "#B58A18",
};

const sans = '"Helvetica Neue", Helvetica, Arial, sans-serif';
const mono = '"SFMono-Regular", Menlo, Monaco, monospace';

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

const sceneOpacity = (frame: number, duration: number) =>
  interpolate(frame, [0, 12, duration - 12, duration], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Noise: React.FC = () => (
  <AbsoluteFill
    style={{
      opacity: 0.038,
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.45'/%3E%3C/svg%3E\")",
      mixBlendMode: "multiply",
      pointerEvents: "none",
    }}
  />
);

const CoverFlash: React.FC<{ vertical?: boolean }> = ({ vertical = false }) => (
  <AbsoluteFill
    style={{
      zIndex: 100,
      background: C.dark,
      color: C.white,
      display: "grid",
      placeItems: "center",
      overflow: "hidden",
    }}
  >
    <DotGrid dark />
    <div
      style={{
        position: "absolute",
        width: vertical ? 980 : 1500,
        height: vertical ? 980 : 900,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(103,231,160,.22), transparent 67%)",
        filter: "blur(20px)",
      }}
    />
    <div style={{ position: "relative", textAlign: "center", padding: 60 }}>
      <div
        style={{
          width: vertical ? 108 : 92,
          height: vertical ? 108 : 92,
          margin: "0 auto 28px",
          borderRadius: 26,
          display: "grid",
          placeItems: "center",
          background: C.mint,
          color: C.dark,
          font: `800 ${vertical ? 50 : 43}px ${sans}`,
          boxShadow: "0 0 90px rgba(103,231,160,.26)",
        }}
      >
        T
      </div>
      <div style={{ font: `760 ${vertical ? 78 : 74}px/1 ${sans}`, letterSpacing: "-.05em" }}>TrueGuard</div>
      <div
        style={{
          marginTop: 22,
          color: C.mint,
          font: `700 ${vertical ? 20 : 17}px ${mono}`,
          letterSpacing: ".15em",
          textTransform: "uppercase",
        }}
      >
        The RWA understanding layer
      </div>
    </div>
    <Noise />
  </AbsoluteFill>
);

const Brand: React.FC<{ light?: boolean }> = ({ light = false }) => (
  <div
    style={{
      position: "absolute",
      left: 72,
      top: 54,
      display: "flex",
      alignItems: "center",
      gap: 14,
      zIndex: 20,
      color: light ? C.white : C.ink,
      fontFamily: sans,
      fontWeight: 700,
      fontSize: 20,
    }}
  >
    <span
      style={{
        width: 38,
        height: 38,
        display: "grid",
        placeItems: "center",
        borderRadius: 11,
        background: light ? C.mint : C.ink,
        color: C.dark,
        fontSize: 17,
      }}
    >
      T
    </span>
    TrueGuard
  </div>
);

const Eyebrow: React.FC<{ children: React.ReactNode; light?: boolean; gold?: boolean }> = ({ children, light, gold }) => (
  <div
    style={{
      fontFamily: mono,
      fontWeight: 700,
      fontSize: 15,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: gold ? C.gold : light ? C.mint : C.green,
      marginBottom: 24,
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{
  children: React.ReactNode;
  light?: boolean;
  size?: number;
  maxWidth?: number;
  align?: "left" | "center";
}> = ({ children, light, size = 84, maxWidth = 1120, align = "left" }) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 720,
      fontSize: size,
      lineHeight: 0.98,
      letterSpacing: "-0.058em",
      color: light ? C.white : C.ink,
      maxWidth,
      textAlign: align,
    }}
  >
    {children}
  </div>
);

const Body: React.FC<{ children: React.ReactNode; light?: boolean; maxWidth?: number; size?: number }> = ({
  children,
  light,
  maxWidth = 760,
  size = 22,
}) => (
  <div
    style={{
      marginTop: 28,
      maxWidth,
      fontFamily: sans,
      fontSize: size,
      lineHeight: 1.45,
      color: light ? "#AFC1B7" : C.muted,
    }}
  >
    {children}
  </div>
);

const Rise: React.FC<{ children: React.ReactNode; delay?: number; distance?: number }> = ({ children, delay = 0, distance = 38 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, mass: 0.8, stiffness: 130 } });
  return (
    <div style={{ opacity: clamp(p), transform: `translateY(${(1 - p) * distance}px)` }}>{children}</div>
  );
};

const DotGrid: React.FC<{ dark?: boolean }> = ({ dark = false }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${dark ? "rgba(103,231,160,.14)" : "rgba(19,122,81,.12)"} 1px, transparent 1px)`,
      backgroundSize: "30px 30px",
      maskImage: "linear-gradient(90deg, transparent, black 25%, black 75%, transparent)",
      opacity: 0.55,
    }}
  />
);

const StoryScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  const opacity = sceneOpacity(frame, duration);
  const zoom = interpolate(frame, [0, duration], [1.02, 1.11], { extrapolateRight: "clamp" });
  const lightX = interpolate(frame, [0, duration], [-40, 120], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: C.paper, opacity }}>
      <Img
        src={staticFile(vertical ? "trueguard-commercial-vertical-9x16.png" : "trueguard-master-key-visual-16x9.png")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }}
      />
      <AbsoluteFill
        style={{
          background: vertical
            ? "linear-gradient(180deg, rgba(7,21,14,.78) 0%, rgba(7,21,14,.05) 55%, rgba(7,21,14,.75) 100%)"
            : "linear-gradient(90deg, rgba(7,21,14,.92) 0%, rgba(7,21,14,.56) 40%, rgba(7,21,14,.02) 73%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: vertical ? 360 : 500,
          left: `${lightX}%`,
          transform: "skewX(-12deg)",
          background: "linear-gradient(90deg, transparent, rgba(103,231,160,.13), transparent)",
          filter: "blur(20px)",
        }}
      />
      {!vertical && <Brand light />}
      <div
        style={{
          position: "absolute",
          left: vertical ? 64 : 100,
          right: vertical ? 64 : 100,
          top: vertical ? 150 : 270,
        }}
      >
        <Rise delay={2}>
          <Eyebrow light>The RWA understanding layer</Eyebrow>
        </Rise>
        <Rise delay={7}>
          <Headline light size={vertical ? 88 : 108} maxWidth={vertical ? 880 : 900}>
            Everyone knows<br />the asset story.
          </Headline>
        </Rise>
        <Rise delay={16}>
          <Body light size={vertical ? 30 : 24} maxWidth={vertical ? 780 : 600}>
            But what does the token actually give you?
          </Body>
        </Rise>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const AssetTokenDiagram: React.FC<{ frame: number; vertical: boolean }> = ({ frame, vertical }) => {
  const p = clamp(interpolate(frame, [20, 54], [0, 1]));
  const pulse = (Math.sin(frame / 4) + 1) / 2;
  const cardStyle: React.CSSProperties = {
    borderRadius: 28,
    border: `1px solid ${C.line}`,
    background: "rgba(255,255,255,.9)",
    padding: vertical ? 34 : 30,
    boxShadow: "0 20px 70px rgba(16,35,25,.08)",
  };
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: vertical ? "1fr" : "1fr 160px 1fr",
        alignItems: "center",
        gap: vertical ? 20 : 28,
        width: "100%",
      }}
    >
      <div style={cardStyle}>
        <div style={{ font: `700 13px ${mono}`, color: C.green, letterSpacing: ".14em" }}>REAL ASSET</div>
        <div style={{ font: `700 ${vertical ? 32 : 30}px ${sans}`, marginTop: 16 }}>SpaceX</div>
        <div style={{ color: C.muted, font: `500 ${vertical ? 23 : 18}px/1.45 ${sans}`, marginTop: 10 }}>
          Launches, satellites and connectivity.
        </div>
      </div>
      <div style={{ height: vertical ? 70 : 6, position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: vertical ? "50%" : 0,
            right: vertical ? undefined : 0,
            top: vertical ? 0 : "50%",
            bottom: vertical ? 0 : undefined,
            width: vertical ? 3 : undefined,
            height: vertical ? undefined : 3,
            background: "rgba(19,122,81,.22)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: 99,
            background: C.mint,
            boxShadow: `0 0 ${18 + pulse * 18}px ${C.mint}`,
            left: vertical ? "calc(50% - 7px)" : `${p * 90}%`,
            top: vertical ? `${p * 82}%` : "calc(50% - 7px)",
          }}
        />
      </div>
      <div style={cardStyle}>
        <div style={{ font: `700 13px ${mono}`, color: C.green, letterSpacing: ".14em" }}>ONCHAIN PRODUCT</div>
        <div style={{ font: `700 ${vertical ? 32 : 30}px ${sans}`, marginTop: 16 }}>SPCXUSD X-Perp</div>
        <div style={{ color: C.muted, font: `500 ${vertical ? 23 : 18}px/1.45 ${sans}`, marginTop: 10 }}>
          Price exposure. Not SpaceX shares.
        </div>
      </div>
    </div>
  );
};

const UnderstandScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.paper, opacity: sceneOpacity(frame, duration) }}>
      <DotGrid />
      {!vertical && <Brand />}
      <div style={{ padding: vertical ? "150px 62px 90px" : "180px 100px 80px", display: "flex", flexDirection: "column", height: "100%" }}>
        <Rise>
          <Eyebrow>01 / Understand</Eyebrow>
          <Headline size={vertical ? 78 : 82} maxWidth={vertical ? 900 : 1400}>
            See the real business. <span style={{ color: C.green }}>Separate fact from hype.</span>
          </Headline>
        </Rise>
        <div style={{ marginTop: vertical ? 80 : 70 }}>
          <AssetTokenDiagram frame={frame} vertical={vertical} />
        </div>
        <Rise delay={48}>
          <div
            style={{
              marginTop: 26,
              padding: "18px 22px",
              borderRadius: 16,
              border: "1px solid rgba(197,63,73,.24)",
              background: "#FFF2F1",
              color: C.red,
              font: `650 ${vertical ? 22 : 18}px ${sans}`,
            }}
          >
            The business story does not automatically become token-holder rights.
          </div>
        </Rise>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const CheckRow: React.FC<{ label: string; delay: number; frame: number; warning?: boolean }> = ({ label, delay, frame, warning }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 120 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        opacity: clamp(p),
        transform: `translateX(${(1 - p) * 32}px)`,
        font: `540 18px ${sans}`,
        color: C.ink,
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 99,
          display: "grid",
          placeItems: "center",
          background: warning ? "#FCE6E4" : "#E3F6EA",
          color: warning ? C.red : C.green,
          fontWeight: 800,
        }}
      >
        {warning ? "!" : "✓"}
      </span>
      {label}
    </div>
  );
};

const IntentScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cardP = spring({ frame: frame - 22, fps, config: { damping: 18, stiffness: 110 } });
  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#EDF4EC 0%,#F7F7F2 75%)", opacity: sceneOpacity(frame, duration) }}>
      {!vertical && <Brand />}
      <div
        style={{
          padding: vertical ? "140px 62px 80px" : "150px 100px 70px",
          height: "100%",
          display: "grid",
          gridTemplateColumns: vertical ? "1fr" : "0.86fr 1.14fr",
          gap: vertical ? 48 : 80,
          alignItems: "center",
        }}
      >
        <Rise>
          <Eyebrow>02 / Verify intent</Eyebrow>
          <Headline size={vertical ? 78 : 88} maxWidth={730}>
            Ask what you<br />wish you knew.
          </Headline>
          <Body size={vertical ? 26 : 22}>We check what the product gives you in seconds.</Body>
        </Rise>
        <div
          style={{
            border: `1px solid ${C.line}`,
            borderRadius: vertical ? 30 : 34,
            background: "rgba(255,255,255,.88)",
            padding: vertical ? 30 : 40,
            boxShadow: "0 30px 100px rgba(16,38,25,.10)",
            transform: `scale(${0.94 + clamp(cardP) * 0.06})`,
            opacity: clamp(cardP),
          }}
        >
          <div style={{ font: `700 12px ${mono}`, color: C.muted, letterSpacing: ".14em" }}>WHAT DO YOU WANT?</div>
          <div style={{ marginTop: 14, padding: "20px 22px", borderRadius: 16, border: `1px solid ${C.line}`, font: `540 ${vertical ? 23 : 20}px ${sans}` }}>
            I want to own SpaceX stock.
          </div>
          <div style={{ marginTop: 14, padding: vertical ? 25 : 28, borderRadius: 18, background: "#FFF0EF", border: "1px solid rgba(197,63,73,.28)" }}>
            <div style={{ color: C.red, font: `750 12px ${mono}`, letterSpacing: ".14em" }}>IMPORTANT DIFFERENCE</div>
            <div style={{ font: `720 ${vertical ? 30 : 28}px/1.12 ${sans}`, marginTop: 10 }}>
              This gives price exposure—not company ownership.
            </div>
            <div style={{ color: C.muted, font: `500 ${vertical ? 20 : 17}px/1.45 ${sans}`, marginTop: 10 }}>
              You do not receive SpaceX shares or shareholder rights.
            </div>
          </div>
          <div style={{ display: "grid", gap: 14, marginTop: 22 }}>
            <CheckRow frame={frame} delay={42} label="Product structure checked" />
            <CheckRow frame={frame} delay={51} label="Holder rights checked" />
            <CheckRow frame={frame} delay={60} label="Intent mismatch explained" warning />
          </div>
        </div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const JsonLine: React.FC<{ children: React.ReactNode; frame: number; delay: number }> = ({ children, frame, delay }) => {
  const p = clamp(interpolate(frame, [delay, delay + 9], [0, 1]));
  return <div style={{ opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>{children}</div>;
};

const ProofScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  const lineP = clamp(interpolate(frame, [18, 66], [0, 1]));
  return (
    <AbsoluteFill style={{ background: C.dark, opacity: sceneOpacity(frame, duration), color: C.white }}>
      <DotGrid dark />
      {!vertical && <Brand light />}
      <div
        style={{
          padding: vertical ? "150px 62px 80px" : "160px 100px 70px",
          height: "100%",
          display: "grid",
          gridTemplateColumns: vertical ? "1fr" : "0.9fr 1.1fr",
          gap: vertical ? 60 : 100,
          alignItems: "center",
        }}
      >
        <Rise>
          <Eyebrow light>03 / One source of truth</Eyebrow>
          <Headline light size={vertical ? 76 : 84} maxWidth={760}>
            One answer.<br /><span style={{ color: C.mint }}>Every claim linked to proof.</span>
          </Headline>
          <Body light size={vertical ? 25 : 22}>
            Products and AI agents get the same answer through one API.
          </Body>
        </Rise>
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              left: -80,
              right: -40,
              top: "50%",
              height: 2,
              background: `linear-gradient(90deg,transparent ${lineP * 20}%,${C.mint} ${lineP * 100}%,transparent)`,
              opacity: 0.5,
            }}
          />
          <div
            style={{
              position: "relative",
              padding: vertical ? 30 : 40,
              borderRadius: 30,
              border: "1px solid rgba(103,231,160,.24)",
              background: "rgba(4,15,9,.84)",
              boxShadow: "0 28px 100px rgba(0,0,0,.28)",
              font: `540 ${vertical ? 20 : 20}px/1.85 ${mono}`,
              color: "#CDE4D6",
            }}
          >
            <JsonLine frame={frame} delay={24}>{"{"}</JsonLine>
            <JsonLine frame={frame} delay={33}><span style={{ color: C.mint }}>"realAsset"</span>: "SpaceX",</JsonLine>
            <JsonLine frame={frame} delay={42}><span style={{ color: C.mint }}>"product"</span>: "SPCXUSD X-Perp",</JsonLine>
            <JsonLine frame={frame} delay={51}><span style={{ color: C.mint }}>"companyOwnership"</span>: false,</JsonLine>
            <JsonLine frame={frame} delay={60}><span style={{ color: C.mint }}>"evidence"</span>: ["OKX", "SpaceX"]</JsonLine>
            <JsonLine frame={frame} delay={69}>{"}"}</JsonLine>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, font: `700 12px ${mono}`, letterSpacing: ".12em", color: C.mint }}>
            <span>PEOPLE</span><span>PRODUCTS</span><span>AI AGENTS</span>
          </div>
        </div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Holder: React.FC<{ value: string; label: string; index: number; frame: number; vertical: boolean }> = ({ value, label, index, frame, vertical }) => {
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - (18 + index * 6), fps, config: { damping: 15, stiffness: 125 } });
  const bob = Math.sin((frame + index * 17) / 7) * 5;
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid rgba(103,231,160,.30)",
        background: "rgba(16,33,25,.94)",
        padding: vertical ? "18px 20px" : "18px 22px",
        color: C.white,
        opacity: clamp(p),
        transform: `translateY(${(1 - p) * 28 + bob}px)`,
      }}
    >
      <div style={{ color: "#8FA79A", font: `700 10px ${mono}`, letterSpacing: ".12em" }}>{label}</div>
      <div style={{ marginTop: 7, font: `720 ${vertical ? 25 : 24}px ${sans}` }}>{value}</div>
    </div>
  );
};

const ExitScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  const railP = clamp(interpolate(frame, [42, 92], [0, 1]));
  const quoteP = clamp(interpolate(frame, [88, 114], [0, 1]));
  const count = Math.round(interpolate(frame, [72, 96], [37250, 50000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const holders = [
    ["$8,100", "HOLDER 01"],
    ["$11,400", "HOLDER 02"],
    ["$7,250", "HOLDER 03"],
    ["$10,500", "HOLDER 04"],
  ];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(145deg,#07150E,#0A1D13)", opacity: sceneOpacity(frame, duration), color: C.white }}>
      <DotGrid dark />
      {!vertical && <Brand light />}
      <div style={{ padding: vertical ? "135px 58px 70px" : "145px 90px 60px", height: "100%", display: "flex", flexDirection: "column" }}>
        <Rise>
          <Eyebrow light>04 / ExitTogether</Eyebrow>
          <Headline light size={vertical ? 76 : 82} maxWidth={vertical ? 900 : 1250}>
            Small sellers become <span style={{ color: C.mint }}>one large order.</span>
          </Headline>
          <Body light maxWidth={960} size={vertical ? 24 : 20}>
            Matching holders pool the exact same token and seek one quote. Every holder keeps a minimum.
          </Body>
        </Rise>
        <div
          style={{
            marginTop: vertical ? 65 : 45,
            flex: 1,
            display: "grid",
            gridTemplateColumns: vertical ? "1fr" : "0.8fr 0.52fr 0.78fr",
            alignItems: "center",
            gap: vertical ? 22 : 42,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {holders.map(([value, label], i) => <Holder key={label} value={value} label={label} index={i} frame={frame} vertical={vertical} />)}
          </div>
          <div style={{ position: "relative", height: vertical ? 180 : 250, display: "grid", placeItems: "center" }}>
            <svg width="100%" height="100%" viewBox="0 0 360 250" style={{ overflow: "visible", position: "absolute" }}>
              {[35, 95, 155, 215].map((y, i) => (
                <path key={y} d={`M0 ${y} C100 ${y}, 130 125, 250 125`} fill="none" stroke="rgba(103,231,160,.20)" strokeWidth="3" />
              ))}
              {[0, 1, 2, 3].map((i) => {
                const x = clamp(interpolate(frame, [44 + i * 7, 76 + i * 7], [0, 1]));
                const y0 = [35, 95, 155, 215][i];
                const cx = x < 0.55 ? x * 260 : 143 + (x - 0.55) * 238;
                const cy = y0 + (125 - y0) * x;
                return <circle key={i} cx={cx} cy={cy} r="9" fill={C.mint} style={{ filter: "drop-shadow(0 0 12px #67E7A0)" }} />;
              })}
            </svg>
            <div
              style={{
                marginLeft: vertical ? 250 : 160,
                width: vertical ? 150 : 170,
                height: vertical ? 150 : 170,
                borderRadius: 46,
                border: `2px solid ${C.mint}`,
                background: "rgba(19,122,81,.28)",
                boxShadow: "0 0 0 14px rgba(103,231,160,.06),0 0 55px rgba(103,231,160,.16)",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                font: `800 15px/1.15 ${sans}`,
                transform: `scale(${0.92 + railP * 0.08})`,
              }}
            >
              EXIT<br />TOGETHER
            </div>
          </div>
          <div
            style={{
              borderRadius: 26,
              padding: vertical ? 30 : 34,
              background: C.mint,
              color: C.dark,
              opacity: quoteP,
              transform: `translateX(${(1 - quoteP) * 50}px)`,
              boxShadow: "0 30px 90px rgba(103,231,160,.12)",
            }}
          >
            <div style={{ font: `800 11px ${mono}`, letterSpacing: ".14em" }}>COMPATIBLE BATCH</div>
            <div style={{ marginTop: 10, font: `760 ${vertical ? 48 : 46}px ${sans}`, letterSpacing: "-.04em" }}>${count.toLocaleString()}</div>
            <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid rgba(7,21,14,.22)", font: `650 ${vertical ? 20 : 17}px/1.35 ${sans}` }}>
              5 holders · one quote request<br />Minimums stay protected
            </div>
          </div>
        </div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const EndScene: React.FC<{ duration: number; vertical?: boolean }> = ({ duration, vertical = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - 4, fps, config: { damping: 15, stiffness: 100 } });
  const glow = 0.28 + (Math.sin(frame / 8) + 1) * 0.08;
  return (
    <AbsoluteFill style={{ background: C.paper, opacity: sceneOpacity(frame, duration), display: "grid", placeItems: "center" }}>
      <DotGrid />
      <div style={{ textAlign: "center", transform: `scale(${0.92 + clamp(p) * 0.08})`, opacity: clamp(p), padding: vertical ? 60 : 30 }}>
        <div
          style={{
            width: vertical ? 94 : 82,
            height: vertical ? 94 : 82,
            borderRadius: 24,
            margin: "0 auto 34px",
            display: "grid",
            placeItems: "center",
            background: C.dark,
            color: C.mint,
            font: `800 ${vertical ? 42 : 36}px ${sans}`,
            boxShadow: `0 0 90px rgba(19,122,81,${glow})`,
          }}
        >T</div>
        <Eyebrow>The story. The product. The exit.</Eyebrow>
        <Headline align="center" size={vertical ? 82 : 96} maxWidth={vertical ? 850 : 1200}>
          Understand it. Verify it.<br /><span style={{ color: C.green }}>Exit together.</span>
        </Headline>
        <Body maxWidth={900} size={vertical ? 25 : 22}>
          The RWA understanding layer for people, products and AI agents.
        </Body>
        <div style={{ marginTop: 34, font: `750 ${vertical ? 22 : 17}px ${mono}`, color: C.green, letterSpacing: ".05em" }}>
          trueguard-rwa.netlify.app
        </div>
        <div style={{ marginTop: 28, font: `500 ${vertical ? 17 : 13}px ${sans}`, color: C.muted }}>
          Research is not investment advice.
        </div>
      </div>
      <Noise />
    </AbsoluteFill>
  );
};

const Soundtrack: React.FC<{ voice?: "landscape" | "vertical" }> = ({ voice = "landscape" }) => {
  const vertical = voice === "vertical";
  return (
    <>
      <Audio
        src={staticFile("trueguard-music.wav")}
        volume={(frame) =>
          vertical
            ? interpolate(frame, [0, 8, 28, 325, 359], [0.3, 0.26, 0.15, 0.15, 0.3], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
            : interpolate(frame, [0, 18, 42, 675, 719], [0.3, 0.26, 0.16, 0.16, 0.31], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              })
        }
      />
      <Sequence from={vertical ? 8 : 18}>
      <Audio src={staticFile(voice === "vertical" ? "trueguard-voiceover-vertical.wav" : "trueguard-voiceover.wav")} volume={1} />
      </Sequence>
      {(vertical ? [80, 172, 280] : [82, 190, 333, 438, 514, 603]).map((from) => (
        <Sequence key={from} from={from} durationInFrames={12}>
          <Audio src={staticFile("trueguard-click.wav")} volume={0.32} />
        </Sequence>
      ))}
    </>
  );
};

const subtitleSegments = [
  [19, 109, "People often know the story behind a real-world asset."],
  [110, 164, "But not what the token actually gives them."],
  [165, 256, "TrueGuard connects the real asset to the onchain product."],
  [257, 364, "It checks what the user wants, and links every important claim to proof."],
  [365, 446, "And when matching small holders want to sell,"],
  [447, 548, "ExitTogether pools their orders to seek one large-order quote,"],
  [549, 590, "while each holder keeps a minimum."],
  [591, 614, "TrueGuard."],
  [615, 641, "Understand it."],
  [642, 669, "Verify it."],
  [670, 701, "Exit together."],
] as const;

const SubtitleTrack: React.FC = () => {
  const frame = useCurrentFrame();
  const current = subtitleSegments.find(([from, to]) => frame >= from && frame <= to);
  if (!current) return null;
  const [from, to, text] = current;
  const opacity = interpolate(frame, [from, from + 5, to - 5, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: 42,
        transform: "translateX(-50%)",
        padding: "12px 22px 13px",
        borderRadius: 999,
        background: "rgba(7,21,14,.86)",
        border: "1px solid rgba(255,255,255,.12)",
        boxShadow: "0 12px 35px rgba(0,0,0,.16)",
        color: C.white,
        font: `650 18px ${sans}`,
        whiteSpace: "nowrap",
        opacity,
        zIndex: 50,
      }}
    >
      {text}
    </div>
  );
};

export const TrueGuardCommercial: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Soundtrack />
    <Sequence from={0} durationInFrames={84}><StoryScene duration={84} /></Sequence>
    <Sequence from={72} durationInFrames={132}><UnderstandScene duration={132} /></Sequence>
    <Sequence from={192} durationInFrames={156}><IntentScene duration={156} /></Sequence>
    <Sequence from={336} durationInFrames={120}><ProofScene duration={120} /></Sequence>
    <Sequence from={444} durationInFrames={180}><ExitScene duration={180} /></Sequence>
    <Sequence from={612} durationInFrames={108}><EndScene duration={108} /></Sequence>
    <SubtitleTrack />
    <Sequence from={0} durationInFrames={3}><CoverFlash /></Sequence>
  </AbsoluteFill>
);

export const TrueGuardVertical: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <Soundtrack voice="vertical" />
    <Sequence from={0} durationInFrames={92}><StoryScene duration={92} vertical /></Sequence>
    <Sequence from={80} durationInFrames={104}><IntentScene duration={104} vertical /></Sequence>
    <Sequence from={172} durationInFrames={120}><ExitScene duration={120} vertical /></Sequence>
    <Sequence from={280} durationInFrames={80}><EndScene duration={80} vertical /></Sequence>
    <Sequence from={0} durationInFrames={3}><CoverFlash vertical /></Sequence>
  </AbsoluteFill>
);

export const TrueGuardPoster: React.FC = () => (
  <AbsoluteFill style={{ background: C.paper }}>
    <DotGrid />
    <Brand />
    <div style={{ position: "absolute", left: 110, top: 245, zIndex: 2 }}>
      <Eyebrow>The RWA understanding layer</Eyebrow>
      <Headline size={104} maxWidth={1050}>The story.<br />The product.<br /><span style={{ color: C.green }}>The exit.</span></Headline>
      <Body maxWidth={800}>Understand the real asset. Verify the token. Exit together.</Body>
      <div style={{ marginTop: 42, font: `750 17px ${mono}`, color: C.green }}>trueguard-rwa.netlify.app</div>
    </div>
    <div style={{ position: "absolute", right: 90, top: 150, width: 620, height: 780, borderRadius: 42, overflow: "hidden", boxShadow: "0 38px 120px rgba(17,23,19,.22)" }}>
      <Img src={staticFile("trueguard-commercial-vertical-9x16.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
    <Noise />
  </AbsoluteFill>
);
