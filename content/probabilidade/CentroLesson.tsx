import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { OutlierLab } from '@/components/interactive/OutlierLab';

/** Aula: Medidas de localização — média, mediana e média aparada. */
export function CentroLesson() {
  return (
    <article className="space-y-10">
      <Section title="Quatro respostas para 'onde fica o centro?'">
        <p>
          A primeira coisa que se faz com um conjunto de dados é resumi-lo num número que represente o
          caso típico. Existem quatro candidatos, e a graça do Capítulo 1 é entender{' '}
          <strong>quando cada um mente</strong>.
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-violet-500 bg-violet-50 dark:bg-violet-950/40 p-4">
            <div className="font-bold text-violet-900 dark:text-violet-100">Moda</div>
            <p className="my-1 text-sm text-violet-900 dark:text-violet-100">
              O valor que <strong>mais se repete</strong>. Não soma, não ordena — só conta repetições.
            </p>
            <p className="text-sm text-violet-900 dark:text-violet-100">
              É a única das quatro que também serve para dados <strong>qualitativos</strong>: não dá para
              tirar a média de &quot;azul&quot; e &quot;verde&quot;, mas dá para achar a cor que mais
              aparece.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">Média amostral x̄</div>
            <div className="my-1 font-mono text-sm text-red-900 dark:text-red-100">
              x̄ = (x₁ + x₂ + ... + xₙ) / n
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Usa o <strong>valor</strong> de cada observação. Por isso um único ponto extremo a
              arrasta.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">Mediana x̃</div>
            <p className="my-1 text-sm text-emerald-900 dark:text-emerald-100">
              Ordene os dados. Com n ímpar, é o do meio. Com n par, é a média dos dois centrais.
            </p>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Usa só a <strong>posição</strong>. Por isso não liga para o quanto o extremo é extremo.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="font-bold text-sky-900 dark:text-sky-100">Média aparada</div>
            <p className="my-1 text-sm text-sky-900 dark:text-sky-100">
              Descarta uma porcentagem dos menores e dos maiores, e tira a média do que sobra.
            </p>
            <p className="text-sm text-sky-900 dark:text-sky-100">
              Meio-termo: mais robusta que a média, mais informativa que a mediana.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          <strong>Como aparar corretamente:</strong> a média aparada de 10% com n = 10 descarta{' '}
          <em>um</em> valor de cada ponta (10% de 10 = 1), sobrando 8. Com n = 30, descarta{' '}
          <em>três</em> de cada lado, sobrando 24. Sempre ordene os dados primeiro — aparar sem ordenar
          é o erro mais comum.
        </Callout>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — notas: 6, 7, 8, 8, 9, 8, 10, 7
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>6 → 1×, &nbsp; 7 → 2×, &nbsp; 8 → 3×, &nbsp; 9 → 1×, &nbsp; 10 → 1×</div>
            <div className="font-bold">Moda = 8 (a que mais se repete)</div>
          </div>
        </div>

        <Callout tipo="atencao">
          A moda pode dar mais de um valor, ou nenhum — e isso <strong>não é erro seu</strong>, é a
          resposta certa:
          <br />• Um valor no topo → <strong>unimodal</strong>.
          <br />• Dois valores empatados no topo → <strong>bimodal</strong> (as duas contam como moda,
          não &quot;nenhuma&quot;).
          <br />• Três ou mais empatados → <strong>multimodal</strong>.
          <br />• Ninguém se repete → <strong>amodal</strong>, o conjunto não tem moda.
        </Callout>
      </Section>

      <Section title="O experimento que mostra a diferença">
        <p>
          Não adianta decorar &quot;a média é sensível a outliers&quot;. Veja acontecer com os dados
          reais do Exercício 1.13:
        </p>

        <OutlierLab />

        <p>
          Com a décima bateria em 175 h, a média vai para 124,3 h enquanto a mediana fica em 120,0 h. As
          outras nove baterias estão todas entre 110 e 126 h — <strong>nenhuma delas dura 124,3 h</strong>{' '}
          e nenhuma chega perto de 175. A média está descrevendo uma bateria que não existe.
        </p>

        <Callout tipo="atencao">
          Quando <strong>média e mediana ficam muito diferentes</strong>, isso é um sinal de alerta:
          ou há valores atípicos, ou a distribuição é assimétrica. É a resposta esperada no item (b) do
          Exercício 1.13 — a característica responsável pela diferença é justamente a observação de
          175 h.
        </Callout>
      </Section>

      <Section title="Comparar dois grupos: a armadilha do Exercício 1.5">
        <p>
          O uso mais importante dessas medidas é comparar grupos. E é aí que a escolha errada leva à
          conclusão errada. No estudo do regime alimentar:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Grupo</th>
                <th className="py-2 text-right font-medium text-gray-500">Média</th>
                <th className="py-2 text-right font-medium text-gray-500">Mediana</th>
                <th className="py-2 text-right font-medium text-gray-500">Aparada 10%</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">Controle</td>
                <td className="py-1.5 text-right">5,60</td>
                <td className="py-1.5 text-right">5,00</td>
                <td className="py-1.5 text-right">5,125</td>
              </tr>
              <tr>
                <td className="py-1.5">Tratamento</td>
                <td className="py-1.5 text-right">7,60</td>
                <td className="py-1.5 text-right">4,50</td>
                <td className="py-1.5 text-right">5,625</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Pela <strong>média</strong>, o tratamento parece bem melhor: reduz 7,6 contra 5,6. Mas essa
          vantagem inteira vem de <strong>um único paciente que reduziu 37</strong>. Sem ele, a média do
          tratamento cai para 4,3 — abaixo do controle.
        </p>

        <p>
          Pela <strong>mediana</strong> (4,5 contra 5,0) e pela <strong>aparada</strong> (5,625 contra
          5,125), os dois grupos estão empatados. A conclusão honesta: não há evidência de que o regime
          funcione; há um caso isolado de resposta muito grande.
        </p>

        <Callout tipo="ia">
          O mesmo raciocínio vale em ciência de dados. Ao reportar &quot;tempo médio de resposta&quot; de
          um sistema, alguns pedidos travados de 30 segundos inflam a média e escondem que 95% das
          requisições respondem em 200 ms. Por isso relatórios sérios reportam a{' '}
          <strong>mediana e os percentis</strong>, não a média.
        </Callout>

        <Checkpoint>
          Você calcula moda, média, mediana e média aparada, sabe aparar a quantidade certa de cada
          ponta, reconhece quando um conjunto é bimodal ou amodal, e — o mais importante — sabe decidir
          qual medida descreve honestamente o conjunto. A próxima pergunta é sobre o espalhamento: duas
          amostras podem ter o mesmo centro e serem completamente diferentes.
        </Checkpoint>
      </Section>
    </article>
  );
}
