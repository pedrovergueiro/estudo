import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { DotProductExplorer } from '@/components/interactive/DotProductExplorer';

/** Aula: Norma e Produto Escalar. */
export function NormaLesson() {
  return (
    <article className="space-y-10">
      <Section title="Norma: o comprimento do vetor">
        <p>
          A <strong>norma</strong> de um vetor, escrita <span className="font-mono">‖v‖</span>, é o
          comprimento da seta. E o jeito de calcular você já conhece desde o ensino médio:{' '}
          <strong>é Pitágoras</strong>.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            ‖v‖ = √(x² + y²)
          </div>
        </div>

        <p>
          Por quê? Porque as componentes x e y formam os catetos de um triângulo retângulo, e o
          vetor é a hipotenusa. Para o vetor (3, 4): ‖v‖ = √(9 + 16) = √25 = 5.
        </p>

        <Callout tipo="info">
          Em mais dimensões a lógica não muda, só cresce a lista: para um vetor em R⁴, ‖v‖ = √(x₁² +
          x₂² + x₃² + x₄²). Isso vale para as centenas de dimensões de um embedding — você
          simplesmente soma todos os quadrados e tira a raiz.
        </Callout>

        <Callout tipo="atencao">
          A norma <strong>nunca</strong> é negativa. Se você chegou num resultado negativo, esqueceu
          de elevar ao quadrado antes de somar. Os quadrados eliminam qualquer sinal negativo — o
          vetor (−3, −4) tem norma 5, exatamente igual ao (3, 4).
        </Callout>
      </Section>

      <Section title="Vetor unitário: quando só a direção importa">
        <p>
          Às vezes você quer saber <em>para onde</em> um vetor aponta, sem se importar com o
          tamanho. Para isso, divide o vetor pela própria norma:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            û = v / ‖v‖
          </div>
        </div>

        <p>
          O resultado é um <strong>vetor unitário</strong>: mesma direção, comprimento exatamente 1.
          Para (3, 4), que tem norma 5, o unitário é (3/5, 4/5) = (0,6 · 0,8). Confere: √(0,36 +
          0,64) = √1 = 1. ✓
        </p>

        <Callout tipo="ia">
          Normalizar vetores é rotina em IA. Ao comparar embeddings, o que interessa é a direção
          (o significado), não o tamanho (que costuma refletir frequência da palavra). Por isso
          quase todo sistema de busca semântica normaliza os vetores antes de comparar.
        </Callout>
      </Section>

      <Section title="Produto escalar: o coração de tudo">
        <p>
          O <strong>produto escalar</strong> (ou produto interno) pega dois vetores e devolve um{' '}
          <em>número</em> — não um vetor. Daí o nome.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            a · b = a₁b₁ + a₂b₂ + ... + aₙbₙ
          </div>
        </div>

        <p>
          Multiplique as coordenadas correspondentes e some tudo. Mecanicamente é simples. O
          interessante é o que esse número <em>significa</em>: ele mede o quanto dois vetores
          apontam para o mesmo lado.
        </p>

        <DotProductExplorer />

        <p>Existe uma segunda fórmula, que conecta produto escalar com ângulo:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            a · b = ‖a‖ · ‖b‖ · cos(θ)
          </div>
        </div>

        <p>
          As duas fórmulas dão o mesmo resultado. A primeira é para calcular; a segunda é para
          entender e para <strong>descobrir o ângulo</strong> entre dois vetores, isolando o cos(θ).
        </p>

        <Callout tipo="prova">
          O que memorizar sobre o SINAL do produto escalar:
          <br />• <strong>Positivo</strong> → ângulo agudo (&lt; 90°), vetores apontam para lados parecidos
          <br />• <strong>Zero</strong> → ângulo reto (= 90°), vetores ortogonais
          <br />• <strong>Negativo</strong> → ângulo obtuso (&gt; 90°), vetores apontam para lados opostos
          <br />
          O caso do zero é o mais cobrado: é o teste padrão de perpendicularidade.
        </Callout>

        <Checkpoint>
          Você sabe calcular norma (Pitágoras), normalizar um vetor, calcular produto escalar pelas
          duas fórmulas e interpretar o sinal do resultado. O produto escalar é a ferramenta que
          sustenta os dois próximos tópicos — projeções e similaridade do cosseno.
        </Checkpoint>
      </Section>
    </article>
  );
}
