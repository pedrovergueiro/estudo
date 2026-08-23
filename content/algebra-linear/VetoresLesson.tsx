import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { VectorPlayground } from '@/components/interactive/VectorPlayground';
import { VectorOperations } from '@/components/interactive/VectorOperations';

/** Aula: Vetores — Definição e Operações Básicas. */
export function VetoresLesson() {
  return (
    <article className="space-y-10">
      <Section title="O que é um vetor (esquece a definição do livro por um minuto)">
        <p>
          Um número sozinho — 5, 20, −3 — carrega só uma informação: quantidade. Isso serve para
          peso, temperatura, idade. Mas não serve para tudo.
        </p>
        <p>
          Se eu disser &quot;ande 5 metros&quot;, falta algo: <strong>para onde?</strong> É aí que
          entra o vetor. Um <strong>vetor</strong> é uma quantidade que tem tamanho{' '}
          <em>e</em> direção. Graficamente, é uma seta.
        </p>
        <p>
          E como escrevemos isso? Com uma lista de números entre parênteses:{' '}
          <span className="font-mono">v = (3, 4)</span> significa &quot;ande 3 para a direita e 4
          para cima&quot;.
        </p>

        <VectorPlayground />

        <Callout tipo="info">
          Repare que vetor e matriz coluna são a mesma coisa escrita de jeitos diferentes. O vetor
          (3, 4) também pode aparecer empilhado como uma matriz 2×1. Isso não é coincidência: tudo
          que você aprendeu no bloco de matrizes continua valendo aqui.
        </Callout>
      </Section>

      <Section title="Vetor não tem endereço fixo">
        <p>
          Um detalhe que confunde muita gente: o vetor (3, 4) <strong>não</strong> é o ponto (3, 4).
          O vetor é o <em>deslocamento</em>. Ele pode começar em qualquer lugar — o que importa é
          quanto ele anda em cada direção.
        </p>
        <p>
          Por convenção, desenhamos vetores saindo da origem (0,0), porque fica mais fácil de
          comparar. Mas dois vetores com as mesmas componentes são o MESMO vetor, mesmo desenhados
          em cantos diferentes do plano.
        </p>

        <Callout tipo="atencao">
          Em prova, cuidado com o enunciado: &quot;o vetor que vai do ponto A(1,2) ao ponto
          B(4,6)&quot; NÃO é (4,6). Você calcula fazendo <strong>destino menos origem</strong>:
          (4−1, 6−2) = (3, 4). Errar essa subtração — ou inverter a ordem — é o erro mais comum
          deste tópico.
        </Callout>
      </Section>

      <Section title="Operações: somar, subtrair, esticar">
        <p>
          As três operações básicas são as mesmas das matrizes, o que faz sentido, já que vetor é
          uma matriz de uma coluna só. A diferença é que agora dá para <em>ver</em> o que acontece:
        </p>

        <VectorOperations />

        <p>
          Resumindo o que você viu:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>Soma:</strong> componente com componente. Geometricamente, encoste o início de
            um na ponta do outro.
          </li>
          <li>
            <strong>Subtração:</strong> componente menos componente. Geometricamente, a − b é a
            seta que vai da ponta de b até a ponta de a.
          </li>
          <li>
            <strong>Escalar:</strong> multiplica tudo por um número. Estica (k &gt; 1), encolhe
            (0 &lt; k &lt; 1) ou inverte o sentido (k negativo), mas nunca muda a reta em que o
            vetor está.
          </li>
        </ul>

        <Callout tipo="ia">
          Somar vetores é literalmente como modelos de linguagem fazem analogias. O exemplo clássico:
          vetor(&quot;rei&quot;) − vetor(&quot;homem&quot;) + vetor(&quot;mulher&quot;) resulta num
          vetor pertíssimo de &quot;rainha&quot;. Só soma e subtração de vetores — as mesmas
          operações que você acabou de arrastar na tela.
        </Callout>

        <Checkpoint>
          Você sabe o que é um vetor, como escrever suas componentes, como calcular o vetor entre
          dois pontos e como somar, subtrair e multiplicar por escalar — tanto na conta quanto na
          geometria. É a base para tudo do bloco Aplicação 1.
        </Checkpoint>
      </Section>
    </article>
  );
}
