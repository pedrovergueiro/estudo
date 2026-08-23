import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { BayesExplorer } from '@/components/interactive/BayesExplorer';

/** Aula: Teorema da probabilidade total e regra de Bayes. */
export function BayesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Probabilidade total: somar por caminhos">
        <p>
          Antes de Bayes vem a ferramenta que o sustenta. Se os eventos B₁, B₂, …, B<sub>k</sub>{' '}
          <strong>particionam</strong> o espaço amostral — são mutuamente exclusivos e cobrem tudo —
          então:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A) = Σ P(B<sub>i</sub>) · P(A | B<sub>i</sub>)
          </div>
        </div>

        <p>
          Em português: para achar a chance de A, considere <strong>todos os caminhos</strong> que levam
          a A e some as probabilidades de cada caminho. É exatamente o que um diagrama de árvore desenha.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo do livro — três máquinas produzindo peças defeituosas
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>B₁: 30% da produção, 2% defeituosas</div>
            <div>B₂: 45% da produção, 3% defeituosas</div>
            <div>B₃: 25% da produção, 2% defeituosas</div>
            <div className="pt-2">P(A) = (0,30)(0,02) + (0,45)(0,03) + (0,25)(0,02)</div>
            <div className="font-bold">P(A) = 0,006 + 0,0135 + 0,005 = 0,0245</div>
          </div>
        </div>

        <Callout tipo="prova">
          Confira sempre que as <strong>probabilidades da partição somam 1</strong> (aqui, 0,30 + 0,45 +
          0,25 = 1). Se não somam, você esqueceu um caminho — e o resultado sairá errado sem dar nenhum
          sinal.
        </Callout>
      </Section>

      <Section title="Bayes: inverter o condicionamento">
        <p>
          A probabilidade total responde &quot;qual a chance de sair defeituosa?&quot;. Bayes responde a
          pergunta invertida: <strong>&quot;saiu defeituosa — de qual máquina ela provavelmente
          veio?&quot;</strong>
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              P(B<sub>r</sub> | A) = P(B<sub>r</sub>)·P(A | B<sub>r</sub>) / Σ P(B<sub>i</sub>)·P(A | B
              <sub>i</sub>)
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              um caminho específico, dividido por todos os caminhos
            </div>
          </div>
        </div>

        <p>
          Continuando o exemplo: P(B₃ | A) = 0,005 / 0,0245 ≈ 0,204. Ou seja, dada uma peça defeituosa,
          há cerca de 20% de chance de ela ter vindo da máquina 3.
        </p>

        <Callout tipo="info">
          O <strong>denominador de Bayes é sempre a probabilidade total</strong>. Se você já calculou
          P(A), o resto é uma divisão. Por isso os dois assuntos vêm juntos: são a mesma árvore, lida em
          duas direções.
        </Callout>
      </Section>

      <Section title="Por que isso é contraintuitivo">
        <p>
          O exemplo clássico — e o que mais cai — é o teste médico. Ajuste os números e veja o resultado
          surpreender:
        </p>

        <BayesExplorer />

        <p>
          Com prevalência de 1%, sensibilidade de 99% e especificidade de 95%, um teste positivo
          significa apenas <strong>~17% de chance de estar doente</strong>. O motivo é aritmético, não
          filosófico: entre 10.000 pessoas há 100 doentes (99 detectados) e 9.900 sadios — e 5% deles dá
          495 alarmes falsos. Os falsos positivos são <em>cinco vezes</em> mais numerosos que os
          verdadeiros.
        </p>

        <Callout tipo="atencao">
          <strong>P(A | B) ≠ P(B | A).</strong> Esta é a lição central do tópico. &quot;A chance de o
          teste dar positivo, dado que a pessoa está doente&quot; (99%) e &quot;a chance de a pessoa
          estar doente, dado que o teste deu positivo&quot; (17%) são perguntas completamente diferentes.
          Trocá-las tem nome — falácia da taxa de base — e é o erro mais caro que se comete com
          probabilidade condicional.
        </Callout>

        <Callout tipo="ia">
          É o mesmo raciocínio por trás de <strong>precisão e recall</strong> em classificadores. Recall
          é P(detectou | é positivo); precisão é P(é positivo | detectou). Um modelo antifraude com 99%
          de recall pode ter precisão péssima se fraude for rara — exatamente pelo mesmo motivo do teste
          médico. Entender Bayes aqui é entender por que a métrica escolhida muda a avaliação do modelo.
        </Callout>

        <Checkpoint>
          Você monta a árvore, calcula P(A) somando todos os caminhos, aplica Bayes dividindo um caminho
          pelo total e — o mais importante — não confunde P(A|B) com P(B|A). Isso fecha o Capítulo 2.
        </Checkpoint>
      </Section>

      <Section title="A matriz de decisão: qual técnica usar na prova">
        <p>
          O Capítulo 2 dá quatro ferramentas parecidas, e a dificuldade real não é a conta — é escolher
          a certa. Uma pergunta resolve isso: <strong>o que exatamente o enunciado quer saber?</strong>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">O enunciado pergunta</th>
                <th className="py-2 text-left font-medium text-gray-500">Técnica</th>
                <th className="py-2 text-left font-medium text-gray-500">Fórmula</th>
              </tr>
            </thead>
            <tbody>
              {[
                [
                  'Chance de UM evento, sabendo que outro já ocorreu?',
                  'Probabilidade condicional',
                  'P(B|A)',
                ],
                [
                  'Chance de AMBOS ocorrerem juntos, em sequência?',
                  'Regra multiplicativa',
                  'P(A ∩ B)',
                ],
                [
                  'Tenho vários caminhos possíveis, quero a chance final de um resultado?',
                  'Probabilidade total',
                  'P(A) = ΣP(Bᵢ)P(A|Bᵢ)',
                ],
                [
                  'Sei o resultado final (ex: defeito) — de qual caminho ele provavelmente veio?',
                  'Teorema de Bayes',
                  'P(Bᵢ|A)',
                ],
              ].map(([pergunta, tecnica, formula]) => (
                <tr key={tecnica as string} className="border-b border-gray-100 dark:border-gray-800 align-top">
                  <td className="py-2 pr-3 text-gray-700 dark:text-gray-300">{pergunta}</td>
                  <td className="py-2 pr-3 font-bold text-gray-900 dark:text-gray-100">{tecnica}</td>
                  <td className="py-2 font-mono text-gray-600 dark:text-gray-400">{formula}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout tipo="prova">
          O sinal mais claro de que é <strong>Bayes</strong> e não probabilidade total: o enunciado dá
          o <em>efeito</em> (&quot;a peça saiu defeituosa&quot;) e pede a <em>causa</em>
          (&quot;qual máquina produziu?&quot;). Se a pergunta anda na direção causa → efeito, é
          probabilidade total; se anda efeito → causa, é Bayes. As duas usam a mesma árvore, só que lida
          em direções opostas.
        </Callout>
      </Section>
    </article>
  );
}
