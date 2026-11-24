#!/bin/bash
# Gera o vídeo completo: voz -> quadros -> MP4.  Uso: ./make.sh projects/<arquivo>.json
set -e
cd "$(dirname "$0")"
P="$1"; [ -f "$P" ] || { echo "projeto não encontrado: $P"; exit 1; }
ID=$(basename "$P" .json); W="work/$ID"; mkdir -p "$W"
[ -d node_modules/three ] || npm install --silent
python3 -c "import piper" 2>/dev/null || pip install --break-system-packages -q piper-tts
python3 tts.py "$P" "$W"
ffmpeg -y -loglevel error -i "$W/voice_raw.wav" -af loudnorm=I=-16:TP=-1.5:LRA=11 -ar 44100 "$W/voice.wav"
node render.mjs "$P" "$W" "$W/$ID.mp4" 2>&1 | grep -v "GL Driver"
echo "PRONTO: $W/$ID.mp4"
