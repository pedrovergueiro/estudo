import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Continuidade e limites laterais. */
export function ContinuidadeLesson() {
  return (
    <article className="space-y-10">
      <Section title="Contínua é a função que você desenha sem tirar o lápis">
        <p>
          Essa é a ideia intuitiva, e ela quase nunca falha: se dá para percorrer o gráfico inteiro sem
          levantar o lápis do papel, a função é contínua. Buraco, salto ou explosão quebram a
          continuidade.
        </p>

        <p>A definição formal diz a mesma coisa com precisão:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold text-indigo-900 dark:text-indigo-100">
              f é contínua em p ⟺ lim(x→p) f(x) = f(p)
            </div>
          </div>
        </div>

        <p>
          Dentro dessa igualdade escondem-se <strong>três exigências</strong>, e é assim que a prova cobra:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> <span className="font-mono">f(p)</span> tem que existir — ou seja, p
            pertence ao domínio.
          </div>
          <div>
            <strong>2.</strong> <span className="font-mono">lim(x→p) f(x)</span> tem que existir — ou
            seja, os dois laterais são iguais.
          </div>
          <div>
            <strong>3.</strong> Os dois têm que ser <strong>o mesmo número</strong>.
          </div>
        </div>

        <Callout tipo="prova">
          Falhar em qualquer um dos três já torna a função descontínua em p. Numa questão do tipo
          &quot;verifique a continuidade&quot;, cheque os três em ordem e diga em qual deles a função
          falhou — é isso que o professor chama de <em>justificar</em>.
        </Callout>
      </Section>

      <Section title="O procedimento em função por partes">
        <p>
          Função definida por partes só corre risco de descontinuidade nos{' '}
          <strong>pontos de troca de fórmula</strong>. Em qualquer outro lugar ela é um polinômio ou uma
          fração bem-comportada, e portanto contínua. Isso reduz o trabalho a checar dois ou três pontos.
        </p>

        <p>Tome a função da questão 1(e), que também caiu na revisão de prova:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 font-mono text-[15px]">
            <div>f(x) = 1/x², se |x| ≥ 1</div>
            <div>f(x) = 2, se |x| &lt; 1</div>
          </div>
        </div>

        <p>
          Primeiro, traduza o módulo (isso é metade da questão): |x| ≥ 1 significa x ≥ 1{' '}
          <strong>ou</strong> x ≤ −1; |x| &lt; 1 significa −1 &lt; x &lt; 1. Os pontos de troca são,
          portanto, <strong>x = −1 e x = 1</strong>.
        </p>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-2 font-bold">Em x = −1</div>
            <div>lim(x→−1⁻) f(x) = lim 1/x² = 1/(−1)² = 1 &nbsp;&nbsp;← à esquerda de −1 vale |x| ≥ 1</div>
            <div>lim(x→−1⁺) f(x) = lim 2 = 2 &nbsp;&nbsp;← à direita de −1 já estamos no miolo</div>
            <div className="pt-1 font-bold text-red-600 dark:text-red-400">
              1 ≠ 2 → o limite não existe → f é DESCONTÍNUA em x = −1
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
            <div className="mb-2 font-bold">Em x = 1</div>
            <div>lim(x→1⁻) f(x) = lim 2 = 2 &nbsp;&nbsp;← à esquerda de 1 ainda é o miolo</div>
            <div>lim(x→1⁺) f(x) = lim 1/x² = 1/1² = 1 &nbsp;&nbsp;← à direita já é 1/x²</div>
            <div className="pt-1 font-bold text-red-600 dark:text-red-400">
              2 ≠ 1 → o limite não existe → f é DESCONTÍNUA em x = 1
            </div>
          </div>
        </div>

        <Callout tipo="atencao">
          A parte que exige atenção é <strong>qual fórmula vale de cada lado</strong>. Não é
          &quot;esquerda usa a de cima, direita usa a de baixo&quot;: depende de onde o ponto cai na
          condição. Desenhe a reta, marque −1 e 1, e escreva em cada faixa qual ramo vale. Depois é só
          ler.
        </Callout>

        <p>
          Conclusão da questão: o domínio de f é ℝ inteiro (o 1/x² só seria problema em x = 0, mas ali
          vale o ramo constante 2), e f é contínua em todo ponto <strong>exceto x = −1 e x = 1</strong>,
          onde há saltos.
        </p>
      </Section>

      <Section title="Os três tipos de descontinuidade">
        <p>Saber o nome ajuda a explicar por escrito, que é o que o diagnóstico apontou como frágil:</p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Removível — o buraco
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              O limite existe, mas a função não está definida ali (ou está definida em outro valor). É o
              caso de (x² − 4)/(x − 2) em x = 2. Chama-se removível porque basta{' '}
              <em>definir</em> o valor certo para consertar — foi o que a questão 6 fez com L = 12.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              De salto — os laterais discordam
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Os dois limites laterais existem, mas são diferentes. É o caso da função por partes acima em
              x = ±1. Não tem conserto: nenhum valor de f(1) faria o gráfico se emendar.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Infinita — a explosão
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              A função dispara para ±∞ perto do ponto, como 1/(x − 2) em x = 2. Aqui existe assíntota
              vertical — assunto do último tópico.
            </p>
          </div>
        </div>

        <Callout tipo="info">
          Um detalhe de vocabulário que confunde: <strong>não faz sentido</strong> perguntar se a função é
          contínua num ponto <em>fora do domínio</em> dela. Em (x² − 4)/(x − 2), o correto é dizer que a
          função não está definida em x = 2 e que ali há uma descontinuidade removível — não que ela
          &quot;é descontínua porque vale outra coisa&quot;.
        </Callout>

        <Callout tipo="prova">
          Traduzindo cada tipo para os três requisitos (&quot;portões&quot;) da definição: a{' '}
          <strong>removível</strong> passa no portão 2 (o limite existe) mas falha no 1 ou no 3 (o ponto
          não existe, ou existe com outro valor); a <strong>de salto</strong> falha no portão 2 (os
          laterais existem, mas discordam); a <strong>infinita</strong> também falha no portão 2, só que
          porque o limite explode para ±∞ em vez de dar um número. Nenhuma passa pelos três — por isso
          nenhuma é contínua.
        </Callout>

        <Checkpoint>
          Você testa continuidade pelos três requisitos, calcula limites laterais escolhendo a fórmula
          certa de cada lado em função por partes, e sabe nomear e distinguir descontinuidade removível,
          de salto e infinita.
        </Checkpoint>
      </Section>

      <Section title="O catálogo confiável: funções que já nascem contínuas">
        <p>
          Testar os três requisitos ponto a ponto funciona, mas é lento. Na prática, quase toda função
          &quot;normal&quot; é contínua em todo o seu domínio — e saber disso de cor poupa a maior parte
          do trabalho.
        </p>

        <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-center">
          <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">A regra de ouro</div>
          <div className="mt-1 text-[15px] text-emerald-900 dark:text-emerald-100">
            Polinômios, funções racionais, raízes, trigonométricas, exponenciais e logarítmicas são{' '}
            <strong>contínuas em todo ponto do seu domínio</strong>.
          </div>
        </div>

        <p>
          A ressalva é sempre a mesma: contínua <strong>no domínio</strong>, não em toda a reta. Uma
          racional só falha onde o denominador zera; uma raiz par, onde o radicando é negativo; um
          logaritmo, onde o argumento não é positivo. Fora dessas restrições, a função nunca dá
          surpresa.
        </p>

        <Callout tipo="atencao">
          &quot;Contínua no domínio&quot; não é uma desculpa vazia — é a diferença entre dizer{' '}
          <span className="font-mono">1/x</span> é descontínua em x = 0&quot; (errado: 0 nem está no
          domínio, não faz sentido perguntar) e dizer que ela é contínua em ℝ − &#123;0&#125; (certo, e
          completo).
        </Callout>

        <p>
          E combinações dessas funções — soma, produto, divisão, composição — continuam contínuas, desde
          que você não crie uma divisão por zero ou uma raiz par de negativo no meio do caminho:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            lim(x→a) f(g(x)) = f( lim(x→a) g(x) )
          </div>
        </div>

        <p>
          Essa é a <strong>regra da composição</strong>: se g tem limite em a e f é contínua nesse
          limite, o limite &quot;entra&quot; na função de fora. Na prática, ela é o que justifica calcular{' '}
          <span className="font-mono">lim(x→0) cos(x²)</span> substituindo direto — cos é contínua, então
          o limite pode furar a fila e entrar: cos(lim x²) = cos(0) = 1.
        </p>

        <Callout tipo="prova">
          Fluxo de decisão para qualquer questão &quot;calcule o limite&quot; do tipo substituição
          direta: a função é uma combinação do catálogo confiável? Se sim, e o ponto está dentro do
          domínio, <strong>substitua e acabou</strong> — não precisa de fatoração, racionalização nem
          confronto. Essas técnicas só entram quando a substituição dá forma indeterminada.
        </Callout>
      </Section>

      <Section title="O Teorema do Valor Intermediário (TVI)">
        <p>
          Continuidade não serve só para calcular limites — ela também <strong>garante coisas</strong>{' '}
          sobre o comportamento da função entre dois pontos, mesmo sem saber a fórmula exata do meio do
          caminho.
        </p>

        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4">
          <div className="mb-2 text-sm font-bold text-indigo-900 dark:text-indigo-100">Enunciado</div>
          <div className="space-y-1 text-[15px] text-indigo-900 dark:text-indigo-100">
            <div>
              Se f é <strong>contínua</strong> em [a, b], e N é qualquer valor entre f(a) e f(b),
            </div>
            <div className="pt-1 font-bold">
              então existe pelo menos um c em (a, b) tal que f(c) = N.
            </div>
          </div>
        </div>

        <p>
          A analogia que fixa a ideia: um submarino está a 100 m de profundidade no instante a e a 10 m
          de profundidade no instante b. Ele <strong>não pode se teletransportar</strong> — para ir de
          100 m a 10 m ele obrigatoriamente passou pelos 50 m em algum momento c no meio. É exatamente
          isso que a continuidade garante: sem saltos, o gráfico não pode &quot;pular&quot; um valor
          intermediário sem passar por ele.
        </p>

        <Callout tipo="atencao">
          O TVI garante que c <strong>existe</strong>, mas não diz onde ele está nem quantos existem
          (pode haver mais de um). E a hipótese de continuidade em [a, b] é obrigatória: uma função com
          um salto pode pular por cima de N sem nunca passar por ele — é isso que uma descontinuidade de
          salto faz.
        </Callout>

        <p>
          A aplicação mais comum é <strong>provar que existe uma raiz</strong> num intervalo, sem
          resolver a equação:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="mb-2 font-bold">
            f(x) = 4x³ − 6x² + 3x − 2. Mostre que existe uma raiz entre x = 1 e x = 2.
          </div>
          <div>f é polinômio → contínua em [1, 2] (catálogo confiável, sem ressalva nenhuma)</div>
          <div>f(1) = 4 − 6 + 3 − 2 = −1 &nbsp;(negativo)</div>
          <div>f(2) = 32 − 24 + 6 − 2 = 12 &nbsp;(positivo)</div>
          <div className="pt-1 font-bold text-emerald-700 dark:text-emerald-400">
            Como f(1) &lt; 0 &lt; f(2), pelo TVI existe c em (1, 2) com f(c) = 0.
          </div>
        </div>

        <Callout tipo="prova">
          Receita fixa para &quot;mostre que existe uma solução&quot;: (1) confirme que f é contínua no
          intervalo — quase sempre basta dizer &quot;é polinômio&quot;; (2) calcule f nas duas pontas; (3)
          confira que elas têm <strong>sinais opostos</strong>; (4) conclua citando o TVI. As quatro
          etapas, nessa ordem, são a demonstração completa — não precisa achar o valor exato de c.
        </Callout>

        <Callout tipo="ia">
          O TVI é a justificativa teórica por trás da <strong>busca binária para achar raízes</strong>{' '}
          (bisseção): já que a raiz está garantidamente entre 1 e 2, teste o meio (1,5); o sinal ali diz
          de qual lado ela está, e o intervalo encolhe pela metade a cada passo. Testando décimos — 1,2
          dá negativo, 1,3 dá positivo — o intervalo já encolheu 10 vezes. É o mesmo princípio de busca
          binária usado para otimizar hiperparâmetros ou calibrar um limiar de decisão num classificador:
          reduzir o espaço de busca pela metade a cada avaliação.
        </Callout>

        <Checkpoint>
          Você reconhece continuidade sem checar ponto a ponto (catálogo confiável + domínio), usa a
          regra da composição para justificar substituição direta, aplica o TVI para provar existência de
          raiz com a receita de quatro passos, e entende por que a continuidade é a hipótese que faz tudo
          isso funcionar. Falta só o comportamento no infinito, que fecha o assunto de assíntotas.
        </Checkpoint>
      </Section>
    </article>
  );
}
