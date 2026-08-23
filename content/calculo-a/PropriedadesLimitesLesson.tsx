import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Propriedades operatórias dos limites e Teorema do Confronto (Secção 2.3). */
export function PropriedadesLimitesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Por que existem propriedades">
        <p>
          A definição formal de limite é rigorosa, mas lenta: provar um único limite por ela leva meia
          página. Se cada questão exigisse isso, uma prova de cinco itens duraria três horas.
        </p>
        <p>
          As propriedades operatórias resolvem esse problema. Elas são{' '}
          <strong>atalhos já demonstrados</strong> que quebram um limite grande em limites pequenos e
          óbvios. É por isso que o slide da aula chama esta parte de <em>as ferramentas</em>, em
          oposição à definição ε-δ da seção 2.4, que é <em>a fundação</em>.
        </p>
      </Section>

      <Section title="O painel de controle">
        <p>
          Todas valem sob uma única condição, e ela é o detalhe que mais gente perde de vista:
        </p>

        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4 text-center">
          <div className="text-sm font-bold text-indigo-900 dark:text-indigo-100">
            Hipótese obrigatória
          </div>
          <div className="mt-1 text-[15px] text-indigo-900 dark:text-indigo-100">
            Os limites <span className="font-mono">lim(x→a) f(x)</span> e{' '}
            <span className="font-mono">lim(x→a) g(x)</span> precisam <strong>existir</strong>.
            Sem isso, nenhuma das cinco regras abaixo pode ser usada.
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Soma
            </div>
            <div className="font-mono text-[14px]">lim [f + g] = lim f + lim g</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Diferença
            </div>
            <div className="font-mono text-[14px]">lim [f − g] = lim f − lim g</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Constante
            </div>
            <div className="font-mono text-[14px]">lim [c · f] = c · lim f</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Produto
            </div>
            <div className="font-mono text-[14px]">lim [f · g] = lim f · lim g</div>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 p-4 sm:col-span-2">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
              Quociente — a única com letra miúda
            </div>
            <div className="font-mono text-[14px]">lim [f / g] = lim f / lim g</div>
            <div className="mt-1 text-[14px] text-amber-900 dark:text-amber-100">
              válida <strong>somente se lim g(x) ≠ 0</strong>
            </div>
          </div>
        </div>

        <p>
          Repare que quatro delas dizem a mesma coisa: <em>a operação passa para dentro do limite</em>.
          Só o quociente cobra um pedágio.
        </p>
      </Section>

      <Section title="O que fazer quando o denominador zera">
        <p>
          Quando <span className="font-mono">lim g(x) = 0</span>, a regra do quociente simplesmente{' '}
          <strong>não se aplica</strong>. Isso não significa que o limite não existe — significa que
          essa ferramenta acabou e você precisa de outra. Separe em dois casos:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              lim f = 0 também → forma 0/0
            </div>
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Indeterminado. Fatore ou racionalize primeiro e tente de novo. É a aula de limites com
              indeterminação 0/0.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              lim f ≠ 0 → forma número/0
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Não é indeterminado: a função explode para ±∞ e você tem uma assíntota vertical. Analise
              o sinal pela esquerda e pela direita.
            </p>
          </div>
        </div>
      </Section>

      <Section title="As duas consequências que você já usa sem perceber">
        <p>
          Aplicando as regras repetidamente a <span className="font-mono">lim(x→a) x = a</span> e{' '}
          <span className="font-mono">lim(x→a) c = c</span>, saem os dois resultados que justificam a
          substituição direta:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px] space-y-2">
          <div>
            <span className="font-bold">Polinômio:</span> lim(x→a) p(x) = p(a) &nbsp;&nbsp;— sempre
          </div>
          <div>
            <span className="font-bold">Racional:</span> lim(x→a) p(x)/q(x) = p(a)/q(a) &nbsp;&nbsp;— se
            q(a) ≠ 0
          </div>
        </div>

        <Callout tipo="prova">
          Os exercícios da seção 2.3 pedem o <em>porquê</em>, não só o resultado. A justificativa correta
          em uma linha é: &quot;pelas propriedades operatórias, o limite de uma função polinomial em x = a
          é p(a)&quot;. No caso racional, acrescente: &quot;e o denominador não se anula em a&quot;.
          Substituir direto sem essa frase é o erro que mais custa ponto numa lista entregue.
        </Callout>

        <p>Um exemplo montado passo a passo, do jeito que a prova pede:</p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="mb-2 font-bold">lim(x→2) (3x² − 5x + 1)</div>
          <div>= 3 · lim x² − 5 · lim x + lim 1 &nbsp;&nbsp;← soma, diferença e constante</div>
          <div>= 3 · (2)² − 5 · (2) + 1</div>
          <div className="font-bold text-emerald-700 dark:text-emerald-400">= 12 − 10 + 1 = 3</div>
        </div>
      </Section>

      <Section title="A pegadinha: a regra não vale ao contrário">
        <p>
          A hipótese lá do começo tem consequência prática. Se{' '}
          <span className="font-mono">lim (f + g)</span> existe, <strong>não</strong> se conclui que lim
          f e lim g existem. Contraexemplo com uma função que você já viu:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(x) = |x|/x &nbsp;&nbsp;e&nbsp;&nbsp; g(x) = −|x|/x, &nbsp;com x → 0</div>
          <div className="pt-1">lim f não existe (dá −1 pela esquerda e +1 pela direita)</div>
          <div>lim g não existe (mesmo motivo, com os sinais trocados)</div>
          <div className="pt-1">mas f(x) + g(x) = 0 para todo x ≠ 0</div>
          <div className="font-bold text-emerald-700 dark:text-emerald-400">
            logo lim (f + g) = 0 &nbsp;— existe!
          </div>
        </div>

        <Callout tipo="atencao">
          As propriedades são de <strong>mão única</strong>. Elas montam o limite da combinação a partir
          das partes, nunca desmontam. Ver a soma dar certo não autoriza afirmar nada sobre cada
          parcela.
        </Callout>
      </Section>

      <Section title="Teorema do Confronto (ou do Sanduíche)">
        <p>
          Existe um caso em que o painel de controle falha e ainda assim dá para achar o limite: quando
          uma das partes <strong>oscila para sempre</strong> e não tem limite nenhum. A saída é prender a
          função entre duas outras.
        </p>

        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4">
          <div className="mb-2 text-sm font-bold text-indigo-900 dark:text-indigo-100">Enunciado</div>
          <div className="space-y-1 text-[15px] text-indigo-900 dark:text-indigo-100">
            <div>
              Se <span className="font-mono">f(x) ≤ g(x) ≤ h(x)</span> para todo x{' '}
              <strong>perto de a</strong> (não precisa valer em a nem no gráfico inteiro),
            </div>
            <div>
              e <span className="font-mono">lim(x→a) f(x) = lim(x→a) h(x) = L</span>,
            </div>
            <div className="pt-1 font-bold">
              então <span className="font-mono">lim(x→a) g(x) = L</span>.
            </div>
          </div>
        </div>

        <p>
          A intuição do nome: as duas funções de fora são as fatias do pão e vão se fechando até a mesma
          altura L. O recheio no meio não tem para onde fugir.
        </p>

        <Callout tipo="info">
          Repare no que o teorema <em>não</em> pede: ele nunca exige que g tenha limite. Isso é
          justamente o que ele te dá de presente no final. Você só precisa provar as desigualdades e
          calcular os limites das duas funções de fora, que costumam ser fáceis.
        </Callout>
      </Section>

      <Section title="O exemplo clássico, resolvido">
        <p>
          Calcular <span className="font-mono">lim(x→0) x² · sen(1/x)</span>. Primeiro, por que o painel
          de controle não resolve:
        </p>

        <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4 font-mono text-[15px]">
          <div className="text-red-900 dark:text-red-100">
            lim [x² · sen(1/x)] = lim x² · lim sen(1/x) ← ERRADO
          </div>
          <div className="mt-1 text-sm text-red-900 dark:text-red-100">
            Quando x → 0, o valor 1/x explode e sen(1/x) oscila infinitas vezes entre −1 e 1. Esse limite
            NÃO existe, então a regra do produto está proibida aqui.
          </div>
        </div>

        <p>Agora do jeito certo:</p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px] space-y-2">
          <div>
            <span className="font-bold">1.</span> seno é sempre limitado: &nbsp; −1 ≤ sen(1/x) ≤ 1
          </div>
          <div>
            <span className="font-bold">2.</span> multiplica tudo por x²: &nbsp; −x² ≤ x²·sen(1/x) ≤ x²
          </div>
          <div>
            <span className="font-bold">3.</span> as pontas: &nbsp; lim(x→0) (−x²) = 0 &nbsp;e&nbsp;
            lim(x→0) x² = 0
          </div>
          <div className="pt-1 font-bold text-emerald-700 dark:text-emerald-400">
            4. pelo confronto: lim(x→0) x²·sen(1/x) = 0
          </div>
        </div>

        <Callout tipo="atencao">
          O passo 2 esconde a sutileza mais cobrada. Multiplicar uma desigualdade por um número{' '}
          <strong>negativo inverte o sinal</strong> — e aqui isso não aconteceu porque{' '}
          <span className="font-mono">x² ≥ 0</span> sempre. É por isso que o pão do sanduíche é ±x², e não
          ±x³: com x³ o sinal muda quando x é negativo e as duas funções trocam de lugar, quebrando a
          desigualdade. Se o slide da aula estiver com x³, confira: o envelope seguro deste exemplo é ±x².
        </Callout>

        <Callout tipo="ia">
          Esse teorema é a forma padrão de provar que um treino converge. Se o erro do modelo na etapa n
          está preso entre duas curvas conhecidas que ambas tendem a zero, o erro tende a zero — sem
          precisar de fórmula fechada para o erro, que quase nunca se tem. Limitar por cima e por baixo é
          mais barato do que calcular exatamente.
        </Callout>

        <Checkpoint>
          Você sabe as cinco propriedades e a hipótese que todas exigem, sabe que a regra do quociente cai
          quando o denominador tende a zero e o que fazer nos dois casos, justifica substituição direta
          citando polinômio ou racional, não usa as regras ao contrário, e resolve por confronto os
          limites em que uma parte oscila. Isso fecha a Secção 2.3.
        </Checkpoint>
      </Section>
    </article>
  );
}
