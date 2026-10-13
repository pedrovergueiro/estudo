# Model card — ACG Capsule Vision AI (protótipo, dados públicos)

**Etiqueta de proveniência gravada em toda saída:** `trained-on-public-data-only; not-validated-for-ACG`.
Números completos e reprodutíveis: [reports/REPORT.md](reports/REPORT.md) (gerado de JSONs medidos).

## Modelo 1 — Detector de localização (`models/released/detect_yolo11n_medical_pills.pt`)

| Item | Valor |
|---|---|
| Tarefa | detecção, 1 classe `pill` (localiza comprimidos em blister). **Não detecta defeitos.** |
| Arquitetura | YOLO11n (Ultralytics 8.4.176), 2,6 M parâmetros |
| Pesos iniciais | `yolo11n.pt` COCO, SHA-256 `0ebbc80d…44ee1` |
| Dados | Medical Pills (Ultralytics, AGPL-3.0): 70 quadros de treino, 18 de validação, 23 de teste, em blocos temporais de um único vídeo |
| Treino | CPU (4 vCPU Xeon, compartilhada com outro treino), imgsz 640, 40 épocas, batch 8, seed 0, ≈ 37,5 min |
| Seleção | `best.pt` = maior fitness na validação; teste usado só para relatório |
| SHA-256 do `best.pt` | `d3380aa09173a24581d4511d9d09adba2281697fd74dd86ffb6bcf1d0a2fa1db` |
| Teste — Etapa A (COCO, class-agnóstico, conf 0,25) | precisão 0,763 · recall 0,247 · F1 0,373 (rotula os comprimidos como "cup") |
| Teste — Etapa B | mAP50 0,995 · mAP50-95 0,789 · P 0,993 · R 0,989 (curva); conf 0,25: 405/405 caixas encontradas, 14 FP |
| Licença | AGPL-3.0 (pesos e dados AGPL); uso comercial sem obrigações AGPL exige licença Enterprise |

Os FP do pior quadro são comprimidos parcialmente ocultos/na borda, aparentemente não anotados:
parte do "erro" pode ser anotação incompleta.

## Modelo 2 — Classificador normal × defeito (não publicado)

| Item | Valor |
|---|---|
| Tarefa | classificação por imagem (sem caixas). **Não é detector de defeitos.** |
| Arquitetura | YOLO11n-cls, 1,5 M parâmetros com a cabeça de 2 classes; pesos iniciais `yolo11n-cls.pt` ImageNet (SHA-256 `c62d41bf…bd7`) |
| Dados | Pill-Defects: 355 imagens 512×512 cinza de **10 comprimidos físicos** (2 normais, 8 defeituosos); licença ausente |
| Avaliação | 10 dobras deixando uma unidade física de fora (LOUO); validação = quadros finais das unidades de treino (otimista, só para early stopping) |
| Treino por dobra | CPU, imgsz 224, 15 épocas, batch 16, ≈ 3 min; total ≈ 32 min |
| Etapa A | ImageNet: todas as 355 imagens → "frying_pan"; classe majoritária: acurácia 0,606, recall normal 0 |
| Etapa B (teste LOUO, imagens de todas as dobras) | acurácia 0,730 · acurácia balanceada 0,657 · defeito: P 0,691 R 1,000 F1 0,817 · normal: P 1,000 R 0,314 F1 0,478 |
| Por unidade | **9 de 10** unidades corretas por voto majoritário; o comprimido normal da sessão 6, testado com o modelo que só viu o normal da sessão 7, teve 0/96 quadros corretos |
| Licença | não liberado: dataset sem licença + pré-treino ImageNet |

Com 2 unidades normais, o erro observado mostra exatamente o risco: o modelo aprende "o
comprimido normal que conhece", não "normalidade". As métricas não sustentam nenhuma estimativa
de desempenho real.

O modelo final (treinado com as 10 unidades, `runs/classify/final_cpu_conservative`) não tem
teste independente; serve apenas para demonstrar inferência e a fusão multivista.

## Uso previsto

Prova de conceito do pipeline (aquisição local → inferência offline → relatório por vista →
fusão) e linha de base para quando houver dados reais da ACG. **Fora do escopo**: liberar ou
rejeitar produto, qualquer decisão de qualidade.

## Representado × não comprovado

| Representado nos dados | Não comprovado |
|---|---|
| comprimidos redondos amarelados em blister, fundo claro, um único vídeo (detector) | cápsulas de gelatina de qualquer cor |
| comprimidos redondos, vista de topo, cinza, fundo preto, lascas na borda (classificador) | cápsulas transparentes e translúcidas |
| iluminação de cada fonte, constante | iluminação industrial da ACG |
| uma câmera por dataset | as três vistas da máquina da ACG |
| — | defeitos microscópicos, fissuras, furos, encaixe corpo/tampa |
| — | taxa de produção industrial; desempenho em Raspberry Pi |

Nenhum aumento de dados foi usado para afirmar que o modelo aprendeu característica não validada,
e nenhum dado sintético entrou em treino ou teste.

## Modelo 3 — YOLO11s (comparação de capacidade, não publicado)

Mesmo perfil e mesmo teste do Modelo 1. Pesos iniciais `yolo11s.pt` (SHA-256 `85a76fe8…02d5`),
9,4 M parâmetros; `best.pt` SHA-256 `1b9c064a5dbb06f844a34206851882b720f34192b2efcccfdd9489e9591ca076`.

| Teste | YOLO11n | YOLO11s |
|---|---:|---:|
| Etapa A (COCO, class-agnóstico): recall | 0,247 | 0,528 |
| Etapa B: mAP50 / mAP50-95 | 0,995 / 0,789 | 0,995 / 0,791 |
| Etapa B, conf 0,25: TP / FP / FN | 405 / 14 / 0 | 405 / 12 / 0 |
| Latência p50 nesta máquina (CPU x86, imgsz 640) | 61 ms | 139 ms |

Neste teste o modelo maior não trouxe ganho relevante e custa ~2,3× a latência; o YOLO11n é o
publicado. Com dados reais (defeitos pequenos) a comparação precisa ser refeita.
