import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { CrossProductExplorer } from '@/components/interactive/CrossProductExplorer';

/** Aula: Produto vetorial e produto misto. */
export function ProdutoVetorialLesson() {
  return (
    <article className="space-y-10">
      <Section title="Um produto que devolve VETOR, não número">
        <p>
          O produto escalar pega dois vetores e devolve um número. O <strong>produto vetorial</strong>{' '}
          pega dois vetores e devolve <strong>outro vetor</strong> — e essa é a primeira coisa a não
          confundir.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="mb-1 font-bold text-sky-900 dark:text-sky-100">a · b (escalar)</div>
            <div className="font-mono text-sm text-sky-900 dark:text-sky-100">resultado: NÚMERO</div>
            <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
              Existe em R², R³, Rⁿ. É comutativo. Zero ⟺ perpendiculares.
            </p>
          </div>
          <div className="rounded-lg border-2 border-lime-300 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/40 p-4">
            <div className="mb-1 font-bold text-lime-900 dark:text-lime-100">a × b (vetorial)</div>
            <div className="font-mono text-sm text-lime-900 dark:text-lime-100">resultado: VETOR</div>
            <p className="mt-1 text-sm text-lime-900 dark:text-lime-100">
              Só existe em <strong>R³</strong>. Não é comutativo. Zero ⟺ paralelos.
            </p>
          </div>
        </div>

        <p>
          A propriedade que define o produto vetorial: <strong>a × b é perpendicular a a e a b ao mesmo
          tempo</strong>. Por isso ele é a ferramenta para achar o vetor normal de um plano — assunto da
          aula seguinte.
        </p>
      </Section>

      <Section title="Calculando: o determinante simbólico">
        <p>
          A forma prática de calcular é montar um determinante 3×3 com os versores na primeira linha e
          expandir por Laplace nessa linha:
        </p>

        <div className="overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-800 p-4 font-mono text-[15px]">
          <div className="whitespace-pre">{`        | i   j   k  |
a × b = | a₁  a₂  a₃ |
        | b₁  b₂  b₃ |

a × b = (a₂b₃ − a₃b₂) i − (a₁b₃ − a₃b₁) j + (a₁b₂ − a₂b₁) k`}</div>
        </div>

        <CrossProductExplorer />

        <Callout tipo="atencao">
          O <strong>sinal de menos na componente j</strong> é o erro número um deste tópico. Ele vem do
          tabuleiro de sinais do cofator: a posição (1,2) tem (−1)<sup>1+2</sup> = −1. Não é opcional e
          não é pegadinha do professor — é a regra de Laplace funcionando.
        </Callout>

        <p>As propriedades que caem em prova:</p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>a × b = −(b × a) &nbsp;&nbsp;← anticomutativo</div>
          <div>a × a = 0 &nbsp;&nbsp;← qualquer vetor é paralelo a si mesmo</div>
          <div>(a × b) · a = 0 e (a × b) · b = 0 &nbsp;&nbsp;← perpendicularidade</div>
          <div>‖a × b‖ = ‖a‖·‖b‖·sen(θ) &nbsp;&nbsp;← compare com o escalar, que usa cos(θ)</div>
        </div>

        <Callout tipo="info">
          Repare na simetria: o produto <strong>escalar</strong> usa <strong>cosseno</strong> e zera
          quando os vetores são perpendiculares; o produto <strong>vetorial</strong> usa{' '}
          <strong>seno</strong> e zera quando são paralelos. Um mede alinhamento, o outro mede
          &quot;desalinhamento&quot;.
        </Callout>
      </Section>

      <Section title="Área: a interpretação geométrica">
        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-lime-300 dark:border-lime-800 bg-lime-50 dark:bg-lime-950/40 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold text-lime-900 dark:text-lime-100">
              ‖a × b‖ = área do paralelogramo formado por a e b
            </div>
            <div className="mt-2 font-mono text-sm text-lime-800 dark:text-lime-200">
              área do triângulo = ‖a × b‖ / 2
            </div>
          </div>
        </div>

        <p>
          É a aplicação mais cobrada: dados três pontos A, B e C, a área do triângulo ABC é metade da
          norma do produto vetorial dos vetores AB e AC.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — A(0,0,0), B(2,1,0), C(1,3,0)
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>AB = (2, 1, 0) &nbsp;·&nbsp; AC = (1, 3, 0)</div>
            <div>AB × AC = (1·0 − 0·3, 0·1 − 2·0, 2·3 − 1·1) = (0, 0, 5)</div>
            <div>‖AB × AC‖ = 5 → área do paralelogramo</div>
            <div className="font-bold">área do triângulo = 5/2 = 2,5</div>
          </div>
        </div>
      </Section>

      <Section title="Produto misto: volume e coplanaridade">
        <p>
          O <strong>produto misto</strong> combina os dois produtos em três vetores e devolve um{' '}
          <strong>número</strong>:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              [a, b, c] = a · (b × c)
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              na prática: o determinante 3×3 cujas linhas são a, b e c
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>|a · (b × c)| = volume do paralelepípedo</strong> gerado pelos três vetores.
          </div>
          <div>
            <strong>volume do tetraedro = |a · (b × c)| / 6</strong>
          </div>
        </div>

        <Callout tipo="prova">
          O uso mais cobrado é o <strong>teste de coplanaridade</strong>:
          <div className="mt-2 text-center font-mono font-bold">
            a · (b × c) = 0 ⟺ os três vetores são coplanares
          </div>
          Faz sentido geométrico: se os três cabem num mesmo plano, o paralelepípedo é achatado e tem
          volume zero. E como o produto misto é um determinante 3×3, isso é a mesma coisa que dizer que
          os três são <strong>linearmente dependentes</strong> — a ponte com o bloco final da
          disciplina.
        </Callout>

        <p>
          A ordem dos vetores no produto misto só afeta o <strong>sinal</strong>, nunca o módulo — o
          volume é o mesmo. E o sinal indica a orientação do trio (regra da mão direita), que é o que o
          plano chama de &quot;orientação&quot;.
        </p>

        <Checkpoint>
          Você calcula a × b pelo determinante simbólico sem esquecer o sinal do j, sabe que o resultado
          é perpendicular aos dois, usa ‖a × b‖ para área de paralelogramo e triângulo, e aplica o
          produto misto para volume e para testar coplanaridade. Isso destrava o vetor normal do plano,
          que vem a seguir.
        </Checkpoint>
      </Section>
    </article>
  );
}
