import { Exercise } from '@/types/exercise';

export const fracoesExercises: Exercise[] = [
  {
    id: 'fra-01',
    topicId: 'fund-fracoes',
    kind: 'text',
    prompt: 'Quanto é 1/4 + 1/2? Responda no formato "a/b".',
    answer: '3/4',
    accept: ['3/4', '0.75', '0,75'],
    hints: [
      'Os denominadores são 4 e 2 — diferentes, então precisa igualar antes de somar.',
      '1/2 é o mesmo que 2/4 (multiplicou em cima e embaixo por 2). Agora os dois têm denominador 4.',
      'Some só os de cima: 1/4 + 2/4 = ?/4',
    ],
    solution:
      'Igualando os denominadores: 1/2 = 2/4. Agora 1/4 + 2/4 = 3/4. ' +
      'O denominador continua 4 porque o tamanho das fatias não mudou — só contamos quantas temos. ' +
      'Confira pela intuição: 1/4 é um quarto e 1/2 é metade; juntos dão três quartos, que é quase ' +
      'o inteiro. Faz sentido.',
    xpReward: 30,
    difficulty: 1,
  },
  {
    id: 'fra-02',
    topicId: 'fund-fracoes',
    kind: 'text',
    prompt: 'Quanto é 2/5 × 5/6? Simplifique. Responda no formato "a/b".',
    answer: '1/3',
    accept: ['1/3', '10/30', '2/6'],
    hints: [
      'Multiplicação de fração NÃO precisa de denominador comum — multiplique reto.',
      'De cima: 2 × 5 = 10. De baixo: 5 × 6 = 30. Fica 10/30.',
      'Simplifique 10/30 dividindo os dois por 10.',
    ],
    solution:
      '2/5 × 5/6 = (2×5)/(5×6) = 10/30. Simplificando (dividindo os dois por 10): 1/3. ' +
      'Repare que multiplicar é o caso FÁCIL — não precisa igualar denominador, isso só vale para ' +
      'soma e subtração. Muita gente complica multiplicação achando que precisa do mesmo processo.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'fra-03',
    topicId: 'fund-fracoes',
    kind: 'numeric',
    prompt: 'Quanto é 10 ÷ (1/2)?',
    answer: 20,
    hints: [
      'Dividir por uma fração é multiplicar pelo inverso dela.',
      'O inverso de 1/2 é 2/1, ou seja, 2. Então a conta vira 10 × 2.',
    ],
    solution:
      '10 ÷ (1/2) = 10 × 2 = 20. ' +
      'Leia a pergunta assim: "quantas metades cabem em 10?" Cabem 20. ' +
      'O resultado AUMENTAR é o esperado: dividir por um número menor que 1 sempre aumenta. ' +
      'Se sua resposta foi 5, você dividiu por 2 em vez de dividir por meio.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'fra-04',
    topicId: 'fund-fracoes',
    kind: 'text',
    prompt:
      'No escalonamento, você precisa dividir a linha [2, 6, 8] pelo pivô 4. Qual o primeiro elemento do resultado? Responda no formato "a/b" ou número.',
    answer: '1/2',
    accept: ['1/2', '0.5', '0,5'],
    hints: [
      'Dividir 2 por 4 dá a fração 2/4.',
      'Simplifique 2/4 dividindo os dois números por 2.',
    ],
    solution:
      '2 ÷ 4 = 2/4 = 1/2. ' +
      'É exatamente isso que acontece no tópico 3 de GAAL: ao normalizar o pivô, aparecem frações ' +
      'e elas seguem pela linha inteira. Por isso o site mostra 1/2 em vez de 0,5 — fração exata ' +
      'não acumula erro de arredondamento e deixa a conta mais fácil de conferir.',
    xpReward: 35,
    difficulty: 2,
  },
];

export const sinaisExercises: Exercise[] = [
  {
    id: 'sin-01',
    topicId: 'fund-sinais',
    kind: 'numeric',
    prompt: 'Quanto é 8 − (−5)?',
    answer: 13,
    hints: [
      'Subtrair um número negativo: os dois sinais de menos se juntam.',
      'Menos com menos vira mais: 8 − (−5) = 8 + 5.',
    ],
    solution:
      '8 − (−5) = 8 + 5 = 13. Os dois sinais de menos se cancelam e viram soma. ' +
      'Pela analogia da dívida: você tem 8 e alguém tira uma dívida de 5 de você — você melhorou, ' +
      'subiu para 13. ' +
      'Se você respondeu 3, tratou como 8 − 5, ignorando um dos sinais.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'sin-02',
    topicId: 'fund-sinais',
    kind: 'numeric',
    prompt: 'Quanto é (−6) × (−7)?',
    answer: 42,
    hints: [
      'Multiplicação: primeiro decida o SINAL, depois faça a conta dos números.',
      'Sinais iguais (dois negativos) na multiplicação dão POSITIVO. Agora é só 6 × 7.',
    ],
    solution:
      '(−6) × (−7) = +42. Sinais iguais na multiplicação resultam em positivo. ' +
      'A técnica que evita erro: resolva o sinal primeiro ("dois negativos → positivo"), depois ' +
      'multiplique 6 × 7 = 42. Separar as duas decisões impede que você esqueça uma no meio da conta.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'sin-03',
    topicId: 'fund-sinais',
    kind: 'numeric',
    prompt: 'Quanto é (−4) + (−9)?',
    answer: -13,
    hints: [
      'Atenção: isto é SOMA, não multiplicação. A regra é diferente.',
      'Dois negativos somados afundam mais ainda: pense em dever 4 e depois dever mais 9.',
    ],
    solution:
      '(−4) + (−9) = −13. ' +
      'Aqui está a pegadinha: na SOMA, dois negativos continuam negativo — eles se acumulam. ' +
      'A regra "menos com menos dá mais" vale só para MULTIPLICAÇÃO e divisão (e para subtrair um ' +
      'negativo). Se você respondeu +13, misturou as duas regras — é o erro mais comum do tópico.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'sin-04',
    topicId: 'fund-sinais',
    kind: 'numeric',
    prompt:
      'Calcule (3)(−4) + (2)(6). (É o produto escalar entre os vetores (3,2) e (−4,6) de GAAL.)',
    answer: 0,
    hints: [
      'Faça as duas multiplicações separadamente primeiro, cuidando dos sinais.',
      '(3)(−4): sinais diferentes → negativo → −12. E (2)(6) = 12.',
      'Agora some: −12 + 12.',
    ],
    solution:
      '(3)(−4) = −12 (sinais diferentes → negativo). (2)(6) = +12. Somando: −12 + 12 = 0. ' +
      'Este é exatamente o cálculo do tópico 6 de GAAL: produto escalar ZERO significa que os ' +
      'vetores são ortogonais (perpendiculares). ' +
      'Repare como um erro de sinal aqui mudaria a resposta para −24 ou +24, e você concluiria ' +
      'errado que os vetores não são perpendiculares.',
    xpReward: 40,
    difficulty: 2,
  },
];

export const potenciasExercises: Exercise[] = [
  {
    id: 'pot-01',
    topicId: 'fund-potencias',
    kind: 'numeric',
    prompt: 'Quanto é 7²?',
    answer: 49,
    hints: [
      'O expoente 2 significa que o 7 aparece DUAS VEZES na multiplicação.',
      'Calcule 7 × 7 (não 7 × 2).',
    ],
    solution:
      '7² = 7 × 7 = 49. ' +
      'O erro clássico é fazer 7 × 2 = 14. O expoente diz QUANTAS VEZES o número aparece na ' +
      'multiplicação, não por quanto multiplicar. ' +
      'Vale reconhecer 49 como quadrado perfeito — assim você calcula √49 = 7 na hora.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pot-02',
    topicId: 'fund-potencias',
    kind: 'numeric',
    prompt: 'Quanto é (−5)²?',
    answer: 25,
    hints: [
      '(−5)² significa (−5) × (−5).',
      'Sinais iguais na multiplicação dão positivo. Então 5 × 5 com sinal positivo.',
    ],
    solution:
      '(−5)² = (−5) × (−5) = +25. ' +
      'Expoente PAR sempre elimina o sinal negativo, porque os negativos se multiplicam aos pares e ' +
      'viram positivo. Expoente ÍMPAR preservaria: (−5)³ = −125. ' +
      'É por isso que a norma de um vetor nunca é negativa — ela soma quadrados, e todo quadrado é ' +
      'positivo.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pot-03',
    topicId: 'fund-potencias',
    kind: 'numeric',
    prompt: 'Quanto é √81?',
    answer: 9,
    hints: [
      'A raiz pergunta: que número multiplicado por ele mesmo dá 81?',
      'Teste: 8 × 8 = 64 (pouco). 9 × 9 = ?',
    ],
    solution:
      '√81 = 9, porque 9 × 9 = 81. ' +
      'Raiz quadrada NÃO é dividir por 2 — 81 ÷ 2 = 40,5, que não tem nada a ver. ' +
      'Raiz é a operação que desfaz o quadrado: se 9² = 81, então √81 = 9.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pot-04',
    topicId: 'fund-potencias',
    kind: 'numeric',
    prompt:
      'Um triângulo retângulo tem catetos 6 e 8. Quanto mede a hipotenusa? (É a mesma conta da norma do vetor (6,8).)',
    answer: 10,
    hints: [
      'Pitágoras: h² = a² + b². Comece elevando cada cateto ao quadrado.',
      '6² = 36 e 8² = 64. Some: 36 + 64 = 100.',
      'Não pare no 100 — esse é h². Tire a raiz de 100.',
    ],
    solution:
      'h² = 6² + 8² = 36 + 64 = 100. Então h = √100 = 10. ' +
      'O passo final (tirar a raiz) é o mais esquecido: 100 é o QUADRADO da hipotenusa, não a ' +
      'hipotenusa. ' +
      'Esta é literalmente a norma do vetor (6, 8) no tópico 6 de GAAL: ‖v‖ = √(6² + 8²) = 10.',
    xpReward: 40,
    difficulty: 2,
  },
];

export const equacoesExercises: Exercise[] = [
  {
    id: 'equ-01',
    topicId: 'fund-equacoes',
    kind: 'numeric',
    prompt: 'Se x + 9 = 14, quanto vale x?',
    answer: 5,
    hints: [
      'O 9 está SOMANDO junto do x. Qual operação desfaz uma soma?',
      'Subtraia 9 dos DOIS lados: x + 9 − 9 = 14 − 9.',
    ],
    solution:
      'Subtraindo 9 dos dois lados: x + 9 − 9 = 14 − 9, ou seja, x = 5. ' +
      'Conferindo na equação original: 5 + 9 = 14 ✓. ' +
      'A regra da balança: o que você faz de um lado, faz igual do outro — assim a igualdade ' +
      'continua verdadeira.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'equ-02',
    topicId: 'fund-equacoes',
    kind: 'numeric',
    prompt: 'Se 5x = 35, quanto vale x?',
    answer: 7,
    hints: [
      'O x está sendo MULTIPLICADO por 5. Qual operação desfaz uma multiplicação?',
      'Divida os dois lados por 5: 5x/5 = 35/5.',
    ],
    solution:
      'Dividindo os dois lados por 5: x = 35/5 = 7. ' +
      'Conferindo: 5(7) = 35 ✓. ' +
      'Divisão desfaz multiplicação, assim como subtração desfaz soma. Sempre aplique a operação ' +
      'inversa daquilo que está grudado no x.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'equ-03',
    topicId: 'fund-equacoes',
    kind: 'numeric',
    prompt: 'Se 4x + 8 = 32, quanto vale x?',
    answer: 6,
    hints: [
      'Duas etapas. Primeiro tire o que está SOMANDO (o 8), depois o que está multiplicando.',
      'Subtraia 8 dos dois lados: 4x = 24.',
      'Agora divida os dois lados por 4.',
    ],
    solution:
      'Etapa 1: subtraio 8 dos dois lados → 4x = 24. ' +
      'Etapa 2: divido os dois lados por 4 → x = 6. ' +
      'Conferindo: 4(6) + 8 = 24 + 8 = 32 ✓. ' +
      'A ordem importa para facilitar: se dividisse tudo por 4 primeiro, apareceria 8/4 no caminho. ' +
      'Dá o mesmo resultado, mas com mais chance de errar. Tire primeiro soma/subtração.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'equ-04',
    topicId: 'fund-equacoes',
    kind: 'numeric',
    prompt:
      'Resolva 12 − 4k = 0. (É a equação que aparece em GAAL para achar k que torna dois vetores ortogonais.)',
    answer: 3,
    hints: [
      'O −4k está atrapalhando. Some 4k dos dois lados para ele mudar de lado: 12 = 4k.',
      'Agora divida os dois lados por 4.',
    ],
    solution:
      'Somando 4k dos dois lados: 12 = 4k. Dividindo por 4: k = 3. ' +
      'Conferindo: 12 − 4(3) = 12 − 12 = 0 ✓. ' +
      'Esta é exatamente a questão "determine k para que (2, k) e (6, −4) sejam ortogonais" do ' +
      'tópico 6 de GAAL. O produto escalar vira 12 − 4k, você iguala a zero e resolve. ' +
      'A matemática nova é o conceito de ortogonalidade; a conta é esta aqui, que você acabou de fazer.',
    xpReward: 45,
    difficulty: 2,
  },
];
