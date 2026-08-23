import { Exercise } from '@/types/exercise';

export const vetoresExercises: Exercise[] = [
  {
    id: 'vet-01',
    topicId: 'al-vetores-def',
    kind: 'text',
    prompt:
      'Qual é o vetor que vai do ponto A(1, 2) até o ponto B(5, 7)? Responda no formato "x,y".',
    answer: '4,5',
    accept: ['4,5', '(4,5)', '4, 5', '(4, 5)', '4 5'],
    hints: [
      'A regra é: DESTINO menos ORIGEM. O destino é B, a origem é A.',
      'Calcule (5 − 1) para a componente x e (7 − 2) para a componente y.',
    ],
    solution:
      'O vetor AB = B − A = (5 − 1, 7 − 2) = (4, 5). ' +
      'A ordem importa muito: se você fizesse A − B daria (−4, −5), que é o vetor no sentido ' +
      'contrário (de B para A). O macete para não errar: o vetor "de A para B" termina em B, ' +
      'então B vem primeiro na subtração.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'vet-02',
    topicId: 'al-vetores-def',
    kind: 'text',
    prompt: 'Se a = (2, 5) e b = (3, −1), quanto vale a + b? Responda no formato "x,y".',
    answer: '5,4',
    accept: ['5,4', '(5,4)', '5, 4', '(5, 4)', '5 4'],
    hints: [
      'Some as componentes x entre si e as componentes y entre si, separadamente.',
      'x: 2 + 3. y: 5 + (−1), que é 5 − 1.',
    ],
    solution:
      'a + b = (2 + 3, 5 + (−1)) = (5, 4). ' +
      'Componente x com componente x, componente y com componente y — elas nunca se misturam. ' +
      'Cuidado com o sinal negativo do segundo vetor: somar −1 é o mesmo que subtrair 1.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'vet-03',
    topicId: 'al-vetores-def',
    kind: 'text',
    prompt: 'Se v = (4, −2), quanto vale 3v? Responda no formato "x,y".',
    answer: '12,-6',
    accept: ['12,-6', '(12,-6)', '12, -6', '(12, -6)', '12 -6'],
    hints: [
      'Multiplicação por escalar: cada componente é multiplicada pelo número.',
      'x: 4 × 3 = 12. y: (−2) × 3 = −6.',
    ],
    solution:
      '3v = (3 × 4, 3 × (−2)) = (12, −6). ' +
      'Como 3 é positivo e maior que 1, o vetor ficou 3 vezes mais comprido mas continua apontando ' +
      'exatamente na mesma direção. Se o escalar fosse negativo, o vetor inverteria o sentido.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'vet-04',
    topicId: 'al-vetores-def',
    kind: 'choice',
    prompt: 'Qual afirmação sobre vetores é VERDADEIRA?',
    options: [
      'O vetor (3, 4) é o mesmo que o ponto (3, 4)',
      'Um vetor representa um deslocamento e pode ser desenhado a partir de qualquer ponto',
      'Multiplicar um vetor por −1 não muda nada',
      'A soma de dois vetores sempre resulta num vetor maior que ambos',
    ],
    answer: 1,
    hints: [
      'Pense na diferença entre "onde algo está" (ponto) e "quanto se anda" (vetor).',
      'Dois vetores com as mesmas componentes são iguais, mesmo desenhados em lugares diferentes do plano.',
    ],
    solution:
      'A correta é a segunda: vetor é deslocamento, não posição. Desenhar a partir da origem é só ' +
      'uma convenção conveniente. ' +
      'As outras erram porque: (1) ponto é localização, vetor é deslocamento — conceitos distintos; ' +
      '(3) multiplicar por −1 inverte o sentido do vetor; (4) se os vetores apontarem para lados ' +
      'opostos, a soma pode ser menor que ambos — no extremo, pode dar o vetor nulo.',
    xpReward: 30,
    difficulty: 2,
  },
];
