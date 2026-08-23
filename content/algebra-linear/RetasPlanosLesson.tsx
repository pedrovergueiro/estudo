import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { LineExplorer } from '@/components/interactive/LineExplorer';

/** Aula: Retas e Planos no Espaço. */
export function RetasPlanosLesson() {
  return (
    <article className="space-y-10">
      <Section title="A reta descrita por vetores">
        <p>
          No ensino médio você aprendeu reta como <span className="font-mono">y = ax + b</span>.
          Funciona no plano, mas quebra no espaço 3D — e nem consegue descrever uma reta vertical
          (o coeficiente angular seria infinito).
        </p>
        <p>
          A Álgebra Linear usa uma descrição melhor. Toda reta precisa de duas informações:
        </p>
        <ul className="list-disc space-y-1 pl-6">
          <li>
            um <strong>ponto</strong> P por onde ela passa;
          </li>
          <li>
            um <strong>vetor direção</strong> v, dizendo para onde ela aponta.
          </li>
        </ul>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            (x, y, z) = P + t · v
          </div>
        </div>

        <p>
          O <strong>t</strong> é o parâmetro: cada valor dele entrega um ponto diferente da reta.
          Mexa no controle e veja:
        </p>

        <LineExplorer />

        <Callout tipo="info">
          A grande vantagem: essa forma funciona igual em 2D, 3D ou 100 dimensões. Só cresce a
          quantidade de componentes — a estrutura P + t·v não muda nunca.
        </Callout>

        <p>
          Essa mesma reta se escreve de <strong>três formas</strong>, e a prova pede pelo nome. Para
          P = (1, 2, 3) e v = (2, −1, 4):
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Vetorial</div>
            <div className="font-mono text-sm">(x, y, z) = (1, 2, 3) + t(2, −1, 4)</div>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Paramétrica</div>
            <div className="font-mono text-sm">x = 1 + 2t · y = 2 − t · z = 3 + 4t</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              É a vetorial escrita coordenada por coordenada.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Simétrica</div>
            <div className="font-mono text-sm">(x − 1)/2 = (y − 2)/(−1) = (z − 3)/4</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Obtida isolando o t em cada equação paramétrica e igualando tudo.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          A forma simétrica <strong>só existe se nenhuma componente do vetor direção for zero</strong> —
          senão você dividiria por zero. Se, por exemplo, v = (2, 0, 4), a coordenada y fica presa em
          y = 2, e a reta se escreve como (x − 1)/2 = (z − 3)/4, com y = 2 anotado à parte. Esse caso
          especial é pegadinha frequente.
        </Callout>
      </Section>

      <Section title="O plano e o vetor normal">
        <p>
          Um plano em R³ é descrito de forma ainda mais elegante, usando produto escalar. A ideia:
          escolha um vetor <strong>n</strong> perpendicular ao plano (chamado <strong>vetor
          normal</strong>) e um ponto P₀ do plano. Então:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            n · (P − P₀) = 0
          </div>
        </div>

        <p>
          Lendo em português: &quot;um ponto P está no plano quando o vetor que vai de P₀ até P é
          perpendicular à normal&quot;. E perpendicular, você já sabe, é produto escalar zero.
        </p>
        <p>
          Expandindo essa expressão, chega-se à forma que aparece nos livros:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            ax + by + cz = d
          </div>
        </div>

        <Callout tipo="prova">
          Sacada que economiza muito tempo: numa equação <span className="font-mono">ax + by + cz
          = d</span>, os coeficientes <strong>(a, b, c) são exatamente o vetor normal</strong> do
          plano. Ler a normal direto da equação, sem calcular nada, resolve várias questões de
          paralelismo e perpendicularidade na hora.
        </Callout>
      </Section>

      <Section title="Posições relativas">
        <p>
          As perguntas típicas do bloco — duas retas se cruzam? uma reta é paralela a um plano? —
          se resolvem todas com produto escalar e vetores diretores:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              t: 'Retas paralelas',
              d: 'Os vetores direção são múltiplos um do outro (v₂ = k·v₁). Apontam para a mesma direção.',
            },
            {
              t: 'Retas perpendiculares',
              d: 'Produto escalar entre os vetores direção é zero: v₁ · v₂ = 0.',
            },
            {
              t: 'Planos paralelos',
              d: 'As normais são múltiplas uma da outra. Se as normais são paralelas, os planos também são.',
            },
            {
              t: 'Reta paralela a um plano',
              d: 'O vetor direção da reta é perpendicular à normal do plano: v · n = 0. Parece contraintuitivo, mas faz sentido: se v é perpendicular à normal, então v "deita" na direção do plano.',
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

        <Callout tipo="ia">
          Em computação gráfica e visão computacional, o vetor normal é o que determina iluminação:
          o brilho de uma superfície vem do produto escalar entre a normal e a direção da luz — o
          mesmo produto escalar que você aprendeu comparando embeddings. A ferramenta é a mesma; só
          muda o que os vetores representam.
        </Callout>

        <Checkpoint>
          Você sabe descrever retas na forma paramétrica P + t·v, entender planos pelo vetor normal
          e resolver questões de posição relativa com produto escalar. Isso abre o bloco do Projeto
          Final.
        </Checkpoint>
      </Section>
    </article>
  );
}
