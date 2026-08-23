import { Exercise } from '@/types/exercise';

export const funcoesExercises: Exercise[] = [
  {
    id: 'cfun-01',
    topicId: 'cal-funcoes-avaliacao',
    kind: 'numeric',
    prompt: 'Considere f(x) = 2x − 3. Calcule f(−1).',
    answer: -5,
    hints: [
      'Substitua o x por (−1), com parênteses. A expressão vira 2(−1) − 3.',
      '2 × (−1) = −2. Agora subtraia 3 desse resultado.',
    ],
    solution:
      'f(−1) = 2(−1) − 3 = −2 − 3 = −5. ' +
      'Os parênteses em 2(−1) são obrigatórios: o −1 inteiro, com sinal, ocupa o lugar do x. ' +
      'Escrever 2−1 seria calcular outra coisa completamente diferente.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'cfun-02',
    topicId: 'cal-funcoes-avaliacao',
    kind: 'numeric',
    prompt: 'Ainda com f(x) = 2x − 3: determine o valor de x para o qual f(x) = 5.',
    answer: 4,
    hints: [
      'Aqui a pergunta é invertida: você tem a saída e quer a entrada. Monte a equação 2x − 3 = 5.',
      'Passe o −3 somando para o outro lado: 2x = 8.',
      'Agora divida os dois lados por 2.',
    ],
    solution:
      '2x − 3 = 5 → 2x = 8 → x = 4. Conferindo: f(4) = 2(4) − 3 = 8 − 3 = 5 ✓. ' +
      'Repare na diferença de linguagem do enunciado: "calcule f(2)" é substituir; ' +
      '"determine x tal que f(x) = 5" é resolver equação. São operações inversas uma da outra.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cfun-03',
    topicId: 'cal-funcoes-avaliacao',
    kind: 'numeric',
    prompt: 'Se f(x) = x + 1 e g(x) = x², determine f(g(2)).',
    answer: 5,
    hints: [
      'Resolva de dentro para fora, como parênteses de conta normal. Comece pelo g(2).',
      'g(2) = 2² = 4. Agora aplique o f nesse resultado: f(4).',
    ],
    solution:
      'Primeiro g(2) = 2² = 4. Depois f(4) = 4 + 1 = 5. Portanto f(g(2)) = 5. ' +
      'A regra é sempre de dentro para fora: a função que está mais perto do número é a primeira a agir.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cfun-04',
    topicId: 'cal-funcoes-avaliacao',
    kind: 'numeric',
    prompt: 'Com as mesmas f(x) = x + 1 e g(x) = x², determine agora g(f(2)).',
    answer: 9,
    hints: [
      'A ordem mudou: agora o f é que está por dentro. Comece calculando f(2).',
      'f(2) = 2 + 1 = 3. Agora aplique g nesse 3: g(3) = 3².',
    ],
    solution:
      'Primeiro f(2) = 2 + 1 = 3. Depois g(3) = 3² = 9. Portanto g(f(2)) = 9. ' +
      'Compare com o exercício anterior: f(g(2)) = 5, mas g(f(2)) = 9. ' +
      'Composição NÃO é comutativa — trocar a ordem muda o resultado. ' +
      'É como "vestir meia" e "calçar sapato": a ordem importa.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cfun-05',
    topicId: 'cal-funcoes-avaliacao',
    kind: 'choice',
    prompt: 'Considere g(x) = x² − 4x + 1. O número x = 2 é raiz de g?',
    options: [
      'Sim, porque g(2) = 0',
      'Não, porque g(2) = −3',
      'Sim, porque 2 é o coeficiente que aparece na expressão',
      'Não é possível decidir sem o gráfico',
    ],
    answer: 1,
    hints: [
      'Raiz é o valor de x que faz a função dar ZERO. O teste é só substituir e ver o que sai.',
      'g(2) = (2)² − 4(2) + 1 = 4 − 8 + 1. Some com atenção aos sinais.',
    ],
    solution:
      'g(2) = (2)² − 4(2) + 1 = 4 − 8 + 1 = −3. Como −3 ≠ 0, x = 2 NÃO é raiz de g. ' +
      'A alternativa sobre "o coeficiente que aparece" é a armadilha: aparecer na expressão não tem ' +
      'relação nenhuma com ser raiz. E o gráfico não é necessário — a definição f(x) = 0 resolve por ' +
      'substituição direta.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const dominioExercises: Exercise[] = [
  {
    id: 'cdom-01',
    topicId: 'cal-dominio',
    kind: 'choice',
    prompt: 'Qual é o domínio de f(x) = √(x + 3)?',
    options: ['(−3, +∞)', '[−3, +∞)', '(−∞, −3]', 'ℝ (todos os reais)'],
    answer: 1,
    hints: [
      'O que está dentro de uma raiz quadrada não pode ser negativo. Monte a condição x + 3 ≥ 0.',
      'x + 3 ≥ 0 dá x ≥ −3. Agora decida: o −3 entra ou não entra?',
    ],
    solution:
      'A condição é x + 3 ≥ 0, ou seja, x ≥ −3. Em intervalo: [−3, +∞). ' +
      'O colchete no −3 é essencial: ali a raiz vale √0 = 0, que é um número real perfeitamente válido, ' +
      'então o −3 PERTENCE ao domínio. Do lado do infinito é sempre parêntese, porque infinito não é um ' +
      'número que se possa incluir.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cdom-02',
    topicId: 'cal-dominio',
    kind: 'choice',
    prompt: 'Qual é o domínio de h(x) = √(5 − x)?',
    options: ['[5, +∞)', '(−∞, 5]', '(−∞, 5)', 'ℝ − {5}'],
    answer: 1,
    hints: [
      'Condição da raiz: 5 − x ≥ 0.',
      'Para isolar o x você vai multiplicar (ou dividir) por −1 — e isso INVERTE o sinal da desigualdade.',
      'Teste com números: x = 0 dá √5 (existe). x = 10 dá √(−5) (não existe). Então o domínio fica de que lado do 5?',
    ],
    solution:
      '5 − x ≥ 0 → −x ≥ −5 → x ≤ 5, porque multiplicar por −1 inverte a desigualdade. Em intervalo: (−∞, 5]. ' +
      'Esta é a pegadinha número 1 de domínio: quem esquece de virar o sinal responde [5, +∞) e erra o ' +
      'intervalo inteiro. O teste com dois números (x = 0 funciona, x = 10 não) resolve a dúvida em segundos.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cdom-03',
    topicId: 'cal-dominio',
    kind: 'numeric',
    prompt:
      'Quantos valores reais de x precisam ser EXCLUÍDOS do domínio de p(x) = 1/(x² − 9)?',
    answer: 2,
    hints: [
      'O denominador não pode zerar. Resolva x² − 9 = 0.',
      'x² − 9 é uma diferença de quadrados: (x − 3)(x + 3). Um produto zera quando qualquer fator zera.',
    ],
    solution:
      'x² − 9 = 0 → (x − 3)(x + 3) = 0 → x = 3 ou x = −3. São DOIS valores excluídos, e o domínio é ' +
      'ℝ − {−3, 3}. ' +
      'O erro comum é lembrar só do x = 3 e esquecer da raiz negativa. Fatorar antes de concluir evita ' +
      'isso: cada fator dá uma raiz.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cdom-04',
    topicId: 'cal-dominio',
    kind: 'choice',
    prompt: 'Qual é o domínio de f(x) = √(x − 2) / (x − 5)?',
    options: ['[2, +∞)', '[2, 5) ∪ (5, +∞)', '(2, 5) ∪ (5, +∞)', 'ℝ − {5}'],
    answer: 1,
    hints: [
      'Aqui há DUAS restrições, e as duas precisam valer ao mesmo tempo. Escreva cada uma.',
      'Da raiz: x − 2 ≥ 0 → x ≥ 2. Do denominador: x − 5 ≠ 0 → x ≠ 5.',
      'Desenhe na reta: pinte de 2 para a direita, depois abra um furo no 5. Quantos pedaços sobraram?',
    ],
    solution:
      'Duas condições simultâneas: x ≥ 2 (da raiz) e x ≠ 5 (do denominador). ' +
      'Juntando na reta: pinta de 2 em diante e fura o 5, o que quebra o intervalo em dois pedaços — ' +
      'daí a união: [2, 5) ∪ (5, +∞). ' +
      'O colchete no 2 vem do ≥ da raiz (√0 = 0 existe); os parênteses no 5 vêm do ≠ do denominador. ' +
      'A alternativa (2, 5) ∪ (5, +∞) erra justamente ao deixar o 2 de fora.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'cdom-05',
    topicId: 'cal-dominio',
    kind: 'choice',
    prompt: 'Qual é o domínio de p(x) = 1 / [(x − 1)(x + 2)]?',
    options: ['ℝ − {1, 2}', 'ℝ − {1, −2}', 'ℝ − {−1, 2}', '(1, +∞)'],
    answer: 1,
    hints: [
      'Só existe uma restrição aqui: o denominador não pode zerar. Não há raiz nenhuma na expressão.',
      'O denominador já vem fatorado. Iguale cada fator a zero: x − 1 = 0 e x + 2 = 0.',
    ],
    solution:
      'O produto (x − 1)(x + 2) zera quando x = 1 ou quando x = −2. Domínio: ℝ − {1, −2}. ' +
      'Atenção ao sinal: o fator (x + 2) zera em x = −2, e não em x = +2. É o erro mais comum aqui — ' +
      'a raiz tem o sinal TROCADO em relação ao número que aparece no fator.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const inequacoesExercises: Exercise[] = [
  {
    id: 'cine-01',
    topicId: 'cal-inequacoes',
    kind: 'choice',
    prompt: 'Resolva a inequação −2x > 6.',
    options: ['x > −3', 'x < −3', 'x > 3', 'x < 3'],
    answer: 1,
    hints: [
      'Para isolar o x você vai dividir os dois lados por −2. Isso tem uma consequência sobre o sinal.',
      'Dividir por número NEGATIVO inverte o sinal da desigualdade: o > vira <.',
      'Teste a sua resposta com um número. Se x = −4: −2(−4) = 8, e 8 > 6 é verdade.',
    ],
    solution:
      '−2x > 6 → x < −3 (dividiu por −2, então o > virou <). ' +
      'Conferindo com x = −4: −2(−4) = 8 > 6 ✓. Se a resposta fosse x > −3, o teste com x = 0 daria ' +
      '0 > 6, que é falso. ' +
      'Dica prática: para evitar o risco, passe tudo para o outro lado antes — de −2x > 6 vem 6 < −2x... ' +
      'ou melhor, some 2x e subtraia 6: 0 > 6 + 2x → −6 > 2x → −3 > x. Mesma resposta, sem inverter nada.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cine-02',
    topicId: 'cal-inequacoes',
    kind: 'choice',
    prompt: 'Qual conjunto de números satisfaz |x| ≥ 2?',
    options: [
      '−2 ≤ x ≤ 2',
      'x ≤ −2 ou x ≥ 2',
      '−2 ≥ x ≥ 2',
      'apenas x = 2 e x = −2',
    ],
    answer: 1,
    hints: [
      'Leia |x| como "distância de x até o zero". A pergunta vira: quem está a uma distância de PELO MENOS 2 do zero?',
      'Os números longe do zero são os grandes positivos e os bem negativos. Isso são dois pedaços da reta, não um.',
    ],
    solution:
      '|x| ≥ 2 significa "x está a uma distância de pelo menos 2 do zero", ou seja, x ≤ −2 ou x ≥ 2. ' +
      'Em intervalo: (−∞, −2] ∪ [2, +∞). ' +
      'A alternativa "−2 ≥ x ≥ 2" é a armadilha clássica e nem faz sentido: nenhum número é ao mesmo tempo ' +
      'menor que −2 e maior que 2. Quando a resposta são dois pedaços, eles se ligam por OU e se escrevem ' +
      'com união (∪), nunca como desigualdade dupla.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cine-03',
    topicId: 'cal-inequacoes',
    kind: 'choice',
    prompt: 'Qual conjunto de números satisfaz |x| < 3?',
    options: ['x < −3 ou x > 3', '−3 < x < 3', '−3 ≤ x ≤ 3', 'x > 3'],
    answer: 1,
    hints: [
      'Distância MENOR que 3 do zero: são os números que ficam espremidos perto do zero.',
      'Isso é um intervalo só. E como o sinal é < (estrito), as pontas ficam de fora.',
    ],
    solution:
      '|x| < 3 significa distância menor que 3 até o zero: −3 < x < 3, ou seja, o intervalo (−3, 3). ' +
      'Repare no contraste com o exercício anterior: com < a resposta é UM intervalo (o miolo), com ≥ são ' +
      'DOIS (as pontas). E como aqui o sinal é estrito, o −3 e o 3 não entram — por isso não é −3 ≤ x ≤ 3.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cine-04',
    topicId: 'cal-inequacoes',
    kind: 'choice',
    prompt: 'Resolva x² − 5x + 6 > 0.',
    options: ['2 < x < 3', 'x < 2 ou x > 3', 'x > 3', 'todos os reais'],
    answer: 1,
    hints: [
      'Não tente isolar o x. Comece achando as raízes de x² − 5x + 6 = 0.',
      'As raízes são 2 e 3. Agora veja a concavidade: o coeficiente de x² é +1, positivo → boca para cima.',
      'Parábola de boca para cima fica NEGATIVA entre as raízes e positiva fora delas. Você quer onde ela é positiva.',
    ],
    solution:
      'Raízes: x² − 5x + 6 = 0 → x = 2 e x = 3. O coeficiente de x² é +1 (positivo), então a parábola tem ' +
      'boca para cima. Uma parábola de boca para cima é negativa NO MIOLO (entre as raízes) e positiva FORA. ' +
      'Como queremos > 0, a resposta é x < 2 ou x > 3, isto é, (−∞, 2) ∪ (3, +∞). ' +
      'Conferindo com x = 0: 0 − 0 + 6 = 6 > 0 ✓. Com x = 2,5: 6,25 − 12,5 + 6 = −0,25 < 0 ✓ (está no miolo). ' +
      'Esboçar a parábola no canto da folha resolve isso mais rápido que qualquer tabela de sinais.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'cine-05',
    topicId: 'cal-inequacoes',
    kind: 'numeric',
    prompt: 'Qual é o MAIOR número inteiro que satisfaz 3x − 1 ≤ 8?',
    answer: 3,
    hints: [
      'Primeiro resolva a inequação normalmente: passe o −1 somando.',
      '3x ≤ 9 → x ≤ 3. Agora: qual é o maior inteiro que cabe nessa condição?',
    ],
    solution:
      '3x − 1 ≤ 8 → 3x ≤ 9 → x ≤ 3. Como o sinal é ≤ (e não <), o próprio 3 SATISFAZ a condição: ' +
      '3(3) − 1 = 8 ≤ 8 ✓. Logo o maior inteiro é 3. ' +
      'Se o enunciado tivesse dito 3x − 1 < 8 (estrito), o 3 ficaria de fora e a resposta seria 2. ' +
      'Aqui não houve inversão de sinal porque só dividimos por 3, que é positivo.',
    xpReward: 25,
    difficulty: 1,
  },
];

export const simplificacaoExercises: Exercise[] = [
  {
    id: 'csim-01',
    topicId: 'cal-simplificacao',
    kind: 'numeric',
    prompt: 'Simplifique f(x) = (x² − 4)/(x − 2), com x ≠ 2, e calcule f(3).',
    answer: 5,
    hints: [
      'x² − 4 é uma diferença de quadrados. Fatore: x² − 4 = (x − 2)(x + 2).',
      'O fator (x − 2) aparece em cima e embaixo, então cancela. Sobra x + 2.',
      'Agora é só calcular 3 + 2.',
    ],
    solution:
      '(x² − 4)/(x − 2) = (x − 2)(x + 2)/(x − 2) = x + 2, para x ≠ 2. Logo f(3) = 3 + 2 = 5. ' +
      'Você também chegaria em 5 substituindo direto na original: (9 − 4)/(3 − 2) = 5/1 = 5 ✓. ' +
      'Simplificar não muda o valor nos pontos onde a função existe — muda só a facilidade da conta.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'csim-02',
    topicId: 'cal-simplificacao',
    kind: 'choice',
    prompt:
      'A função original (x² − 4)/(x − 2) e a simplificada x + 2 têm exatamente o mesmo domínio?',
    options: [
      'Sim, simplificar não altera o domínio',
      'Não: a original exclui x = 2, a simplificada aceita todos os reais',
      'Não: a simplificada é que exclui x = 2',
      'Sim, ambas excluem x = 2',
    ],
    answer: 1,
    hints: [
      'Pergunte-se o que acontece em x = 2 em CADA uma das duas expressões.',
      'Na original: (4 − 4)/(2 − 2) = 0/0, que não existe. Na simplificada: 2 + 2 = 4, um número normal.',
    ],
    solution:
      'A original tem domínio ℝ − {2}: em x = 2 ela dá 0/0, que não existe. A simplificada x + 2 é um ' +
      'polinômio, com domínio ℝ inteiro: em x = 2 ela vale 4. ' +
      'Por isso a resposta correta se escreve com a restrição colada: (x² − 4)/(x − 2) = x + 2, PARA x ≠ 2. ' +
      'Cancelar o (x − 2) só é legítimo porque x ≠ 2 garante que esse fator não é zero — e cancelar zero é ' +
      'proibido. Graficamente, a original é a reta y = x + 2 com um buraco em (2, 4).',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'csim-03',
    topicId: 'cal-simplificacao',
    kind: 'numeric',
    prompt: 'Simplifique (4x² − 1)/(2x − 1) e calcule o valor da expressão simplificada em x = 2.',
    answer: 5,
    hints: [
      '4x² − 1 é uma diferença de quadrados disfarçada: 4x² é (2x)² e 1 é 1².',
      'Então 4x² − 1 = (2x − 1)(2x + 1). O fator (2x − 1) cancela com o denominador.',
      'Sobra 2x + 1. Calcule em x = 2.',
    ],
    solution:
      '4x² − 1 = (2x)² − 1² = (2x − 1)(2x + 1). Cancelando o (2x − 1): sobra 2x + 1, para x ≠ 1/2. ' +
      'Em x = 2: 2(2) + 1 = 5. ' +
      'O que destrava esta questão é enxergar 4x² como (2x)² — a diferença de quadrados quase nunca vem ' +
      'com o expoente escrito de forma óbvia. Treine o olho: 9x² − 1 é (3x)² − 1², 25x² − 4 é (5x)² − 2².',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'csim-04',
    topicId: 'cal-simplificacao',
    kind: 'numeric',
    prompt:
      'Sabendo que x³ − 8 = (x − 2)(x² + 2x + 4), simplifique (x³ − 8)/(x − 2) e calcule o valor da expressão simplificada em x = 2.',
    answer: 12,
    hints: [
      'O enunciado já entregou a fatoração. O fator (x − 2) cancela com o denominador.',
      'Sobra x² + 2x + 4. Substitua x = 2: (2)² + 2(2) + 4.',
    ],
    solution:
      '(x³ − 8)/(x − 2) = (x − 2)(x² + 2x + 4)/(x − 2) = x² + 2x + 4, para x ≠ 2. ' +
      'Em x = 2: 4 + 4 + 4 = 12. ' +
      'Essa fatoração é a diferença de cubos: a³ − b³ = (a − b)(a² + ab + b²), com a = x e b = 2. ' +
      'Guarde este 12: ele é exatamente a resposta da questão 6 da lista de limites, que pede o valor de L ' +
      'que torna a função contínua em p = 2.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'csim-05',
    topicId: 'cal-simplificacao',
    kind: 'choice',
    prompt: 'Ao racionalizar (√x − 1)/(x − 1), multiplicando em cima e embaixo por (√x + 1), o que se obtém?',
    options: ['√x + 1', '1/(√x + 1)', '(x − 1)/(√x + 1)', '√x − 1'],
    answer: 1,
    hints: [
      'No numerador aparece (√x − 1)(√x + 1). Isso é uma diferença de quadrados: (√x)² − 1².',
      '(√x)² = x, então o numerador vira x − 1. O denominador fica (x − 1)(√x + 1).',
      'Agora o (x − 1) aparece em cima e embaixo. Cancele.',
    ],
    solution:
      'Multiplicando por (√x + 1)/(√x + 1) — que é multiplicar por 1, então não altera o valor: ' +
      'o numerador vira (√x)² − 1² = x − 1, e o denominador vira (x − 1)(√x + 1). ' +
      'Cancelando o (x − 1): sobra 1/(√x + 1), para x ≠ 1. ' +
      'Racionalizar é o truque para quando há RAIZ e fatorar não resolve. O objetivo é sempre criar a ' +
      'diferença de quadrados, porque ela elimina a raiz e libera o cancelamento.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const graficosExercises: Exercise[] = [
  {
    id: 'cgra-01',
    topicId: 'cal-graficos',
    kind: 'numeric',
    prompt: 'Considere f(x) = x² − 4. Em que altura o gráfico corta o eixo y?',
    answer: -4,
    hints: [
      'O eixo y é onde x vale zero. Então calcule f(0).',
      'f(0) = 0² − 4.',
    ],
    solution:
      'A interseção com o eixo y acontece em x = 0: f(0) = 0² − 4 = −4. O ponto é (0, −4). ' +
      'Guarde a simetria da receita: para achar onde corta o eixo Y você zera o X; para achar onde corta ' +
      'o eixo X (as raízes) você zera o Y. Trocar os dois é erro comum e fácil de evitar.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'cgra-02',
    topicId: 'cal-graficos',
    kind: 'numeric',
    prompt: 'Quantas raízes reais tem g(x) = x² − 9?',
    answer: 2,
    hints: [
      'Raiz é onde g(x) = 0. Resolva x² − 9 = 0.',
      'x² = 9. Cuidado: quantos números elevados ao quadrado dão 9?',
    ],
    solution:
      'x² − 9 = 0 → x² = 9 → x = 3 E x = −3. São DUAS raízes. ' +
      'Escrever apenas x = 3 perde metade da resposta — e esse esquecimento vale toda vez que você tira ' +
      'raiz quadrada dos dois lados de uma equação. ' +
      'Graficamente, são os dois pontos onde a parábola corta o eixo x.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cgra-03',
    topicId: 'cal-graficos',
    kind: 'choice',
    prompt: 'Qual é o vértice da parábola f(x) = x² − 4, e para onde está sua concavidade?',
    options: [
      '(0, −4), boca para cima',
      '(0, −4), boca para baixo',
      '(−4, 0), boca para cima',
      '(2, 0), boca para cima',
    ],
    answer: 0,
    hints: [
      'A abscissa do vértice é x = −b/(2a). Aqui a = 1 e b = 0 (não há termo em x).',
      'x_v = −0/2 = 0. Agora calcule f(0) para achar a altura do vértice.',
      'A concavidade depende do sinal de a. Aqui a = +1.',
    ],
    solution:
      'x_v = −b/(2a) = −0/(2·1) = 0, e f(0) = −4. Vértice: (0, −4). ' +
      'Como a = +1 é positivo, a boca é para CIMA — e por isso o vértice é o ponto mais baixo do gráfico. ' +
      'A alternativa (−4, 0) inverte as coordenadas, e (2, 0) confunde vértice com raiz. ' +
      'Neste caso o vértice coincide com a interseção do eixo y porque não há termo em x; quando houver, ' +
      'serão pontos diferentes.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cgra-04',
    topicId: 'cal-graficos',
    kind: 'choice',
    prompt:
      'No esboço de f(x) = x², se x ≤ 1; f(x) = 2, se x > 1 — como fica o ponto (1, 1), na ponta do ramo da parábola?',
    options: [
      'Bolinha vazia, porque é um ponto de troca de fórmula',
      'Bolinha cheia, porque a condição x ≤ 1 inclui o 1',
      'Bolinha cheia, porque toda parábola é contínua',
      'O ponto não deve ser marcado',
    ],
    answer: 1,
    hints: [
      'A regra das bolinhas vem direto da desigualdade do enunciado, não da forma da curva.',
      'O ramo da parábola vale para x ≤ 1. O sinal é ≤ (com o "ou igual"), então o x = 1 pertence a esse ramo.',
    ],
    solution:
      'Bolinha CHEIA em (1, 1). A regra é mecânica: ≤ e ≥ dão bolinha cheia (o ponto pertence ao ramo); ' +
      '< e > dão bolinha vazia. Aqui a condição é x ≤ 1, então f(1) = 1² = 1 e o ponto pertence à parábola. ' +
      'Já o outro ramo, com x > 1, começa em (1, 2) com bolinha VAZIA. ' +
      'Como as duas pontas estão em alturas diferentes (1 e 2), há um SALTO — e é exatamente isso que torna ' +
      'a função descontínua em x = 1. Desenhar bem as bolinhas responde a questão de continuidade antes de ' +
      'qualquer cálculo.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'cgra-05',
    topicId: 'cal-graficos',
    kind: 'numeric',
    prompt: 'Qual é a raiz de h(x) = 2x + 1?',
    answer: -0.5,
    hints: [
      'Raiz é onde h(x) = 0. Monte a equação 2x + 1 = 0.',
      '2x = −1. Agora divida por 2 — a resposta é uma fração negativa.',
    ],
    solution:
      '2x + 1 = 0 → 2x = −1 → x = −1/2 = −0,5. ' +
      'Conferindo: h(−0,5) = 2(−0,5) + 1 = −1 + 1 = 0 ✓. ' +
      'Como é uma reta, ela tem exatamente uma raiz — corta o eixo x num único ponto, em (−0,5, 0). ' +
      'Junto com a interseção do eixo y, h(0) = 1, você já tem os dois pontos necessários para traçar a reta.',
    xpReward: 25,
    difficulty: 1,
  },
];
