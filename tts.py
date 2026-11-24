#!/usr/bin/env python3
"""Gera a narração (voz masculina pt-BR, Piper "faber") cena por cena.

Uso: python3 tts.py projects/<video>.json work/<video>
Saída: work/<video>/voice.wav e work/<video>/timings.json
"""
import json, os, sys, re, wave, urllib.request
import numpy as np

MODEL_URL = "https://huggingface.co/rhasspy/piper-voices/resolve/main/pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx"
CFG_URL = MODEL_URL + ".json"
MODEL_DIR = os.path.expanduser("~/.cache/piper-voices")
MODEL = os.path.join(MODEL_DIR, "pt_BR-faber-medium.onnx")

LEAD = 0.5      # silêncio antes da primeira frase (s)
GAP = 0.30      # pausa entre cenas (s)
TAIL = 1.2      # silêncio no final do vídeo (s)
SR_OUT = 22050


def ensure_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    for url, dest in ((MODEL_URL, MODEL), (CFG_URL, MODEL + ".json")):
        if not os.path.exists(dest) or os.path.getsize(dest) < 1000:
            print("baixando", url, flush=True)
            urllib.request.urlretrieve(url, dest)


def word_weights(words):
    """Peso de cada palavra ~ nº de letras + pausa depois de pontuação."""
    ws = []
    for w in words:
        base = len(re.sub(r"\W", "", w)) + 1.5
        if w.endswith((",", ";", ":")):
            base += 2.5
        elif w.endswith((".", "!", "?", "…")):
            base += 5
        ws.append(base)
    return ws


def main(project_path, outdir):
    from piper import PiperVoice, SynthesisConfig
    ensure_model()
    proj = json.load(open(project_path, encoding="utf-8"))
    os.makedirs(outdir, exist_ok=True)
    voice = PiperVoice.load(MODEL)
    cfg = SynthesisConfig(length_scale=proj.get("voiceSpeed", 1.0))

    chunks = [np.zeros(int(LEAD * SR_OUT), dtype=np.int16)]
    t = LEAD
    scenes = []
    for i, sc in enumerate(proj["scenes"]):
        text = sc["say"].strip()
        wav_path = os.path.join(outdir, f"scene_{i:02d}.wav")
        with wave.open(wav_path, "wb") as wf:
            voice.synthesize_wav(text, wf, cfg)
        with wave.open(wav_path, "rb") as wf:
            sr = wf.getframerate()
            data = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16)
        assert sr == SR_OUT, f"taxa inesperada {sr}"
        # apara silêncio das pontas
        nz = np.where(np.abs(data) > 300)[0]
        if len(nz):
            data = data[max(0, nz[0] - int(0.03 * sr)): nz[-1] + int(0.08 * sr)]
        dur = len(data) / sr
        words = text.split()
        w = word_weights(words)
        tot = sum(w)
        acc = 0.0
        wt = []
        for word, wi in zip(words, w):
            t0 = acc / tot * dur
            acc += wi
            t1 = acc / tot * dur
            wt.append({"w": word, "t0": round(t + t0, 3), "t1": round(t + t1, 3)})
        is_last = i == len(proj["scenes"]) - 1
        gap = TAIL if is_last else GAP
        scenes.append({"i": i, "start": round(t, 3), "audio_end": round(t + dur, 3),
                       "end": round(t + dur + gap, 3), "words": wt})
        chunks.append(data)
        chunks.append(np.zeros(int(gap * sr), dtype=np.int16))
        t += dur + gap
    full = np.concatenate(chunks)
    out = os.path.join(outdir, "voice_raw.wav")
    with wave.open(out, "wb") as wf:
        wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(SR_OUT)
        wf.writeframes(full.tobytes())
    json.dump({"duration": round(t, 3), "scenes": scenes}, open(os.path.join(outdir, "timings.json"), "w"),
              ensure_ascii=False, indent=1)
    print("ok: %.1fs, %d cenas" % (t, len(scenes)))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
