import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Probabilidade de um evento e regras aditivas. */
export function RegrasAditivasLesson() {
  return (
    <article className="space-y-10">
      <Section title="Os axiomas: as três regras que tudo obedece">
        <p>
          Antes de qualquer cálculo, três fatos que valem sempre — e que servem para{' '}
          <strong>conferir resposta</strong>:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>0 ≤ P(A) ≤ 1</div>
          <div>P(S) = 1 &nbsp;&nbsp;← algum resultado vai acontecer</div>
          <div>P(∅) = 0 &nbsp;&nbsp;← o impossível não acontece</div>
        </div>

        <Callout tipo="atencao">
          Probabilidade <strong>nunca</strong> é negativa nem maior que 1. Se sua conta deu 1,4 ou −0,2,
          não é questão de arredondamento: há erro de método — quase sempre somar coisas que se
          sobrepõem. O Exercício 2.51 do livro é literalmente &quot;encontre os erros&quot; em
          afirmações desse tipo.
        </Callout>

        <p>
          Quando todos os resultados de S são <strong>igualmente prováveis</strong>, vale a definição
          clássica: P(A) = n(A)/n(S), casos favoráveis sobre casos possíveis. É onde a contagem do tópico
          anterior entra.
        </p>
      </Section>

      <Section title="A regra aditiva: cuidado com a sobreposição">
        <p>A fórmula geral, para dois eventos quaisquer:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A ∪ B) = P(A) + P(B) − P(A ∩ B)
          </div>
        </div>

        <p>
          O termo que se subtrai é a alma da fórmula. Ao somar P(A) e P(B), os resultados que estão nos
          dois eventos foram contados <strong>duas vezes</strong> — a subtração corrige isso. No diagrama
          de Venn, é a área da sobreposição.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — um dado, A = par, B = maior que 4
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>A = &#123;2,4,6&#125; → P(A) = 3/6</div>
            <div>B = &#123;5,6&#125; → P(B) = 2/6</div>
            <div>A ∩ B = &#123;6&#125; → P(A ∩ B) = 1/6</div>
            <div className="pt-1 font-bold">P(A ∪ B) = 3/6 + 2/6 − 1/6 = 4/6 = 2/3</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Conferindo pela lista: A ∪ B = &#123;2, 4, 5, 6&#125;, quatro resultados em seis ✓. Sem
            subtrair, daria 5/6 — errado, porque o 6 teria sido contado duas vezes.
          </p>
        </div>

        <p>
          <strong>Caso especial:</strong> se A e B são mutuamente exclusivos, P(A ∩ B) = 0 e a fórmula
          simplifica para P(A ∪ B) = P(A) + P(B). Só nesse caso você pode somar direto.
        </p>

        <Callout tipo="prova">
          Antes de somar probabilidades, pergunte sempre: <strong>esses eventos podem acontecer
          juntos?</strong> Se podem, você é obrigado a subtrair a interseção. Somar direto sem verificar
          é o erro que produz respostas maiores que 1.
        </Callout>
      </Section>

      <Section title="A regra do complemento: o atalho do 'pelo menos um'">
        <p>Talvez a ferramenta mais econômica do capítulo:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A) = 1 − P(A′)
          </div>
        </div>

        <p>
          Ela vale ouro quando o enunciado diz <strong>&quot;pelo menos um&quot;</strong>. Calcular
          diretamente exigiria somar os casos de exatamente um, exatamente dois, exatamente três… O
          complemento de &quot;pelo menos um&quot; é simplesmente <strong>&quot;nenhum&quot;</strong> —
          um único caso.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — quatro programas testados, falha de 1% cada
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>P(nenhum falha) = 0,99⁴ = 0,9606</div>
            <div className="font-bold">P(pelo menos um falha) = 1 − 0,9606 = 0,0394</div>
          </div>
        </div>

        <Callout tipo="info">
          O livro usa o complemento também no Exemplo da Seção 2.5: se P(X &lt; 1990) = 0,005, então
          P(X &gt; 1990) = 1 − 0,005 = 0,995. Uma linha em vez de uma soma longa.
        </Callout>

        <p>
          A regra aditiva se estende para três eventos, com um padrão de inclusão e exclusão que alterna
          sinais:
        </p>

        <div className="overflow-x-auto rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="whitespace-pre">{`P(A ∪ B ∪ C) = P(A) + P(B) + P(C)
               − P(A∩B) − P(A∩C) − P(B∩C)
               + P(A∩B∩C)`}</div>
        </div>

        <p>
          Some os individuais, tire os pares, devolva o triplo — porque a interseção dos três foi somada
          três vezes e subtraída três vezes, ficando de fora.
        </p>

        <Checkpoint>
          Você conhece os três axiomas e os usa para conferir respostas, aplica a regra aditiva
          subtraindo a interseção quando os eventos se sobrepõem, e usa o complemento para resolver
          &quot;pelo menos um&quot; em uma linha. Falta a pergunta mais interessante: e quando uma
          informação muda a probabilidade da outra?
        </Checkpoint>
      </Section>
    </article>
  );
}
