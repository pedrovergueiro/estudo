import { Exercise } from '@/types/exercise';

export const espacoAmostralExercises: Exercise[] = [
  {
    id: 'pesp-01',
    topicId: 'pe-espaco-amostral',
    kind: 'numeric',
    prompt: 'Quantos elementos tem o espaço amostral do lançamento de duas moedas distinguíveis?',
    answer: 4,
    hints: [
      'Liste com cuidado: a primeira moeda pode dar cara ou coroa, e a segunda também.',
      'Cuidado: CK (cara na 1ª, coroa na 2ª) e KC são resultados DIFERENTES.',
    ],
    solution:
      'S = {CC, CK, KC, KK}, quatro elementos. ' +
      'O erro clássico é escrever S = {CC, CK, KK} com três elementos, tratando "uma cara e uma coroa" ' +
      'como um caso só. Isso levaria a P(exatamente uma cara) = 1/3, quando a resposta certa é 2/4 = 1/2. ' +
      'Listar o espaço amostral com cuidado resolve metade dos problemas do capítulo.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pesp-02',
    topicId: 'pe-espaco-amostral',
    kind: 'numeric',
    prompt:
      'Num dado, sejam A = "sair par" e B = "sair maior que 4". Quantos elementos tem A ∪ B?',
    answer: 4,
    hints: [
      'Escreva os dois eventos como conjuntos: A = {2,4,6} e B = {5,6}.',
      'A união reúne tudo que está em pelo menos um dos dois — sem repetir elementos.',
    ],
    solution:
      'A = {2, 4, 6} e B = {5, 6}. A união é A ∪ B = {2, 4, 5, 6}, com QUATRO elementos. ' +
      'Repare que o 6 aparece nos dois eventos, mas entra na união uma vez só. Se você somasse os ' +
      'tamanhos (3 + 2 = 5), contaria o 6 duas vezes — e é exatamente isso que a regra aditiva corrige ' +
      'ao subtrair a interseção.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pesp-03',
    topicId: 'pe-espaco-amostral',
    kind: 'choice',
    prompt:
      'Sejam A = "sair par" e B = "sair maior que 4" no lançamento de um dado. Esses eventos são mutuamente exclusivos?',
    options: [
      'Sim, porque são definidos por condições diferentes',
      'Não, porque o resultado 6 satisfaz os dois ao mesmo tempo',
      'Sim, porque A tem 3 elementos e B tem 2',
      'Depende de qual acontece primeiro',
    ],
    answer: 1,
    hints: [
      'Mutuamente exclusivos significa que a interseção é vazia: não podem acontecer juntos.',
      'A = {2,4,6}, B = {5,6}. Existe algum elemento nos dois?',
    ],
    solution:
      'NÃO são mutuamente exclusivos: A ∩ B = {6} ≠ ∅. O resultado 6 é par E maior que 4, então os dois ' +
      'eventos podem ocorrer simultaneamente. ' +
      'Um exemplo de eventos realmente mutuamente exclusivos no dado seria "sair par" e "sair ímpar" — ' +
      'aí sim a interseção é vazia. ' +
      'A consequência prática: para calcular P(A ∪ B) aqui você é OBRIGADO a subtrair P(A ∩ B).',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pesp-04',
    topicId: 'pe-espaco-amostral',
    kind: 'choice',
    prompt:
      'Dois eventos A e B têm probabilidade positiva e são mutuamente exclusivos. O que se pode afirmar?',
    options: [
      'Eles são independentes',
      'Eles são necessariamente dependentes',
      'São independentes apenas se P(A) = P(B)',
      'Nada se pode afirmar sobre independência',
    ],
    answer: 1,
    hints: [
      'Independentes significa que saber de um não muda nada sobre o outro: P(A | B) = P(A).',
      'Se A e B são mutuamente exclusivos e você sabe que B ocorreu, qual é a chance de A ter ocorrido?',
    ],
    solution:
      'São necessariamente DEPENDENTES. Se A e B são mutuamente exclusivos, então saber que B ocorreu te ' +
      'diz com CERTEZA que A não ocorreu: P(A | B) = 0. Como P(A) > 0 por hipótese, temos ' +
      'P(A | B) ≠ P(A) — e isso é a definição de dependência. ' +
      'Esta é a confusão mais cobrada do capítulo. Os dois conceitos são quase opostos: ' +
      'mutuamente exclusivos = um EXCLUI o outro (P(A∩B) = 0); independentes = um IGNORA o outro ' +
      '(P(A∩B) = P(A)·P(B)).',
    xpReward: 45,
    difficulty: 3,
  },
];

export const contagemExercises: Exercise[] = [
  {
    id: 'pcon-01',
    topicId: 'pe-contagem',
    kind: 'numeric',
    prompt:
      'De quantas maneiras se pode formar uma comissão de 3 pessoas escolhidas entre 5 candidatos?',
    answer: 10,
    hints: [
      'Numa comissão, trocar a ordem dos escolhidos muda o resultado? Se não muda, é combinação.',
      'C(5, 3) = 5! / [3!·(5−3)!] = 120 / (6 × 2).',
    ],
    solution:
      'Comissão não tem ordem — "João, Maria e Ana" é a mesma comissão que "Ana, Maria e João". Então é ' +
      'COMBINAÇÃO: C(5, 3) = 5!/(3!·2!) = 120/12 = 10. ' +
      'Se em vez de comissão fossem os cargos de presidente, tesoureiro e secretário, a ordem passaria a ' +
      'importar e a resposta seria o arranjo: 5!/2! = 60.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pcon-02',
    topicId: 'pe-contagem',
    kind: 'numeric',
    prompt:
      'De quantas maneiras 5 atletas podem ocupar os três lugares do pódio (ouro, prata e bronze)?',
    answer: 60,
    hints: [
      'Aqui a ordem importa: ouro para João e prata para Maria é diferente do contrário.',
      'É um arranjo: ₅P₃ = 5!/(5−3)! = 120/2.',
    ],
    solution:
      'O pódio tem ordem — trocar quem leva ouro e prata gera um resultado diferente. Então é ARRANJO: ' +
      '₅P₃ = 5!/(5−3)! = 120/2 = 60. ' +
      'Compare com o exercício anterior: mesmos n e r, mas 60 contra 10. A razão entre eles é exatamente ' +
      '3! = 6, porque cada grupo de três pode ser ordenado de 6 maneiras. Essa é a relação ' +
      'C(n,r) = ₙPᵣ / r!.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pcon-03',
    topicId: 'pe-contagem',
    kind: 'numeric',
    prompt: 'Quantos anagramas distintos tem a palavra ARARA?',
    answer: 10,
    hints: [
      'São 5 letras, mas com repetição: três A e dois R.',
      'Comece com 5! = 120 e divida pelos fatoriais das repetições: 3! para os A e 2! para os R.',
    ],
    solution:
      '5! / (3!·2!) = 120 / (6 × 2) = 10 anagramas distintos. ' +
      'A divisão existe porque trocar dois A entre si não gera palavra nova — você contou cada palavra ' +
      '3!·2! = 12 vezes a mais. ' +
      'É a mesma lógica da combinação: dividir por fatoriais desfaz contagens repetidas.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pcon-04',
    topicId: 'pe-contagem',
    kind: 'numeric',
    prompt:
      'Uma senha tem 2 letras (de 26 possíveis) seguidas de 2 dígitos (de 10 possíveis), com repetição permitida. Quantas senhas existem?',
    answer: 67600,
    hints: [
      'Cada posição é uma etapa independente. Etapas em sequência se MULTIPLICAM.',
      '26 × 26 × 10 × 10.',
    ],
    solution:
      '26 × 26 × 10 × 10 = 676 × 100 = 67.600 senhas. ' +
      'Pela regra da multiplicação, etapas em sequência ("uma letra E depois outra letra E depois um ' +
      'dígito...") se multiplicam. Se fossem ALTERNATIVAS ("uma letra OU um dígito"), você somaria. ' +
      'Repetição permitida é o que mantém o 26 e o 10 constantes — sem repetição, seria 26 × 25 × 10 × 9.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const regrasAditivasExercises: Exercise[] = [
  {
    id: 'padi-01',
    topicId: 'pe-regras-aditivas',
    kind: 'numeric',
    prompt: 'Sejam P(A) = 0,5, P(B) = 0,3 e P(A ∩ B) = 0,1. Calcule P(A ∪ B).',
    answer: 0.7,
    hints: [
      'Use a regra aditiva: P(A ∪ B) = P(A) + P(B) − P(A ∩ B).',
      '0,5 + 0,3 = 0,8. Agora subtraia a interseção.',
    ],
    solution:
      'P(A ∪ B) = 0,5 + 0,3 − 0,1 = 0,7. ' +
      'A subtração é obrigatória porque, ao somar P(A) e P(B), os resultados que estão nos DOIS eventos ' +
      'foram contados duas vezes. Sem subtrair daria 0,8 — errado. ' +
      'Só quando os eventos são mutuamente exclusivos (P(A∩B) = 0) você pode somar direto.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'padi-02',
    topicId: 'pe-regras-aditivas',
    kind: 'numeric',
    prompt:
      'Dois programas são testados de forma independente, cada um com 10% de chance de falhar. Qual a probabilidade de PELO MENOS UM falhar?',
    answer: 0.19,
    hints: [
      'Calcular direto exigiria somar "exatamente um falha" com "os dois falham". Existe um caminho mais curto.',
      'O complemento de "pelo menos um falha" é "NENHUM falha" — um caso só.',
      'P(nenhum falha) = 0,9 × 0,9 = 0,81. Agora use P(A) = 1 − P(A′).',
    ],
    solution:
      'P(nenhum falha) = 0,9 × 0,9 = 0,81 (multiplicamos porque são independentes). ' +
      'P(pelo menos um falha) = 1 − 0,81 = 0,19. ' +
      'Sempre que o enunciado disser "PELO MENOS UM", pense no complemento: o oposto é "nenhum", que é um ' +
      'único caso. Calcular direto aqui exigiria somar P(só o 1º falha) + P(só o 2º falha) + P(os dois ' +
      'falham) = 0,09 + 0,09 + 0,01 = 0,19 — mesma resposta, três vezes mais trabalho.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'padi-03',
    topicId: 'pe-regras-aditivas',
    kind: 'choice',
    prompt:
      'Um aluno calculou P(A) = 0,7, P(B) = 0,5 e concluiu que P(A ∪ B) = 1,2. O que está errado?',
    options: [
      'Nada: probabilidades podem passar de 1 quando há dois eventos',
      'Ele somou sem subtrair a interseção — probabilidade nunca passa de 1',
      'Ele deveria ter multiplicado em vez de somar',
      'Faltou dividir pelo número de eventos',
    ],
    answer: 1,
    hints: [
      'Um dos axiomas diz que 0 ≤ P(A) ≤ 1, sempre. O resultado 1,2 já denuncia o erro.',
      'Se P(A) + P(B) = 1,2 > 1, os eventos obrigatoriamente se sobrepõem — e a interseção tem que ser subtraída.',
    ],
    solution:
      'Probabilidade NUNCA passa de 1 — é um axioma. Como P(A) + P(B) = 1,2 > 1, os eventos ' +
      'obrigatoriamente se sobrepõem, e a regra correta é P(A ∪ B) = P(A) + P(B) − P(A ∩ B). ' +
      'Aliás, dá para deduzir um limite: como P(A ∪ B) ≤ 1, temos P(A ∩ B) ≥ 0,2. ' +
      'Sempre que sua conta der um valor negativo ou maior que 1, não é arredondamento: é erro de método, ' +
      'quase sempre somar coisas que se sobrepõem.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'padi-04',
    topicId: 'pe-regras-aditivas',
    kind: 'choice',
    prompt:
      'Num dado, A = "sair par" e B = "sair maior que 4". Qual é P(A ∪ B)?',
    options: ['5/6', '4/6 = 2/3', '1/6', '3/6 = 1/2'],
    answer: 1,
    hints: [
      'P(A) = 3/6, P(B) = 2/6, e A ∩ B = {6}, então P(A ∩ B) = 1/6.',
      'Aplique 3/6 + 2/6 − 1/6.',
    ],
    solution:
      'P(A ∪ B) = 3/6 + 2/6 − 1/6 = 4/6 = 2/3. ' +
      'Conferindo pela lista direta: A ∪ B = {2, 4, 5, 6}, quatro resultados em seis ✓. ' +
      'A alternativa 5/6 é o resultado de esquecer a subtração — nela o 6 foi contado duas vezes, uma como ' +
      'par e outra como maior que 4.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const condicionalExercises: Exercise[] = [
  {
    id: 'pcnd-01',
    topicId: 'pe-condicional',
    kind: 'numeric',
    prompt: 'Sabendo que P(A ∩ B) = 0,12 e P(B) = 0,4, calcule P(A | B).',
    answer: 0.3,
    hints: [
      'A definição é P(A | B) = P(A ∩ B) / P(B).',
      '0,12 dividido por 0,4.',
    ],
    solution:
      'P(A | B) = P(A ∩ B) / P(B) = 0,12 / 0,4 = 0,3. ' +
      'A ideia por trás: saber que B ocorreu ENCOLHE o espaço amostral para dentro de B. O numerador é a ' +
      'parte de A que sobreviveu, e o denominador é o novo total. ' +
      'Repare que P(A|B) = 0,3 é maior que P(A ∩ B) = 0,12 — condicionar sempre aumenta a probabilidade ' +
      'relativa, porque o denominador ficou menor que 1.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pcnd-02',
    topicId: 'pe-condicional',
    kind: 'choice',
    prompt:
      'Duas cartas são retiradas de um baralho de 52 SEM reposição. Qual é P(a 2ª ser ás | a 1ª foi ás)?',
    options: ['4/52', '3/51', '4/51', '3/52'],
    answer: 1,
    hints: [
      'Depois de tirar um ás e NÃO devolvê-lo, quantas cartas restam no baralho?',
      'Restam 51 cartas, e quantos ases ainda estão lá dentro?',
    ],
    solution:
      'Tirado um ás e não devolvido, restam 51 cartas, das quais 3 são ases. Logo P = 3/51 = 1/17. ' +
      'Se fosse COM reposição, a carta voltaria ao baralho e a resposta seria 4/52 — os eventos seriam ' +
      'independentes. ' +
      'Leia sempre o enunciado procurando "com reposição" ou "sem reposição": é a palavra que decide se as ' +
      'probabilidades mudam entre as retiradas.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pcnd-03',
    topicId: 'pe-condicional',
    kind: 'choice',
    prompt:
      'Sabendo que P(A) = 0,4, P(B) = 0,5 e P(A ∩ B) = 0,2, os eventos A e B são independentes?',
    options: [
      'Sim, porque P(A)·P(B) = 0,2 = P(A ∩ B)',
      'Não, porque a interseção não é zero',
      'Não, porque P(A) ≠ P(B)',
      'Não é possível decidir com esses dados',
    ],
    answer: 0,
    hints: [
      'O teste de independência é comparar P(A ∩ B) com o produto P(A)·P(B).',
      'P(A)·P(B) = 0,4 × 0,5 = 0,2. Compare com P(A ∩ B) = 0,2.',
    ],
    solution:
      'São INDEPENDENTES: P(A)·P(B) = 0,4 × 0,5 = 0,2, que é exatamente P(A ∩ B). ' +
      'A alternativa "não, porque a interseção não é zero" confunde independência com exclusão mútua — ' +
      'interseção zero é o critério de MUTUAMENTE EXCLUSIVOS, um conceito diferente (e aqui eles nem são ' +
      'exclusivos, já que podem ocorrer juntos). ' +
      'Conferindo pela outra forma: P(A|B) = 0,2/0,5 = 0,4 = P(A) ✓ — saber de B não mudou nada sobre A.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pcnd-04',
    topicId: 'pe-condicional',
    kind: 'numeric',
    prompt:
      'Uma urna tem 3 bolas vermelhas e 2 azuis. Duas são retiradas sem reposição. Qual a probabilidade de AMBAS serem vermelhas? Responda em decimal.',
    answer: 0.3,
    hints: [
      'Use a regra multiplicativa: P(A ∩ B) = P(A) · P(B | A).',
      'P(1ª vermelha) = 3/5. Depois de tirar uma vermelha, restam 2 vermelhas em 4 bolas.',
      '(3/5) × (2/4).',
    ],
    solution:
      'P(1ª vermelha) = 3/5. Sem reposição, restam 4 bolas com 2 vermelhas, então ' +
      'P(2ª vermelha | 1ª vermelha) = 2/4. ' +
      'P(ambas vermelhas) = (3/5)(2/4) = 6/20 = 0,3. ' +
      'A regra multiplicativa descreve eventos EM SEQUÊNCIA: a chance do primeiro, vezes a chance do ' +
      'segundo já sabendo que o primeiro aconteceu. Com reposição seria (3/5)(3/5) = 0,36 — maior, porque ' +
      'a bola vermelha voltaria para a urna.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const bayesExercises: Exercise[] = [
  {
    id: 'pbay-01',
    topicId: 'pe-bayes',
    kind: 'numeric',
    prompt:
      'Três máquinas produzem peças: B₁ faz 30% (2% defeituosas), B₂ faz 45% (3% defeituosas) e B₃ faz 25% (2% defeituosas). Qual é a probabilidade de uma peça sorteada ser defeituosa?',
    answer: 0.0245,
    hints: [
      'Use o teorema da probabilidade total: some as probabilidades de todos os caminhos que levam a "defeituosa".',
      'Cada caminho é P(máquina) × P(defeito | máquina).',
      '(0,30)(0,02) + (0,45)(0,03) + (0,25)(0,02) = 0,006 + 0,0135 + 0,005.',
    ],
    solution:
      'P(A) = (0,30)(0,02) + (0,45)(0,03) + (0,25)(0,02) = 0,006 + 0,0135 + 0,005 = 0,0245. ' +
      'Isso é o teorema da probabilidade total: para achar a chance de A, some TODOS os caminhos que ' +
      'levam a A. É exatamente o que um diagrama de árvore desenha. ' +
      'Confira sempre que as probabilidades da partição somam 1 (0,30 + 0,45 + 0,25 = 1 ✓) — se não ' +
      'somarem, você esqueceu um caminho.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pbay-02',
    topicId: 'pe-bayes',
    kind: 'choice',
    prompt:
      'Com os dados do exercício anterior (P(defeituosa) = 0,0245), uma peça saiu defeituosa. Qual a probabilidade de ela ter vindo da máquina B₃?',
    options: ['0,02', '0,25', '≈ 0,204', '≈ 0,551'],
    answer: 2,
    hints: [
      'Bayes é: o caminho específico dividido pela soma de todos os caminhos.',
      'O caminho por B₃ vale (0,25)(0,02) = 0,005. O total é 0,0245.',
      '0,005 / 0,0245.',
    ],
    solution:
      'P(B₃ | A) = (0,25)(0,02) / 0,0245 = 0,005 / 0,0245 ≈ 0,204. ' +
      'A estrutura de Bayes é sempre a mesma: UM caminho dividido por TODOS os caminhos — e o denominador ' +
      'é sempre a probabilidade total que você já calculou. ' +
      'As alternativas erradas são as armadilhas típicas: 0,02 é P(defeito | B₃), e 0,25 é P(B₃). Nenhuma ' +
      'das duas responde a pergunta, que é a INVERSA de ambas.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pbay-03',
    topicId: 'pe-bayes',
    kind: 'numeric',
    prompt:
      'Uma doença atinge 20% da população. O teste detecta 100% dos doentes e acerta 75% dos sadios. Dado um teste POSITIVO, qual a probabilidade de a pessoa estar doente? Responda em decimal.',
    answer: 0.5,
    hints: [
      'Imagine 1000 pessoas. Quantas estão doentes? Quantas são sadias?',
      '200 doentes (todos testam +) e 800 sadios, dos quais 25% testam + por engano: 200 falsos positivos.',
      'Entre todos os que testaram positivo, que fração está realmente doente?',
    ],
    solution:
      'Em 1000 pessoas: 200 doentes, todos com teste + (sensibilidade 100%). E 800 sadios, dos quais 25% ' +
      'dão falso positivo: 200 pessoas. ' +
      'Total de positivos = 200 + 200 = 400, dos quais 200 estão doentes. P(doente | +) = 200/400 = 0,5. ' +
      'Ou seja, mesmo com um teste que NUNCA erra um doente, um resultado positivo significa apenas 50% ' +
      'de chance de estar doente — porque os sadios são tão numerosos que geram tantos alarmes falsos ' +
      'quanto há doentes de verdade.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'pbay-04',
    topicId: 'pe-bayes',
    kind: 'choice',
    prompt:
      'Num teste médico, P(positivo | doente) = 0,99 e P(doente | positivo) = 0,17. Como explicar essa diferença enorme?',
    options: [
      'Um dos dois valores está errado — deveriam ser iguais',
      'São perguntas diferentes: com doença rara, os falsos positivos entre os sadios superam os verdadeiros positivos',
      'A diferença vem de erro de arredondamento',
      'P(doente | positivo) é sempre menor porque probabilidade condicional sempre diminui',
    ],
    answer: 1,
    hints: [
      'Pense em 10.000 pessoas com uma doença que atinge 1%: são 100 doentes e 9.900 sadios.',
      'Mesmo um erro pequeno aplicado a 9.900 sadios gera muito mais alarmes falsos do que existem doentes.',
    ],
    solution:
      'São perguntas DIFERENTES, e essa é a lição central do tópico. P(+ | doente) olha só os doentes; ' +
      'P(doente | +) olha só os que testaram positivo — grupos completamente distintos. ' +
      'Com prevalência de 1% em 10.000 pessoas: 100 doentes (99 detectados) e 9.900 sadios, dos quais 5% ' +
      'dão falso positivo = 495. Os falsos positivos são CINCO VEZES mais numerosos que os verdadeiros. ' +
      'Trocar as duas tem nome — falácia da taxa de base — e é o erro mais caro que se comete com ' +
      'probabilidade condicional. Não há nada de errado com os números.',
    xpReward: 45,
    difficulty: 3,
  },
];
