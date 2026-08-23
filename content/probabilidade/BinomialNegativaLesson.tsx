import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Distribuição binomial negativa. */
export function BinomialNegativaLesson() {
  return (
    <article className="space-y-10">
      <Section title="A geométrica generalizada: até o r-ésimo sucesso">
        <p>
          A geométrica para na <strong>primeira</strong> vitória. A{' '}
          <strong>binomial negativa</strong> pergunta a mesma coisa, mas para no{' '}
          <strong>r-ésimo</strong> sucesso: quantas tentativas de Bernoulli são necessárias até
          acumular r sucessos?
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            f(x) = P(X = x) = C(x−1, r−1) · p<sup>r</sup> · (1 − p)<sup>x−r</sup>
          </div>
        </div>

        <p>
          A leitura em partes é quase igual à binomial, com uma diferença que costuma passar batido:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">
              p<sup>r</sup> · (1 − p)<sup>x−r</sup>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A chance de acontecerem os r sucessos e os x − r fracassos, na quantidade certa.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">C(x−1, r−1)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              De quantas formas os primeiros x − 1 resultados podem conter r − 1 sucessos — e não C(x, r).
              A última tentativa (a x-ésima) é <strong>obrigatoriamente</strong> o r-ésimo sucesso, então
              ela não entra na combinação: só as x − 1 tentativas anteriores podem variar de ordem.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          A <strong>geométrica é o caso particular r = 1</strong> da binomial negativa. Substitua r = 1:
          C(x−1, 0) = 1 sempre, e a fórmula colapsa direto em f(x) = p(1−p)ˣ⁻¹ — exatamente a geométrica.
          Se a prova pedir para você mostrar essa relação, é só isso.
        </Callout>
      </Section>

      <Section title="Média, variância e o exemplo com substituição">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            μ = r/p &nbsp;&nbsp;&nbsp; σ² = (1 − p)·r / p²
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — mesmo vendedor, p = 0,3. P(precisar de exatamente 6 visitas para fechar a 3ª
            venda)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>r = 3, p = 0,3, x = 6</div>
            <div>C(5, 2) = 10</div>
            <div>f(6) = 10 × (0,3)³ × (0,7)³</div>
            <div>= 10 × 0,027 × 0,343</div>
            <div className="font-bold">≈ 0,0926</div>
            <div className="pt-2">μ = 3/0,3 = 10 visitas esperadas até a 3ª venda</div>
            <div>σ² = 0,7 × 3 / 0,3² ≈ 23,33</div>
          </div>
        </div>

        <Callout tipo="atencao">
          Confira sempre <strong>x ≥ r</strong> antes de calcular — não dá para fechar 3 vendas em menos
          de 3 visitas. Se o exercício der um x menor que r, a probabilidade é zero e não existe conta a
          fazer.
        </Callout>

        <Callout tipo="ia">
          Aparece em modelos de <strong>contagem superdispersa</strong> (quando a variância dos dados é
          maior que a média, o que quebra a suposição da Poisson): número de cliques até a r-ésima
          conversão numa campanha, número de chamadas de API até o r-ésimo erro tratado. É por isso que a
          binomial negativa é uma alternativa comum à Poisson em modelos de contagem em ciência de dados.
        </Callout>

        <Checkpoint>
          Você reconhece a binomial negativa pela pergunta &quot;quantas tentativas até o r-ésimo
          sucesso&quot;, entende por que a combinação é C(x−1, r−1) e não C(x, r), calcula μ = r/p e
          σ² = (1−p)r/p², e sabe que r = 1 recupera a geométrica.
        </Checkpoint>
      </Section>
    </article>
  );
}
