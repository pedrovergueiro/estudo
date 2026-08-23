import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Limites com indeterminação 0/0. */
export function LimitesAlgebricosLesson() {
  return (
    <article className="space-y-10">
      <Section title="O roteiro completo de um limite">
        <p>
          Toda questão da Parte B da lista segue o mesmo fluxo. Decore o fluxo, não os resultados:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              1. Substitua o valor
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Deu um número normal? Acabou, esse é o limite. Justifique dizendo que a função é contínua
              ali.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              2. Deu 0/0? Simplifique
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Fatore, cancele o fator comum e substitua de novo na expressão simplificada.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              3. Deu número/0 (com numerador ≠ 0)?
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Aí o limite realmente tende a ±∞ — e você tem uma assíntota vertical. Cuidado: isso é
              diferente de 0/0.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          A distinção entre <span className="font-mono">0/0</span> e{' '}
          <span className="font-mono">5/0</span> é a mais importante desta aula:
          <br />• <strong>0/0</strong> é <em>indeterminado</em>: pode dar qualquer coisa. Precisa
          simplificar para descobrir.
          <br />• <strong>5/0</strong> não é indeterminado: explode para ±∞. Não tente cancelar nada.
          <br />
          Confundir os dois faz você racionalizar sem necessidade ou parar cedo demais.
        </Callout>
      </Section>

      <Section title="Caso 1 — fatorar e cancelar">
        <p>Os exemplos direto da lista, resolvidos:</p>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-2 font-bold">lim(x→3) (x² − 9)/(x − 3)</div>
            <div>substituindo: (9 − 9)/(3 − 3) = 0/0 → indeterminado</div>
            <div>fatorando: (x − 3)(x + 3)/(x − 3) = x + 3</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-400">= 3 + 3 = 6</div>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-2 font-bold">lim(x→1/2) (4x² − 1)/(2x − 1)</div>
            <div>substituindo: (1 − 1)/(1 − 1) = 0/0</div>
            <div>4x² − 1 = (2x)² − 1² = (2x − 1)(2x + 1)</div>
            <div>= 2x + 1</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-400">= 2(1/2) + 1 = 2</div>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-2 font-bold">lim(x→2) (x² − 4x + 4)/(x − 2)</div>
            <div>substituindo: (4 − 8 + 4)/0 = 0/0</div>
            <div>x² − 4x + 4 = (x − 2)² &nbsp;&nbsp;← trinômio quadrado perfeito</div>
            <div>= (x − 2)²/(x − 2) = x − 2</div>
            <div className="font-bold text-emerald-700 dark:text-emerald-400">= 2 − 2 = 0</div>
          </div>
        </div>

        <Callout tipo="info">
          Repare no último: o limite deu <strong>zero</strong>. Isso não é &quot;não existe&quot; nem
          erro. Zero é um valor perfeitamente respeitável de limite. O que não pode é a{' '}
          <em>expressão original</em> dar 0/0 e você parar por aí.
        </Callout>

        <p>
          E o contraexemplo importante da lista:{' '}
          <span className="font-mono">lim(x→3) (x² − 9)/(x + 3)</span>. Substituindo dá (9 − 9)/(3 + 3) =
          0/6 = 0. Aqui <strong>não há indeterminação nenhuma</strong> — o denominador não zerou. Não
          fatore, não cancele: só substitua. O par (x²−9)/(x−3) e (x²−9)/(x+3) está na lista justamente
          para testar se você percebe a diferença.
        </p>
      </Section>

      <Section title="Caso 2 — racionalizar">
        <p>
          Quando há raiz, cancelar não sai direto. Multiplique em cima e embaixo pelo{' '}
          <strong>conjugado</strong>:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="mb-2 font-bold">lim(x→1) (√x − 1)/(x − 1)</div>
          <div>substituindo: (1 − 1)/(1 − 1) = 0/0</div>
          <div>multiplica por (√x + 1)/(√x + 1):</div>
          <div>= [(√x)² − 1²] / [(x − 1)(√x + 1)]</div>
          <div>= (x − 1)/[(x − 1)(√x + 1)] = 1/(√x + 1)</div>
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            = 1/(1 + 1) = 1/2
          </div>
        </div>

        <p>
          O mesmo vale para <span className="font-mono">lim(x→3) (√x − √3)/(x − 3)</span>: multiplique por
          (√x + √3), o numerador vira x − 3 e cancela, sobrando 1/(√x + √3) = 1/(2√3).
        </p>

        <Callout tipo="prova">
          O conjugado de <span className="font-mono">a − b</span> é{' '}
          <span className="font-mono">a + b</span>, e vice-versa. O objetivo é sempre criar a diferença de
          quadrados <span className="font-mono">(a − b)(a + b) = a² − b²</span>, porque isso <em>elimina a
          raiz</em> — que é o que estava impedindo o cancelamento.
        </Callout>
      </Section>

      <Section title="Caso 3 — o L que torna a função contínua">
        <p>A questão 6 da lista tem cara de novidade, mas é o mesmo cálculo:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 font-mono text-[15px]">
            <div>f(x) = (x³ − 8)/(x − 2), se x ≠ 2</div>
            <div>f(x) = L, se x = 2</div>
          </div>
        </div>

        <p>
          &quot;Determine L para que f seja contínua em p = 2.&quot; Como continuidade exige{' '}
          <span className="font-mono">lim(x→2) f(x) = f(2)</span>, e f(2) = L por definição, basta
          calcular o limite:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>x³ − 8 = x³ − 2³ = (x − 2)(x² + 2x + 4) &nbsp;&nbsp;← diferença de cubos</div>
          <div>lim(x→2) (x − 2)(x² + 2x + 4)/(x − 2) = lim(x→2) (x² + 2x + 4)</div>
          <div>= 4 + 4 + 4 = 12</div>
          <div className="pt-1 font-bold text-emerald-700 dark:text-emerald-400">L = 12</div>
        </div>

        <p>
          A interpretação é bonita: a função original tinha um buraco em x = 2. Definir L = 12 é{' '}
          <strong>tampar o buraco</strong> com exatamente o valor que a curva estava apontando. Qualquer
          outro valor de L deixaria um ponto solto fora da curva, e a função seria descontínua.
        </p>

        <Checkpoint>
          Você segue o roteiro substituir → identificar 0/0 → simplificar → substituir de novo, escolhe
          entre fatorar e racionalizar conforme apareça polinômio ou raiz, distingue 0/0 de número/0 e
          sabe achar o valor que remove uma descontinuidade. Com isso, a Parte B inteira da lista está
          coberta.
        </Checkpoint>
      </Section>
    </article>
  );
}
