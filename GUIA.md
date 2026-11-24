# Catolicismo Explicado — guia do motor e da tarefa noturna

Perfil: **@catolicismoexplica** (o card com o @ já é desenhado pelo motor em todo vídeo, no pé do quadro).
Formato: 1080x1920, 30 fps, MP4 com voz masculina (Piper `pt_BR-faber`), legenda palavra por palavra (Poppins Bold).

## Comandos

```
./stills.sh projects/<id>.json   # folha de contato com 1 quadro por cena -> work/<id>/sheet.jpg (olhe a imagem!)
./make.sh   projects/<id>.json   # vídeo completo -> work/<id>/<id>.mp4  (~10 min para 70 s de vídeo)
```
Primeira execução instala `three` (npm) e `piper-tts` (pip) sozinha. A voz (63 MB) é baixada do Hugging Face.

## Procedimento da tarefa noturna (rodando às 3h, vídeo sai às 8h)

1. `git clone` este repositório (ou `git pull`). Cada vídeo é `projects/AAAA-MM-DD-slug.json`.
2. O roteiro de cada dia está em **`roteiros.md`** (seção `# DD/MM — TÍTULO`; só o bloco `### ROTEIRO` é narrado; a `### LEGENDA` é o texto do post). Se `projects/<id>.json` **existe**, use-o. Se **não existe**, crie-o a partir do roteiro, seguindo as regras abaixo. Em qualquer caso rode `python3 check.py projects/<id>.json`: ele garante que a narração é idêntica ao roteiro (se a Giovana editou o roteiro, refaça as cenas alteradas até dar OK).
3. **Confira o conteúdo** do roteiro (doutrina e liturgia católicas). Se algo estiver impreciso, **não altere o texto**: gere o vídeo mesmo assim e avise a Giovana na mensagem final, dizendo o trecho e o motivo.
4. Rode `./stills.sh`, **abra `work/<id>/sheet.jpg` com a ferramenta Read** e corrija qualquer cena com: personagem cortado ou fora de quadro, personagem sobre outro, objeto invisível, cena escura demais, título/legenda cobrindo o rosto. Refaça até a folha ficar limpa (máx. 3 rodadas).
5. Rode `./make.sh`, confira com `ffprobe` (1080x1920, 30 fps, duração ≈ a do `timings.json`) e envie o MP4 com `SendUserFile` (status proactive) + notificação push.
6. Mensagem final curta: nome do vídeo, duração, e qualquer aviso (ex.: "revise o trecho X").
7. Nunca poste nada em redes sociais. A entrega é só o arquivo para a Giovana.

## Formato do projeto (JSON)

```json
{ "id": "2026-11-25-sao-tarcisio", "title": "Quem foi São Tarcísio?",
  "cast": { "padre": {"kind":"padre","vestment":"#b3262d"}, ... },
  "scenes": [ { "say":"frase narrada", "set":"igreja", "tag":"etiqueta curta",
                "speaker":"padre", "chars":[...], "props":[...], "cam":{...}, "big":"texto grande opcional" } ] }
```
- **Uma cena por frase ou ideia** (1 a 2 frases). `say` é exatamente o texto narrado (e a legenda). Escreva números como se fala se a voz errar ("terceiro", "mil e quinhentos").
- Cena 0: o `title` aparece grande automaticamente. **Última cena**: padre de frente, `pose:"wave"`, `big` = pergunta final (a mesma frase está em `say`).
- `tag`: etiqueta laranja no topo (ex.: "Roma · século III"). Primeira cena: "Catolicismo Explicado".
- O texto de **LEGENDA/Fontes** do roteiro **não** entra no vídeo (é a legenda do post). A pergunta final vem do início da legenda quando for pergunta; se não for, escreva uma pergunta curta de engajamento ligada ao tema.

## Elenco (`cast`) — `kind` e opções

kinds: `man woman boy girl padre bispo coroinha jesuita monge jesus maria jose anjo pastor mago herodes soldado romano cristao joao santo indigena`.
Opções: `skin hair hairStyle(short|long|bald|bun) beard top bottom tunic mantle veil vestment hat(mitre|crown|helmet|turban|hood|solideo) halo wings staff scale skirt short armor tilma collar cord`.
- Padre: `"kind":"padre","vestment":COR` — **verde** Tempo Comum, **roxo** `#7b2d8e` Advento/Quaresma, **branco** `#f4f1ea` Natal/solenidades de Nossa Senhora, **vermelho** `#b3262d` mártires/Espírito Santo, **rosa** `#e58aa8` só 3º dom. do Advento.
- Santos e Maria/Jesus: `halo` já vem nos kinds `santo`, `jesus`, `maria`, `anjo`.
- Varie `skin` (`#f3c9a0 #e8b48a #c98f62 #a86b45 #7a4a2c`) e `hair` (`#2b1d12 #4a2f1b #7a5230 #c9a15a #161616 #8c8c8c`) entre personagens.

## Cenas de um quadro (`chars`)

`{"id":"padre","pos":[x,z],"rot":graus,"pose":"talk2","move":{"to":[x,z],"at":[0,1]},"mute":true}`
- x lateral (câmera olha para -z; personagens viram para a câmera com `rot:0`); z profundidade (0 = perto da câmera). `rot:-80` vira para a esquerda, `80` para a direita.
- **Só quem fala mexe a boca**: `speaker` (padrão: 1º da lista); os demais `"mute":true`.
- poses: `idle talk talk2 wave pray kneel point hold carry offer bless cheer amazed think bow sit lie fall walk run carrywalk`.
  `hold/carry` = braços à frente (objeto com `attach.at:"chest"`); `offer` = braços para cima (objeto na mão `R`); `fall` = cai durante a cena.

## Objetos (`props`)

`{"type":"ciborium","pos":[x,y,z]}` solto, ou na mão/peito: `{"type":"chalice","attach":{"id":"padre","at":"R"}}` (`R`, `L`, `chest`, `head`), `off:[x,y,z]`, `rot:[gx,gy,gz]` em graus, `scale`, `anim:"float|spin|flap|fly"`.
tipos: `candle candles chalice ciborium host cross crossgold book bible scroll torch star crown_advent(lit:1-4) manger bag stone sword spear shield rose roses dove cloud globe boat sheep tree palm tomb bread fish bench table throne bishopstaff water rosary sign(text)`.

## Cenários (`set`)

`igreja catacumba(cripta, necropole) roma prisao deserto(rio) noite_belem casa colina mar(praia) ceu estudio biblioteca`.
Igreja: altar com cruz ao fundo (z≈-8), tapete vermelho no centro, bancos. Use `ceu` para santos/glória, `estudio` para explicações neutras (sacramentos, listas), `colina` Guadalupe, `deserto` João Batista, `noite_belem` Natal.

## Câmera (`cam`)

O formato vertical é **estreito**: a 6 m de distância cabem só ~2,9 m de largura. Regras que funcionam:
- Mantenha os personagens de uma cena **num raio de ±1,2 m** do centro (no máx. 3 pessoas). Personagem fora da faixa fica fora do quadro.
- Um personagem: `{"frame":"medium"}` (cintura para cima, dist≈3,5) ou `{"frame":"full","dist":5}` (corpo inteiro).
- Dois ou três: `{"frame":"full","dist":6.2,"focus":[cx,0,0],"lookY":1.2,"h":1.6}`.
- Câmera sempre com movimento leve: `"move":{"dist":-0.6}` (aproxima), `{"ang":10}` (gira), `{"h":0.5}`.
- **Cena 0 e cena final**: título/pergunta ocupam o terço de cima; use `{"frame":"full","dist":5.6,"lookY":1.85,"h":1.6}` para o personagem ficar abaixo do texto.
- Legenda fica em y≈1330 px, card @ no pé do quadro (y≈1820); tag e título no topo. Não precisa tirar nada da frente da interface do Instagram.

## Lições já aprendidas

- Olhos escondidos? era cabelo; já corrigido. Objeto sumido na mão? use `attach` (o motor já mantém o objeto em pé).
- Cena escura: `catacumba` e `prisao` já foram clareadas; se ainda ficar escura, aproxime a câmera.
- Violência: sempre suave (queda, recuo, sem sangue ou armas em ação).
- Roteiros longos (> 75 s de narração) ainda cabem no Reels (limite 90 s). Se passar de 85 s, avise a Giovana.
