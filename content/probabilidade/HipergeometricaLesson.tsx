import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Distribuição hipergeométrica, e resumo das distribuições discretas. */
export function HipergeometricaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Quando não há reposição — e a binomial deixa de valer">
        <p>
          Lembra do requisito 3 e 4 da binomial: p constante e tentativas independentes? Amostrar{' '}
          <strong>sem reposição</strong> de um lote quebra os dois — cada peça retirada muda a
          composição do que sobra. A <strong>hipergeométrica</strong> é a distribuição correta nesse
          cenário.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            f(x) = P(X = x) = C(K, x) · C(N−K, n−x) / C(N, n)
          </div>
        </div>

        <p>Traduzindo cada letra antes de qualquer conta:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>N</strong> — tamanho total da população (o lote inteiro).
          </div>
          <div>
            <strong>K</strong> — quantos &quot;sucessos&quot; existem em N (peças defeituosas, cartas de
            um naipe...).
          </div>
          <div>
            <strong>n</strong> — tamanho da amostra retirada.
          </div>
          <div>
            <strong>x</strong> — quantos sucessos você quer na amostra.
          </div>
        </div>

        <p>E os três pedaços da fórmula:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">C(K, x)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              De quantas formas escolher os x sucessos dentre os K que existem.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">C(N−K, n−x)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              De quantas formas escolher o resto da amostra (n − x) dentre os N − K que não são
              sucesso.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">C(N, n)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              O total de amostras de tamanho n possíveis, sem distinção nenhuma — o denominador de
              &quot;casos possíveis&quot;.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          Exemplo de tradução de enunciado: <em>&quot;Um lote com N = 50 peças tem K = 3
          defeituosas. Qual a probabilidade de uma amostra de n = 6 ter x = 2 defeituosas?&quot;</em>
          <div className="my-2 rounded bg-white/60 dark:bg-black/20 p-2 font-mono text-sm">
            P(X=2) = C(3,2)·C(47,4) / C(50,6) = 3 × 178.365 / 15.890.700 ≈ 0,0337
          </div>
          Cerca de 3,4%. O C(47,4) e o C(50,6) costumam ser grandes — é aceitável (e esperado) usar
          calculadora ou Excel para os fatoriais; o que a prova cobra é montar a fórmula certa, não fazer
          conta de cabeça.
        </Callout>
      </Section>

      <Section title="Conferindo pela probabilidade condicional">
        <p>
          Para amostras pequenas (n = 2), dá para calcular a hipergeométrica sem a fórmula de
          combinação, usando exatamente a regra multiplicativa da aula de{' '}
          <strong>Probabilidade Condicional</strong> — e o resultado bate:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Lote de N = 850 peças, K = 50 defeituosas. Seleciona-se n = 2 sem reposição.
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>P(X=0) = (800/850)(799/849) ≈ 0,886 &nbsp; (88,6%)</div>
            <div>
              P(X=1) = (800/850)(50/849) + (50/850)(800/849) ≈ 0,111 &nbsp; (11,1%)
            </div>
            <div>P(X=2) = (50/850)(49/849) ≈ 0,003 &nbsp; (0,3%)</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Repare no P(X=1): existem <strong>duas ordens</strong> (boa-defeituosa ou
            defeituosa-boa), por isso os dois produtos se somam — é a mesma lógica de &quot;duas
            maneiras&quot; que C(K,x) generaliza para amostras maiores.
          </p>
        </div>

        <Callout tipo="info">
          As três probabilidades somam 1 (0,886 + 0,111 + 0,003 = 1,000) — é a conferência padrão de
          qualquer distribuição, aqui ainda mais fácil porque só há três valores possíveis: 0, 1 ou 2
          defeituosas em 2 peças.
        </Callout>
      </Section>

      <Section title="Média, variância, e o vínculo com a binomial">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              μ = n·p &nbsp;&nbsp;&nbsp; σ² = n·p·(1−p) · (N−n)/(N−1)
            </div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">com p = K/N</div>
          </div>
        </div>

        <p>
          A média é <strong>idêntica</strong> à da binomial. A diferença toda está no fator{' '}
          <span className="font-mono">(N−n)/(N−1)</span>, chamado <strong>fator de correção da
          população finita</strong>:
        </p>

        <Callout tipo="atencao">
          Dois casos-limite explicam o fator de correção:
          <br />• Se <strong>n = N</strong> (amostra é a população inteira), (N−n)/(N−1) = 0 — variância
          zero, porque não sobra nenhuma incerteza: você sabe exatamente quantos defeitos tem.
          <br />• Se <strong>N for muito maior que n</strong> (lote gigante, amostra pequena), o fator
          se aproxima de 1 — a hipergeométrica quase vira uma binomial. É exatamente a regra prática já
          vista: <em>amostra menor que 5% da população → pode aproximar por binomial</em>.
        </Callout>

        <Callout tipo="ia">
          A hipergeométrica é o modelo certo para <strong>amostragem sem reposição na curadoria de
          dados</strong>: separar um conjunto de teste de um dataset fixo, ou calcular a chance de um
          lote de validação conter uma certa quantidade de exemplos de uma classe rara sem devolver os
          itens sorteados ao conjunto original.
        </Callout>
      </Section>

      <Section title="Resumo: as distribuições discretas lado a lado">
        <p>
          Fechando o bloco: a tabela abaixo é o mapa mental para decidir qual fórmula usar — útil
          porque na prova a fórmula é dada, mas <strong>reconhecer qual delas encaixa no
          enunciado</strong> é a parte que depende de você.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Distribuição</th>
                <th className="py-2 text-left font-medium text-gray-500">Pergunta que ela responde</th>
                <th className="py-2 text-left font-medium text-gray-500">f(x)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[13px]">
              {[
                ['Uniforme', 'Todo valor entre a e b é igualmente provável?', '1/N'],
                ['Binomial', 'x sucessos em n tentativas fixas, com reposição?', 'C(n,x)pˣ(1−p)ⁿ⁻ˣ'],
                ['Geométrica', 'Quantas tentativas até o 1º sucesso?', 'p(1−p)ˣ⁻¹'],
                [
                  'Binomial negativa',
                  'Quantas tentativas até o r-ésimo sucesso?',
                  'C(x−1,r−1)pʳ(1−p)ˣ⁻ʳ',
                ],
                [
                  'Hipergeométrica',
                  'x sucessos em n tentativas, sem reposição?',
                  'C(K,x)C(N−K,n−x)/C(N,n)',
                ],
                ['Poisson', 'x ocorrências num intervalo, com taxa λ?', 'λˣe⁻λ/x!'],
              ].map(([nome, pergunta, f]) => (
                <tr key={nome} className="border-b border-gray-100 dark:border-gray-800 align-top">
                  <td className="py-2 pr-3 font-bold text-gray-900 dark:text-gray-100">{nome}</td>
                  <td className="py-2 pr-3 font-sans text-gray-600 dark:text-gray-400">{pergunta}</td>
                  <td className="py-2">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout tipo="prova">
          Duas perguntas resolvem 90% da identificação:
          <br />
          <strong>1.</strong> Existe reposição (ou a amostra é bem menor que a população)? Se não →
          hipergeométrica.
          <br />
          <strong>2.</strong> O enunciado fixa o número de <em>tentativas</em> (binomial) ou fixa o
          número de <em>sucessos</em> e pergunta quantas tentativas precisou (geométrica / binomial
          negativa)? Se não há &quot;tentativas&quot; nenhuma, só uma taxa por intervalo → Poisson.
        </Callout>

        <Checkpoint>
          Você reconhece a hipergeométrica pela ausência de reposição, monta C(K,x)C(N−K,n−x)/C(N,n)
          traduzindo N, K, n e x do enunciado, sabe que μ = np é igual à binomial mas a variância carrega
          o fator de correção (N−n)/(N−1), e consegue decidir entre as seis distribuições discretas do
          capítulo olhando para o que o enunciado fixa: reposição, número de tentativas ou número de
          sucessos.
        </Checkpoint>
      </Section>
    </article>
  );
}
