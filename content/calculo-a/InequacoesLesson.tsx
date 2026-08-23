import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { AbsoluteValueInequality } from '@/components/interactive/AbsoluteValueInequality';

/** Aula: Inequações, intervalos e módulo. */
export function InequacoesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Inequação é equação com uma regra a mais">
        <p>
          Resolver <span className="font-mono">2x − 3 &lt; 5</span> é quase igual a resolver{' '}
          <span className="font-mono">2x − 3 = 5</span>: você isola o x do mesmo jeito, somando e
          subtraindo dos dois lados. A diferença é uma única regra:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold text-red-900 dark:text-red-100">
              multiplicar ou dividir por número NEGATIVO
            </div>
            <div className="mt-1 font-bold text-red-900 dark:text-red-100">inverte o sinal ≤ ⇄ ≥</div>
          </div>
        </div>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>−2x &gt; 6</div>
          <div>x &lt; −3 &nbsp;&nbsp;← dividiu por −2, o &gt; virou &lt;</div>
        </div>

        <p>
          Sempre teste um número da resposta. Se x &lt; −3, tente x = −4: −2(−4) = 8 &gt; 6 ✓. Se você
          tivesse esquecido de virar o sinal, responderia x &gt; −3, e o teste com x = 0 daria 0 &gt; 6,
          que é falso — o erro apareceria na hora.
        </p>

        <Callout tipo="info">
          Somar e subtrair <strong>nunca</strong> invertem nada. Só a multiplicação e a divisão por
          negativo. Por isso, quando dá para evitar, evite: em vez de resolver −2x &gt; 6 dividindo por
          −2, você pode passar tudo para o outro lado e resolver 6 &lt; 2x, ou seja, 3 &lt; x. Mesma
          resposta, sem o risco.
        </Callout>
      </Section>

      <Section title="Módulo é distância até o zero">
        <p>
          <span className="font-mono">|x|</span> não é &quot;tirar o sinal de menos&quot;. É a{' '}
          <strong>distância de x até o zero</strong> na reta. Essa leitura resolve todas as inequações com
          módulo sem decorar fórmula.
        </p>

        <p>
          Se |x| ≥ 1 significa &quot;x está a uma distância de pelo menos 1 do zero&quot;, os números que
          servem são os que estão longe: 1, 2, 5… e também −1, −2, −5. São{' '}
          <strong>dois pedaços separados</strong> da reta.
        </p>

        <AbsoluteValueInequality />

        <Callout tipo="prova">
          As duas traduções que resolvem tudo:
          <br />• <span className="font-mono">|x| &lt; k</span> →{' '}
          <span className="font-mono">−k &lt; x &lt; k</span> — <strong>um</strong> intervalo, o miolo
          <br />• <span className="font-mono">|x| &gt; k</span> →{' '}
          <span className="font-mono">x &lt; −k ou x &gt; k</span> — <strong>dois</strong> intervalos, as
          pontas
          <br />
          Com ≤ e ≥ é igual, só trocando parênteses por colchetes.
        </Callout>

        <Callout tipo="atencao">
          O erro que mais aparece: escrever <span className="font-mono">−k &gt; x &gt; k</span> para o caso
          do &quot;maior&quot;. Isso não existe — nenhum número é ao mesmo tempo menor que −k e maior que
          k. Quando a resposta são duas partes, elas se ligam por <strong>ou</strong> e se escrevem com
          <strong> união (∪)</strong>, nunca como desigualdade dupla.
        </Callout>

        <p>
          Isso não é detalhe de nivelamento: é exatamente como a questão 1(e) da lista de limites define a
          função. Ela vale 1/x² quando |x| ≥ 1 (as duas pontas) e vale 2 quando |x| &lt; 1 (o miolo). Sem
          traduzir o módulo, não dá nem para esboçar o gráfico.
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(x) = 1/x², se |x| ≥ 1 &nbsp;→&nbsp; se x ≥ 1 ou x ≤ −1</div>
          <div>f(x) = 2, se |x| &lt; 1 &nbsp;→&nbsp; se −1 &lt; x &lt; 1</div>
        </div>
      </Section>

      <Section title="Inequação de 2º grau: resolve pelas raízes e pelo sinal">
        <p>
          Para <span className="font-mono">x² − 5x + 6 &gt; 0</span>, o caminho <strong>não</strong> é
          isolar o x. É:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Achar as raízes: x² − 5x + 6 = 0 → x = 2 e x = 3.
          </div>
          <div>
            <strong>2.</strong> Ver a concavidade: o coeficiente de x² é +1, positivo → parábola com boca
            para cima.
          </div>
          <div>
            <strong>3.</strong> Ler o sinal no gráfico: boca para cima fica{' '}
            <strong>negativa entre as raízes</strong> e positiva fora delas.
          </div>
          <div className="pt-2 font-mono font-bold">Resposta: x &lt; 2 ou x &gt; 3 → (−∞, 2) ∪ (3, +∞)</div>
        </div>

        <Callout tipo="info">
          A regra vale sempre: parábola com boca para cima é <strong>negativa só no miolo</strong>, entre
          as raízes. Com boca para baixo, é o contrário. Se você esboçar a parábola em dez segundos no
          canto da folha, nunca mais precisa decorar tabela de sinais.
        </Callout>

        <p>
          O mesmo raciocínio serve para quociente, como{' '}
          <span className="font-mono">(x − 1)/(x + 2) ≥ 0</span>: estude o sinal de cima e de baixo
          separadamente, marque os dois pontos críticos na reta (x = 1 e x = −2) e veja em quais faixas a
          divisão dá positivo. A diferença é que o <strong>denominador nunca pode entrar</strong> na
          resposta, mesmo com ≥: x = −2 fica de fora sempre.
        </p>

        <Checkpoint>
          Você inverte o sinal ao multiplicar por negativo, traduz módulo como distância (um intervalo
          para &lt;, dois para &gt;), escreve tudo em notação de intervalo e resolve inequação quadrática
          pelas raízes e pela concavidade. Isso destrava domínios com raiz, o gráfico da questão 1(e) e o
          estudo de sinal que aparece em assíntotas verticais.
        </Checkpoint>
      </Section>
    </article>
  );
}
