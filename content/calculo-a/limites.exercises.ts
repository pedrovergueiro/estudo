import { Exercise } from '@/types/exercise';

export const limiteIntuitivoExercises: Exercise[] = [
  {
    id: 'clim-01',
    topicId: 'cal-limite-intuitivo',
    kind: 'numeric',
    prompt: 'Calcule lim(x→1) (x + 2).',
    answer: 3,
    hints: [
      'Esta função é um polinômio, contínua em todo ponto. O primeiro passo é sempre substituir.',
      'Substitua x por 1: 1 + 2.',
    ],
    solution:
      'lim(x→1) (x + 2) = 1 + 2 = 3. ' +
      'Funciona por substituição direta porque a função é contínua em x = 1 — e continuidade significa ' +
      'exatamente que o limite coincide com o valor da função. ' +
      'Na prova, vale escrever essa justificativa: "por continuidade da função polinomial".',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'clim-02',
    topicId: 'cal-limite-intuitivo',
    kind: 'numeric',
    prompt: 'Calcule lim(x→2) (x² + x)/(x + 3). Responda em decimal.',
    answer: 1.2,
    hints: [
      'Substitua x = 2 e veja o que sai. Se o denominador NÃO zerar, acabou.',
      'Numerador: 2² + 2 = 6. Denominador: 2 + 3 = 5.',
      '6 dividido por 5.',
    ],
    solution:
      'Substituindo: (2² + 2)/(2 + 3) = (4 + 2)/5 = 6/5 = 1,2. ' +
      'Não há indeterminação nenhuma aqui: o denominador deu 5, não zero. ' +
      'Esse é o ponto que muita gente perde tempo — ao ver uma fração, já parte para fatorar. ' +
      'Só vale a pena simplificar SE a substituição der 0/0.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'clim-03',
    topicId: 'cal-limite-intuitivo',
    kind: 'choice',
    prompt: 'Ao substituir o valor num limite você obteve 0/0. O que isso significa?',
    options: [
      'O limite vale 0',
      'O limite não existe',
      'É uma indeterminação: falta simplificar a expressão antes de concluir',
      'O limite vale 1, porque qualquer coisa dividida por ela mesma dá 1',
    ],
    answer: 2,
    hints: [
      'Pense no exemplo (x² − 4)/(x − 2) em x = 2: dá 0/0, mas os valores em volta apontam claramente para 4.',
      'Se 0/0 sempre significasse a mesma coisa, todos esses limites teriam o mesmo valor — e não têm.',
    ],
    solution:
      '0/0 é uma FORMA INDETERMINADA: ela não decide nada sozinha. Diferentes funções que dão 0/0 no mesmo ' +
      'ponto podem ter limites completamente diferentes — (x²−4)/(x−2) dá 4, (x²−4x+4)/(x−2) dá 0, ' +
      '(x³−8)/(x−2) dá 12. ' +
      'Guarde a frase: 0/0 não é resposta, é sintoma. É o aviso de que numerador e denominador têm um fator ' +
      'comum que vai cancelar. Escrever "o limite não existe" ao ver 0/0 perde a questão inteira.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'clim-04',
    topicId: 'cal-limite-intuitivo',
    kind: 'numeric',
    prompt: 'Calcule lim(x→2) (x² − 4)/(x − 2).',
    answer: 4,
    hints: [
      'Substituindo dá 0/0 — sinal de que há fator comum. Fatore o numerador.',
      'x² − 4 = (x − 2)(x + 2). O (x − 2) cancela com o denominador.',
      'Sobra x + 2. Agora substitua x = 2 nessa expressão simplificada.',
    ],
    solution:
      'Substituindo dá 0/0. Fatorando: (x − 2)(x + 2)/(x − 2) = x + 2, para x ≠ 2. ' +
      'Logo o limite é 2 + 2 = 4. ' +
      'Note que a função NÃO existe em x = 2 — ali o gráfico tem um buraco. Mas o limite existe e vale 4, ' +
      'porque limite pergunta para onde a função aponta perto do ponto, não o valor dela no ponto. ' +
      'É a distinção central de toda a disciplina.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'clim-05',
    topicId: 'cal-limite-intuitivo',
    kind: 'choice',
    prompt:
      'Para uma certa função, lim(x→1⁻) f(x) = 2 e lim(x→1⁺) f(x) = 1. O que se conclui sobre lim(x→1) f(x)?',
    options: [
      'Vale 1,5, a média dos dois',
      'Vale 2, porque a esquerda vem primeiro',
      'Não existe, porque os limites laterais são diferentes',
      'Vale 1, o menor dos dois',
    ],
    answer: 2,
    hints: [
      'O limite (sem lado) só existe quando os dois laterais concordam. Aqui eles concordam?',
      'A função aponta para 2 vindo de um lado e para 1 vindo do outro. Não há um destino único.',
    ],
    solution:
      'O limite NÃO EXISTE. A regra é: lim(x→a) f(x) existe ⟺ os dois laterais existem E são iguais. ' +
      'Aqui 2 ≠ 1, então a função não tem um destino único em x = 1 — ela aponta para lugares diferentes ' +
      'conforme o lado de aproximação. Graficamente, é um SALTO. ' +
      'Média, "o primeiro" ou "o menor" não têm respaldo nenhum na definição. ' +
      'Este é exatamente o caso da função da questão 1(e) da lista, em x = 1.',
    xpReward: 35,
    difficulty: 2,
  },
];

export const limitesAlgebricosExercises: Exercise[] = [
  {
    id: 'calg-01',
    topicId: 'cal-limites-algebricos',
    kind: 'numeric',
    prompt: 'Calcule lim(x→3) (x² − 9)/(x − 3).',
    answer: 6,
    hints: [
      'Substituindo dá 0/0. Fatore x² − 9 como diferença de quadrados.',
      'x² − 9 = (x − 3)(x + 3). Cancele o (x − 3).',
      'Sobra x + 3. Substitua x = 3.',
    ],
    solution:
      'Substituindo: (9 − 9)/(3 − 3) = 0/0, indeterminado. ' +
      'Fatorando: (x − 3)(x + 3)/(x − 3) = x + 3, para x ≠ 3. Logo o limite é 3 + 3 = 6.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'calg-02',
    topicId: 'cal-limites-algebricos',
    kind: 'numeric',
    prompt: 'Calcule lim(x→3) (x² − 9)/(x + 3). Cuidado: leia o denominador com atenção.',
    answer: 0,
    hints: [
      'Antes de fatorar qualquer coisa, SUBSTITUA e veja o que acontece.',
      'Numerador: 9 − 9 = 0. Denominador: 3 + 3 = 6. Isso é 0/6 — houve indeterminação?',
    ],
    solution:
      'Substituindo: (9 − 9)/(3 + 3) = 0/6 = 0. Acabou aqui. ' +
      'NÃO há indeterminação: o denominador deu 6, não zero. 0 dividido por um número não nulo é ' +
      'simplesmente 0 — um valor de limite perfeitamente legítimo. ' +
      'Este exercício está lado a lado com o anterior na lista de propósito: (x²−9)/(x−3) e (x²−9)/(x+3) ' +
      'parecem gêmeos, mas só o primeiro exige fatoração. Substituir primeiro é o que revela a diferença.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'calg-03',
    topicId: 'cal-limites-algebricos',
    kind: 'numeric',
    prompt: 'Calcule lim(x→1/2) (4x² − 1)/(2x − 1).',
    answer: 2,
    hints: [
      'Substituindo x = 1/2 dá 0/0. Você precisa fatorar 4x² − 1.',
      '4x² − 1 é diferença de quadrados: (2x)² − 1² = (2x − 1)(2x + 1).',
      'Cancele o (2x − 1) e substitua x = 1/2 em 2x + 1.',
    ],
    solution:
      'Substituindo: (4·(1/4) − 1)/(2·(1/2) − 1) = (1 − 1)/(1 − 1) = 0/0. ' +
      'Fatorando: 4x² − 1 = (2x)² − 1² = (2x − 1)(2x + 1). Cancelando: sobra 2x + 1, para x ≠ 1/2. ' +
      'Limite = 2(1/2) + 1 = 1 + 1 = 2. ' +
      'O que destrava é enxergar 4x² como (2x)². A diferença de quadrados quase nunca vem com o expoente ' +
      'escrito de forma óbvia.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'calg-04',
    topicId: 'cal-limites-algebricos',
    kind: 'numeric',
    prompt: 'Calcule lim(x→1) (√x − 1)/(x − 1). Responda em decimal.',
    answer: 0.5,
    hints: [
      'Dá 0/0, mas fatorar não resolve — há uma raiz no numerador. O caminho é RACIONALIZAR.',
      'Multiplique em cima e embaixo pelo conjugado (√x + 1).',
      'O numerador vira (√x)² − 1² = x − 1, que cancela com o denominador. Sobra 1/(√x + 1). Substitua x = 1.',
    ],
    solution:
      'Substituindo dá 0/0. Multiplicando por (√x + 1)/(√x + 1): ' +
      'o numerador vira (√x)² − 1² = x − 1, e o denominador vira (x − 1)(√x + 1). ' +
      'Cancelando o (x − 1): sobra 1/(√x + 1), para x ≠ 1. ' +
      'Limite = 1/(√1 + 1) = 1/2 = 0,5. ' +
      'Regra prática: apareceu raiz e deu 0/0 → racionalize com o conjugado. O objetivo é criar a ' +
      'diferença de quadrados, que elimina a raiz e libera o cancelamento.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'calg-05',
    topicId: 'cal-limites-algebricos',
    kind: 'numeric',
    prompt:
      'Seja f(x) = (x³ − 8)/(x − 2) para x ≠ 2, e f(2) = L. Determine L para que f seja contínua em p = 2.',
    answer: 12,
    hints: [
      'Continuidade em p exige lim(x→p) f(x) = f(p). Como f(2) = L, basta calcular o limite.',
      'x³ − 8 é uma diferença de cubos: x³ − 2³ = (x − 2)(x² + 2x + 4).',
      'Cancele o (x − 2) e substitua x = 2 em x² + 2x + 4.',
    ],
    solution:
      'Continuidade em p = 2 exige lim(x→2) f(x) = f(2) = L. ' +
      'Calculando o limite: x³ − 8 = (x − 2)(x² + 2x + 4) [diferença de cubos], então ' +
      'lim(x→2) (x² + 2x + 4) = 4 + 4 + 4 = 12. Portanto L = 12. ' +
      'A interpretação é bonita: a função tinha um buraco em x = 2, e definir L = 12 é TAMPAR o buraco com ' +
      'exatamente o valor que a curva estava apontando. Qualquer outro L deixaria um ponto solto fora da ' +
      'curva, e a função continuaria descontínua.',
    xpReward: 45,
    difficulty: 3,
  },
];

export const continuidadeExercises: Exercise[] = [
  {
    id: 'ccon-01',
    topicId: 'cal-continuidade',
    kind: 'choice',
    prompt: 'Qual é a condição que define f contínua num ponto p?',
    options: [
      'Basta que f(p) exista',
      'Basta que o limite em p exista',
      'lim(x→p) f(x) deve existir, f(p) deve existir, e os dois devem ser iguais',
      'A função deve ser um polinômio',
    ],
    answer: 2,
    hints: [
      'A definição é lim(x→p) f(x) = f(p). Quantas exigências separadas estão escondidas nessa igualdade?',
      'Para dois valores serem iguais, ambos precisam antes EXISTIR.',
    ],
    solution:
      'A definição lim(x→p) f(x) = f(p) esconde TRÊS exigências: (1) f(p) existe, ou seja, p está no domínio; ' +
      '(2) o limite existe, ou seja, os dois laterais são iguais; (3) os dois valores coincidem. ' +
      'Falhar em qualquer uma já torna a função descontínua em p. ' +
      'Numa questão de "verifique a continuidade", cheque as três em ordem e diga em qual delas falhou — ' +
      'é isso que o professor chama de justificar.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ccon-02',
    topicId: 'cal-continuidade',
    kind: 'choice',
    prompt:
      'Considere f(x) = x², se x ≤ 1; f(x) = 2, se x > 1. O que acontece em x = 1?',
    options: [
      'A função é contínua, porque f(1) existe',
      'A função é descontínua: os limites laterais valem 1 e 2',
      'A função é contínua, porque os dois ramos são contínuos',
      'Não é possível decidir sem calcular a derivada',
    ],
    answer: 1,
    hints: [
      'Calcule os dois limites laterais, usando a fórmula que vale de cada lado.',
      'Pela esquerda de 1 vale o ramo x² → 1² = 1. Pela direita vale o ramo constante 2.',
      'Os dois deram o mesmo número?',
    ],
    solution:
      'lim(x→1⁻) f(x) = lim x² = 1² = 1 (à esquerda vale o ramo x ≤ 1). ' +
      'lim(x→1⁺) f(x) = lim 2 = 2 (à direita vale o ramo x > 1). ' +
      'Como 1 ≠ 2, o limite em x = 1 não existe, e a função é DESCONTÍNUA ali — uma descontinuidade de SALTO. ' +
      'Note que f(1) existe e vale 1 (o ramo com ≤ inclui o ponto), mas isso não basta: a exigência 2 da ' +
      'definição falhou. Cada ramo ser contínuo separadamente também não garante nada no ponto de emenda.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'ccon-03',
    topicId: 'cal-continuidade',
    kind: 'numeric',
    prompt:
      'Seja f(x) = 1/x², se |x| ≥ 1; f(x) = 2, se |x| < 1. Calcule lim(x→1⁻) f(x).',
    answer: 2,
    hints: [
      'Traduza o módulo primeiro: |x| < 1 significa −1 < x < 1, e |x| ≥ 1 significa x ≤ −1 ou x ≥ 1.',
      'x → 1⁻ quer dizer chegando por valores MENORES que 1, como 0,9 e 0,99. Esses valores caem em qual faixa?',
      '0,99 satisfaz |x| < 1, então ali vale o ramo constante.',
    ],
    solution:
      'Chegando pela esquerda de 1 (valores como 0,9 e 0,99), estamos na faixa −1 < x < 1, ou seja, |x| < 1. ' +
      'Nessa faixa f vale a constante 2. Logo lim(x→1⁻) f(x) = 2. ' +
      'Do outro lado, lim(x→1⁺) f(x) = lim 1/x² = 1. Como 2 ≠ 1, a função é descontínua em x = 1. ' +
      'A parte que mais confunde é escolher qual fórmula vale de cada lado — desenhe a reta, marque −1 e 1, ' +
      'e anote em cada faixa qual ramo se aplica antes de calcular.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'ccon-04',
    topicId: 'cal-continuidade',
    kind: 'choice',
    prompt:
      'Que tipo de descontinuidade a função f(x) = (x² − 4)/(x − 2) apresenta em x = 2?',
    options: [
      'De salto: os laterais são diferentes',
      'Infinita: a função tende a ±∞',
      'Removível: o limite existe, mas a função não está definida ali',
      'Nenhuma, a função é contínua em x = 2',
    ],
    answer: 2,
    hints: [
      'Calcule o limite em x = 2. Ele existe? Vale quanto?',
      'Simplificando, a função é x + 2 para x ≠ 2, então o limite vale 4. Mas e o valor da função em x = 2?',
    ],
    solution:
      'O limite existe e vale 4 (a função simplifica para x + 2), mas f(2) não existe — dá 0/0. ' +
      'Isso é uma descontinuidade REMOVÍVEL: o gráfico é a reta y = x + 2 com um buraco em (2, 4). ' +
      'Chama-se removível porque basta DEFINIR f(2) = 4 para consertar — exatamente o que a questão do ' +
      'L = 12 faz com a outra função. ' +
      'Não é salto (os laterais são iguais, ambos 4) nem infinita (a função não explode — ela se aproxima ' +
      'tranquilamente de 4).',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'ccon-05',
    topicId: 'cal-continuidade',
    kind: 'numeric',
    prompt:
      'Seja f(x) = x², se x ≤ 1; f(x) = k, se x > 1. Qual valor de k torna f contínua em x = 1?',
    answer: 1,
    hints: [
      'Para ser contínua, os dois limites laterais precisam ser iguais entre si e iguais a f(1).',
      'Pela esquerda: lim x² = 1² = 1. Pela direita: lim k = k (constante).',
      'Iguale os dois.',
    ],
    solution:
      'lim(x→1⁻) f(x) = 1² = 1 e lim(x→1⁺) f(x) = k. Para a função ser contínua, os dois precisam coincidir ' +
      'com f(1) = 1² = 1. Logo k = 1. ' +
      'Compare com o exercício 2 deste tópico, onde k valia 2 e havia um salto de altura 1. ' +
      'Ajustando k para 1, o ramo constante começa exatamente onde a parábola termina, e o gráfico se emenda ' +
      'sem tirar o lápis do papel. É o mesmo raciocínio da questão do L = 12, com outra roupagem.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'ccon-06',
    topicId: 'cal-continuidade',
    kind: 'choice',
    prompt:
      'Seja f(x) = 4x³ − 6x² + 3x − 2, com f(1) = −1 e f(2) = 12. O que o Teorema do Valor Intermediário permite concluir?',
    options: [
      'Que f(1,5) = 5, o ponto médio dos dois valores',
      'Que existe pelo menos um c em (1, 2) com f(c) = 0',
      'Que f é crescente em todo o intervalo [1, 2]',
      'Nada, porque o TVI só vale para funções trigonométricas',
    ],
    answer: 1,
    hints: [
      'f é polinômio, logo contínua em [1, 2] — a hipótese do TVI está satisfeita.',
      'f(1) é negativo e f(2) é positivo. O valor N = 0 está entre os dois?',
    ],
    solution:
      'Como f é contínua em [1, 2] (é polinômio) e f(1) = −1 < 0 < 12 = f(2), o TVI garante que existe pelo ' +
      'menos um c em (1, 2) com f(c) = N = 0 — ou seja, uma raiz da equação. ' +
      'O teorema NÃO diz o valor de c, nem quantos existem, nem nada sobre crescimento — só garante ' +
      'EXISTÊNCIA. Para restringir ainda mais o intervalo, testa-se pontos intermediários (1,2 dá negativo, ' +
      '1,3 dá positivo) e o processo se repete — é o algoritmo de bisseção.',
    xpReward: 40,
    difficulty: 2,
  },
  {
    id: 'ccon-07',
    topicId: 'cal-continuidade',
    kind: 'choice',
    prompt:
      'Por que o TVI exige que f seja CONTÍNUA em [a, b], e não apenas que f(a) e f(b) tenham sinais opostos?',
    options: [
      'É só um formalismo, a continuidade não muda o resultado',
      'Porque uma função com um salto pode "pular" por cima do valor N sem nunca passar por ele',
      'Porque funções descontínuas nunca têm raiz',
      'Porque o TVI só vale para polinômios',
    ],
    answer: 1,
    hints: [
      'Pense numa função com um salto grande no meio do intervalo — ela vai de negativo para positivo sem passar por zero?',
      'Um salto de −1 direto para +1, sem tocar o zero no meio, é exatamente o que a continuidade proíbe.',
    ],
    solution:
      'Sem continuidade, a função pode ter um SALTO que pula por cima do valor N. Exemplo: f(x) = −1 para ' +
      'x < 1 e f(x) = 1 para x ≥ 1. Aqui f(0) = −1 e f(2) = 1, sinais opostos, mas f NUNCA vale 0 em ponto ' +
      'nenhum — o salto simplesmente "pulou" o zero. ' +
      'É a mesma ideia do submarino: se ele pudesse se teletransportar (descontinuidade), não seria obrigado ' +
      'a passar pelos 50 m no caminho de 100 m até 10 m.',
    xpReward: 35,
    difficulty: 2,
  },
];

export const limitesInfinitoExercises: Exercise[] = [
  {
    id: 'cinf-01',
    topicId: 'cal-limites-infinito',
    kind: 'numeric',
    prompt: 'Calcule lim(x→+∞) (2x + 1)/(x + 3).',
    answer: 2,
    hints: [
      'Compare os graus: numerador tem grau 1, denominador também. Graus iguais.',
      'Com graus iguais, o limite é a razão dos coeficientes que acompanham a maior potência.',
      'Coeficiente do x em cima: 2. Embaixo: 1.',
    ],
    solution:
      'Dividindo tudo por x: (2 + 1/x)/(1 + 3/x). Como 1/x → 0 e 3/x → 0, sobra 2/1 = 2. ' +
      'Os números soltos (o +1 e o +3) não influenciam nada quando x é gigante — quem manda é o termo ' +
      'dominante de cada lado. ' +
      'Esse valor 2 é também a assíntota horizontal da função: y = 2.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cinf-02',
    topicId: 'cal-limites-infinito',
    kind: 'numeric',
    prompt: 'Calcule lim(x→+∞) (5x⁴ − 2x + 1)/(4x⁴ + 3x + 2). Responda em decimal.',
    answer: 1.25,
    hints: [
      'Graus: 4 em cima e 4 embaixo. Iguais.',
      'Razão dos coeficientes dominantes: 5 sobre 4.',
      '5 dividido por 4 em decimal.',
    ],
    solution:
      'Graus iguais (4 e 4), então o limite é a razão dos coeficientes dominantes: 5/4 = 1,25. ' +
      'Formalmente, dividindo tudo por x⁴: (5 − 2/x³ + 1/x⁴)/(4 + 3/x³ + 2/x⁴) → 5/4. ' +
      'Todos os termos com x no denominador vão a zero, sobrando só os coeficientes de x⁴.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cinf-03',
    topicId: 'cal-limites-infinito',
    kind: 'numeric',
    prompt: 'Calcule lim(x→+∞) x/(x² + 3x + 1).',
    answer: 0,
    hints: [
      'Compare os graus: 1 em cima, 2 embaixo. Qual cresce mais rápido?',
      'Quando o denominador cresce mais rápido, a fração é esmagada.',
    ],
    solution:
      'O grau do numerador (1) é MENOR que o do denominador (2), então o limite é 0. ' +
      'Formalmente, dividindo tudo por x²: (1/x)/(1 + 3/x + 1/x²) → 0/1 = 0. ' +
      'A intuição: x² cresce muito mais rápido que x, então a fração vira "grande dividido por muito maior", ' +
      'que tende a zero. ' +
      'Consequência gráfica: a reta y = 0 (o próprio eixo x) é assíntota horizontal.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cinf-04',
    topicId: 'cal-limites-infinito',
    kind: 'choice',
    prompt: 'Calcule lim(x→+∞) (5 − 4x + x² − x⁵).',
    options: ['+∞', '−∞', '0', '5'],
    answer: 1,
    hints: [
      'Num polinômio, quem manda no infinito é o termo de MAIOR grau. Qual é ele aqui?',
      'O maior grau é 5, no termo −x⁵. Repare no sinal do coeficiente.',
      'x⁵ com x → +∞ vai para +∞. Mas o coeficiente é −1, o que inverte o resultado.',
    ],
    solution:
      'O termo dominante é −x⁵. Com x → +∞, temos x⁵ → +∞; como o coeficiente é −1, o resultado inverte: ' +
      'o limite é −∞. ' +
      'Os termos 5, −4x e x² são irrelevantes nesse regime: perto de x = 1000, o −x⁵ já vale −10¹⁵ enquanto ' +
      'o x² vale só 10⁶. ' +
      'Receita de sinal: expoente par → sempre positivo; expoente ímpar → segue o sinal do x; coeficiente ' +
      'negativo → inverte tudo.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cinf-05',
    topicId: 'cal-limites-infinito',
    kind: 'choice',
    prompt: 'Calcule lim(x→−∞) (5 − x)/(3 + 2x).',
    options: ['1/2', '−1/2', '5/3', '−∞'],
    answer: 1,
    hints: [
      'Graus iguais (1 e 1), então é a razão dos coeficientes dominantes.',
      'Em cima, o termo dominante é −x (coeficiente −1). Embaixo, é 2x (coeficiente 2).',
      'Cuidado: o sinal vem dos coeficientes, não do lado do infinito.',
    ],
    solution:
      'Graus iguais, então o limite é a razão dos coeficientes dominantes: (−1)/2 = −1/2. ' +
      'Formalmente, dividindo por x: (5/x − 1)/(3/x + 2) → (0 − 1)/(0 + 2) = −1/2. ' +
      'O sinal negativo vem do coeficiente −1 do numerador, e NÃO do fato de x tender a −∞ — ' +
      'confundir isso é o erro mais comum aqui. Se você calcular o mesmo limite com x → +∞, dá −1/2 também. ' +
      'A alternativa 5/3 é a armadilha de olhar os números soltos em vez dos termos dominantes.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const assintotasExercises: Exercise[] = [
  {
    id: 'cass-01',
    topicId: 'cal-assintotas',
    kind: 'numeric',
    prompt: 'Em que valor de x a função f(x) = 1/(x − 2) tem assíntota vertical?',
    answer: 2,
    hints: [
      'Assíntota vertical aparece onde o denominador zera e o numerador NÃO zera junto.',
      'Resolva x − 2 = 0. E confira: o numerador (que é 1) zera nesse ponto?',
    ],
    solution:
      'O denominador zera em x = 2, e o numerador vale 1 ali (não zera junto). Como dá 1/0, a função explode: ' +
      'lim(x→2⁻) = −∞ e lim(x→2⁺) = +∞. Logo x = 2 é assíntota vertical. ' +
      'Os sinais opostos vêm do denominador: chegando por baixo de 2 (x = 1,99), x − 2 = −0,01 é negativo; ' +
      'por cima (x = 2,01), é positivo.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cass-02',
    topicId: 'cal-assintotas',
    kind: 'choice',
    prompt: 'A função h(x) = (x² − 4)/(x − 2) tem assíntota vertical em x = 2?',
    options: [
      'Sim, porque o denominador zera em x = 2',
      'Não: o numerador também zera ali, e após simplificar sobra apenas um buraco',
      'Sim, e o limite tende a +∞ dos dois lados',
      'Não, porque x = 2 pertence ao domínio da função',
    ],
    answer: 1,
    hints: [
      'Denominador zerando não basta. Veja o que o NUMERADOR faz no mesmo ponto.',
      'Numerador em x = 2: 4 − 4 = 0. Então dá 0/0, não número/0. Simplifique antes de decidir.',
    ],
    solution:
      'O denominador zera em x = 2, mas o numerador também: 2² − 4 = 0. Isso dá 0/0, e não número/0. ' +
      'Simplificando: (x − 2)(x + 2)/(x − 2) = x + 2. Não há explosão nenhuma — a função é a reta y = x + 2 ' +
      'com um BURACO em (2, 4). Descontinuidade removível, não assíntota. ' +
      'Compare com 1/(x − 2): mesmo denominador, mesmo domínio ℝ − {2}, mas ali existe assíntota. ' +
      'A diferença é só o numerador. É a pegadinha mais cobrada da Parte D.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'cass-03',
    topicId: 'cal-assintotas',
    kind: 'numeric',
    prompt: 'Qual é a assíntota horizontal de f(x) = (2x − 1)/(x + 3)? Responda o valor de y.',
    answer: 2,
    hints: [
      'Assíntota horizontal é o limite quando x → ±∞. Compare os graus.',
      'Graus iguais (1 e 1) → razão dos coeficientes dominantes: 2 sobre 1.',
    ],
    solution:
      'lim(x→±∞) (2x − 1)/(x + 3) = 2/1 = 2, porque os graus são iguais e a razão dos coeficientes ' +
      'dominantes é 2/1. Logo y = 2 é a assíntota horizontal. ' +
      'A intuição: para x gigante, o 2x domina o −1 e o x domina o +3, sobrando 2x/x = 2. ' +
      'Esta função tem também assíntota vertical em x = −3, onde o denominador zera sem o numerador zerar.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cass-04',
    topicId: 'cal-assintotas',
    kind: 'choice',
    prompt: 'Qual é a assíntota horizontal de h(x) = (x + 1)/(x² + 1)?',
    options: ['y = 1', 'y = 0', 'não existe assíntota horizontal', 'y = 1/2'],
    answer: 1,
    hints: [
      'Compare os graus: 1 em cima, 2 embaixo.',
      'Quando o denominador tem grau maior, a fração é esmagada para zero no infinito.',
    ],
    solution:
      'O grau do numerador (1) é menor que o do denominador (2), então lim(x→±∞) h(x) = 0. ' +
      'A assíntota horizontal é y = 0, o próprio eixo x. ' +
      'Repare ainda que esta função NÃO tem assíntota vertical: x² + 1 nunca zera nos reais (é sempre ≥ 1). ' +
      'Ter fração não garante assíntota vertical — o denominador precisa realmente zerar.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cass-05',
    topicId: 'cal-assintotas',
    kind: 'choice',
    prompt: 'A função g(x) = (x + 1)/(x² − 1) tem assíntota vertical em quais pontos?',
    options: [
      'Em x = 1 e em x = −1',
      'Apenas em x = 1',
      'Apenas em x = −1',
      'Em nenhum ponto',
    ],
    answer: 1,
    hints: [
      'Fatore o denominador: x² − 1 = (x − 1)(x + 1). Ele zera em dois pontos.',
      'Mas veja: o numerador (x + 1) também zera em x = −1. Simplifique a fração antes de decidir.',
      'Após cancelar o (x + 1), o que sobra?',
    ],
    solution:
      'Fatorando: (x + 1)/[(x − 1)(x + 1)] = 1/(x − 1), para x ≠ −1. ' +
      'Em x = 1: sobra 1/0 → a função explode → ASSÍNTOTA VERTICAL. ' +
      'Em x = −1: o fator cancelou, então ali há apenas um BURACO (descontinuidade removível), não assíntota. ' +
      'O ponto x = −1 continua fora do domínio — mas estar fora do domínio não é a mesma coisa que ter ' +
      'assíntota. Por isso a ordem correta é: fatore, cancele o que der, e só então procure onde o ' +
      'denominador que SOBROU zera.',
    xpReward: 45,
    difficulty: 3,
  },
];
