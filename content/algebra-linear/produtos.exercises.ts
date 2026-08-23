import { Exercise } from '@/types/exercise';

export const produtoVetorialExercises: Exercise[] = [
  {
    id: 'pvet-01',
    topicId: 'al-produto-vetorial',
    kind: 'numeric',
    prompt:
      'Sejam a = (2, 1, 0) e b = (1, 3, 0). Qual é a terceira componente (a componente k) de a × b?',
    answer: 5,
    hints: [
      'A componente k é a₁b₂ − a₂b₁.',
      '(2)(3) − (1)(1) = 6 − 1.',
    ],
    solution:
      'A componente k de a × b é a₁b₂ − a₂b₁ = (2)(3) − (1)(1) = 6 − 1 = 5. ' +
      'O vetor completo é a × b = (0, 0, 5). ' +
      'Como os dois vetores estão no plano xy (terceira componente zero), o produto vetorial aponta ' +
      'inteiramente na direção z — perpendicular ao plano que eles geram, como esperado.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pvet-02',
    topicId: 'al-produto-vetorial',
    kind: 'numeric',
    prompt:
      'Os pontos A(0,0,0), B(2,1,0) e C(1,3,0) formam um triângulo. Qual é a sua área? Responda em decimal.',
    answer: 2.5,
    hints: [
      'Monte os vetores AB = B − A e AC = C − A.',
      'AB = (2,1,0) e AC = (1,3,0). Calcule AB × AC — dá (0, 0, 5).',
      'A norma de (0,0,5) é 5, que é a área do PARALELOGRAMO. O triângulo é metade disso.',
    ],
    solution:
      'AB = (2, 1, 0) e AC = (1, 3, 0). AB × AC = (0, 0, 5), cuja norma é 5. ' +
      'Essa norma é a área do PARALELOGRAMO formado pelos dois vetores. O triângulo é metade: ' +
      'área = 5/2 = 2,5. ' +
      'O erro mais comum é esquecer de dividir por 2 e responder 5. Leia sempre se a questão pede ' +
      'paralelogramo ou triângulo.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pvet-03',
    topicId: 'al-produto-vetorial',
    kind: 'choice',
    prompt: 'Qual afirmação sobre o produto vetorial a × b está CORRETA?',
    options: [
      'a × b = b × a, assim como no produto escalar',
      'a × b é perpendicular a a e a b, e a × b = −(b × a)',
      'a × b é um número real',
      'a × b existe em qualquer Rⁿ',
    ],
    answer: 1,
    hints: [
      'Calcule (a × b) · a com qualquer exemplo — sempre dá zero.',
      'E teste trocar a ordem: todas as componentes invertem de sinal.',
    ],
    solution:
      'O produto vetorial é perpendicular aos dois vetores (por isso (a×b)·a = 0 e (a×b)·b = 0) e é ' +
      'ANTICOMUTATIVO: a × b = −(b × a). ' +
      'As outras alternativas estão erradas: ele NÃO é comutativo (essa é a diferença mais cobrada em ' +
      'relação ao produto escalar, que é); o resultado é um VETOR, não um número; e ele só existe em R³ ' +
      '— não há produto vetorial em R² nem em R⁴. ' +
      'É justamente a perpendicularidade que faz dele a ferramenta para achar o vetor normal de um plano.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'pvet-04',
    topicId: 'al-produto-vetorial',
    kind: 'numeric',
    prompt:
      'Calcule o produto misto a · (b × c) para a = (2, 1, 0), b = (1, 3, 0) e c = (0, 0, 4).',
    answer: 20,
    hints: [
      'Comece por b × c = (1,3,0) × (0,0,4).',
      'b × c = (3·4 − 0·0, 0·0 − 1·4, 1·0 − 3·0) = (12, −4, 0).',
      'Agora a · (12, −4, 0) = (2)(12) + (1)(−4) + (0)(0).',
    ],
    solution:
      'b × c = (3·4 − 0·0, 0·0 − 1·4, 1·0 − 3·0) = (12, −4, 0). ' +
      'a · (b × c) = (2)(12) + (1)(−4) + (0)(0) = 24 − 4 = 20. ' +
      'Como o produto misto é diferente de zero, os três vetores NÃO são coplanares — eles geram um ' +
      'paralelepípedo de volume |20| = 20, e são linearmente independentes em R³. ' +
      'Atalho: o produto misto é simplesmente o determinante 3×3 cujas linhas são a, b e c.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'pvet-05',
    topicId: 'al-produto-vetorial',
    kind: 'choice',
    prompt: 'O produto misto de três vetores deu ZERO. O que isso significa?',
    options: [
      'Os três vetores são perpendiculares entre si',
      'Os três vetores são coplanares (e linearmente dependentes)',
      'Pelo menos um dos vetores é nulo',
      'Os três vetores são unitários',
    ],
    answer: 1,
    hints: [
      'O módulo do produto misto é o volume do paralelepípedo gerado pelos três vetores.',
      'Se o volume é zero, o "sólido" é achatado — os três cabem num mesmo plano.',
    ],
    solution:
      'Produto misto zero significa que os três vetores são COPLANARES: cabem todos num mesmo plano, ' +
      'então o paralelepípedo é achatado e tem volume nulo. Este é o teste padrão de coplanaridade. ' +
      'Como o produto misto é um determinante 3×3, isso equivale a dizer que os três vetores são ' +
      'LINEARMENTE DEPENDENTES — é a mesma informação em duas linguagens, e a ponte com o bloco final ' +
      'da disciplina. ' +
      'Um vetor nulo entre eles de fato zeraria o misto, mas é só um caso particular, não a conclusão ' +
      'geral. E perpendicularidade mútua daria volume MÁXIMO, não zero.',
    xpReward: 40,
    difficulty: 3,
  },
];

export const produtoInternoRnExercises: Exercise[] = [
  {
    id: 'pirn-01',
    topicId: 'al-produto-interno-rn',
    kind: 'numeric',
    prompt: 'Em R⁴, calcule ⟨u, v⟩ para u = (1, 2, 3, 4) e v = (2, 0, 1, −1).',
    answer: 1,
    hints: [
      'A definição não muda em Rⁿ: multiplique componente a componente e some tudo.',
      '(1)(2) + (2)(0) + (3)(1) + (4)(−1) = 2 + 0 + 3 − 4.',
    ],
    solution:
      '⟨u, v⟩ = (1)(2) + (2)(0) + (3)(1) + (4)(−1) = 2 + 0 + 3 − 4 = 1. ' +
      'Em Rⁿ a conta é exatamente a mesma de R² e R³ — só fica mais longa. ' +
      'Como o resultado é positivo (embora pequeno), o ângulo entre u e v é agudo. Se tivesse dado zero, ' +
      'eles seriam ortogonais.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pirn-02',
    topicId: 'al-produto-interno-rn',
    kind: 'numeric',
    prompt: 'Qual é a norma do vetor u = (1, 1, 1, 1) em R⁴?',
    answer: 2,
    hints: [
      '‖u‖ = √⟨u, u⟩ — some os quadrados de todas as componentes e tire a raiz.',
      '1² + 1² + 1² + 1² = 4. Agora a raiz de 4.',
    ],
    solution:
      '‖u‖ = √(1² + 1² + 1² + 1²) = √4 = 2. ' +
      'É Pitágoras estendido: em R⁴ você simplesmente soma quatro quadrados em vez de dois. ' +
      'Note que este vetor NÃO é unitário. Para normalizá-lo, divida pela própria norma: ' +
      'û = (1/2, 1/2, 1/2, 1/2), que tem norma 1 ✓.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pirn-03',
    topicId: 'al-produto-interno-rn',
    kind: 'choice',
    prompt:
      'Os vetores (1, 1, 0), (1, −1, 0) e (0, 0, 3) formam um conjunto ortogonal. Eles são ortonormais?',
    options: [
      'Sim, ortogonal e ortonormal são sinônimos',
      'Não: as normas valem √2, √2 e 3 — nenhuma é 1',
      'Não, porque eles não são linearmente independentes',
      'Sim, porque os produtos escalares cruzados dão zero',
    ],
    answer: 1,
    hints: [
      'Ortonormal exige DUAS coisas: ortogonal E todos os vetores unitários.',
      'Calcule a norma do primeiro: √(1² + 1² + 0²) = √2 ≈ 1,41. Isso é 1?',
    ],
    solution:
      'São ortogonais (todos os produtos escalares cruzados dão zero), mas NÃO são ortonormais: as normas ' +
      'valem √2, √2 e 3 — nenhuma é igual a 1. ' +
      'Ortonormal = ortogonal + todos unitários. Para converter, basta NORMALIZAR cada um dividindo pela ' +
      'própria norma: (1/√2, 1/√2, 0), (1/√2, −1/√2, 0) e (0, 0, 1). ' +
      'Eles são, sim, linearmente independentes — todo conjunto ortogonal de vetores não nulos é ' +
      'automaticamente LI, e esse é um teorema que resolve questão sem escalonar nada.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pirn-04',
    topicId: 'al-produto-interno-rn',
    kind: 'numeric',
    prompt:
      'Numa base ORTOGONAL, a coordenada de u na direção de v é ⟨u,v⟩/⟨v,v⟩. Calcule essa coordenada para u = (4, 2, 0) e v = (1, 1, 0).',
    answer: 3,
    hints: [
      'Calcule primeiro ⟨u, v⟩ = (4)(1) + (2)(1) + (0)(0).',
      '⟨u, v⟩ = 6. Agora ⟨v, v⟩ = 1² + 1² + 0² = 2.',
      '6 dividido por 2.',
    ],
    solution:
      '⟨u, v⟩ = (4)(1) + (2)(1) + 0 = 6, e ⟨v, v⟩ = 1 + 1 + 0 = 2. ' +
      'Coordenada = 6/2 = 3. ' +
      'Repare que essa é exatamente a fórmula da PROJEÇÃO ORTOGONAL que você já viu — cada coordenada ' +
      'numa base ortogonal é a projeção de u naquela direção. ' +
      'Se a base fosse ORTONORMAL, o denominador ⟨v,v⟩ valeria 1 e sumiria: a coordenada seria só ' +
      '⟨u, v⟩. É por isso que bases ortonormais dispensam resolver sistema para achar coordenadas.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pirn-05',
    topicId: 'al-produto-interno-rn',
    kind: 'choice',
    prompt:
      'Você precisa mostrar que quatro vetores não nulos e mutuamente ortogonais formam uma base de R⁴. Qual o caminho mais curto?',
    options: [
      'Montar a matriz e escalonar para verificar independência',
      'Usar que todo conjunto ortogonal de vetores não nulos é LI — e como são 4 em R⁴, já é base',
      'Calcular o determinante da matriz formada por eles',
      'Verificar se cada vetor tem norma 1',
    ],
    answer: 1,
    hints: [
      'Existe um teorema que liga ortogonalidade a independência linear diretamente.',
      'E lembre do atalho de base: em Rⁿ, n vetores LI já formam base — não precisa testar se geram.',
    ],
    solution:
      'Todo conjunto ortogonal de vetores NÃO NULOS é automaticamente linearmente independente. Como são ' +
      '4 vetores LI em R⁴, e a dimensão de R⁴ é 4, eles formam base — sem escalonar e sem calcular ' +
      'determinante. ' +
      'Escalonar e calcular determinante também funcionariam, mas dão muito mais trabalho. ' +
      'Verificar norma 1 é irrelevante aqui: isso decidiria se a base é ORTONORMAL, não se é base. ' +
      'Uma base ortogonal já é base mesmo sem ser unitária.',
    xpReward: 45,
    difficulty: 3,
  },
];
