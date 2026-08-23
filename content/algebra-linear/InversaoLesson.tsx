import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { StepByStepSolver } from '@/components/interactive/StepByStepSolver';
import { MatrixGrid } from '@/components/math/MatrixGrid';
import { inversaSteps } from '@/lib/math/gauss';

/** Aula: Inversão de Matrizes. */
export function InversaoLesson() {
  const invertivel = inversaSteps([
    [2, 1],
    [5, 3],
  ]);

  const singular = inversaSteps([
    [1, 2],
    [2, 4],
  ]);

  return (
    <article className="space-y-10">
      <Section title="A ideia: o que é uma matriz inversa">
        <p>
          Com números, todo mundo entende: o inverso de 5 é 1/5, porque 5 × (1/5) = 1. O inverso
          desfaz a multiplicação.
        </p>
        <p>
          Com matrizes é a mesma lógica. A <strong>inversa de A</strong>, escrita{' '}
          <span className="font-mono">A⁻¹</span>, é a matriz que satisfaz:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-xl font-bold">
            A · A⁻¹ = I
          </div>
        </div>

        <p>
          Onde I é a matriz identidade — o &quot;número 1&quot; do mundo das matrizes. Multiplicar
          por A⁻¹ desfaz o efeito de multiplicar por A.
        </p>

        <Callout tipo="atencao">
          Duas diferenças cruciais em relação aos números:
          <br />• <strong>Só matrizes QUADRADAS podem ter inversa.</strong> Uma 2×3 nunca terá.
          <br />• <strong>Nem toda matriz quadrada tem inversa.</strong> Assim como o número 0 não
          tem inverso, existem matrizes &quot;singulares&quot; que simplesmente não são invertíveis.
          Você vai ver um exemplo disso mais abaixo.
        </Callout>
      </Section>

      <Section title="O método: Gauss-Jordan">
        <p>
          O truque é bonito. Você cola a identidade do lado direito de A, formando{' '}
          <span className="font-mono">[A | I]</span>, e aplica operações de linha até o lado
          esquerdo virar a identidade. O que sobrar do lado direito <em>é</em> a inversa:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            [A | I] → operações de linha → [I | A⁻¹]
          </div>
        </div>

        <p>
          A diferença para o escalonamento do tópico anterior: no Gauss simples você para na forma
          triangular (zeros só abaixo da diagonal). No <strong>Gauss-Jordan</strong> você continua e
          zera também acima da diagonal, até sobrar a identidade limpa.
        </p>

        <StepByStepSolver
          steps={invertivel.steps}
          title="Invertendo uma matriz 2×2 — acompanhe os dois lados"
          resultLabel="[A | I] → [I | A⁻¹]"
        />

        <Callout tipo="info">
          <strong>Sempre confira no final.</strong> Multiplique A pela inversa que você encontrou:
          se der a identidade, acertou. Inverter matriz tem muitas contas e é fácil errar um sinal —
          essa verificação leva 30 segundos e salva a questão.
        </Callout>
      </Section>

      <Section title="Quando a inversa NÃO existe">
        <p>
          Nem toda matriz quadrada é invertível. Quando uma linha é apenas um múltiplo da outra
          (ou seja, não traz informação nova), o método trava. Veja acontecendo:
        </p>

        <div className="flex justify-center py-2">
          <MatrixGrid
            data={[
              [1, 2],
              [2, 4],
            ]}
            label="Matriz singular"
            highlight={{ rows: [1] }}
          />
        </div>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          A segunda linha é exatamente a primeira multiplicada por 2 — ela é redundante.
        </p>

        <StepByStepSolver
          steps={singular.steps}
          title="Tentando inverter uma matriz singular"
          resultLabel="[A | I]"
        />

        <Callout tipo="prova">
          Três formas equivalentes de dizer a mesma coisa — se uma vale, todas valem:
          <br />• A matriz <strong>não tem inversa</strong>
          <br />• O <strong>determinante é zero</strong>
          <br />• As <strong>linhas são linearmente dependentes</strong> (uma é combinação das outras)
          <br />
          Questões de prova adoram misturar esses três enunciados. Reconhecer que são a mesma
          condição economiza muito tempo.
        </Callout>
      </Section>

      <Section title="Para que serve na prática">
        <p>
          A aplicação mais direta: resolver sistemas. Se você escreve um sistema na forma{' '}
          <span className="font-mono">A·x = b</span>, então multiplicando os dois lados por A⁻¹
          você isola o x:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            x = A⁻¹ · b
          </div>
        </div>

        <p>
          É a versão matricial de &quot;dividir dos dois lados&quot; que você fazia no ensino médio
          para resolver 5x = 10.
        </p>

        <Callout tipo="ia">
          Em IA, a inversa aparece na solução fechada da regressão linear (a famosa fórmula
          &quot;normal equation&quot;: β = (XᵀX)⁻¹Xᵀy). Na prática, bibliotecas evitam calcular a
          inversa explicitamente — é caro e numericamente instável — e resolvem o sistema direto.
          Mas entender a inversa é o que permite ler e interpretar essa fórmula.
        </Callout>

        <Checkpoint>
          Você fecha aqui o bloco <strong>Parte 1</strong> do Projeto Integrador: matrizes,
          operações matriciais, sistemas lineares e inversão. É exatamente o conteúdo que a entrega
          de 17/09 cobra. Se você resolveu os exercícios dos quatro tópicos, está pronto para o
          notebook da Parte 1.
        </Checkpoint>
      </Section>
    </article>
  );
}
