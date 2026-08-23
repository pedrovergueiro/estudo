import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { FractionVisualizer } from '@/components/interactive/FractionVisualizer';

/** Aula: Frações sem decoreba. */
export function FracoesLesson() {
  return (
    <article className="space-y-10">
      <Section title="O que uma fração realmente é">
        <p>
          Uma fração é uma <strong>divisão que ainda não foi feita</strong>. O traço no meio é um
          sinal de divisão. <span className="font-mono">3/4</span> significa &quot;3 dividido por
          4&quot;.
        </p>
        <p>Os dois números têm papéis diferentes, e essa é a chave de tudo:</p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              Numerador (o de cima)
            </div>
            <p className="mt-1 text-sm text-amber-900 dark:text-amber-100">
              <strong>Quantas fatias</strong> você tem. É uma contagem.
            </p>
          </div>
          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="font-bold text-sky-900 dark:text-sky-100">
              Denominador (o de baixo)
            </div>
            <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
              <strong>De que tamanho</strong> é cada fatia — em quantos pedaços o inteiro foi
              cortado. É uma unidade de medida.
            </p>
          </div>
        </div>

        <p>
          Sacar isso resolve o erro mais comum de todos. Quando você soma frações, está somando{' '}
          <em>quantidades de fatias</em>. E só dá para somar fatias se elas tiverem o mesmo tamanho.
        </p>
      </Section>

      <Section title="Somar e subtrair: o denominador precisa ser igual">
        <p>
          Mexa nos controles abaixo e olhe as barras. Repare no que acontece quando os denominadores
          são diferentes:
        </p>

        <FractionVisualizer />

        <p>A receita, agora que você viu o motivo:</p>
        <ol className="list-decimal space-y-2 pl-6">
          <li>
            Ache um denominador comum (multiplicar um pelo outro sempre funciona, mesmo que não seja
            o menor possível).
          </li>
          <li>
            Converta cada fração multiplicando em cima <strong>e</strong> embaixo pelo mesmo número.
            Isso não muda o valor — só recorta em mais pedaços.
          </li>
          <li>Agora some só os numeradores. O denominador fica quieto.</li>
          <li>Simplifique se der.</li>
        </ol>

        <Callout tipo="atencao">
          <strong>1/2 + 1/3 não é 2/5.</strong> Somar os de cima e os de baixo separadamente é o
          erro nº 1 com frações. O certo é 3/6 + 2/6 = 5/6. Repare que 5/6 é quase 1, enquanto 2/5 é
          menos que meio — a diferença é enorme, não é um detalhe.
        </Callout>
      </Section>

      <Section title="Multiplicar: o caso fácil">
        <p>
          Aqui é o contrário do que a intuição sugere depois da soma:{' '}
          <strong>multiplicação não precisa de denominador comum</strong>. Multiplique reto.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            2/3 × 3/4 = (2×3)/(3×4) = 6/12 = 1/2
          </div>
        </div>

        <p>
          De cima com de cima, de baixo com de baixo. Só isso. Se sobrar, simplifica no final.
        </p>
      </Section>

      <Section title="Dividir: vira multiplicação de cabeça para baixo">
        <p>
          Dividir por uma fração é <strong>multiplicar pelo inverso dela</strong> (o inverso é a
          mesma fração virada de ponta-cabeça).
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            6 ÷ 1/2 = 6 × 2/1 = 12
          </div>
        </div>

        <p>
          Parece estranho o resultado ficar <em>maior</em>, mas faz sentido quando você lê a
          pergunta certa: &quot;quantas metades cabem em 6?&quot; Cabem 12 metades. Dividir{' '}
          <strong>por</strong> meio é o oposto de dividir <strong>em</strong> dois.
        </p>

        <Callout tipo="info">
          Truque para não esquecer: dividir por um número pequeno dá resultado grande. Como 1/2 é
          menor que 1, dividir por ele aumenta. Se sua resposta diminuiu, você provavelmente
          multiplicou sem inverter.
        </Callout>
      </Section>

      <Section title="Onde isso vai aparecer no seu semestre">
        <Callout tipo="prova" titulo="Escalonamento de Gauss (GAAL, tópico 3)">
          Quando você divide uma linha da matriz pelo pivô para transformá-lo em 1, aparecem frações
          na hora — e elas se propagam pela linha inteira nos passos seguintes. Quem não está
          confortável com fração trava exatamente aí e acha que o problema é &quot;não entender
          matriz&quot;, quando na verdade é aritmética. O site mostra as frações exatas (1/3, não
          0,3333) justamente para você poder acompanhar.
        </Callout>

        <Callout tipo="prova" titulo="Derivadas e limites (Cálculo 1)">
          Regra do quociente, limites com fração no numerador e denominador, frações compostas. Se a
          aritmética de fração é insegura, cada exercício de Cálculo vira duas dificuldades
          empilhadas: o conceito novo e a conta. Resolver a conta aqui alivia metade do peso lá.
        </Callout>

        <Checkpoint>
          Você entende o que numerador e denominador significam, sabe por que soma exige denominador
          comum, e sabe multiplicar e dividir. Não precisa ser rápido — precisa estar certo. A
          velocidade vem com repetição.
        </Checkpoint>
      </Section>
    </article>
  );
}
