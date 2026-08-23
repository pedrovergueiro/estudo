import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { SystemExplorer, SistemaPreset } from '@/components/interactive/SystemExplorer';
import { gaussSteps } from '@/lib/math/gauss';

/** Aula: Sistemas de Equações Lineares. */
export function SistemasLesson() {
  const spd = gaussSteps(
    [
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ],
    [8, -11, -3]
  );

  const spi = gaussSteps(
    [
      [1, 2, -1],
      [2, 4, -2],
      [3, 6, -3],
    ],
    [3, 6, 9]
  );

  const si = gaussSteps(
    [
      [1, 1, 1],
      [2, 2, 2],
      [1, 0, 1],
    ],
    [3, 10, 2]
  );

  const presets: SistemaPreset[] = [
    {
      id: 'spd',
      nome: 'Caso 1 — solução única',
      equacoes: ['2x +  y −  z =   8', '−3x −  y + 2z = −11', '−2x +  y + 2z =  −3'],
      classificacao: spd.classificacao,
      resumo: spd.resumo,
      steps: spd.steps,
      geometria:
        'Três planos no espaço que se cruzam em exatamente um ponto. Esse ponto é a solução única.',
    },
    {
      id: 'spi',
      nome: 'Caso 2 — infinitas soluções',
      equacoes: ['x + 2y −  z = 3', '2x + 4y − 2z = 6', '3x + 6y − 3z = 9'],
      classificacao: spi.classificacao,
      resumo: spi.resumo,
      steps: spi.steps,
      geometria:
        'As três equações descrevem o MESMO plano (a segunda é a primeira ×2, a terceira é ×3). ' +
        'Qualquer ponto desse plano serve, por isso há infinitas soluções.',
    },
    {
      id: 'si',
      nome: 'Caso 3 — sem solução',
      equacoes: ['x +  y +  z =  3', '2x + 2y + 2z = 10', 'x       +  z =  2'],
      classificacao: si.classificacao,
      resumo: si.resumo,
      steps: si.steps,
      geometria:
        'A primeira equação diz que x+y+z = 3; a segunda, dividida por 2, diz que x+y+z = 5. ' +
        'A mesma soma não pode valer 3 e 5 ao mesmo tempo — são planos paralelos que nunca se encontram.',
    },
  ];

  return (
    <article className="space-y-10">
      <Section title="O que é um sistema linear (e por que a gente escalona)">
        <p>
          Um <strong>sistema de equações lineares</strong> é um conjunto de equações que precisam
          valer <em>ao mesmo tempo</em>. Resolver significa achar valores das incógnitas que
          satisfaçam todas elas simultaneamente.
        </p>
        <p>
          No ensino médio você provavelmente resolvia por substituição: isola o x numa equação,
          joga na outra... Funciona com 2 equações. Com 3, vira um inferno. Com 500 — que é o
          tamanho normal em problemas reais de IA — é impossível na mão.
        </p>
        <p>
          A <strong>eliminação de Gauss</strong> resolve isso: em vez de ficar isolando variáveis,
          você organiza os números numa matriz e aplica um procedimento mecânico e repetitivo até
          o sistema virar algo trivial de resolver. É um método, não um lampejo de criatividade —
          e é justamente por isso que computadores conseguem executá-lo.
        </p>

        <Callout tipo="info">
          O objetivo do escalonamento é chegar numa matriz <strong>triangular superior</strong>
          {' '}(aquela do tópico 1, com zeros abaixo da diagonal). Quando você chega lá, a última
          linha tem uma incógnita só — e aí você resolve de baixo para cima, sem esforço.
        </Callout>
      </Section>

      <Section title="As três operações permitidas">
        <p>
          Você só pode fazer três coisas com as linhas. Qualquer uma delas mantém a solução do
          sistema intacta — é por isso que são válidas:
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              op: 'Lᵢ ↔ Lⱼ',
              nome: 'Trocar duas linhas',
              porque: 'Só muda a ORDEM em que você escreveu as equações. Nenhuma informação se perde.',
            },
            {
              op: 'Lᵢ ← k·Lᵢ',
              nome: 'Multiplicar uma linha por k ≠ 0',
              porque: 'Dizer 2x = 6 ou x = 3 é a mesma coisa. Só não vale multiplicar por zero — isso apagaria a equação.',
            },
            {
              op: 'Lᵢ ← Lᵢ − k·Lⱼ',
              nome: 'Somar múltiplo de outra linha',
              porque: 'É a operação que realmente zera coisas. Como as duas equações são verdadeiras ao mesmo tempo, combiná-las gera outra equação verdadeira.',
            },
          ].map((x) => (
            <div
              key={x.op}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="mb-1 font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {x.op}
              </div>
              <div className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
                {x.nome}
              </div>
              <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">
                {x.porque}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Os três desfechos possíveis">
        <p>
          Todo sistema linear termina em um de três resultados — não existe um quarto caso. Troque
          entre os exemplos abaixo e acompanhe o escalonamento completo de cada um. Repare que os
          três começam parecidos: <strong>a diferença só aparece no fim</strong>.
        </p>

        <SystemExplorer presets={presets} />

        <Callout tipo="prova">
          Como identificar rapidamente ao terminar de escalonar:
          <br />• Sobrou uma linha <strong>0 0 0 | k</strong> (com k ≠ 0)? → <strong>SI</strong>,
          é uma contradição do tipo &quot;0 = 5&quot;.
          <br />• Sobrou uma linha <strong>0 0 0 | 0</strong>? → equação inútil, provavelmente{' '}
          <strong>SPI</strong> (infinitas soluções).
          <br />• Cada incógnita tem seu próprio pivô? → <strong>SPD</strong>, solução única.
        </Callout>

        <Callout tipo="atencao">
          Erro clássico de prova: parar no meio do escalonamento e tentar adivinhar a classificação.
          Só dá para classificar com segurança depois de escalonar até o fim. Outro erro comum é
          esquecer de aplicar a operação na coluna dos termos independentes (a última) — a linha
          inteira muda, não só a parte dos coeficientes.
        </Callout>

        <Checkpoint>
          Você sabe montar a matriz aumentada, aplicar as três operações elementares, escalonar até
          a forma triangular, resolver por retrosubstituição e classificar o sistema em SPD, SPI ou
          SI. Esse é o coração da Parte 1 do Projeto Integrador — a entrega pede exatamente
          &quot;resolução de pelo menos um sistema linear com verificação e explicação matemática&quot;.
        </Checkpoint>

        <Callout tipo="ia">
          Treinar um modelo de regressão linear é, no fundo, resolver um sistema linear gigante.
          Bibliotecas como NumPy fazem isso com <code>numpy.linalg.solve()</code> — que por dentro
          executa exatamente o que você acabou de ver, só que com milhares de linhas e otimizações
          numéricas. Saber o que acontece por baixo é o que separa quem usa a ferramenta de quem
          entende o resultado.
        </Callout>
      </Section>
    </article>
  );
}
