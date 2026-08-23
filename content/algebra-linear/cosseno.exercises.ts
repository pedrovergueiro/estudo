import { Exercise } from '@/types/exercise';

export const cossenoExercises: Exercise[] = [
  {
    id: 'cos-01',
    topicId: 'al-similaridade-cosseno',
    kind: 'numeric',
    prompt:
      'Calcule a similaridade do cosseno entre a = (1, 0) e b = (0, 1). (Resposta entre −1 e 1)',
    answer: 0,
    hints: [
      'cos(θ) = (a·b) / (‖a‖·‖b‖). Comece pelo numerador: a·b = (1)(0) + (0)(1).',
      'O numerador deu 0. Quando o numerador é zero, a fração inteira é zero (as normas valem 1).',
    ],
    solution:
      'a · b = (1)(0) + (0)(1) = 0. ‖a‖ = 1 e ‖b‖ = 1. Então cos(θ) = 0/(1×1) = 0. ' +
      'Similaridade 0 significa vetores ortogonais, ângulo de 90°. ' +
      'Traduzindo para embeddings: seriam duas palavras completamente sem relação semântica — ' +
      'o modelo não vê nenhuma sobreposição de significado entre elas.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cos-02',
    topicId: 'al-similaridade-cosseno',
    kind: 'numeric',
    prompt: 'Calcule a similaridade do cosseno entre a = (2, 0) e b = (5, 0).',
    answer: 1,
    hints: [
      'a·b = (2)(5) + (0)(0) = 10.',
      '‖a‖ = 2 e ‖b‖ = 5, então o denominador é 2 × 5 = 10.',
      'A fração fica 10/10.',
    ],
    solution:
      'a · b = 10. ‖a‖ = 2, ‖b‖ = 5, denominador = 10. Logo cos(θ) = 10/10 = 1. ' +
      'Similaridade 1 = direções idênticas (ângulo 0°). ' +
      'E este exemplo mostra exatamente por que usamos cosseno em vez de distância: os vetores têm ' +
      'TAMANHOS bem diferentes (2 e 5), mas apontam para o mesmo lado. A similaridade do cosseno ' +
      'ignora o tamanho e enxerga que, em direção, eles são iguais.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cos-03',
    topicId: 'al-similaridade-cosseno',
    kind: 'choice',
    prompt:
      'Por que sistemas de IA preferem similaridade do cosseno à distância euclidiana ao comparar embeddings?',
    options: [
      'Porque o cosseno é mais rápido de calcular',
      'Porque o cosseno ignora o tamanho dos vetores e compara apenas a direção (o significado)',
      'Porque a distância euclidiana não funciona em muitas dimensões',
      'Porque o cosseno sempre dá números inteiros',
    ],
    answer: 1,
    hints: [
      'Pense no que o TAMANHO de um embedding costuma representar — geralmente frequência da palavra, não significado.',
      'Duas palavras de significado igual podem ter vetores de comprimentos bem diferentes.',
    ],
    solution:
      'O cosseno normaliza pelas normas, então o tamanho dos vetores desaparece da conta e sobra só ' +
      'a direção — que é o que carrega o significado. ' +
      'O comprimento de um embedding costuma refletir frequência da palavra no treino, algo ' +
      'irrelevante para comparar sentido. Duas palavras sinônimas podem ter vetores de tamanhos ' +
      'muito diferentes; pela distância pareceriam distintas, pelo ângulo são quase idênticas.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cos-04',
    topicId: 'al-similaridade-cosseno',
    kind: 'choice',
    prompt:
      'Num relatório do Projeto Integrador, qual seria uma LIMITAÇÃO válida da similaridade do cosseno?',
    options: [
      'Ela só funciona com vetores de 2 dimensões',
      'Ela mede proximidade de direção no espaço vetorial, o que nem sempre corresponde a significado real (ex: ironia, negação)',
      'Ela não pode ser calculada por computadores',
      'Ela sempre retorna valores maiores que 1',
    ],
    answer: 1,
    hints: [
      'A métrica mede geometria. Pense em casos onde a geometria do embedding não captura bem o sentido.',
      'Frases como "eu gosto disso" e "eu não gosto disso" têm vetores parecidos, mas sentidos opostos.',
    ],
    solution:
      'A limitação real: a métrica mede proximidade GEOMÉTRICA no espaço de embeddings, e isso é ' +
      'apenas uma aproximação de significado. Se o embedding foi mal treinado, ou se o contexto ' +
      'importa muito (ironia, negação, ambiguidade), a similaridade engana. Frases como "gosto ' +
      'disso" e "não gosto disso" ficam próximas no espaço apesar de sentidos opostos. ' +
      'O guia da disciplina pede "análise crítica das limitações" — este é exatamente o tipo de ' +
      'observação que a rubrica espera, e vale ponto.',
    xpReward: 40,
    difficulty: 3,
  },
];
