import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { CountingExplorer } from '@/components/interactive/CountingExplorer';

/** Aula: Contagem de pontos amostrais. */
export function ContagemLesson() {
  return (
    <article className="space-y-10">
      <Section title="A regra da multiplicação">
        <p>
          Quando uma escolha tem n₁ opções e a seguinte tem n₂ opções, o total de combinações é o{' '}
          <strong>produto</strong>:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            n₁ × n₂ × ... × n<sub>k</sub>
          </div>
        </div>

        <p>
          Placa com 3 letras e 4 dígitos: 26³ × 10⁴ = 175.760.000. Senha de 4 dígitos: 10⁴ = 10.000. Um
          diagrama de árvore mostra por quê — cada galho de um nível se abre em todos os galhos do
          próximo.
        </p>

        <Callout tipo="atencao">
          Some quando as opções são <strong>alternativas</strong> (&quot;ou isto ou aquilo&quot;) e
          multiplique quando são <strong>etapas</strong> (&quot;isto e depois aquilo&quot;). Escolher um
          entre 3 entradas <em>ou</em> 4 sobremesas dá 7 opções; escolher uma entrada <em>e</em> uma
          sobremesa dá 12.
        </Callout>
      </Section>

      <Section title="A pergunta que decide: a ordem importa?">
        <p>
          Toda questão de contagem se resolve respondendo isso primeiro. Se a ordem importa, é{' '}
          <strong>arranjo</strong>; se não importa, é <strong>combinação</strong>.
        </p>

        <CountingExplorer />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-cyan-300 dark:border-cyan-800 bg-cyan-50 dark:bg-cyan-950/40 p-4">
            <div className="mb-1 font-bold text-cyan-900 dark:text-cyan-100">
              Ordem IMPORTA → arranjo
            </div>
            <div className="my-1 font-mono text-sm text-cyan-900 dark:text-cyan-100">
              ₙPᵣ = n! / (n − r)!
            </div>
            <p className="text-sm text-cyan-900 dark:text-cyan-100">
              Pódio (1º, 2º, 3º), senha, cargos distintos, ordem de fila.
            </p>
          </div>

          <div className="rounded-lg border-2 border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 p-4">
            <div className="mb-1 font-bold text-purple-900 dark:text-purple-100">
              Ordem NÃO importa → combinação
            </div>
            <div className="my-1 font-mono text-sm text-purple-900 dark:text-purple-100">
              C(n, r) = n! / [r!(n − r)!]
            </div>
            <p className="text-sm text-purple-900 dark:text-purple-100">
              Comissão, mão de cartas, escolher amostra, grupo de peças.
            </p>
          </div>
        </div>

        <p>
          A relação entre as duas é direta: <strong>C(n, r) = ₙPᵣ / r!</strong>. Cada grupo sem ordem foi
          contado r! vezes na versão com ordem — uma para cada embaralhamento dos escolhidos. Dividir por
          r! desfaz essa repetição.
        </p>

        <Callout tipo="prova">
          Teste mental rápido: <em>trocar a ordem dos escolhidos gera um resultado diferente?</em> Se
          &quot;João presidente e Maria tesoureira&quot; ≠ &quot;Maria presidente e João
          tesoureira&quot;, é arranjo. Se &quot;comissão formada por João e Maria&quot; = &quot;comissão
          formada por Maria e João&quot;, é combinação.
        </Callout>
      </Section>

      <Section title="Permutações com repetição e partições">
        <p>
          Quando há elementos <strong>repetidos</strong>, divida pelos fatoriais das repetições. As
          permutações distintas da palavra ARARA (5 letras: 3 A e 2 R):
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          5! / (3!·2!) = 120 / (6·2) = 10
        </div>

        <p>
          A lógica é a mesma da combinação: trocar dois A entre si não gera palavra nova, então você
          contou cada palavra 3!·2! vezes a mais.
        </p>

        <p>
          O caso geral, de dividir n objetos em grupos de tamanhos r₁, r₂, …, r<sub>k</sub>:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            n! / (r₁! · r₂! · ... · r<sub>k</sub>!)
          </div>
        </div>
      </Section>

      <Section title="Onde isso vira probabilidade">
        <p>
          Contagem não é um assunto solto: ela alimenta a definição clássica de probabilidade, que é o
          próximo tópico. Num espaço amostral com resultados <strong>igualmente prováveis</strong>:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A) = casos favoráveis / casos possíveis
          </div>
        </div>

        <p>
          Exemplo do capítulo — a probabilidade de receber 3 ases numa mão de pôquer de 5 cartas. O
          denominador é C(52, 5) = 2.598.960 mãos possíveis. O numerador é C(4, 3) × C(48, 2) = 4 × 1.128
          = 4.512: escolher 3 dos 4 ases <em>e</em> 2 das 48 cartas restantes. Logo P ≈ 0,0017.
        </p>

        <Callout tipo="info">
          Note as duas operações trabalhando juntas: <strong>combinação</strong> para escolher cada grupo
          (a ordem em que as cartas chegam na mão não importa), e <strong>multiplicação</strong> para
          juntar as duas escolhas. Esse padrão — C(...) × C(...) sobre C(...) — resolve a maior parte dos
          exercícios da Seção 2.4.
        </Callout>

        <Checkpoint>
          Você multiplica etapas e soma alternativas, decide entre arranjo e combinação pela pergunta da
          ordem, trata repetições dividindo por fatoriais e usa contagem para montar P(A) = favoráveis /
          possíveis.
        </Checkpoint>
      </Section>
    </article>
  );
}
