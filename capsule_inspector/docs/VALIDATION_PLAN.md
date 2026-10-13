# Plano de validação antes do uso industrial

Este plano é um ponto de partida técnico. A qualificação para ambiente farmacêutico
regulamentado (ex.: GMP, validação de sistemas computadorizados, integridade de dados) deve ser
conduzida pela garantia da qualidade do usuário, com documentação e aprovações próprias. Nada
neste repositório constitui qualificação.

## 1. Especificação de requisitos do usuário (URS)

Defina por produto/perfil: defeitos a detectar (com tamanho mínimo em mm), criticidade, taxa de
escape máxima aceitável por classe crítica, taxa máxima de falsa rejeição, cadência (cápsulas/min),
latência máxima, tratamento de REVIEW (quem revisa, em quanto tempo) e destino de SYSTEM_ERROR.

## 2. Qualificação da estação (instalação/operação)

- Hardware identificado (modelo do Pi, câmera, lente, iluminação, fundo), fixações e distâncias.
- `scripts/system_report.py` arquivado; temperatura e throttling sob carga (`benchmark_model.py --duration 3600`).
- Repetibilidade da imagem: mesma cápsula N vezes ⇒ métricas de qualidade estáveis.
- Testes de falha: desconectar câmera, encher disco, remover modelo, corromper SHA-256 ⇒ SYSTEM_ERROR
  (os testes automatizados cobrem a lógica; repita no equipamento).

## 3. Conjunto de validação

- Imagens **reais** da linha, de unidades físicas, lotes e sessões **não usados no treino**
  (use `holdout_lots`).
- Defeitos reais (ou produzidos de forma controlada e documentada) por classe, cobrindo o tamanho
  mínimo especificado. Ordem de grandeza: para demonstrar recall ≥ 99% com confiança de 95%,
  são necessários ~300 defeitos detectados sem nenhuma falha (regra de três: 3/n).
- Estratos obrigatórios: acabamento (opaco/translúcido/transparente), cores, lotes, iluminação.
  Estratos sem dados suficientes ficam `NOT_VALIDATED` e o produto correspondente não é liberado.
- Verdade de referência: inspeção humana qualificada (duplo cego quando possível).

## 4. Critérios de aceitação (exemplos a definir na URS)

| Métrica | Critério |
|---|---|
| Recall por classe crítica (teste, limiar de revisão) | ≥ alvo da URS, com intervalo de confiança |
| Taxa de escape (unidade defeituosa → PASS) | ≤ alvo, em cada estrato |
| Falsa rejeição | ≤ alvo |
| Recall de defeitos pequenos | sem queda > tolerância vs. referência (FP32/PyTorch) |
| Latência p95 captura→resultado no Pi | ≤ requisito de cadência |
| Estabilidade (8 h contínuas) | zero travamentos; nenhum SYSTEM_ERROR não explicado; sem throttling |

## 5. Execução

1. `evaluate_model.py --split test` com o artefato exato que irá para produção (SHA-256 no relatório).
2. `benchmark_model.py --eval-split test` para FP32 × INT8 × resoluções no Pi.
3. Teste de desafio: lote de cápsulas conhecidas (boas e defeituosas) passando pela estação real,
   resultado comparado à referência.
4. Revisão dos FP/FN (galerias do relatório) e análise de causa.
5. Aprovação registrada: `manage_models.py approve --by ... --report ...` e marcação `validated: true`
   no perfil e nas classes, com nova versão de configuração.

## 6. Controle de mudanças

Qualquer mudança em modelo, taxonomia, limiares, perfil, câmera ou iluminação gera nova versão
e exige reavaliação proporcional (no mínimo regressão no conjunto de teste congelado).
`CHANGELOG.md` registra as mudanças de software; o registro de modelos registra aprovações.

## 7. Operação

- Revisão manual de todo REVIEW (interface: filtro "sem revisão"); as revisões ficam registradas
  sem alterar o resultado original da máquina.
- Monitorar tendência de REVIEW/FAIL por lote; desvio súbito indica mudança de processo ou de
  aquisição (deriva) e deve disparar investigação.
- Separar ambiente experimental (`deployment_mode: experimental`, registro `models/registry_*`
  de testes) do de produção.
