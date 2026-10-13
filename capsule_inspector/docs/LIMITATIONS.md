# Limitações conhecidas

## Do estado atual da entrega

1. **Sem pesos treinados com cápsulas reais.** O pipeline de treino foi executado apenas com dados
   sintéticos. Os pesos de produção precisam ser produzidos e validados com imagens da linha.
2. **Sem execução em Raspberry Pi.** Desempenho embarcado (latência, FPS, RAM, temperatura,
   throttling) **não foi medido**; os números em BENCHMARKS.md são de x86_64. Compatibilidade das
   rodas aarch64 foi verificada por download, e o runtime foi testado em Python 3.11 sem PyTorch,
   mas não em ARM.
3. **Sem dados públicos reais avaliados.** As fontes listadas exigem solicitação ou aceite de
   licença; nenhuma foi baixada. Por isso não há exemplos de resultados com cápsulas reais.
4. **Câmeras não testadas**: as classes de captura USB (V4L2) e libcamera foram testadas apenas nos
   caminhos de erro (dispositivo ausente, Picamera2 ausente). A leitura de quadros reais precisa
   ser verificada com o hardware escolhido.
5. **GPIO não testado**: gatilho por sensor e atuador de rejeição foram implementados com
   `gpiozero`, mas não executados em hardware. O atuador está desabilitado e exige
   `interlock_validated: true`.
6. **Controle de iluminação**: só existe a interface e uma implementação nula.
7. **Picamera2 + numpy 2 no Bookworm**: possível incompatibilidade binária (ver TROUBLESHOOTING).

## Técnicas

1. **RGB tem limites físicos**: não detecta contaminação microbiológica, composição química,
   dosagem, nem defeitos não visíveis com a iluminação disponível.
2. **Transparentes**: defeitos em gelatina transparente podem ser visíveis só em certas
   iluminações; o ganho de múltiplas vistas e da fusão precisa ser demonstrado com dados reais.
3. **Modo C (PatchCore-lite)**: extrator padrão é heurístico (cor, gradiente, textura); é menos
   discriminativo que backbones CNN pré-treinados. O escore é por patch sem alinhamento fino:
   variações normais grandes (impressão, posição) aumentam falso alarme.
4. **ROI clássico** pressupõe fundo uniforme e cápsulas separadas; cápsulas encostadas viram uma
   região só (o motor de decisão manda para REVIEW pela contagem).
5. **INT8**: só Conv é quantizado e a DFL é excluída; a perda de precisão depende do modelo e da
   calibração e deve ser medida. Em x86, o ganho de latência pode não se repetir em ARM.
6. **Quase-duplicatas**: o limiar de correlação de miniaturas (0,995) foi calibrado em dados
   sintéticos; em estação fixa cápsulas diferentes são muito parecidas — recalibre e trate o
   `metadata.csv` (unit_id) como proteção principal contra vazamento.
7. **Estratos**: mínimo de 30 imagens / 10 defeitos por estrato é um piso operacional, não um
   cálculo estatístico de poder; defina na URS.
8. **Métricas próprias** seguem as convenções COCO (AP de 101 pontos); valores podem diferir
   ligeiramente dos impressos pela Ultralytics.
9. **Throughput**: o laço é sequencial (captura → resultado). Para cadências altas pode ser
   necessário paralelizar captura e inferência; medir antes.
10. **Licença AGPL-3.0** da Ultralytics afeta distribuição; ver LICENSES.md.
