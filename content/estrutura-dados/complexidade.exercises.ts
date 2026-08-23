import { Exercise } from '@/types/exercise';

/** Exercícios do tópico de complexidade — ancorados na atividade da disciplina. */
export const complexidadeExercises: Exercise[] = [
  {
    id: 'edc-01',
    topicId: 'ed-complexidade-bigo',
    kind: 'numeric',
    prompt:
      'No Algoritmo B (dois laços aninhados, cada um de range(n)), quantas vezes o print executa quando n = 100?',
    answer: 10000,
    hints: [
      'Para CADA volta do laço de fora, o laço de dentro roda inteiro.',
      'São n voltas de fora × n voltas de dentro.',
      '100 × 100.',
    ],
    solution:
      'O laço externo dá 100 voltas. Para cada uma delas, o laço interno dá outras 100. ' +
      'Total = 100 × 100 = 10.000 execuções. ' +
      'A regra geral: laços ANINHADOS multiplicam. Se estivessem lado a lado (um depois do outro), ' +
      'somariam — daria 200, não 10.000. É essa diferença entre somar e multiplicar que separa O(n) de O(n²).',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'edc-02',
    topicId: 'ed-complexidade-bigo',
    kind: 'numeric',
    prompt:
      'No Algoritmo C (i = 1; while i < n: print(i); i *= 2), quantas vezes o print executa quando n = 1.000?',
    answer: 10,
    hints: [
      'O i não soma 1 — ele DOBRA a cada volta. Escreva a sequência: 1, 2, 4, 8...',
      'Continue dobrando e pare quando o valor não for mais menor que 1.000.',
      '1, 2, 4, 8, 16, 32, 64, 128, 256, 512 — o próximo seria 1024, que já não é menor que 1.000.',
    ],
    solution:
      'O i assume 1, 2, 4, 8, 16, 32, 64, 128, 256 e 512 — dez valores. O próximo seria 1024, que não é ' +
      'menor que 1.000, então o laço para. Resposta: 10 execuções. ' +
      'Compare com o Algoritmo A, que faria 1.000. A entrada é a mesma; o trabalho é 100 vezes menor. ' +
      'Isso é O(log n): a pergunta "quantas vezes preciso dobrar 1 para chegar em n?". Como log₂(1000) ≈ 9,97, ' +
      'a resposta é 10 — e é por isso que algoritmos logarítmicos praticamente ignoram o tamanho da entrada.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'edc-03',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'O Algoritmo D tem DOIS laços de range(n), um depois do outro (não aninhados), e faz 2n operações. Qual é a sua complexidade?',
    options: ['O(n²)', 'O(2n)', 'O(n)', 'O(log n)'],
    answer: 2,
    hints: [
      'Laços lado a lado somam: n + n = 2n. Laços aninhados multiplicam.',
      'O Big O descarta constantes multiplicativas. O que sobra de 2n?',
    ],
    solution:
      'É O(n). Os laços estão LADO A LADO, então somam: n + n = 2n — e o Big O descarta a constante 2. ' +
      '"O(2n)" não é notação válida justamente por isso: ela não acrescenta informação sobre o CRESCIMENTO. ' +
      'A justificativa: dobre a entrada e tanto o A (n operações) quanto o D (2n) dobram o trabalho. ' +
      'A curva dos dois tem o mesmo formato; o D só é duas vezes mais alto. ' +
      'Já o B, com laços ANINHADOS, quadruplica o trabalho quando a entrada dobra — formato de curva diferente, ' +
      'classe diferente.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'edc-04',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'Um algoritmo O(n²) leva 10 segundos para processar 1.000 registros. Mantendo a mesma máquina, aproximadamente quanto levaria para processar 10.000 registros?',
    options: ['100 segundos', '20 segundos', '1.000 segundos', '10 segundos'],
    answer: 2,
    hints: [
      'A entrada ficou 10 vezes maior. Em O(n²), o trabalho cresce com o QUADRADO desse fator.',
      '10 vezes mais entrada → 10² = 100 vezes mais trabalho.',
    ],
    solution:
      'Resposta: 1.000 segundos (quase 17 minutos). ' +
      'A entrada foi multiplicada por 10, e em O(n²) o trabalho é multiplicado por 10² = 100. ' +
      'Logo 10 s × 100 = 1.000 s. ' +
      'A alternativa "100 segundos" é a pegadinha: ela corresponde a multiplicar por 10, que seria o comportamento ' +
      'de um algoritmo O(n), não O(n²). ' +
      'Guarde a regra: em O(n²), multiplicar a entrada por k multiplica o tempo por k². Em O(n), multiplica por k.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'edc-05',
    topicId: 'ed-complexidade-bigo',
    kind: 'numeric',
    prompt:
      'Um algoritmo O(n²) processa uma base com n = 1.000.000 de registros. Aproximadamente quantas operações ele realiza? (responda o número inteiro)',
    answer: 1000000000000,
    hints: [
      'O(n²) significa n × n.',
      '1.000.000 × 1.000.000. Em potências de 10: 10⁶ × 10⁶.',
      'Ao multiplicar potências de mesma base, some os expoentes: 10⁶⁺⁶.',
    ],
    solution:
      'n² = 1.000.000² = 10⁶ × 10⁶ = 10¹² = 1.000.000.000.000 (um trilhão) de operações. ' +
      'Para comparar, um algoritmo O(n) na mesma base faria 10⁶ = 1.000.000 de operações — ' +
      'o O(n²) faz UM MILHÃO de vezes mais trabalho. ' +
      'Numa máquina de 100 milhões de operações por segundo, isso é a diferença entre 0,01 segundo e ' +
      'cerca de 2 horas e 47 minutos.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'edc-06',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'Qual é a complexidade da função encontrar(dados, valor), que percorre a lista com um for e retorna True assim que acha o valor?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
    answer: 2,
    hints: [
      'O Big O, sem outra indicação, descreve o PIOR caso.',
      'Qual é o pior caso aqui? O valor estar na última posição — ou nem existir na lista.',
    ],
    solution:
      'É O(n) — busca linear. ' +
      'No pior caso o valor está na última posição (ou não existe), e o laço percorre todos os n elementos. ' +
      'No MELHOR caso ele acha na primeira posição e faz 1 comparação, que seria O(1) — mas Big O sem outra ' +
      'indicação significa pior caso, porque é a garantia que interessa ao projetar um sistema. ' +
      'O return dentro do if não muda a classe: ele ajuda no caso médio, não no pior.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'edc-07',
    topicId: 'ed-complexidade-bigo',
    kind: 'numeric',
    prompt:
      'Uma busca BINÁRIA é feita numa lista ORDENADA com 1.000.000 de elementos. Aproximadamente quantas comparações ela faz no pior caso?',
    answer: 20,
    hints: [
      'A cada comparação, a busca binária descarta METADE do que sobrou.',
      'Comece em 1.000.000 e vá dividindo por 2 até chegar em 1. Conte quantas divisões.',
      'É log₂(1.000.000), que fica entre 19 e 20.',
    ],
    solution:
      'Cerca de 20 comparações. A cada passo o espaço de busca cai pela metade: ' +
      '1.000.000 → 500.000 → 250.000 → … → 4 → 2 → 1, o que dá 20 passos (log₂(1.000.000) ≈ 19,93). ' +
      'Compare com a busca linear no mesmo dado: 1.000.000 de comparações no pior caso. ' +
      'A busca binária é O(log n), a linear é O(n). ' +
      'ATENÇÃO ao pré-requisito: a busca binária só funciona se os dados estiverem ORDENADOS — descartar ' +
      'metade só é válido se você souber de que lado o valor estaria.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'edc-08',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'Um colega afirma: "Não importa escolher entre O(n) e O(n²), os computadores atuais são muito rápidos." Qual é a avaliação mais correta dessa afirmação?',
    options: [
      'Ele está certo: hardware moderno compensa qualquer diferença de algoritmo',
      'Ele está errado para entradas grandes: a diferença cresce com n, e nenhum hardware cobre um fator de um milhão',
      'Ele está errado sempre: O(n²) é inaceitável em qualquer situação',
      'Ele está certo, desde que o sistema tenha GPU',
    ],
    answer: 1,
    hints: [
      'Hardware mais rápido divide o tempo por um fator FIXO. E a diferença entre O(n) e O(n²)?',
      'Com n = 1.000 a diferença é de 1.000 vezes. Com n = 1.000.000, é de um milhão de vezes.',
    ],
    solution:
      'A avaliação correta é a segunda — e a nuance importa para a nota. ' +
      'Ele tem um PONTO para entradas pequenas: com 1.000 registros, os dois algoritmos terminam instantaneamente, ' +
      'e aí vale escolher o código mais simples de manter. ' +
      'Mas o argumento falha porque supõe que a diferença é um fator fixo. Não é: com 1.000.000 de registros o ' +
      'O(n²) faz um MILHÃO de vezes mais operações — cerca de 2h47 contra 0,01 s. ' +
      'Comprar uma máquina 10 vezes mais rápida derruba as 2h47 para 17 minutos, mas o O(n) já tinha terminado. ' +
      'E na base seguinte, de 10 milhões, o O(n²) volta a levar 11 dias. ' +
      'Hardware melhor te dá um fator constante; algoritmo melhor te dá uma CURVA diferente. ' +
      'A terceira alternativa erra pelo exagero oposto: O(n²) é perfeitamente aceitável quando n é pequeno e ' +
      'permanece pequeno.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'edc-09',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'Um algoritmo tem três laços de range(n) escritos um depois do outro, sem nenhum aninhamento. Qual é sua complexidade?',
    options: ['O(n³)', 'O(n)', 'O(3n)', 'O(n²)'],
    answer: 1,
    hints: [
      'A pergunta que decide não é "quantos laços tem", é "um laço está DENTRO do outro?".',
      'Sem aninhamento, os custos somam: n + n + n = 3n.',
    ],
    solution:
      'É O(n). Sem aninhamento os custos SOMAM: n + n + n = 3n, e a constante 3 é descartada. ' +
      'A alternativa O(n³) é a armadilha — ela valeria se os três laços estivessem ANINHADOS, um dentro do outro. ' +
      'Dez laços em sequência ainda seriam O(n); dois laços aninhados já são O(n²). ' +
      'Regra prática: conte a PROFUNDIDADE do aninhamento, não a quantidade de "for" no código.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'edc-10',
    topicId: 'ed-complexidade-bigo',
    kind: 'choice',
    prompt:
      'Você precisa buscar milhares de vezes um valor numa base fixa de 1 milhão de registros, que hoje está desordenada. Ordenar custa O(n log n). Vale a pena ordenar antes?',
    options: [
      'Não, porque ordenar (O(n log n)) é mais caro que uma busca linear (O(n))',
      'Sim: paga-se a ordenação uma vez, e cada busca seguinte cai de 1.000.000 para ~20 comparações',
      'Não, porque busca binária e busca linear têm a mesma complexidade',
      'Sim, porque ordenar é O(1) numa base fixa',
    ],
    answer: 1,
    hints: [
      'O custo da ordenação é pago UMA vez. O custo da busca é pago a CADA consulta.',
      'Compare: milhares × 1.000.000 comparações, contra uma ordenação + milhares × 20.',
    ],
    solution:
      'Sim, compensa — e o raciocínio é sobre custo AMORTIZADO. ' +
      'A ordenação é paga uma única vez (cerca de 20 milhões de operações para n = 10⁶). ' +
      'Depois disso, cada busca custa ~20 comparações em vez de 1.000.000. ' +
      'Com mil buscas: sem ordenar seriam 1.000 × 1.000.000 = 1 bilhão de comparações; ordenando, ' +
      '20 milhões + 1.000 × 20 = cerca de 20 milhões. Uma redução de 50 vezes. ' +
      'A primeira alternativa está certa sobre as complexidades mas erra na conclusão: ela só valeria se você ' +
      'fosse buscar UMA vez. É por isso que bancos de dados mantêm ÍNDICES — a estrutura ordenada é construída ' +
      'uma vez e amortizada por todas as consultas seguintes.',
    xpReward: 45,
    difficulty: 3,
  },
];
