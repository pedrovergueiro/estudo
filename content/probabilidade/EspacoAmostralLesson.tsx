import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Espaço amostral e eventos. */
export function EspacoAmostralLesson() {
  return (
    <article className="space-y-10">
      <Section title="Espaço amostral: a lista de tudo que pode acontecer">
        <p>
          O <strong>espaço amostral S</strong> é o conjunto de todos os resultados possíveis de um
          experimento. Todo problema de probabilidade começa aqui — e boa parte dos erros vem de listar S
          errado.
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>uma moeda: S = &#123;C, K&#125;</div>
          <div>um dado: S = &#123;1, 2, 3, 4, 5, 6&#125;</div>
          <div>duas moedas: S = &#123;CC, CK, KC, KK&#125;</div>
          <div>tempo até uma lâmpada queimar: S = &#123;t | t ≥ 0&#125;</div>
        </div>

        <Callout tipo="atencao">
          Em duas moedas, <strong>CK e KC são resultados diferentes</strong> — a primeira moeda deu cara e
          a segunda coroa, ou o contrário. Quem escreve S = &#123;CC, CK, KK&#125; com três elementos
          calcula P(uma cara) = 1/3, quando a resposta é 2/4 = 1/2. Listar S com cuidado resolve metade
          dos problemas do capítulo.
        </Callout>

        <p>
          Repare no último exemplo: o espaço amostral pode ser <strong>infinito</strong>. Quando os
          resultados são contáveis (dados, moedas, número de defeitos), falamos em espaço{' '}
          <strong>discreto</strong>; quando formam um intervalo contínuo (tempo, peso, resistência),
          espaço <strong>contínuo</strong>. Essa divisão organiza os capítulos 5 e 6 do livro.
        </p>
      </Section>

      <Section title="Evento é um subconjunto de S">
        <p>
          Um <strong>evento</strong> é qualquer coleção de resultados. No lançamento de um dado:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>A = &quot;sair par&quot; = &#123;2, 4, 6&#125;</div>
          <div>B = &quot;sair maior que 4&quot; = &#123;5, 6&#125;</div>
        </div>

        <p>A partir daí, três operações resolvem praticamente tudo:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Complemento A′ — &quot;não A&quot;
            </div>
            <div className="font-mono text-sm">A′ = &#123;1, 3, 5&#125;</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Tudo que está em S mas não em A.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Interseção A ∩ B — &quot;A E B&quot;
            </div>
            <div className="font-mono text-sm">A ∩ B = &#123;6&#125;</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              O que está nos dois ao mesmo tempo.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              União A ∪ B — &quot;A OU B&quot;
            </div>
            <div className="font-mono text-sm">A ∪ B = &#123;2, 4, 5, 6&#125;</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              O que está em pelo menos um dos dois. Note que o 6 aparece uma vez só.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          Traduza o português para conjunto antes de calcular:
          <br />• <strong>&quot;e&quot;, &quot;ambos&quot;</strong> → interseção ∩
          <br />• <strong>&quot;ou&quot;, &quot;pelo menos um&quot;</strong> → união ∪
          <br />• <strong>&quot;não&quot;, &quot;nenhum&quot;</strong> → complemento ′
          <br />
          O &quot;ou&quot; da matemática é inclusivo: A ∪ B inclui o caso em que os dois acontecem.
        </Callout>
      </Section>

      <Section title="Mutuamente exclusivos: quando não dá para acontecer junto">
        <p>
          Dois eventos são <strong>mutuamente exclusivos</strong> (ou disjuntos) quando não podem ocorrer
          ao mesmo tempo — a interseção é vazia:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            A ∩ B = ∅
          </div>
        </div>

        <p>
          &quot;Sair par&quot; e &quot;sair ímpar&quot; são mutuamente exclusivos. Já &quot;sair par&quot;
          e &quot;sair maior que 4&quot; <strong>não são</strong>: o 6 satisfaz os dois.
        </p>

        <Callout tipo="atencao">
          Não confunda <strong>mutuamente exclusivos</strong> com <strong>independentes</strong>. São
          quase opostos:
          <br />• Mutuamente exclusivos: se um aconteceu, o outro <em>certamente não</em> aconteceu.
          <br />• Independentes: saber que um aconteceu <em>não muda nada</em> sobre o outro.
          <br />
          Dois eventos com probabilidade não nula que sejam mutuamente exclusivos são, necessariamente,
          <strong> dependentes</strong>. Essa confusão é a mais cobrada do capítulo.
        </Callout>

        <p>
          Diagramas de Venn ajudam de verdade aqui — dois círculos que se cruzam para eventos comuns,
          dois círculos separados para mutuamente exclusivos. Vale desenhar antes de escrever qualquer
          fórmula.
        </p>

        <Checkpoint>
          Você lista o espaço amostral com cuidado (inclusive distinguindo CK de KC), traduz enunciado em
          união, interseção e complemento, e sabe a diferença entre mutuamente exclusivos e independentes.
          A seguir: como contar os elementos de S quando listar um a um fica inviável.
        </Checkpoint>
      </Section>
    </article>
  );
}
