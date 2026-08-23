import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { NumberLineExplorer } from '@/components/interactive/NumberLineExplorer';

/** Aula: Números negativos e regra de sinais. */
export function SinaisLesson() {
  return (
    <article className="space-y-10">
      <Section title="Negativo é direção, não é número esquisito">
        <p>
          Número negativo não é uma categoria bizarra de número. É a mesma reta numérica, só que
          para o outro lado do zero.
        </p>
        <p>
          A analogia que funciona: <strong>dinheiro</strong>. Positivo é o que você tem, negativo é
          o que você deve. −5 não é &quot;menos que nada&quot;, é &quot;devendo 5&quot;. E devendo
          5, se alguém perdoar a dívida, você sobe.
        </p>

        <NumberLineExplorer />
      </Section>

      <Section title="Soma e subtração">
        <p>Lendo na reta numérica, tudo vira movimento:</p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">Conta</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                  Como ler
                </th>
                <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                  Resultado
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['5 + 3', 'tem 5, ganha 3', '8'],
                ['5 − 3', 'tem 5, perde 3', '2'],
                ['5 + (−3)', 'tem 5, ganha uma dívida de 3 → mesma coisa que perder 3', '2'],
                ['5 − (−3)', 'tem 5, perde uma dívida de 3 → a dívida sumiu, você subiu', '8'],
                ['−5 + 3', 'deve 5, paga 3 → ainda deve 2', '−2'],
                ['−5 − 3', 'deve 5, se endivida mais 3', '−8'],
              ].map(([c, l, r]) => (
                <tr key={c}>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 font-mono font-bold">
                    {c}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 text-gray-700 dark:text-gray-300">
                    {l}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 font-mono font-bold">
                    {r}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout tipo="atencao">
          A linha que derruba mais gente é <span className="font-mono">5 − (−3) = 8</span>. Dois
          sinais de menos grudados viram mais. Se ajudar, pense assim: tirar uma dívida é a mesma
          coisa que ganhar dinheiro.
        </Callout>
      </Section>

      <Section title="Multiplicação e divisão: a regra que resolve tudo">
        <p>
          Aqui é ainda mais simples, porque existe uma regra única que vale para multiplicação{' '}
          <em>e</em> divisão:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-5 text-center">
            <div className="text-lg font-bold text-emerald-900 dark:text-emerald-100">
              Sinais IGUAIS → positivo
            </div>
            <div className="mt-2 space-y-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              <div>(+3) × (+4) = +12</div>
              <div>(−3) × (−4) = +12</div>
            </div>
          </div>
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-5 text-center">
            <div className="text-lg font-bold text-red-900 dark:text-red-100">
              Sinais DIFERENTES → negativo
            </div>
            <div className="mt-2 space-y-1 font-mono text-sm text-red-900 dark:text-red-100">
              <div>(+3) × (−4) = −12</div>
              <div>(−3) × (+4) = −12</div>
            </div>
          </div>
        </div>

        <Callout tipo="atencao" titulo="Cuidado: a regra é DIFERENTE na soma">
          Este é o ponto onde as duas regras se misturam na cabeça e geram erro:
          <br />• <span className="font-mono">(−2) × (−5) = +10</span> → multiplicação, sinais
          iguais dão positivo
          <br />• <span className="font-mono">(−2) + (−5) = −7</span> → soma, dois negativos afundam
          mais
          <br />
          Não existe &quot;menos com menos dá mais&quot; na soma. Essa frase só vale para
          multiplicação, divisão, e para o caso de subtrair um negativo.
        </Callout>
      </Section>

      <Section title="Como parar de errar sinal em conta longa">
        <p>
          Sinal trocado raramente vem de não saber a regra — vem de pressa e de conta escrita
          apertada. Três hábitos que resolvem a maior parte:
        </p>

        <div className="space-y-3">
          {[
            {
              n: '1',
              t: 'Use parênteses sempre que houver negativo',
              d: 'Escreva 5 − (−3), nunca 5 − −3. O parêntese força seu olho a ver os dois sinais separados.',
            },
            {
              n: '2',
              t: 'Resolva o sinal ANTES de multiplicar',
              d: 'Em (−3) × (−4): primeiro decida "sinais iguais → positivo", depois faça 3×4 = 12. Separar as duas decisões evita esquecer uma delas no meio.',
            },
            {
              n: '3',
              t: 'Confira substituindo',
              d: 'Achou x = 3? Volte na equação original e substitua. Se der certo, o sinal estava certo. Leva 20 segundos e pega quase todo erro.',
            },
          ].map((x) => (
            <div
              key={x.n}
              className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-bold text-white">
                {x.n}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{x.t}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{x.d}</div>
              </div>
            </div>
          ))}
        </div>

        <Callout tipo="prova" titulo="Onde isso aparece no seu semestre">
          Em GAAL, produto escalar com componentes negativas — tipo (3)(−4) + (2)(6) = −12 + 12 = 0
          — é exatamente o teste de ortogonalidade. Um sinal trocado ali muda a resposta de
          &quot;são perpendiculares&quot; para &quot;não são&quot;. Em Cálculo, derivada de função
          composta acumula sinais em cadeia; um erro no meio propaga até o fim.
        </Callout>

        <Checkpoint>
          Você sabe ler negativos na reta numérica, sabe que menos-com-menos vira mais na
          multiplicação (e por que isso NÃO vale na soma), e tem três hábitos concretos para não
          errar sinal em conta comprida.
        </Checkpoint>
      </Section>
    </article>
  );
}
