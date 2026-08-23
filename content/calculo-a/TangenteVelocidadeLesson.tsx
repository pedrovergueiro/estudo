import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Os problemas da tangente e da velocidade (Stewart 2.1). */
export function TangenteVelocidadeLesson() {
  return (
    <article className="space-y-10">
      <Section title="Os dois problemas que criaram o Cálculo">
        <p>
          O capítulo de limites não começa com limites. Começa com duas perguntas que, por séculos,
          ninguém soube responder — e que no fim se revelaram <strong>a mesma pergunta</strong>:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 p-4">
            <div className="font-bold text-indigo-900 dark:text-indigo-100">
              Problema da tangente
            </div>
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              Qual é a inclinação de uma curva <strong>em um único ponto</strong>? Inclinação sempre
              precisou de dois pontos. Como calcular com um só?
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              Problema da velocidade
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Qual é a velocidade <strong>em um único instante</strong>? Velocidade sempre foi distância
              dividida por tempo. Num instante, o tempo decorrido é zero.
            </p>
          </div>
        </div>

        <p>
          Repare que os dois esbarram no mesmo obstáculo: a conta que você sabe fazer exige{' '}
          <strong>um intervalo</strong>, e a pergunta é sobre <strong>um ponto</strong>. Zerar o
          intervalo quebra a divisão. É daí que o limite nasce.
        </p>
      </Section>

      <Section title="Problema 1 — a reta secante encostando na tangente">
        <p>
          A saída é não zerar o intervalo de uma vez: encolher aos poucos e ver para onde o resultado
          caminha.
        </p>
        <p>
          Pegue dois pontos da curva e trace a reta que passa pelos dois — essa é a{' '}
          <strong>secante</strong>. Vá aproximando o segundo ponto do primeiro. A secante vai girando, e
          a posição de que ela se aproxima é a <strong>tangente</strong>.
        </p>

        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-center font-mono text-[15px]">
          inclinação da secante &nbsp;=&nbsp; m<sub>PQ</sub> = [ f(x) − f(a) ] / ( x − a )
        </div>

        <p>
          Exemplo padrão: a parábola <span className="font-mono">y = x²</span> no ponto{' '}
          <span className="font-mono">P(1, 1)</span>. Tomando{' '}
          <span className="font-mono">Q(x, x²)</span>:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>m(PQ) = (x² − 1)/(x − 1)</div>
          <div>= (x − 1)(x + 1)/(x − 1)</div>
          <div className="font-bold">= x + 1 &nbsp;&nbsp;(para x ≠ 1)</div>
        </div>

        <p>Agora a tabela que os exercícios da seção 2.1 pedem — aproximando pelos dois lados:</p>

        <div className="overflow-x-auto">
          <table className="w-full text-center font-mono text-[14px]">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="p-2 font-bold">x (pela esquerda)</th>
                <th className="p-2 font-bold">m(PQ)</th>
                <th className="p-2 font-bold">x (pela direita)</th>
                <th className="p-2 font-bold">m(PQ)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-1">0,5</td><td className="p-1">1,5</td><td className="p-1">2</td><td className="p-1">3</td></tr>
              <tr><td className="p-1">0,9</td><td className="p-1">1,9</td><td className="p-1">1,5</td><td className="p-1">2,5</td></tr>
              <tr><td className="p-1">0,99</td><td className="p-1">1,99</td><td className="p-1">1,1</td><td className="p-1">2,1</td></tr>
              <tr><td className="p-1">0,999</td><td className="p-1">1,999</td><td className="p-1">1,01</td><td className="p-1">2,01</td></tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            inclinação da tangente = 2
          </div>
          <div className="pt-1">equação: y − 1 = 2(x − 1) → y = 2x − 1</div>
        </div>

        <Callout tipo="prova">
          Os exercícios ímpares de 2.1 são quase todos deste formato: dão uma curva e um ponto, pedem a
          tabela de inclinações de secante e depois a <strong>estimativa</strong> da tangente. Preencha
          os dois lados — só um lado não é evidência suficiente, e é o tipo de coisa que custa ponto.
        </Callout>
      </Section>

      <Section title="Problema 2 — velocidade média virando instantânea">
        <p>
          Mesma estrutura, roupa diferente. Uma bola cai e a distância percorrida em t segundos é{' '}
          <span className="font-mono">s(t) = 4,9t²</span>. Qual a velocidade{' '}
          <strong>exatamente</strong> em t = 5?
        </p>
        <p>
          Você só sabe calcular velocidade <em>média</em>, que precisa de um intervalo. Então calcule a
          média em intervalos cada vez menores, começando em 5:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>v(média) = [ s(5 + h) − s(5) ] / h</div>
          <div>= [ 4,9(5 + h)² − 4,9(25) ] / h</div>
          <div>= 4,9(25 + 10h + h² − 25) / h</div>
          <div>= 4,9(10h + h²) / h</div>
          <div className="font-bold">= 4,9(10 + h)</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center font-mono text-[14px]">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="p-2 font-bold">intervalo</th>
                <th className="p-2 font-bold">h</th>
                <th className="p-2 font-bold">velocidade média (m/s)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="p-1">[5, 6]</td><td className="p-1">1</td><td className="p-1">53,9</td></tr>
              <tr><td className="p-1">[5; 5,1]</td><td className="p-1">0,1</td><td className="p-1">49,49</td></tr>
              <tr><td className="p-1">[5; 5,01]</td><td className="p-1">0,01</td><td className="p-1">49,049</td></tr>
              <tr><td className="p-1">[5; 5,001]</td><td className="p-1">0,001</td><td className="p-1">49,0049</td></tr>
            </tbody>
          </table>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            velocidade instantânea em t = 5 &nbsp;→&nbsp; 49 m/s
          </div>
        </div>

        <Callout tipo="atencao">
          Não caia na tentação de fazer h = 0 direto na primeira linha. Ali em cima,{' '}
          <span className="font-mono">4,9(10h + h²)/h</span> com h = 0 dá{' '}
          <span className="font-mono">0/0</span> — a mesma indeterminação do resto do capítulo. O
          cancelamento do h só é legítimo <strong>porque h ≠ 0</strong> durante todo o processo: você se
          aproxima do instante, nunca chega nele. É exatamente o papel do{' '}
          <span className="font-mono">0 &lt; |x − a|</span> que aparece na definição formal lá em 2.4.
        </Callout>
      </Section>

      <Section title="A revelação: é o mesmo cálculo">
        <p>Coloque as duas contas lado a lado e some as diferenças:</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Tangente
            </div>
            <div className="font-mono text-[14px]">[ f(x) − f(a) ] / (x − a)</div>
            <div className="mt-1 text-sm">variação em y sobre variação em x</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Velocidade
            </div>
            <div className="font-mono text-[14px]">[ s(t) − s(a) ] / (t − a)</div>
            <div className="mt-1 text-sm">variação em s sobre variação em t</div>
          </div>
        </div>

        <p>
          É a <strong>mesma fórmula</strong> com letras trocadas: uma variação dividida pela variação
          que a causou, seguida de um encolhimento até zero. Esse objeto tem nome —{' '}
          <strong>taxa de variação instantânea</strong> — e daqui a alguns capítulos ele vai ganhar o
          nome definitivo de <strong>derivada</strong>.
        </p>

        <Callout tipo="info">
          É por isso que a seção 2.1 existe. Ela não ensina técnica nenhuma: ela mostra{' '}
          <em>por que</em> alguém precisou inventar limite. Todo o resto do capítulo é a construção da
          ferramenta que resolve estes dois problemas com rigor.
        </Callout>

        <Callout tipo="ia">
          Essa mesma razão é o gradiente. Treinar um modelo é perguntar &quot;se eu mexer um tiquinho
          neste parâmetro, quanto a perda varia?&quot; — variação da saída sobre variação da entrada,
          com a entrada tendendo a zero. O gradiente descendente é o problema da tangente rodando
          milhões de vezes por segundo.
        </Callout>

        <Checkpoint>
          Você sabe montar a inclinação de uma secante entre dois pontos, encolher o intervalo pelos dois
          lados e estimar a tangente; sabe passar de velocidade média para instantânea pela mesma conta;
          reconhece o 0/0 escondido no meio do caminho; e entende que tangente e velocidade são o mesmo
          problema. Isso fecha a seção 2.1 do Stewart.
        </Checkpoint>
      </Section>
    </article>
  );
}
