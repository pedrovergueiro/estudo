import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Funções — ler, avaliar e compor. */
export function FuncoesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Função é uma máquina: entra um número, sai outro">
        <p>
          Toda a notação de Cálculo A depende de você ler <span className="font-mono">f(x)</span> com
          naturalidade. E a leitura certa é simples: <strong>f é uma máquina</strong>, x é o que você
          coloca dentro dela, e <span className="font-mono">f(x)</span> é o que sai.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            f(x) = 2x − 3
          </div>
        </div>

        <p>
          Essa é a receita da máquina: <em>pegue o que entrou, dobre e tire 3</em>. Calcular f(0), f(2)
          e f(−1) é só rodar a receita três vezes:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(0) = 2(0) − 3 = 0 − 3 = −3</div>
          <div>f(2) = 2(2) − 3 = 4 − 3 = 1</div>
          <div>f(−1) = 2(−1) − 3 = −2 − 3 = −5</div>
        </div>

        <Callout tipo="atencao">
          <span className="font-mono">f(x)</span> <strong>não é f vezes x</strong>. Esse é o mal-entendido
          que estraga tudo depois. Os parênteses aqui não significam multiplicação — significam
          &quot;aplicado a&quot;. Se f fosse multiplicação, f(2) seria 2f, e nada do resto faria sentido.
        </Callout>

        <p>
          O sinal negativo entrando na máquina é onde mais se erra. Em f(−1), o −1 ocupa <em>todo</em> o
          lugar do x, e por isso vem entre parênteses: 2(−1), não 2−1. Sem os parênteses você calcula
          outra coisa.
        </p>
      </Section>

      <Section title="O caminho de volta: achar x sabendo f(x)">
        <p>
          Metade das questões inverte a pergunta: em vez de dar o x, dão a saída e pedem a entrada. Para
          f(x) = 2x − 3, achar o x com f(x) = 5 é resolver uma equação:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>2x − 3 = 5</div>
          <div>2x = 5 + 3 = 8</div>
          <div>x = 4</div>
        </div>

        <p>
          Confere sempre substituindo de volta: f(4) = 2(4) − 3 = 8 − 3 = 5 ✓. Essa conferência custa
          dez segundos e pega quase todo erro de sinal.
        </p>

        <Callout tipo="info">
          Repare na diferença de linguagem: <strong>&quot;calcule f(2)&quot;</strong> é substituir (fácil,
          direto). <strong>&quot;determine x tal que f(x) = 5&quot;</strong> é resolver uma equação
          (precisa isolar). Ler o enunciado com atenção decide qual das duas você faz.
        </Callout>
      </Section>

      <Section title="Raiz: onde a máquina cospe zero">
        <p>
          <strong>Raiz</strong> (ou zero) de uma função é o valor de x que faz f(x) dar 0. É a definição
          inteira — nem mais, nem menos.
        </p>

        <p>
          Para verificar se x = 2 é raiz de g(x) = x² − 4x + 1, não existe truque: substitui e olha o
          resultado.
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>g(2) = (2)² − 4(2) + 1 = 4 − 8 + 1 = −3</div>
          <div className="text-red-600 dark:text-red-400">−3 ≠ 0 → x = 2 NÃO é raiz de g</div>
        </div>

        <p>
          Já em f(x) = x² − 4, temos f(2) = 4 − 4 = 0 ✓ e f(−2) = 4 − 4 = 0 ✓. Duas raízes: x = 2 e
          x = −2. Geometricamente, raiz é onde o gráfico <strong>corta o eixo x</strong>.
        </p>

        <Callout tipo="prova">
          Três nomes para a mesma coisa, e a prova usa os três sem avisar:
          <br />• <strong>raiz</strong> da função
          <br />• <strong>zero</strong> da função
          <br />• <strong>interseção com o eixo x</strong>
          <br />
          Todos significam: o x que faz f(x) = 0.
        </Callout>
      </Section>

      <Section title="Composição: uma máquina alimentando a outra">
        <p>
          Em <span className="font-mono">f(g(2))</span> você resolve <strong>de dentro para fora</strong>,
          como parênteses de conta normal. Com f(x) = x + 1 e g(x) = x²:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>f(g(2)): primeiro g(2) = 2² = 4, depois f(4) = 4 + 1 = 5</div>
          <div>g(f(2)): primeiro f(2) = 2 + 1 = 3, depois g(3) = 3² = 9</div>
          <div>f(g(−1)): primeiro g(−1) = (−1)² = 1, depois f(1) = 1 + 1 = 2</div>
        </div>

        <Callout tipo="atencao">
          <strong>f(g(2)) = 5 mas g(f(2)) = 9.</strong> A ordem muda o resultado. Composição não é
          comutativa — trocar a ordem das máquinas é como trocar a ordem de &quot;vestir meia&quot; e
          &quot;calçar sapato&quot;. O enunciado sempre diz qual vem primeiro: é a de dentro.
        </Callout>

        <p>
          Repare também em g(−1) = (−1)² = 1, e não −1. O expoente cai sobre o número inteiro, incluindo o
          sinal, porque ele está entre parênteses. Sem os parênteses, −1² significaria −(1²) = −1, que é
          outra coisa.
        </p>

        <Checkpoint>
          Você lê f(x) como &quot;f aplicado a x&quot;, calcula substituindo com parênteses, resolve o
          caminho inverso montando equação, testa raiz pela definição f(x) = 0 e resolve composições de
          dentro para fora. É a base de tudo que vem: limite é justamente perguntar o que acontece com
          f(x) quando x se aproxima de um valor.
        </Checkpoint>
      </Section>
    </article>
  );
}
