#!/usr/bin/env python3
"""Confere se a narração do projeto (campos "say") bate com o roteiro do dia em roteiros.md.
Uso: python3 check.py projects/2026-11-27-xxx.json   -> imprime OK ou as diferenças (exit 1)"""
import json, re, sys, os

def norm(s): return re.sub(r"\s+", " ", s).strip()

def roteiro_paragraphs(dd_mm):
    txt = open(os.path.join(os.path.dirname(__file__), "roteiros.md"), encoding="utf-8").read()
    secs = re.split(r"\n(?=# \d\d/\d\d — )", txt)
    for sec in secs:
        if sec.startswith(f"# {dd_mm} —"):
            m = re.search(r"### ROTEIRO\n(.*?)(?=\n### LEGENDA)", sec, re.S)
            body = m.group(1)
            paras = [norm(p) for p in body.split("\n") if p.strip() and not re.fullmatch(r"\*\*(GANCHO|DESENVOLVIMENTO|FECHAMENTO)\*\*", p.strip())]
            leg = re.search(r"### LEGENDA\n+(.*?)\n", sec, re.S)
            return paras, norm(leg.group(1)) if leg else ""
    sys.exit(f"seção {dd_mm} não encontrada em roteiros.md")

p = json.load(open(sys.argv[1], encoding="utf-8"))
ymd = re.search(r"(\d{4})-(\d\d)-(\d\d)", os.path.basename(sys.argv[1]))
dd_mm = f"{ymd.group(3)}/{ymd.group(2)}"
paras, legenda1 = roteiro_paragraphs(dd_mm)
says = [norm(s["say"]) for s in p["scenes"]]
joined = " ".join(says)
bad = [x for x in paras if x not in joined]
# a última cena pode ser a pergunta final (tem "big"); as demais devem sair do roteiro
extra = []
for i, s in enumerate(says):
    if i == len(says) - 1 and p["scenes"][i].get("big"): continue
    if s not in " ".join(paras): extra.append(s)
if bad or extra:
    print("DIFERENÇAS ENTRE ROTEIRO E PROJETO")
    for x in bad: print("  falta no vídeo:", x[:110])
    for x in extra: print("  não está no roteiro:", x[:110])
    sys.exit(1)
print("OK: narração idêntica ao roteiro de", dd_mm, "| pergunta da legenda:", legenda1[:90])
