import { Exercise } from '@/types/exercise';

export const centroExercises: Exercise[] = [
  {
    id: 'pcen-01',
    topicId: 'pe-centro',
    kind: 'numeric',
    prompt:
      'Vida útil de 10 baterias, em horas: 123, 116, 122, 110, 175, 126, 125, 111, 118, 117. Calcule a média amostral.',
    answer: 124.3,
    hints: [
      'Média é a soma de todos dividida pela quantidade.',
      'A soma dá 1243. Agora divida por 10.',
    ],
    solution:
      'x̄ = 1243 / 10 = 124,3 h. ' +
      'Guarde esse valor para comparar com a mediana no próximo exercício — a diferença entre os dois é ' +
      'justamente o que o item (b) do Exercício 1.13 quer que você explique.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pcen-02',
    topicId: 'pe-centro',
    kind: 'numeric',
    prompt: 'Com os mesmos dados das baterias, calcule a mediana amostral.',
    answer: 120,
    hints: [
      'Ordene os dados primeiro. Sem ordenar, não existe mediana.',
      'Ordenados: 110, 111, 116, 117, 118, 122, 123, 125, 126, 175. Como n = 10 é par, some os dois centrais e divida por 2.',
      'Os dois centrais são o 5º e o 6º: 118 e 122.',
    ],
    solution:
      'Ordenando: 110 111 116 117 118 | 122 123 125 126 175. Com n par, a mediana é a média dos dois ' +
      'centrais: (118 + 122)/2 = 120,0 h. ' +
      'Compare com a média de 124,3 h: a mediana é 4,3 h menor. Nove das dez baterias duram entre 110 e ' +
      '126 h — a mediana descreve bem esse grupo, e a média não.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pcen-03',
    topicId: 'pe-centro',
    kind: 'numeric',
    prompt:
      'Reduções de colesterol no grupo de controle: 7, 3, −4, 14, 2, 5, 22, −7, 9, 5. Calcule a média aparada de 10%.',
    answer: 5.125,
    hints: [
      'Ordene os dados. Aparar 10% com n = 10 significa descartar 1 valor de cada ponta.',
      'Ordenados: −7, −4, 2, 3, 5, 5, 7, 9, 14, 22. Descarte o −7 e o 22.',
      'Sobram 8 valores: −4, 2, 3, 5, 5, 7, 9, 14. Some e divida por 8.',
    ],
    solution:
      'Ordenando: −7 | −4 2 3 5 5 7 9 14 | 22. Aparar 10% de n = 10 descarta um valor de cada extremo. ' +
      'Sobram oito: −4 + 2 + 3 + 5 + 5 + 7 + 9 + 14 = 41, e 41/8 = 5,125. ' +
      'A média comum é 5,60 e a mediana é 5,00 — a aparada fica entre as duas, como esperado: ela é mais ' +
      'robusta que a média e usa mais informação que a mediana.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pcen-04',
    topicId: 'pe-centro',
    kind: 'choice',
    prompt:
      'No Exercício 1.5, a média do grupo de tratamento (7,6) é maior que a do controle (5,6), mas a mediana é MENOR (4,5 contra 5,0). Qual a conclusão correta?',
    options: [
      'O tratamento funciona: a média é a medida mais confiável',
      'Não há evidência de efeito: a vantagem da média vem de um único paciente que reduziu 37',
      'Os dados estão errados, porque média e mediana deveriam concordar',
      'O controle funciona melhor, porque tem a maior mediana',
    ],
    answer: 1,
    hints: [
      'Olhe os dados do tratamento: −6, 5, 9, 4, 4, 12, 5, 3, 3 e um valor de 37. O que o 37 faz com a média?',
      'Calcule a média do tratamento SEM o 37: (76 − 37)/9 = 4,33 — abaixo do controle.',
    ],
    solution:
      'A vantagem inteira da média vem do paciente que reduziu 37. Sem ele, a média do tratamento cai para ' +
      '4,33, ABAIXO do controle. ' +
      'A mediana (4,5 vs 5,0) e a média aparada (5,625 vs 5,125) mostram os grupos praticamente empatados, ' +
      'porque essas medidas são resistentes a valores extremos. ' +
      'A conclusão honesta é que não há evidência de que o regime funcione — existe um caso isolado de ' +
      'resposta grande, que a média transforma em falsa impressão de efeito geral. ' +
      'E média e mediana discordarem não indica erro nos dados: indica assimetria ou outlier.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pcen-05',
    topicId: 'pe-centro',
    kind: 'numeric',
    prompt: 'Notas de uma turma pequena: 6, 7, 8, 8, 9, 8, 10, 7. Qual é a moda?',
    answer: 8,
    hints: [
      'A moda é o valor que mais se repete — não precisa ordenar nem somar nada.',
      'Conte quantas vezes cada nota aparece: 6 aparece 1 vez, 7 aparece 2 vezes, 8 aparece 3 vezes, 9 aparece 1 vez, 10 aparece 1 vez.',
    ],
    solution:
      'A nota 8 aparece três vezes — mais que qualquer outra. Moda = 8. ' +
      'Diferente da média e da mediana, a moda não usa nenhuma conta: só contagem de repetições. ' +
      'É também a única medida de centro que funciona em dados qualitativos, como "cor preferida" ou ' +
      '"curso mais escolhido".',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pcen-06',
    topicId: 'pe-centro',
    kind: 'choice',
    prompt: 'Um conjunto de dados é: 3, 5, 5, 7, 7, 9. O que se pode dizer sobre a moda?',
    options: [
      'A moda é 6, a média dos valores repetidos',
      'O conjunto é bimodal: 5 e 7 empatam como valores mais frequentes',
      'Não existe moda, porque há dois candidatos',
      'A moda é 5, porque aparece primeiro',
    ],
    answer: 1,
    hints: [
      'Conte as repetições: 5 aparece 2 vezes, 7 aparece 2 vezes — empate no topo.',
      'Quando dois valores empatam na maior frequência, o conjunto tem duas modas, não zero.',
    ],
    solution:
      'O conjunto é bimodal: 5 e 7 aparecem duas vezes cada, mais que qualquer outro valor — as DUAS ' +
      'contam como moda ao mesmo tempo. ' +
      'Regra geral: 1 valor no topo → unimodal; 2 valores empatados → bimodal; 3 ou mais → multimodal; ' +
      'nenhuma repetição (todo mundo aparece 1 vez) → amodal, o conjunto não tem moda. ' +
      'É um erro comum achar que "empate" significa "sem moda" — é o oposto: significa moda dupla.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const variabilidadeExercises: Exercise[] = [
  {
    id: 'pvar-01',
    topicId: 'pe-variabilidade',
    kind: 'numeric',
    prompt: 'Calcule a variância amostral do conjunto 1, 3, 5, 7, 9.',
    answer: 10,
    hints: [
      'Primeiro a média: (1+3+5+7+9)/5.',
      'A média é 5. Agora calcule os desvios e eleve cada um ao quadrado: (1−5)², (3−5)², etc.',
      'A soma dos quadrados dá 40. Divida por n − 1 = 4.',
    ],
    solution:
      'x̄ = 25/5 = 5. Desvios ao quadrado: (−4)² + (−2)² + 0² + 2² + 4² = 16 + 4 + 0 + 4 + 16 = 40. ' +
      's² = 40 / (5 − 1) = 40/4 = 10. O desvio-padrão é s = √10 ≈ 3,16. ' +
      'Repare que dividimos por 4, e não por 5 — são os graus de liberdade.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pvar-02',
    topicId: 'pe-variabilidade',
    kind: 'numeric',
    prompt:
      'Resistências à tensão sem envelhecimento (psi): 227, 222, 218, 217, 225, 218, 216, 229, 228, 221. Qual é a amplitude amostral?',
    answer: 13,
    hints: ['Amplitude é a diferença entre o maior e o menor valor.', 'O maior é 229 e o menor é 216.'],
    solution:
      'Amplitude = 229 − 216 = 13 psi. ' +
      'A amplitude é a medida de variabilidade mais simples, mas usa só dois números e joga fora todo o ' +
      'resto da amostra. Para comparação, o grupo COM envelhecimento tem amplitude 219 − 201 = 18 psi — ' +
      'mais espalhado, o que já antecipa a conclusão do Exercício 1.9.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pvar-03',
    topicId: 'pe-variabilidade',
    kind: 'numeric',
    prompt:
      'Para o conjunto (5, 17, 6, 4), cuja média é 8, quanto vale a soma dos desvios Σ(xᵢ − x̄)?',
    answer: 0,
    hints: [
      'Calcule cada desvio: 5−8, 17−8, 6−8, 4−8.',
      'Os desvios são −3, +9, −2, −4. Some com atenção aos sinais.',
    ],
    solution:
      'Os desvios são −3, +9, −2 e −4, e a soma é −3 + 9 − 2 − 4 = 0. ' +
      'Isso NÃO é coincidência: a soma dos desvios em relação à média é sempre zero, para qualquer ' +
      'conjunto de dados. É o que o Exercício 1.16 pede para demonstrar — e a prova tem duas linhas: ' +
      'Σ(xᵢ − x̄) = Σxᵢ − n·x̄, e como x̄ = Σxᵢ/n, temos n·x̄ = Σxᵢ, então a subtração zera. ' +
      'A consequência: os n desvios não são independentes (sabendo n−1 deles, o último está determinado), ' +
      'e é por isso que a variância divide por n − 1.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pvar-04',
    topicId: 'pe-variabilidade',
    kind: 'choice',
    prompt:
      'Os tempos de secagem do Exercício 1.1 estão em horas, e a variância amostral deu 0,9427. Qual é a unidade correta dessa variância?',
    options: ['horas', 'horas²', 'não tem unidade', 'depende do tamanho da amostra'],
    answer: 1,
    hints: [
      'A variância é uma média de DESVIOS AO QUADRADO. O que acontece com a unidade quando você eleva ao quadrado?',
      'Se o desvio está em horas, o desvio ao quadrado está em horas².',
    ],
    solution:
      's² = 0,9427 h². A variância é a média dos desvios ao quadrado, então a unidade também vai ao ' +
      'quadrado. ' +
      'Já o desvio-padrão s = √0,9427 = 0,9709 volta para a unidade original: HORAS. ' +
      'É exatamente por isso que se reporta o desvio-padrão na prática, e não a variância — "0,97 hora de ' +
      'variação típica" é interpretável, "0,94 hora ao quadrado" não é. A unidade é cobrada em prova.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const graficosDadosExercises: Exercise[] = [
  {
    id: 'pgra-01',
    topicId: 'pe-graficos',
    kind: 'numeric',
    prompt:
      'Nas 30 escolas do Exercício 1.25, quantas têm porcentagem de famílias de renda alta na classe [15, 25)?',
    answer: 7,
    hints: [
      'Os dados ordenados são: 8,5 8,6 9,4 12,8 13,9 14,5 17,9 19,2 20,4 20,7 21,5 22,3 24,1 25,1 ...',
      'Conte quantos estão entre 15 (incluído) e 25 (excluído). Cuidado: o 25,1 já está fora.',
    ],
    solution:
      'Os valores na classe [15, 25) são: 17,9 · 19,2 · 20,4 · 20,7 · 21,5 · 22,3 · 24,1 — sete escolas. ' +
      'A frequência relativa é 7/30 ≈ 0,233. ' +
      'Atenção ao colchete e ao parêntese: [15, 25) inclui o 15 mas exclui o 25. Se um dado valesse ' +
      'exatamente 25, ele iria para a classe seguinte. Definir isso claramente evita contar o mesmo dado ' +
      'duas vezes.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pgra-02',
    topicId: 'pe-graficos',
    kind: 'numeric',
    prompt:
      'Num histograma de frequências relativas corretamente construído, quanto deve dar a soma de todas as frequências relativas?',
    answer: 1,
    hints: [
      'Frequência relativa é a contagem de cada classe dividida pelo total n.',
      'Se você somar todas as contagens, obtém n. E n dividido por n dá quanto?',
    ],
    solution:
      'A soma das frequências relativas é sempre 1 (ou 100%). O motivo é direto: somar todas as contagens ' +
      'devolve n, e n/n = 1. ' +
      'Essa é a conferência mais rápida que existe — se não somar 1, ou você errou uma contagem ou deixou ' +
      'algum dado fora de todas as classes. Faça sempre antes de desenhar.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pgra-03',
    topicId: 'pe-graficos',
    kind: 'choice',
    prompt:
      'Nos dados do Exercício 1.25 temos mediana 26,35 · aparada 30,97 · média 33,31. O que essa ordem revela sobre a distribuição?',
    options: [
      'É simétrica',
      'É assimétrica à direita, com uma cauda de valores altos',
      'É assimétrica à esquerda, com uma cauda de valores baixos',
      'Os cálculos estão errados, porque a média deveria ser a menor',
    ],
    answer: 1,
    hints: [
      'A média é puxada por valores extremos; a mediana não. Se a média ficou ACIMA da mediana, os extremos estão de que lado?',
      'Os maiores valores do conjunto são 68,1 · 72,2 · 89,2, bem afastados do miolo, que fica abaixo de 35.',
    ],
    solution:
      'A ordem mediana < aparada < média é a assinatura de uma distribuição ASSIMÉTRICA À DIREITA. ' +
      'A cauda de valores altos (68,1 · 72,2 · 89,2) puxa a média para cima; a mediana ignora a cauda ' +
      'porque só olha posição; e a aparada fica no meio, já que descarta os extremos mas usa todo o resto. ' +
      'Isso permite diagnosticar assimetria SEM desenhar nada: média > mediana indica cauda à direita, ' +
      'média < mediana indica cauda à esquerda, e média ≈ mediana indica aproximada simetria.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pgra-04',
    topicId: 'pe-graficos',
    kind: 'choice',
    prompt:
      'Qual é a vantagem do diagrama de ramo-e-folhas sobre o histograma?',
    options: [
      'É mais rápido de desenhar',
      'Preserva os valores originais dos dados, permitindo reconstruir a amostra',
      'Funciona melhor com amostras muito grandes',
      'Mostra a média diretamente',
    ],
    answer: 1,
    hints: [
      'No histograma, depois de agrupar em classes, você ainda sabe quais eram os valores exatos?',
      'No ramo-e-folhas, cada folha é um dígito real de uma observação.',
    ],
    solution:
      'O ramo-e-folhas NÃO perde informação: cada folha é o último dígito de uma observação real, então dá ' +
      'para reconstruir todos os dados originais e até ler a mediana contando posições. O histograma, ao ' +
      'agrupar em classes, descarta os valores individuais. ' +
      'Em compensação, o ramo-e-folhas fica impraticável com amostras muito grandes — é aí que o ' +
      'histograma ganha. Quando os dados são muito concentrados, usa-se ramos DESDOBRADOS (0*, 0•, 1*, 1•), ' +
      'onde * recebe as folhas de 0 a 4 e • recebe de 5 a 9, como pede o Exercício 1.20.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const tiposEstudoExercises: Exercise[] = [
  {
    id: 'ptip-01',
    topicId: 'pe-tipos-estudo',
    kind: 'choice',
    prompt:
      'No Exercício 1.3, dez dos vinte espécimes de polímero foram escolhidos ALEATORIAMENTE para passar pelo envelhecimento acelerado. Que tipo de estudo é esse?',
    options: [
      'Estudo observacional',
      'Experimento planejado',
      'Estudo retrospectivo',
      'Amostragem por conveniência',
    ],
    answer: 1,
    hints: [
      'A pergunta-chave é: o pesquisador CONTROLOU quem recebeu o tratamento, ou apenas observou o que já acontecia?',
      'Aqui os espécimes foram sorteados pelo pesquisador para receber o envelhecimento.',
    ],
    solution:
      'É um EXPERIMENTO PLANEJADO: o pesquisador controlou o fator (envelhecer ou não) e sorteou quem ' +
      'receberia cada tratamento. ' +
      'Isso importa porque só o experimento planejado permite concluir CAUSA. Se os espécimes tivessem ' +
      'envelhecido naturalmente e alguém apenas medisse os dois grupos, seria observacional — e a ' +
      'conclusão teria que ser de associação, não de causa.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ptip-02',
    topicId: 'pe-tipos-estudo',
    kind: 'choice',
    prompt:
      'Você calculou a média de dez baterias e obteve 124,3 h. Como se escreve isso corretamente?',
    options: [
      'μ = 124,3, porque é a média',
      'x̄ = 124,3, porque foi calculada a partir de uma amostra',
      'σ = 124,3',
      'Tanto faz: μ e x̄ são a mesma coisa',
    ],
    answer: 1,
    hints: [
      'A convenção é: letra grega para população, letra latina para amostra.',
      'Você mediu dez baterias, não todas as baterias que a fábrica produz.',
    ],
    solution:
      'x̄ = 124,3 h. A convenção é rígida e cai em prova: LETRA GREGA (μ, σ, σ²) descreve a POPULAÇÃO e é ' +
      'um valor fixo e desconhecido; LETRA LATINA (x̄, s, s²) descreve a AMOSTRA e é o que você calcula. ' +
      'Escrever μ = 124,3 seria afirmar conhecer a média de TODAS as baterias já produzidas — o que a ' +
      'amostra não autoriza. O correto é dizer que x̄ = 124,3 é uma ESTIMATIVA de μ.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ptip-03',
    topicId: 'pe-tipos-estudo',
    kind: 'choice',
    prompt:
      'O Exercício 1.26 pergunta a desvantagem de usar os dados históricos das 30 escolas (exercícios 1.24 e 1.25) para prever salários a partir da renda das famílias. Qual é?',
    options: [
      'A amostra de 30 escolas é pequena demais para qualquer análise',
      'São dados retrospectivos: ninguém controlou os fatores, então a relação pode ser explicada por variáveis não medidas',
      'Os dados estão em unidades diferentes',
      'Não há desvantagem: os dados são adequados',
    ],
    answer: 1,
    hints: [
      'Os dados são "históricos", coletados no passado para outra finalidade. Que tipo de estudo é esse?',
      'Se ninguém controlou nada, o que mais poderia explicar uma relação encontrada entre salário e renda?',
    ],
    solution:
      'São dados RETROSPECTIVOS. Ninguém controlou nada, então uma relação encontrada entre salário e ' +
      'renda das famílias pode ser explicada por variáveis que nem foram medidas — região, porte da ' +
      'escola, ano, política local de financiamento. ' +
      'Um modelo construído sobre dados observacionais ou retrospectivos PREVÊ, mas não prova causa. ' +
      'O tamanho da amostra não é a questão central aqui, e as unidades são consistentes.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'ptip-04',
    topicId: 'pe-tipos-estudo',
    kind: 'choice',
    prompt:
      'Com o molde FRIO, aumentar a velocidade de injeção reduz o encolhimento (72,674 → 71,606). Com o molde QUENTE, a mesma mudança aumenta muito (76,090 → 93,168). Como se chama isso?',
    options: [
      'Erro experimental',
      'Interação entre os dois fatores',
      'Correlação negativa',
      'Assimetria da distribuição',
    ],
    answer: 1,
    hints: [
      'O efeito da velocidade foi o mesmo nas duas temperaturas?',
      'O efeito mudou até de SINAL: negativo com molde frio, fortemente positivo com molde quente.',
    ],
    solution:
      'É INTERAÇÃO: o efeito de um fator (velocidade) depende do nível do outro (temperatura). Aqui o ' +
      'efeito nem apenas muda de tamanho — muda de SINAL. ' +
      'Num gráfico de interação, as duas retas ficam NÃO PARALELAS; se não houvesse interação, seriam ' +
      'paralelas. ' +
      'A consequência prática é forte: não existe "velocidade de injeção ideal" sem antes fixar a ' +
      'temperatura do molde. E é por isso que o Exercício 1.30 conclui que essa informação NÃO poderia ' +
      'vir de um estudo observacional — detectar interação exige controlar os dois fatores de propósito.',
    xpReward: 45,
    difficulty: 3,
  },
];
