import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { CombinationExplorer } from '@/components/interactive/CombinationExplorer';

/** Aula: Combinação Linear. */
export function CombinacaoLesson() {
  return (
    <article className="space-y-10">
      <Section title="Combinação linear é uma receita">
        <p>
          Uma <strong>combinação linear</strong> é o que você obtém multiplicando alguns vetores por
          números e somando tudo:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            c₁·v₁ + c₂·v₂ + ... + cₙ·vₙ
          </div>
        </div>

        <p>
          É literalmente uma receita: os vetores são os ingredientes e os escalares são as
          quantidades. Mexa nos controles e veja a receita mudando o resultado:
        </p>

        <CombinationExplorer />
      </Section>

      <Section title="Span: tudo o que dá para alcançar">
        <p>
          O <strong>span</strong> (ou &quot;espaço gerado&quot;) de um conjunto de vetores é o
          conjunto de <em>todos</em> os resultados possíveis de combinações lineares deles. É a
          resposta para: &quot;com esses ingredientes, quais pratos consigo fazer?&quot;
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Um vetor não-nulo', d: 'Gera uma RETA passando pela origem — a reta na direção dele.' },
            { t: 'Dois vetores independentes em R²', d: 'Geram o PLANO todo. Qualquer ponto é alcançável.' },
            { t: 'Dois vetores dependentes', d: 'Geram só uma RETA. O segundo vetor não acrescentou nada de novo.' },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">{x.t}</div>
              <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{x.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Dependência e independência linear">
        <p>Este é o conceito que define os dois casos que você comparou no interativo acima:</p>

        <div className="space-y-3">
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
              Linearmente INDEPENDENTES
            </div>
            <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
              Nenhum dos vetores pode ser escrito como combinação dos outros. Cada um traz uma
              direção genuinamente nova. São os &quot;ingredientes essenciais&quot; — tirar qualquer
              um reduz o que você consegue alcançar.
            </p>
          </div>

          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
              Linearmente DEPENDENTES
            </div>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              Pelo menos um deles é combinação dos outros — é redundante. Você pode jogá-lo fora sem
              perder nada do span. É informação repetida com outra roupa.
            </p>
          </div>
        </div>

        <p>Como testar na prática, sem apelar para intuição:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>Monte a equação c₁v₁ + c₂v₂ + ... = 0 (o vetor nulo).</li>
          <li>Isso vira um sistema linear homogêneo nos escalares c.</li>
          <li>
            Escalone (é o mesmo Gauss do tópico 3!). Se a <strong>única</strong> solução for
            c₁ = c₂ = ... = 0, os vetores são independentes. Se houver outras soluções, são
            dependentes.
          </li>
        </ol>

        <Callout tipo="info">
          Repare como tudo se conecta: testar independência linear é resolver um sistema linear. As
          ferramentas da Parte 1 voltam aqui — não são assuntos separados, é o mesmo maquinário
          sendo reaproveitado.
        </Callout>

        <Callout tipo="prova">
          Atalho para 2 vetores: eles são dependentes se, e somente se, um é múltiplo do outro.
          Basta olhar. Para (2,1) e (4,2), veja que o segundo é 2× o primeiro → dependentes. Para
          3 vetores ou mais, escalone — olhar não basta.
        </Callout>

        <Callout tipo="ia">
          Features linearmente dependentes num dataset são um problema real (multicolinearidade):
          duas colunas que dizem a mesma coisa deixam o modelo instável, sem melhorar previsão.
          Detectar e remover redundância é exatamente aplicar independência linear em dados.
        </Callout>

        <Checkpoint>
          Você sabe montar combinações lineares, entende o que é span e sabe testar dependência
          linear escalonando o sistema homogêneo. Isso é o pré-requisito direto de base e dimensão.
        </Checkpoint>
      </Section>
    </article>
  );
}
