import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Leitura e esboço de gráficos. */
export function GraficosLesson() {
  return (
    <article className="space-y-10">
      <Section title="Esboçar não é desenhar bonito: é marcar o que importa">
        <p>
          O professor foi explícito na orientação da lista:{' '}
          <em>&quot;não faça um desenho genérico: destaque o comportamento relevante da função&quot;</em>.
          Esboço vale nota pelos pontos que você marca, não pela curva perfeita.
        </p>

        <p>Para qualquer função, os pontos relevantes são sempre os mesmos três:</p>

        <div className="space-y-3">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              Onde corta o eixo x (raízes)
            </div>
            <div className="font-mono text-sm text-gray-700 dark:text-gray-300">faça f(x) = 0</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">Onde corta o eixo y</div>
            <div className="font-mono text-sm text-gray-700 dark:text-gray-300">calcule f(0)</div>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="font-bold text-gray-900 dark:text-gray-100">
              O vértice (se for parábola)
            </div>
            <div className="font-mono text-sm text-gray-700 dark:text-gray-300">
              x<sub>v</sub> = −b/(2a), depois calcule f(x<sub>v</sub>)
            </div>
          </div>
        </div>

        <Callout tipo="info">
          Repare na simetria da receita: para achar onde corta o eixo <strong>x</strong>, você zera o{' '}
          <strong>y</strong>. Para achar onde corta o eixo <strong>y</strong>, você zera o{' '}
          <strong>x</strong>. Trocar os dois é um erro comum e fácil de evitar lembrando disso.
        </Callout>
      </Section>

      <Section title="Parábola: um exemplo completo">
        <p>
          Para <span className="font-mono">f(x) = x² − 4</span>:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>raízes: x² − 4 = 0 → x² = 4 → x = 2 e x = −2</div>
          <div>eixo y: f(0) = 0 − 4 = −4 → ponto (0, −4)</div>
          <div>vértice: x_v = −0/(2·1) = 0 → f(0) = −4 → vértice (0, −4)</div>
          <div>concavidade: a = +1 &gt; 0 → boca para CIMA</div>
        </div>

        <p>
          Com esses quatro dados, o esboço se desenha sozinho: uma parábola de boca para cima, tocando o
          eixo x em −2 e 2, com o ponto mais baixo em (0, −4). Aqui o vértice coincide com a interseção do
          eixo y porque não há termo em x — quando houver, serão pontos diferentes.
        </p>

        <Callout tipo="atencao">
          <span className="font-mono">x² = 4</span> tem <strong>duas</strong> soluções: x = 2 e x = −2.
          Escrever só x = 2 perde metade da resposta. Isso vale toda vez que você tira raiz quadrada dos
          dois lados de uma equação.
        </Callout>
      </Section>

      <Section title="Função definida por partes: desenhe pedaço por pedaço">
        <p>
          Este é o formato que abre a lista de limites, e o que mais confunde. A função tem receitas
          diferentes em regiões diferentes de x:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 font-mono text-[15px]">
            <div>f(x) = x², se x ≤ 1</div>
            <div>f(x) = 2, se x &gt; 1</div>
          </div>
        </div>

        <p>O procedimento é mecânico:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Desenhe a parábola y = x², mas <strong>só até x = 1</strong>. Apague o
            resto.
          </div>
          <div>
            <strong>2.</strong> Desenhe a reta horizontal y = 2, mas <strong>só depois de x = 1</strong>.
          </div>
          <div>
            <strong>3.</strong> No ponto de encontro (x = 1), decida as bolinhas.
          </div>
        </div>

        <p>
          A regra das bolinhas vem direto da desigualdade do enunciado:{' '}
          <strong>≤ ou ≥ dão bolinha cheia</strong> (o ponto pertence àquele ramo);{' '}
          <strong>&lt; ou &gt; dão bolinha vazia</strong>. Aqui, x ≤ 1 fecha a parábola em (1, 1) com
          bolinha cheia, e x &gt; 1 abre a reta em (1, 2) com bolinha vazia.
        </p>

        <Callout tipo="prova">
          As bolinhas <strong>são</strong> a resposta da questão de continuidade. Se as duas pontas se
          encontram na mesma altura, o gráfico é contínuo ali. Se ficam em alturas diferentes — como 1 e 2
          neste exemplo — há um <strong>salto</strong>, e a função é descontínua em x = 1. Desenhar bem
          resolve a questão antes mesmo de calcular limite.
        </Callout>

        <p>
          Um caso mais elaborado, o da questão 1(e): f(x) = 1/x² se |x| ≥ 1, e f(x) = 2 se |x| &lt; 1.
          Traduzindo o módulo, isso é 1/x² nas duas pontas (x ≤ −1 e x ≥ 1) e o valor constante 2 no miolo
          (−1 &lt; x &lt; 1). O esboço fica: uma barra horizontal na altura 2 entre −1 e 1, com bolinhas
          vazias nas duas extremidades, e os dois ramos de 1/x² descendo em direção ao eixo x, começando
          com bolinha cheia em (±1, 1). São dois saltos, em x = −1 e x = 1.
        </p>
      </Section>

      <Section title="Ler o gráfico de volta">
        <p>
          A leitura inversa também cai: dado o desenho, responder domínio, raízes e imagem. O mapa é
          direto:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Domínio</strong> → a sombra do gráfico no eixo <strong>x</strong>: até onde ele se
            estende na horizontal.
          </div>
          <div>
            <strong>Imagem</strong> → a sombra no eixo <strong>y</strong>: quais alturas o gráfico atinge.
          </div>
          <div>
            <strong>Raízes</strong> → onde a curva toca o eixo x.
          </div>
          <div>
            <strong>f(3)</strong> → suba na vertical a partir do 3 até encontrar a curva e leia a altura.
          </div>
        </div>

        <Checkpoint>
          Você esboça marcando raízes, interseção com o eixo y e vértice; desenha função por partes um
          ramo de cada vez com a bolinha certa em cada ponta; e lê domínio, imagem e raízes de volta a
          partir do desenho. O gráfico é o que vai tornar limite e continuidade visíveis em vez de
          abstratos.
        </Checkpoint>
      </Section>
    </article>
  );
}
