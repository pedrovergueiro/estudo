import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DomainInspector } from '@/components/interactive/DomainInspector';

/** Aula: Domínio — o que a expressão proíbe. */
export function DominioLesson() {
  return (
    <article className="space-y-10">
      <Section title="Domínio é a lista do que PODE entrar">
        <p>
          O domínio de uma função é o conjunto dos valores de x para os quais a conta faz sentido nos
          números reais. Na prática, a pergunta é sempre a mesma:{' '}
          <strong>o que quebraria essa expressão?</strong>
        </p>

        <p>
          E, em Cálculo A, só existem <strong>dois jeitos</strong> de uma expressão quebrar:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="mb-1 font-bold text-amber-900 dark:text-amber-100">
              1. Denominador zerando
            </div>
            <div className="font-mono text-sm text-amber-900 dark:text-amber-100">
              precisa ser ≠ 0
            </div>
            <p className="mt-2 text-sm text-amber-900 dark:text-amber-100">
              Dividir por zero não dá &quot;infinito&quot; nem &quot;zero&quot;: simplesmente não existe.
            </p>
          </div>

          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="mb-1 font-bold text-sky-900 dark:text-sky-100">
              2. Raiz de índice par com negativo dentro
            </div>
            <div className="font-mono text-sm text-sky-900 dark:text-sky-100">precisa ser ≥ 0</div>
            <p className="mt-2 text-sm text-sky-900 dark:text-sky-100">
              √(−4) não é real. Nenhum número real multiplicado por si mesmo dá negativo.
            </p>
          </div>
        </div>

        <Callout tipo="info">
          Se a função <strong>não tem</strong> denominador nem raiz par — como f(x) = 2x − 3 ou
          g(x) = x² − 4x + 1 — o domínio é ℝ inteiro. Polinômio aceita qualquer número. Não invente
          restrição onde não existe.
        </Callout>
      </Section>

      <Section title="O procedimento, em três passos">
        <p>
          Este é o roteiro que resolve qualquer questão de domínio da lista. Ele nunca muda:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              1. Caçar quem impõe restrição
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Olhe a expressão e circule cada denominador e cada raiz de índice par.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              2. Escrever a condição e resolver
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Denominador → iguale a zero e exclua essas raízes. Raiz par → monte a inequação ≥ 0 e
              resolva.
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              3. Juntar tudo e escrever em intervalo
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Se há mais de uma restrição, elas valem <strong>ao mesmo tempo</strong>. Desenhe na reta
              para não errar a junção.
            </p>
          </div>
        </div>

        <DomainInspector />

        <Callout tipo="prova">
          O professor pediu explicitamente a resposta <strong>em forma de intervalo</strong>. Vale a pena
          fixar a tradução:
          <br />• <span className="font-mono">x ≥ 2</span> → <span className="font-mono">[2, +∞)</span>{' '}
          — colchete porque o 2 entra
          <br />• <span className="font-mono">x &gt; 2</span> → <span className="font-mono">(2, +∞)</span>{' '}
          — parêntese porque o 2 fica de fora
          <br />• <span className="font-mono">x ≠ 2</span> →{' '}
          <span className="font-mono">(−∞, 2) ∪ (2, +∞)</span>
          <br />
          Do lado do infinito é <strong>sempre</strong> parêntese: infinito não é um número que se possa
          incluir.
        </Callout>
      </Section>

      <Section title="Quando as duas restrições aparecem juntas">
        <p>
          O caso que derruba mais gente é a função com raiz <em>e</em> denominador, como{' '}
          <span className="font-mono">f(x) = √(x − 2) / (x − 5)</span>. As duas condições precisam valer
          simultaneamente:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>da raiz: x − 2 ≥ 0 → x ≥ 2</div>
          <div>do denominador: x − 5 ≠ 0 → x ≠ 5</div>
          <div className="pt-2 font-bold">D(f) = [2, 5) ∪ (5, +∞)</div>
        </div>

        <p>
          Leia a resposta em voz alta: &quot;de 2 até 5, sem o 5, mais de 5 em diante&quot;. O intervalo
          quebrou em dois porque o furo caiu <strong>dentro</strong> da faixa permitida. Se o furo tivesse
          caído fora dela — por exemplo, x ≠ 0 num domínio que começa em 2 — ele nem apareceria na
          resposta, porque já estava excluído.
        </p>

        <Callout tipo="atencao">
          Cuidado com <span className="font-mono">√(5 − x)</span>. A condição é 5 − x ≥ 0, e ao isolar o x
          você multiplica os dois lados por −1 — o que <strong>inverte a desigualdade</strong>: x ≤ 5, não
          x ≥ 5. Sempre teste um número para conferir: x = 0 dá √5 ✓, x = 10 dá √(−5) ✗. Confirmado, é
          x ≤ 5.
        </Callout>

        <p>
          Um caso especial que também cai:{' '}
          <span className="font-mono">h(x) = √((x − 1)/(x + 2))</span>. Aqui a fração inteira está dentro
          da raiz, então ela precisa ser <strong>≥ 0</strong>, e além disso o denominador não pode zerar.
          Isso vira um estudo de sinal do quociente — assunto do tópico de inequações.
        </p>

        <Checkpoint>
          Você sabe que só duas coisas restringem domínio (denominador zerando e raiz par de negativo),
          aplica o roteiro de três passos, junta várias restrições na reta e escreve o resultado em
          notação de intervalo. Isso é a fragilidade nº 1 do diagnóstico da turma — e é pré-requisito
          direto de assíntotas, onde os valores fora do domínio viram as candidatas a assíntota vertical.
        </Checkpoint>
      </Section>
    </article>
  );
}
