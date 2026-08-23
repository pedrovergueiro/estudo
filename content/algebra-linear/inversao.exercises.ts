import { Exercise } from '@/types/exercise';

export const inversaoExercises: Exercise[] = [
  {
    id: 'inv-01',
    topicId: 'al-inversao-matrizes',
    kind: 'choice',
    prompt: 'Qual destas matrizes NÃO pode ter inversa, independentemente dos valores?',
    options: [
      'Uma matriz 3×3',
      'Uma matriz 2×5',
      'Uma matriz 4×4',
      'Uma matriz 1×1 com o valor 7',
    ],
    answer: 1,
    hints: [
      'Existe uma restrição de FORMATO antes mesmo de olhar os valores.',
      'Só matrizes quadradas (linhas = colunas) podem ser invertíveis.',
    ],
    solution:
      'A matriz 2×5 não é quadrada (2 ≠ 5), então nunca terá inversa — nem faz sentido tentar. ' +
      'As 3×3 e 4×4 são quadradas, então PODEM ter inversa (depende dos valores: se o determinante ' +
      'for zero, não têm). A 1×1 com valor 7 tem inversa sim: é a matriz [1/7], já que 7 × 1/7 = 1.',
    xpReward: 25,
    difficulty: 1,
  },

  {
    id: 'inv-02',
    topicId: 'al-inversao-matrizes',
    kind: 'choice',
    prompt: 'Por que esta matriz NÃO possui inversa?',
    matrix: [
      [3, 6],
      [1, 2],
    ],
    matrixLabel: 'Matriz S',
    options: [
      'Porque tem números repetidos',
      'Porque a primeira linha é a segunda multiplicada por 3 (linhas dependentes)',
      'Porque não é quadrada',
      'Porque tem apenas números positivos',
    ],
    answer: 1,
    hints: [
      'Compare a linha 1 [3, 6] com a linha 2 [1, 2]. Existe algum número que multiplica uma e dá a outra?',
      '1 × 3 = 3 e 2 × 3 = 6. A linha 1 é exatamente a linha 2 vezes 3.',
    ],
    solution:
      'A linha 1 é a linha 2 multiplicada por 3 — as linhas são linearmente DEPENDENTES. ' +
      'A linha 1 não traz nenhuma informação nova, é uma repetição disfarçada da linha 2. ' +
      'Quando isso acontece, o escalonamento produz uma linha de zeros, o determinante é zero e ' +
      'a inversa não existe. ' +
      'Conferindo pelo determinante: det = 3×2 − 6×1 = 6 − 6 = 0. Determinante zero → sem inversa.',
    xpReward: 35,
    difficulty: 2,
  },

  {
    id: 'inv-03',
    topicId: 'al-inversao-matrizes',
    kind: 'numeric',
    prompt:
      'Qual é o determinante desta matriz? (Para 2×2: det = a₁₁·a₂₂ − a₁₂·a₂₁)',
    matrix: [
      [4, 3],
      [2, 5],
    ],
    matrixLabel: 'Matriz A',
    answer: 14,
    hints: [
      'Multiplique a diagonal principal: 4 × 5.',
      'Multiplique a outra diagonal: 3 × 2.',
      'Subtraia o segundo resultado do primeiro: 20 − 6.',
    ],
    solution:
      'det = (4 × 5) − (3 × 2) = 20 − 6 = 14. ' +
      'Como o determinante é diferente de zero, esta matriz É invertível. ' +
      'Esse é o teste mais rápido para matrizes 2×2: calcule o determinante antes de tentar ' +
      'inverter. Se der zero, você economiza o trabalho todo — não existe inversa.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'inv-04',
    topicId: 'al-inversao-matrizes',
    kind: 'choice',
    prompt:
      'No método de Gauss-Jordan para inverter uma matriz, qual é a diferença em relação ao escalonamento de Gauss comum?',
    options: [
      'Gauss-Jordan usa apenas multiplicação por escalar',
      'Gauss-Jordan zera a coluna inteira (acima E abaixo do pivô), não só abaixo',
      'Gauss-Jordan não permite trocar linhas de lugar',
      'Não há diferença, são o mesmo método',
    ],
    answer: 1,
    hints: [
      'No Gauss comum, o objetivo é chegar na forma triangular (zeros só abaixo da diagonal).',
      'No Jordan, o objetivo é chegar na IDENTIDADE — o que exige zerar também acima da diagonal.',
    ],
    solution:
      'O Gauss comum para na forma triangular superior: zeros apenas ABAIXO da diagonal. ' +
      'O Gauss-Jordan continua o trabalho e zera também ACIMA da diagonal, até o lado esquerdo ' +
      'virar a identidade perfeita. ' +
      'Esse esforço extra é necessário porque, para a inversa aparecer do lado direito, o lado ' +
      'esquerdo precisa ficar exatamente igual a I — a forma triangular não basta.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'inv-05',
    topicId: 'al-inversao-matrizes',
    kind: 'choice',
    prompt:
      'Você inverteu uma matriz A e encontrou uma candidata B. Como VERIFICAR se está correta?',
    options: [
      'Somar A + B e ver se dá zero',
      'Multiplicar A · B e ver se dá a matriz identidade',
      'Verificar se B tem os mesmos números de A',
      'Calcular o determinante de B e ver se é zero',
    ],
    answer: 1,
    hints: [
      'Volte à definição: o que caracteriza a inversa? A · A⁻¹ = ?',
      'Se B é mesmo a inversa de A, o produto A·B tem que dar a identidade.',
    ],
    solution:
      'Multiplique A por B: se o resultado for a matriz identidade, B é realmente A⁻¹. ' +
      'Isso vem direto da definição (A · A⁻¹ = I). ' +
      'Essa verificação é obrigatória na entrega da Parte 1 do seu Projeto Integrador, que exige ' +
      '"verificação do resultado". Em Python: basta conferir se A @ B resulta na identidade.',
    xpReward: 30,
    difficulty: 2,
  },
];
