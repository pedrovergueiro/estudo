import { Exercise } from '@/types/exercise';

export const retasPlanosExercises: Exercise[] = [
  {
    id: 'ret-01',
    topicId: 'al-retas-planos',
    kind: 'text',
    prompt:
      'A reta tem equação (x, y) = (1, 2) + t·(3, −1). Qual é o ponto da reta quando t = 2? ' +
      'Responda no formato "x,y".',
    answer: '7,0',
    accept: ['7,0', '(7,0)', '7, 0', '(7, 0)', '7 0'],
    hints: [
      'Substitua t = 2 na equação: (1, 2) + 2·(3, −1).',
      'Primeiro calcule 2·(3, −1) = (6, −2). Depois some com (1, 2).',
    ],
    solution:
      '2·(3, −1) = (6, −2). Somando com o ponto: (1 + 6, 2 + (−2)) = (7, 0). ' +
      'O parâmetro t funciona como "quantos passos dar na direção do vetor". Com t = 2, você dá ' +
      'dois passos completos a partir do ponto inicial. Com t negativo, andaria para o lado oposto.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'ret-02',
    topicId: 'al-retas-planos',
    kind: 'text',
    prompt:
      'Qual é o vetor normal do plano de equação 2x − 3y + 5z = 7? Responda no formato "a,b,c".',
    answer: '2,-3,5',
    accept: ['2,-3,5', '(2,-3,5)', '2, -3, 5', '(2, -3, 5)', '2 -3 5'],
    hints: [
      'Numa equação ax + by + cz = d, o vetor normal é formado pelos coeficientes.',
      'Os coeficientes de x, y e z são 2, −3 e 5. Cuidado com o sinal do segundo.',
    ],
    solution:
      'O vetor normal é n = (2, −3, 5) — exatamente os coeficientes de x, y e z. ' +
      'O termo independente (7) não entra: ele só desloca o plano, sem mudar sua inclinação. ' +
      'Dois planos com os mesmos coeficientes e valores diferentes de d são paralelos entre si. ' +
      'Ler a normal direto da equação resolve várias questões sem precisar calcular nada.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'ret-03',
    topicId: 'al-retas-planos',
    kind: 'choice',
    prompt: 'Duas retas têm vetores direção v₁ = (2, 4) e v₂ = (1, 2). Como elas se relacionam?',
    options: [
      'São perpendiculares',
      'São paralelas, pois v₁ = 2·v₂',
      'São reversas',
      'Não é possível determinar',
    ],
    answer: 1,
    hints: [
      'Verifique se um vetor é múltiplo do outro: existe k tal que v₁ = k·v₂?',
      '2·(1, 2) = (2, 4), que é exatamente v₁.',
    ],
    solution:
      'São paralelas: v₁ = 2·v₂, ou seja, um vetor direção é múltiplo do outro, então as duas retas ' +
      'apontam para a mesma direção. ' +
      'Não são perpendiculares — o produto escalar daria (2)(1) + (4)(2) = 10 ≠ 0. ' +
      'Nota: paralelas podem ser coincidentes (a mesma reta) ou distintas; para distinguir, é ' +
      'preciso testar se um ponto de uma pertence à outra.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const espacosExercises: Exercise[] = [
  {
    id: 'esp-01',
    topicId: 'al-espacos-vetoriais',
    kind: 'choice',
    prompt: 'Qual destes conjuntos NÃO é um subespaço de R²?',
    options: [
      'Os vetores (x, y) com y = 2x',
      'Os vetores (x, y) com x + y = 5',
      'Os vetores (x, y) com x = 0',
      'O conjunto contendo apenas o vetor (0, 0)',
    ],
    answer: 1,
    hints: [
      'Aplique primeiro o teste mais rápido: o vetor nulo (0,0) pertence ao conjunto?',
      'Em x + y = 5, substitua (0,0): 0 + 0 = 0, que é diferente de 5.',
    ],
    solution:
      'O conjunto x + y = 5 não é subespaço, porque não contém o vetor nulo: (0,0) daria 0 + 0 = 0 ≠ 5. ' +
      'Geometricamente, é uma reta que NÃO passa pela origem. ' +
      'Os outros passam: y = 2x é reta pela origem ✓; x = 0 é o eixo y, que passa pela origem ✓; ' +
      'e o conjunto só com o vetor nulo é o subespaço trivial ✓. ' +
      'Sempre comece pelo teste do zero — ele elimina a maioria dos candidatos instantaneamente.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'esp-02',
    topicId: 'al-espacos-vetoriais',
    kind: 'choice',
    prompt: 'Quais são as três condições para um conjunto ser subespaço vetorial?',
    options: [
      'Ser finito, ordenado e não-vazio',
      'Conter o vetor nulo, ser fechado para soma e fechado para multiplicação por escalar',
      'Ter dimensão menor que o espaço original apenas',
      'Conter apenas vetores unitários',
    ],
    answer: 1,
    hints: [
      'As condições envolvem o vetor nulo e as duas operações básicas de espaço vetorial.',
      '"Fechado" significa: fez a operação com elementos de dentro, o resultado continua dentro.',
    ],
    solution:
      'As três condições: (1) conter o vetor nulo; (2) ser fechado para soma — somou dois elementos ' +
      'do conjunto, o resultado continua nele; (3) ser fechado para multiplicação por escalar. ' +
      'A ordem prática de testar é essa mesma: o teste do vetor nulo é instantâneo e já descarta a ' +
      'maioria dos conjuntos que não são subespaço.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const combinacaoExercises: Exercise[] = [
  {
    id: 'cmb-01',
    topicId: 'al-combinacao-linear',
    kind: 'choice',
    prompt: 'Os vetores (2, 3) e (4, 6) são linearmente independentes?',
    options: [
      'Sim, porque têm componentes diferentes',
      'Não, porque o segundo é 2× o primeiro',
      'Sim, porque nenhum é o vetor nulo',
      'Não é possível determinar sem escalonar',
    ],
    answer: 1,
    hints: [
      'Para dois vetores, o teste é direto: um é múltiplo do outro?',
      '2·(2, 3) = (4, 6), que é exatamente o segundo vetor.',
    ],
    solution:
      'São linearmente DEPENDENTES, porque (4, 6) = 2·(2, 3). O segundo vetor não traz direção nova — ' +
      'está na mesma reta do primeiro. ' +
      'O span dos dois é apenas uma reta, não o plano R². ' +
      'Para dois vetores, esse teste visual basta: se um é múltiplo do outro, são dependentes. ' +
      'A partir de 3 vetores, é preciso escalonar.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cmb-02',
    topicId: 'al-combinacao-linear',
    kind: 'choice',
    prompt: 'O que é o span (espaço gerado) de um único vetor não-nulo em R²?',
    options: [
      'O plano R² inteiro',
      'Uma reta passando pela origem, na direção desse vetor',
      'Apenas o próprio vetor',
      'O conjunto vazio',
    ],
    answer: 1,
    hints: [
      'O span são todos os resultados de k·v, para qualquer escalar k.',
      'Variando k de −∞ a +∞, o vetor estica, encolhe e inverte — mas nunca sai da reta em que está.',
    ],
    solution:
      'O span de um único vetor não-nulo é uma RETA passando pela origem, na direção dele. ' +
      'Isso porque as combinações lineares possíveis são todas do tipo k·v: variando k você percorre ' +
      'a reta inteira, mas nunca escapa dela. ' +
      'Para gerar o plano R² todo, você precisaria de dois vetores linearmente independentes.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'cmb-03',
    topicId: 'al-combinacao-linear',
    kind: 'text',
    prompt:
      'Escreva o vetor (7, 5) como combinação linear de u = (1, 0) e w = (0, 1). ' +
      'Quais são os escalares? Responda no formato "a,b".',
    answer: '7,5',
    accept: ['7,5', '(7,5)', '7, 5', '(7, 5)', '7 5'],
    hints: [
      'Monte a equação: a·(1, 0) + b·(0, 1) = (7, 5).',
      'A primeira componente dá a = 7; a segunda dá b = 5.',
    ],
    solution:
      'a·(1,0) + b·(0,1) = (a, b) = (7, 5), então a = 7 e b = 5. ' +
      'Como u e w são a base canônica, os escalares coincidem com as próprias componentes do vetor — ' +
      'é exatamente por isso que a base canônica é tão conveniente. ' +
      'Numa base diferente, os escalares seriam outros, e você precisaria resolver um sistema.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const baseExercises: Exercise[] = [
  {
    id: 'bas-01',
    topicId: 'al-base-dimensao',
    kind: 'numeric',
    prompt: 'Qual é a dimensão do espaço vetorial R⁵?',
    answer: 5,
    hints: [
      'A dimensão é o número de vetores de qualquer base do espaço.',
      'A base canônica de Rⁿ tem exatamente n vetores.',
    ],
    solution:
      'dim(R⁵) = 5. A base canônica de R⁵ tem 5 vetores: (1,0,0,0,0), (0,1,0,0,0), e assim por diante. ' +
      'De forma geral, dim(Rⁿ) = n. ' +
      'A leitura prática: você precisa de 5 números independentes para localizar um ponto em R⁵.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'bas-02',
    topicId: 'al-base-dimensao',
    kind: 'choice',
    prompt: 'Um conjunto com 4 vetores em R³ pode ser uma base de R³?',
    options: [
      'Sim, se todos forem não-nulos',
      'Não, porque em R³ qualquer conjunto com mais de 3 vetores é linearmente dependente',
      'Sim, sempre',
      'Depende dos valores dos vetores',
    ],
    answer: 1,
    hints: [
      'dim(R³) = 3, então toda base de R³ tem exatamente 3 vetores.',
      'Com mais vetores do que a dimensão, algum obrigatoriamente será combinação dos outros.',
    ],
    solution:
      'Não pode. Em R³ a dimensão é 3, então qualquer conjunto com MAIS de 3 vetores é ' +
      'obrigatoriamente linearmente dependente — pelo menos um será combinação dos demais, ' +
      'violando a segunda condição de base. ' +
      'A regra de contagem: menos de n vetores nunca geram o espaço; mais de n são sempre ' +
      'dependentes; exatamente n é o único caso que pode dar base (e aí basta testar independência).',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'bas-03',
    topicId: 'al-base-dimensao',
    kind: 'choice',
    prompt: 'Quais são as DUAS condições para um conjunto de vetores ser uma base?',
    options: [
      'Ser ortogonal e unitário',
      'Gerar o espaço e ser linearmente independente',
      'Ter dimensão par e conter o vetor nulo',
      'Ter todos os vetores de mesmo comprimento',
    ],
    answer: 1,
    hints: [
      'Uma condição garante que nada fica de fora; a outra garante que nada sobra.',
      'Pense em "ingredientes suficientes" e "ingredientes sem repetição".',
    ],
    solution:
      'Uma base precisa: (1) GERAR o espaço — combinando seus vetores você alcança qualquer elemento; ' +
      'e (2) ser LINEARMENTE INDEPENDENTE — nenhum vetor é redundante. ' +
      'É o conjunto mínimo que ainda dá conta de tudo. ' +
      'Ser ortogonal ou unitário são propriedades desejáveis (base ortonormal facilita contas), mas ' +
      'não são exigidas para ser base.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const coordenadasExercises: Exercise[] = [
  {
    id: 'crd-01',
    topicId: 'al-coordenadas',
    kind: 'text',
    prompt:
      'Na base B = {(2, 0), (0, 3)}, quais são as coordenadas do vetor v = (6, 9)? ' +
      'Responda no formato "c1,c2".',
    answer: '3,3',
    accept: ['3,3', '(3,3)', '3, 3', '(3, 3)', '3 3'],
    hints: [
      'Monte a equação: c₁·(2, 0) + c₂·(0, 3) = (6, 9).',
      'A primeira componente dá 2c₁ = 6. A segunda dá 3c₂ = 9.',
      'Resolva as duas equações separadamente.',
    ],
    solution:
      'c₁·(2,0) + c₂·(0,3) = (2c₁, 3c₂) = (6, 9). Da primeira componente: 2c₁ = 6 → c₁ = 3. ' +
      'Da segunda: 3c₂ = 9 → c₂ = 3. Logo [v]_B = (3, 3). ' +
      'Repare que o MESMO vetor tem coordenadas (6, 9) na base canônica e (3, 3) nesta base. ' +
      'O vetor não mudou — mudou a régua usada para medi-lo.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'crd-02',
    topicId: 'al-coordenadas',
    kind: 'choice',
    prompt: 'Por que o mesmo vetor tem coordenadas diferentes em bases diferentes?',
    options: [
      'Porque o vetor muda de posição quando trocamos a base',
      'Porque as coordenadas dizem quanto de cada vetor da base é preciso, e a base mudou',
      'Porque bases diferentes têm dimensões diferentes',
      'Isso não acontece: as coordenadas são sempre as mesmas',
    ],
    answer: 1,
    hints: [
      'Volte ao interativo da aula: a seta vermelha se moveu quando você trocou de base?',
      'Coordenadas são a receita "quanto de cada ingrediente da base". Trocar de ingredientes muda a receita.',
    ],
    solution:
      'As coordenadas indicam quanto de cada vetor da base é necessário para montar o vetor. Trocando ' +
      'a base, muda a "receita", e portanto mudam os números — mas o vetor em si continua exatamente ' +
      'o mesmo objeto no espaço. ' +
      'A analogia: medir a mesma distância em metros ou em pés dá números diferentes sem que a ' +
      'distância mude. Base é a unidade de medida do espaço vetorial.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'crd-03',
    topicId: 'al-coordenadas',
    kind: 'choice',
    prompt:
      'A matriz P tem os vetores da base B como colunas. Como se converte um vetor da base canônica para as coordenadas na base B?',
    options: [
      'Multiplicando por P',
      'Multiplicando por P⁻¹ (a inversa de P)',
      'Somando P',
      'Multiplicando pela transposta de P',
    ],
    answer: 1,
    hints: [
      'P leva coordenadas da base B PARA a canônica: v = P·[v]_B.',
      'Para fazer o caminho inverso, você precisa desfazer a multiplicação por P.',
    ],
    solution:
      'Multiplicando por P⁻¹. A relação é v = P·[v]_B (de B para canônica); isolando as coordenadas ' +
      'em B, obtém-se [v]_B = P⁻¹·v. ' +
      'É aqui que a matriz inversa do tópico 4 reaparece: ela é a ferramenta que desfaz a mudança de ' +
      'base. Errar a direção da conversão (usar P onde deveria ser P⁻¹) é o deslize mais comum ' +
      'deste tópico.',
    xpReward: 40,
    difficulty: 3,
  },
];
