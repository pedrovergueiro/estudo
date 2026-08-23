import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Limites no infinito e termo dominante. */
export function LimitesInfinitoLesson() {
  return (
    <article className="space-y-10">
      <Section title="A pergunta muda: agora é o x que vai longe">
        <p>
          Até aqui, x se aproximava de um número. Agora x <strong>cresce sem parar</strong> — e a
          pergunta é o que acontece com f(x) nesse processo. A orientação do professor na lista é o
          resumo perfeito: <em>&quot;identifique primeiro o termo dominante&quot;</em>.
        </p>

        <p>O fato que sustenta tudo:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            lim(x→±∞) 1/xⁿ = 0, para qualquer n &gt; 0
          </div>
        </div>

        <p>
          A leitura é intuitiva: dividir 1 por um número gigantesco dá algo colado no zero. Com x = 1000,
          1/x² já vale 0,000001. Toda técnica desta aula existe para transformar a expressão em pedaços
          da forma 1/xⁿ, que somem.
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>lim(x→+∞) 1/x² = 0</div>
          <div>lim(x→−∞) 1/x³ = 0</div>
          <div>lim(x→−∞) (5 + 1/x + 3/x²) = 5 + 0 + 0 = 5</div>
          <div>lim(x→+∞) (2 − 1/x) = 2 − 0 = 2</div>
        </div>

        <Callout tipo="info">
          Repare que o sinal do infinito quase nunca importa para 1/xⁿ: seja +∞ ou −∞, a fração vai a
          zero de qualquer jeito. Ele só passa a importar quando o resultado <em>não</em> é finito — em
          polinômios, por exemplo.
        </Callout>
      </Section>

      <Section title="Fração de polinômios: compare os graus">
        <p>
          A técnica formal é dividir numerador e denominador pela{' '}
          <strong>maior potência do denominador</strong>. Fazendo isso uma vez com calma, o padrão fica
          claro:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="mb-2 font-bold">lim(x→+∞) (2x + 1)/(x + 3)</div>
          <div>divide tudo por x:</div>
          <div>= (2 + 1/x)/(1 + 3/x)</div>
          <div>as frações 1/x e 3/x vão a zero:</div>
          <div className="font-bold text-emerald-700 dark:text-emerald-400">= 2/1 = 2</div>
        </div>

        <p>
          Feito isso algumas vezes, você percebe que o resultado só depende da comparação entre os graus.
          Vale como regra — mas mostre a divisão pelo menos uma vez na prova, porque o enunciado pede
          justificativa:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/40 p-4">
            <div className="font-bold text-blue-900 dark:text-blue-100">
              grau de cima &lt; grau de baixo → limite 0
            </div>
            <div className="mt-1 font-mono text-sm text-blue-900 dark:text-blue-100">
              lim x/(x² + 3x + 1) = 0 &nbsp;·&nbsp; lim (2x³ + 1)/(x⁴ + 2x + 3) = 0
            </div>
            <p className="mt-1 text-sm text-blue-900 dark:text-blue-100">
              O de baixo cresce mais rápido e esmaga a fração.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              graus IGUAIS → razão dos coeficientes dominantes
            </div>
            <div className="mt-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              lim (x² − 2x + 3)/(3x² + x + 1) = 1/3 &nbsp;·&nbsp; lim (5x⁴ − 2x + 1)/(4x⁴ + 3x + 2) = 5/4
            </div>
            <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
              Só os coeficientes da maior potência entram na conta. Os outros termos somem.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              grau de cima &gt; grau de baixo → ±∞
            </div>
            <div className="mt-1 font-mono text-sm text-red-900 dark:text-red-100">
              lim(x→+∞) (5x³ − 6x + 1)/(6x² + x + 3) = +∞
            </div>
            <p className="mt-1 text-sm text-red-900 dark:text-red-100">
              O de cima cresce mais rápido e a fração dispara. Aqui o sinal importa: confira se dá +∞ ou
              −∞.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          O erro clássico é olhar os <strong>números soltos</strong> em vez dos graus. Em (2x + 1)/(x + 3),
          o limite é 2 — os valores 1 e 3 não influenciam nada quando x é gigante. Da mesma forma, em
          (x² − 9)/(x² + 1) o limite é 1, e não algo relacionado a −9 e 1.
        </Callout>
      </Section>

      <Section title="Polinômio sozinho: quem manda é o maior grau">
        <p>
          Sem fração, o polinômio inteiro se comporta como seu termo de maior grau. Os demais viram
          irrelevantes:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>lim(x→+∞) (x⁴ − 3x + 2) = +∞ &nbsp;&nbsp;← manda o x⁴</div>
          <div>lim(x→+∞) (5 − 4x + x² − x⁵) = −∞ &nbsp;&nbsp;← manda o −x⁵</div>
          <div>lim(x→−∞) (3x³ + 2x + 1) = −∞ &nbsp;&nbsp;← x³ com x negativo dá negativo</div>
          <div>lim(x→+∞) (x³ − 2x + 3) = +∞</div>
        </div>

        <p>Para acertar o sinal, combine duas coisas:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Expoente par</strong> (x², x⁴) → sempre positivo, indo para +∞ nos dois lados.
          </div>
          <div>
            <strong>Expoente ímpar</strong> (x³, x⁵) → segue o sinal do x: +∞ à direita, −∞ à esquerda.
          </div>
          <div>
            <strong>Coeficiente negativo</strong> → inverte tudo o que você acabou de concluir.
          </div>
        </div>

        <Callout tipo="prova">
          Teste rápido em <span className="font-mono">lim(x→+∞) (5 − 4x + x² − x⁵)</span>: o maior grau é
          5 (ímpar), x → +∞ dá +∞, mas o coeficiente é −1 → inverte → <strong>−∞</strong>. Três segundos,
          sem conta nenhuma.
        </Callout>

        <p>
          Vale o mesmo cuidado com o sinal em frações que vão para o infinito negativo. Em{' '}
          <span className="font-mono">lim(x→−∞) (5 − x)/(3 + 2x)</span>, graus iguais dão a razão dos
          dominantes: (−x)/(2x) = −1/2. O sinal negativo vem dos coeficientes, não do lado do infinito.
        </p>

        <Checkpoint>
          Você sabe que 1/xⁿ → 0, compara graus para resolver fração de polinômios em três casos, e
          determina o sinal de um polinômio no infinito pelo termo dominante. Isso é literalmente o
          cálculo das assíntotas horizontais do próximo tópico.
        </Checkpoint>
      </Section>
    </article>
  );
}
