import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DistribuicaoDiscretaLab } from '@/components/interactive/DistribuicaoDiscretaLab';

/** Aula: Distribuição geométrica. */
export function GeometricaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Quantas tentativas até o primeiro sucesso">
        <p>
          A binomial pergunta &quot;em n tentativas, quantos sucessos?&quot;. A{' '}
          <strong>geométrica</strong> vira a pergunta ao contrário: repetindo tentativas de Bernoulli
          (só sucesso ou fracasso, probabilidade p constante, independentes), <strong>quantas tentativas
          até sair o primeiro sucesso?</strong>
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            X: &#123;1, 2, 3, ...&#125; &nbsp;&nbsp; f(x) = P(X = x) = p · (1 − p)<sup>x−1</sup>
          </div>
        </div>

        <p>Lida em partes, a fórmula é intuitiva:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">
              (1 − p)<sup>x−1</sup>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A chance de <strong>errar</strong> as x − 1 primeiras tentativas, uma atrás da outra.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">p</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A chance de <strong>acertar</strong> exatamente na tentativa x, a última.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          Não existe combinação C(n,x) aqui — e é a diferença que mais confunde com a binomial. Na
          geométrica só há <strong>uma ordem possível</strong>: errar, errar, ..., errar, acertar. Não há
          &quot;de quantas formas&quot; para contar, porque o sucesso é obrigatoriamente o último evento
          da sequência.
        </Callout>
      </Section>

      <Section title="Média, variância e o exemplo com substituição">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            μ = 1/p &nbsp;&nbsp;&nbsp; σ² = (1 − p)/p²
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — vendedor fecha venda com p = 0,3. P(fechar a 1ª venda exatamente na 4ª visita)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>p = 0,3, x = 4</div>
            <div>f(4) = 0,3 × (0,7)³</div>
            <div>= 0,3 × 0,343</div>
            <div className="font-bold">= 0,1029</div>
            <div className="pt-2">μ = 1/0,3 ≈ 3,33 visitas esperadas até a 1ª venda</div>
            <div>σ² = 0,7/0,3² ≈ 7,78</div>
          </div>
        </div>

        <Callout tipo="atencao">
          Para &quot;pelo menos x tentativas&quot; ou &quot;no máximo x tentativas&quot;, existe um
          atalho fechado — não precisa somar termo a termo:
          <br />
          <span className="font-mono">P(X ≤ x) = 1 − (1 − p)ˣ</span> &nbsp; e &nbsp;
          <span className="font-mono">P(X &gt; x) = (1 − p)ˣ</span>.
          <br />
          P(X &gt; x) é fácil de justificar sozinho: &quot;mais que x tentativas&quot; significa que as x
          primeiras falharam todas, sem exigir nada sobre a próxima.
        </Callout>

        <p>
          Vale conferir o atalho fazendo a soma na mão uma vez —{' '}
          <strong>&quot;o vendedor fecha a 1ª venda em até 4 visitas&quot;</strong>, ainda com p = 0,3:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Somando termo a termo</div>
            <div className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
              <div>f(1) = 0,3 × 0,7⁰ = 0,3000</div>
              <div>f(2) = 0,3 × 0,7¹ = 0,2100</div>
              <div>f(3) = 0,3 × 0,7² = 0,1470</div>
              <div>f(4) = 0,3 × 0,7³ = 0,1029</div>
              <div className="pt-1 font-bold">soma = 0,7599</div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-100">Pelo atalho</div>
            <div className="space-y-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              <div>P(X ≤ 4) = 1 − (0,7)⁴</div>
              <div>= 1 − 0,2401</div>
              <div className="pt-1 font-bold">= 0,7599 ✓</div>
            </div>
            <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
              Uma linha em vez de quatro. E com &quot;até 10 visitas&quot; a economia seria de dez contas
              para uma.
            </p>
          </div>
        </div>

        <DistribuicaoDiscretaLab />

        <Callout tipo="ia">
          A geométrica aparece toda vez que se mede &quot;quantas tentativas até dar certo&quot;: número
          de requisições até uma API responder com sucesso (retry policy), número de amostras de um
          random search até achar um hiperparâmetro que bate a métrica-alvo, número de rodadas de um
          teste A/B até um usuário converter.
        </Callout>

        <Checkpoint>
          Você reconhece a geométrica pela pergunta &quot;quantas tentativas até o primeiro
          sucesso&quot;, monta f(x) = p(1−p)ˣ⁻¹ sem combinação nenhuma, calcula μ = 1/p e σ² = (1−p)/p², e
          usa P(X &gt; x) = (1−p)ˣ como atalho. A próxima distribuição generaliza esta ideia para o
          r-ésimo sucesso, não só o primeiro.
        </Checkpoint>
      </Section>
    </article>
  );
}
