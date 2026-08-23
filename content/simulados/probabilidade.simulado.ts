import { Simulado } from '@/types/simulado';

/**
 * Banco do simulado de Probabilidade e Estatística.
 *
 * Livro confirmado pela lista do professor: Montgomery & Runger, "Estatística
 * Aplicada e Probabilidade para Engenheiros", 4ª ed. — a numeração com hífen
 * (2-49) é dele, não do Walpole.
 *
 * `naLista: true` marca os exercícios que o professor já cobrou na Lista 1 —
 * são os candidatos mais prováveis para as 10 questões da prova.
 */
export const simuladoProbabilidade: Simulado = {
  id: 'sim-pe',
  titulo: 'Simulado — Probabilidade',
  materia: 'Probabilidade e Estatística',
  subjectSlug: 'probabilidade-estatistica',
  livro: 'Montgomery & Runger — Estatística Aplicada e Probabilidade para Engenheiros, 4ª ed.',
  escopoConfirmado: 'Cap. 2 (Probabilidade) — confirmado pela Lista 1, exercícios 2-1 a 2-129',
  escopoDeclarado: 'O professor falou em caps. 1 a 3; só o cap. 2 aparece na lista',
  quantidade: 10,
  minutos: 60,
  cor: 'from-indigo-500 to-violet-600',
  questoes: [
    {
      id: 'pe-2-5',
      fonte: 'Montgomery 2-5',
      capitulo: 'Cap. 2 — Espaço amostral',
      assunto: 'Espaço amostral por regra do produto',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Na fabricação de fitas cassetes digitais, cada uma das 24 trilhas é classificada como contendo ou não contendo um ou mais bits defeituosos. Quantos resultados diferentes tem o espaço amostral desse experimento?',
      answer: 16777216,
      formato: 'um número inteiro',
      solucao:
        'Cada trilha tem 2 estados possíveis (contém ou não contém bit defeituoso), e são 24 trilhas independentes. ' +
        'Pela regra da multiplicação: 2 × 2 × … × 2 (24 vezes) = 2²⁴ = 16.777.216 resultados. ' +
        'O enunciado do livro pede para DESCREVER o espaço amostral — a descrição correta é "o conjunto de todas as ' +
        'sequências de 24 símbolos, cada um sendo defeituoso ou não". Saber contá-lo é o que garante que você entendeu a descrição.',
    },
    {
      id: 'pe-2-7',
      fonte: 'Montgomery 2-7',
      capitulo: 'Cap. 2 — Espaço amostral',
      assunto: 'Discreto × contínuo',
      naLista: true,
      kind: 'choice',
      prompt:
        'Uma escala que mostra duas casas decimais é usada para medir, em toneladas, alimentações de materiais em uma planta química. Como se descreve o espaço amostral desse experimento?',
      options: [
        'Contínuo: S = {x | x ≥ 0}, porque peso é uma medida',
        'Discreto: S = {0,00; 0,01; 0,02; …}, porque o instrumento só registra dois decimais',
        'Discreto e finito, com exatamente 100 resultados possíveis',
        'Não é possível descrever, porque o valor máximo não foi informado',
      ],
      answer: 1,
      solucao:
        'A pegadinha é essa: a GRANDEZA (peso) é contínua, mas o ESPAÇO AMOSTRAL do experimento é o conjunto do que o ' +
        'instrumento consegue registrar. Com duas casas decimais, os resultados possíveis são 0,00; 0,01; 0,02; … — ' +
        'um conjunto discreto (contável), ainda que infinito. ' +
        'Montgomery usa esse par de exercícios (2-6 amperímetro de três dígitos, 2-7 escala de dois decimais) exatamente para ' +
        'separar "a natureza da grandeza" de "a precisão do instrumento". A alternativa contínua é a que a maioria marca — e é a errada.',
    },
    {
      id: 'pe-2-15',
      fonte: 'Montgomery 2-15',
      capitulo: 'Cap. 2 — Espaço amostral',
      assunto: 'Regra da multiplicação',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Uma peça amostrada, moldada por injeção, poderia ter sido produzida em uma das duas prensas e em qualquer uma das oito cavidades em cada prensa. Quantos resultados diferentes existem no espaço amostral?',
      answer: 16,
      formato: 'um número inteiro',
      solucao:
        'Duas etapas: escolher a prensa (2 opções) e escolher a cavidade (8 opções). Pela regra da multiplicação, ' +
        '2 × 8 = 16 resultados. ' +
        'O espaço amostral se escreve como os pares (prensa, cavidade): (1,1), (1,2), …, (2,8). ' +
        'Repare que é MULTIPLICAÇÃO e não soma: as duas escolhas acontecem juntas ("prensa E cavidade"), não são alternativas.',
    },
    {
      id: 'pe-2-31',
      fonte: 'Montgomery 2-31',
      capitulo: 'Cap. 2 — Espaço amostral',
      assunto: 'Amostragem sem reposição',
      naLista: true,
      kind: 'choice',
      prompt:
        'Uma amostra de duas placas de circuito impresso é selecionada SEM reposição a partir de uma batelada que contém 90 placas não-defeituosas, 8 placas com pequenos defeitos e 2 placas com grandes defeitos. Descrevendo o espaço amostral ORDENADO por categoria, quantos resultados ele tem?',
      options: [
        '3 resultados — uma para cada categoria',
        '6 resultados — as combinações de duas categorias entre três',
        '9 resultados — todos os pares ordenados (categoria da 1ª, categoria da 2ª)',
        '100 resultados — o total de placas na batelada',
      ],
      answer: 2,
      solucao:
        'Como o espaço amostral é ORDENADO, cada resultado é um par (categoria da primeira placa, categoria da segunda placa). ' +
        'Há 3 categorias possíveis para cada posição, logo 3 × 3 = 9 pares ordenados: (n,n), (n,p), (n,g), (p,n), (p,p), (p,g), ' +
        '(g,n), (g,p), (g,g). ' +
        'Atenção ao item (b) do livro, que muda a batelada para apenas 1 placa com grandes defeitos: aí o resultado (g,g) ' +
        'torna-se IMPOSSÍVEL e o espaço amostral cai para 8 pares. É exatamente esse detalhe que o exercício quer testar — ' +
        'sem reposição, o que sobra depende do que saiu.',
    },
    {
      id: 'pe-2-37',
      fonte: 'Montgomery 2-37',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Regra da multiplicação',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Novos projetos para um tanque de tratamento de águas residuais têm propostas três formas possíveis, quatro tamanhos diferentes, três localizações diferentes para válvulas de alimentação de material e quatro localizações diferentes para as válvulas de retirada de material. Quantos projetos diferentes do produto são possíveis?',
      answer: 144,
      formato: 'um número inteiro',
      solucao:
        'Quatro decisões independentes em sequência — multiplique todas: 3 formas × 4 tamanhos × 3 localizações de alimentação ' +
        '× 4 localizações de retirada = 144 projetos. ' +
        'A conferência mental: se qualquer fator fosse 1 (só uma opção), ele não mudaria o total — e é isso que a multiplicação ' +
        'faz naturalmente. Somar daria 14, que seria a resposta se o projeto pudesse variar em UMA característica só.',
    },
    {
      id: 'pe-2-49a',
      fonte: 'Montgomery 2-49 (a)',
      capitulo: 'Cap. 2 — Axiomas da probabilidade',
      assunto: 'Probabilidade de um evento',
      naLista: true,
      kind: 'numeric',
      prompt:
        'O espaço amostral de um experimento aleatório é {a, b, c, d, e}, com probabilidades 0,1; 0,1; 0,2; 0,4 e 0,2, respectivamente. Seja A o evento {a, b, c}. Determine P(A).',
      answer: 0.4,
      formato: 'decimal com vírgula, ex: 0,4',
      solucao:
        'A probabilidade de um evento é a SOMA das probabilidades dos resultados que o compõem: ' +
        'P(A) = P(a) + P(b) + P(c) = 0,1 + 0,1 + 0,2 = 0,4. ' +
        'Antes de qualquer coisa, confira que as cinco probabilidades somam 1: 0,1 + 0,1 + 0,2 + 0,4 + 0,2 = 1,0 ✓. ' +
        'Se não somassem, o enunciado estaria mal formulado — e essa conferência de dois segundos é o que o axioma P(S) = 1 serve para fazer.',
    },
    {
      id: 'pe-2-49d',
      fonte: 'Montgomery 2-49 (d)',
      capitulo: 'Cap. 2 — Axiomas da probabilidade',
      assunto: 'Regra aditiva',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Mesmo espaço amostral {a, b, c, d, e} com probabilidades 0,1; 0,1; 0,2; 0,4 e 0,2. Com A = {a, b, c} e B = {c, d, e}, determine P(A ∪ B).',
      answer: 1.0,
      formato: 'decimal com vírgula, ex: 0,4',
      solucao:
        'Pela regra aditiva: P(A ∪ B) = P(A) + P(B) − P(A ∩ B). ' +
        'P(A) = 0,1 + 0,1 + 0,2 = 0,4. P(B) = 0,2 + 0,4 + 0,2 = 0,8. A ∩ B = {c}, logo P(A ∩ B) = 0,2. ' +
        'P(A ∪ B) = 0,4 + 0,8 − 0,2 = 1,0. ' +
        'Confira pelo caminho curto: A ∪ B = {a, b, c, d, e} = S inteiro, e P(S) = 1 por axioma ✓. ' +
        'Quem soma direto sem subtrair a interseção obtém 1,2 — uma probabilidade maior que 1, que é a denúncia clássica do erro.',
    },
    {
      id: 'pe-2-55',
      fonte: 'Montgomery 2-55 (a)',
      capitulo: 'Cap. 2 — Axiomas da probabilidade',
      assunto: 'Soma de probabilidades por categoria',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Em uma bateria de NiCd, uma célula completamente carregada é composta de Hidróxido de Níquel. O níquel é um elemento que tem múltiplos estados de oxidação, encontrado nas proporções da tabela. Qual é a probabilidade de uma célula ter no mínimo uma das opções de níquel carregado positivamente?',
      tabela: {
        titulo: 'carga de níquel × proporções encontradas',
        cabecalho: ['carga de níquel', 'proporção'],
        linhas: [
          [0, '0,17'],
          ['+2', '0,35'],
          ['+3', '0,33'],
          ['+4', '0,15'],
        ],
      },
      answer: 0.83,
      formato: 'decimal com vírgula, ex: 0,83',
      solucao:
        '"Carregado positivamente" são as cargas +2, +3 e +4 — a carga 0 fica de fora. ' +
        'P = 0,35 + 0,33 + 0,15 = 0,83. ' +
        'O caminho pelo complemento é ainda mais rápido: P = 1 − P(carga 0) = 1 − 0,17 = 0,83 ✓. ' +
        'No item (b) o livro pede P(não ser maior do que +3), que inclui as cargas 0, +2 e +3: 0,17 + 0,35 + 0,33 = 0,85. ' +
        'Repare que "não maior que +3" INCLUI o +3 — trocar isso por "menor que +3" muda a resposta para 0,52.',
    },
    {
      id: 'pe-2-57',
      fonte: 'Montgomery 2-57',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Regra do produto com repetição',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Suponha que seu veículo seja licenciado em um estado que emita placas que consistam em três dígitos (entre 0 e 9), seguidos de três letras (entre A e Z). Quantas placas diferentes são possíveis?',
      answer: 17576000,
      formato: 'um número inteiro',
      solucao:
        'São seis posições independentes, com repetição permitida: 10 × 10 × 10 × 26 × 26 × 26 = 10³ × 26³ = ' +
        '1.000 × 17.576 = 17.576.000 placas. ' +
        'A pergunta do livro é a probabilidade de a SUA placa ser sorteada: como todas são igualmente prováveis, ' +
        'P = 1/17.576.000 ≈ 5,7 × 10⁻⁸. ' +
        'Cuidado para não usar arranjo aqui: nada impede a placa AAA-000, então há repetição e o expoente é o número de posições.',
    },
    {
      id: 'pe-2-71',
      fonte: 'Montgomery 2-71 (a)',
      capitulo: 'Cap. 2 — Probabilidade em tabelas',
      assunto: 'Complemento em tabela de dupla entrada',
      naLista: true,
      kind: 'numeric',
      prompt:
        'Um fabricante de faróis para automóveis testa lâmpadas sob ambientes com alta umidade e com alta temperatura, usando intensidade e vida útil como as respostas de interesse. A tabela mostra o desempenho de 130 lâmpadas. Encontre a probabilidade de uma lâmpada selecionada aleatoriamente fornecer resultados insatisfatórios sob QUALQUER critério.',
      tabela: {
        titulo: 'intensidade × vida útil (130 lâmpadas)',
        cabecalho: ['intensidade', 'vida útil satisfatória', 'vida útil insatisfatória'],
        linhas: [
          ['satisfatória', 117, 3],
          ['insatisfatória', 8, 2],
        ],
      },
      answer: 0.1,
      formato: 'decimal com vírgula, ex: 0,10',
      solucao:
        '"Insatisfatório sob qualquer critério" é a UNIÃO dos dois defeitos — o complemento de "satisfatório nos dois". ' +
        'Satisfatório em ambos: 117 lâmpadas. Logo insatisfatório em pelo menos um critério: 130 − 117 = 13. ' +
        'P = 13/130 = 0,10. ' +
        'Somando as células diretamente dá o mesmo: 3 + 8 + 2 = 13 ✓ — repare que a célula (8) e a (3) e a (2) não se sobrepõem, ' +
        'por isso aqui a soma direta funciona. ' +
        'No item (b), os consumidores exigem 95% de resultados satisfatórios: o fabricante entrega 117/130 = 90%, então NÃO atende a demanda.',
    },

    {
      id: 'pe-2-51',
      fonte: 'Montgomery 2-51',
      capitulo: 'Cap. 2 — Axiomas da probabilidade',
      assunto: 'Resultados igualmente prováveis',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Se o último dígito de uma medida de peso for igualmente provável de ser qualquer um dos dígitos de 0 a 9, qual é a probabilidade de que o último dígito seja maior que ou igual a 5?',
      answer: 0.5,
      formato: 'decimal com vírgula, ex: 0,5',
      solucao:
        'Os dígitos ≥ 5 são 5, 6, 7, 8 e 9 — cinco dos dez resultados igualmente prováveis. P = 5/10 = 0,5. ' +
        'O detalhe que derruba gente: "maior que OU IGUAL a 5" inclui o próprio 5. Se fosse "maior que 5", seriam quatro ' +
        'dígitos e a resposta cairia para 0,4. ' +
        'No item (a) o livro pergunta P(último dígito ser 0) = 1/10 = 0,1.',
    },
    {
      id: 'pe-2-52',
      fonte: 'Montgomery 2-52 (a)',
      capitulo: 'Cap. 2 — Axiomas da probabilidade',
      assunto: 'Tradução de "no mínimo"',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Pedidos de compras de um computador são sumarizados pelos itens opcionais solicitados: nenhum item opcional, 0,3; um item opcional, 0,5; mais de um item opcional, 0,2. Qual é a probabilidade de um pedido de compra solicitar no mínimo um item opcional?',
      answer: 0.7,
      formato: 'decimal com vírgula, ex: 0,7',
      solucao:
        '"No mínimo um" = "um" OU "mais de um" = 0,5 + 0,2 = 0,7. ' +
        'Pelo complemento: 1 − P(nenhum) = 1 − 0,3 = 0,7 ✓ — sempre o caminho mais curto quando aparece "no mínimo um". ' +
        'No item (b), "não solicitar mais de um item" = nenhum OU um = 0,3 + 0,5 = 0,8. ' +
        'As três categorias somam 1,0, o que confirma que elas particionam o espaço amostral.',
    },
    {
      id: 'pe-2-61',
      fonte: 'Montgomery 2-61 (e)',
      capitulo: 'Cap. 2 — Probabilidade em tabelas',
      assunto: 'Regra aditiva em tabela',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Amostras de emissões de três fornecedores são classificadas com relação a satisfazer as especificações de qualidade do ar. Os resultados de 100 amostras estão na tabela. Seja A o evento de a amostra ser proveniente do fornecedor 1 e B o evento de a amostra atender às especificações. Determine P(A ∪ B).',
      tabela: {
        titulo: 'fornecedor × conforme (100 amostras)',
        cabecalho: ['fornecedor', 'conforme: sim', 'conforme: não'],
        linhas: [
          [1, 22, 8],
          [2, 25, 5],
          [3, 30, 10],
        ],
      },
      answer: 0.85,
      formato: 'decimal com vírgula, ex: 0,85',
      solucao:
        'Primeiro os totais: fornecedor 1 tem 22 + 8 = 30 amostras, então P(A) = 0,30. ' +
        'Conformes são 22 + 25 + 30 = 77, então P(B) = 0,77. A interseção (fornecedor 1 E conforme) é a célula 22, ' +
        'logo P(A ∩ B) = 0,22. ' +
        'P(A ∪ B) = 0,30 + 0,77 − 0,22 = 0,85. ' +
        'Conferindo por contagem direta: as amostras em A ∪ B são as 30 do fornecedor 1 mais as conformes dos fornecedores 2 e 3 ' +
        '(25 + 30 = 55), totalizando 85 de 100 ✓.',
    },
    {
      id: 'pe-2-62',
      fonte: 'Montgomery 2-62 (e)',
      capitulo: 'Cap. 2 — Probabilidade em tabelas',
      assunto: 'Regra aditiva em tabela',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Discos de plástico de policarbonato, provenientes de um fornecedor, são analisados com relação às resistências a arranhões e ao choque. Os resultados de 100 discos estão na tabela. Seja A o evento de um disco ter alta resistência ao choque e B o evento de um disco ter alta resistência a arranhões. Determine P(A ∪ B).',
      tabela: {
        titulo: 'resistência a arranhões × resistência a choque (100 discos)',
        cabecalho: ['resistência a arranhões', 'choque: alta', 'choque: baixa'],
        linhas: [
          ['alta', 70, 9],
          ['baixa', 16, 5],
        ],
      },
      answer: 0.95,
      formato: 'decimal com vírgula, ex: 0,95',
      solucao:
        'A = alta resistência ao CHOQUE = coluna "choque: alta" = 70 + 16 = 86, então P(A) = 0,86. ' +
        'B = alta resistência a ARRANHÕES = linha "alta" = 70 + 9 = 79, então P(B) = 0,79. ' +
        'A ∩ B = a célula onde as duas são altas = 70, então P(A ∩ B) = 0,70. ' +
        'P(A ∪ B) = 0,86 + 0,79 − 0,70 = 0,95. ' +
        'O erro fatal aqui é trocar linha por coluna. Antes de somar, escreva por extenso o que é A e o que é B — ' +
        'a tabela é de dupla entrada justamente para punir quem não lê o rótulo.',
    },
    {
      id: 'pe-2-70',
      fonte: 'Montgomery 2-70 (a)',
      capitulo: 'Cap. 2 — Probabilidade em tabelas',
      assunto: 'Regra aditiva em tabela',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Cabos de fio de cobre, provenientes de um fabricante, são analisados em relação à resistência e à condutividade. Os resultados de 100 cabos estão na tabela. Se um cabo for selecionado aleatoriamente, qual é a probabilidade de sua condutividade ser alta OU sua resistência ser alta?',
      tabela: {
        titulo: 'condutividade × resistência (100 cabos)',
        cabecalho: ['condutividade', 'resistência: alta', 'resistência: baixa'],
        linhas: [
          ['alta', 74, 8],
          ['baixa', 15, 3],
        ],
      },
      answer: 0.97,
      formato: 'decimal com vírgula, ex: 0,97',
      solucao:
        'P(condutividade alta) = 74 + 8 = 82 → 0,82. P(resistência alta) = 74 + 15 = 89 → 0,89. ' +
        'A interseção (as duas altas) é a célula 74 → 0,74. ' +
        'P(união) = 0,82 + 0,89 − 0,74 = 0,97. ' +
        'Confira contando o complemento: o único caso fora da união é "condutividade baixa E resistência baixa" = 3 cabos. ' +
        'Logo P = 1 − 0,03 = 0,97 ✓. Esse truque do complemento costuma ser mais rápido que a regra aditiva em tabelas 2×2.',
    },
    {
      id: 'pe-2-72',
      fonte: 'Montgomery 2-72 (b)',
      capitulo: 'Cap. 2 — Probabilidade em tabelas',
      assunto: 'Probabilidade de uma célula',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Óleo de cozinha é produzido em duas variedades principais: mono e poliinsaturado. Duas fontes comuns de óleo de cozinha são milho e canola. A tabela mostra o número de garrafas desses óleos em um supermercado. Se uma garrafa for selecionada ao acaso, qual é a probabilidade de ser óleo de canola monoinsaturado?',
      tabela: {
        titulo: 'tipo de insaturação × tipo de óleo',
        cabecalho: ['tipo de insaturação', 'canola', 'milho'],
        linhas: [
          ['mono', 7, 13],
          ['poli', 93, 77],
        ],
      },
      answer: 0.0368,
      tolerancia: 0.02,
      formato: 'decimal com vírgula, ex: 0,0368',
      solucao:
        'O total de garrafas é 7 + 13 + 93 + 77 = 190. A célula pedida (mono E canola) tem 7 garrafas. ' +
        'P = 7/190 = 0,0368, ou cerca de 3,7%. ' +
        'O passo que mais se esquece é calcular o total: ele NÃO é 100 aqui, ao contrário das tabelas anteriores. ' +
        'Usar 100 como denominador por hábito dá 0,07 — quase o dobro do certo. Sempre some a tabela inteira antes de dividir.',
    },
    {
      id: 'pe-2-35',
      fonte: 'Montgomery 2-35',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Regra da multiplicação com opcional',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Um pedido de compra de um computador pessoal digital pode especificar qualquer um dos cinco tamanhos de memória, qualquer um dos três tipos de vídeo, qualquer um dos quatro tamanhos de disco rígido e pode incluir ou não um extensor de memória. Quantos sistemas diferentes podem ser encomendados?',
      answer: 120,
      formato: 'um número inteiro',
      solucao:
        '5 memórias × 3 vídeos × 4 discos × 2 (com ou sem extensor) = 120 sistemas. ' +
        'O fator que passa batido é o último: "pode incluir OU NÃO" também é uma escolha, com 2 opções. ' +
        'Esquecer esse 2 dá 60 — metade da resposta. Toda característica binária de "tem/não tem" entra na multiplicação como 2.',
    },
    {
      id: 'pe-2-36',
      fonte: 'Montgomery 2-36',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Regra da multiplicação',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Em uma operação de fabricação, um item é produzido por usinagem, polimento e pintura. Se há três ferramentas de usinagem, quatro ferramentas de polimento e três ferramentas de pintura, quantas rotinas diferentes (consistindo em usinagem, seguida de polimento e depois pintura) são possíveis para o item?',
      answer: 36,
      formato: 'um número inteiro',
      solucao:
        '3 × 4 × 3 = 36 rotinas. ' +
        'São três ETAPAS que acontecem em sequência (usinagem E polimento E pintura), então multiplica. ' +
        'Se o enunciado dissesse "o item passa por usinagem OU polimento OU pintura", seriam alternativas e a conta viraria ' +
        '3 + 4 + 3 = 10. A palavrinha que decide entre somar e multiplicar é "e" contra "ou".',
    },
    {
      id: 'pe-2-38',
      fonte: 'Montgomery 2-38',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Permutação',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Um processo de fabricação consiste em 10 operações que podem ser completadas em qualquer ordem. Quantas sequências diferentes de produção são possíveis?',
      answer: 3628800,
      formato: 'um número inteiro',
      solucao:
        'É uma permutação de 10 elementos distintos: 10! = 3.628.800 sequências. ' +
        'O raciocínio passo a passo: 10 escolhas para a primeira operação, 9 para a segunda (uma já foi usada), 8 para a ' +
        'terceira… até 1. O produto 10 × 9 × 8 × … × 1 é exatamente o fatorial. ' +
        'Aqui a ordem IMPORTA (é uma sequência de produção), e não há repetição — por isso é permutação e não a regra do produto com repetição.',
    },
    {
      id: 'pe-2-39',
      fonte: 'Montgomery 2-39',
      capitulo: 'Cap. 2 — Técnicas de contagem',
      assunto: 'Permutação com restrição',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Um processo de fabricação consiste em 10 operações. Entretanto, cinco operações de usinagem devem ser completadas antes que qualquer uma das cinco operações restantes de montagem possa começar. Quantas sequências diferentes são possíveis?',
      answer: 14400,
      formato: 'um número inteiro',
      solucao:
        'A restrição divide o problema em dois blocos independentes: as 5 usinagens vêm primeiro, em qualquer ordem entre si ' +
        '(5! = 120 maneiras), e depois as 5 montagens, também em qualquer ordem entre si (5! = 120 maneiras). ' +
        'Total = 5! × 5! = 120 × 120 = 14.400. ' +
        'Compare com o 2-38: sem a restrição eram 3.628.800 sequências. A restrição corta o total por um fator de 252 — ' +
        'é o que se ganha ao fixar a ordem entre os dois grupos.',
    },
    {
      id: 'pe-2-26',
      fonte: 'Montgomery 2-26',
      capitulo: 'Cap. 2 — Operações com eventos',
      assunto: 'União e complemento por contagem',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Discos de plástico de policarbonato são analisados com relação à resistência a arranhões e a choque; os resultados de 100 discos estão na tabela. Seja A o evento de um disco ter alta resistência ao choque e B o evento de um disco ter alta resistência a arranhões. Determine o NÚMERO de discos em A ∪ B.',
      tabela: {
        titulo: 'resistência a arranhões × resistência a choque (100 discos)',
        cabecalho: ['resistência a arranhões', 'choque: alta', 'choque: baixa'],
        linhas: [
          ['alta', 70, 9],
          ['baixa', 16, 5],
        ],
      },
      answer: 95,
      formato: 'um número inteiro de discos',
      solucao:
        'A (choque alto) = 70 + 16 = 86 discos. B (arranhões alto) = 70 + 9 = 79 discos. A ∩ B = 70 discos. ' +
        'A ∪ B = 86 + 79 − 70 = 95 discos. ' +
        'Confira pelo complemento: o único grupo fora da união é "arranhões baixa E choque baixa" = 5 discos, ' +
        'e 100 − 5 = 95 ✓. ' +
        'O livro pede também A ∩ B (70 discos) e A′ (100 − 86 = 14 discos). Note que a resposta aqui é uma CONTAGEM, não uma probabilidade — ' +
        'ler o que o enunciado pede evita entregar 0,95 quando ele quer 95.',
    },
    {
      id: 'pe-2-27',
      fonte: 'Montgomery 2-27 (a)',
      capitulo: 'Cap. 2 — Operações com eventos',
      assunto: 'Interseção com complemento',
      naLista: false,
      kind: 'numeric',
      prompt:
        'Amostras de alumínio fundido são classificadas com base no acabamento da superfície e no acabamento de borda; os resultados de 100 peças estão na tabela. Seja A o evento de uma amostra ter excelente acabamento na superfície e B o evento de ter excelente acabamento de borda. Determine o número de amostras em A′ ∩ B.',
      tabela: {
        titulo: 'acabamento de superfície × acabamento de borda (100 peças)',
        cabecalho: ['acabamento de superfície', 'borda: excelente', 'borda: bom'],
        linhas: [
          ['excelente', 80, 2],
          ['bom', 10, 8],
        ],
      },
      answer: 10,
      formato: 'um número inteiro de amostras',
      solucao:
        'A′ ∩ B lê-se "superfície NÃO excelente E borda excelente" — é exatamente a célula da linha "bom" com a coluna ' +
        '"borda: excelente": 10 amostras. ' +
        'O caminho longo confirma: B (borda excelente) = 80 + 10 = 90; dentro de B, os que TÊM superfície excelente são 80; ' +
        'logo os que não têm são 90 − 80 = 10 ✓. ' +
        'Em tabela de dupla entrada, toda interseção de dois eventos simples é UMA célula. Se você precisou somar mais de uma célula ' +
        'para uma interseção, provavelmente traduziu o enunciado errado.',
    },
  ],
};
