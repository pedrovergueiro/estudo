import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DeterminantExplorer } from '@/components/interactive/DeterminantExplorer';

/** Aula: Determinante por cofatores. */
export function DeterminantesLesson() {
  return (
    <article className="space-y-10">
      <Section title="O que o determinante responde">
        <p>
          O determinante é um <strong>número</strong> associado a uma matriz <strong>quadrada</strong>.
          Não existe determinante de matriz 2×3. E ele responde, de uma vez, a pergunta que atravessa
          todo o primeiro bloco da disciplina:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/40 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold text-orange-900 dark:text-orange-100">
              det(A) ≠ 0 ⟺ A é invertível ⟺ AX = B tem solução única
            </div>
          </div>
        </div>

        <p>
          Quando det(A) = 0, a matriz é chamada <strong>singular</strong>: não tem inversa, e o sistema
          ou é impossível ou tem infinitas soluções. Um único número decide tudo isso.
        </p>

        <Callout tipo="info">
          Geometricamente, o determinante mede <strong>quanto a matriz estica ou encolhe área
          (2×2) ou volume (3×3)</strong>. Determinante zero significa que a transformação achata tudo
          numa dimensão menor — e achatar não tem volta, por isso não há inversa.
        </Callout>
      </Section>

      <Section title="2×2: a fórmula que você decora">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="mb-2 whitespace-pre font-mono text-sm">{`| a  b |
| c  d |`}</div>
            <div className="font-mono text-lg font-bold">det = ad − bc</div>
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>| 3 1 ; 2 4 | → (3)(4) − (1)(2) = 12 − 2 = 10</div>
          <div>| 2 6 ; 1 3 | → (2)(3) − (6)(1) = 6 − 6 = 0 → singular</div>
        </div>

        <Callout tipo="atencao">
          É <strong>diagonal principal menos diagonal secundária</strong>, nessa ordem. Inverter dá o
          sinal trocado, e um determinante com sinal errado leva a inversa errada, Cramer errado e
          classificação errada. Vale conferir duas vezes.
        </Callout>
      </Section>

      <Section title="3×3: menor complementar e cofator">
        <p>Dois nomes que a prova usa e que confundem se você não separar:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Menor complementar D<sub>ij</sub>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              O determinante da matriz que sobra quando você <strong>apaga a linha i e a coluna j</strong>.
              Sem sinal nenhum.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Cofator A<sub>ij</sub>
            </div>
            <div className="my-1 font-mono text-sm">A<sub>ij</sub> = (−1)<sup>i+j</sup> · D<sub>ij</sub></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              É o menor <strong>com o sinal do tabuleiro</strong>.
            </p>
          </div>
        </div>

        <p>
          O <strong>teorema de Laplace</strong> diz que, escolhida qualquer linha ou qualquer coluna, o
          determinante é a soma dos elementos daquela fila multiplicados pelos seus cofatores:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            det(A) = a<sub>i1</sub>A<sub>i1</sub> + a<sub>i2</sub>A<sub>i2</sub> + a<sub>i3</sub>A<sub>i3</sub>
          </div>
        </div>

        <DeterminantExplorer />

        <Callout tipo="prova">
          <strong>Escolha sempre a fila com mais zeros.</strong> Cada zero elimina um determinante 2×2
          inteiro da conta, porque o termo está multiplicado por zero. Numa matriz com dois zeros numa
          linha, você faz <em>um</em> cálculo em vez de três. Esse é o único truque que importa aqui, e
          ele economiza minutos de prova.
        </Callout>
      </Section>

      <Section title="Sarrus: o atalho que só vale para 3×3">
        <p>
          A regra de Sarrus repete as duas primeiras colunas ao lado da matriz e soma as três diagonais
          descendentes, subtraindo as três ascendentes:
        </p>

        <div className="overflow-x-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="whitespace-pre">{`| a  b  c | a  b
| d  e  f | d  e
| g  h  i | g  h

det = aei + bfg + cdh − ceg − afh − bdi`}</div>
        </div>

        <Callout tipo="atencao">
          Sarrus <strong>só funciona em 3×3</strong>. Não existe Sarrus para 4×4 — tentar estender a
          regra é um erro clássico e dá resposta errada. Para 4×4 ou maior, o caminho é Laplace
          (escolhendo a melhor fila) ou escalonamento. Laplace, por outro lado, funciona em qualquer
          tamanho.
        </Callout>

        <Checkpoint>
          Você calcula determinante 2×2 pela fórmula ad − bc, distingue menor complementar de cofator,
          aplica Laplace por qualquer linha ou coluna escolhendo a que tem mais zeros, e sabe que Sarrus
          é um atalho exclusivo do 3×3. A seguir, as propriedades que evitam calcular determinante à
          força.
        </Checkpoint>
      </Section>
    </article>
  );
}
