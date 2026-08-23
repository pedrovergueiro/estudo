import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Propriedades do determinante, Cramer e cálculo por escalonamento. */
export function PropriedadesDetLesson() {
  return (
    <article className="space-y-10">
      <Section title="Os quatro zeros de graça">
        <p>
          Antes de calcular qualquer coisa, olhe a matriz. Nestes quatro casos o determinante é{' '}
          <strong>zero</strong> sem nenhuma conta:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Uma linha (ou coluna) inteira de zeros.
          </div>
          <div>
            <strong>2.</strong> Duas linhas (ou colunas) <strong>iguais</strong>.
          </div>
          <div>
            <strong>3.</strong> Duas linhas (ou colunas) <strong>proporcionais</strong> — uma é múltipla
            da outra.
          </div>
          <div>
            <strong>4.</strong> Uma linha é combinação linear das outras.
          </div>
        </div>

        <Callout tipo="prova">
          Os quatro casos são a mesma coisa dita em níveis de generalidade diferentes: a matriz tem
          linhas <strong>linearmente dependentes</strong>. É por isso que det = 0 equivale a &quot;não
          invertível&quot; — e é por isso que essa propriedade reaparece inteira no bloco de
          independência linear.
        </Callout>

        <p>E o caso oposto, também de graça:</p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          Em matriz <strong>triangular</strong> (superior, inferior ou diagonal), o determinante é o{' '}
          <strong>produto da diagonal principal</strong>. Todo o resto se cancela.
          <div className="mt-2 whitespace-pre font-mono text-sm">{`| 2  7  1 |
| 0  3  5 |  →  det = 2 · 3 · 4 = 24
| 0  0  4 |`}</div>
        </div>
      </Section>

      <Section title="Como as operações elementares mexem no determinante">
        <p>
          Isto é o que permite calcular determinante <strong>por escalonamento</strong>, e cada operação
          tem um efeito diferente — confundir os três é o erro mais comum da aula:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-mono font-bold text-red-900 dark:text-red-100">L₁ ↔ L₂</div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Trocar duas linhas <strong>inverte o sinal</strong> do determinante.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-mono font-bold text-amber-900 dark:text-amber-100">L₁ ← k·L₁</div>
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Multiplicar uma linha por k <strong>multiplica o determinante por k</strong>.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-mono font-bold text-emerald-900 dark:text-emerald-100">
              L₂ ← L₂ + k·L₁
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Somar múltiplo de outra linha <strong>não altera nada</strong>. É a operação segura.
            </p>
          </div>
        </div>

        <p>
          Daí o método: escalone usando <strong>só a terceira operação</strong> até chegar a uma
          triangular, e multiplique a diagonal. Se precisar trocar linhas, conte as trocas e ajuste o
          sinal no fim. Para matrizes 4×4 ou maiores, isso é muito mais rápido que Laplace.
        </p>

        <Callout tipo="atencao">
          Cuidado com <strong>det(k·A)</strong>, onde k multiplica a matriz <em>inteira</em>. Cada uma
          das n linhas foi multiplicada por k, então:
          <div className="mt-2 text-center font-mono font-bold">det(kA) = kⁿ · det(A)</div>
          Numa 3×3, dobrar todos os elementos multiplica o determinante por 8, não por 2.
        </Callout>
      </Section>

      <Section title="As propriedades multiplicativas">
        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>det(AB) = det(A) · det(B)</div>
          <div>det(Aᵀ) = det(A)</div>
          <div>det(A⁻¹) = 1 / det(A)</div>
          <div>det(Aⁿ) = [det(A)]ⁿ</div>
        </div>

        <p>
          A primeira é surpreendentemente forte: o determinante do produto é o produto dos
          determinantes, mesmo a multiplicação de matrizes sendo complicada. Ela dá consequências
          imediatas — se AB é invertível, então A e B também são; e det(AB) = det(BA) mesmo quando
          AB ≠ BA.
        </p>

        <p>
          A segunda, det(Aᵀ) = det(A), é o que justifica poder expandir por linha{' '}
          <strong>ou</strong> por coluna: transpor troca linhas por colunas e não muda o resultado.
        </p>

        <Callout tipo="atencao">
          <strong>det(A + B) ≠ det(A) + det(B).</strong> Não existe propriedade aditiva. Essa é a
          armadilha mais cobrada do tópico — some duas matrizes identidade 2×2 e confira: det(2I) = 4,
          enquanto det(I) + det(I) = 2.
        </Callout>
      </Section>

      <Section title="Regra de Cramer — e por que ela quase não se usa">
        <p>
          Para um sistema AX = B <strong>quadrado</strong> com det(A) ≠ 0, cada incógnita sai de uma
          razão de determinantes:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              x<sub>i</sub> = det(A<sub>i</sub>) / det(A)
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              A<sub>i</sub> = a matriz A com a i-ésima coluna trocada por B
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — 2x + y = 5, x − y = 1
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>det(A) = | 2 1 ; 1 −1 | = −2 − 1 = −3</div>
            <div>det(Aₓ) = | 5 1 ; 1 −1 | = −5 − 1 = −6 → x = −6/−3 = 2</div>
            <div>det(A_y) = | 2 5 ; 1 1 | = 2 − 5 = −3 → y = −3/−3 = 1</div>
            <div className="pt-1 font-bold">solução: (2, 1) ✓ confere nas duas equações</div>
          </div>
        </div>

        <p>As limitações, que o plano de aula cita explicitamente:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Só serve para sistema quadrado</strong> — mesmo número de equações e incógnitas.
          </div>
          <div>
            <strong>Só serve se det(A) ≠ 0.</strong> Com determinante zero ela não decide nada: você não
            fica sabendo se é SPI ou SI, e precisa escalonar mesmo assim.
          </div>
          <div>
            <strong>Fica caríssima.</strong> Um sistema n×n exige n + 1 determinantes. Para 4×4 já é
            muito mais trabalhoso que Gauss-Jordan; para 10×10 é inviável.
          </div>
        </div>

        <Callout tipo="prova">
          Cramer vale a pena em dois casos: sistema 2×2 ou 3×3 pequeno, ou quando a questão pede{' '}
          <strong>uma única incógnita</strong> — aí você calcula só dois determinantes em vez de
          escalonar tudo. Fora isso, escalonamento ganha. E a comparação entre os métodos é exatamente
          o que a aula de 15/09 cobra.
        </Callout>

        <Checkpoint>
          Você identifica os casos de determinante zero na inspeção, sabe o efeito de cada operação
          elementar (troca inverte, escalar multiplica, soma não mexe), usa det(AB), det(Aᵀ) e det(kA)
          sem cair na armadilha da soma, e aplica Cramer sabendo quando ela compensa. Com isso, a
          Avaliação Teórica 1 está coberta.
        </Checkpoint>
      </Section>
    </article>
  );
}
