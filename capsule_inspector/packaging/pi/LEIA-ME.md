# Capsule Inspector — pacote para Raspberry Pi

Analisa imagens de uma **pasta** ou da **câmera** (USB ou câmera oficial do Pi) e mostra os
resultados numa **interface web**. Funciona **sem internet**: tudo o que precisa está aqui.

> **Modelo demonstrativo.** Foi treinado só com dados públicos (comprimidos em blister,
> dataset Medical Pills, AGPL-3.0). Ele **localiza e conta** comprimidos/cápsulas; **não detecta
> defeitos** e não está validado para uso industrial. Por isso os resultados aparecem como
> REVIEW (nunca "aprovado"). Para inspeção real é preciso treinar com imagens da sua linha.

## Requisitos

- Raspberry Pi com **sistema de 64 bits**: Pi 3B/3B+, Pi 4, Pi 400, Pi 5, Zero 2 W, CM4/CM5.
  (Pi 1, Pi 2, Zero/Zero W **não** servem.)
- **Raspberry Pi OS (64-bit)** — Bookworm (Python 3.11) ou Trixie (Python 3.13); o instalador detecta sozinho.
  Se o Pi estiver com o sistema de 32 bits, o instalador avisa; regrave o cartão com o
  Raspberry Pi Imager escolhendo "Raspberry Pi OS (64-bit)".
- ~1 GB de RAM livre e 2 GB de disco.
- Câmera USB (UVC, a maioria das webcams) ou câmera CSI oficial (Camera Module). Opcional para
  analisar pastas.

## Instalar

Copie o arquivo `.tar.gz` para o Pi (pendrive, `scp`, etc.) e, num terminal do Pi:

```bash
tar -xzf capsule-inspector-pi-*.tar.gz
cd capsule-inspector-pi-*/
./instalar.sh                 # instala em ~/capsule-inspector e roda o autoteste
```

Para iniciar sozinho ao ligar o Pi (câmera + interface na rede local): `./instalar.sh --servico`.

## Usar

```bash
capsule-inspector diagnostico               # mostra modelo do Pi, câmeras encontradas, temperatura
capsule-inspector pasta ~/imagens           # analisa todas as imagens da pasta
capsule-inspector camera                    # inspeção contínua (USB se houver; senão CSI)
capsule-inspector camera --fonte csi        # força a câmera oficial do Pi
capsule-inspector camera --fonte usb --dispositivo /dev/video0
capsule-inspector interface                 # interface em http://127.0.0.1:8080 (no próprio Pi)
capsule-inspector iniciar                   # câmera + interface juntos
capsule-inspector iniciar --rede            # interface acessível de outro computador (link com token)
capsule-inspector exportar --formato csv --saida resultados.csv
```

Se o comando `capsule-inspector` não for encontrado logo após instalar, abra um novo terminal
(ou use `~/capsule-inspector/bin/capsule-inspector`).

Na interface: imagem original e anotada, unidades encontradas com confiança, estado, horário,
lote, tempo de processamento, estado da câmera e do modelo, histórico, revisão manual e exportação.

## Onde ficam os resultados

`~/capsule-inspector/app/var/` — banco `inspections.sqlite3`, imagens em `images/`, logs em `logs/`.
Imagens antigas são apagadas automaticamente (até 4 GB). Reinstalar mantém os resultados.

## Problemas comuns

| Mensagem | O que fazer |
|---|---|
| "sistema de 32 bits" | regravar o cartão com Raspberry Pi OS (64-bit) |
| "nenhuma câmera encontrada" | `capsule-inspector diagnostico`; conferir cabo; câmera CSI: `rpicam-hello --list-cameras` |
| câmera USB não abre | `sudo usermod -aG video $USER` e reiniciar o Pi |
| interface não abre em outro PC | usar `--rede` e o link com `?token=` impresso no terminal; mesma rede local |
| lento / quente | `capsule-inspector diagnostico` mostra temperatura e throttling; use dissipador e fonte oficial |

Desinstalar: `./desinstalar.sh` (ou `--manter-resultados`).

## Conteúdo e licenças

- `app/` — software Capsule Inspector (AGPL-3.0, arquivo `LICENSE`).
- `app/models/bundle/` — detector YOLO11n ajustado no Medical Pills (AGPL-3.0; pesos e dados
  Ultralytics). Uso comercial sem as obrigações da AGPL exige licença Enterprise da Ultralytics.
- `app/exemplos/` — 5 imagens do teste do Medical Pills (AGPL-3.0) para o autoteste.
- `rodas/` — dependências (numpy, OpenCV, ONNX Runtime, FastAPI…), licenças permissivas (BSD/MIT/Apache).
- `SHA256SUMS` — o instalador confere a integridade de todos os arquivos.
