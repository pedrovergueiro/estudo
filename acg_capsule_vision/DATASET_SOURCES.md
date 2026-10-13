# Fontes de dados — investigação, licenças e limitações

Investigação feita em 2026-10-13 a partir deste ambiente. A rede desta sessão só alcança
GitHub e PyPI: sites institucionais (Chukyo, Sensum, Kaggle, MVTec) foram **bloqueados pela
política de saída** (HTTP 403 no proxy), o que **não** significa que estejam fora do ar.
Esses casos estão marcados como "não verificado aqui".

## Resumo da decisão

| # | Fonte | Download funcionou? | Licença | Conteúdo real | Tarefa | Usado? |
|---|---|---|---|---|---|---|
| 1 | Medicinal Capsule Image Dataset (Chukyo) | **Não verificado aqui** (host bloqueado) | não encontrada (fonte secundária: só pedido de citação) | cápsulas, Normal/Anomaly, 128×128 cinza (fonte secundária) | classificação / anomalia | Não |
| 2 | PillQC (MathWorks) | Sim (git, commit `9c0a8ec`) | **XSLA**: uso "solely for use in conjunction with MathWorks products" | **comprimidos** redondos: normal 149, dirt 138, chip 43 (225×225 RGB) | classificação | **Não** (licença) |
| 3 | Pill-Defects (PerceptiLabs) | Sim (git, commit `f2c0917`) | **nenhuma** (sem arquivo LICENSE; crédito a um dataset do Kaggle não verificável aqui) | **comprimidos** redondos, vista de topo: normal 140, defect 215 (512×512 cinza) | classificação | **Sim**, só pesquisa interna |
| 4 | CapsuleDet | Sim (git, commit `83ac074`) | Apache-2.0 (código) | **sem dados**: README diz "dataset and code will be coming soon"; contato por e-mail | detecção (declarada) | Não (indisponível) |
| 5 | SensumSODF (via felixpeters/capsule-inspection) | Repositório sim (commit `802750e`); dados **não** (host sensum.eu bloqueado; por solicitação segundo terceiros) | repositório sem licença; termos do dataset não encontrados | cápsulas e softgels, normal/anômalo com máscaras (fontes secundárias) | classificação / segmentação | Não |
| + | Medical Pills (Ultralytics) | Sim (`medical-pills.zip`, SHA-256 `3a15abc4…`) | **AGPL-3.0** (LICENSE.txt no arquivo) | 115 quadros 1920×1080 de **um vídeo** de blisters; 2022 caixas da classe `pill` | **detecção YOLO** | **Sim** |
| x | "Medical Supplements Capsule Defect Detection" (lonlonago, GitHub) | só 4 imagens de prévia | dados completos **vendidos** (US$ 89); classes idênticas às do MVTec AD *capsule* (CC BY-NC-SA) | — | detecção | **Não** (procedência/licença) |

**Conclusão:** nenhum dataset obtido aqui contém **cápsulas de gelatina com defeitos
anotados por caixa**. Por isso o projeto tem dois pipelines distintos e honestos:

1. **Detector YOLO11 de localização** (Medical Pills): encontra comprimidos/cápsulas em blister.
   Não detecta defeitos.
2. **Classificador YOLO11-cls normal × defeito** (Pill-Defects): rótulo por imagem, sem caixas,
   em **comprimidos**. Não é um detector e não foi convertido em um — rótulos de imagem não
   foram transformados em caixas.

Nenhum dado sintético foi usado em treino ou teste.

## Detalhes por fonte

### 1. Medicinal Capsule Image Dataset — Chukyo University
- URL: https://isl.sist.chukyo-u.ac.jp/archives/capsule_en/ — `CONNECT 403` neste ambiente;
  a ferramenta de busca também não resolveu o domínio.
- Informações **de terceiros** (repositório HUSNAIN-MUNAWAR/pharma-capsule-vision, `docs/dataset_provenance.md`):
  1.200 PNG (600 Normal, 600 Anomaly), 128×128 cinza; originais 1920×1080 coloridos recortados,
  convertidos para cinza e reduzidos; arquivo `wp-content/uploads/2025/12/datasets.zip`
  (10.294.710 bytes); a página pede citação e **não declara licença permissiva**.
- **Avaliação de adequação**: mesmo se obtido, 128×128 em cinza descarta a cor (manchas,
  descoloração) e reduz defeitos pequenos a poucos pixels; o rótulo é por imagem
  (Normal/Anomaly), adequado a **classificação/detecção de anomalias**, não a detecção com caixas.
  Converter "Anomaly" em caixa seria fabricar anotação.
- Para obter depois (com rede liberada e termos confirmados com a Chukyo):
  `curl -L -o data/raw/chukyo_capsules.zip https://isl.sist.chukyo-u.ac.jp/wp-content/uploads/2025/12/datasets.zip`
  e registrar o SHA-256 em `configs/resources.yaml`. O pipeline de classificação aceita a mesma
  estrutura (pastas por classe), mas o agrupamento por unidade física precisa ser reavaliado.

### 2. PillQC — github.com/matlab-deep-learning/pillQC
- Clonado (commit `9c0a8ecdca0a3797e784412de077a30ae2c50b3c`, 2022-01-18). 330 imagens 225×225 RGB
  (normal 149, dirt 138, chip 43) + 15 fotos de origem 4032×3024 + rede MATLAB treinada.
- Licença XSLA (MathWorks): BSD-like, **mas** a cláusula 3 restringe o uso "solely for use in
  conjunction with MathWorks products and service offerings". Treinar YOLO/PyTorch com esses dados
  não se enquadra ⇒ **não usado**.
- Conteúdo: comprimidos, não cápsulas. Referência do método: Liznerski et al., ICLR 2021 (FCDD).

### 3. Pill-Defects — github.com/PerceptiLabs/Pill-Defects
- Clonado (commit `f2c0917af6798564c936e2dccf8495320cec8e61`, 2021-07-21). Integridade fixada por
  SHA-256 de manifesto (`configs/resources.yaml`).
- 355 PNG 512×512 cinza (normal 140, defect 215); `data.csv` lista só 260.
- **Licença: ausente.** O README credita "kaggle.com/pudpawat/pill-defect-dataset" (Kaggle bloqueado
  aqui; licença não verificada). Sem licença, o padrão legal é "todos os direitos reservados":
  uso aqui restrito a **pesquisa interna**, sem redistribuir imagens nem pesos derivados.
- **Medição feita neste projeto**: quadros contíguos da mesma sessão (`pic.<sessão>.<quadro>`)
  diferem só por ruído (MAE ≤ 3,1 níveis de cinza ao primeiro quadro do bloco; entre blocos
  ≥ 3,3, mediana 9,1). São o **mesmo comprimido fotografado repetidamente**: 10 unidades físicas
  (2 normais com 96 e 44 quadros; 8 defeituosas com 16–60 quadros). Uma divisão aleatória por
  imagem colocaria o mesmo comprimido em treino e teste.
- Conteúdo: comprimidos redondos, não cápsulas. Defeitos visíveis: lascas/irregularidades na borda.

### 4. CapsuleDet — github.com/D-ai-Y/CapsuleDet
- Clonado (commit `83ac074a…`, 2022-08-14): apenas README e LICENSE (Apache-2.0). Dados e código
  "coming soon"; contato gs.hdong19@gzu.edu.cn. Referência: Dong, Yang, Wang & Li, *Surface quality
  automatic inspection for pharmaceutical capsules using deep learning*, Journal of Sensors, 2022.
- Ação sugerida: solicitar o dataset aos autores, com termos de uso por escrito.

### 5. SensumSODF — github.com/felixpeters/capsule-inspection
- O repositório (sem licença) é código de experimentos (ResNet18/UNet, fastai) e baixa os dados de
  `https://www.sensum.eu/resources/SensumSODF.7z` (bloqueado aqui). Pesos `.pth` estão em Git LFS
  (não baixados). Fontes secundárias: dataset de **cápsulas e softgels** com imagens normais e
  anômalas anotadas (máscaras), obtido por solicitação no site da Sensum; citação Rački et al., 2021.
- É o candidato mais próximo do objetivo (cápsulas reais, máscaras de defeito ⇒ caixas derivadas
  de máscaras seriam legítimas). Ação sugerida: solicitar acesso e termos de uso comercial à Sensum.

### Medical Pills (Ultralytics) — adicionado na investigação
- `https://github.com/ultralytics/assets/releases/download/v0.0.0/medical-pills.zip`, SHA-256
  `3a15abc491af0e91a835a01bca1e437e3818bf957aab26aba19176db6495ceb5`, licença AGPL-3.0.
- 115 quadros (índices 0–456, passo 4) de **um único vídeo**; 14–21 caixas por imagem.
- A divisão oficial (92 treino / 23 val) **intercala quadros vizinhos** (cada quadro de validação
  tem um de treino a 4 quadros). O projeto refaz a divisão em blocos temporais (treino quadros
  0–276, val 288–356, teste 368–456, com quadros descartados nas fronteiras). Vazamento residual:
  os mesmos blisters físicos aparecem em todos os blocos.

## Estratégia de não mistura

Os datasets têm tarefas e classes incompatíveis (`pill` com caixa × `normal/defect` por imagem ×
`normal/dirt/chip`). Nenhuma mistura foi feita. Uma futura combinação exigiria taxonomia comum
documentada e reavaliação por fonte.
