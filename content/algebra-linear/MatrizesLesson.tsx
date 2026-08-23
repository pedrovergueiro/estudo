import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { NotationExplorer } from '@/components/interactive/NotationExplorer';
import { DimensionBuilder } from '@/components/interactive/DimensionBuilder';
import { MatrixTypeGallery } from '@/components/interactive/MatrixTypeGallery';
import { StepByStepSolver } from '@/components/interactive/StepByStepSolver';
import { MatrixGrid } from '@/components/math/MatrixGrid';
import { transposeSteps } from '@/lib/math/steps';

/**
 * Aula: Matrizes — Definição e Tipos.
 *
 * Server Component: só monta a árvore e calcula os passos da transposta.
 * Os componentes interativos que ele usa é que são 'use client'.
 */
export function MatrizesLesson() {
  const passosTransposta = transposeSteps([
    [2, 5, 8],
    [1, 7, 3],
  ]);

  return (
    <article className="space-y-10">
      {/* Abertura: por que isso existe */}
      <Section title="Antes da definição: por que matrizes existem">
        <p>
          Imagine que você anotou as notas de 3 alunos em 4 matérias. Você poderia escrever
          12 frases (&quot;o aluno 1 tirou 7 em cálculo, o aluno 1 tirou 5 em física...&quot;),
          mas ninguém faz isso. Você monta uma tabela.
        </p>
        <p>
          <strong>Uma matriz é exatamente isso: uma tabela de números com um nome.</strong> Só
          isso. A diferença é que, por ser tratada como um objeto único chamado A, você pode
          fazer contas com a tabela INTEIRA de uma vez — somar duas tabelas, multiplicar,
          inverter. É essa a mágica que faz matrizes valerem um semestre de estudo.
        </p>

        <div className="flex justify-center py-2">
          <MatrixGrid
            data={[
              [7, 5, 9, 6],
              [4, 8, 3, 7],
              [6, 6, 5, 8],
            ]}
            label="Notas: 3 alunos × 4 matérias"
          />
        </div>

        <Callout tipo="ia">
          No seu curso de IA isso vira o pão de cada dia. Um conjunto de 200 imagens descritas
          por 512 características é uma matriz 200×512. Uma rede neural é uma pilha de matrizes.
          Um embedding de palavra é uma linha de matriz. Quando a ementa diz &quot;a matemática é a
          base&quot;, é literalmente esta estrutura que está na base.
        </Callout>
      </Section>

      {/* Dimensões */}
      <Section title="1. Dimensão: o tamanho da matriz">
        <p>
          Toda matriz tem um tamanho, descrito por dois números:{' '}
          <strong>quantas linhas</strong> e <strong>quantas colunas</strong>. Escrevemos{' '}
          <span className="font-mono font-semibold">m × n</span>, onde m é o número de linhas e
          n o de colunas — nesta ordem, sempre.
        </p>
        <p>
          Linha é a fila <em>horizontal</em> (deitada). Coluna é a fila <em>vertical</em> (de pé).
          Se você confunde: pense em coluna de prédio — coluna fica em pé.
        </p>

        <DimensionBuilder />

        <Callout tipo="atencao">
          Escrever a ordem invertida é o erro mais comum em prova. Uma matriz 2×3 tem 2 linhas e
          3 colunas. Uma 3×2 tem 3 linhas e 2 colunas. São matrizes diferentes, e trocar isso
          costuma derrubar a questão inteira — porque quase toda regra de operação depende das
          dimensões baterem.
        </Callout>

        <Checkpoint>
          Você já consegue olhar para qualquer matriz e dizer a ordem dela. Isso parece pouco,
          mas é o pré-requisito de tudo que vem depois: só dá para somar matrizes de mesma ordem,
          e só dá para multiplicar se as dimensões encaixarem.
        </Checkpoint>
      </Section>

      {/* Notação */}
      <Section title="2. Notação: como apontar para um número específico">
        <p>
          Se a matriz A tem 12 números, como você diz &quot;aquele número ali, o da segunda linha,
          terceira coluna&quot; sem desenhar a matriz toda? Usando índices:
        </p>
        <p className="text-center font-mono text-lg">
          a<sub>ij</sub> = elemento da linha <strong>i</strong>, coluna <strong>j</strong>
        </p>
        <p>
          A matriz inteira é escrita com letra MAIÚSCULA (A). Um elemento individual dela vai em
          letra minúscula com dois índices (a<sub>23</sub>). Testa aí embaixo — clica nos números:
        </p>

        <NotationExplorer />

        <Callout tipo="prova">
          Enunciados de prova usam essa notação o tempo todo: &quot;construa a matriz A = [a
          <sub>ij</sub>]<sub>3×3</sub> onde a<sub>ij</sub> = i + j&quot;. Traduzindo: monte uma
          matriz 3×3 e, para cada posição, some o número da linha com o número da coluna. A posição
          a<sub>12</sub> vale 1+2 = 3. Se você domina a notação, questões assim viram ponto de graça.
        </Callout>
      </Section>

      {/* Tipos */}
      <Section title="3. Os tipos que você precisa reconhecer">
        <p>
          Certas matrizes têm formatos tão úteis que ganharam nome próprio. Você não precisa
          decorar definição por definição — precisa <em>reconhecer o padrão</em> ao bater o olho.
          Troque as abas abaixo e veja o padrão destacado em cada uma:
        </p>

        <MatrixTypeGallery />

        <Callout tipo="info">
          Os dois que mais aparecem no seu semestre são a <strong>identidade</strong> (ela é o
          &quot;1&quot; das matrizes: A · I = A) e a <strong>triangular superior</strong> — que é
          o formato-alvo da eliminação de Gauss, o método central da Parte 1 do seu Projeto
          Integrador.
        </Callout>
      </Section>

      {/* Transposta */}
      <Section title="4. Transposta: girando a matriz">
        <p>
          A transposta de A, escrita <span className="font-mono">Aᵀ</span>, troca linhas por
          colunas: a primeira linha vira a primeira coluna, a segunda linha vira a segunda coluna,
          e assim por diante.
        </p>
        <p>
          Em vez de você tentar imaginar isso, veja acontecendo. Aperte &quot;Próximo&quot; e
          acompanhe cada linha virando coluna:
        </p>

        <StepByStepSolver
          steps={passosTransposta}
          title="Calculando a transposta de uma matriz 2×3"
          resultLabel="Transposta Aᵀ"
        />

        <p>
          A regra que resume tudo: <strong>se A é m×n, então Aᵀ é n×m</strong>, e o elemento que
          estava em a<sub>ij</sub> vai para a posição a<sub>ji</sub> — os índices trocam de lugar.
        </p>

        <Callout tipo="ia">
          Transposta não é firula acadêmica: em IA ela aparece toda vez que você precisa alinhar
          dimensões para multiplicar matrizes. No cálculo do gradiente durante o treino de uma rede
          neural, transpostas aparecem em praticamente todas as etapas.
        </Callout>

        <Checkpoint>
          Você já sabe identificar a ordem de uma matriz, apontar qualquer elemento pela notação
          a<sub>ij</sub>, reconhecer os tipos especiais e calcular uma transposta. Isso é o
          conteúdo completo do primeiro tópico da Parte 1. Agora vá para a aba{' '}
          <strong>Praticar</strong> e fixe — é resolvendo que gruda, e cada exercício vale XP.
        </Checkpoint>
      </Section>
    </article>
  );
}
