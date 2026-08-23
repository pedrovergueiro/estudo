import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: A definição formal de limite, epsilon-delta (Secção 2.4). */
export function EpsilonDeltaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Por que a tabelinha não prova nada">
        <p>
          Até agora, limite foi tratado assim: monte uma tabela, veja para onde os valores parecem ir,
          conclua. Funciona como intuição — e falha como demonstração.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="mb-2 font-bold">f(x) = sen(π/x), com x → 0</div>
          <div>x = 1 &nbsp;&nbsp;&nbsp;→ f(x) = sen(π) = 0</div>
          <div>x = 0,5 &nbsp;→ f(x) = sen(2π) = 0</div>
          <div>x = 0,1 &nbsp;→ f(x) = sen(10π) = 0</div>
          <div>x = 0,01 → f(x) = sen(100π) = 0</div>
          <div className="pt-1 text-red-700 dark:text-red-400">
            a tabela &quot;prova&quot; que o limite é 0 — e o limite não existe
          </div>
        </div>

        <p>
          A tabela escolheu justamente os pontos em que a função vale zero. Entre eles ela continua
          subindo até 1 e descendo até −1, infinitas vezes. Nenhuma quantidade de linhas na tabela
          revelaria isso.
        </p>

        <Callout tipo="atencao">
          O problema de fundo é a palavra <strong>perto</strong>. &quot;Quando x fica perto de a, f(x)
          fica perto de L&quot; não é uma afirmação matemática: perto quanto? A definição ε-δ existe
          exatamente para trocar a palavra perto por um número.
        </Callout>
      </Section>

      <Section title="A caixa de tolerância">
        <p>Antes dos símbolos, a imagem geométrica — que é a mesma do slide da caixa de intersecção:</p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-red-400 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              A faixa horizontal (deitada) — o eixo y
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Vai de <span className="font-mono">L − ε</span> até <span className="font-mono">L + ε</span>.
              É a <strong>margem de erro aceita na saída</strong>. Quem escolhe a altura dela é o
              adversário, e ele vai escolher fina.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              A faixa vertical (em pé) — o eixo x
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Vai de <span className="font-mono">a − δ</span> até <span className="font-mono">a + δ</span>.
              É a <strong>janela de segurança na entrada</strong>. Quem escolhe a largura dela é você,
              depois de ver o ε.
            </p>
          </div>
        </div>

        <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-4">
          <div className="mb-1 text-sm font-bold text-indigo-900 dark:text-indigo-100">
            A regra do retângulo
          </div>
          <p className="text-[15px] text-indigo-900 dark:text-indigo-100">
            No cruzamento das duas faixas forma-se um retângulo. O limite existe se, para{' '}
            <strong>qualquer altura</strong> que o adversário der ao retângulo, você conseguir apertar a
            largura o bastante para que a curva saia dele <strong>só pelas laterais</strong> — nunca pelo
            teto nem pelo chão.
          </p>
          <p className="mt-2 text-[15px] text-indigo-900 dark:text-indigo-100">
            Escapar pelo teto ou pelo chão significa que existe um x dentro da sua janela cujo f(x)
            estourou a margem de erro. Aí a sua janela não serviu, e você precisa de uma mais estreita.
          </p>
        </div>
      </Section>

      <Section title="A definição, com os quantificadores no lugar">
        <p>
          O slide da aula mostra a parte de dentro da definição. Mas o que a torna uma definição de
          limite são os dois pedaços que vêm antes — e é onde quase todo mundo se perde:
        </p>

        <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-5 text-center font-mono text-[15px] leading-loose">
          <div>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              para todo ε &gt; 0
            </span>
            , &nbsp;
            <span className="font-bold text-emerald-600 dark:text-emerald-400">existe δ &gt; 0</span>{' '}
            tal que
          </div>
          <div className="pt-1">
            se &nbsp;<span className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-1">0 &lt; |x − a| &lt; δ</span>
            &nbsp; então &nbsp;
            <span className="rounded bg-red-100 dark:bg-red-900/60 px-1">|f(x) − L| &lt; ε</span>
          </div>
        </div>

        <div className="space-y-2">
          <p>
            <strong className="text-indigo-600 dark:text-indigo-400">para todo ε &gt; 0</strong> — a
            promessa vale contra qualquer exigência, por menor que seja. Não basta funcionar para ε =
            0,1.
          </p>
          <p>
            <strong className="text-emerald-600 dark:text-emerald-400">existe δ &gt; 0</strong> — basta
            você exibir <em>um</em> δ que funcione. Não precisa ser o maior possível.
          </p>
          <p>
            <span className="font-mono">|x − a| &lt; δ</span> — traduzindo o módulo: a distância de x até
            a é menor que δ, ou seja, <span className="font-mono">a − δ &lt; x &lt; a + δ</span>. É aqui
            que a aula de inequações com módulo cobra a fatura.
          </p>
          <p>
            <span className="font-mono">|f(x) − L| &lt; ε</span> — a distância da saída até L é menor que
            ε, ou seja, <span className="font-mono">L − ε &lt; f(x) &lt; L + ε</span>.
          </p>
        </div>

        <Callout tipo="atencao">
          A <strong>ordem</strong> dos quantificadores é o conteúdo da definição. O ε vem primeiro e o δ
          depois, porque <strong>δ depende de ε</strong> — você só consegue escolher a largura da janela
          depois de saber que precisão foi exigida. Inverter isso (existe δ para todo ε) produz uma
          afirmação diferente e falsa.
        </Callout>
      </Section>

      <Section title="O detalhe do 0 &lt; à esquerda">
        <p>
          Por que a condição não é só <span className="font-mono">|x − a| &lt; δ</span>, mas{' '}
          <span className="font-mono">0 &lt; |x − a| &lt; δ</span>?
        </p>
        <p>
          Porque <span className="font-mono">|x − a| = 0</span> significa exatamente{' '}
          <span className="font-mono">x = a</span>. Escrever <span className="font-mono">0 &lt;</span>{' '}
          é a forma técnica de dizer <strong>menos o próprio ponto a</strong>.
        </p>

        <Callout tipo="info">
          Esse simbolozinho é o que faz o limite ignorar o valor da função no ponto. É a versão formal
          daqueles três gráficos da aula: a função pode ser contínua ali, pode ter um buraco, pode nem
          estar definida em a — e o limite continua o mesmo, porque a definição nunca olha para x = a.
        </Callout>
      </Section>

      <Section title="O jogo: desafiador contra defensor">
        <p>A definição fica muito mais fácil de lembrar como uma disputa em dois turnos:</p>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:text-red-300">
              Turno 1 — o desafiador
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Joga um ε na mesa. &quot;Exijo que f(x) acerte L com erro menor que 0,001.&quot; Ele pode
              voltar quantas vezes quiser, sempre com um ε menor.
            </p>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Turno 2 — o defensor
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Responde com um δ. &quot;Fique a menos de 0,0005 de a e eu garanto o seu erro.&quot; Ele
              responde depois de ver o ε.
            </p>
          </div>
          <div className="rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
              Vitória
            </div>
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              O defensor vence se tiver uma <strong>fórmula</strong> de δ em função de ε que funcione
              sempre. Aí o limite está provado.
            </p>
          </div>
        </div>

        <p>
          Aqueles números do slide não são aleatórios: <span className="font-mono">δ = 0,0005</span> é
          exatamente <span className="font-mono">ε/2</span> com{' '}
          <span className="font-mono">ε = 0,001</span>. Essa fórmula δ = ε/2 é a resposta certa para
          qualquer função da forma f(x) = 2x + c — que é justamente o exemplo resolvido abaixo.
        </p>
      </Section>

      <Section title="Uma prova de verdade, do rascunho ao texto final">
        <p>
          Provar que <span className="font-mono">lim(x→3) (2x − 1) = 5</span>. Toda prova ε-δ tem duas
          partes, e só a segunda vai no papel entregue.
        </p>

        <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
          <div className="mb-2 font-bold text-amber-900 dark:text-amber-100">
            Parte 1 — rascunho: descobrir o δ (trabalhando de trás para frente)
          </div>
          <div className="font-mono text-[15px] text-amber-900 dark:text-amber-100 space-y-1">
            <div>quero: |f(x) − L| &lt; ε</div>
            <div>|(2x − 1) − 5| = |2x − 6| = |2(x − 3)| = 2·|x − 3|</div>
            <div>então preciso de: 2·|x − 3| &lt; ε</div>
            <div>ou seja: |x − 3| &lt; ε/2</div>
            <div className="pt-1 font-bold">achei: basta tomar δ = ε/2</div>
          </div>
        </div>

        <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
          <div className="mb-2 font-bold text-emerald-900 dark:text-emerald-100">
            Parte 2 — a prova, escrita para frente
          </div>
          <div className="font-mono text-[15px] text-emerald-900 dark:text-emerald-100 space-y-1">
            <div>Seja ε &gt; 0 dado. Tome δ = ε/2.</div>
            <div>Suponha 0 &lt; |x − 3| &lt; δ. Então:</div>
            <div className="pl-4">|f(x) − 5| = |2x − 6| = 2·|x − 3| &lt; 2·δ = 2·(ε/2) = ε</div>
            <div className="pt-1">
              Logo |f(x) − 5| &lt; ε sempre que 0 &lt; |x − 3| &lt; δ.
            </div>
            <div className="font-bold">Portanto lim(x→3) (2x − 1) = 5. ∎</div>
          </div>
        </div>

        <Callout tipo="prova">
          O que vale nota é a Parte 2, e ela tem uma estrutura fixa que vale decorar:{' '}
          <strong>Seja ε &gt; 0 → tome δ = (fórmula) → suponha 0 &lt; |x − a| &lt; δ → conclua |f(x) − L|
          &lt; ε</strong>. Entregar só o rascunho conta como não ter provado: o rascunho mostra de onde
          veio o δ, mas a lógica dele corre ao contrário da lógica da definição.
        </Callout>

        <Callout tipo="atencao">
          Ninguém adivinha o δ. Ele sempre sai de manipular <span className="font-mono">|f(x) − L|</span>{' '}
          até aparecer um <span className="font-mono">|x − a|</span> multiplicado por alguma coisa. Para
          funções do 1º grau <span className="font-mono">f(x) = mx + b</span>, o resultado é sempre{' '}
          <span className="font-mono">δ = ε/|m|</span>.
        </Callout>

        <Callout tipo="ia">
          Isso não é só formalidade acadêmica: é literalmente como se testa código numérico. Quando você
          escreve <span className="font-mono">np.allclose(a, b, atol=1e-8)</span>, o{' '}
          <span className="font-mono">1e-8</span> é o ε. Quando um treino para porque a perda mudou menos
          que um limiar, o limiar é o ε. A pergunta &quot;quantas iterações preciso rodar para garantir
          essa precisão?&quot; é a pergunta &quot;qual é o δ?&quot;.
        </Callout>

        <Checkpoint>
          Você sabe por que a tabela não prova limite, lê a caixa de tolerância em termos de ε e δ,
          escreve a definição com os quantificadores na ordem certa, explica o papel do 0 &lt; à
          esquerda, e monta uma prova ε-δ para função do 1º grau separando rascunho de texto final. Isso
          fecha a Secção 2.4.
        </Checkpoint>
      </Section>
    </article>
  );
}
