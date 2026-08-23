import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Esperança matemática, variância e covariância. */
export function EsperancaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Esperança é a média ponderada pelas probabilidades">
        <p>
          A <strong>esperança</strong> (ou média) de uma variável aleatória, escrita μ ou E(X), é o valor
          médio a longo prazo. Cada valor entra pesado pela sua probabilidade:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">μ = E(X) = Σ x · f(x)</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              contínua: μ = ∫ x · f(x) dx
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — número de caras em duas moedas
          </div>
          <div className="font-mono text-[15px]">
            E(X) = 0(1/4) + 1(2/4) + 2(1/4) = 0 + 0,5 + 0,5 = 1
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Faz sentido: em média sai uma cara em dois lançamentos.
          </p>
        </div>

        <Callout tipo="atencao">
          A esperança <strong>não precisa ser um valor possível</strong> da variável. Num dado,
          E(X) = 3,5 — e não existe face 3,5. Esperança é o centro de equilíbrio da distribuição, não uma
          previsão do próximo resultado.
        </Callout>

        <p>
          Para uma <strong>função</strong> da variável, aplique a função ao valor e mantenha o mesmo peso:
          E[g(X)] = Σ g(x)·f(x). É assim que se calcula E(X²), que aparece logo adiante.
        </p>
      </Section>

      <Section title="Variância: o atalho que economiza tempo">
        <p>A definição é a mesma ideia do Capítulo 1, agora com probabilidades:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            σ² = E[(X − μ)²] = Σ (x − μ)² · f(x)
          </div>
        </div>

        <p>
          Mas quase ninguém calcula assim. A fórmula computacional, obtida expandindo o quadrado, é bem
          mais rápida:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-8 py-4 text-center font-mono text-lg font-bold text-amber-900 dark:text-amber-100">
            σ² = E(X²) − μ²
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">Aplicando às duas moedas</div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>E(X²) = 0²(1/4) + 1²(2/4) + 2²(1/4) = 0 + 0,5 + 1 = 1,5</div>
            <div>σ² = 1,5 − 1² = 0,5</div>
            <div>σ = √0,5 ≈ 0,707</div>
          </div>
        </div>

        <Callout tipo="prova">
          <strong>E(X²) ≠ [E(X)]².</strong> No exemplo, E(X²) = 1,5 mas [E(X)]² = 1. A diferença entre os
          dois <em>é</em> a variância — é justamente isso que a fórmula diz. Trocar a ordem de
          &quot;elevar ao quadrado&quot; e &quot;tirar a média&quot; é o erro mais frequente do capítulo.
        </Callout>
      </Section>

      <Section title="Combinações lineares: as regras que se usam o tempo todo">
        <p>
          Estas propriedades aparecem em toda a disciplina, e valem a pena memorizar porque poupam
          contas inteiras:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>E(aX + b) = a·E(X) + b</div>
          <div>Var(aX + b) = a²·Var(X)</div>
          <div className="pt-2">E(X + Y) = E(X) + E(Y) &nbsp;&nbsp;← sempre vale</div>
          <div>Var(X + Y) = Var(X) + Var(Y) &nbsp;&nbsp;← só se X e Y forem independentes</div>
        </div>

        <p>
          Aplicando às duas moedas, onde já temos E(X) = 1 e Var(X) = 0,5. Suponha um jogo que paga R$ 3
          por cara mais R$ 2 fixos de entrada — ou seja, <strong>Y = 3X + 2</strong>:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-100">
              Pelo atalho — duas linhas
            </div>
            <div className="space-y-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              <div>E(Y) = 3·E(X) + 2 = 3(1) + 2 = 5</div>
              <div>Var(Y) = 3²·Var(X) = 9(0,5) = 4,5</div>
              <div>σ_Y = √4,5 ≈ 2,12</div>
            </div>
          </div>

          <div className="rounded-lg border-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Na força bruta — conferindo
            </div>
            <div className="space-y-1 font-mono text-sm text-gray-700 dark:text-gray-300">
              <div>Y = 2 (p=1/4), 5 (p=2/4), 8 (p=1/4)</div>
              <div>E(Y) = 2(0,25)+5(0,5)+8(0,25) = 5 ✓</div>
              <div>E(Y²) = 4(0,25)+25(0,5)+64(0,25) = 29,5</div>
              <div>Var(Y) = 29,5 − 5² = 4,5 ✓</div>
            </div>
          </div>
        </div>

        <p>
          Os dois caminhos batem — e é por isso que vale memorizar as regras: elas transformam uma
          tabela inteira em duas multiplicações. Repare no que aconteceu com cada constante: o{' '}
          <strong>+2 mudou a média</strong> (de 1 para 5, deslocando tudo) mas{' '}
          <strong>sumiu da variância</strong> (continua espalhado do mesmo jeito, só que mais para a
          direita). Já o <strong>×3 entrou ao quadrado</strong> na variância: 0,5 virou 4,5, nove vezes
          maior, enquanto o desvio-padrão apenas triplicou.
        </p>

        <Callout tipo="atencao">
          Duas armadilhas nessas fórmulas:
          <br />• O <strong>b some da variância</strong>. Somar uma constante desloca a distribuição
          inteira sem mudar o espalhamento.
          <br />• O <strong>a entra ao quadrado</strong> na variância, porque variância está em unidade
          ao quadrado. Dobrar os valores quadruplica a variância, mas apenas dobra o desvio-padrão.
          <br />• A soma de variâncias <strong>exige independência</strong>. A soma de esperanças, não.
        </Callout>
      </Section>

      <Section title="Covariância: como duas variáveis andam juntas">
        <p>A medida de associação entre duas variáveis aleatórias:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            σ<sub>XY</sub> = E(XY) − μ<sub>X</sub>μ<sub>Y</sub>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Positiva</strong> → quando uma sobe, a outra tende a subir.
          </div>
          <div>
            <strong>Negativa</strong> → quando uma sobe, a outra tende a descer.
          </div>
          <div>
            <strong>Zero</strong> → não há associação <em>linear</em>.
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo completo — uma caixa com 2 canetas azuis, 3 vermelhas e 3 verdes. Tiram-se 2 sem
            reposição. X = quantas azuis, Y = quantas vermelhas.
          </div>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            São C(8,2) = 28 duplas possíveis. Cada célula da tabela é
            C(2,x)·C(3,y)·C(3, 2−x−y)/28 — a mesma contagem da aula de hipergeométrica:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-gray-300 dark:border-gray-600">
                  <th className="py-1.5 text-left font-medium text-gray-500">f(x, y)</th>
                  <th className="py-1.5 text-right font-medium text-gray-500">y = 0</th>
                  <th className="py-1.5 text-right font-medium text-gray-500">y = 1</th>
                  <th className="py-1.5 text-right font-medium text-gray-500">y = 2</th>
                  <th className="py-1.5 text-right font-medium text-gray-500">g(x)</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-1 font-bold">x = 0</td>
                  <td className="py-1 text-right">3/28</td>
                  <td className="py-1 text-right">9/28</td>
                  <td className="py-1 text-right">3/28</td>
                  <td className="py-1 text-right font-bold">15/28</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-1 font-bold">x = 1</td>
                  <td className="py-1 text-right">6/28</td>
                  <td className="py-1 text-right">6/28</td>
                  <td className="py-1 text-right">0</td>
                  <td className="py-1 text-right font-bold">12/28</td>
                </tr>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-1 font-bold">x = 2</td>
                  <td className="py-1 text-right">1/28</td>
                  <td className="py-1 text-right">0</td>
                  <td className="py-1 text-right">0</td>
                  <td className="py-1 text-right font-bold">1/28</td>
                </tr>
                <tr>
                  <td className="py-1 font-bold">h(y)</td>
                  <td className="py-1 text-right font-bold">10/28</td>
                  <td className="py-1 text-right font-bold">15/28</td>
                  <td className="py-1 text-right font-bold">3/28</td>
                  <td className="py-1 text-right font-bold">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-3 space-y-1 font-mono text-[15px]">
            <div className="text-xs text-gray-500">as marginais saem somando linha e coluna</div>
            <div>μ_X = 0(15/28) + 1(12/28) + 2(1/28) = 14/28 = 0,50</div>
            <div>μ_Y = 0(10/28) + 1(15/28) + 2(3/28) = 21/28 = 0,75</div>
            <div className="pt-1 text-xs text-gray-500">
              E(XY): só a célula (1,1) tem x·y ≠ 0 — nas outras, x ou y é zero
            </div>
            <div>E(XY) = 1 × 1 × (6/28) = 6/28 = 0,2143</div>
            <div className="pt-1 font-bold">
              σ_XY = E(XY) − μ_X·μ_Y = 0,2143 − (0,50)(0,75) = −0,1607
            </div>
          </div>

          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Deu <strong>negativa</strong>, e faz todo sentido: só saem 2 canetas. Cada azul que você tira
            é uma vaga a menos para vermelha. Quando X sobe, Y é obrigado a descer — a competição pelas
            mesmas duas vagas cria associação negativa.
          </p>
        </div>

        <p>
          O problema da covariância é que o valor dela depende das unidades — não dá para dizer se
          −0,1607 é &quot;muito&quot;. Por isso se usa a <strong>correlação</strong>, que padroniza:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            ρ = σ<sub>XY</sub> / (σ<sub>X</sub> σ<sub>Y</sub>), com −1 ≤ ρ ≤ 1
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Terminando o exemplo das canetas
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>E(X²) = 0² (15/28) + 1²(12/28) + 2²(1/28) = 16/28 = 0,5714</div>
            <div>σ_X² = 0,5714 − 0,50² = 0,3214 → σ_X = 0,5669</div>
            <div className="pt-1">E(Y²) = 0²(10/28) + 1²(15/28) + 2²(3/28) = 27/28 = 0,9643</div>
            <div>σ_Y² = 0,9643 − 0,75² = 0,4018 → σ_Y = 0,6339</div>
            <div className="pt-2 font-bold">
              ρ = −0,1607 / (0,5669 × 0,6339) = −0,1607 / 0,3594 = −0,4472
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Agora dá para <strong>ler</strong> o número: ρ = −0,45 é uma associação negativa moderada.
            Não é −1 (não é determinístico: tirar uma azul não fixa quantas vermelhas saem, porque ainda
            existem as verdes), mas está longe de 0. E ρ não tem unidade — se as canetas fossem medidas
            em outra escala, σ_XY mudaria e ρ continuaria −0,4472.
          </p>
        </div>

        <Callout tipo="atencao">
          Independentes ⟹ covariância zero. Mas <strong>a recíproca é falsa</strong>: covariância zero
          não garante independência, porque ela só enxerga relação <em>linear</em>. Uma relação em forma
          de parábola perfeita pode ter covariância exatamente zero.
        </Callout>

        <Callout tipo="ia">
          Correlação é o mesmo conceito por trás da <strong>similaridade do cosseno</strong> que você viu
          em Álgebra Linear — ambas medem alinhamento entre vetores depois de padronizar a escala. Não é
          coincidência: a correlação é literalmente o cosseno do ângulo entre os vetores de desvios.
        </Callout>

        <Checkpoint>
          Você calcula E(X) e E[g(X)] como médias ponderadas, usa σ² = E(X²) − μ² sem confundir com
          [E(X)]², aplica as regras de combinações lineares lembrando que o b some e o a vai ao quadrado,
          e interpreta covariância e correlação. Isso fecha o Capítulo 4.
        </Checkpoint>
      </Section>
    </article>
  );
}
