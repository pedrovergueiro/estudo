import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Fatoração e simplificação com restrição. */
export function SimplificacaoLesson() {
  return (
    <article className="space-y-10">
      <Section title="Três fatorações resolvem quase tudo">
        <p>
          Fatorar é reescrever uma soma como <strong>produto</strong>. Isso importa porque só em produto
          dá para cancelar — e cancelar é o que resolve os limites com 0/0 do próximo bloco.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Fator comum</div>
            <div className="font-mono text-[15px] text-gray-800 dark:text-gray-200">
              x² + x = x(x + 1)
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              O x aparece nos dois termos, então sai para fora.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Diferença de quadrados
            </div>
            <div className="font-mono text-[15px] text-gray-800 dark:text-gray-200">
              a² − b² = (a − b)(a + b)
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              x² − 4 = (x − 2)(x + 2) &nbsp;·&nbsp; 4x² − 1 = (2x − 1)(2x + 1) &nbsp;·&nbsp; x² − 9 =
              (x − 3)(x + 3)
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Trinômio pelas raízes</div>
            <div className="font-mono text-[15px] text-gray-800 dark:text-gray-200">
              ax² + bx + c = a(x − r₁)(x − r₂)
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              x² − 5x + 6 tem raízes 2 e 3, então vira (x − 2)(x − 3).
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          A diferença de quadrados é a mais cobrada, e vem disfarçada. Em{' '}
          <span className="font-mono">4x² − 1</span>, o 4x² é (2x)² e o 1 é 1². Em{' '}
          <span className="font-mono">9x² − 1</span>, é (3x)² − 1². Treine o olho para enxergar quadrado
          onde não está escrito o expoente.
        </Callout>

        <p>
          Vale também guardar a <strong>diferença de cubos</strong>, que aparece direto na questão 6 da
          lista de limites:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            a³ − b³ = (a − b)(a² + ab + b²)
          </div>
        </div>

        <p>
          Assim, x³ − 8 = x³ − 2³ = (x − 2)(x² + 2x + 4). Aquele fator (x − 2) é justamente o que vai
          cancelar com o denominador.
        </p>
      </Section>

      <Section title="Cancelar muda a função — e é isso que cai na prova">
        <p>
          Considere <span className="font-mono">f(x) = (x² − 4)/(x − 2)</span>, com x ≠ 2. Fatorando:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>(x² − 4)/(x − 2) = (x − 2)(x + 2)/(x − 2) = x + 2</div>
        </div>

        <p>
          Simplificou bonito. Mas agora vem a pergunta que o professor faz — e que o diagnóstico apontou
          como fragilidade da turma:{' '}
          <strong>a função simplificada tem o mesmo domínio da original?</strong>
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="mb-1 font-bold text-red-900 dark:text-red-100">Original</div>
            <div className="font-mono text-sm text-red-900 dark:text-red-100">
              (x² − 4)/(x − 2)
              <br />
              D = ℝ − &#123;2&#125;
            </div>
            <p className="mt-2 text-sm text-red-900 dark:text-red-100">
              Em x = 2 dá 0/0. Não existe.
            </p>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-100">Simplificada</div>
            <div className="font-mono text-sm text-emerald-900 dark:text-emerald-100">
              x + 2
              <br />D = ℝ
            </div>
            <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
              Em x = 2 dá 4, tranquilamente.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          <strong>Não são a mesma função.</strong> Elas concordam em todos os pontos, menos em x = 2 —
          onde uma não existe e a outra vale 4. Por isso a resposta correta se escreve com a restrição
          colada:
          <div className="mt-2 text-center font-mono font-bold">
            (x² − 4)/(x − 2) = x + 2, para x ≠ 2
          </div>
          Cancelar o (x − 2) só é legítimo porque x ≠ 2 garante que ele não é zero. Cancelar zero é
          proibido.
        </Callout>

        <p>
          Graficamente, a original é a reta y = x + 2 com um <strong>buraco</strong> em (2, 4) — uma
          bolinha vazia. Esse buraco é o coração do próximo bloco: o limite existe e vale 4, mesmo a
          função não existindo ali.
        </p>
      </Section>

      <Section title="Racionalizar: o truque quando aparece raiz">
        <p>
          Fatorar não resolve <span className="font-mono">(√x − 1)/(x − 1)</span>. Nesse caso, multiplique
          em cima e embaixo pelo <strong>conjugado</strong> — a mesma expressão com o sinal trocado:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>(√x − 1)/(x − 1) · (√x + 1)/(√x + 1)</div>
          <div>= (x − 1) / [(x − 1)(√x + 1)] &nbsp;&nbsp;← usou (a−b)(a+b) = a² − b²</div>
          <div>= 1 / (√x + 1), para x ≠ 1</div>
        </div>

        <p>
          Funcionou porque (√x − 1)(√x + 1) = (√x)² − 1² = x − 1, que cancela com o denominador. É a
          diferença de quadrados de novo, aplicada de trás para frente.
        </p>

        <Callout tipo="info">
          Multiplicar por <span className="font-mono">(√x + 1)/(√x + 1)</span> é multiplicar por 1 — não
          altera o valor da expressão, só a aparência. Todo truque de simplificação é isso: reescrever a
          mesma coisa de um jeito em que dá para cancelar.
        </Callout>

        <Checkpoint>
          Você reconhece fator comum, diferença de quadrados, trinômio e diferença de cubos; sabe que
          cancelar exige carregar a restrição junto; e sabe racionalizar quando aparece raiz. Estas são
          literalmente as três técnicas que resolvem todos os limites com indeterminação 0/0 da Lista 1.
        </Checkpoint>
      </Section>
    </article>
  );
}
