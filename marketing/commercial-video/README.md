# TrueGuard motion commercial

This is the editable, code-based motion system for the TrueGuard product commercial. It is not a still-image slideshow: the product screens, verification path, API response, holder bubbles, batch rails, quote counter, camera moves, transitions, captions and audio are all animated on the timeline.

## Deliverables

- `out/trueguard-commercial-30s-16x9.mp4` — 1920×1080, 24 fps, narrated master.
- `out/trueguard-commercial-15s-9x16.mp4` — 1080×1920, 24 fps, narrated social cut.
- `out/trueguard-commercial-cover-16x9.png` — landscape upload cover.
- `out/trueguard-commercial-cover-9x16.png` — vertical upload cover.
- `out/trueguard-commercial-poster.png` — 1920×1080 campaign poster.
- `out/trueguard-commercial-impact-40s-16x9.mp4` — separate 40-second high-energy launch cut.
- `out/trueguard-commercial-impact-cover-16x9.png` — high-energy upload cover.
- `../trueguard_commercial_animation.html` — self-contained interactive storyboard.

## Rebuild

From the repository root:

```bash
pnpm install
python3 -m pip install edge-tts
cd marketing/commercial-video
bash scripts/generate-audio.sh
bash scripts/generate-impact-audio.sh
pnpm render:landscape
pnpm render:vertical
pnpm render:impact
pnpm still
pnpm still:impact
```

The narration uses Microsoft's Andrew multilingual neural voice through `edge-tts`. The original 96 BPM music bed and transition tone are generated locally from the included scripts, so the edit has no third-party music dependency. The opening brand cover lasts three frames (0.125 seconds at 24 fps).

The impact cut is a separate composition and does not replace either original export. It uses an original 148 BPM score, original footage plates and an official SEC source screenshot. Its verified claim sources are documented in `IMPACT_SOURCES.md`.

## Story

1. People know the real-asset story.
2. TrueGuard separates that story from the rights of the onchain product.
3. The intent check explains price exposure versus company ownership in plain English.
4. The same proof-linked answer is available to people, products and AI agents.
5. ExitTogether pools compatible small sell orders while preserving each holder's minimum.
6. The end card closes on: `Understand it. Verify it. Exit together.`

## Accuracy rules

- Do not imply that SPCXUSD X-Perp is SpaceX equity.
- ExitTogether seeks a large-order quote; it does not guarantee a better price or execution.
- Do not imply partnerships with OKX, X Layer, SpaceX or an RWA issuer.
- Keep `Research is not investment advice` on the final card.
