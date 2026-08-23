import { Exercise } from '@/types/exercise';

export const normaExercises: Exercise[] = [
  {
    id: 'nor-01',
    topicId: 'al-norma-produto-escalar',
    kind: 'numeric',
    prompt: 'Qual é a norma (comprimento) do vetor v = (6, 8)?',
    answer: 10,
    hints: [
      'A norma é √(x² + y²) — Pitágoras com as componentes.',
      'Calcule 6² = 36 e 8² = 64, depois some: 36 + 64 = 100.',
      'Agora tire a raiz de 100.',
    ],
    solution:
      '‖v‖ = √(6² + 8²) = √(36 + 64) = √100 = 10. ' +
      'Este é o famoso triângulo 6-8-10 (múltiplo do 3-4-5). ' +
      'Repare que o vetor (−6, −8) teria exatamente a mesma norma, porque os quadrados eliminam ' +
      'os sinais — norma é distância, e distância nunca é negativa.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'nor-02',
    topicId: 'al-norma-produto-escalar',
    kind: 'numeric',
    prompt: 'Calcule o produto escalar entre a = (3, 4) e b = (2, 5).',
    answer: 26,
    hints: [
      'Multiplique as componentes x entre si: 3 × 2.',
      'Multiplique as componentes y entre si: 4 × 5.',
      'Some os dois resultados: 6 + 20.',
    ],
    solution:
      'a · b = (3)(2) + (4)(5) = 6 + 20 = 26. ' +
      'O resultado é um NÚMERO, não um vetor — por isso se chama produto "escalar". ' +
      'Como deu positivo, sabemos que o ângulo entre eles é agudo (menor que 90°), ou seja, ' +
      'apontam para lados razoavelmente parecidos.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'nor-03',
    topicId: 'al-norma-produto-escalar',
    kind: 'numeric',
    prompt: 'Qual é o produto escalar entre a = (3, 2) e b = (−4, 6)?',
    answer: 0,
    hints: [
      'Faça (3)(−4) primeiro. Atenção ao sinal: positivo vezes negativo dá negativo.',
      'Agora (2)(6) = 12. Some com o resultado anterior: −12 + 12.',
    ],
    solution:
      'a · b = (3)(−4) + (2)(6) = −12 + 12 = 0. ' +
      'Produto escalar ZERO significa que os vetores são ORTOGONAIS (perpendiculares, 90° entre si). ' +
      'Este é o teste padrão de perpendicularidade — e é muito mais rápido do que calcular o ângulo. ' +
      'Sempre que uma questão perguntar se dois vetores são perpendiculares, calcule o produto ' +
      'escalar e veja se zera.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'nor-04',
    topicId: 'al-norma-produto-escalar',
    kind: 'choice',
    prompt: 'O produto escalar entre dois vetores deu −15. O que isso significa?',
    options: [
      'Os vetores são perpendiculares',
      'O ângulo entre eles é maior que 90° (obtuso)',
      'Um dos vetores tem norma negativa',
      'O cálculo está errado, produto escalar não pode ser negativo',
    ],
    answer: 1,
    hints: [
      'Use a fórmula a · b = ‖a‖·‖b‖·cos(θ). As normas são sempre positivas.',
      'Se o produto deu negativo e as normas são positivas, quem tem que ser negativo é o cos(θ). E o cosseno é negativo entre 90° e 180°.',
    ],
    solution:
      'Produto escalar negativo indica ângulo OBTUSO (entre 90° e 180°): os vetores apontam para ' +
      'lados opostos. ' +
      'A justificativa vem de a · b = ‖a‖·‖b‖·cos(θ): as normas são sempre positivas, então o sinal ' +
      'do produto é o sinal do cos(θ). E o cosseno só é negativo para ângulos maiores que 90°. ' +
      'As outras alternativas erram porque perpendicular daria zero, e norma nunca é negativa.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'nor-05',
    topicId: 'al-norma-produto-escalar',
    kind: 'numeric',
    prompt:
      'Determine o valor de k para que os vetores a = (2, k) e b = (6, −4) sejam ortogonais.',
    answer: 3,
    hints: [
      'Ortogonais significa produto escalar igual a zero. Monte a equação a · b = 0.',
      'a · b = (2)(6) + (k)(−4) = 12 − 4k. Iguale a zero: 12 − 4k = 0.',
      'Resolva: 4k = 12.',
    ],
    solution:
      'Ortogonais ⟺ produto escalar = 0. Montando: (2)(6) + (k)(−4) = 0 → 12 − 4k = 0 → 4k = 12 → k = 3. ' +
      'Conferindo com k = 3: (2)(6) + (3)(−4) = 12 − 12 = 0 ✓. ' +
      'Esse tipo de questão cai direto em prova, e a receita é sempre a mesma: escreve o produto ' +
      'escalar com a incógnita, iguala a zero, resolve a equação de primeiro grau.',
    xpReward: 40,
    difficulty: 3,
  },
];
