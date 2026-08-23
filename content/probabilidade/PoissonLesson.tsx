import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DistribuicaoDiscretaLab } from '@/components/interactive/DistribuicaoDiscretaLab';

/** Aula: Distribuição de Poisson. */
export function PoissonLesson() {
  return (
    <article className="space-y-10">
      <Section title="Quando não existe 'número de tentativas'">
        <p>
          A binomial precisa de um n fixo. Mas muitos problemas não têm isso: quantas chamadas chegam
          numa central em uma hora? Quantos defeitos há em 10 metros de cabo? Não existe &quot;número de
          tentativas&quot; — existe um <strong>intervalo</strong> de tempo, área ou comprimento.
        </p>

        <p>
          Esse é o território da <strong>distribuição de Poisson</strong>. Ela conta ocorrências de
          eventos raros num intervalo contínuo, e depende de um único parâmetro:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              p(x; λt) = e<sup>−λt</sup> · (λt)<sup>x</sup> / x!
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              λt = número médio de ocorrências no intervalo
            </div>
          </div>
        </div>

        <p>
          As condições do <strong>processo de Poisson</strong>: as ocorrências em intervalos disjuntos
          são independentes, a probabilidade de uma ocorrência é proporcional ao tamanho do intervalo, e
          a chance de duas ocorrências no mesmo instante é desprezível.
        </p>
      </Section>

      <Section title="A propriedade que a torna especial">
        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-8 py-4 text-center font-mono text-lg font-bold text-emerald-900 dark:text-emerald-100">
            μ = σ² = λt
          </div>
        </div>

        <p>
          Média e variância são <strong>o mesmo número</strong>. Não há outra distribuição comum com essa
          característica, e é por isso que ela é fácil de identificar em dados reais: se a média amostral
          e a variância amostral saem parecidas numa contagem, Poisson é uma boa candidata.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — central recebe em média 4 chamadas por hora. P(exatamente 2 numa hora)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>λt = 4, x = 2</div>
            <div>p(2; 4) = e⁻⁴ · 4² / 2!</div>
            <div>= 0,0183 × 16 / 2</div>
            <div className="font-bold">= 0,1465</div>
          </div>
        </div>

        <p>
          Mas de novo: o enunciado raramente para em &quot;exatamente 2&quot;. Se a pergunta for{' '}
          <strong>&quot;qual a chance de a central receber pelo menos 3 chamadas nessa hora?&quot;</strong>
          , a fórmula é a mesma — o que muda é quantas vezes você a aplica:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Mesma central, λt = 4. P(pelo menos 3 chamadas)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>p(0; 4) = e⁻⁴ · 4⁰ / 0! = 0,0183 × 1 / 1 = 0,0183</div>
            <div>p(1; 4) = e⁻⁴ · 4¹ / 1! = 0,0183 × 4 / 1 = 0,0733</div>
            <div>p(2; 4) = e⁻⁴ · 4² / 2! = 0,0183 × 16 / 2 = 0,1465</div>
            <div className="pt-1">P(X ≤ 2) = 0,0183 + 0,0733 + 0,1465 = 0,2381</div>
            <div className="font-bold">P(X ≥ 3) = 1 − 0,2381 = 0,7619</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Três termos e um complemento resolvem o que, somando de 3 até o infinito, não teria fim — a
            Poisson não tem valor máximo, então <strong>&quot;pelo menos&quot; só se calcula por
            complemento</strong>. Não é atalho opcional aqui, é o único caminho.
          </p>
        </div>

        <DistribuicaoDiscretaLab />

        <Callout tipo="atencao">
          A pegadinha mais comum é <strong>não ajustar o λt ao intervalo do enunciado</strong>. A taxa é
          4 por hora, mas a pergunta pode ser sobre outro intervalo — e aí λt muda antes de qualquer
          conta:
          <div className="mt-2 space-y-1 font-mono text-sm">
            <div>1 hora &nbsp;&nbsp;→ λt = 4 × 1 = 4 &nbsp;&nbsp;→ p(2) = e⁻⁴·4²/2! = 0,1465</div>
            <div>meia hora → λt = 4 × 0,5 = 2 → p(2) = e⁻²·2²/2! = 0,2707</div>
            <div>3 horas &nbsp;→ λt = 4 × 3 = 12 &nbsp;→ p(2) = e⁻¹²·12²/2! ≈ 0,0004</div>
          </div>
          <div className="mt-2">
            A mesma pergunta (&quot;exatamente 2 chamadas&quot;) tem três respostas que variam{' '}
            <strong>por um fator de 600</strong>. Ajustar λt não é detalhe: é a questão inteira. Repare
            também que faz sentido — em meia hora, 2 chamadas é o cenário mais provável; em três horas,
            só 2 chamadas seria um dia excepcionalmente parado.
          </div>
        </Callout>
      </Section>

      <Section title="Poisson como aproximação da binomial">
        <p>
          Existe uma ponte entre as duas distribuições, e ela cai em prova. Quando n é{' '}
          <strong>grande</strong> e p é <strong>pequeno</strong>, a binomial fica difícil de calcular
          (imagine C(1000, 3) na mão) — e a Poisson dá praticamente o mesmo resultado:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            b(x; n, p) ≈ p(x; μ), com μ = n·p
          </div>
        </div>

        <p>
          O critério usual: n ≥ 20 e p ≤ 0,05; ou, com mais folga, n ≥ 100 e np ≤ 10. Faz sentido
          intuitivo, porque a variância da binomial np(1−p) tende a np quando p é minúsculo — e np é
          exatamente a variância da Poisson.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — 1000 peças, defeito de 0,2%. P(exatamente 3 defeituosas)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>μ = np = 1000 × 0,002 = 2</div>
            <div>p(3; 2) = e⁻² · 2³ / 3! = 0,1353 × 8 / 6</div>
            <div className="font-bold">≈ 0,1804</div>
          </div>
        </div>

        <Callout tipo="info">
          O Capítulo 6 traz a outra ponte, na direção oposta: quando n é grande e p <em>não</em> é
          pequeno, a binomial é aproximada pela <strong>normal</strong>. As três distribuições formam um
          sistema — binomial no centro, Poisson para eventos raros, normal para n grande.
        </Callout>

        <Callout tipo="ia">
          Poisson modela chegada de requisições em servidores, cliques em anúncios, falhas de
          equipamento. Toda vez que você dimensiona capacidade — &quot;quantos servidores para aguentar o
          pico?&quot; — está usando as caudas de uma Poisson, mesmo sem saber o nome.
        </Callout>

        <Checkpoint>
          Você reconhece quando usar Poisson em vez de binomial (intervalo em vez de n fixo), ajusta λt ao
          intervalo pedido, sabe que μ = σ² = λt e usa a aproximação de Poisson para binomiais com n
          grande e p pequeno.
        </Checkpoint>
      </Section>
    </article>
  );
}
