import { Exercise } from '@/types/exercise';

export const variaveisAleatoriasExercises: Exercise[] = [
  {
    id: 'pva-01',
    topicId: 'pe-variaveis-aleatorias',
    kind: 'numeric',
    prompt:
      'Seja X o número de caras em dois lançamentos de moeda honesta. Quanto vale P(X = 1)? Responda em decimal.',
    answer: 0.5,
    hints: [
      'Liste o espaço amostral: {CC, CK, KC, KK}. Em quais deles X vale exatamente 1?',
      'KC e CK dão X = 1. São 2 resultados em 4.',
    ],
    solution:
      'O espaço amostral é {CC, CK, KC, KK}, e X = 1 em DOIS deles: CK e KC. Logo P(X = 1) = 2/4 = 0,5. ' +
      'A distribuição completa é f(0) = 1/4, f(1) = 2/4, f(2) = 1/4 — e note que ela soma 1, como toda ' +
      'distribuição válida precisa. ' +
      'Quem trata "uma cara e uma coroa" como um caso só responde 1/3 e erra.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pva-02',
    topicId: 'pe-variaveis-aleatorias',
    kind: 'numeric',
    prompt:
      'Ainda com X = número de caras em duas moedas, calcule a acumulada F(1) = P(X ≤ 1). Responda em decimal.',
    answer: 0.75,
    hints: [
      'A acumulada soma todas as probabilidades até o valor indicado, inclusive.',
      'P(X ≤ 1) = P(X = 0) + P(X = 1) = 1/4 + 2/4.',
    ],
    solution:
      'F(1) = P(X ≤ 1) = f(0) + f(1) = 1/4 + 2/4 = 3/4 = 0,75. ' +
      'A distribuição acumulada é útil para responder "no máximo" sem recontar termo a termo. ' +
      'Atenção: em variável DISCRETA, P(X ≤ 1) e P(X < 1) são diferentes — o segundo daria só 0,25. ' +
      'Em variável contínua, os dois são iguais.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pva-03',
    topicId: 'pe-variaveis-aleatorias',
    kind: 'choice',
    prompt: 'Para uma variável aleatória CONTÍNUA X, quanto vale P(X = 5)?',
    options: [
      'Depende da função densidade em x = 5',
      'Zero, porque a área de um ponto sem largura é zero',
      'Sempre 1/∞, um valor muito pequeno mas positivo',
      'Não é possível calcular',
    ],
    answer: 1,
    hints: [
      'Em variável contínua, probabilidade é ÁREA sob a curva entre dois pontos.',
      'Qual é a área de um segmento que tem altura mas nenhuma largura?',
    ],
    solution:
      'P(X = 5) = 0. Em variável contínua, probabilidade é a ÁREA sob a densidade entre dois pontos — e um ' +
      'ponto isolado não tem largura, logo não tem área. ' +
      'Isso não significa que o valor 5 seja impossível; significa que a probabilidade se distribui em ' +
      'intervalos, não em pontos. ' +
      'A consequência prática é útil: P(X < 5) = P(X ≤ 5), então não faz diferença usar < ou ≤ no ' +
      'contínuo. Em discreto, faz toda a diferença. ' +
      'Note também que a densidade f(5) pode ser maior que 1 — o que nunca passa de 1 é a ÁREA.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pva-04',
    topicId: 'pe-variaveis-aleatorias',
    kind: 'choice',
    prompt:
      'Qual destas variáveis é DISCRETA?',
    options: [
      'Tempo até uma lâmpada queimar',
      'Número de peças defeituosas num lote de 50',
      'Resistência à tensão de um polímero, em psi',
      'Peso de um pacote de café',
    ],
    answer: 1,
    hints: [
      'Discreta vem de CONTAR; contínua vem de MEDIR.',
      'Teste: entre dois valores possíveis, sempre cabe um terceiro? Se sim, é contínua.',
    ],
    solution:
      'O número de peças defeituosas é DISCRETO: os valores possíveis são 0, 1, 2, ..., 50 — contáveis, e ' +
      'entre 3 e 4 defeituosas não existe nada. ' +
      'Tempo, resistência e peso são CONTÍNUOS: resultam de medição, e entre dois valores sempre cabe um ' +
      'terceiro. ' +
      'É a mesma distinção da Seção 1.6, e ela organiza o livro: discretas no Capítulo 5 (binomial, ' +
      'Poisson), contínuas no Capítulo 6 (normal, exponencial).',
    xpReward: 25,
    difficulty: 1,
  },
];

export const esperancaExercises: Exercise[] = [
  {
    id: 'pesp2-01',
    topicId: 'pe-esperanca',
    kind: 'numeric',
    prompt:
      'X = número de caras em duas moedas, com f(0) = 1/4, f(1) = 1/2, f(2) = 1/4. Calcule E(X).',
    answer: 1,
    hints: [
      'Esperança é a média ponderada: E(X) = Σ x · f(x).',
      '0(1/4) + 1(1/2) + 2(1/4) = 0 + 0,5 + 0,5.',
    ],
    solution:
      'E(X) = 0(1/4) + 1(1/2) + 2(1/4) = 0 + 0,5 + 0,5 = 1. ' +
      'Faz sentido: em média sai uma cara em dois lançamentos. ' +
      'Cada valor entra pesado pela sua probabilidade — é uma média PONDERADA, não a média simples dos ' +
      'valores possíveis (que daria 1 aqui por coincidência, mas não em geral).',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pesp2-02',
    topicId: 'pe-esperanca',
    kind: 'numeric',
    prompt:
      'Para a mesma X, sabe-se que E(X²) = 1,5 e E(X) = 1. Calcule a variância σ². Responda em decimal.',
    answer: 0.5,
    hints: [
      'Use a fórmula computacional: σ² = E(X²) − μ².',
      'μ = 1, então μ² = 1. Subtraia de 1,5.',
    ],
    solution:
      'σ² = E(X²) − μ² = 1,5 − 1² = 0,5. O desvio-padrão é σ = √0,5 ≈ 0,707. ' +
      'Repare que E(X²) = 1,5 é DIFERENTE de [E(X)]² = 1 — e a diferença entre os dois É exatamente a ' +
      'variância. Trocar a ordem de "elevar ao quadrado" e "tirar a média" é o erro mais frequente do ' +
      'capítulo. ' +
      'A fórmula computacional σ² = E(X²) − μ² dá o mesmo resultado que a definição Σ(x−μ)²f(x), mas com ' +
      'muito menos conta.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pesp2-03',
    topicId: 'pe-esperanca',
    kind: 'numeric',
    prompt: 'Se Var(X) = 2, quanto vale Var(3X + 5)?',
    answer: 18,
    hints: [
      'A regra é Var(aX + b) = a²·Var(X). Repare no que acontece com o b.',
      'O b = 5 desaparece: somar constante desloca a distribuição sem mudar o espalhamento.',
      'Var(3X + 5) = 3² × 2.',
    ],
    solution:
      'Var(3X + 5) = 3² × Var(X) = 9 × 2 = 18. ' +
      'Duas coisas acontecem aqui, e as duas são cobradas: ' +
      '(1) o b = 5 SOME, porque somar uma constante desloca a distribuição inteira sem alterar o ' +
      'espalhamento; ' +
      '(2) o a = 3 entra AO QUADRADO, porque variância está em unidade ao quadrado. ' +
      'Para o desvio-padrão o efeito é menor: σ passa de √2 para 3√2, apenas triplicado.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pesp2-04',
    topicId: 'pe-esperanca',
    kind: 'choice',
    prompt:
      'Sejam X e Y duas variáveis aleatórias. Qual afirmação é SEMPRE verdadeira, sem exigir independência?',
    options: [
      'Var(X + Y) = Var(X) + Var(Y)',
      'E(X + Y) = E(X) + E(Y)',
      'E(XY) = E(X)·E(Y)',
      'Todas as três',
    ],
    answer: 1,
    hints: [
      'A esperança é um operador linear — ela "passa através" da soma sem restrições.',
      'Já a variância e o produto de esperanças exigem que as variáveis não estejam associadas.',
    ],
    solution:
      'Apenas E(X + Y) = E(X) + E(Y) vale SEMPRE — a esperança é linear, sem nenhuma condição. ' +
      'Var(X + Y) = Var(X) + Var(Y) exige INDEPENDÊNCIA; no caso geral, ' +
      'Var(X + Y) = Var(X) + Var(Y) + 2·Cov(X,Y). ' +
      'E(XY) = E(X)·E(Y) também exige independência — a diferença entre os dois lados é justamente a ' +
      'covariância: Cov(X,Y) = E(XY) − μₓμᵧ. ' +
      'Guardar essa assimetria evita o erro de somar variâncias de variáveis correlacionadas.',
    xpReward: 45,
    difficulty: 3,
  },
];

export const uniformeDiscretaExercises: Exercise[] = [
  {
    id: 'punif-01',
    topicId: 'pe-uniforme-discreta',
    kind: 'numeric',
    prompt: 'Um dado honesto de 6 faces é lançado. Qual é f(x) para qualquer face x? Responda em decimal.',
    answer: 0.1667,
    hints: [
      'É uniforme discreta: todos os N = 6 valores têm a mesma chance, f(x) = 1/N.',
      '1/6 em decimal, com 4 casas.',
    ],
    solution:
      'f(x) = 1/N = 1/6 ≈ 0,1667 para qualquer face. ' +
      'Não há conta nenhuma além de contar quantos valores existem — é a marca registrada da uniforme: ' +
      'nenhum resultado é mais provável que outro.',
    xpReward: 15,
    difficulty: 1,
  },
  {
    id: 'punif-02',
    topicId: 'pe-uniforme-discreta',
    kind: 'numeric',
    prompt: 'Um número inteiro é sorteado ao acaso entre 10 e 20 (inclusive, incremento 1). Calcule μ = E(X).',
    answer: 15,
    hints: ['μ = (a + b)/2.', 'a = 10, b = 20.'],
    solution:
      'μ = (a + b)/2 = (10 + 20)/2 = 15. ' +
      'A média da uniforme é sempre o ponto médio do intervalo — faz sentido porque todo valor pesa igual, ' +
      'não há nenhum lado "puxando" a média para cima ou para baixo.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'punif-03',
    topicId: 'pe-uniforme-discreta',
    kind: 'numeric',
    prompt:
      'Ainda com X sorteado entre 10 e 20 (inclusive, incremento 1), calcule a variância σ². Responda em decimal.',
    answer: 10,
    hints: [
      'σ² = [(b − a + 1)² − 1] / 12.',
      'N = b − a + 1 = 20 − 10 + 1 = 11. Depois calcule (11² − 1)/12.',
    ],
    solution:
      'N = 11, então σ² = (11² − 1)/12 = (121 − 1)/12 = 120/12 = 10. ' +
      'Repare que essa fórmula só vale para incremento 1 (valores inteiros consecutivos) — é a versão que ' +
      'a prova cobra, porque é a mesma do exemplo do dado.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const binomialExercises: Exercise[] = [
  {
    id: 'pbin-01',
    topicId: 'pe-binomial',
    kind: 'numeric',
    prompt:
      'Cinco peças são inspecionadas, cada uma com 10% de chance de estar defeituosa. Qual a probabilidade de EXATAMENTE 2 estarem defeituosas? Responda em decimal.',
    answer: 0.0729,
    hints: [
      'É binomial com n = 5, p = 0,10, x = 2. A fórmula é C(n,x)·pˣ·(1−p)ⁿ⁻ˣ.',
      'C(5,2) = 10. E (0,1)² = 0,01, (0,9)³ = 0,729.',
      'Multiplique 10 × 0,01 × 0,729.',
    ],
    solution:
      'b(2; 5; 0,1) = C(5,2)·(0,1)²·(0,9)³ = 10 × 0,01 × 0,729 = 0,0729. ' +
      'Leia a fórmula em três partes: (0,1)² é a chance dos 2 defeitos acontecerem; (0,9)³ é a chance das ' +
      '3 peças boas restantes; e C(5,2) = 10 conta de quantas MANEIRAS esses 2 defeitos podem se ' +
      'distribuir entre as 5 peças. ' +
      'Sem o termo de combinação você calcularia a chance de uma sequência específica, não do evento.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pbin-02',
    topicId: 'pe-binomial',
    kind: 'numeric',
    prompt:
      'Uma moeda honesta é lançada 100 vezes. Qual é o número esperado de caras?',
    answer: 50,
    hints: ['Para a binomial, μ = n·p.', 'n = 100 e p = 0,5.'],
    solution:
      'μ = n·p = 100 × 0,5 = 50 caras esperadas. ' +
      'A fórmula é curta porque a binomial é uma soma de n tentativas independentes, cada uma com ' +
      'esperança p — e a esperança da soma é a soma das esperanças.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pbin-03',
    topicId: 'pe-binomial',
    kind: 'numeric',
    prompt: 'No mesmo lançamento de 100 moedas honestas, qual é a variância do número de caras?',
    answer: 25,
    hints: ['Para a binomial, σ² = n·p·(1 − p).', '100 × 0,5 × 0,5.'],
    solution:
      'σ² = n·p·(1−p) = 100 × 0,5 × 0,5 = 25, e portanto σ = 5. ' +
      'Juntando com μ = 50: é comum sair entre 45 e 55 caras (um desvio) e raro sair fora de 40–60 (dois ' +
      'desvios). ' +
      'Esse raciocínio é a base de qualquer teste A/B — permite decidir se uma diferença observada é real ' +
      'ou ruído amostral.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pbin-04',
    topicId: 'pe-binomial',
    kind: 'choice',
    prompt:
      'Num experimento binomial com n = 10, como se calcula P(pelo menos 2 sucessos) da forma mais econômica?',
    options: [
      'b(2) + b(3) + ... + b(10)',
      '1 − [b(0) + b(1)]',
      '1 − b(2)',
      'b(0) + b(1)',
    ],
    answer: 1,
    hints: [
      '"Pelo menos 2" significa 2, 3, 4, ..., até 10 — nove termos.',
      'Qual é o complemento de "pelo menos 2"? É "menos que 2", ou seja, 0 ou 1.',
    ],
    solution:
      'P(pelo menos 2) = 1 − P(menos que 2) = 1 − [b(0) + b(1)] — apenas dois termos, em vez de nove. ' +
      'A alternativa b(2) + ... + b(10) chega ao mesmo resultado, mas com muito mais trabalho. ' +
      'A tradução geral: "exatamente k" é um termo; "no máximo k" soma de 0 até k; "pelo menos k" é ' +
      '1 menos a soma de 0 até k−1. Usar o complemento quando a cauda pedida é a maior das duas economiza ' +
      'metade da prova.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const geometricaExercises: Exercise[] = [
  {
    id: 'pgeo-01',
    topicId: 'pe-geometrica',
    kind: 'numeric',
    prompt:
      'Um vendedor fecha uma venda com probabilidade p = 0,3 a cada visita, independentemente. Qual a probabilidade de a PRIMEIRA venda ser fechada exatamente na 4ª visita? Responda em decimal.',
    answer: 0.1029,
    hints: [
      'f(x) = p·(1−p)^(x−1), com x = 4.',
      '0,3 × (0,7)³. (0,7)³ = 0,343.',
    ],
    solution:
      'f(4) = 0,3 × (0,7)³ = 0,3 × 0,343 = 0,1029. ' +
      'As três primeiras visitas falham (0,7 cada) e a quarta acerta (0,3) — não existe combinação aqui, ' +
      'porque só há UMA ordem possível: falha, falha, falha, sucesso. O sucesso é sempre o último evento.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pgeo-02',
    topicId: 'pe-geometrica',
    kind: 'numeric',
    prompt: 'Para o mesmo vendedor (p = 0,3), quantas visitas se espera em média até a primeira venda?',
    answer: 3.33,
    hints: ['μ = 1/p.', '1/0,3.'],
    solution:
      'μ = 1/p = 1/0,3 ≈ 3,33 visitas. ' +
      'Quanto menor a chance de sucesso por tentativa, mais tentativas se espera precisar — a relação é ' +
      'inversamente proporcional a p.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'pgeo-03',
    topicId: 'pe-geometrica',
    kind: 'numeric',
    prompt:
      'Ainda com p = 0,3, qual a probabilidade de precisar de MAIS que 3 visitas para a primeira venda? Responda em decimal.',
    answer: 0.343,
    hints: [
      'Use o atalho P(X > x) = (1 − p)ˣ, sem somar termo a termo.',
      '(0,7)³.',
    ],
    solution:
      'P(X > 3) = (1 − p)³ = (0,7)³ = 0,343. ' +
      '"Mais que 3 visitas" significa que as 3 primeiras falharam todas, sem exigir nada sobre a quarta — ' +
      'por isso o atalho (1−p)ˣ funciona direto, sem somar f(4) + f(5) + ...',
    xpReward: 35,
    difficulty: 2,
  },
];

export const binomialNegativaExercises: Exercise[] = [
  {
    id: 'pbneg-01',
    topicId: 'pe-binomial-negativa',
    kind: 'numeric',
    prompt:
      'O mesmo vendedor (p = 0,3) precisa fechar 3 vendas (r = 3). Qual a probabilidade de precisar de EXATAMENTE 6 visitas? Responda em decimal.',
    answer: 0.0926,
    hints: [
      'f(x) = C(x−1, r−1)·pʳ·(1−p)^(x−r), com r = 3, x = 6.',
      'C(5, 2) = 10. Depois 10 × (0,3)³ × (0,7)³.',
    ],
    solution:
      'f(6) = C(5,2)·(0,3)³·(0,7)³ = 10 × 0,027 × 0,343 ≈ 0,0926. ' +
      'A combinação é C(x−1, r−1) = C(5, 2), NÃO C(6, 3) — porque a 6ª visita é obrigatoriamente a 3ª ' +
      'venda (o último evento), então só as 5 visitas anteriores podem variar de ordem entre si.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pbneg-02',
    topicId: 'pe-binomial-negativa',
    kind: 'numeric',
    prompt: 'Ainda com r = 3 e p = 0,3, quantas visitas se espera em média até a 3ª venda?',
    answer: 10,
    hints: ['μ = r/p.', '3/0,3.'],
    solution:
      'μ = r/p = 3/0,3 = 10 visitas esperadas. ' +
      'Repare que é exatamente 3 vezes a média da geométrica (3,33 × 3 ≈ 10) — faz sentido, porque ' +
      'precisar do 3º sucesso é, em média, como precisar do 1º sucesso três vezes seguidas.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pbneg-03',
    topicId: 'pe-binomial-negativa',
    kind: 'choice',
    prompt: 'Fazendo r = 1 na fórmula da binomial negativa, o que acontece?',
    options: [
      'A fórmula fica indefinida',
      'Ela vira exatamente a distribuição geométrica',
      'Ela vira a distribuição binomial',
      'Nada muda, r não afeta a fórmula',
    ],
    answer: 1,
    hints: [
      'Substitua r = 1 em C(x−1, r−1): quanto vale C(x−1, 0)?',
      'C(x−1, 0) = 1 sempre, para qualquer x.',
    ],
    solution:
      'Com r = 1: C(x−1, 0) = 1 sempre, e f(x) = 1 · p¹ · (1−p)^(x−1) = p(1−p)ˣ⁻¹ — exatamente a fórmula ' +
      'da geométrica. ' +
      'A geométrica é o caso particular "esperar pelo 1º sucesso" da binomial negativa, que generaliza ' +
      'para o r-ésimo sucesso.',
    xpReward: 35,
    difficulty: 2,
  },
];

export const hipergeometricaExercises: Exercise[] = [
  {
    id: 'phip-01',
    topicId: 'pe-hipergeometrica',
    kind: 'numeric',
    prompt:
      'Um lote tem N = 50 peças, das quais K = 3 são defeituosas. Uma amostra de n = 6 é retirada SEM reposição. Quantos "casos possíveis" totais entram no denominador da fórmula — ou seja, quanto vale C(N, n) = C(50, 6)?',
    answer: 15890700,
    hints: [
      'O denominador da hipergeométrica é sempre C(N, n), o total de amostras possíveis, sem distinguir sucesso de fracasso.',
      'C(50, 6) = 50!/(6!·44!).',
    ],
    solution:
      'C(50, 6) = 15.890.700. ' +
      'Esse número enorme é normal — é por isso que o professor libera calculadora ou Excel para essa ' +
      'conta. O que importa é montar C(K,x)·C(N−K,n−x)/C(N,n) corretamente, não multiplicar fatoriais ' +
      'de cabeça.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'phip-02',
    topicId: 'pe-hipergeometrica',
    kind: 'choice',
    prompt:
      'Um lote de 850 peças tem 50 defeituosas. Duas peças são retiradas SEM reposição. Por que P(X = 1) soma DOIS produtos, e não um só?',
    options: [
      'Porque há dois erros possíveis de arredondamento',
      'Porque existem duas ordens possíveis: (boa, defeituosa) e (defeituosa, boa)',
      'Porque N = 850 é par',
      'Não deveria somar — é um erro do gabarito',
    ],
    answer: 1,
    hints: [
      'X = 1 significa "exatamente uma defeituosa nas duas peças" — de quantas formas isso pode acontecer na ORDEM da retirada?',
      'A defeituosa pode sair primeiro ou segundo.',
    ],
    solution:
      'Existem duas sequências que dão exatamente 1 defeituosa: defeituosa-depois-boa e boa-depois-defeituosa. ' +
      'Por isso P(X=1) = (800/850)(50/849) + (50/850)(800/849) ≈ 0,111. ' +
      'É a mesma ideia da combinação C(K,x) na fórmula geral: ela conta "de quantas formas" o evento pode ' +
      'acontecer antes de multiplicar pela probabilidade de cada forma.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'phip-03',
    topicId: 'pe-hipergeometrica',
    kind: 'choice',
    prompt: 'O fator de correção (N−n)/(N−1) na variância da hipergeométrica se aproxima de QUANTO quando N é muito maior que n?',
    options: ['De 0', 'De 1', 'De 1/2', 'De N'],
    answer: 1,
    hints: [
      'Se o lote é gigante e a amostra é pequena, (N−n) e (N−1) ficam quase iguais.',
      'Um número quase igual a ele mesmo, dividido por ele mesmo, dá aproximadamente 1.',
    ],
    solution:
      'O fator se aproxima de 1, e a variância da hipergeométrica se aproxima de np(1−p) — a mesma da ' +
      'binomial. Faz sentido: se a amostra é uma fatia minúscula da população, retirar sem reposição ' +
      'quase não muda a composição do que resta, e o cenário vira quase idêntico a amostrar com ' +
      'reposição. É a mesma regra prática de "amostra menor que 5% da população → aproxime por binomial" ' +
      'vista na aula da distribuição binomial.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const poissonExercises: Exercise[] = [
  {
    id: 'ppoi-01',
    topicId: 'pe-poisson',
    kind: 'numeric',
    prompt:
      'Uma central recebe em média 4 chamadas por hora. Qual é o valor de λt para uma pergunta sobre MEIA hora?',
    answer: 2,
    hints: [
      'λt é o número médio de ocorrências NO INTERVALO da pergunta.',
      'Se são 4 por hora, quantas em média em meia hora?',
    ],
    solution:
      'λt = 4 × 0,5 = 2 chamadas em meia hora. ' +
      'Esta é a pegadinha mais comum da Poisson: usar o λ do enunciado sem ajustar ao intervalo pedido. ' +
      'Para três horas seria λt = 12; para 15 minutos, λt = 1. Sempre recalcule a média para o intervalo ' +
      'da pergunta antes de aplicar a fórmula.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ppoi-02',
    topicId: 'pe-poisson',
    kind: 'numeric',
    prompt:
      'Numa distribuição de Poisson, a média de ocorrências num intervalo é 6. Quanto vale a variância?',
    answer: 6,
    hints: [
      'A Poisson tem uma propriedade que nenhuma outra distribuição comum tem.',
      'Média e variância são iguais: μ = σ² = λt.',
    ],
    solution:
      'σ² = 6. Na Poisson, μ = σ² = λt — média e variância são o MESMO número. ' +
      'Nenhuma outra distribuição comum tem essa propriedade, e é por isso que ela é fácil de identificar ' +
      'em dados reais: se numa contagem a média amostral e a variância amostral saem parecidas, Poisson é ' +
      'uma boa candidata. Se a variância for muito maior que a média, o modelo provavelmente não serve.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'ppoi-03',
    topicId: 'pe-poisson',
    kind: 'numeric',
    prompt:
      'Um lote de 1000 peças tem 0,2% de defeito. Usando a aproximação de Poisson para a binomial, qual é o valor de μ?',
    answer: 2,
    hints: [
      'A aproximação usa μ = n·p, a mesma média da binomial.',
      '1000 × 0,002.',
    ],
    solution:
      'μ = n·p = 1000 × 0,002 = 2. ' +
      'A aproximação de Poisson vale quando n é grande e p é pequeno — o critério usual é n ≥ 20 e ' +
      'p ≤ 0,05, ou com mais folga n ≥ 100 e np ≤ 10. Aqui n = 1000 e p = 0,002 se encaixam com sobra. ' +
      'Faz sentido: a variância da binomial np(1−p) tende a np quando p é minúsculo, e np é exatamente a ' +
      'variância da Poisson. Calcular C(1000, 3) na mão seria inviável; e⁻²·2³/3! ≈ 0,18 sai em segundos.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ppoi-04',
    topicId: 'pe-poisson',
    kind: 'choice',
    prompt: 'Quando se deve usar Poisson em vez de binomial?',
    options: [
      'Quando a probabilidade de sucesso é maior que 0,5',
      'Quando não existe um número fixo de tentativas, e sim ocorrências num intervalo de tempo, área ou comprimento',
      'Quando a amostra tem menos de 30 elementos',
      'Quando os eventos são dependentes entre si',
    ],
    answer: 1,
    hints: [
      'A binomial exige um n fixo de tentativas. Em "quantas chamadas chegam em uma hora", qual seria o n?',
      'Não existe número de tentativas — existe um intervalo contínuo em que os eventos ocorrem.',
    ],
    solution:
      'Poisson é para contagens em um INTERVALO contínuo (tempo, área, comprimento), onde não existe um n ' +
      'fixo de tentativas: chamadas por hora, defeitos por metro de cabo, acidentes por mês. ' +
      'A binomial exige os quatro requisitos, entre eles um número fixo de tentativas. ' +
      'Existe também o uso da Poisson como APROXIMAÇÃO da binomial quando n é grande e p pequeno — mas aí ' +
      'ela é um atalho de cálculo, não o modelo natural do problema. ' +
      'Independência continua sendo exigida nos dois casos.',
    xpReward: 35,
    difficulty: 2,
  },
];

export const normalExercises: Exercise[] = [
  {
    id: 'pnor-01',
    topicId: 'pe-normal',
    kind: 'numeric',
    prompt:
      'O QI tem distribuição normal com μ = 100 e σ = 15. Qual é o valor padronizado z correspondente a x = 130?',
    answer: 2,
    hints: ['Use z = (x − μ)/σ.', '(130 − 100)/15.'],
    solution:
      'z = (130 − 100)/15 = 30/15 = 2,00. ' +
      'O z responde: "a quantos desvios-padrão da média este ponto está?". Aqui, exatamente DOIS desvios ' +
      'acima da média. ' +
      'Essa padronização é o que permite uma única tabela servir para qualquer normal — ela apaga a escala ' +
      'original e traduz tudo para μ = 0 e σ = 1.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pnor-02',
    topicId: 'pe-normal',
    kind: 'numeric',
    prompt:
      'Ainda com QI ~ N(100, 15²), sabendo que Φ(2,00) = 0,9772, calcule P(X > 130). Responda em decimal.',
    answer: 0.0228,
    hints: [
      'A tabela dá a área à ESQUERDA. Você quer a área à direita.',
      'P(X > 130) = 1 − Φ(2,00) = 1 − 0,9772.',
    ],
    solution:
      'P(X > 130) = 1 − Φ(2,00) = 1 − 0,9772 = 0,0228, ou cerca de 2,3% da população. ' +
      'A tabela sempre dá a área acumulada à esquerda, então "maior que" exige o complemento. ' +
      'Confere com a regra empírica: 95% ficam entre μ − 2σ e μ + 2σ (isto é, 70 e 130), sobrando 5% ' +
      'divididos igualmente nas duas caudas — 2,5% de cada lado ✓.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pnor-03',
    topicId: 'pe-normal',
    kind: 'numeric',
    prompt:
      'Pela regra empírica, aproximadamente 95% dos dados de uma distribuição normal caem dentro de quantos desvios-padrão da média?',
    answer: 2,
    hints: [
      'A regra empírica dá três marcos: um para 68%, um para 95% e um para 99,7%.',
      '68% → 1 desvio; 99,7% → 3 desvios.',
    ],
    solution:
      'Aproximadamente 95% dos dados caem em μ ± 2σ. Os três marcos da regra empírica são: ' +
      '68% em μ ± σ, 95% em μ ± 2σ e 99,7% em μ ± 3σ. ' +
      'Eles valem para QUALQUER normal, independentemente de μ e σ — porque a padronização apaga a escala. ' +
      'Isso permite estimar probabilidades de cabeça, sem tabela, e serve de conferência rápida: se sua ' +
      'conta com tabela deu algo muito diferente disso, provavelmente houve erro.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pnor-04',
    topicId: 'pe-normal',
    kind: 'choice',
    prompt:
      'Ao usar a normal para aproximar uma binomial e calcular P(X = 8), qual é o procedimento correto?',
    options: [
      'Calcular a área exatamente em x = 8',
      'Calcular a área entre 7,5 e 8,5 — a correção de continuidade',
      'Calcular a área entre 8 e 9',
      'A normal não pode aproximar a binomial',
    ],
    answer: 1,
    hints: [
      'A binomial é discreta e a normal é contínua. Quanto vale P(X = 8) numa distribuição contínua?',
      'Numa contínua, a área de um ponto é zero — então é preciso dar "largura" ao valor 8.',
    ],
    solution:
      'Usa-se a CORREÇÃO DE CONTINUIDADE: a área entre 7,5 e 8,5. ' +
      'O motivo é que você está usando uma distribuição CONTÍNUA para aproximar uma DISCRETA, e numa ' +
      'contínua a área de um ponto isolado é zero. Dar meia unidade para cada lado devolve ao valor 8 a ' +
      '"largura" que ele tem na barra do histograma binomial. ' +
      'A mesma correção vale nas desigualdades: P(X ≤ 8) usa até 8,5, e P(X ≥ 8) começa em 7,5. ' +
      'Esquecer a correção é o erro padrão nessa questão. A aproximação em si é válida quando np ≥ 5 e ' +
      'n(1−p) ≥ 5.',
    xpReward: 45,
    difficulty: 3,
  },
];
