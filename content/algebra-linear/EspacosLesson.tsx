import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Espaços Vetoriais. */
export function EspacosLesson() {
  return (
    <article className="space-y-10">
      <Section title="A jogada da abstração">
        <p>
          Até aqui, vetor era &quot;seta no plano&quot;. Agora vem o pulo conceitual que assusta
          muita gente — mas que é mais simples do que parece.
        </p>
        <p>
          Os matemáticos perceberam que várias coisas <em>diferentes</em> obedecem às mesmíssimas
          regras dos vetores. Setas no plano, listas de números, polinômios, matrizes, até funções:
          em todas elas você consegue somar dois elementos e multiplicar por um escalar, e o
          resultado continua sendo do mesmo tipo.
        </p>
        <p>
          Então, em vez de reprovar tudo separadamente, criaram um nome coletivo:{' '}
          <strong>espaço vetorial</strong> é qualquer conjunto onde essas duas operações funcionam
          direito. E o lucro é enorme — todo teorema demonstrado para espaços vetoriais vale
          automaticamente para <em>todos</em> esses casos de uma vez.
        </p>

        <Callout tipo="info">
          A ideia central em uma frase: <strong>&quot;vetor&quot; não é uma coisa, é um papel.</strong>{' '}
          Se um objeto pode ser somado com outro do mesmo tipo e multiplicado por escalar mantendo o
          tipo, ele está fazendo papel de vetor.
        </Callout>
      </Section>

      <Section title="Exemplos que são espaços vetoriais">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              t: 'R² e R³',
              d: 'Os planos e o espaço com que você já trabalhou. O caso familiar.',
            },
            {
              t: 'Rⁿ',
              d: 'Listas de n números. Um embedding de 512 dimensões vive em R⁵¹². Impossível desenhar, mas as regras são idênticas.',
            },
            {
              t: 'Matrizes m×n',
              d: 'Somar duas matrizes 2×3 dá outra 2×3; multiplicar por escalar também. Logo, formam um espaço vetorial.',
            },
            {
              t: 'Polinômios',
              d: 'Somar dois polinômios de grau ≤ 2 dá outro de grau ≤ 2. Multiplicar por escalar idem. É espaço vetorial.',
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">{x.t}</div>
              <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{x.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Subespaço: um espaço dentro do espaço">
        <p>
          Um <strong>subespaço</strong> é um pedaço de um espaço vetorial que, sozinho, também é um
          espaço vetorial. Nem todo pedaço serve — ele precisa passar em três testes:
        </p>

        <div className="space-y-3">
          {[
            {
              n: '1',
              t: 'Contém o vetor nulo',
              d: 'A origem tem que estar lá dentro. Este é o teste mais rápido: se o zero não pertence ao conjunto, já não é subespaço, nem precisa checar o resto.',
            },
            {
              n: '2',
              t: 'Fechado para soma',
              d: 'Pegou dois elementos do subespaço e somou? O resultado tem que continuar dentro dele.',
            },
            {
              n: '3',
              t: 'Fechado para multiplicação por escalar',
              d: 'Multiplicou um elemento por qualquer número? O resultado tem que continuar dentro.',
            },
          ].map((x) => (
            <div
              key={x.n}
              className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-sm font-bold text-white">
                {x.n}
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">{x.t}</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{x.d}</div>
              </div>
            </div>
          ))}
        </div>

        <p>
          Traduzindo para a geometria de R²: uma <strong>reta que passa pela origem</strong> é
          subespaço (soma de dois pontos da reta continua na reta; esticar também). Já uma{' '}
          <strong>reta deslocada</strong>, que não passa pela origem, NÃO é — ela falha logo no
          primeiro teste.
        </p>

        <Callout tipo="prova">
          Em prova, sempre comece pelo teste do vetor nulo — ele elimina a maioria dos candidatos em
          dois segundos. Exemplo: o conjunto de vetores (x, y) com x + y = 1 não é subespaço, porque
          (0,0) daria 0 + 0 = 0 ≠ 1. Já x + y = 0 é subespaço, porque a origem satisfaz.
        </Callout>

        <Callout tipo="ia">
          Redução de dimensionalidade (PCA) é achar o subespaço de menor dimensão que ainda preserva
          a maior parte da informação dos dados. Quando alguém diz que &quot;reduziu 512 dimensões
          para 50&quot;, projetou os dados num subespaço de dimensão 50 — usando exatamente as
          projeções do bloco anterior.
        </Callout>

        <Checkpoint>
          Você entende que espaço vetorial é uma estrutura definida por regras, não por desenhos, e
          sabe testar se um conjunto é subespaço pelos três critérios (nulo, soma, escalar).
        </Checkpoint>
      </Section>
    </article>
  );
}
