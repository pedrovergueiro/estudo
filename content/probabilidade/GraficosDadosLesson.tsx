import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Métodos gráficos e descrição de dados. */
export function GraficosDadosLesson() {
  return (
    <article className="space-y-10">
      <Section title="Diagrama de pontos: para amostras pequenas">
        <p>
          É o gráfico mais pedido nos exercícios 1.3, 1.5 e 1.29 — e o mais simples: cada observação
          vira um ponto sobre a reta numérica. Quando dois valores coincidem, empilhe.
        </p>

        <p>
          Ele serve para comparar <strong>dois grupos de uma vez</strong>, colocando um acima do outro na
          mesma escala. Foi assim que ficou visível, no 1.3, que as resistências com e sem envelhecimento
          quase não se sobrepõem.
        </p>

        <Callout tipo="prova">
          Quando o exercício pede o diagrama de pontos <em>e</em> a média, marque a média no gráfico —
          um traço vertical basta. É o que transforma o desenho em argumento: dá para ver de uma vez a
          distância entre os centros comparada ao espalhamento de cada grupo.
        </Callout>
      </Section>

      <Section title="Ramo-e-folhas: o gráfico que não perde dado">
        <p>
          Cada número é quebrado em <strong>ramo</strong> (os dígitos da frente) e{' '}
          <strong>folha</strong> (o último dígito). Para as notas do Exercício 1.18, o ramo é a dezena:
        </p>

        <div className="overflow-x-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="whitespace-pre">{`ramo │ folhas
─────┼──────────────────
   1 │ 5 7
   2 │ 3 5
   3 │ 2 4 6
   4 │ 1 1 3 8
   5 │ 2 2 4 5 7
   6 │ 0 0 1 2 3 4 4 5 7 7 9
   7 │ 0 1 2 4 4 4 5 6 6 7 8 8 9 9
   8 │ 0 0 0 1 1 2 2 3 4 4 5 5 8 9
   9 │ 0 2 5 8`}</div>
          <div className="mt-2 text-xs text-gray-500">
            60 notas no total: 3 + 2 + 3 + 4 + 5 + 11 + 14 + 14 + 4
          </div>
        </div>

        <p>
          A vantagem sobre o histograma é que <strong>nenhuma informação se perde</strong>: dá para
          reconstruir todos os dados originais e, de quebra, ler a mediana contando posições. E o formato
          da &quot;barriga&quot; já mostra a distribuição — aqui, concentrada entre 60 e 89.
        </p>

        <Callout tipo="atencao">
          O Exercício 1.20 usa <strong>ramos desdobrados</strong>: 0*, 0•, 1*, 1•… onde * recebe as
          folhas de 0 a 4 e • recebe de 5 a 9. Isso dobra a resolução quando os dados são muito
          concentrados. Não é enfeite — sem desdobrar, os tempos de vida das moscas ficariam em três
          linhas ilegíveis.
        </Callout>
      </Section>

      <Section title="Histograma de frequências relativas">
        <p>O procedimento é mecânico, e é o mesmo dos exercícios 1.21, 1.22, 1.24 e 1.25:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Ache a amplitude e escolha as classes (intervalos de mesma largura).
          </div>
          <div>
            <strong>2.</strong> Conte quantos caem em cada classe — a frequência absoluta.
          </div>
          <div>
            <strong>3.</strong> Divida cada contagem por n — a frequência <strong>relativa</strong>.
          </div>
          <div>
            <strong>4.</strong> Desenhe barras coladas, com a altura na frequência relativa.
          </div>
        </div>

        <p>Para os dados de renda do Exercício 1.25, com classes de largura 10:</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-1.5 text-left font-medium text-gray-500">Classe</th>
                <th className="py-1.5 text-right font-medium text-gray-500">Freq.</th>
                <th className="py-1.5 text-right font-medium text-gray-500">Freq. rel.</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                ['[5, 15)', 6, '0,200'],
                ['[15, 25)', 7, '0,233'],
                ['[25, 35)', 7, '0,233'],
                ['[35, 45)', 2, '0,067'],
                ['[45, 55)', 1, '0,033'],
                ['[55, 65)', 4, '0,133'],
                ['[65, 75)', 2, '0,067'],
                ['[75, 85)', 0, '0,000'],
                ['[85, 95)', 1, '0,033'],
              ].map(([c, f, fr]) => (
                <tr key={c as string} className="border-b border-gray-100 dark:border-gray-800">
                  <td className="py-1">{c}</td>
                  <td className="py-1 text-right">{f}</td>
                  <td className="py-1 text-right">{fr}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-1">Total</td>
                <td className="py-1 text-right">30</td>
                <td className="py-1 text-right">1,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout tipo="info">
          As frequências relativas <strong>têm que somar 1</strong>. Se não somam, você errou uma
          contagem ou deixou um dado fora de todas as classes. É a conferência mais rápida que existe —
          faça sempre.
        </Callout>
      </Section>

      <Section title="Ler a assimetria — e ligar de volta com as médias">
        <p>
          O histograma da renda tem a maior parte das escolas abaixo de 35% e uma{' '}
          <strong>cauda esticada até 89,2%</strong>. Isso é uma distribuição{' '}
          <strong>assimétrica à direita</strong>, e ela deixa uma assinatura numérica:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 text-center">
            <div className="font-mono font-bold text-indigo-900 dark:text-indigo-100">
              mediana (26,35) &lt; aparada (30,97) &lt; média (33,31)
            </div>
          </div>
        </div>

        <p>
          A ordem não é acidente: a cauda à direita puxa a média para cima, a mediana ignora a cauda, e a
          aparada fica no meio porque descarta os extremos mas usa todo o resto. Numa distribuição
          simétrica as três coincidiriam — como acontece no Exercício 1.3, onde média e mediana ficam a
          menos de 1 psi uma da outra.
        </p>

        <Callout tipo="prova">
          Você consegue diagnosticar assimetria <strong>sem desenhar nada</strong>, só comparando média e
          mediana: média &gt; mediana indica cauda à direita; média &lt; mediana, cauda à esquerda; média
          ≈ mediana, distribuição aproximadamente simétrica.
        </Callout>

        <Checkpoint>
          Você monta diagrama de pontos, ramo-e-folhas (inclusive desdobrado), tabela de frequências e
          histograma, confere que as relativas somam 1 e lê assimetria tanto no desenho quanto na relação
          entre média e mediana.
        </Checkpoint>
      </Section>
    </article>
  );
}
