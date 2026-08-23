import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Forma escalonada reduzida, equivalência por linhas e sistemas homogêneos. */
export function EscalonadaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Escalonada e escalonada reduzida: a diferença que cai em prova">
        <p>
          Escalonar é transformar a matriz num formato em que o sistema se resolve de trás para frente.
          Mas existem <strong>dois</strong> formatos-alvo, e o plano de aula cobra os dois pelo nome.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="mb-2 font-bold text-sky-900 dark:text-sky-100">
              Forma escalonada (Gauss)
            </div>
            <div className="mb-2 whitespace-pre font-mono text-sm text-sky-900 dark:text-sky-100">
              {`[ 2  1  -1 |  3 ]
[ 0  3   2 |  5 ]
[ 0  0   4 |  8 ]`}
            </div>
            <p className="text-sm text-sky-900 dark:text-sky-100">
              Zeros <strong>abaixo</strong> de cada pivô. Resolve-se por substituição de trás para
              frente.
            </p>
          </div>

          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-2 font-bold text-emerald-900 dark:text-emerald-100">
              Escalonada reduzida (Gauss-Jordan)
            </div>
            <div className="mb-2 whitespace-pre font-mono text-sm text-emerald-900 dark:text-emerald-100">
              {`[ 1  0  0 |  1 ]
[ 0  1  0 | -1 ]
[ 0  0  1 |  2 ]`}
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              Zeros <strong>acima e abaixo</strong>, e pivôs iguais a 1. A solução já vem lida direto.
            </p>
          </div>
        </div>

        <p>As quatro condições da forma escalonada reduzida (RREF), como o livro define:</p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>1.</strong> Linhas nulas, se existirem, ficam por último.
          </div>
          <div>
            <strong>2.</strong> O primeiro elemento não nulo de cada linha é <strong>1</strong> — o
            pivô.
          </div>
          <div>
            <strong>3.</strong> O pivô de uma linha está à <strong>direita</strong> do pivô da linha de
            cima.
          </div>
          <div>
            <strong>4.</strong> Cada coluna que contém pivô tem <strong>zeros em todo o resto</strong>.
          </div>
        </div>

        <Callout tipo="prova">
          A condição 4 é a que separa reduzida de escalonada comum. Se a questão pedir a{' '}
          <strong>forma escalonada reduzida</strong> e você parar no formato triangular, perde ponto —
          mesmo tendo resolvido o sistema certo. Leia o verbo do enunciado.
        </Callout>
      </Section>

      <Section title="Matrizes equivalentes por linhas">
        <p>
          Duas matrizes são <strong>equivalentes por linhas</strong> quando dá para chegar de uma na
          outra usando apenas as três operações elementares:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>L<sub>i</sub> ↔ L<sub>j</sub> &nbsp;&nbsp;— trocar duas linhas</div>
          <div>L<sub>i</sub> ← k·L<sub>i</sub>, k ≠ 0 &nbsp;&nbsp;— multiplicar por escalar não nulo</div>
          <div>L<sub>i</sub> ← L<sub>i</sub> + k·L<sub>j</sub> &nbsp;&nbsp;— somar múltiplo de outra linha</div>
        </div>

        <p>
          Isso importa porque essas operações <strong>não mudam o conjunto solução</strong> do sistema.
          Matrizes equivalentes por linhas representam sistemas diferentes na aparência, mas com
          exatamente as mesmas soluções — é o que legitima escalonar.
        </p>

        <Callout tipo="info">
          Um fato forte e cobrado: <strong>toda matriz é equivalente por linhas a uma única forma
          escalonada reduzida</strong>. A escalonada comum não é única (depende do caminho), mas a
          reduzida é. Por isso ela serve como &quot;impressão digital&quot; — duas matrizes são
          equivalentes por linhas se, e somente se, têm a mesma RREF.
        </Callout>
      </Section>

      <Section title="Classificação: pivôs, variáveis livres e parametrização">
        <p>
          Depois de escalonar, conte os <strong>pivôs</strong>. Eles decidem tudo:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-red-500 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="font-bold text-red-900 dark:text-red-100">
              SI — sistema impossível (inconsistente)
            </div>
            <div className="my-1 font-mono text-sm text-red-900 dark:text-red-100">
              linha do tipo [ 0 0 0 | 5 ]
            </div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Traduz para 0 = 5, que é falso. Não há solução. Pare aqui.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="font-bold text-emerald-900 dark:text-emerald-100">
              SPD — solução única
            </div>
            <p className="my-1 text-sm text-emerald-900 dark:text-emerald-100">
              nº de pivôs = nº de incógnitas, e nenhuma linha inconsistente.
            </p>
          </div>

          <div className="rounded-lg border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/40 p-4">
            <div className="font-bold text-amber-900 dark:text-amber-100">
              SPI — infinitas soluções
            </div>
            <p className="my-1 text-sm text-amber-900 dark:text-amber-100">
              nº de pivôs &lt; nº de incógnitas. Sobram variáveis livres.
            </p>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            variáveis livres = nº de incógnitas − nº de pivôs
          </div>
        </div>

        <p>
          <strong>Parametrizar</strong> é escrever a solução em função dessas variáveis livres. Suponha
          que o escalonamento de um sistema em x, y, z tenha dado:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div className="whitespace-pre">{`[ 1  0  -2 | 3 ]
[ 0  1   1 | 4 ]
[ 0  0   0 | 0 ]`}</div>
          <div className="pt-2">pivôs em x e y · z é livre → faça z = t</div>
          <div>da 2ª linha: y + t = 4 → y = 4 − t</div>
          <div>da 1ª linha: x − 2t = 3 → x = 3 + 2t</div>
          <div className="pt-1 font-bold">(x, y, z) = (3 + 2t, 4 − t, t), t ∈ ℝ</div>
        </div>

        <Callout tipo="atencao">
          A resposta de um SPI <strong>não</strong> é &quot;infinitas soluções&quot; e ponto. É o{' '}
          <strong>conjunto solução parametrizado</strong>. Escrever só a classificação, sem a
          parametrização, costuma valer metade da questão.
        </Callout>
      </Section>

      <Section title="Sistemas homogêneos: o caso AX = 0">
        <p>
          Um sistema é <strong>homogêneo</strong> quando todos os termos independentes são zero:
          AX = 0. Ele tem uma propriedade que nenhum outro tem:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 px-6 py-4 text-center">
            <div className="font-bold text-indigo-900 dark:text-indigo-100">
              Sistema homogêneo NUNCA é impossível
            </div>
            <div className="mt-1 font-mono text-sm text-indigo-900 dark:text-indigo-100">
              X = (0, 0, ..., 0) sempre serve — a solução trivial
            </div>
          </div>
        </div>

        <p>Então só existem dois desfechos, e a pergunta vira sempre a mesma:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Só a trivial (SPD)</strong> → nº de pivôs = nº de incógnitas. As colunas de A são{' '}
            <strong>linearmente independentes</strong>.
          </div>
          <div>
            <strong>Soluções não triviais (SPI)</strong> → há variável livre. As colunas de A são{' '}
            <strong>linearmente dependentes</strong>.
          </div>
        </div>

        <Callout tipo="prova">
          Um atalho que resolve questão inteira: se o sistema homogêneo tem <strong>mais incógnitas do
          que equações</strong>, ele obrigatoriamente tem solução não trivial. O motivo é aritmético —
          o número de pivôs não pode passar do número de linhas, então sobra variável livre com certeza.
        </Callout>

        <p>
          O conjunto solução de um homogêneo tem estrutura: ele é fechado para soma e para multiplicação
          por escalar. Se X₁ e X₂ resolvem AX = 0, então X₁ + X₂ e k·X₁ também resolvem. Isso significa
          que o conjunto solução é um <strong>subespaço vetorial</strong> — o chamado{' '}
          <em>espaço nulo</em> de A, que reaparece no bloco final da disciplina.
        </p>

        <Callout tipo="info">
          É por aqui que sistemas homogêneos se ligam a independência linear: perguntar se os vetores
          v₁, …, v<sub>k</sub> são linearmente independentes é <strong>exatamente</strong> perguntar se
          o sistema homogêneo que tem esses vetores como colunas só admite a solução trivial. São a
          mesma pergunta em duas linguagens.
        </Callout>

        <Checkpoint>
          Você distingue forma escalonada de escalonada reduzida pelas quatro condições, sabe o que são
          matrizes equivalentes por linhas e por que a RREF é única, conta pivôs para classificar,
          parametriza o conjunto solução de um SPI, e reconhece que homogêneo nunca é impossível — só
          resta decidir entre trivial e não trivial.
        </Checkpoint>
      </Section>
    </article>
  );
}
