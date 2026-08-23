import { Exercise } from '@/types/exercise';

export const escalonadaExercises: Exercise[] = [
  {
    id: 'esc-01',
    topicId: 'al-escalonada',
    kind: 'numeric',
    prompt:
      'Um sistema com 5 incógnitas foi escalonado e apresentou 3 pivôs, sem linha inconsistente. Quantas variáveis livres ele tem?',
    answer: 2,
    hints: [
      'A fórmula é: variáveis livres = nº de incógnitas − nº de pivôs.',
      '5 − 3.',
    ],
    solution:
      'Variáveis livres = 5 − 3 = 2. ' +
      'Como sobram variáveis livres e não há linha inconsistente, o sistema é SPI (infinitas soluções). ' +
      'A resposta completa exige parametrizar: chame as duas livres de t e s e escreva as outras três ' +
      'em função delas. Só dizer "infinitas soluções" costuma valer metade da questão.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'esc-02',
    topicId: 'al-escalonada',
    kind: 'choice',
    prompt:
      'Qual condição a forma ESCALONADA REDUZIDA exige e a forma escalonada comum NÃO exige?',
    options: [
      'Que as linhas nulas fiquem por último',
      'Que cada coluna com pivô tenha zeros em TODO o resto da coluna, e que os pivôs sejam 1',
      'Que os pivôs estejam à direita do pivô da linha de cima',
      'Que a matriz seja quadrada',
    ],
    answer: 1,
    hints: [
      'A escalonada comum (Gauss) zera só ABAIXO do pivô. O que a reduzida faz a mais?',
      'Gauss-Jordan zera acima e abaixo, e normaliza o pivô para 1.',
    ],
    solution:
      'A escalonada reduzida exige zeros ACIMA e abaixo de cada pivô, e pivôs iguais a 1. A escalonada ' +
      'comum zera só abaixo. ' +
      'As outras três alternativas: linhas nulas por último e pivôs escalonados para a direita valem ' +
      'para as DUAS formas; e nenhuma delas exige matriz quadrada. ' +
      'Detalhe importante: a forma escalonada comum NÃO é única (depende do caminho), mas a reduzida É — ' +
      'toda matriz tem exatamente uma RREF, e por isso ela serve para testar se duas matrizes são ' +
      'equivalentes por linhas.',
    xpReward: 35,
    difficulty: 2,
  },
  {
    id: 'esc-03',
    topicId: 'al-escalonada',
    kind: 'choice',
    prompt:
      'Um sistema homogêneo tem 4 incógnitas e apenas 3 equações. O que se pode afirmar?',
    options: [
      'Pode ser impossível',
      'Certamente tem solução não trivial (infinitas soluções)',
      'Tem apenas a solução trivial',
      'Não é possível concluir nada',
    ],
    answer: 1,
    hints: [
      'Sistema homogêneo é sempre possível: X = 0 sempre serve. Então "impossível" está descartado.',
      'O número de pivôs não pode passar do número de LINHAS. Com 3 linhas e 4 incógnitas, sobra variável livre?',
    ],
    solution:
      'Certamente tem solução não trivial. O raciocínio: o número de pivôs nunca passa do número de ' +
      'linhas, então há no máximo 3 pivôs para 4 incógnitas — sobra pelo menos 1 variável livre, e ' +
      'portanto infinitas soluções. ' +
      'Nenhum sistema homogêneo pode ser impossível, porque X = (0,0,0,0) sempre satisfaz AX = 0. ' +
      'Esse atalho ("mais incógnitas que equações ⟹ solução não trivial") resolve questão inteira sem ' +
      'escalonar nada, e reaparece como o teste de dependência linear.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'esc-04',
    topicId: 'al-escalonada',
    kind: 'choice',
    prompt:
      'Qual operação elementar NÃO é permitida ao escalonar um sistema?',
    options: [
      'Trocar duas linhas de lugar',
      'Multiplicar uma linha por 0',
      'Somar a uma linha um múltiplo de outra',
      'Multiplicar uma linha por −3',
    ],
    answer: 1,
    hints: [
      'As três operações elementares preservam o conjunto solução. Qual delas destruiria informação?',
      'Multiplicar por zero transforma a linha inteira em 0 = 0 — a equação sumiu.',
    ],
    solution:
      'Multiplicar por 0 é proibido: a operação permitida é multiplicar por escalar k ≠ 0. Com k = 0 a ' +
      'linha vira 0 = 0, você perde uma equação e o conjunto solução muda — deixa de ser um sistema ' +
      'equivalente. ' +
      'Multiplicar por −3 é perfeitamente válido (é não nulo). As três operações elementares legítimas ' +
      'são: trocar linhas, multiplicar por escalar não nulo, e somar múltiplo de outra linha. São elas ' +
      'que definem MATRIZES EQUIVALENTES POR LINHAS.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'esc-05',
    topicId: 'al-escalonada',
    kind: 'choice',
    prompt:
      'O escalonamento de um sistema em x, y, z resultou em [1 0 −2 | 3], [0 1 1 | 4], [0 0 0 | 0]. Qual é o conjunto solução?',
    options: [
      'Não tem solução',
      '(x, y, z) = (3 + 2t, 4 − t, t), com t ∈ ℝ',
      '(x, y, z) = (3, 4, 0), solução única',
      '(x, y, z) = (3 − 2t, 4 + t, t), com t ∈ ℝ',
    ],
    answer: 1,
    hints: [
      'Há 2 pivôs (em x e y) e 3 incógnitas: z é livre. Faça z = t.',
      'Da 2ª linha: y + t = 4 → y = 4 − t. Da 1ª: x − 2t = 3 → isole o x.',
      'Cuidado com o sinal: x − 2t = 3 dá x = 3 + 2t.',
    ],
    solution:
      'A última linha é 0 = 0, então não há inconsistência. Pivôs em x e y; z é livre, faça z = t. ' +
      'Da 2ª linha: y + t = 4 → y = 4 − t. Da 1ª linha: x − 2t = 3 → x = 3 + 2t. ' +
      'Conjunto solução: (3 + 2t, 4 − t, t), t ∈ ℝ. ' +
      'A alternativa com (3 − 2t, 4 + t, t) é o erro de sinal ao passar o termo para o outro lado — ' +
      'confira sempre substituindo um valor de t nas equações originais.',
    xpReward: 45,
    difficulty: 3,
  },
];

export const determinantesExercises: Exercise[] = [
  {
    id: 'det-01',
    topicId: 'al-determinantes',
    kind: 'numeric',
    prompt: 'Calcule o determinante da matriz 2×2 com linhas (3, 1) e (2, 4).',
    answer: 10,
    hints: ['Para 2×2: det = ad − bc.', '(3)(4) − (1)(2) = 12 − 2.'],
    solution:
      'det = (3)(4) − (1)(2) = 12 − 2 = 10. ' +
      'É diagonal principal MENOS diagonal secundária, nessa ordem. ' +
      'Como det ≠ 0, a matriz é invertível e o sistema associado tem solução única.',
    xpReward: 20,
    difficulty: 1,
  },
  {
    id: 'det-02',
    topicId: 'al-determinantes',
    kind: 'numeric',
    prompt: 'Calcule o determinante da matriz 2×2 com linhas (2, 6) e (1, 3).',
    answer: 0,
    hints: [
      'Aplique ad − bc: (2)(3) − (6)(1).',
      'Repare também que a primeira linha é exatamente o dobro da segunda.',
    ],
    solution:
      'det = (2)(3) − (6)(1) = 6 − 6 = 0. ' +
      'Dava para prever sem conta: a linha (2, 6) é o dobro de (1, 3) — linhas PROPORCIONAIS sempre dão ' +
      'determinante zero. ' +
      'Consequência: a matriz é SINGULAR (não tem inversa), e o sistema AX = B associado não tem solução ' +
      'única — ou é impossível, ou tem infinitas soluções.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'det-03',
    topicId: 'al-determinantes',
    kind: 'choice',
    prompt: 'Qual é o sinal do cofator na posição (1, 2), ou seja, linha 1 e coluna 2?',
    options: [
      'Positivo, porque 1 e 2 são positivos',
      'Negativo, porque (−1)^(1+2) = (−1)³ = −1',
      'Depende do valor do elemento',
      'Sempre positivo na primeira linha',
    ],
    answer: 1,
    hints: [
      'O cofator é A(i,j) = (−1)^(i+j) · D(i,j). Some os índices.',
      '1 + 2 = 3, que é ímpar. E (−1) elevado a ímpar dá −1.',
    ],
    solution:
      'O sinal é NEGATIVO: (−1)^(1+2) = (−1)³ = −1. ' +
      'O tabuleiro de sinais alterna começando com + no canto superior esquerdo: ' +
      '+ − + / − + − / + − +. A posição (1,2) é a segunda da primeira linha, portanto negativa. ' +
      'É esse mesmo sinal que produz o "menos" na componente j do produto vetorial — não é regra ' +
      'separada, é o cofator funcionando.',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'det-04',
    topicId: 'al-determinantes',
    kind: 'numeric',
    prompt:
      'Calcule o determinante da matriz 3×3 com linhas (1, 2, 0), (3, −1, 0) e (4, 5, 6). Dica: escolha bem a fila da expansão.',
    answer: -42,
    hints: [
      'Procure a linha ou coluna com mais zeros. A terceira COLUNA é (0, 0, 6).',
      'Expandindo pela 3ª coluna, só o termo a(3,3) = 6 sobrevive. O sinal em (3,3) é (−1)^6 = +.',
      'det = 6 × det[(1, 2), (3, −1)] = 6 × (1·(−1) − 2·3).',
    ],
    solution:
      'A terceira coluna é (0, 0, 6) — dois zeros. Expandindo por ela, dois dos três termos somem. ' +
      'Sobra o termo (3,3), com sinal (−1)^(3+3) = +1: ' +
      'det = +6 × det[(1, 2), (3, −1)] = 6 × [(1)(−1) − (2)(3)] = 6 × (−1 − 6) = 6 × (−7) = −42. ' +
      'Se você tivesse expandido pela primeira linha, faria três determinantes 2×2 em vez de um. ' +
      'Escolher a fila com mais zeros é o único truque que importa aqui.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'det-05',
    topicId: 'al-determinantes',
    kind: 'choice',
    prompt: 'Para que tamanho de matriz a regra de Sarrus funciona?',
    options: [
      'Qualquer matriz quadrada',
      'Somente 3×3',
      'Somente 2×2 e 3×3',
      '3×3 e 4×4',
    ],
    answer: 1,
    hints: [
      'Sarrus é aquela regra de repetir as duas primeiras colunas e somar diagonais.',
      'Tente imaginar a construção numa matriz 4×4 — o padrão de diagonais não fecha.',
    ],
    solution:
      'Sarrus funciona SOMENTE em 3×3. Tentar estender para 4×4 é um erro clássico e dá resposta errada, ' +
      'porque o padrão de seis diagonais não corresponde aos 24 termos do determinante 4×4. ' +
      'Para 2×2 não se usa Sarrus, e sim a fórmula direta ad − bc. ' +
      'O método que funciona em QUALQUER tamanho é Laplace (expansão por cofatores) — ou, na prática, ' +
      'escalonar até triangular e multiplicar a diagonal.',
    xpReward: 30,
    difficulty: 2,
  },
];

export const propriedadesDetExercises: Exercise[] = [
  {
    id: 'pdet-01',
    topicId: 'al-determinante-propriedades',
    kind: 'numeric',
    prompt:
      'Calcule o determinante da matriz triangular superior com linhas (2, 7, 1), (0, 3, 5) e (0, 0, 4).',
    answer: 24,
    hints: [
      'Em matriz triangular há um atalho: não precisa de Laplace nem Sarrus.',
      'O determinante é o produto da diagonal principal: 2 × 3 × 4.',
    ],
    solution:
      'Em matriz triangular (superior, inferior ou diagonal), det = produto da diagonal principal = ' +
      '2 × 3 × 4 = 24. Todos os outros termos se cancelam. ' +
      'É exatamente por isso que se calcula determinante POR ESCALONAMENTO: você reduz a matriz a uma ' +
      'triangular usando só a operação "somar múltiplo de outra linha" (que não altera o determinante) e ' +
      'multiplica a diagonal. Para 4×4 ou maior, é bem mais rápido que Laplace.',
    xpReward: 25,
    difficulty: 1,
  },
  {
    id: 'pdet-02',
    topicId: 'al-determinante-propriedades',
    kind: 'numeric',
    prompt: 'Se A é 3×3 e det(A) = 5, quanto vale det(2A)?',
    answer: 40,
    hints: [
      'Cuidado: o 2 multiplica a matriz INTEIRA, ou seja, todas as três linhas.',
      'Cada linha multiplicada por 2 multiplica o determinante por 2. Com 3 linhas: 2³.',
      '2³ × 5.',
    ],
    solution:
      'det(kA) = kⁿ · det(A), onde n é a ordem da matriz. Aqui: det(2A) = 2³ × 5 = 8 × 5 = 40. ' +
      'A armadilha é responder 10, tratando o 2 como se multiplicasse o determinante uma vez só. ' +
      'Mas multiplicar a matriz por 2 significa multiplicar CADA UMA das 3 linhas por 2 — e cada uma ' +
      'dessas operações dobra o determinante.',
    xpReward: 40,
    difficulty: 3,
  },
  {
    id: 'pdet-03',
    topicId: 'al-determinante-propriedades',
    kind: 'numeric',
    prompt: 'Se det(A) = 3 e det(B) = −2, quanto vale det(AB)?',
    answer: -6,
    hints: [
      'Existe uma propriedade multiplicativa para o determinante do produto.',
      'det(AB) = det(A) · det(B). Multiplique 3 por −2.',
    ],
    solution:
      'det(AB) = det(A) · det(B) = 3 × (−2) = −6. ' +
      'Essa propriedade é surpreendentemente forte, já que a multiplicação de matrizes em si é ' +
      'complicada. Ela dá consequências imediatas: det(AB) = det(BA) mesmo quando AB ≠ BA, e ' +
      'det(A⁻¹) = 1/det(A). ' +
      'Note que NÃO existe propriedade análoga para soma: det(A + B) ≠ det(A) + det(B).',
    xpReward: 30,
    difficulty: 2,
  },
  {
    id: 'pdet-04',
    topicId: 'al-determinante-propriedades',
    kind: 'choice',
    prompt:
      'Sejam A = I e B = I, matrizes identidade 2×2. Compare det(A + B) com det(A) + det(B).',
    options: [
      'São iguais: ambos valem 2',
      'det(A + B) = 4 e det(A) + det(B) = 2 — são diferentes',
      'São iguais: ambos valem 4',
      'det(A + B) não existe',
    ],
    answer: 1,
    hints: [
      'A + B = 2I, ou seja, a matriz com 2 na diagonal e 0 fora.',
      'det(2I) numa 2×2 é 2 × 2 = 4. Já det(I) + det(I) = 1 + 1 = 2.',
    ],
    solution:
      'A + B = 2I, cujo determinante é (2)(2) − 0 = 4. Já det(A) + det(B) = 1 + 1 = 2. ' +
      'Como 4 ≠ 2, fica demonstrado que det(A + B) ≠ det(A) + det(B) — NÃO existe propriedade aditiva ' +
      'para determinantes. ' +
      'Esta é a armadilha mais cobrada do tópico, justamente porque a propriedade MULTIPLICATIVA ' +
      'det(AB) = det(A)det(B) existe e induz o aluno a supor que a aditiva também existiria. ' +
      'Confere ainda com det(kA) = kⁿdet(A): det(2I) = 2² × 1 = 4 ✓.',
    xpReward: 45,
    difficulty: 3,
  },
  {
    id: 'pdet-05',
    topicId: 'al-determinante-propriedades',
    kind: 'numeric',
    prompt:
      'Resolva pela Regra de Cramer o sistema 2x + y = 5, x − y = 1, e informe o valor de x.',
    answer: 2,
    hints: [
      'Calcule det(A) com a matriz dos coeficientes: linhas (2, 1) e (1, −1).',
      'det(A) = (2)(−1) − (1)(1) = −3. Agora troque a 1ª coluna pelos termos independentes (5, 1).',
      'det(Ax) = (5)(−1) − (1)(1) = −6. E x = det(Ax)/det(A).',
    ],
    solution:
      'det(A) = (2)(−1) − (1)(1) = −2 − 1 = −3. ' +
      'Trocando a coluna do x pelos termos independentes: det(Aₓ) = (5)(−1) − (1)(1) = −5 − 1 = −6. ' +
      'x = det(Aₓ)/det(A) = −6/−3 = 2. (E y = −3/−3 = 1.) ' +
      'Conferindo: 2(2) + 1 = 5 ✓ e 2 − 1 = 1 ✓. ' +
      'Cramer só vale para sistema QUADRADO e com det(A) ≠ 0 — com determinante zero ela não distingue ' +
      'SPI de SI, e você precisa escalonar mesmo assim.',
    xpReward: 40,
    difficulty: 3,
  },
];
