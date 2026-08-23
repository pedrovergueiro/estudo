import { Exercise } from '@/types/exercise';

/** Exercícios das Secções 2.3 (propriedades + confronto) e 2.4 (definição formal). */

export const propriedadesLimitesExercises: Exercise[] = [
  {
    id: 'cprop-01',
    topicId: 'cal-propriedades-limites',
    kind: 'numeric',
    prompt:
      'Sabendo que lim(x→a) f(x) = 3 e lim(x→a) g(x) = −2, calcule lim(x→a) [f(x) + 2·g(x)].',
    answer: -1,
    hints: [
      'Use a propriedade da soma para separar em dois limites, e depois a da constante para tirar o 2 de dentro.',
      'Fica lim f + 2·lim g. Agora substitua os valores dados.',
      '3 + 2·(−2).',
    ],
    solution:
      'Pela propriedade da soma: lim [f + 2g] = lim f + lim (2g). ' +
      'Pela propriedade da constante: lim (2g) = 2 · lim g. ' +
      'Logo o resultado é 3 + 2·(−2) = 3 − 4 = −1. ' +
      'Repare que o enunciado ENTREGOU os dois limites já existindo — é essa informação que autoriza ' +
      'usar as propriedades. Sem ela, nenhuma das regras poderia ser aplicada.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cprop-02',
    topicId: 'cal-propriedades-limites',
    kind: 'numeric',
    prompt: 'Calcule lim(x→2) (3x² − 5x + 1) usando as propriedades operatórias.',
    answer: 3,
    hints: [
      'É um polinômio. Separe pela soma/diferença e tire as constantes para fora.',
      'Vira 3·(2)² − 5·(2) + 1.',
    ],
    solution:
      'Aplicando soma, diferença e constante: lim (3x²) − lim (5x) + lim 1 = 3·lim x² − 5·lim x + 1. ' +
      'Como lim(x→2) x = 2, temos 3·(4) − 5·(2) + 1 = 12 − 10 + 1 = 3. ' +
      'Na prática você substitui direto — mas a justificativa por escrito é: "pelas propriedades ' +
      'operatórias, o limite de uma função polinomial em x = a é p(a)". É essa frase que vale nota na ' +
      'lista, não a conta.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'cprop-03',
    topicId: 'cal-propriedades-limites',
    kind: 'choice',
    prompt:
      'Você quer calcular lim(x→1) f(x)/g(x) e descobre que lim(x→1) g(x) = 0. O que se conclui?',
    options: [
      'O limite do quociente é infinito, sempre',
      'O limite do quociente não existe',
      'A regra do quociente não se aplica; é preciso investigar se a forma é 0/0 ou número/0',
      'O limite do quociente é zero',
    ],
    answer: 2,
    hints: [
      'A regra do quociente traz uma condição explícita: lim g ≠ 0. Se ela falha, a regra fica indisponível.',
      'Ficar indisponível não é o mesmo que o limite não existir — significa que você precisa de outra ferramenta.',
      'O que muda tudo é o que o NUMERADOR faz: ele também tende a zero, ou não?',
    ],
    solution:
      'A regra do quociente exige lim g ≠ 0. Quando o denominador tende a zero ela simplesmente não pode ' +
      'ser usada, e aí há dois cenários bem diferentes: ' +
      '(1) se lim f = 0 também, a forma é 0/0 — indeterminada, e você fatora ou racionaliza para descobrir ' +
      'o valor, que pode ser qualquer número; ' +
      '(2) se lim f ≠ 0, a forma é número/0 — a função explode para ±∞ e existe assíntota vertical. ' +
      'Concluir "não existe" direto é o erro mais caro: (x²−9)/(x−3) tem denominador tendendo a zero em ' +
      'x = 3 e mesmo assim o limite existe e vale 6.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'cprop-04',
    topicId: 'cal-propriedades-limites',
    kind: 'choice',
    prompt:
      'Verdadeiro ou falso: se lim(x→a) [f(x) + g(x)] existe, então lim(x→a) f(x) e lim(x→a) g(x) existem.',
    options: [
      'Verdadeiro — é a propriedade da soma lida ao contrário',
      'Falso — a soma pode existir mesmo com as duas parcelas sem limite',
      'Verdadeiro, desde que f e g sejam contínuas',
      'Falso, mas apenas quando a soma dá zero',
    ],
    answer: 1,
    hints: [
      'As propriedades montam o limite da combinação a partir das partes. Elas dizem algo sobre o caminho de ida.',
      'Tente construir duas funções ruins cuja soma seja mansa. Pense em f(x) = |x|/x quando x → 0.',
      'Se g(x) = −f(x), quanto vale f(x) + g(x)?',
    ],
    solution:
      'FALSO. Contraexemplo: f(x) = |x|/x e g(x) = −|x|/x, com x → 0. ' +
      'Nenhum dos dois tem limite (f dá −1 pela esquerda e +1 pela direita; g dá o oposto). ' +
      'Mas f(x) + g(x) = 0 para todo x ≠ 0, então lim [f + g] = 0 — existe tranquilamente. ' +
      'A lição: as propriedades são de MÃO ÚNICA. Elas exigem que as partes tenham limite para garantir ' +
      'a combinação, e nunca o contrário. Ver a combinação dar certo não autoriza afirmar nada sobre as parcelas.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'cprop-05',
    topicId: 'cal-propriedades-limites',
    kind: 'choice',
    prompt:
      'Por que NÃO se pode calcular lim(x→0) x²·sen(1/x) escrevendo lim x² · lim sen(1/x)?',
    options: [
      'Porque a regra do produto só vale para polinômios',
      'Porque lim(x→0) sen(1/x) não existe, e a regra do produto exige que os dois limites existam',
      'Porque x² tende a zero, e não se pode multiplicar limite por zero',
      'Porque sen(1/x) não está definida em x = 0',
    ],
    answer: 1,
    hints: [
      'Volte à hipótese que todas as cinco propriedades exigem antes de qualquer conta.',
      'Quando x → 0, o valor 1/x cresce sem parar. O que o seno faz com um argumento que explode?',
      'Ele oscila entre −1 e 1 infinitas vezes, sem nunca se decidir.',
    ],
    solution:
      'Porque lim(x→0) sen(1/x) NÃO EXISTE: quando x → 0 o argumento 1/x explode e o seno oscila entre ' +
      '−1 e 1 infinitas vezes, sem tender a valor nenhum. A regra do produto exige que os dois limites ' +
      'existam, então ela está proibida aqui. ' +
      'A alternativa D é uma armadilha: sen(1/x) realmente não está definida em x = 0, mas isso é ' +
      'irrelevante — limite nunca olha para o ponto. O problema é a oscilação em volta, não o buraco. ' +
      'É justamente para esse caso que existe o Teorema do Confronto.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'cprop-06',
    topicId: 'cal-propriedades-limites',
    kind: 'numeric',
    prompt: 'Use o Teorema do Confronto para calcular lim(x→0) x²·cos(1/x).',
    answer: 0,
    hints: [
      'Comece pelo que você sabe sobre cosseno: ele fica sempre entre dois números fixos.',
      'De −1 ≤ cos(1/x) ≤ 1, multiplique os três lados por x². Como x² ≥ 0, os sinais NÃO se invertem.',
      'Você fica com −x² ≤ x²·cos(1/x) ≤ x². Para onde vão as duas pontas quando x → 0?',
    ],
    solution:
      'Passo 1: para qualquer entrada, −1 ≤ cos(1/x) ≤ 1. ' +
      'Passo 2: multiplicando os três lados por x², que é sempre ≥ 0 (por isso as desigualdades NÃO se ' +
      'invertem): −x² ≤ x²·cos(1/x) ≤ x². ' +
      'Passo 3: lim(x→0) (−x²) = 0 e lim(x→0) x² = 0 — as duas fatias do pão vão para a mesma altura. ' +
      'Passo 4: pelo Teorema do Confronto, lim(x→0) x²·cos(1/x) = 0. ' +
      'Escreva os quatro passos na prova: pular direto para o zero não vale nota, porque o teorema só ' +
      'se aplica depois de exibida a desigualdade.',
    xpReward: 40,
    difficulty: 2,
  },
  {
    id: 'cprop-07',
    topicId: 'cal-propriedades-limites',
    kind: 'numeric',
    prompt:
      'Sabe-se que 4x − 9 ≤ f(x) ≤ x² − 4x + 7 para todo x ≥ 0. Determine lim(x→4) f(x).',
    answer: 7,
    hints: [
      'Você não conhece f, mas conhece quem está embaixo e quem está em cima dela. Isso é o cenário do sanduíche.',
      'Calcule o limite das duas funções de fora em x = 4. Ambas são polinômios: substituição direta.',
      'Embaixo: 4(4) − 9. Em cima: (4)² − 4(4) + 7.',
    ],
    solution:
      'Limite de baixo: lim(x→4) (4x − 9) = 16 − 9 = 7. ' +
      'Limite de cima: lim(x→4) (x² − 4x + 7) = 16 − 16 + 7 = 7. ' +
      'As duas pontas apontam para o MESMO valor, 7. Pelo Teorema do Confronto, lim(x→4) f(x) = 7. ' +
      'Detalhe elegante: a desigualdade 4x − 9 ≤ x² − 4x + 7 equivale a 0 ≤ x² − 8x + 16 = (x − 4)², que ' +
      'é sempre verdadeira — as duas curvas se tocam exatamente em x = 4, espremendo f naquele ponto. ' +
      'Note também que a f nunca foi revelada: o teorema devolve o limite sem que você conheça a função.',
    xpReward: 45,
    difficulty: 3,
  },
];

export const epsilonDeltaExercises: Exercise[] = [
  {
    id: 'ceps-01',
    topicId: 'cal-epsilon-delta',
    kind: 'choice',
    prompt:
      'Montando uma tabela de valores de f(x) = sen(π/x) em x = 1; 0,5; 0,1; 0,01, obtém-se sempre f(x) = 0. O que se pode concluir sobre lim(x→0) sen(π/x)?',
    options: [
      'Que o limite vale 0, porque a tabela é consistente',
      'Nada — a tabela testou só pontos escolhidos, e entre eles a função oscila entre −1 e 1',
      'Que o limite vale 0, desde que se acrescentem mais linhas à tabela',
      'Que a função é contínua em x = 0',
    ],
    answer: 1,
    hints: [
      'A tabela olhou 4 pontos. Quantos pontos existem entre 0,01 e 0?',
      'Calcule f(2/3) ou f(2/5). O resultado continua zero?',
      'Uma tabela mostra evidência, nunca demonstração — e este é o exemplo padrão de tabela que mente.',
    ],
    solution:
      'Nada se conclui. Os valores 1; 0,5; 0,1; 0,01 são justamente pontos em que π/x é múltiplo inteiro ' +
      'de π, onde o seno vale exatamente 0. Entre eles a função sobe até 1 e desce até −1 infinitas vezes, ' +
      'e essa oscilação nunca para. O limite NÃO existe. ' +
      'Este é o exemplo que motiva toda a Secção 2.4: se a tabela pode mentir, a definição intuitiva de ' +
      'limite ("f fica perto de L quando x fica perto de a") não serve como fundamento. A palavra "perto" ' +
      'precisa virar número — e é isso que ε e δ fazem.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ceps-02',
    topicId: 'cal-epsilon-delta',
    kind: 'choice',
    prompt: 'Na condição 0 < |x − a| < δ, qual é o papel do "0 <" à esquerda?',
    options: [
      'Garantir que δ seja positivo',
      'Excluir o ponto x = a, já que |x − a| = 0 acontece exatamente quando x = a',
      'Garantir que f(x) seja positiva perto de a',
      'Indicar que x deve se aproximar apenas pela direita',
    ],
    answer: 1,
    hints: [
      'Pergunte: para qual valor de x a expressão |x − a| dá exatamente zero?',
      'Se |x − a| tem que ser MAIOR que zero, qual único ponto fica de fora da vizinhança?',
      'Relacione isso com o fato de o limite não depender do valor da função no ponto.',
    ],
    solution:
      '|x − a| = 0 acontece se e somente se x = a. Exigir 0 < |x − a| é a forma técnica de dizer ' +
      '"x pode chegar tão perto de a quanto quiser, MENOS ser igual a a". ' +
      'É esse símbolo que faz o limite ignorar completamente o valor de f em a — e é por isso que os três ' +
      'gráficos da aula (função contínua, função com buraco, função nem definida no ponto) podem ter todos ' +
      'o mesmo limite L. A definição nunca chega a olhar para x = a. ' +
      'A positividade de δ, aliás, já está declarada separadamente no "existe δ > 0".',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ceps-03',
    topicId: 'cal-epsilon-delta',
    kind: 'choice',
    prompt: 'Na definição formal, qual é a relação de dependência entre ε e δ?',
    options: [
      'ε é escolhido depois de δ, em função dele',
      'δ é escolhido depois de ε, em função dele',
      'Os dois são escolhidos ao mesmo tempo e independentes',
      'Eles são sempre iguais',
    ],
    answer: 1,
    hints: [
      'Leia a ordem dos quantificadores: "para todo ε > 0, existe δ > 0". Quem aparece primeiro?',
      'No jogo do desafiador e do defensor, quem joga primeiro e quem responde?',
      'Você consegue escolher a largura da janela antes de saber que precisão foi exigida?',
    ],
    solution:
      'δ depende de ε. A ordem "para todo ε > 0, EXISTE δ > 0" significa: o adversário joga a exigência ' +
      'primeiro, e só então você monta a resposta. Por isso o δ sai como uma FÓRMULA em ε — δ = ε/2, ' +
      'δ = ε/4, e assim por diante. ' +
      'Trocar a ordem dos quantificadores ("existe δ > 0 tal que para todo ε > 0...") produziria uma ' +
      'afirmação completamente diferente: um único δ que serviria para toda precisão imaginável, o que ' +
      'só acontece com função constante. A ordem dos quantificadores É o conteúdo da definição.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ceps-04',
    topicId: 'cal-epsilon-delta',
    kind: 'choice',
    prompt:
      'Na imagem da caixa de tolerância, o que significa a curva escapar pelo TETO ou pelo CHÃO do retângulo?',
    options: [
      'Que a função não está definida naquele intervalo',
      'Que existe x dentro da janela δ cujo f(x) estourou a margem ε — logo, esse δ não serve',
      'Que o limite não existe, definitivamente',
      'Que o valor de L foi escolhido errado',
    ],
    answer: 1,
    hints: [
      'O teto e o chão do retângulo estão nas alturas L + ε e L − ε. As laterais estão em a − δ e a + δ.',
      'Sair pelo teto significa que f(x) passou de L + ε enquanto x ainda estava dentro da janela.',
      'Isso condena o δ escolhido, ou condena o limite inteiro?',
    ],
    solution:
      'Significa que existe pelo menos um x dentro da janela horizontal (a − δ, a + δ) cujo f(x) ficou fora ' +
      'da faixa (L − ε, L + ε). Ou seja: aquele δ FALHOU e você precisa de um mais estreito. ' +
      'Não é o fim do jogo — só daquela tentativa. O limite só é declarado inexistente se, para algum ε, ' +
      'NENHUM δ funcionar, por menor que seja. ' +
      'Já escapar pelas laterais é o comportamento desejado: quer dizer que a curva atravessou o retângulo ' +
      'inteiro sem nunca estourar a margem de erro vertical.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ceps-05',
    topicId: 'cal-epsilon-delta',
    kind: 'numeric',
    prompt:
      'Para provar lim(x→3) (2x − 1) = 5 com ε = 0,1, qual é o maior δ que funciona? Responda em decimal.',
    answer: 0.05,
    hints: [
      'Comece escrevendo |f(x) − L| e simplifique: |(2x − 1) − 5| = ?',
      '|2x − 6| = 2·|x − 3|. Você precisa que isso seja menor que ε.',
      'De 2·|x − 3| < 0,1, isole o |x − 3|.',
    ],
    solution:
      '|f(x) − 5| = |(2x − 1) − 5| = |2x − 6| = 2·|x − 3|. ' +
      'Queremos 2·|x − 3| < ε, ou seja |x − 3| < ε/2. Com ε = 0,1, isso dá δ = 0,05. ' +
      'A fórmula geral aqui é δ = ε/2 — e não por acaso: para qualquer f(x) = mx + b, o δ sai sempre como ' +
      'ε/|m|, porque o coeficiente angular é exatamente o fator que amplia o erro de entrada em erro de saída. ' +
      'Qualquer δ MENOR que 0,05 também funcionaria: a definição pede que EXISTA um δ, não o maior possível.',
    xpReward: 40,
    difficulty: 2,
  },
  {
    id: 'ceps-06',
    topicId: 'cal-epsilon-delta',
    kind: 'numeric',
    prompt:
      'Para provar lim(x→1) (4x + 3) = 7 com ε = 0,08, qual δ você deve tomar? Responda em decimal.',
    answer: 0.02,
    hints: [
      'Monte |f(x) − L| = |(4x + 3) − 7| e simplifique até aparecer um |x − 1|.',
      '|4x − 4| = 4·|x − 1|. Precisa ser menor que ε.',
      'δ = ε/4, com ε = 0,08.',
    ],
    solution:
      '|f(x) − 7| = |(4x + 3) − 7| = |4x − 4| = 4·|x − 1|. ' +
      'Exigindo 4·|x − 1| < ε, temos |x − 1| < ε/4, logo δ = ε/4 = 0,08/4 = 0,02. ' +
      'Confirmando a regra do 1º grau: o coeficiente angular é m = 4, e δ = ε/|m| = ε/4. ' +
      'A prova escrita ficaria: "Seja ε > 0 dado. Tome δ = ε/4. Se 0 < |x − 1| < δ, então ' +
      '|f(x) − 7| = 4·|x − 1| < 4δ = ε. Portanto lim(x→1) (4x + 3) = 7."',
    xpReward: 40,
    difficulty: 2,
  },
  {
    id: 'ceps-07',
    topicId: 'cal-epsilon-delta',
    kind: 'choice',
    prompt:
      'Numa prova ε-δ, por que não basta entregar a conta "|f(x) − L| < ε  ⟹  |x − a| < ε/2"?',
    options: [
      'Porque falta simplificar a fração ε/2',
      'Porque essa conta é o rascunho: ela corre ao contrário da definição, que parte do δ para chegar no ε',
      'Porque ε/2 não é um valor válido de δ',
      'Porque é preciso testar todos os valores de ε antes',
    ],
    answer: 1,
    hints: [
      'Repare na direção da seta na conta. Ela parte da conclusão desejada e chega na condição.',
      'A definição afirma o contrário: SE 0 < |x − a| < δ, ENTÃO |f(x) − L| < ε.',
      'O rascunho descobre o δ. A prova precisa mostrar que aquele δ realmente entrega o resultado.',
    ],
    solution:
      'Porque essa conta é o RASCUNHO — ela corre de trás para frente. Ela serve para DESCOBRIR que δ = ε/2, ' +
      'mas a definição afirma a implicação no sentido oposto: se 0 < |x − a| < δ, ENTÃO |f(x) − L| < ε. ' +
      'A prova entregue precisa ter a estrutura fixa: (1) Seja ε > 0 dado. (2) Tome δ = ε/2. ' +
      '(3) Suponha 0 < |x − a| < δ. (4) Então |f(x) − L| = 2·|x − a| < 2δ = ε. (5) Portanto o limite vale L. ' +
      'Rascunho e prova usam as mesmas contas em ordem invertida — e só a segunda demonstra alguma coisa. ' +
      'Essa distinção é o que separa "entendi o conceito" de "demonstrei o resultado", e é exatamente o ' +
      'que os exercícios da seção 2.4 do Stewart cobram.',
    xpReward: 45,
    difficulty: 3,
  },
];
