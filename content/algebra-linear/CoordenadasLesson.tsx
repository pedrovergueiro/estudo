import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { BasisExplorer } from '@/components/interactive/BasisExplorer';

/** Aula: Coordenadas em Diferentes Bases. */
export function CoordenadasLesson() {
  return (
    <article className="space-y-10">
      <Section title="A revelação: coordenadas dependem da base">
        <p>
          Quando você escreve &quot;o vetor (3, 2)&quot;, está omitindo uma informação que sempre
          esteve lá: <strong>(3, 2) em relação a qual base?</strong>
        </p>
        <p>
          A resposta habitual é a base canônica — (1,0) e (0,1) — e por isso ninguém menciona. Mas
          escolhendo outra base, o mesmo vetor do plano recebe outras coordenadas.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            v = c₁·e₁ + c₂·e₂ &nbsp;⟹&nbsp; [v]<sub>B</sub> = (c₁, c₂)
          </div>
        </div>

        <p>
          As coordenadas <span className="font-mono">(c₁, c₂)</span> são a resposta para: &quot;quanto
          de cada vetor da base eu preciso para montar v?&quot; Troque a base no interativo abaixo e
          observe: <strong>a seta vermelha nunca se move</strong>, só os números mudam.
        </p>

        <BasisExplorer />

        <Callout tipo="info">
          A analogia que fecha o conceito: medir a mesma mesa em metros ou em polegadas dá números
          diferentes. A mesa não mudou — mudou a régua. Base é a régua do espaço vetorial.
        </Callout>
      </Section>

      <Section title="Como calcular coordenadas numa base nova">
        <p>
          Achar as coordenadas de v numa base B = {'{'}e₁, e₂{'}'} significa resolver:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            c₁·e₁ + c₂·e₂ = v
          </div>
        </div>

        <p>
          Onde as incógnitas são c₁ e c₂. Isso é <strong>um sistema linear</strong> — e você já sabe
          resolver sistemas desde o tópico 3. Monta a matriz aumentada, escalona, retrosubstitui.
        </p>

        <Callout tipo="info">
          Tudo no curso converge para o mesmo maquinário. Escalonamento, que apareceu para resolver
          sistemas, é a ferramenta usada também para testar independência linear, achar base e agora
          calcular coordenadas. Aprender Gauss bem rende o semestre inteiro.
        </Callout>
      </Section>

      <Section title="Matriz de mudança de base">
        <p>
          Quando você precisa converter coordenadas entre duas bases repetidamente, resolver um
          sistema a cada vez é desperdício. A solução é montar uma <strong>matriz de mudança de
          base</strong>: coloque os vetores da base nova como colunas de uma matriz P. Então:
        </p>

        <div className="flex justify-center py-2">
          <div className="space-y-2 rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            <div>v = P · [v]<sub>B</sub></div>
            <div>[v]<sub>B</sub> = P⁻¹ · v</div>
          </div>
        </div>

        <p>
          E aí a <strong>inversa</strong> do tópico 4 volta a aparecer: para ir da base canônica
          para a base nova, você multiplica pela inversa de P. Uma vez calculada, ela converte
          qualquer vetor instantaneamente.
        </p>

        <Callout tipo="prova">
          Cuidado com a direção da conversão — é o erro mais comum aqui. P leva coordenadas{' '}
          <em>da base B para a canônica</em>. P⁻¹ faz o caminho inverso, <em>da canônica para B</em>.
          Se o resultado sair estranho, quase sempre é isso que foi invertido.
        </Callout>
      </Section>

      <Section title="Por que alguém escolheria outra base">
        <p>
          Não é capricho acadêmico. Escolher a base certa pode transformar um problema difícil em
          um problema fácil — a estrutura do problema aparece só quando você olha com a régua certa.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              t: 'PCA (análise de componentes principais)',
              d: 'Encontra a base em que os dados variam mais em poucas direções. Nessa base, você pode descartar as direções restantes e reduzir a dimensionalidade com pouca perda.',
            },
            {
              t: 'Autovetores',
              d: 'Na base formada pelos autovetores, uma matriz complicada vira uma matriz diagonal — e operar com diagonal é trivial. É a base de vários métodos numéricos.',
            },
            {
              t: 'Compressão (JPEG)',
              d: 'A imagem é reescrita numa base de frequências. Nessa base, a maioria dos coeficientes é quase zero e pode ser descartada — daí a compressão.',
            },
            {
              t: 'Computação gráfica',
              d: 'Cada objeto tem sua própria base local. Renderizar a cena é converter todas essas coordenadas para a base da câmera.',
            },
          ].map((x) => (
            <div
              key={x.t}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="mb-1 text-sm font-bold text-gray-900 dark:text-gray-100">{x.t}</div>
              <div className="text-xs leading-relaxed text-gray-600 dark:text-gray-400">{x.d}</div>
            </div>
          ))}
        </div>

        <Checkpoint>
          Você terminou os <strong>13 tópicos</strong> de Geometria Analítica e Álgebra Linear —
          os três blocos do Projeto Integrador (Parte 1, Aplicação 1 e Projeto Final). Saiu de
          &quot;o que é uma matriz&quot; até mudança de base, passando por Gauss, vetores,
          projeções e embeddings. Agora é praticar e aplicar nos notebooks das entregas.
        </Checkpoint>
      </Section>
    </article>
  );
}
