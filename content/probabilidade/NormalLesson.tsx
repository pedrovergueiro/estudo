import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { NormalCurveExplorer } from '@/components/interactive/NormalCurveExplorer';

/** Aula: Distribuição normal e a padronização z. */
export function NormalLesson() {
  return (
    <article className="space-y-10">
      <Section title="A curva em forma de sino">
        <p>
          A <strong>distribuição normal</strong> é a mais importante da estatística. Ela é contínua,
          simétrica em torno da média, e fica completamente determinada por dois números: μ (onde está o
          centro) e σ (quão espalhada ela é).
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>μ</strong> desloca a curva para a esquerda ou direita, sem mudar o formato.
          </div>
          <div>
            <strong>σ</strong> muda a largura: σ pequeno dá curva alta e estreita; σ grande, baixa e
            espalhada.
          </div>
          <div>Média, mediana e moda coincidem, exatamente em μ — a curva é perfeitamente simétrica.</div>
          <div>A área total sob a curva é 1, como em toda densidade.</div>
        </div>

        <Callout tipo="info">
          A regra empírica, que vale a pena decorar: <strong>68%</strong> dos dados caem em μ ± σ,{' '}
          <strong>95%</strong> em μ ± 2σ e <strong>99,7%</strong> em μ ± 3σ. Isso permite estimar
          probabilidades de cabeça, sem tabela.
        </Callout>
      </Section>

      <Section title="Padronizar: a única técnica que você precisa">
        <p>
          Existem infinitas curvas normais, uma para cada par (μ, σ) — e seria impossível tabelar todas.
          A solução é converter qualquer normal na <strong>normal padrão</strong>, que tem μ = 0 e σ = 1:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-8 py-4 text-center font-mono text-lg font-bold text-indigo-900 dark:text-indigo-100">
            z = (x − μ) / σ
          </div>
        </div>

        <p>
          O valor de z responde: <strong>&quot;a quantos desvios-padrão da média este ponto está?&quot;</strong>{' '}
          Um z de 1,5 significa &quot;um desvio e meio acima da média&quot;, seja qual for a escala
          original. É essa universalidade que permite uma única tabela servir para tudo.
        </p>

        <NormalCurveExplorer />
      </Section>

      <Section title="Usando a tabela sem errar">
        <p>
          A tabela do livro dá <strong>Φ(z) = P(Z &lt; z)</strong>, ou seja, a área acumulada à esquerda.
          Todo o resto se deriva disso:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>P(Z &lt; a) = Φ(a) &nbsp;&nbsp;← direto da tabela</div>
          <div>P(Z &gt; a) = 1 − Φ(a) &nbsp;&nbsp;← complemento</div>
          <div>P(a &lt; Z &lt; b) = Φ(b) − Φ(a) &nbsp;&nbsp;← subtração</div>
          <div>Φ(−a) = 1 − Φ(a) &nbsp;&nbsp;← pela simetria</div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — QI com μ = 100 e σ = 15. P(X &gt; 130)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>z = (130 − 100)/15 = 2,00</div>
            <div>Φ(2,00) = 0,9772</div>
            <div className="font-bold">P(X &gt; 130) = 1 − 0,9772 = 0,0228</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Cerca de 2,3% da população — consistente com a regra empírica, que diz que 95% ficam entre 70
            e 130, sobrando 2,5% em cada cauda.
          </p>
        </div>

        <Callout tipo="atencao">
          Como a normal é contínua, <strong>P(X = a) = 0</strong> e não faz diferença usar &lt; ou ≤.
          Isso vale <em>só</em> para contínuas — na binomial e na Poisson, trocar &lt; por ≤ muda a
          resposta por um termo inteiro.
        </Callout>

        <p>
          Falta o caminho contrário, que cai tanto quanto o direto: a questão dá a{' '}
          <strong>probabilidade</strong> e pede o <strong>valor de x</strong>. Aqui você usa a tabela ao
          contrário — procura a área <em>dentro</em> dela e lê o z na margem:
        </p>

        <div className="rounded-lg border-2 border-violet-300 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 p-4">
          <div className="mb-2 font-bold text-violet-900 dark:text-violet-100">
            Problema inverso — mesmo QI (μ = 100, σ = 15). Qual valor separa os 10% mais altos?
          </div>
          <div className="space-y-1 font-mono text-[15px] text-violet-900 dark:text-violet-100">
            <div>
              <strong>1.</strong> Traduzir: os 10% mais altos ficam acima do corte, logo abaixo dele há
              90%. Procuramos z com Φ(z) = 0,90.
            </div>
            <div>
              <strong>2.</strong> Caçar 0,90 no <em>miolo</em> da tabela: Φ(1,28) = 0,8997 e
              Φ(1,29) = 0,9015. O mais próximo é <strong>z = 1,28</strong>.
            </div>
            <div>
              <strong>3.</strong> Desfazer a padronização: x = μ + z·σ = 100 + 1,28 × 15
            </div>
            <div className="pt-1 font-bold">x = 100 + 19,2 = 119,2</div>
          </div>
          <p className="mt-2 text-sm text-violet-900 dark:text-violet-100">
            Resposta: QI de <strong>119,2</strong> separa os 10% mais altos.
          </p>
        </div>

        <Callout tipo="prova">
          <strong>Como saber se é problema direto ou inverso:</strong> olhe o que está faltando na
          pergunta. Se o enunciado te dá um <em>valor</em> (130, 45 kg, 3 horas) e pede uma chance, é
          direto — calcule z e leia a tabela. Se te dá uma <em>porcentagem</em> (os 10% melhores, o
          percentil 95, os 5% que serão rejeitados) e pede um valor, é inverso — leia a tabela ao
          contrário e use x = μ + zσ.
          <div className="mt-2">
            Cuidado com a direção: &quot;os 10% <strong>melhores</strong>&quot; significa procurar 0,90
            na tabela, não 0,10. A tabela sempre dá área à <em>esquerda</em>, então traduza a pergunta
            para &quot;quanto fica abaixo&quot; antes de procurar.
          </div>
        </Callout>
      </Section>

      <Section title="Aproximação normal da binomial">
        <p>
          Calcular b(x; 200; 0,4) termo a termo é inviável na mão. Quando n é grande e p não é extremo, a
          binomial se aproxima muito bem de uma normal com:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            μ = n·p &nbsp;&nbsp;&nbsp; σ = √(n·p·(1 − p))
          </div>
        </div>

        <p>
          O critério prático do livro é <strong>np ≥ 5 e n(1 − p) ≥ 5</strong>. Se p for muito pequeno,
          use Poisson em vez disso.
        </p>

        <Callout tipo="prova">
          Como você está usando uma distribuição <em>contínua</em> para aproximar uma{' '}
          <em>discreta</em>, aplique a <strong>correção de continuidade</strong>: cada valor inteiro k
          vira o intervalo de k − 0,5 a k + 0,5.
          <div className="mt-2 space-y-1 font-mono text-sm">
            <div>P(X = 8) &nbsp;→ área entre 7,5 e 8,5</div>
            <div>P(X ≤ 8) &nbsp;→ área até 8,5 &nbsp;&nbsp;(o 8 precisa caber inteiro)</div>
            <div>P(X &lt; 8) &nbsp;→ área até 7,5 &nbsp;&nbsp;(o 8 fica de fora)</div>
            <div>P(X ≥ 8) &nbsp;→ área a partir de 7,5</div>
          </div>
        </Callout>

        <p>
          Vale ver o tamanho do estrago quando se esquece dela. Tome n = 100 e p = 0,4, e a pergunta{' '}
          <strong>P(X ≤ 45)</strong>:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="space-y-1 font-mono text-[15px]">
            <div>μ = np = 100 × 0,4 = 40</div>
            <div>σ = √(100 × 0,4 × 0,6) = √24 = 4,899</div>
            <div>np = 40 ≥ 5 e n(1−p) = 60 ≥ 5 ✓ &nbsp;— pode aproximar</div>
            <div className="pt-2">
              <strong>com</strong> correção: z = (45,5 − 40)/4,899 = 1,12 → Φ(1,12) = 0,8692
            </div>
            <div>
              <strong>sem</strong> correção: z = (45 − 40)/4,899 = 1,02 → Φ(1,02) = 0,8463
            </div>
            <div className="pt-1 font-bold">valor exato pela binomial: 0,8689</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Método</th>
                <th className="py-2 text-right font-medium text-gray-500">Resultado</th>
                <th className="py-2 text-right font-medium text-gray-500">Erro</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">Binomial exata (101 termos)</td>
                <td className="py-1.5 text-right">0,8689</td>
                <td className="py-1.5 text-right text-gray-400">—</td>
              </tr>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">Normal com correção</td>
                <td className="py-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  0,8692
                </td>
                <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">0,0003</td>
              </tr>
              <tr>
                <td className="py-1.5">Normal sem correção</td>
                <td className="py-1.5 text-right font-bold text-red-600 dark:text-red-400">0,8463</td>
                <td className="py-1.5 text-right text-red-600 dark:text-red-400">0,0226</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          A correção custa <strong>somar 0,5 a um número</strong> e reduz o erro em cerca de{' '}
          <strong>75 vezes</strong>. Sem ela a aproximação erra na segunda casa decimal, que é
          exatamente a casa que a resposta da prova costuma pedir.
        </p>

        <p>
          Vale registrar o motivo profundo de a normal aparecer em todo lugar: o{' '}
          <strong>Teorema Central do Limite</strong> (Capítulo 8) garante que a média de uma amostra
          grande tende à normal <em>independentemente</em> da distribuição original dos dados. É por isso
          que ela sustenta os intervalos de confiança e os testes de hipótese do resto do curso.
        </p>

        <Checkpoint>
          Você padroniza com z = (x − μ)/σ, lê a tabela em qualquer direção (esquerda, direita, entre
          dois valores e usando a simetria), resolve o problema inverso com x = μ + zσ e sabe aproximar a
          binomial pela normal com correção de continuidade. Isso fecha os capítulos 5 e 6.
        </Checkpoint>
      </Section>
    </article>
  );
}
