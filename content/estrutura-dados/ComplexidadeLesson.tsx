import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { ContadorAlgoritmos } from '@/components/interactive/ContadorAlgoritmos';
import { EscalaComplexidade } from '@/components/interactive/EscalaComplexidade';

/** Aula: Análise de complexidade e notação Big O — montada sobre a atividade da disciplina. */
export function ComplexidadeLesson() {
  return (
    <article className="space-y-10">
      <Section title="Big O não mede tempo. Mede crescimento.">
        <p>
          A primeira armadilha do assunto é achar que complexidade é sobre velocidade. Não é. Um
          algoritmo O(n²) rodando num servidor pode ser mais rápido que um O(n) rodando no seu
          notebook — para uma entrada pequena.
        </p>

        <p>
          O que a notação Big O responde é outra pergunta:{' '}
          <strong>se eu dobrar a entrada, o que acontece com o trabalho?</strong>
        </p>

        <div className="space-y-2">
          {[
            ['O(1)', 'Nada muda. O custo é o mesmo com 10 ou com 10 milhões.', 'border-emerald-600'],
            ['O(log n)', 'Sobe UMA operação. Dobrar a entrada custa um passo a mais.', 'border-emerald-500'],
            ['O(n)', 'Dobra também. Entrada 2×, trabalho 2×.', 'border-sky-500'],
            ['O(n²)', 'Quadruplica. Entrada 2×, trabalho 4×.', 'border-red-500'],
          ].map(([classe, efeito, cor]) => (
            <div key={classe} className={`rounded-lg border-l-4 ${cor} bg-gray-50 dark:bg-gray-800/50 p-3`}>
              <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{classe}</span>
              <span className="ml-3 text-[15px] text-gray-700 dark:text-gray-300">{efeito}</span>
            </div>
          ))}
        </div>

        <Callout tipo="info">
          Por isso o Big O <strong>joga fora constantes e termos menores</strong>. Um algoritmo que faz
          3n + 50 operações é O(n): quando n vira um milhão, o 50 é irrelevante e o 3 não muda o
          formato da curva. O que sobra é o termo que <em>domina</em> o crescimento.
        </Callout>
      </Section>

      <Section title="Os quatro algoritmos da atividade">
        <p>
          A Parte 1 pede para contar quantas vezes o <span className="font-mono">print</span> executa.
          Antes de olhar a tabela pronta, mexa no n abaixo e confira você mesmo — os números são
          contados rodando os laços, não estimados por fórmula:
        </p>

        <ContadorAlgoritmos />

        <p>Fechando a tabela da questão 1 e a da questão 2 de uma vez:</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Algoritmo</th>
                <th className="py-2 text-right font-medium text-gray-500">n = 10</th>
                <th className="py-2 text-right font-medium text-gray-500">n = 100</th>
                <th className="py-2 text-right font-medium text-gray-500">n = 1.000</th>
                <th className="py-2 text-right font-medium text-gray-500">Complexidade</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                ['A', '10', '100', '1.000', 'O(n)', 'text-sky-600 dark:text-sky-400'],
                ['B', '100', '10.000', '1.000.000', 'O(n²)', 'text-red-600 dark:text-red-400'],
                ['C', '4', '7', '10', 'O(log n)', 'text-emerald-600 dark:text-emerald-400'],
                ['D', '20', '200', '2.000', 'O(n)', 'text-amber-600 dark:text-amber-400'],
              ].map(([alg, a, b, c, o, cor]) => (
                <tr key={alg} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-1.5 font-bold text-gray-900 dark:text-gray-100">{alg}</td>
                  <td className="py-1.5 text-right">{a}</td>
                  <td className="py-1.5 text-right">{b}</td>
                  <td className="py-1.5 text-right">{c}</td>
                  <td className={`py-1.5 text-right font-bold ${cor}`}>{o}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              Por que o C dá 4, 7 e 10 — e não um número redondo
            </div>
            <p className="mt-1 text-[15px] text-gray-700 dark:text-gray-300">
              O <span className="font-mono">i</span> começa em 1 e <strong>dobra</strong> a cada volta.
              Para n = 10 ele imprime 1, 2, 4 e 8 — para em 16, que já não é menor que 10. São{' '}
              <strong>4 voltas</strong>. Para n = 1.000: 1, 2, 4, …, 512 → <strong>10 voltas</strong>,
              porque 1024 estoura.
            </p>
            <p className="mt-2 text-[15px] text-gray-700 dark:text-gray-300">
              Repare no salto: a entrada foi de 10 para 1.000 (<strong>100 vezes maior</strong>) e o
              trabalho foi de 4 para 10 (<strong>menos que triplicou</strong>). Isso é log₂(n): a
              pergunta &quot;quantas vezes preciso dobrar 1 até chegar em n?&quot;.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              Por que o D é O(n), e não O(2n)
            </div>
            <p className="mt-1 text-[15px] text-gray-700 dark:text-gray-300">
              O D faz exatamente o <strong>dobro</strong> do trabalho do A — 2.000 contra 1.000 em
              n = 1.000. E mesmo assim os dois são O(n).
            </p>
            <p className="mt-2 text-[15px] text-gray-700 dark:text-gray-300">
              Não é desleixo da notação: os laços do D estão <strong>lado a lado</strong>, então é
              n + n = 2n, e o 2 é uma constante. Dobre a entrada e os dois dobram o trabalho —{' '}
              <em>a curva tem o mesmo formato</em>. Já os laços do B estão{' '}
              <strong>aninhados</strong>, e aí é n × n, o que muda o formato da curva.
            </p>
            <div className="mt-2 rounded bg-gray-50 dark:bg-gray-800/50 p-3 font-mono text-sm text-gray-800 dark:text-gray-200">
              laços LADO A LADO → soma → n + n = 2n → O(n)
              <br />
              laços ANINHADOS &nbsp;→ produto → n × n = n² → O(n²)
            </div>
          </div>
        </div>

        <Callout tipo="atencao">
          A pergunta que decide entre O(n) e O(n²) não é &quot;quantos laços tem?&quot;, é{' '}
          <strong>&quot;um laço está DENTRO do outro?&quot;</strong>. Dez laços em sequência ainda são
          O(n). Dois laços aninhados já são O(n²). Conte a <em>profundidade do aninhamento</em>, não a
          quantidade de <span className="font-mono">for</span>.
        </Callout>
      </Section>

      <Section title="Quem cresce mais rápido, e quem aguenta entrada grande">
        <p>
          As questões 3 e 4 são o mesmo eixo, lidas nas duas pontas.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              Q3 — cresce mais rápido: o <strong>B</strong>
            </div>
            <p className="mt-1 text-sm text-red-900 dark:text-red-100">
              De n = 10 para n = 1.000, a entrada ficou 100 vezes maior. O A saiu de 10 para 1.000:{' '}
              <strong>100 vezes mais trabalho</strong>. O B saiu de 100 para 1.000.000:{' '}
              <strong>10.000 vezes mais</strong>. O crescimento do B é o quadrado do crescimento da
              entrada — é literalmente o que O(n²) quer dizer.
            </p>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              Q4 — aguenta entrada grande: o <strong>C</strong>
            </div>
            <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-100">
              O(log n) é a única classe aqui que quase não sente o tamanho da entrada. Com um bilhão de
              registros, o C faria <strong>30 voltas</strong>. O A faria um bilhão; o B, um
              quintilhão.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          <strong>Uma ressalva honesta para a questão 4</strong>, que vale ponto se você escrever: os
          quatro algoritmos <em>não fazem a mesma coisa</em>. O C é rápido porque só visita as
          potências de 2 — ele pula quase todos os elementos. Se a tarefa exigir olhar cada registro
          uma vez, o melhor possível é O(n) (o A), e nenhum algoritmo O(log n) resolve.
          <div className="mt-2">
            Comparar complexidades só faz sentido entre algoritmos que{' '}
            <strong>resolvem o mesmo problema</strong> — que é exatamente o cenário do desafio final.
          </div>
        </Callout>
      </Section>

      <Section title="O custo real, em segundos">
        <p>
          A questão 6 pede a conta para n = 1.000.000. Ela é direta, e o resultado é o que assusta:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="space-y-1 font-mono text-[15px]">
            <div>
              <strong>a)</strong> O(n) &nbsp;→ n = 1.000.000 → <strong>1.000.000 de operações</strong>{' '}
              (10⁶)
            </div>
            <div>
              <strong>b)</strong> O(n²) → n² = 1.000.000² ={' '}
              <strong>1.000.000.000.000 de operações</strong> (10¹²)
            </div>
            <div className="pt-2 text-gray-600 dark:text-gray-400">
              10¹² / 10⁶ = 1.000.000 → o O(n²) faz UM MILHÃO de vezes mais trabalho
            </div>
          </div>
        </div>

        <p>
          &quot;Um trilhão de operações&quot; ainda é abstrato. Converta para tempo de parede e a
          questão 5 se responde sozinha:
        </p>

        <EscalaComplexidade />

        <p>
          <strong>Resposta da questão 5:</strong> O(n²) vira problema com grandes volumes porque o
          trabalho cresce ao <em>quadrado</em> do que você ganha em dados. Multiplicar a base por 10
          multiplica o custo por 100; por 1.000, multiplica por um milhão. Em algum ponto — e ele chega
          rápido — o algoritmo deixa de terminar num prazo útil, mesmo com hardware melhor.
        </p>

        <Callout tipo="ia">
          <strong>Resposta da questão 7, com os números na mão.</strong> Em IA você quase sempre pode
          melhorar o modelo com mais dados. Mas o custo de treinar não sobe junto com os dados — sobe
          conforme a <em>complexidade</em> do algoritmo.
          <div className="mt-2">
            Se o seu pipeline tem uma etapa O(n²) — comparar cada registro com todos os outros para
            achar duplicatas, por exemplo — dobrar a base quadruplica esse custo. Você acaba{' '}
            <strong>impedido de usar mais dados</strong> por causa da escolha do algoritmo, não por
            falta de dados. Trocar essa etapa por uma O(n log n) com ordenação, ou O(n) com hash, é o
            que decide se o projeto escala ou morre no protótipo.
          </div>
        </Callout>
      </Section>

      <Section title="Parte 3 — a busca linear, e o pulo para a binária">
        <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-[13px] leading-relaxed text-gray-100">
          <pre>{`def encontrar(dados, valor):
    for i in range(len(dados)):
        if dados[i] == valor:
            return True

    return False`}</pre>
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="font-bold text-sky-900 dark:text-sky-100">Q8 — a complexidade é O(n)</div>
            <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
              É a <strong>busca linear</strong>: percorre os elementos um a um até achar. No{' '}
              <strong>pior caso</strong> — que é o que o Big O descreve — o valor está no fim ou nem
              existe, e o laço roda n vezes.
              <br />
              No melhor caso ele acha na primeira posição e faz 1 comparação, O(1). Mas Big O sem outra
              indicação significa pior caso.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              Q9 — 1.000.000 de elementos analisados
            </div>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              Com o valor na última posição, o <span className="font-mono">for</span> só termina depois
              de olhar todos. É exatamente o pior caso: <strong>n = 1.000.000 comparações</strong>.
            </p>
          </div>
        </div>

        <p>
          <strong>Q10 — dá para fazer muito melhor se os dados estiverem ordenados.</strong> O
          algoritmo é a <strong>busca binária</strong>, e a ideia cabe numa frase: olhe o elemento do
          meio e jogue metade fora.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Como ela funciona, em três regras
          </div>
          <div className="space-y-1 text-[15px] text-gray-700 dark:text-gray-300">
            <div>
              <strong>1.</strong> Compare o valor procurado com o elemento do <strong>meio</strong>.
            </div>
            <div>
              <strong>2.</strong> Se for igual, achou. Se for <em>menor</em>, o valor só pode estar na
              metade de baixo — descarte a de cima. Se for <em>maior</em>, descarte a de baixo.
            </div>
            <div>
              <strong>3.</strong> Repita na metade que sobrou, até sobrar um elemento só.
            </div>
          </div>

          <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            <div className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">
              Com 1.000.000 de elementos, o que sobra a cada passo:
            </div>
            <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
              1.000.000 → 500.000 → 250.000 → 125.000 → 62.500 → 31.250 → 15.625 → 7.813 → 3.907 →
              1.954 → 977 → 489 → 245 → 123 → 62 → 31 → 16 → 8 → 4 → 2 → 1
            </div>
            <div className="mt-2 font-bold text-emerald-700 dark:text-emerald-400">
              20 comparações. Contra 1.000.000 da busca linear.
            </div>
          </div>
        </div>

        <p>
          A complexidade é <strong>O(log n)</strong> — a mesma classe do algoritmo C, e pelo mesmo
          motivo. Lá o i dobrava até alcançar n; aqui o espaço de busca cai pela metade até chegar a 1.
          Dobrar e dividir por dois são a mesma operação vista de lados opostos, e log₂(1.000.000) ≈
          20.
        </p>

        <Callout tipo="prova">
          A busca binária tem um <strong>pré-requisito que sempre cai</strong>: os dados precisam estar{' '}
          <strong>ordenados</strong>. Sem ordenação ela não funciona — descartar metade só é válido se
          você souber de que lado o valor estaria.
          <div className="mt-2">
            E isso levanta a pergunta certa: ordenar custa O(n log n), mais caro que uma única busca
            linear O(n). Então vale a pena? <strong>Se for buscar uma vez só, não.</strong> Se for
            buscar milhares de vezes na mesma base, ordena-se uma vez e todas as buscas seguintes
            passam a custar 20 comparações em vez de um milhão.
          </div>
        </Callout>
      </Section>

      <Section title="O desafio final: 'os computadores atuais são muito rápidos'">
        <p>
          O colega disse que tanto faz escolher entre O(n) e O(n²). <strong>Não tanto faz</strong> — e
          a resposta não é opinião, é aritmética.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Base</th>
                <th className="py-2 text-right font-medium text-gray-500">Algoritmo 1 — O(n)</th>
                <th className="py-2 text-right font-medium text-gray-500">Algoritmo 2 — O(n²)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">1.000</td>
                <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">
                  instantâneo
                </td>
                <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">
                  instantâneo
                </td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">100.000</td>
                <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">
                  instantâneo
                </td>
                <td className="py-1.5 text-right text-amber-600 dark:text-amber-400">1 min 40 s</td>
              </tr>
              <tr>
                <td className="py-1.5">1.000.000</td>
                <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">0,01 s</td>
                <td className="py-1.5 text-right font-bold text-red-600 dark:text-red-400">
                  2 h 47 min
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          <strong>Onde o colega tem um pouco de razão:</strong> com 1.000 registros, os dois terminam
          antes de você piscar. Para entrada pequena, a escolha realmente não importa — e nesse caso
          vale escolher o código mais simples de ler e manter.
        </p>

        <p>
          <strong>Onde ele está errado:</strong> o argumento &quot;o computador é rápido&quot; supõe
          que a diferença é um fator fixo, como se O(n²) fosse &quot;o dobro de lento&quot;. Não é.
          Com um milhão de registros a diferença é de <strong>um milhão de vezes</strong>. Nenhum
          hardware cobre isso: se você comprar uma máquina 10 vezes mais rápida, as 2h47 viram 17
          minutos — enquanto o O(n) já tinha terminado em 0,001 s. E na base seguinte, de 10 milhões,
          o O(n²) volta a levar <strong>11 dias</strong>.
        </p>

        <Callout tipo="ia">
          Hardware melhor te dá um fator constante. Algoritmo melhor te dá uma{' '}
          <strong>curva diferente</strong>. Como os dados de um sistema de IA só crescem, é a curva que
          decide se o sistema continua funcionando daqui a um ano — e é por isso que essa análise vem
          antes de escolher GPU.
        </Callout>

        <Checkpoint>
          Você conta operações de um laço simples, aninhado e de duplicação; classifica em O(1),
          O(log n), O(n) e O(n²) olhando o aninhamento e não a quantidade de laços; sabe por que
          constantes são descartadas; converte contagem em tempo real para argumentar; e explica a
          busca binária, seu pré-requisito de ordenação e por que ela é O(log n). Com isso a atividade
          inteira está coberta.
        </Checkpoint>
      </Section>
    </article>
  );
}
