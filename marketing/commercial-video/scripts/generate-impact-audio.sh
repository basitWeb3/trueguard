#!/usr/bin/env bash
set -euo pipefail

ASSET_DIR="$(cd "$(dirname "$0")/../../commercial-assets" && pwd)"
VOICE_TEXT="Markets move in seconds. Hype moves faster. The SEC suspended ZOOM after investors confused it with Zoom Video. OpenAI warned that Robinhood's tokens were not OpenAI equity. Researchers warn that tokenized stocks can fragment liquidity. Familiar names can hide very different products. A token can track a price without giving you ownership, voting rights, or redemption. TrueGuard checks the real asset, the token rights, and what the user actually wants. Then it links every important answer to proof. And when small holders of the same token want to sell, ExitTogether combines compatible orders to seek one large-order quote, while each holder keeps a minimum. Know what you own. Protect how you exit. TrueGuard."

EDGE_TTS_BIN="${EDGE_TTS_BIN:-$(command -v edge-tts || true)}"
if [[ -z "$EDGE_TTS_BIN" ]]; then
  echo "edge-tts is required. Install it with: python3 -m pip install edge-tts" >&2
  exit 1
fi

"$EDGE_TTS_BIN" --voice de-DE-ConradNeural --rate=+24% --pitch=-8Hz \
  --text "$VOICE_TEXT" \
  --write-media "$ASSET_DIR/trueguard-impact-voiceover.mp3" \
  --write-subtitles "$ASSET_DIR/trueguard-impact-voiceover.vtt"

VOICE_FILTER="highpass=f=115,lowpass=f=5400,equalizer=f=1000:t=q:w=1.2:g=2.5,acompressor=threshold=-21dB:ratio=2.8:attack=8:release=130,aecho=0.8:0.88:28:0.045,loudnorm=I=-15.5:TP=-1.5:LRA=6"
ffmpeg -y -i "$ASSET_DIR/trueguard-impact-voiceover.mp3" -af "$VOICE_FILTER" -ar 48000 -ac 2 -c:a pcm_s16le "$ASSET_DIR/trueguard-impact-voiceover.wav"

node "$(dirname "$0")/generate-impact-music.mjs" "$ASSET_DIR/trueguard-impact-music.wav"

ffmpeg -y \
  -f lavfi -i "sine=frequency=58:sample_rate=48000:duration=0.72" \
  -f lavfi -i "anoisesrc=color=brown:sample_rate=48000:duration=0.72" \
  -filter_complex "[0:a]volume=0.55,afade=t=out:st=0.14:d=0.58[a0];[1:a]lowpass=f=700,volume=0.18,afade=t=out:st=0.08:d=0.64[a1];[a0][a1]amix=inputs=2,alimiter=limit=.82" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-impact-hit.wav"

ffmpeg -y \
  -f lavfi -i "anoisesrc=color=white:sample_rate=48000:duration=0.48" \
  -af "highpass=f=700,lowpass=f=6500,volume=0.13,afade=t=in:st=0:d=0.34,afade=t=out:st=0.34:d=0.14" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-impact-whoosh.wav"

ffmpeg -y \
  -f lavfi -i "anoisesrc=color=white:sample_rate=48000:duration=0.16" \
  -af "highpass=f=1800,volume=0.12,atrim=0:0.16,afade=t=out:st=0.07:d=0.09" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-impact-glitch.wav"

ffmpeg -y \
  -f lavfi -i "sine=frequency=2100:sample_rate=48000:duration=0.10" \
  -f lavfi -i "anoisesrc=color=white:sample_rate=48000:duration=0.12" \
  -filter_complex "[0:a]volume=0.18,afade=t=out:st=0.025:d=0.075[a0];[1:a]highpass=f=2400,lowpass=f=9000,volume=0.11,afade=t=out:st=0.035:d=0.085[a1];[a0][a1]amix=inputs=2,alimiter=limit=.74" \
  -c:a pcm_s16le "$ASSET_DIR/trueguard-impact-click.wav"
