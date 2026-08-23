import { Exercise } from '@/types/exercise';

/** Exercícios da seção 2.1 do Stewart — tangente e velocidade. */

export const tangenteVelocidadeExercises: Exercise[] = [
  {
    id: 'ctan-01',
    topicId: 'cal-tangente-velocidade',
    kind: 'numeric',
    prompt:
      'Na curva y = x², qual é a inclinação da reta secante que passa por P(1, 1) e Q(3, 9)?',
    answer: 4,
    hints: [
      'Inclinação de reta por dois pontos: variação de y dividida pela variação de x.',
      '(9 − 1) dividido por (3 − 1).',
    ],
    solution:
      'm(PQ) = (9 − 1)/(3 − 1) = 8/2 = 4. ' +
      'Essa é a inclinação da SECANTE, não da tangente — o ponto Q ainda está longe de P. ' +
      'Para estimar a tangente em P você precisa repetir essa conta com Q cada vez mais perto de P e ver ' +
      'para onde o resultado caminha.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'ctan-02',
    topicId: 'cal-tangente-velocidade',
    kind: 'numeric',
    prompt:
      'Ainda em y = x² com P(1, 1): calcule a inclinação da secante quando Q tem x = 1,01.',
    answer: 2.01,
    hints: [
      'Você pode fazer a conta bruta ou usar a simplificação: (x² − 1)/(x − 1) = x + 1, para x ≠ 1.',
      'Com a fórmula simplificada, basta somar 1 ao valor de x.',
      '1,01 + 1.',
    ],
    solution:
      'm(PQ) = (1,01² − 1)/(1,01 − 1) = (1,0201 − 1)/0,01 = 0,0201/0,01 = 2,01. ' +
      'Bem mais rápido pela fatoração: (x² − 1)/(x − 1) = (x − 1)(x + 1)/(x − 1) = x + 1, logo 1,01 + 1 = 2,01. ' +
      'Repare que o valor está encostando em 2 — que é a inclinação da tangente. ' +
      'A simplificação só vale porque x ≠ 1: se Q fosse o próprio P, a conta viraria 0/0.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ctan-03',
    topicId: 'cal-tangente-velocidade',
    kind: 'choice',
    prompt:
      'Por que não se calcula a inclinação da tangente simplesmente usando o ponto P duas vezes na fórmula?',
    options: [
      'Porque a fórmula exige que os pontos estejam em quadrantes diferentes',
      'Porque daria 0/0: numerador e denominador zeram, e a divisão não decide nada',
      'Porque a tangente não tem inclinação definida',
      'Porque a fórmula só vale para retas, não para curvas',
    ],
    answer: 1,
    hints: [
      'Escreva a fórmula com os dois pontos iguais a P(a, f(a)). O que dá em cima e o que dá embaixo?',
      'f(a) − f(a) = 0 e a − a = 0.',
    ],
    solution:
      'Usando P nos dois lugares: [f(a) − f(a)]/(a − a) = 0/0 — indeterminado, não decide nada. ' +
      'Esse impasse é EXATAMENTE o motivo de o capítulo de limites existir. A saída não é chegar no ponto, ' +
      'e sim se APROXIMAR dele: manter Q ≠ P, calcular a secante, e observar para onde o valor tende. ' +
      'É a mesma razão pela qual a definição formal escreve 0 < |x − a| < δ: o ponto em si fica sempre de fora.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ctan-04',
    topicId: 'cal-tangente-velocidade',
    kind: 'numeric',
    prompt:
      'Estime a inclinação da reta tangente a y = x³ no ponto P(1, 1). (Simplifique (x³ − 1)/(x − 1) e veja para onde tende.)',
    answer: 3,
    hints: [
      'Diferença de cubos: x³ − 1 = (x − 1)(x² + x + 1).',
      'Cancelando o (x − 1), sobra x² + x + 1.',
      'Agora faça x se aproximar de 1: 1 + 1 + 1.',
    ],
    solution:
      'm(PQ) = (x³ − 1)/(x − 1) = (x − 1)(x² + x + 1)/(x − 1) = x² + x + 1, para x ≠ 1. ' +
      'Aproximando x de 1: 1² + 1 + 1 = 3. Logo a tangente tem inclinação 3, e sua equação é ' +
      'y − 1 = 3(x − 1), ou seja y = 3x − 2. ' +
      'Guarde o padrão: para y = x², deu 2; para y = x³, deu 3. Daqui a alguns capítulos isso vira a ' +
      'regra da potência da derivada — mas por enquanto é só o limite fazendo o trabalho.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'ctan-05',
    topicId: 'cal-tangente-velocidade',
    kind: 'numeric',
    prompt:
      'Uma bola cai e percorre s(t) = 4,9t² metros em t segundos. Qual a velocidade MÉDIA no intervalo [5, 6], em m/s?',
    answer: 53.9,
    hints: [
      'Velocidade média é a distância percorrida dividida pelo tempo gasto.',
      's(6) = 4,9 · 36 = 176,4 e s(5) = 4,9 · 25 = 122,5. O intervalo dura 1 segundo.',
      '(176,4 − 122,5) dividido por 1.',
    ],
    solution:
      's(6) = 4,9 · 6² = 4,9 · 36 = 176,4 m e s(5) = 4,9 · 5² = 4,9 · 25 = 122,5 m. ' +
      'Velocidade média = (176,4 − 122,5)/(6 − 5) = 53,9/1 = 53,9 m/s. ' +
      'Isso NÃO é a velocidade em t = 5: é a média ao longo de um segundo inteiro, durante o qual a bola ' +
      'acelerou bastante. Para chegar no instante, o intervalo precisa encolher.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'ctan-06',
    topicId: 'cal-tangente-velocidade',
    kind: 'numeric',
    prompt:
      'Com a mesma s(t) = 4,9t², a velocidade média em [5, 5 + h] simplifica para 4,9(10 + h). Qual é a velocidade INSTANTÂNEA em t = 5, em m/s?',
    answer: 49,
    hints: [
      'Velocidade instantânea é o valor de que a média se aproxima quando o intervalo encolhe.',
      'Faça h ficar cada vez menor na expressão 4,9(10 + h): h = 0,1; depois 0,01; depois 0,001.',
      'O h desaparece e sobra 4,9 · 10.',
    ],
    solution:
      'Quando h → 0, a expressão 4,9(10 + h) tende a 4,9 · 10 = 49 m/s. ' +
      'Confirmando pela tabela: h = 1 → 53,9; h = 0,1 → 49,49; h = 0,01 → 49,049; h = 0,001 → 49,0049. ' +
      'Os valores encostam em 49 sem nunca atingi-lo com h ≠ 0. ' +
      'Detalhe que vale escrever na entrega: o cancelamento do h em 4,9(10h + h²)/h só é permitido porque ' +
      'h ≠ 0 durante todo o processo — a gente se aproxima do instante, nunca chega nele.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ctan-07',
    topicId: 'cal-tangente-velocidade',
    kind: 'choice',
    prompt:
      'O que o problema da tangente e o problema da velocidade têm em comum, matematicamente?',
    options: [
      'Nada — só aparecem no mesmo capítulo por conveniência',
      'Ambos são uma variação dividida pela variação que a causou, com o intervalo tendendo a zero',
      'Ambos exigem que a função seja uma parábola',
      'Ambos são resolvidos por regra de três',
    ],
    answer: 1,
    hints: [
      'Escreva as duas fórmulas uma embaixo da outra e compare a estrutura, ignorando os nomes das letras.',
      'Tangente: [f(x) − f(a)]/(x − a). Velocidade: [s(t) − s(a)]/(t − a).',
    ],
    solution:
      'São a MESMA fórmula com letras trocadas: uma variação da saída dividida pela variação da entrada, ' +
      'seguida do encolhimento do intervalo até zero. ' +
      'Esse objeto se chama taxa de variação instantânea, e alguns capítulos adiante ganha o nome de DERIVADA. ' +
      'É por isso que a seção 2.1 abre o capítulo sem ensinar técnica nenhuma: ela mostra por que alguém ' +
      'precisou inventar limite. As seções 2.2 a 2.4 constroem a ferramenta que responde estas duas perguntas com rigor.',
    xpReward: 35,
    difficulty: 2,
  },
];
