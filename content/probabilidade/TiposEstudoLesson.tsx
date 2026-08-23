import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: População, amostra e os três tipos de estudo estatístico. */
export function TiposEstudoLesson() {
  return (
    <article className="space-y-10">
      <Section title="População e amostra: o vocabulário que organiza tudo">
        <p>
          <strong>População</strong> é o conjunto completo sobre o qual você quer concluir alguma coisa —
          todas as baterias que a fábrica produz, todos os adultos entre 30 e 40 anos.{' '}
          <strong>Amostra</strong> é o pedaço que você realmente mediu.
        </p>

        <p>
          Toda a disciplina existe porque medir a população inteira é impossível ou destrutivo (testar a
          resistência de uma bateria consome a bateria). Então você mede uma amostra e{' '}
          <strong>infere</strong> — daí o nome inferência estatística.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="mb-1 font-bold text-sky-900 dark:text-sky-100">Parâmetro</div>
            <div className="font-mono text-sm text-sky-900 dark:text-sky-100">μ, σ, σ²</div>
            <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
              Descreve a <strong>população</strong>. É um número fixo e desconhecido. Letra grega.
            </p>
          </div>
          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="mb-1 font-bold text-amber-900 dark:text-amber-100">Estatística</div>
            <div className="font-mono text-sm text-amber-900 dark:text-amber-100">x̄, s, s²</div>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              Descreve a <strong>amostra</strong>. Você calcula, e muda de amostra para amostra. Letra
              latina.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          A convenção das letras é cobrada e vale de graça: <strong>grega = população</strong>,{' '}
          <strong>latina = amostra</strong>. Escrever &quot;μ = 124,3&quot; quando você calculou a média
          de dez baterias é um erro conceitual — o certo é x̄ = 124,3, uma <em>estimativa</em> de μ.
        </Callout>

        <p>
          <strong>Amostragem aleatória simples</strong> é o procedimento em que cada elemento da
          população tem a mesma chance de entrar na amostra. É a hipótese que sustenta tudo o que vem
          depois — e é por isso que o Exercício 1.1 avisa explicitamente &quot;suponha que as medidas
          sejam uma amostra aleatória simples&quot;.
        </p>
      </Section>

      <Section title="Os três tipos de estudo">
        <p>
          A Seção 1.9 classifica os estudos em três tipos, e a diferença entre eles decide{' '}
          <strong>o que você tem direito de concluir</strong>:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              Experimento planejado
            </div>
            <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
              O pesquisador <strong>controla</strong> os níveis dos fatores e sorteia quem recebe o quê.
              É o caso do Exercício 1.3 (dez espécimes escolhidos aleatoriamente para envelhecer) e do
              1.27 (três cargas fixadas em 700, 1.000 e 1.300 lb).
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-900 dark:text-emerald-100">
              → único que permite falar em <strong>causa</strong>.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">Estudo observacional</div>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              Você observa e registra, sem interferir. O Exercício 1.17 (fumantes × não fumantes) é
              assim: ninguém foi sorteado para fumar.
            </p>
            <p className="mt-1 text-sm font-medium text-amber-900 dark:text-amber-100">
              → mostra <strong>associação</strong>, não causa.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-gray-400 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">Estudo retrospectivo</div>
            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
              Usa dados <strong>históricos</strong>, coletados no passado para outra finalidade. Os
              salários das 30 escolas (Exercício 1.24) e o consumo de energia do Exercício 12.9 são
              retrospectivos.
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              → nenhum controle sobre como os dados nasceram.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          O Exercício 1.26 pede exatamente isso: qual a desvantagem de usar os dados dos exercícios 1.24
          e 1.25 para prever salário a partir da renda das famílias? A resposta é que são{' '}
          <strong>dados retrospectivos</strong> — ninguém controlou nada, então uma relação encontrada
          pode ser explicada por variáveis não medidas (região, porte da escola, ano). Modelo construído
          sobre observação prevê, mas não prova causa.
        </Callout>
      </Section>

      <Section title="Interação: quando um fator depende do outro">
        <p>
          O par de exercícios 1.28 e 1.29 é o exemplo mais bonito do capítulo, e só funciona porque são{' '}
          <strong>experimentos planejados</strong> — os dois fatores foram fixados de propósito:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Temperatura do molde</th>
                <th className="py-2 text-right font-medium text-gray-500">Veloc. baixa</th>
                <th className="py-2 text-right font-medium text-gray-500">Veloc. alta</th>
                <th className="py-2 text-right font-medium text-gray-500">Efeito</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">Baixa (1.28)</td>
                <td className="py-1.5 text-right">72,674</td>
                <td className="py-1.5 text-right">71,606</td>
                <td className="py-1.5 text-right">−1,068</td>
              </tr>
              <tr>
                <td className="py-1.5">Alta (1.29)</td>
                <td className="py-1.5 text-right">76,090</td>
                <td className="py-1.5 text-right">93,168</td>
                <td className="py-1.5 text-right">+17,078</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Com o molde frio, aumentar a velocidade <em>reduz</em> o encolhimento. Com o molde quente, a
          mesma mudança <em>dispara</em> o encolhimento. O efeito da velocidade{' '}
          <strong>muda de sinal</strong> conforme a temperatura: isso é <strong>interação</strong>.
        </p>

        <p>
          Num gráfico de interação, as duas retas ficam <strong>não paralelas</strong>. Sem interação,
          seriam paralelas. A consequência prática é forte: não existe &quot;velocidade de injeção
          ideal&quot; sem antes fixar a temperatura — os fatores têm que ser escolhidos juntos.
        </p>

        <Callout tipo="info">
          É exatamente por isso que o Exercício 1.30 pergunta se essa informação poderia vir de um{' '}
          <strong>estudo observacional</strong>. Não poderia: sem controlar os dois fatores nos quatro
          combos, você nunca observaria a inversão. Detectar interação exige planejamento.
        </Callout>

        <Checkpoint>
          Você distingue população de amostra, parâmetro de estatística (com as letras certas), classifica
          um estudo nos três tipos e sabe o que cada um autoriza concluir. Também reconhece interação
          entre fatores. Isso fecha o Capítulo 1 — a partir daqui, entra probabilidade.
        </Checkpoint>
      </Section>
    </article>
  );
}
