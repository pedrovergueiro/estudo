import { Exercise } from '@/types/exercise';

export const sistemasExercises: Exercise[] = [
  {
    id: 'sis-01',
    topicId: 'al-sistemas-lineares',
    kind: 'choice',
    prompt:
      'Ao terminar de escalonar um sistema, você chegou nesta matriz aumentada. Como ele se classifica?',
    matrix: [
      ['1', '2', '-1', '|', '4'],
      ['0', '1', '3', '|', '2'],
      ['0', '0', '0', '|', '7'],
    ],
    matrixLabel: 'Matriz escalonada',
    options: [
      'SPD — solução única',
      'SPI — infinitas soluções',
      'SI — sistema impossível',
      'Não dá para classificar sem terminar as contas',
    ],
    answer: 2,
    hints: [
      'Leia a última linha como equação: 0x + 0y + 0z = 7.',
      'Isso significa "0 = 7". Existe algum valor de x, y, z que torne isso verdade?',
    ],
    solution:
      'É SI (Sistema Impossível). A última linha traduzida vira 0x + 0y + 0z = 7, ou seja, "0 = 7" — ' +
      'uma contradição matemática. Nenhum valor das incógnitas resolve isso, então o sistema não tem ' +
      'solução alguma. ' +
      'A regra prática: linha toda zerada nos coeficientes MAS com termo independente diferente de ' +
      'zero → SI, sempre. Se o termo independente também fosse 0, seria só uma equação redundante ' +
      '(caminho para SPI).',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'sis-02',
    topicId: 'al-sistemas-lineares',
    kind: 'choice',
    prompt: 'E esta matriz escalonada, como se classifica?',
    matrix: [
      ['1', '3', '2', '|', '5'],
      ['0', '1', '-1', '|', '2'],
      ['0', '0', '0', '|', '0'],
    ],
    matrixLabel: 'Matriz escalonada',
    options: [
      'SPD — solução única',
      'SPI — infinitas soluções',
      'SI — sistema impossível',
      'O sistema não tem incógnitas suficientes',
    ],
    answer: 1,
    hints: [
      'A última linha vira 0 = 0. Isso é contradição ou apenas uma informação inútil?',
      'Sobraram 2 equações úteis para 3 incógnitas. Falta informação para fixar um único valor de cada.',
    ],
    solution:
      'É SPI (Possível e Indeterminado). A última linha vira "0 = 0", que é verdade sempre — não é ' +
      'contradição, é só uma equação redundante que não acrescenta informação. ' +
      'Resultado: sobraram 2 equações úteis para 3 incógnitas. Com menos equações do que incógnitas, ' +
      'uma variável fica LIVRE (pode assumir qualquer valor) e as outras se ajustam a ela — ' +
      'gerando infinitas soluções.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'sis-03',
    topicId: 'al-sistemas-lineares',
    kind: 'numeric',
    prompt:
      'Resolva o sistema: 2x + y = 7 e x − y = 2. Qual é o valor de x?',
    answer: 3,
    hints: [
      'Monte a matriz aumentada: [[2, 1, | 7], [1, -1, | 2]].',
      'Somando as duas equações originais, o y se cancela: (2x + y) + (x − y) = 7 + 2, ou seja, 3x = 9.',
      'De 3x = 9 sai x diretamente.',
    ],
    solution:
      'Somando as duas equações, o y desaparece: (2x + y) + (x − y) = 7 + 2 → 3x = 9 → x = 3. ' +
      'Substituindo na segunda equação: 3 − y = 2 → y = 1. ' +
      'Sempre confira substituindo nas DUAS equações originais: 2(3) + 1 = 7 ✓ e 3 − 1 = 2 ✓. ' +
      'Essa verificação é obrigatória na entrega da Parte 1 do seu Projeto Integrador.',
    xpReward: 35,
    difficulty: 2,
  },

  {
    id: 'sis-04',
    topicId: 'al-sistemas-lineares',
    kind: 'choice',
    prompt: 'Qual destas operações NÃO é permitida ao escalonar um sistema?',
    options: [
      'Trocar a linha 1 com a linha 3',
      'Multiplicar a linha 2 por zero',
      'Substituir a linha 3 por (linha 3 − 2 × linha 1)',
      'Multiplicar a linha 1 por −5',
    ],
    answer: 1,
    hints: [
      'As três operações válidas preservam a solução do sistema. Pense em qual delas destrói informação.',
      'Multiplicar uma equação por zero transforma tudo em "0 = 0" — a equação some.',
    ],
    solution:
      'Multiplicar uma linha por ZERO não é permitido. Isso transformaria a equação inteira em ' +
      '"0 = 0", apagando a informação que ela carregava e mudando o conjunto solução do sistema. ' +
      'A regra é: multiplicar por qualquer constante k, DESDE QUE k ≠ 0. ' +
      'Multiplicar por −5 (alternativa d) é perfeitamente válido — números negativos não são problema.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'sis-05',
    topicId: 'al-sistemas-lineares',
    kind: 'numeric',
    prompt:
      'Um sistema tem 4 incógnitas. Depois de escalonado, sobraram 3 linhas com pivô e nenhuma linha ' +
      'contraditória. Quantas variáveis LIVRES esse sistema tem?',
    answer: 1,
    hints: [
      'Cada pivô "prende" uma variável a um valor determinado pelas outras.',
      'Variáveis livres = número de incógnitas − número de pivôs.',
    ],
    solution:
      'São 4 incógnitas e 3 pivôs, então 4 − 3 = 1 variável livre. ' +
      'Isso significa que o sistema é SPI: você pode escolher livremente o valor dessa variável, e ' +
      'as outras três ficam determinadas em função dela. Como há infinitas escolhas possíveis, ' +
      'há infinitas soluções. ' +
      'A fórmula geral: variáveis livres = (nº de incógnitas) − (nº de pivôs). Se der 0 e não houver ' +
      'contradição, o sistema é SPD.',
    xpReward: 40,
    difficulty: 3,
  },
];
