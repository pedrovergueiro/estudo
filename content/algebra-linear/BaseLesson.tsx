import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { CombinationExplorer } from '@/components/interactive/CombinationExplorer';

/** Aula: Base e Dimensão. */
export function BaseLesson() {
  return (
    <article className="space-y-10">
      <Section title="Base: o conjunto perfeito de ingredientes">
        <p>
          Uma <strong>base</strong> de um espaço vetorial é um conjunto de vetores que cumpre duas
          exigências ao mesmo tempo:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
            <div className="text-sm font-bold text-blue-900 dark:text-blue-100">
              1. Gera o espaço todo
            </div>
            <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">
              Combinando esses vetores você alcança qualquer elemento do espaço. Nada fica de fora —
              ingredientes <em>suficientes</em>.
            </p>
          </div>
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
              2. São linearmente independentes
            </div>
            <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
              Nenhum é redundante. Tirar qualquer um quebra a primeira condição — ingredientes{' '}
              <em>sem sobra</em>.
            </p>
          </div>
        </div>

        <p>
          Em resumo: base é o conjunto <strong>mínimo</strong> que ainda dá conta de tudo. Nem
          faltando peça, nem com peça sobrando.
        </p>

        <CombinationExplorer />

        <p>
          No interativo acima, os &quot;vetores independentes&quot; formam uma base de R² — com eles
          você chega a qualquer ponto do plano. Os &quot;dependentes&quot; não formam base: por mais
          que você mexa, fica preso numa reta.
        </p>
      </Section>

      <Section title="Dimensão: quantos vetores a base tem">
        <p>
          A <strong>dimensão</strong> de um espaço vetorial é simplesmente o número de vetores de
          qualquer base dele.
        </p>
        <p>
          O detalhe importante — e não óbvio — é que <strong>todas</strong> as bases de um mesmo
          espaço têm exatamente a mesma quantidade de vetores. Você pode escolher bases muito
          diferentes para R², mas toda base de R² terá 2 vetores. Nunca 1, nunca 3. É isso que faz
          &quot;dimensão&quot; ser um conceito bem definido.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { e: 'R²', d: '2', ex: 'base canônica: (1,0) e (0,1)' },
            { e: 'R³', d: '3', ex: 'base canônica: (1,0,0), (0,1,0), (0,0,1)' },
            { e: 'Rⁿ', d: 'n', ex: 'n vetores canônicos' },
            { e: 'Matrizes 2×2', d: '4', ex: 'as 4 matrizes com um único 1 e o resto 0' },
          ].map((x) => (
            <div
              key={x.e}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-center"
            >
              <div className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                {x.e}
              </div>
              <div className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                dim = {x.d}
              </div>
              <div className="mt-1 text-[11px] leading-tight text-gray-500 dark:text-gray-400">
                {x.ex}
              </div>
            </div>
          ))}
        </div>

        <Callout tipo="info">
          Observe o caso das matrizes 2×2: dimensão 4, embora ninguém consiga desenhar isso. É a
          prova de que dimensão não é sobre o que enxergamos — é sobre quantos números independentes
          você precisa para especificar um elemento. Uma matriz 2×2 precisa de 4 números, então
          dimensão 4.
        </Callout>
      </Section>

      <Section title="O atalho que economiza tempo em prova">
        <p>
          Se você <strong>já sabe</strong> a dimensão do espaço, não precisa verificar as duas
          condições de base. Basta uma:
        </p>

        <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-5">
          <p className="text-[15px] leading-relaxed text-amber-900 dark:text-amber-100">
            Se um conjunto tem <strong>exatamente n vetores</strong> num espaço de dimensão{' '}
            <strong>n</strong>, então: <em>ser independente</em> ⟺ <em>gerar o espaço</em> ⟺{' '}
            <em>ser base</em>. As três condições viram equivalentes.
          </p>
        </div>

        <p>
          Na prática: para checar se 3 vetores formam base de R³, teste só a independência linear.
          Se passarem, são base automaticamente — não precisa provar que geram o espaço.
        </p>

        <Callout tipo="prova">
          Contagem que resolve questões de cara:
          <br />• <strong>Menos de n vetores</strong> em espaço de dimensão n → nunca geram o espaço, não são base.
          <br />• <strong>Mais de n vetores</strong> → obrigatoriamente dependentes, não são base.
          <br />• <strong>Exatamente n</strong> → pode ser base; teste independência para confirmar.
        </Callout>

        <Callout tipo="ia">
          Quando se fala que um embedding &quot;tem 512 dimensões&quot;, é literalmente isto: o
          espaço tem uma base com 512 vetores, e cada palavra precisa de 512 números para ser
          localizada nele. E a redução de dimensionalidade busca uma base menor que ainda descreva
          bem os dados.
        </Callout>

        <Checkpoint>
          Você sabe o que caracteriza uma base (gera + independente), o que é dimensão, e o atalho
          de contagem que resolve boa parte das questões sem cálculo pesado.
        </Checkpoint>
      </Section>
    </article>
  );
}
