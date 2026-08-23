import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DistribuicaoDiscretaLab } from '@/components/interactive/DistribuicaoDiscretaLab';

/** Aula: Distribuição binomial. */
export function BinomialLesson() {
  return (
    <article className="space-y-10">
      <Section title="Os quatro requisitos de um experimento binomial">
        <p>
          A binomial é a distribuição discreta mais usada, e reconhecê-la é metade da questão. Um
          experimento é <strong>binomial</strong> quando cumpre os quatro itens:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Número <strong>fixo</strong> de tentativas, n.
          </div>
          <div>
            <strong>2.</strong> Cada tentativa tem apenas <strong>dois</strong> resultados: sucesso ou
            fracasso.
          </div>
          <div>
            <strong>3.</strong> A probabilidade de sucesso, p, é <strong>constante</strong> em todas as
            tentativas.
          </div>
          <div>
            <strong>4.</strong> As tentativas são <strong>independentes</strong>.
          </div>
        </div>

        <Callout tipo="prova">
          Se qualquer um dos quatro falhar, não é binomial. Amostragem <strong>sem reposição</strong> de
          um lote pequeno quebra os itens 3 e 4 — nesse caso a distribuição correta é a{' '}
          <strong>hipergeométrica</strong> (Seção 5.4). A regra prática do livro: se a amostra for menor
          que 5% da população, a binomial aproxima bem mesmo sem reposição.
        </Callout>
      </Section>

      <Section title="A fórmula, e de onde vem cada pedaço">
        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            b(x; n, p) = C(n, x) · p<sup>x</sup> · (1 − p)<sup>n−x</sup>
          </div>
        </div>

        <p>Ela se lê em três partes, e entender cada uma dispensa decorar:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">p^x</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A chance de os x sucessos acontecerem — multiplicados porque são independentes.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">(1 − p)^(n−x)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              A chance de os n − x fracassos restantes acontecerem.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="font-mono font-bold text-gray-900 dark:text-gray-100">C(n, x)</div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              De quantas <strong>maneiras</strong> esses x sucessos podem se distribuir entre as n
              tentativas. É a combinação do tópico de contagem — a ordem não importa, só quantos.
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — 5 peças, 10% de defeito. P(exatamente 2 defeituosas)?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>n = 5, p = 0,10, x = 2</div>
            <div>C(5, 2) = 10</div>
            <div>b(2; 5; 0,1) = 10 × (0,1)² × (0,9)³</div>
            <div>= 10 × 0,01 × 0,729</div>
            <div className="font-bold">= 0,0729</div>
          </div>
        </div>
      </Section>

      <Section title="Traduzir o enunciado — e fazer a soma até o fim">
        <p>
          Aqui está a parte que decide a questão. O enunciado quase nunca pede{' '}
          <em>&quot;exatamente 2&quot;</em>: ele pede &quot;no máximo&quot;, &quot;pelo menos&quot;,
          &quot;menos de&quot;. Cada uma dessas palavras muda <strong>quais termos entram na soma</strong>
          , e a fórmula sozinha não te diz isso.
        </p>

        <DistribuicaoDiscretaLab />

        <p>
          Com as mesmas 5 peças a 10% de defeito, as três leituras dão respostas completamente
          diferentes — e todas usam a mesma fórmula, calculada quantas vezes for preciso:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="font-bold text-sky-900 dark:text-sky-100">
              &quot;exatamente 2 defeituosas&quot; → um termo só
            </div>
            <div className="mt-1 font-mono text-sm text-sky-900 dark:text-sky-100">
              P(X = 2) = b(2) = 0,0729
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              &quot;no máximo 2 defeituosas&quot; → some de baixo até 2
            </div>
            <div className="mt-1 space-y-1 font-mono text-sm text-amber-900 dark:text-amber-100">
              <div>b(0) = C(5,0)(0,1)⁰(0,9)⁵ = 1 × 1 × 0,59049 = 0,59049</div>
              <div>b(1) = C(5,1)(0,1)¹(0,9)⁴ = 5 × 0,1 × 0,6561 = 0,32805</div>
              <div>b(2) = C(5,2)(0,1)²(0,9)³ = 10 × 0,01 × 0,729 = 0,07290</div>
              <div className="pt-1 font-bold">P(X ≤ 2) = 0,59049 + 0,32805 + 0,07290 = 0,99144</div>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              &quot;pelo menos 1 defeituosa&quot; → use o complemento
            </div>
            <div className="mt-1 space-y-1 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              <div>caminho longo: b(1) + b(2) + b(3) + b(4) + b(5) — cinco contas</div>
              <div>caminho curto: 1 − b(0) = 1 − 0,59049 = 0,40951 — uma conta</div>
            </div>
            <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">
              O complemento de &quot;pelo menos um&quot; é sempre &quot;nenhum&quot;, que é{' '}
              <strong>um único termo</strong>. É a mesma regra P(A) = 1 − P(A′) da aula de regras
              aditivas, agora economizando quatro contas.
            </p>
          </div>
        </div>

        <Callout tipo="atencao">
          <strong>A tabela de tradução, e onde ela trai:</strong>
          <div className="mt-2 space-y-1 font-mono text-sm">
            <div>&quot;exatamente 3&quot; &nbsp;→ b(3)</div>
            <div>&quot;no máximo 3&quot; &nbsp;→ b(0)+b(1)+b(2)+b(3) &nbsp;&nbsp;(o 3 ENTRA)</div>
            <div>&quot;menos de 3&quot; &nbsp;&nbsp;→ b(0)+b(1)+b(2) &nbsp;&nbsp;(o 3 fica FORA)</div>
            <div>&quot;pelo menos 3&quot; → 1 − [b(0)+b(1)+b(2)] &nbsp;&nbsp;(o 3 ENTRA)</div>
            <div>&quot;mais de 3&quot; &nbsp;&nbsp;→ 1 − [b(0)+b(1)+b(2)+b(3)] &nbsp;(o 3 fica FORA)</div>
          </div>
          A diferença entre <strong>&quot;no máximo&quot;</strong> e{' '}
          <strong>&quot;menos de&quot;</strong> é um termo inteiro. Como a distribuição é discreta, esse
          termo não é desprezível — no exemplo acima ele vale 0,0729, ou seja, 7% da resposta.
        </Callout>
      </Section>

      <Section title="Média, variância e a leitura do enunciado">
        <p>Para a binomial, as fórmulas são curtíssimas:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            μ = n·p &nbsp;&nbsp;&nbsp; σ² = n·p·(1 − p)
          </div>
        </div>

        <p>
          Em 100 lançamentos de moeda honesta: μ = 100(0,5) = 50 caras esperadas, σ² = 100(0,5)(0,5) = 25,
          σ = 5. Ou seja, é comum sair entre 45 e 55 caras.
        </p>

        <Callout tipo="prova">
          Aplicando às 5 peças com 10% de defeito: μ = 5(0,10) = <strong>0,5 peça defeituosa</strong>{' '}
          esperada, σ² = 5(0,10)(0,90) = 0,45, σ = √0,45 = 0,67. Repare que μ = 0,5{' '}
          <strong>não é um resultado possível</strong> — não existe meia peça defeituosa. Como no
          Capítulo 1, a média é centro de equilíbrio, não previsão. O que ela diz é: inspecionando muitos
          lotes de 5, você vai achar em média meia peça ruim por lote.
        </Callout>

        <p>
          Uma generalização que aparece na mesma seção: quando há <strong>mais de dois</strong>{' '}
          resultados possíveis por tentativa, a distribuição é <strong>multinomial</strong>. No lugar da
          combinação entra um fatorial dividido, e cada categoria ganha sua potência:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            n! / (x₁!·x₂!·…·x<sub>k</sub>!) · p₁<sup>x₁</sup>·p₂<sup>x₂</sup>·…·p
            <sub>k</sub>
            <sup>x<sub>k</sub></sup>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — cada peça sai boa (70%), recuperável (20%) ou refugo (10%). Em 6 peças, qual a
            chance de sair 4 boas, 1 recuperável e 1 refugo?
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>n = 6; x₁ = 4, x₂ = 1, x₃ = 1; p₁ = 0,7, p₂ = 0,2, p₃ = 0,1</div>
            <div>6! / (4!·1!·1!) = 720 / 24 = 30</div>
            <div>f = 30 × (0,7)⁴ × (0,2)¹ × (0,1)¹</div>
            <div>= 30 × 0,2401 × 0,2 × 0,1</div>
            <div className="font-bold">= 0,1441</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Confira as duas somas antes de calcular: <strong>x₁ + x₂ + x₃ = 6 = n</strong> e{' '}
            <strong>p₁ + p₂ + p₃ = 1</strong>. Se qualquer uma não fechar, o enunciado foi lido errado —
            e essa é a conferência que salva a questão.
          </p>
        </div>

        <Callout tipo="ia">
          A binomial é o modelo por trás de qualquer teste A/B: n visitantes, cada um converte ou não com
          probabilidade p. Saber que σ = √(np(1−p)) é o que permite dizer se a diferença entre duas taxas
          de conversão é real ou ruído amostral.
        </Callout>

        <Checkpoint>
          Você reconhece um experimento binomial pelos quatro requisitos, monta a fórmula entendendo as
          três partes, calcula μ = np e σ² = np(1−p), e traduz &quot;exatamente&quot;, &quot;no
          máximo&quot; e &quot;pelo menos&quot; — usando o complemento quando ele encurta a conta.
        </Checkpoint>
      </Section>
    </article>
  );
}
