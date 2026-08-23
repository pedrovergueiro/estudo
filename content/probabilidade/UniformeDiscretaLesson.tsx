import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Distribuição uniforme discreta. */
export function UniformeDiscretaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Quando todo valor tem a mesma chance">
        <p>
          É a distribuição mais simples que existe, e por isso é o ponto de partida antes das outras: uma
          variável aleatória <strong>discreta uniforme</strong> assume N valores igualmente espaçados, e{' '}
          <strong>todos com a mesma probabilidade</strong>.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              X: &#123;a, a+1, ..., b&#125; &nbsp;&nbsp; f(x) = P(X = x) = 1/N
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              N = b − a + 1 = quantidade de valores possíveis
            </div>
          </div>
        </div>

        <p>
          O exemplo mais direto é o dado de seis faces: X = &#123;1, 2, 3, 4, 5, 6&#125;, e cada face tem
          f(x) = 1/6. Nenhuma face é mais provável que outra — é literalmente a definição de
          &quot;justo&quot;.
        </p>

        <Callout tipo="prova">
          Reconhecer a uniforme não exige fórmula nenhuma: se o enunciado descreve um sorteio{' '}
          <strong>&quot;honesto&quot;, &quot;equiprovável&quot; ou &quot;ao acaso entre a e b&quot;</strong>{' '}
          sem nenhuma condição a mais, é uniforme discreta. Ela é o caso mais simples de todas as
          distribuições do capítulo — as outras (binomial, Poisson…) descrevem situações onde a chance{' '}
          <em>não</em> é igual para todo resultado.
        </Callout>
      </Section>

      <Section title="Média e variância — e a conta com o dado">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            μ = (a + b) / 2 &nbsp;&nbsp;&nbsp; σ² = [(b − a + 1)² − 1] / 12
          </div>
        </div>

        <p>
          A média não tem mistério: é literalmente o <strong>ponto médio</strong> do intervalo — faz
          sentido, já que todos os valores pesam igual. A variância só vale para incremento 1 (valores
          inteiros consecutivos); com outro espaçamento, a fórmula muda.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — dado de 6 faces, X = valor obtido
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>a = 1, b = 6, N = 6</div>
            <div>f(x) = 1/6 para x = 1, 2, 3, 4, 5, 6</div>
            <div>μ = E(X) = (6 + 1)/2 = 3,5</div>
            <div>σ² = Var(X) = (6² − 1)/12 = 35/12</div>
            <div className="font-bold">σ² ≈ 2,92</div>
          </div>
        </div>

        <Callout tipo="atencao">
          Repare que <strong>μ = 3,5 não é um valor possível</strong> do dado — igual em qualquer
          esperança, ela é o centro de equilíbrio da distribuição, não uma previsão de resultado. É o
          mesmo aviso da aula de Esperança: não confunda &quot;valor esperado&quot; com &quot;valor mais
          provável&quot;.
        </Callout>

        <Callout tipo="ia">
          A uniforme é o motor por trás de qualquer <strong>sorteio sem viés</strong> em código:
          inicialização aleatória de pesos numa rede neural, embaralhar um dataset antes do treino,
          escolher um índice ao acaso num array. Sempre que você vê{' '}
          <span className="font-mono">random.randint(a, b)</span>, é literalmente esta distribuição
          rodando por baixo.
        </Callout>

        <Checkpoint>
          Você reconhece a uniforme discreta pelo enunciado (&quot;equiprovável&quot;, &quot;ao acaso
          entre a e b&quot;), calcula f(x) = 1/N sem nenhuma conta extra, e aplica μ = (a+b)/2 e
          σ² = [(b−a+1)² − 1]/12. É a distribuição mais simples — as próximas complicam o cenário
          introduzindo sucesso/fracasso e repetição de tentativas.
        </Checkpoint>
      </Section>
    </article>
  );
}
