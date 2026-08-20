#!/usr/bin/env bash
set -euo pipefail

ASSET_DIR="$(cd "$(dirname "$0")/../../commercial-assets" && pwd)"
VOICE_TEXT="R W A buyers often know the story. But not always what the token gives them. TrueGuard connects the real asset to the onchain product, checks what the user wants, and links every important claim to proof. When matching small holders want to sell, ExitTogether pools their orders to seek one large-order quote, while every holder keeps a minimum. TrueGuard. Understand it. Verify it. Exit together."
VERTICAL_VOICE_TEXT="Know the asset story. Then check what the token actually gives you. TrueGuard explains the difference. ExitTogether lets matching small sellers seek one large-order quote. Understand it. Verify it. Exit together."

say -v Samantha -r 165 -o "$ASSET_DIR/trueguard-voiceover.aiff" "$VOICE_TEXT"
say -v Samantha -r 190 -o "$ASSET_DIR/trueguard-voiceover-vertical.aiff" "$VERTICAL_VOICE_TEXT"

ffmpeg -y -i "$ASSET_DIR/trueguard-voiceover.aiff" -c:a pcm_s16le "$ASSET_DIR/trueguard-voiceover.wav"
ffmpeg -y -i "$ASSET_DIR/trueguard-voiceover-vertical.aiff" -c:a pcm_s16le "$ASSET_DIR/trueguard-voiceover-vertical.wav"

ffmpeg -y \
  -f lavfi -i "sine=frequency=55:sample_rate=48000:duration=30" \
  -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=30" \
  -f lavfi -i "anoisesrc=color=pink:sample_rate=48000:duration=30" \
  -filter_complex "[0:a]volume=0.025,lowpass=f=180[a0];[1:a]volume=0.010,lowpass=f=300[a1];[2:a]volume=0.008,lowpass=f=1400,highpass=f=260[a2];[a0][a1][a2]amix=inputs=3,afade=t=in:st=0:d=1.2,afade=t=out:st=27.5:d=2.5" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-ambient.wav"

ffmpeg -y \
  -f lavfi -i "sine=frequency=880:sample_rate=48000:duration=0.18" \
  -af "volume=0.12,afade=t=out:st=0.08:d=0.10" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-click.wav"
