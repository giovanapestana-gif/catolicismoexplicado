#!/bin/bash
# Quadros de teste + folha de contato (uma imagem com todas as cenas).
# Uso: ./stills.sh projects/<arquivo>.json   -> work/<id>/sheet.jpg
set -e
cd "$(dirname "$0")"
P="$1"; ID=$(basename "$P" .json); W="work/$ID"; mkdir -p "$W"
[ -d node_modules/three ] || npm install --silent
python3 -c "import piper" 2>/dev/null || pip install --break-system-packages -q piper-tts
[ -f "$W/timings.json" ] || python3 tts.py "$P" "$W"
# um quadro no meio de cada cena
T=$(python3 -c "import json;t=json.load(open('$W/timings.json'));print(','.join(str(round((s['start']+s['audio_end'])/2,1)) for s in t['scenes']))")
rm -rf "$W/stills"; node render.mjs "$P" "$W" --stills "$T" 2>&1 | grep -E "pageerror|error" || true
N=$(ls "$W/stills"/t*.jpg | wc -l); COLS=5; ROWS=$(( (N + COLS - 1) / COLS ))
FILES=$(ls "$W/stills"/t*.jpg | sort -V)
INP=""; FLT=""; LAY=""; i=0
for f in $FILES; do INP="$INP -i $f"; FLT="$FLT[$i:v]scale=360:640[s$i];"; LAY="$LAY$(( (i % COLS) * 360 ))_$(( (i / COLS) * 640 ))|"; i=$((i+1)); done
STACK=""; for k in $(seq 0 $((N-1))); do STACK="$STACK[s$k]"; done
ffmpeg -y -loglevel error $INP -filter_complex "${FLT}${STACK}xstack=inputs=$N:layout=${LAY%|}:fill=black" -frames:v 1 "$W/sheet.jpg"
echo "FOLHA: $W/sheet.jpg ($N cenas)"
