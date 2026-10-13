# Análise de licenças (não é parecer jurídico)

Antes de qualquer uso interno privado ou implantação comercial na ACG, esta análise precisa ser
revisada pelo jurídico. **Nada aqui autoriza uso comercial.**

| Componente | Licença | Fonte da informação | Consequência |
|---|---|---|---|
| Código deste projeto (`src/`, `scripts/`, `tests/`) | AGPL-3.0 (arquivo `LICENSE`) | escolha do projeto, para ser compatível com a Ultralytics que ele importa | distribuir o software, ou oferecê-lo por rede, obriga a disponibilizar o código-fonte sob AGPL |
| Implementação YOLO11 (pacote `ultralytics` 8.4.176) | AGPL-3.0, com licença **Enterprise** comercial oferecida pela Ultralytics | metadados do pacote (`License: AGPL-3.0`) e cabeçalhos do código | uso proprietário sem as obrigações AGPL exige licença Enterprise |
| Pesos `yolo11n.pt`, `yolo11s.pt` (COCO) | AGPL-3.0 (Ultralytics) | releases `ultralytics/assets v8.4.0` | idem; COCO tem imagens do Flickr com licenças variadas |
| Pesos `yolo11n-cls.pt` (ImageNet-1k) | AGPL-3.0 (Ultralytics) | idem | os termos do ImageNet restringem as **imagens** a pesquisa não comercial; o efeito sobre pesos derivados é juridicamente incerto |
| PyTorch 2.14.1 / torchvision 0.29.1 | BSD-3 e permissivas | metadados dos pacotes | sem restrição relevante |
| Dataset Medical Pills | AGPL-3.0 | `LICENSE.txt` dentro do zip | uso e modificação permitidos sob AGPL; redistribuição com a licença |
| Dataset Pill-Defects | **sem licença** | repositório sem LICENSE; origem Kaggle não verificada | "todos os direitos reservados" por padrão: só pesquisa interna; **não redistribuir** imagens nem pesos |
| Dataset PillQC | XSLA (MathWorks) | `LICENSE` do repositório | uso restrito a produtos MathWorks ⇒ **não usado** |
| Datasets Chukyo / SensumSODF / CapsuleDet | não verificada / por solicitação | ver DATASET_SOURCES.md | não usados |

## Pesos resultantes do treinamento

| Artefato | Herda | Situação |
|---|---|---|
| Detector ajustado (Medical Pills, a partir de `yolo11n.pt`/`yolo11s.pt`) | AGPL-3.0 dos pesos e do dataset | pode ser compartilhado sob AGPL-3.0; uso comercial sem obrigações AGPL exige licença Enterprise da Ultralytics |
| Classificador ajustado (Pill-Defects, a partir de `yolo11n-cls.pt`) | AGPL-3.0 + dataset **sem licença** + pré-treino ImageNet | **não liberado** para uso fora de pesquisa interna; não redistribuído neste repositório |

## Incompatibilidades potenciais a resolver antes de uso na ACG

1. AGPL-3.0 × software proprietário da máquina de inspeção → licença Enterprise ou arquitetura que
   isole o componente AGPL (avaliação jurídica).
2. Dataset sem licença (Pill-Defects) → substituir por dados próprios da ACG ou obter autorização escrita.
3. Pré-treino ImageNet (classificador) → avaliar alternativa com pesos de licença clara ou treino a partir de dados próprios.
4. Datasets por solicitação (SensumSODF, Chukyo, CapsuleDet) → obter termos de uso **comercial** por escrito antes de usar.
