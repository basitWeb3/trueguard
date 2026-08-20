# TrueGuard motion commercial

This is the editable, code-based motion system for the TrueGuard product commercial. It is not a still-image slideshow: the product screens, verification path, API response, holder bubbles, batch rails, quote counter, camera moves, transitions, captions and audio are all animated on the timeline.

## Deliverables

- `out/trueguard-commercial-30s-16x9.mp4` — 1920×1080, 24 fps, narrated master.
- `out/trueguard-commercial-15s-9x16.mp4` — 1080×1920, 24 fps, narrated social cut.
- `out/trueguard-commercial-poster.png` — 1920×1080 campaign poster.
- `../trueguard_commercial_animation.html` — self-contained interactive storyboard.

## Rebuild

From the repository root:

```bash
pnpm install
cd marketing/commercial-video
bash scripts/generate-audio.sh
pnpm render:landscape
pnpm render:vertical
pnpm still
```

The narration uses the local macOS Samantha voice. The ambient bed and transition tone are synthesized locally, so the edit has no third-party music dependency.

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
