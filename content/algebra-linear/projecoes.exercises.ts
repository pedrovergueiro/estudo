import { Exercise } from '@/types/exercise';

export const projecoesExercises: Exercise[] = [
  {
    id: 'prj-01',
    topicId: 'al-ortogonalidade-projecoes',
    kind: 'choice',
    prompt: 'Quais destes pares de vetores são ortogonais entre si?',
    options: ['(1, 2) e (2, 4)', '(3, 1) e (−1, 3)', '(2, 2) e (3, 3)', '(1, 0) e (5, 0)'],
    answer: 1,
    hints: [
      'Calcule o produto escalar de cada par. Ortogonal é aquele que dá exatamente zero.',
      'Para (3, 1) e (−1, 3): (3)(−1) + (1)(3) = −3 + 3.',
    ],
    solution:
      'O par (3, 1) e (−1, 3) é ortogonal: (3)(−1) + (1)(3) = −3 + 3 = 0 ✓. ' +
      'Os outros não são: (1,2)·(2,4) = 2 + 8 = 10; (2,2)·(3,3) = 6 + 6 = 12; ' +
      '(1,0)·(5,0) = 5 + 0 = 5. ' +
      'Repare no padrão do par correto: para achar um vetor perpendicular a (a, b) em 2D, ' +
      'basta trocar as componentes de lugar e inverter um sinal → (−b, a). Truque útil de prova.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'prj-02',
    topicId: 'al-ortogonalidade-projecoes',
    kind: 'text',
    prompt:
      'Calcule a projeção de a = (4, 3) sobre b = (1, 0). Responda no formato "x,y".',
    answer: '4,0',
    accept: ['4,0', '(4,0)', '4, 0', '(4, 0)', '4 0'],
    hints: [
      'Use proj = (a·b / ‖b‖²) · b. Comece calculando a·b = (4)(1) + (3)(0).',
      '‖b‖² = 1² + 0² = 1. Então o fator é 4/1 = 4.',
      'Agora multiplique o vetor b = (1, 0) por esse fator 4.',
    ],
    solution:
      'a · b = (4)(1) + (3)(0) = 4. ‖b‖² = 1² + 0² = 1. Fator = 4/1 = 4. ' +
      'proj = 4 · (1, 0) = (4, 0). ' +
      'Faz todo sentido geometricamente: b aponta na direção horizontal, então a sombra de a sobre ' +
      'ele é justamente a componente horizontal de a, que é 4. A componente vertical (3) é ' +
      'perpendicular a b e por isso não aparece na projeção.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'prj-03',
    topicId: 'al-ortogonalidade-projecoes',
    kind: 'choice',
    prompt: 'Se a projeção de a sobre b resultou no vetor nulo (0, 0), o que podemos concluir?',
    options: [
      'Que a é o vetor nulo',
      'Que a e b são ortogonais',
      'Que a e b são paralelos',
      'Que b é maior que a',
    ],
    answer: 1,
    hints: [
      'A projeção é (a·b / ‖b‖²)·b. Para o resultado ser nulo (com b ≠ 0), quem precisa ser zero?',
      'O fator só zera se a·b = 0 — e produto escalar zero significa ortogonalidade.',
    ],
    solution:
      'Projeção nula significa que a e b são ORTOGONAIS. ' +
      'Olhando a fórmula proj = (a·b / ‖b‖²)·b: para o resultado ser o vetor nulo, o fator precisa ' +
      'ser zero, o que exige a·b = 0 — exatamente a condição de ortogonalidade. ' +
      'A leitura geométrica: se a é perpendicular a b, ele não tem NENHUMA componente na direção de ' +
      'b, então a sombra desaparece completamente.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'prj-04',
    topicId: 'al-ortogonalidade-projecoes',
    kind: 'choice',
    prompt: 'A decomposição de um vetor a em relação a b separa a em quais duas partes?',
    options: [
      'Uma parte positiva e uma parte negativa',
      'Uma parte paralela a b (a projeção) e uma parte perpendicular a b',
      'Duas partes de mesmo tamanho',
      'A norma e a direção',
    ],
    answer: 1,
    hints: [
      'Volte ao gráfico da aula: a seta verde (projeção) e a linha tracejada cinza.',
      'A tracejada forma 90° com b, e a verde está na mesma direção de b.',
    ],
    solution:
      'Todo vetor a se decompõe em: uma parte PARALELA a b (que é a projeção) e uma parte ' +
      'PERPENDICULAR a b (o que sobra, ou seja, a − proj). ' +
      'Em fórmula: a = proj_b(a) + (a − proj_b(a)). ' +
      'Essa separação é a base de métodos como mínimos quadrados, Gram-Schmidt e decomposição QR — ' +
      'todos eles funcionam separando "o que está na direção que interessa" do "resto".',
    xpReward: 35,
    difficulty: 2,
  },
];
