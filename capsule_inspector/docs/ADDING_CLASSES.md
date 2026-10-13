# Inclusão de novas classes e novos produtos

## Nova classe de defeito

1. **Verifique a observabilidade**: o defeito é visível nas imagens da estação? Com qual
   iluminação? Se não for, não crie a classe — veja CAMERA_AND_LIGHTING.md.
2. **Taxonomia** (`configs/taxonomy.yaml`): adicione a entrada

   ```yaml
   - key: bubble
     role: defect
     display_name: "Bolha"
     enabled: true
     severity: major          # none | minor | major | critical
     validated: false         # só vira true após avaliação independente
     aliases: [bubble, air_bubble]
     requires_acquisition: [backlight]
   ```

   A ordem das classes habilitadas define os IDs YOLO. **Acrescente no final** das classes de
   detector para preservar os IDs existentes e incremente `taxonomy_version` (ex.: 0.1.0 → 0.2.0).
3. **Regras** (`configs/decision_rules.yaml`): adicione `class_thresholds.bubble` (inicial) e
   incremente `rules_version`.
4. **Dados**: anote exemplos (mín. configurado em `min_instances_per_enabled_class`, padrão 30 —
   para validação, bem mais), em várias unidades físicas, lotes e sessões. Inclua negativos
   difíceis (reflexos parecidos com a nova classe).
5. `python scripts/validate_dataset.py --split` — confirme distribuição e ausência de vazamento.
6. Re-treine (as cabeças de classe mudam), avalie, calibre (`--calibrate` em `val`), avalie no teste.
7. Se recall/precisão por classe e por estrato atenderem aos critérios do plano de validação,
   marque `validated: true` (nova versão da taxonomia) e registre a evidência.
8. Exporte, registre, aprove (regressão contra o modelo atual) e ative.

O carregador recusa modelos cujas classes não coincidem com a taxonomia habilitada, então um
modelo antigo não roda silenciosamente com uma taxonomia nova.

## Desabilitar ou renomear

- **Desabilitar** (`enabled: false`): muda os IDs ⇒ re-treino obrigatório.
- **Renomear para exibição**: altere `display_name` (sem re-treino).
- **Renomear a chave**: mova a chave antiga para `aliases` da nova, re-treine e incremente versão.

## Novo produto / cor / acabamento

1. Crie um perfil em `configs/lighting_profiles.yaml` (família, cor, acabamento, geometria,
   etapas de aquisição com `kind`, fusão, pré-processamento), `validated: false`.
2. Adquira dados com esse perfil (`profile` no `metadata.csv`).
3. Se o pré-processamento mudar, aplique o mesmo ao dataset de treino:
   `python scripts/preprocess_dataset.py --src ... --dst ... --profile <nome>`.
4. Avalie com o estrato `profile`/`finish`/`color`. Só marque `validated: true` com dados suficientes.
5. Ative o perfil em `configs/inference.yaml` (`profile:`).
