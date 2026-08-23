import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { AsymptoteExplorer } from '@/components/interactive/AsymptoteExplorer';

/** Aula: Assíntotas verticais e horizontais. */
export function AssintotasLesson() {
  return (
    <article className="space-y-10">
      <Section title="Duas perguntas diferentes, dois cálculos diferentes">
        <p>
          Assíntota é uma reta da qual o gráfico chega arbitrariamente perto sem nunca encostar (ou, no
          caso das horizontais, sem encostar <em>lá no fim</em>). Existem duas, e elas não se misturam:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 p-4">
            <div className="mb-1 font-bold text-rose-900 dark:text-rose-100">
              Vertical — a função explode
            </div>
            <div className="font-mono text-sm text-rose-900 dark:text-rose-100">
              x = a, quando lim(x→a) f(x) = ±∞
            </div>
            <p className="mt-2 text-sm text-rose-900 dark:text-rose-100">
              Procure onde o <strong>denominador zera</strong>. É um limite lateral.
            </p>
          </div>

          <div className="rounded-lg border-2 border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-4">
            <div className="mb-1 font-bold text-blue-900 dark:text-blue-100">
              Horizontal — a função se acomoda
            </div>
            <div className="font-mono text-sm text-blue-900 dark:text-blue-100">
              y = L, quando lim(x→±∞) f(x) = L
            </div>
            <p className="mt-2 text-sm text-blue-900 dark:text-blue-100">
              Compare os <strong>graus</strong>. É um limite no infinito.
            </p>
          </div>
        </div>

        <p>
          Daí a ordem de trabalho que o professor deixou na orientação da lista:{' '}
          <em>determine primeiro o domínio, depois os limites laterais nos pontos de fora do domínio, e
          por fim os limites no infinito</em>. Seguir essa ordem evita procurar assíntota em lugar errado.
        </p>

        <AsymptoteExplorer />
      </Section>

      <Section title="Vertical: denominador zerando NÃO garante assíntota">
        <p>
          Esta é a pegadinha principal da Parte D, e ela aparece em pelo menos três questões da lista. O
          teste correto é:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Ache onde o denominador zera.
          </div>
          <div>
            <strong>2.</strong> Veja o que o numerador faz nesse mesmo ponto.
          </div>
          <div>
            <strong>3.</strong> Se der <span className="font-mono">número/0</span> → é assíntota. Se der{' '}
            <span className="font-mono">0/0</span> → simplifique antes de decidir.
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border-l-4 border-rose-500 bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-1 font-bold">h(x) = (x² − 4)/(x − 2), em x = 2</div>
            <div>denominador zera ✓, mas o numerador também: 4 − 4 = 0</div>
            <div>0/0 → simplifica: (x − 2)(x + 2)/(x − 2) = x + 2</div>
            <div className="font-bold text-amber-700 dark:text-amber-400">
              NÃO há assíntota vertical — há um buraco em (2, 4)
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-rose-500 bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-1 font-bold">g(x) = (x + 1)/(x² − 1), em x = 1 e x = −1</div>
            <div>x² − 1 = (x − 1)(x + 1) → zera em 1 e −1</div>
            <div>simplificando: (x + 1)/[(x − 1)(x + 1)] = 1/(x − 1)</div>
            <div className="text-rose-700 dark:text-rose-400">em x = 1: sobra 1/0 → ASSÍNTOTA vertical</div>
            <div className="text-amber-700 dark:text-amber-400">
              em x = −1: o fator cancelou → apenas um buraco
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-rose-500 bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-1 font-bold">f(x) = 1/(x − 5), em x = 5</div>
            <div>denominador zera, numerador vale 1 (não zera)</div>
            <div>1/0 → limites laterais explodem</div>
            <div className="font-bold text-rose-700 dark:text-rose-400">
              x = 5 é assíntota vertical ✓
            </div>
          </div>
        </div>

        <Callout tipo="prova">
          O par mais cobrado é <span className="font-mono">(x² − 4)/(x − 2)</span> versus{' '}
          <span className="font-mono">1/(x − 2)</span>. As duas têm o mesmo denominador e o mesmo domínio
          ℝ − &#123;2&#125;, mas só a segunda tem assíntota. A primeira é uma reta com um furo. Quem
          responde &quot;x = 2&quot; nas duas perde a questão.
        </Callout>
      </Section>

      <Section title="O sinal do infinito: pela esquerda e pela direita">
        <p>
          Quando existe assíntota vertical, a questão costuma pedir os dois limites laterais, porque eles
          podem ter sinais opostos. Veja <span className="font-mono">g(x) = (x + 2)/(x − 3)</span> em
          x = 3 — o exemplo da revisão de prova:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>numerador em x = 3: 3 + 2 = 5 (positivo, fixo)</div>
          <div className="pt-1">x → 3⁻: o denominador x − 3 é NEGATIVO e minúsculo → 5/(0⁻) = −∞</div>
          <div>x → 3⁺: o denominador x − 3 é POSITIVO e minúsculo → 5/(0⁺) = +∞</div>
        </div>

        <p>
          O truque é olhar o <strong>sinal do denominador</strong> de cada lado. Chegando por baixo de 3
          (por exemplo x = 2,99), x − 3 = −0,01: negativo. Chegando por cima (x = 3,01), x − 3 = +0,01:
          positivo. O numerador, sendo 5 nos dois casos, só transmite o sinal.
        </p>

        <Callout tipo="info">
          Escrever <span className="font-mono">0⁻</span> e <span className="font-mono">0⁺</span> não é
          firula: é o que deixa a justificativa completa. &quot;O denominador tende a zero por valores
          negativos, logo o quociente tende a −∞&quot; é exatamente a frase que o professor espera.
        </Callout>
      </Section>

      <Section title="Horizontal: é o limite no infinito, e nada mais">
        <p>
          Aqui você reaproveita direto a comparação de graus do tópico anterior. Não há técnica nova:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(x) = (2x + 1)/(x + 7) → graus iguais → y = 2</div>
          <div>g(x) = (4x² − 3)/(2x² + 5) → graus iguais → y = 2</div>
          <div>h(x) = (x + 1)/(x² + 1) → cima menor → y = 0</div>
          <div>p(x) = (3x² + 1)/(x³ + 2) → cima menor → y = 0</div>
          <div>(5x³ − 6x + 1)/(6x² + x + 3) → cima maior → NÃO há horizontal</div>
        </div>

        <Callout tipo="atencao">
          Uma função pode ter <strong>duas</strong> assíntotas horizontais diferentes, uma para +∞ e outra
          para −∞. É o que acontece com <span className="font-mono">g(x) = |x + 2|/(x − 3)</span> da
          revisão de prova: pela direita o módulo abre como (x + 2) e o limite dá 1; pela esquerda abre
          como −(x + 2) e o limite dá −1. Resultado: y = 1 e y = −1. Por isso os dois limites são
          calculados separadamente, sempre.
        </Callout>

        <p>
          E há funções sem assíntota nenhuma. Em <span className="font-mono">f(x) = √(x − 2)</span>: o
          domínio é [2, +∞), a função não explode em ponto algum (em x = 2 ela vale 0, tranquilamente), e
          para x → +∞ ela cresce sem parar em vez de se acomodar. Nem vertical, nem horizontal.
        </p>

        <Callout tipo="atencao">
          Diferença que a prova gosta de cobrar: a assíntota <strong>vertical</strong> é uma barreira que
          o gráfico nunca atravessa (a função explode ali). Já a <strong>horizontal</strong> é só um
          destino no infinito — o gráfico <strong>pode cruzá-la</strong> quantas vezes quiser enquanto x
          ainda é &quot;pequeno&quot;, contanto que se acomode nela lá longe. Uma função como{' '}
          <span className="font-mono">f(x) = 5 + sen(x)/x</span> oscila em torno de y = 5, cruzando essa
          reta infinitas vezes, e mesmo assim y = 5 é assíntota horizontal — porque a amplitude da
          oscilação encolhe a zero conforme x → ∞.
        </Callout>

        <Checkpoint>
          Você acha assíntotas verticais testando número/0 contra 0/0, determina o sinal de cada lado
          olhando 0⁻ e 0⁺, calcula horizontais comparando graus e sabe que os dois lados do infinito
          precisam ser checados separadamente. Com isso, a Parte D da lista está fechada — e com ela o
          bloco inteiro de limites.
        </Checkpoint>
      </Section>
    </article>
  );
}
