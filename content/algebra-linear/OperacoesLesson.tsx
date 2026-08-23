import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { StepByStepSolver } from '@/components/interactive/StepByStepSolver';
import { MatrixGrid } from '@/components/math/MatrixGrid';
import { matrixAdditionSteps, matrixMultiplicationSteps } from '@/lib/math/steps';

/** Aula: Operações Matriciais. */
export function OperacoesLesson() {
  const passosSoma = matrixAdditionSteps(
    [
      [2, 5],
      [7, 1],
    ],
    [
      [3, 4],
      [0, 6],
    ]
  );

  const passosMult = matrixMultiplicationSteps(
    [
      [1, 2, 3],
      [4, 5, 6],
    ],
    [
      [7, 8],
      [9, 1],
      [2, 3],
    ]
  );

  return (
    <article className="space-y-10">
      <Section title="A ideia geral">
        <p>
          Você já sabe o que é uma matriz. Agora vem a parte que dá poder a elas:{' '}
          <strong>fazer contas com tabelas inteiras de uma vez só</strong>.
        </p>
        <p>
          São três operações neste tópico, em ordem crescente de dificuldade: multiplicar por um
          número (trivial), somar duas matrizes (fácil) e multiplicar duas matrizes (a única que
          exige atenção de verdade — e a mais importante do curso).
        </p>
      </Section>

      {/* Escalar */}
      <Section title="1. Multiplicação por escalar">
        <p>
          &quot;Escalar&quot; é só o nome chique para <em>um número comum</em> (não-matriz). Multiplicar
          uma matriz por um escalar significa multiplicar <strong>cada elemento</strong> dela por
          esse número. Sem mistério, sem regra escondida.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 py-2">
          <span className="text-2xl font-bold">3 ×</span>
          <MatrixGrid
            data={[
              [2, 5],
              [1, 4],
            ]}
            label="A"
          />
          <span className="text-2xl font-bold">=</span>
          <MatrixGrid
            data={[
              [6, 15],
              [3, 12],
            ]}
            label="3A"
          />
        </div>

        <p>
          Cada número foi multiplicado por 3: 2→6, 5→15, 1→3, 4→12. A dimensão não muda.
        </p>

        <Callout tipo="info">
          Multiplicar por escalar é o que acontece quando você ajusta a &quot;intensidade&quot; de
          algo sem mudar sua estrutura. Em processamento de imagem, multiplicar a matriz de pixels
          por 1,5 clareia a imagem inteira — a forma continua igual, só a intensidade muda.
        </Callout>
      </Section>

      {/* Soma */}
      <Section title="2. Soma de matrizes">
        <p>
          Some posição com posição. O elemento da linha 1, coluna 1 de A soma com o da linha 1,
          coluna 1 de B. E assim por diante.
        </p>
        <p>
          <strong>A única regra:</strong> as duas matrizes precisam ter EXATAMENTE a mesma
          dimensão. Uma 2×3 não soma com uma 3×2 — não existe &quot;jeitinho&quot;, a operação
          simplesmente não está definida.
        </p>

        <StepByStepSolver
          steps={passosSoma}
          title="Somando duas matrizes 2×2, posição por posição"
          resultLabel="A + B"
        />

        <Callout tipo="atencao">
          Se numa prova aparecer uma soma de matrizes com dimensões diferentes, a resposta correta
          é &quot;não existe / não está definida&quot; — e não tentar forçar uma conta. Questões
          assim são armadilha proposital para ver se você checou as dimensões antes de calcular.
        </Callout>
      </Section>

      {/* Multiplicação */}
      <Section title="3. Multiplicação de matrizes (a importante)">
        <p>
          Aqui está o conceito que sustenta praticamente toda a Álgebra Linear aplicada — e o que
          mais confunde no início, porque <strong>não é</strong> &quot;multiplica posição com
          posição&quot;. É outra coisa.
        </p>

        <p className="font-semibold text-gray-900 dark:text-gray-100">
          A regra em uma frase: cada posição do resultado é uma LINHA de A combinada com uma COLUNA
          de B — multiplicando termo a termo e somando tudo.
        </p>

        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4">
          <p className="mb-2 font-semibold text-gray-900 dark:text-gray-100">
            Antes de calcular, cheque se dá para multiplicar:
          </p>
          <p className="font-mono text-sm">
            A<sub>(m×<strong className="text-red-500">n</strong>)</sub> · B
            <sub>(<strong className="text-red-500">n</strong>×p)</sub> = C<sub>(m×p)</sub>
          </p>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Os dois números do meio (em vermelho) <strong>têm que ser iguais</strong>. Se forem, a
            multiplicação existe e o resultado tem as linhas de A e as colunas de B. Se não forem,
            a operação não está definida.
          </p>
        </div>

        <p>
          Veja acontecendo. Cada passo abaixo calcula UMA posição do resultado, mostrando quais
          números foram multiplicados e somados:
        </p>

        <StepByStepSolver
          steps={passosMult}
          title="Multiplicando uma matriz 2×3 por uma 3×2"
          resultLabel="A · B"
        />

        <Callout tipo="atencao">
          <strong>A · B ≠ B · A.</strong> Diferente dos números, a ordem importa na multiplicação
          de matrizes. Trocar a ordem pode dar outro resultado — ou nem existir, se as dimensões
          não encaixarem mais. Nunca &quot;reorganize&quot; um produto de matrizes por reflexo.
        </Callout>

        <Callout tipo="ia">
          Uma camada de rede neural é literalmente isto: multiplicação de matrizes. Os dados de
          entrada formam uma matriz, os pesos aprendidos formam outra, e a saída da camada é o
          produto das duas. Quando se fala que treinar IA exige GPU, é porque a GPU faz milhões
          dessas multiplicações por segundo. O que você está aprendendo aqui é o núcleo do seu curso.
        </Callout>

        <Checkpoint>
          Você sabe multiplicar por escalar, somar matrizes (checando dimensões antes) e multiplicar
          matrizes usando linha × coluna. Com isso mais o tópico anterior, você já tem metade do
          conteúdo cobrado na Parte 1 do Projeto Integrador.
        </Checkpoint>
      </Section>
    </article>
  );
}
