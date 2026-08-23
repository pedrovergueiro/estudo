import { Simulado } from '@/types/simulado';

/**
 * Banco do simulado de Cálculo A.
 *
 * Livro: Stewart, "Cálculo — Volume 1", tradução da 7ª ed. A Lista 1 do professor
 * cobre as seções 2.1 a 2.4, e todos os limites abaixo foram transcritos do bloco
 * de exercícios dessas seções e conferidos numericamente antes de entrar aqui.
 *
 * A `fonte` cita a SEÇÃO, não o número do exercício: a extração de fórmulas do PDF
 * embaralha a numeração, e citar um número errado seria pior que não citar.
 */
export const simuladoCalculo: Simulado = {
  id: 'sim-cal',
  titulo: 'Simulado — Cálculo A',
  materia: 'Cálculo A',
  subjectSlug: 'calculo-a',
  livro: 'Stewart — Cálculo, Volume 1, 7ª ed.',
  escopoConfirmado:
    'Seções 2.1 a 2.4 — confirmado pela Lista 1 (2.1: 1,3,5,7,9 · 2.2: 1,3,5,9,11,15,21,27,31,39,41,47 · 2.3: 1,3,5,9,11,17,23,29,33,41,47,51,63 · 2.4: 1,3,9,11,17,25,31,35,37,43)',
  quantidade: 10,
  minutos: 60,
  cor: 'from-emerald-500 to-teal-600',
  questoes: [
    {
      id: 'cal-l01',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Expansão de binômio',
      naLista: true,
      kind: 'numeric',
      prompt: 'Calcule lim(h→0) [(2 + h)³ − 8] / h.',
      answer: 12,
      formato: 'um número',
      solucao:
        'Substituindo dá 0/0 — indeterminado, então tem que simplificar. ' +
        'Expanda o cubo: (2 + h)³ = 8 + 12h + 6h² + h³. ' +
        'O numerador vira 8 + 12h + 6h² + h³ − 8 = 12h + 6h² + h³ = h(12 + 6h + h²). ' +
        'Cancelando o h: lim(h→0) (12 + 6h + h²) = 12. ' +
        'Esse limite é a derivada de x³ em x = 2 — é por isso que ele aparece tanto: 3x² em x = 2 dá 12 ✓.',
    },
    {
      id: 'cal-l02',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Diferença de cubos',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(x→−2) (x + 2) / (x³ + 8).',
      options: ['1/12', '1/4', '0', '12'],
      answer: 0,
      solucao:
        'Substituindo: (−2 + 2)/((−2)³ + 8) = 0/0 — indeterminado. ' +
        'O denominador é uma SOMA de cubos: x³ + 8 = x³ + 2³ = (x + 2)(x² − 2x + 4). ' +
        'Cancelando o (x + 2) que aparece em cima e embaixo: lim(x→−2) 1/(x² − 2x + 4) = 1/(4 + 4 + 4) = 1/12. ' +
        'A alternativa 0 é o que se obtém parando na substituição — o erro clássico de tratar 0/0 como resposta. ' +
        'Fórmula para guardar: a³ + b³ = (a + b)(a² − ab + b²), com o sinal do meio TROCADO em relação ao primeiro parêntese.',
    },
    {
      id: 'cal-l03',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Fatoração de diferença de potências',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(t→1) (t⁴ − 1) / (t³ − 1).',
      options: ['4/3', '3/4', '1', '0'],
      answer: 0,
      solucao:
        'Dá 0/0. Fatore os dois lados pelo fator comum (t − 1): ' +
        't⁴ − 1 = (t − 1)(t + 1)(t² + 1) e t³ − 1 = (t − 1)(t² + t + 1). ' +
        'Cancelando (t − 1): lim(t→1) (t + 1)(t² + 1)/(t² + t + 1) = (2)(2)/(1 + 1 + 1) = 4/3. ' +
        'Atalho útil: para lim(t→1) (tⁿ − 1)/(tᵐ − 1) o resultado é sempre n/m — aqui 4/3 ✓. ' +
        'A alternativa 3/4 é a resposta invertida, o erro mais comum quando se aplica o atalho de cabeça.',
    },
    {
      id: 'cal-l04',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Racionalização',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(h→0) (√(9 + h) − 3) / h.',
      options: ['1/6', '1/3', '1/9', '0'],
      answer: 0,
      solucao:
        'Dá 0/0 e tem raiz — então racionalize multiplicando em cima e embaixo pelo conjugado (√(9 + h) + 3): ' +
        'o numerador vira (9 + h) − 9 = h, e o denominador vira h(√(9 + h) + 3). ' +
        'Cancelando o h: lim(h→0) 1/(√(9 + h) + 3) = 1/(3 + 3) = 1/6. ' +
        'Note que o 3 do denominador final é √9 — por isso a resposta é 1/(2√9) = 1/6, e não 1/3 nem 1/9. ' +
        'Regra geral: lim(h→0) (√(a + h) − √a)/h = 1/(2√a).',
    },
    {
      id: 'cal-l05',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Racionalização com coeficiente',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(u→2) (√(4u + 1) − 3) / (u − 2).',
      options: ['2/3', '3/2', '1/3', '2'],
      answer: 0,
      solucao:
        'Racionalizando pelo conjugado (√(4u + 1) + 3), o numerador vira (4u + 1) − 9 = 4u − 8 = 4(u − 2). ' +
        'A expressão fica 4(u − 2) / [(u − 2)(√(4u + 1) + 3)], e o (u − 2) cancela. ' +
        'Sobra lim(u→2) 4/(√(4u + 1) + 3) = 4/(√9 + 3) = 4/6 = 2/3. ' +
        'O detalhe que muda tudo é o coeficiente 4 que sai da raiz: quem esquece dele e escreve (u − 2) no numerador ' +
        'chega em 1/6. Sempre fatore o numerador depois de racionalizar, antes de cancelar.',
    },
    {
      id: 'cal-l06',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Fração de frações',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(x→−4) (1/4 + 1/x) / (4 + x).',
      options: ['−1/16', '1/16', '−1/4', '−1/8'],
      answer: 0,
      solucao:
        'Some as frações do numerador primeiro: 1/4 + 1/x = (x + 4)/(4x). ' +
        'A expressão vira [(x + 4)/(4x)] / (4 + x) = (x + 4) / [4x(4 + x)], e como (x + 4) = (4 + x), tudo cancela: ' +
        'sobra 1/(4x). ' +
        'Substituindo x = −4: 1/(4 × (−4)) = −1/16. ' +
        'O erro de sinal é o que este exercício caça: 4x em x = −4 dá −16, não 16. Depois de cancelar, sempre substitua ' +
        'com o sinal do valor original.',
    },
    {
      id: 'cal-l07',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Conjugado com duas raízes',
      naLista: true,
      kind: 'numeric',
      prompt: 'Calcule lim(t→0) (√(1 + t) − √(1 − t)) / t.',
      answer: 1,
      formato: 'um número',
      solucao:
        'Multiplique pelo conjugado (√(1 + t) + √(1 − t)). O numerador vira (1 + t) − (1 − t) = 2t. ' +
        'A expressão fica 2t / [t(√(1 + t) + √(1 − t))], e o t cancela. ' +
        'Sobra lim(t→0) 2/(√(1 + t) + √(1 − t)) = 2/(1 + 1) = 1. ' +
        'Quando há DUAS raízes subtraídas, o conjugado é a mesma expressão com o sinal do meio trocado — e o resultado ' +
        'elimina as duas raízes de uma vez, porque (a − b)(a + b) = a² − b².',
    },
    {
      id: 'cal-l08',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Subtração de frações',
      naLista: true,
      kind: 'numeric',
      prompt: 'Calcule lim(t→0) [ 1/t − 1/(t² + t) ].',
      answer: 1,
      formato: 'um número',
      solucao:
        'Aqui a indeterminação é do tipo ∞ − ∞, não 0/0 — mas o tratamento é o mesmo: junte tudo numa fração só. ' +
        'Fatore o segundo denominador: t² + t = t(t + 1). ' +
        'MMC = t(t + 1): 1/t − 1/[t(t + 1)] = [(t + 1) − 1] / [t(t + 1)] = t / [t(t + 1)]. ' +
        'Cancelando o t: lim(t→0) 1/(t + 1) = 1. ' +
        'Nunca calcule ∞ − ∞ "termo a termo": os dois termos explodem, mas a diferença entre eles é perfeitamente finita.',
    },
    {
      id: 'cal-l09',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Fatorar com raiz no numerador',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(x→16) (4 − √x) / (16x − x²).',
      options: ['1/128', '1/64', '1/32', '−1/128'],
      answer: 0,
      solucao:
        'Fatore o denominador: 16x − x² = x(16 − x). E note que 16 − x é diferença de quadrados em termos de √x: ' +
        '16 − x = (4 − √x)(4 + √x). ' +
        'A expressão vira (4 − √x) / [x(4 − √x)(4 + √x)], e o (4 − √x) cancela. ' +
        'Sobra lim(x→16) 1/[x(4 + √x)] = 1/[16 × (4 + 4)] = 1/128. ' +
        'A sacada é enxergar que x = (√x)², o que transforma 16 − x numa diferença de quadrados. Sem esse passo, ' +
        'não aparece o fator que cancela.',
    },
    {
      id: 'cal-l10',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Expoente negativo',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(h→0) [ (3 + h)⁻¹ − 3⁻¹ ] / h.',
      options: ['−1/9', '1/9', '−1/3', '−1/6'],
      answer: 0,
      solucao:
        'Reescreva os expoentes negativos como frações: [1/(3 + h) − 1/3] / h. ' +
        'MMC no numerador: [3 − (3 + h)] / [3(3 + h)] = −h / [3(3 + h)]. ' +
        'Dividindo por h: −1 / [3(3 + h)]. ' +
        'Substituindo h = 0: −1/(3 × 3) = −1/9. ' +
        'O sinal negativo não é acidente: 1/(3+h) é MENOR que 1/3 para h > 0, então a diferença é negativa. ' +
        'Esse limite é a derivada de 1/x em x = 3, e a derivada de 1/x é −1/x² — que em x = 3 dá −1/9 ✓.',
    },
    {
      id: 'cal-l11',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Fração com raiz e ∞ − ∞',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(t→0) [ 1/(t·√(1 + t)) − 1/t ].',
      options: ['−1/2', '1/2', '−1', '0'],
      answer: 0,
      solucao:
        'Junte numa fração só, colocando t√(1 + t) como denominador comum: ' +
        '[1 − √(1 + t)] / [t·√(1 + t)]. ' +
        'Agora racionalize o numerador pelo conjugado (1 + √(1 + t)): ele vira 1 − (1 + t) = −t. ' +
        'A expressão fica −t / [t·√(1 + t)·(1 + √(1 + t))], e o t cancela. ' +
        'Sobra lim(t→0) −1 / [√(1 + t)(1 + √(1 + t))] = −1/[1 × (1 + 1)] = −1/2. ' +
        'Duas técnicas na mesma questão — MMC primeiro, racionalização depois. É o tipo de exercício que separa quem decorou ' +
        'de quem entendeu o roteiro.',
    },
    {
      id: 'cal-l12',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Racionalização com fatoração',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(x→−4) (√(x² + 9) − 5) / (x + 4).',
      options: ['−4/5', '4/5', '−5/4', '−1/5'],
      answer: 0,
      solucao:
        'Racionalizando pelo conjugado, o numerador vira (x² + 9) − 25 = x² − 16 = (x − 4)(x + 4). ' +
        'A expressão fica (x − 4)(x + 4) / [(x + 4)(√(x² + 9) + 5)], e o (x + 4) cancela. ' +
        'Sobra lim(x→−4) (x − 4)/(√(x² + 9) + 5) = (−4 − 4)/(√25 + 5) = −8/10 = −4/5. ' +
        'Repare que foram necessários DOIS passos de fatoração: racionalizar produziu x² − 16, que ainda precisou ser ' +
        'fatorado como diferença de quadrados para o (x + 4) aparecer e cancelar.',
    },
    {
      id: 'cal-l13',
      fonte: 'Stewart 2.3',
      capitulo: '2.3 — Propriedades dos limites',
      assunto: 'Raiz no denominador',
      naLista: true,
      kind: 'choice',
      prompt: 'Calcule lim(x→0) x / (√(1 + 3x) − 1).',
      options: ['2/3', '3/2', '1/3', '3'],
      answer: 0,
      solucao:
        'A raiz está no DENOMINADOR desta vez, mas o conjugado resolve igual. Multiplicando por (√(1 + 3x) + 1) em cima e embaixo, ' +
        'o denominador vira (1 + 3x) − 1 = 3x. ' +
        'A expressão fica x(√(1 + 3x) + 1) / (3x), e o x cancela. ' +
        'Sobra lim(x→0) (√(1 + 3x) + 1)/3 = (1 + 1)/3 = 2/3. ' +
        'Não importa de que lado está a raiz — o conjugado sempre transforma (a − b)(a + b) em a² − b², e é isso que a elimina.',
    },
    {
      id: 'cal-c01',
      fonte: 'Stewart 2.2',
      capitulo: '2.2 — O limite de uma função',
      assunto: 'Limites laterais',
      naLista: true,
      kind: 'choice',
      prompt:
        'Para uma função f, sabe-se que lim(x→3⁻) f(x) = 5 e lim(x→3⁺) f(x) = 2, e que f(3) = 5. O que se pode afirmar sobre lim(x→3) f(x)?',
      options: [
        'Não existe, porque os limites laterais são diferentes',
        'Vale 5, porque coincide com o valor de f(3)',
        'Vale 5, porque o limite pela esquerda tem prioridade',
        'Vale 3,5, que é a média dos dois limites laterais',
      ],
      answer: 0,
      solucao:
        'O limite bilateral existe se, e somente se, os DOIS limites laterais existem e são IGUAIS. ' +
        'Aqui 5 ≠ 2, então lim(x→3) f(x) não existe. ' +
        'Repare que f(3) = 5 é irrelevante para o limite: o limite descreve para onde a função aponta ao se APROXIMAR de 3, ' +
        'não o que ela vale EM 3. Uma função pode ter limite num ponto onde nem está definida, e pode estar definida num ponto ' +
        'onde não tem limite — como aqui. ' +
        'Essa independência entre "limite" e "valor" é exatamente o que a Seção 2.5 usa para definir continuidade.',
    },
    {
      id: 'cal-c02',
      fonte: 'Stewart 2.2',
      capitulo: '2.2 — O limite de uma função',
      assunto: 'Indeterminação 0/0',
      naLista: true,
      kind: 'choice',
      prompt:
        'Ao substituir o valor num limite de uma fração, você obtém 0/0. Qual é a conclusão correta?',
      options: [
        'É uma indeterminação: numerador e denominador têm fator comum e é preciso simplificar antes de concluir',
        'O limite não existe',
        'O limite vale 0',
        'O limite vale 1, porque zero dividido por zero dá um',
      ],
      answer: 0,
      solucao:
        '0/0 é uma FORMA INDETERMINADA — ela não decide nada sozinha. Três limites que dão 0/0 no mesmo ponto x = 2: ' +
        '(x² − 4)/(x − 2) → 4, (x² − 4x + 4)/(x − 2) → 0, (x³ − 8)/(x − 2) → 12. Mesmo sintoma, três respostas. ' +
        'A frase para guardar: 0/0 não é resposta, é sintoma — o aviso de que há um fator comum esperando para ser cancelado. ' +
        'Cuidado para não confundir com 5/0 (numerador não-nulo): esse NÃO é indeterminado, é ±∞, e indica assíntota vertical. ' +
        'Distinguir 0/0 de 5/0 é a decisão mais importante da lista inteira.',
    },
    {
      id: 'cal-c03',
      fonte: 'Stewart 2.1',
      capitulo: '2.1 — Tangente e velocidade',
      assunto: 'Reta secante e reta tangente',
      naLista: true,
      kind: 'choice',
      prompt:
        'Na Seção 2.1, a inclinação da reta tangente à curva y = f(x) no ponto P(a, f(a)) é obtida a partir das retas secantes PQ. Qual é a relação correta?',
      options: [
        'É o limite das inclinações das secantes PQ quando Q tende a P ao longo da curva',
        'É a média das inclinações de todas as secantes PQ',
        'É a inclinação da secante PQ quando Q é o ponto mais próximo de P',
        'É a inclinação da reta que liga os extremos do domínio de f',
      ],
      answer: 0,
      solucao:
        'A inclinação da secante por P(a, f(a)) e Q(x, f(x)) é [f(x) − f(a)]/(x − a). ' +
        'A tangente é o LIMITE dessas inclinações quando x → a: m = lim(x→a) [f(x) − f(a)]/(x − a). ' +
        'A alternativa "Q é o ponto mais próximo de P" é sedutora e errada: não existe "ponto mais próximo", ' +
        'sempre cabe outro entre os dois. É precisamente essa impossibilidade que exige o conceito de limite — ' +
        'e é por isso que o Capítulo 2 começa por aqui. ' +
        'Substituindo x = a + h, a mesma fórmula vira lim(h→0) [f(a + h) − f(a)]/h, que é a forma dos exercícios da 2.3.',
    },
    {
      id: 'cal-c04',
      fonte: 'Stewart 2.4',
      capitulo: '2.4 — Definição precisa de limite',
      assunto: 'Épsilon-delta',
      naLista: true,
      kind: 'choice',
      prompt:
        'Na definição precisa de limite, lim(x→a) f(x) = L significa: para todo ε > 0 existe δ > 0 tal que…',
      options: [
        'se 0 < |x − a| < δ, então |f(x) − L| < ε',
        'se |x − a| < ε, então |f(x) − L| < δ',
        'se 0 < |f(x) − L| < δ, então |x − a| < ε',
        'se |x − a| < δ, então |f(x) − L| = 0',
      ],
      answer: 0,
      solucao:
        'A ordem lógica é: o desafio vem em ε (a tolerância no EIXO Y) e a resposta vem em δ (a vizinhança no EIXO X). ' +
        'Quem escolhe ε é o adversário; quem tem de achar δ é você. Trocar os dois de lugar (alternativa 2) inverte o jogo e ' +
        'torna a definição falsa. ' +
        'O detalhe do "0 < |x − a|" também é obrigatório: ele EXCLUI o próprio ponto x = a, garantindo que o limite não depende ' +
        'do valor de f em a — exatamente o que a intuição da Seção 2.2 já dizia. ' +
        'E |f(x) − L| < ε é uma desigualdade estrita, não uma igualdade: nunca se exige que f(x) alcance L, só que chegue tão perto quanto se queira.',
    },
  ],
};
