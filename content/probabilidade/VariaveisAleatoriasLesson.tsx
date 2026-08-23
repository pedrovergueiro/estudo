import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Variáveis aleatórias e distribuições de probabilidade. */
export function VariaveisAleatoriasLesson() {
  return (
    <article className="space-y-10">
      <Section title="Variável aleatória traduz resultado em número">
        <p>
          Um espaço amostral pode ser feito de coisas que não são números: &#123;CC, CK, KC, KK&#125;.
          Uma <strong>variável aleatória X</strong> é uma função que dá um número a cada resultado — e é
          isso que permite calcular médias e variâncias.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            X = número de caras em duas moedas
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>KK → X = 0</div>
            <div>KC → X = 1</div>
            <div>CK → X = 1</div>
            <div>CC → X = 2</div>
          </div>
        </div>

        <Callout tipo="prova">
          Convenção que a prova cobra: <strong>letra maiúscula (X) é a variável</strong>, e{' '}
          <strong>letra minúscula (x) é um valor que ela assume</strong>. Por isso se escreve P(X = 2), e
          não P(x = 2).
        </Callout>

        <p>A divisão fundamental, que organiza os capítulos 5 e 6:</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-100">Discreta</div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Valores <strong>contáveis</strong> — geralmente resultado de contagem. Número de defeitos,
              de caras, de chamadas. Capítulo 5.
            </p>
          </div>
          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="mb-1 font-bold text-sky-900 dark:text-sky-100">Contínua</div>
            <p className="text-sm text-sky-900 dark:text-sky-100">
              Valores num <strong>intervalo</strong> — geralmente resultado de medição. Tempo, peso,
              resistência, altura. Capítulo 6.
            </p>
          </div>
        </div>

        <p>
          É a mesma distinção da Seção 1.6: contar dá discreto, medir dá contínuo. Na prática, se entre
          dois valores possíveis sempre cabe um terceiro, é contínua.
        </p>
      </Section>

      <Section title="Distribuição discreta: a tabela que soma 1">
        <p>
          Para uma variável discreta, a <strong>função de probabilidade</strong> f(x) = P(X = x) é
          normalmente dada por uma tabela. Para as duas moedas:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">x</th>
                <th className="py-2 text-right font-medium text-gray-500">0</th>
                <th className="py-2 text-right font-medium text-gray-500">1</th>
                <th className="py-2 text-right font-medium text-gray-500">2</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr>
                <td className="py-1.5">f(x)</td>
                <td className="py-1.5 text-right">1/4</td>
                <td className="py-1.5 text-right">2/4</td>
                <td className="py-1.5 text-right">1/4</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>Duas condições que toda distribuição discreta precisa satisfazer:</p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(x) ≥ 0 para todo x</div>
          <div>Σ f(x) = 1</div>
        </div>

        <Callout tipo="atencao">
          Quando o exercício dá uma f(x) com uma constante k desconhecida, a conta é sempre a mesma:{' '}
          <strong>imponha que a soma seja 1 e resolva para k</strong>. É o formato padrão da Seção 3.2.
        </Callout>

        <p>
          A <strong>distribuição acumulada</strong> F(x) = P(X ≤ x) soma tudo até x. Para o exemplo:
          F(0) = 1/4, F(1) = 3/4, F(2) = 1. Ela é útil para responder &quot;no máximo&quot; e &quot;pelo
          menos&quot; sem recontar termo a termo.
        </p>
      </Section>

      <Section title="Ler F(x) dado por partes — o exercício que mais confunde">
        <p>
          É comum a prova dar F(x) já pronta, como uma função por partes, e pedir para você calcular
          probabilidades de todo tipo a partir dela. O procedimento tem duas dicas fixas:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Dica 1 — Desmembrar quando aplicável:</strong> qualquer probabilidade de intervalo
            vira uma diferença de duas leituras de F.
          </div>
          <div>
            <strong>Dica 2 — Sempre transformar o sinal para ≤:</strong> como F só responde
            &quot;≤&quot;, reescreva &lt;, &gt; e ≥ em termos de ≤ antes de tudo. Numa variável{' '}
            <strong>discreta de incremento 1</strong>, &quot;X &lt; a&quot; equivale a &quot;X ≤ a −
            1&quot;.
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[14px]">
          <div className="whitespace-pre">{`P(X ≤ a)       = F(a)
P(X < a)       = F(a − 1)      ← só em discreta de incremento 1
P(X > a)       = 1 − F(a)
P(X ≥ a)       = 1 − F(a − 1)
P(a ≤ X ≤ b)   = F(b) − F(a − 1)
P(a < X ≤ b)   = F(b) − F(a)
P(a < X < b)   = F(b − 1) − F(a)`}</div>
        </div>

        <p>
          Exemplo — F(x) = 0 para x &lt; −10; 0,25 para −10 ≤ x &lt; 30; 0,75 para 30 ≤ x &lt; 50; e 1
          para x ≥ 50, com X discreta de incremento 1:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="space-y-2 font-mono text-[15px]">
            <div>
              P(X ≤ 50) = F(50) = <strong>1</strong> &nbsp;
              <span className="text-sm text-gray-500">(50 já cai no último degrau)</span>
            </div>
            <div>
              P(40 ≤ X ≤ 60) = F(60) − F(39) = 1 − 0,75 = <strong>0,25</strong> &nbsp;
              <span className="text-sm text-gray-500">
                (desmembrado com a Dica 1: 60 está no último degrau, 39 ainda no terceiro)
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-1.5 text-left font-medium text-gray-500">Pedido</th>
                <th className="py-1.5 text-right font-medium text-gray-500">Resposta</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                ['P(X ≤ 50)', '1,00'],
                ['P(X ≤ 40)', '0,75'],
                ['P(40 ≤ X ≤ 60)', '0,25'],
                ['P(X < 0)', '0,25'],
                ['P(0 ≤ X < 10)', '0,00'],
                ['P(−10 < X < 10)', '0,00'],
              ].map(([q, r]) => (
                <tr key={q} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1">{q}</td>
                  <td className="py-1 text-right">{r}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout tipo="atencao">
          Os dois últimos itens dando <strong>zero</strong> não são erro — o intervalo pedido inteiro cai
          dentro de um único degrau da função (entre −10 e 30, F vale 0,25 o tempo todo), então não sobra
          probabilidade nenhuma ali dentro. Confira sempre em qual &quot;degrau&quot; cada ponta do
          intervalo cai antes de subtrair.
        </Callout>
      </Section>

      <Section title="Distribuição contínua: área, não altura">
        <p>
          Para variáveis contínuas há uma mudança conceitual que confunde muita gente: a probabilidade
          passa a ser <strong>área sob a curva</strong>.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(a &lt; X &lt; b) = ∫ₐᵇ f(x) dx
          </div>
        </div>

        <p>As condições correspondentes:</p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(x) ≥ 0 para todo x</div>
          <div>∫ f(x) dx = 1 &nbsp;&nbsp;← área total sob a curva</div>
        </div>

        <Callout tipo="atencao">
          Num caso contínuo, <strong>P(X = a) = 0 para qualquer valor a</strong>. Não é que seja
          impossível — é que a área de um segmento sem largura é zero. A consequência prática é útil:
          P(X &lt; a) = P(X ≤ a), então <strong>não faz diferença</strong> usar &lt; ou ≤. Em variáveis
          discretas, faz toda a diferença.
        </Callout>

        <p>
          A função f(x) aqui se chama <strong>densidade</strong>, e não probabilidade — ela pode
          inclusive assumir valores maiores que 1. O que nunca passa de 1 é a área.
        </p>

        <Callout tipo="info">
          Repare que o cálculo integral entra aqui, exatamente onde o Cálculo A que você está fazendo vai
          desembocar. Limite → derivada → integral → área sob a densidade. As duas disciplinas se
          encontram neste ponto.
        </Callout>

        <Checkpoint>
          Você traduz resultados em números com uma variável aleatória, distingue discreta de contínua,
          verifica se uma distribuição é válida (soma ou integral igual a 1), usa a acumulada F(x) e sabe
          que no contínuo a probabilidade pontual é zero.
        </Checkpoint>
      </Section>
    </article>
  );
}
