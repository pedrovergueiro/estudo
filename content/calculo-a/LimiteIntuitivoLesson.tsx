import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { LimitApproachTable } from '@/components/interactive/LimitApproachTable';

/** Aula: A ideia intuitiva de limite. */
export function LimiteIntuitivoLesson() {
  return (
    <article className="space-y-10">
      <Section title="Limite pergunta o destino, não a chegada">
        <p>
          A notação <span className="font-mono">lim(x→2) f(x) = L</span> se lê assim:{' '}
          <strong>quando x chega perto de 2, f(x) chega perto de L</strong>.
        </p>

        <p>
          A palavra que decide tudo é <strong>perto</strong>. O limite não olha o que acontece{' '}
          <em>em</em> x = 2. Ele olha o que acontece na vizinhança, chegando pelos dois lados. A função
          pode até não existir no ponto — o limite continua fazendo sentido.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">lim f(x) ≠ f(2)</div>
            <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              são perguntas diferentes — às vezes coincidem, às vezes não
            </div>
          </div>
        </div>

        <Callout tipo="info">
          Uma analogia que ajuda: você está dirigindo em direção a uma cidade. O limite é{' '}
          <strong>para onde a estrada aponta</strong>. Se a cidade estiver interditada, a estrada continua
          apontando para lá — o destino existe mesmo que a chegada não aconteça.
        </Callout>
      </Section>

      <Section title="Quando é fácil: só substituir">
        <p>
          Na maior parte dos casos da Parte A da lista, a função é bem-comportada no ponto e o limite é
          simplesmente o valor da função ali:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>lim(x→1) (x + 2) = 1 + 2 = 3</div>
          <div>lim(x→1) (2x + 1) = 2(1) + 1 = 3</div>
          <div>lim(x→2) (x² + 1) = 4 + 1 = 5</div>
          <div>lim(x→1) √x = √1 = 1</div>
          <div>lim(x→2) (x² + x)/(x + 3) = (4 + 2)/5 = 6/5</div>
          <div>lim(x→10) 5 = 5 &nbsp;&nbsp;← função constante: vale 5 em todo lugar</div>
        </div>

        <p>
          Isso funciona porque polinômios, raízes e frações com denominador não nulo são{' '}
          <strong>funções contínuas</strong> nesses pontos — e continuidade é exatamente a propriedade de
          que o limite bate com o valor da função.
        </p>

        <Callout tipo="atencao">
          Substituir é o <strong>primeiro</strong> passo, sempre. Mas é só o primeiro. Se a substituição
          der um número normal, acabou. Se der <span className="font-mono">0/0</span>, o resultado não é
          &quot;não existe&quot; — é o aviso de que você precisa simplificar antes. Essa forma
          indeterminada é o assunto do próximo tópico.
        </Callout>
      </Section>

      <Section title="Quando dá 0/0: o buraco no gráfico">
        <p>
          Em <span className="font-mono">lim(x→2) (x² − 4)/(x − 2)</span>, substituir dá 0/0. A função
          realmente não existe em x = 2. Mas veja o que acontece em volta:
        </p>

        <LimitApproachTable />

        <p>
          Os números apertam num valor só, vindo dos dois lados. Esse valor é o limite. Graficamente, a
          função é a reta y = x + 2 com um <strong>buraco</strong> em (2, 4) — e o limite &quot;preenche&quot;
          o buraco.
        </p>

        <Callout tipo="prova">
          Guarde a frase: <strong>0/0 não é resposta, é sintoma.</strong> É o sinal de que numerador e
          denominador têm um fator comum, e que ele vai cancelar. Se você escrever &quot;o limite não
          existe&quot; ao ver 0/0, perde a questão inteira.
        </Callout>
      </Section>

      <Section title="Limites laterais: os dois lados precisam concordar">
        <p>
          Chegar &quot;pela esquerda&quot; (valores menores que o ponto) e &quot;pela direita&quot;
          (maiores) são duas perguntas separadas:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>lim(x→a⁻) f(x) &nbsp;&nbsp;← pela esquerda, x menor que a</div>
          <div>lim(x→a⁺) f(x) &nbsp;&nbsp;← pela direita, x maior que a</div>
        </div>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 text-center">
            <div className="font-mono font-bold text-indigo-900 dark:text-indigo-100">
              o limite existe ⟺ os dois laterais existem E são iguais
            </div>
          </div>
        </div>

        <p>
          Para funções &quot;normais&quot; isso é automático e nem se comenta. Mas em{' '}
          <strong>função definida por partes</strong>, os dois lados usam fórmulas diferentes — e é aí que
          eles podem discordar. Na função da questão 1(e):
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>lim(x→1⁻) f(x) = lim 2 = 2 &nbsp;&nbsp;← pela esquerda vale o ramo do miolo</div>
          <div>lim(x→1⁺) f(x) = lim 1/x² = 1 &nbsp;&nbsp;← pela direita vale o ramo de fora</div>
          <div className="pt-1 font-bold text-red-600 dark:text-red-400">
            2 ≠ 1 → lim(x→1) f(x) NÃO EXISTE
          </div>
        </div>

        <p>
          Note o cuidado: para calcular o limite lateral, você usa a fórmula que vale{' '}
          <strong>daquele lado</strong>. Pela esquerda de 1, estamos no miolo (|x| &lt; 1), onde f vale 2.
          Pela direita, já estamos fora (|x| ≥ 1), onde f vale 1/x².
        </p>

        <Checkpoint>
          Você lê limite como &quot;para onde a função aponta&quot;, resolve por substituição direta
          quando dá certo, reconhece 0/0 como sintoma de fator cancelável e sabe que o limite só existe
          quando os dois laterais concordam. Esse último ponto é a ferramenta que resolve toda questão de
          continuidade.
        </Checkpoint>
      </Section>
    </article>
  );
}
