import { Exercise } from '@/types/exercise';

export const operacoesExercises: Exercise[] = [
  {
    id: 'op-01',
    topicId: 'al-matrizes-operacoes',
    kind: 'numeric',
    prompt: 'Multiplicando esta matriz pelo escalar 4, qual será o valor da posição a₂₁?',
    matrix: [
      [3, 7],
      [5, 2],
    ],
    matrixLabel: 'Matriz A',
    answer: 20,
    hints: [
      'a₂₁ é o elemento da linha 2, coluna 1. Na matriz acima, ele vale 5.',
      'Multiplicação por escalar afeta cada elemento individualmente: basta fazer 4 × 5.',
    ],
    solution:
      'a₂₁ = 5. Multiplicando a matriz por 4, cada elemento é multiplicado por 4, então essa ' +
      'posição vira 4 × 5 = 20. Nenhum elemento "conversa" com os outros na multiplicação por ' +
      'escalar — cada um segue sua vida.',
    xpReward: 25,
    difficulty: 1,
  },

  {
    id: 'op-02',
    topicId: 'al-matrizes-operacoes',
    kind: 'choice',
    prompt:
      'A matriz A é 3×4 e a matriz B é 4×3. É possível calcular A + B (a SOMA das duas)?',
    options: [
      'Sim, porque as duas têm 12 elementos',
      'Sim, basta transpor uma delas antes',
      'Não, porque as dimensões são diferentes',
      'Não, porque soma de matrizes não existe',
    ],
    answer: 2,
    hints: [
      'A regra da soma exige que as dimensões sejam EXATAMENTE iguais, não apenas parecidas.',
      '3×4 significa 3 linhas e 4 colunas. 4×3 significa 4 linhas e 3 colunas. São formatos diferentes.',
    ],
    solution:
      'Não é possível. Para somar, as dimensões precisam ser idênticas: uma 3×4 só soma com outra ' +
      '3×4. Ter o mesmo número total de elementos (12) é irrelevante — o que importa é o formato. ' +
      'E transpor antes mudaria a matriz, ou seja, você estaria calculando outra coisa (A + Bᵀ), ' +
      'não A + B.',
    xpReward: 30,
    difficulty: 2,
  },

  {
    id: 'op-03',
    topicId: 'al-matrizes-operacoes',
    kind: 'text',
    prompt:
      'A matriz A é 2×5 e a matriz B é 5×3. O produto A·B existe? Se sim, qual a dimensão do resultado? ' +
      'Responda no formato "linhas x colunas" (ou "nao" se não existir).',
    answer: '2x3',
    accept: ['2x3', '2 x 3', '2×3', '2 × 3', '2,3', '2 3'],
    hints: [
      'Escreva as dimensões lado a lado: (2×5)·(5×3). Os dois números do MEIO precisam ser iguais.',
      'O meio é 5 e 5 — são iguais, então o produto existe.',
      'O resultado pega as linhas da primeira (2) e as colunas da segunda (3).',
    ],
    solution:
      'Existe sim. Colocando lado a lado: (2×5)·(5×3). Os números do meio são 5 e 5 — iguais, ' +
      'então a multiplicação está definida. O resultado fica com as linhas da primeira matriz e ' +
      'as colunas da segunda: 2×3. Macete: os números do meio "se cancelam" e sobram os das pontas.',
    xpReward: 35,
    difficulty: 2,
  },

  {
    id: 'op-04',
    topicId: 'al-matrizes-operacoes',
    kind: 'numeric',
    prompt:
      'Calcule o elemento c₁₁ do produto A·B, onde A é a matriz mostrada e B = [[2, 1], [3, 4], [5, 0]]. ' +
      '(c₁₁ = linha 1 de A combinada com coluna 1 de B)',
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
    ],
    matrixLabel: 'Matriz A',
    answer: 25,
    hints: [
      'A linha 1 de A é [1, 2, 3]. A coluna 1 de B é [2, 3, 5] (o primeiro número de cada linha de B).',
      'Multiplique termo a termo: 1×2, depois 2×3, depois 3×5.',
      'Some os três produtos: 2 + 6 + 15.',
    ],
    solution:
      'c₁₁ combina a linha 1 de A com a coluna 1 de B. Linha 1 de A = [1, 2, 3]. ' +
      'Coluna 1 de B = [2, 3, 5]. Multiplicando termo a termo e somando: ' +
      '1×2 + 2×3 + 3×5 = 2 + 6 + 15 = 25. ' +
      'Repare que TODOS os elementos da linha e da coluna participam — é uma soma de produtos, ' +
      'não uma multiplicação isolada.',
    xpReward: 40,
    difficulty: 3,
  },

  {
    id: 'op-05',
    topicId: 'al-matrizes-operacoes',
    kind: 'choice',
    prompt: 'Sobre a multiplicação de matrizes, qual afirmação é VERDADEIRA?',
    options: [
      'A · B sempre é igual a B · A',
      'Se A·B existe, então B·A também existe obrigatoriamente',
      'A ordem dos fatores altera o resultado (e às vezes A·B existe mas B·A não)',
      'Multiplica-se posição por posição, como na soma',
    ],
    answer: 2,
    hints: [
      'Pense numa matriz 2×5 vezes uma 5×3: o produto existe. Agora tente inverter a ordem: (5×3)·(2×5).',
      'Na ordem invertida, os números do meio seriam 3 e 2 — diferentes. Logo não existe.',
    ],
    solution:
      'A correta é a terceira. A multiplicação de matrizes NÃO é comutativa: A·B geralmente difere ' +
      'de B·A, e há casos em que uma existe e a outra nem está definida (ex: 2×5 por 5×3 funciona, ' +
      'mas 5×3 por 2×5 não, porque 3 ≠ 2). ' +
      'A última alternativa descreve a SOMA, não a multiplicação — confundir as duas é o erro mais ' +
      'comum de quem está começando.',
    xpReward: 35,
    difficulty: 2,
  },
];
