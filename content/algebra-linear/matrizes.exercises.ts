import { Exercise } from '@/types/exercise';

export const matrizesExercises: Exercise[] = [
  {
    id: 'mat-01',
    topicId: 'al-matrizes-def',
    kind: 'text',
    prompt: 'Qual é a dimensão (ordem) desta matriz? Responda no formato "linhas x colunas".',
    matrix: [
      [4, 1, 7, 2],
      [9, 3, 5, 8],
      [6, 0, 2, 1],
    ],
    matrixLabel: 'Matriz M',
    answer: '3x4',
    accept: ['3x4', '3 x 4', '3×4', '3 × 4', '3,4', '3 4'],
    hints: [
      'Conte primeiro quantas filas HORIZONTAIS existem. Cada fila horizontal é uma linha.',
      'Agora conte quantas filas VERTICAIS existem. Cada uma é uma coluna. São 4.',
      'São 3 linhas e 4 colunas. A ordem se escreve sempre linhas primeiro: 3x4.',
    ],
    solution:
      'A matriz tem 3 filas horizontais (linhas) e 4 filas verticais (colunas), então é 3×4. ' +
      'A ordem NUNCA é invertida: linhas primeiro, colunas depois. Um erro clássico em prova é ' +
      'escrever 4×3 aqui — isso descreveria uma matriz completamente diferente, com 4 linhas e 3 colunas.',
    xpReward: 25,
    difficulty: 1,
  },

  {
    id: 'mat-02',
    topicId: 'al-matrizes-def',
    kind: 'numeric',
    prompt: 'Nesta matriz A, qual é o valor de a₂₃ (elemento da linha 2, coluna 3)?',
    matrix: [
      [5, 8, 2, 6],
      [1, 4, 9, 3],
      [7, 0, 5, 2],
    ],
    matrixLabel: 'Matriz A',
    answer: 9,
    hints: [
      'O primeiro índice é a linha. Vá para a segunda fila horizontal: [1, 4, 9, 3].',
      'O segundo índice é a coluna. Dentro dessa linha, pegue o terceiro número.',
      'Linha 2 = [1, 4, 9, 3]. O terceiro elemento dela é 9.',
    ],
    solution:
      'a₂₃ significa: linha 2, coluna 3. Descemos para a segunda linha — [1, 4, 9, 3] — e andamos ' +
      'até a terceira posição, chegando em 9. ' +
      'Cuidado com a armadilha: a₃₂ (linha 3, coluna 2) seria 0, um número totalmente diferente. ' +
      'A ordem dos índices importa.',
    xpReward: 25,
    difficulty: 1,
  },

  {
    id: 'mat-03',
    topicId: 'al-matrizes-def',
    kind: 'choice',
    prompt: 'Que tipo de matriz é esta?',
    matrix: [
      [6, 0, 0],
      [0, 3, 0],
      [0, 0, 9],
    ],
    matrixLabel: 'Matriz D',
    options: [
      'Matriz identidade',
      'Matriz diagonal',
      'Matriz nula',
      'Matriz triangular inferior',
    ],
    answer: 1,
    hints: [
      'Repare onde estão os números diferentes de zero: todos na diagonal que vai do canto superior esquerdo ao inferior direito.',
      'Não é identidade, porque na identidade a diagonal é formada só por 1 — aqui temos 6, 3 e 9.',
    ],
    solution:
      'É uma matriz DIAGONAL: quadrada, com valores na diagonal principal e zero em todo o resto. ' +
      'Por que não as outras? Identidade exigiria 1, 1, 1 na diagonal (aqui é 6, 3, 9). ' +
      'Nula exigiria que TODOS os elementos fossem zero. Triangular inferior permitiria números ' +
      'abaixo da diagonal — aqui não há nenhum. ' +
      'Detalhe: toda matriz identidade é diagonal, mas nem toda diagonal é identidade.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'mat-04',
    topicId: 'al-matrizes-def',
    kind: 'text',
    prompt:
      'Se uma matriz B é 5×2, qual será a dimensão da sua transposta Bᵀ? Responda no formato "linhas x colunas".',
    answer: '2x5',
    accept: ['2x5', '2 x 5', '2×5', '2 × 5', '2,5', '2 5'],
    hints: [
      'A transposta troca linhas por colunas. O que era linha vira coluna.',
      'Se B tem 5 linhas e 2 colunas, a transposta terá 5 colunas e 2 linhas.',
    ],
    solution:
      'Transpor inverte as dimensões: se B é 5×2, então Bᵀ é 2×5. ' +
      'A regra geral: se A é m×n, então Aᵀ é n×m. ' +
      'Faz sentido porque cada linha da original "deita de pé" e vira uma coluna — ' +
      'as 5 linhas de B viram as 5 colunas de Bᵀ.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'mat-05',
    topicId: 'al-matrizes-def',
    kind: 'choice',
    prompt: 'Qual das afirmações abaixo é VERDADEIRA?',
    options: [
      'Toda matriz quadrada é uma matriz identidade',
      'Uma matriz 2×3 pode ser quadrada',
      'A diagonal principal de uma matriz 3×3 tem 3 elementos',
      'A transposta de uma matriz quadrada muda a dimensão dela',
    ],
    answer: 2,
    hints: [
      'Analise uma por uma. A diagonal principal são os elementos a₁₁, a₂₂, a₃₃...',
      'Numa matriz 3×3, a diagonal vai de a₁₁ até a₃₃ — conte quantos elementos são.',
    ],
    solution:
      'A correta é: "A diagonal principal de uma matriz 3×3 tem 3 elementos" — são a₁₁, a₂₂ e a₃₃. ' +
      'As outras estão erradas porque: (1) matriz quadrada só precisa ter linhas = colunas, ' +
      'a identidade é um caso muito específico dentro disso; (2) 2×3 tem 2 linhas e 3 colunas, ' +
      'então nunca pode ser quadrada; (4) transpor uma matriz n×n devolve outra n×n — a dimensão ' +
      'se mantém justamente porque linhas e colunas já eram iguais.',
    xpReward: 35,
    difficulty: 2,
  },

  {
    id: 'mat-06',
    topicId: 'al-matrizes-def',
    kind: 'numeric',
    prompt:
      'Um dataset de IA tem 200 imagens, e cada imagem é descrita por 512 características (features). ' +
      'Organizando isso como uma matriz onde cada linha é uma imagem, quantos elementos a matriz tem no total?',
    answer: 102400,
    hints: [
      'A matriz é 200 × 512: 200 linhas (uma por imagem) e 512 colunas (uma por característica).',
      'O total de elementos de uma matriz m×n é simplesmente m vezes n.',
      'Calcule 200 × 512.',
    ],
    solution:
      'A matriz é 200×512, então tem 200 × 512 = 102.400 elementos. ' +
      'Este é literalmente o formato em que dados chegam num modelo de IA: cada linha é uma amostra, ' +
      'cada coluna é uma feature. Quando você ouvir "batch de 200 amostras com 512 dimensões", ' +
      'é exatamente esta matriz. É por isso que Álgebra Linear é a base do seu curso — ' +
      'todo dado vira matriz antes de entrar no modelo.',
    xpReward: 35,
    difficulty: 2,
  },
];
