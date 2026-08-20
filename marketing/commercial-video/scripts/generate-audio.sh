#!/usr/bin/env bash
set -euo pipefail

ASSET_DIR="$(cd "$(dirname "$0")/../../commercial-assets" && pwd)"
VOICE_TEXT="People often know the story behind a real-world asset. But not what the token actually gives them. TrueGuard connects the real asset to the onchain product. It checks what the user wants, and links every important claim to proof. And when matching small holders want to sell, ExitTogether pools their orders to seek one large-order quote, while each holder keeps a minimum. TrueGuard. Understand it. Verify it. Exit together."
VERTICAL_VOICE_TEXT="You may know the asset. But what does the token actually give you? TrueGuard explains the difference. And when matching small holders want to sell, ExitTogether helps them seek one large-order quote. Understand it. Verify it. Exit together."

EDGE_TTS_BIN="${EDGE_TTS_BIN:-$(command -v edge-tts || true)}"
if [[ -z "$EDGE_TTS_BIN" ]]; then
  echo "edge-tts is required. Install it with: python3 -m pip install edge-tts" >&2
  exit 1
fi

"$EDGE_TTS_BIN" --voice en-US-AndrewMultilingualNeural --rate=-4% --pitch=-2Hz \
  --text "$VOICE_TEXT" --write-media "$ASSET_DIR/trueguard-voiceover.mp3" --write-subtitles "$ASSET_DIR/trueguard-voiceover.vtt"
"$EDGE_TTS_BIN" --voice en-US-AndrewMultilingualNeural --rate=+12% --pitch=-2Hz \
  --text "$VERTICAL_VOICE_TEXT" --write-media "$ASSET_DIR/trueguard-voiceover-vertical.mp3" --write-subtitles "$ASSET_DIR/trueguard-voiceover-vertical.vtt"

VOICE_FILTER="highpass=f=70,acompressor=threshold=-20dB:ratio=2.2:attack=15:release=180,loudnorm=I=-16:TP=-1.5:LRA=7"
ffmpeg -y -i "$ASSET_DIR/trueguard-voiceover.mp3" -af "$VOICE_FILTER" -ar 48000 -ac 2 -c:a pcm_s16le "$ASSET_DIR/trueguard-voiceover.wav"
ffmpeg -y -i "$ASSET_DIR/trueguard-voiceover-vertical.mp3" -af "$VOICE_FILTER" -ar 48000 -ac 2 -c:a pcm_s16le "$ASSET_DIR/trueguard-voiceover-vertical.wav"

node "$(dirname "$0")/generate-music.mjs" "$ASSET_DIR/trueguard-music.wav"

ffmpeg -y \
  -f lavfi -i "sine=frequency=880:sample_rate=48000:duration=0.18" \
  -af "volume=0.12,afade=t=out:st=0.08:d=0.10" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-click.wav"
