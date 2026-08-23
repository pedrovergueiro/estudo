import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { CosineSimilarityDemo } from '@/components/interactive/CosineSimilarityDemo';

/** Aula: Similaridade do Cosseno em IA. */
export function CossenoLesson() {
  return (
    <article className="space-y-10">
      <Section title="O problema que a similaridade do cosseno resolve">
        <p>
          Computador não entende texto. Para uma máquina, &quot;gato&quot; e &quot;cachorro&quot;
          são só sequências de caracteres, tão parecidas entre si quanto &quot;gato&quot; e
          &quot;xilofone&quot;.
        </p>
        <p>
          A solução que a IA moderna usa: transformar cada palavra (ou frase, ou imagem) num{' '}
          <strong>vetor de números</strong> — chamado <strong>embedding</strong> — de forma que
          coisas com significados parecidos fiquem apontando para direções parecidas no espaço.
        </p>
        <p>
          E aí surge a pergunta prática: <strong>como medir se dois vetores apontam para direções
          parecidas?</strong> A resposta é o conteúdo deste tópico — e você já tem todas as peças.
        </p>
      </Section>

      <Section title="Por que não usar simplesmente a distância">
        <p>
          A primeira ideia de todo mundo é medir a distância entre as pontas dos vetores. O problema:
          a distância é sensível ao <em>tamanho</em> dos vetores, e o tamanho de um embedding
          costuma refletir coisas irrelevantes — como a frequência da palavra no texto de treino.
        </p>
        <p>
          Duas palavras podem ter significado quase idêntico, mas uma aparecer 10 mil vezes e a
          outra 50. Os vetores apontam praticamente para o mesmo lado, só que um é muito mais longo.
          Pela distância, pareceriam diferentes. Pelo <strong>ângulo</strong>, são quase iguais — e
          o ângulo é o que reflete o significado.
        </p>

        <Callout tipo="info">
          É por isso que a métrica padrão é o <strong>cosseno do ângulo</strong>, e não a distância.
          Ela ignora completamente o comprimento dos vetores e olha só para a direção.
        </Callout>
      </Section>

      <Section title="A fórmula (você já a conhece)">
        <p>
          Partindo da fórmula do produto escalar que você viu no tópico anterior — a · b =
          ‖a‖·‖b‖·cos(θ) — basta isolar o cosseno:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-5 text-center font-mono text-xl font-bold">
            cos(θ) = (a · b) / (‖a‖ · ‖b‖)
          </div>
        </div>

        <p>
          É isso. Nenhuma matemática nova — é produto escalar dividido pelas normas. A divisão pelas
          normas é justamente o que anula o efeito do tamanho, deixando só a direção.
        </p>

        <p>Como ler o resultado, que sempre fica entre −1 e 1:</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              v: '≈ 1',
              t: 'Muito parecidos',
              d: 'Ângulo perto de 0° — os vetores apontam quase para a mesma direção.',
              c: 'emerald',
            },
            {
              v: '≈ 0',
              t: 'Sem relação',
              d: 'Ângulo de 90°, ortogonais. Os conceitos não têm nada a ver um com o outro.',
              c: 'amber',
            },
            {
              v: '≈ −1',
              t: 'Opostos',
              d: 'Ângulo perto de 180° — direções contrárias.',
              c: 'red',
            },
          ].map((x) => (
            <div
              key={x.v}
              className={`rounded-lg border-2 p-4 ${
                x.c === 'emerald'
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40'
                  : x.c === 'amber'
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40'
                    : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40'
              }`}
            >
              <div className="font-mono text-2xl font-bold">{x.v}</div>
              <div className="mt-1 text-sm font-semibold">{x.t}</div>
              <div className="mt-1 text-xs leading-relaxed opacity-80">{x.d}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Na prática">
        <p>
          Abaixo, quatro palavras viraram vetores. Escolha pares e compare — e repare na matriz de
          similaridade no final, que é literalmente o que roda dentro de um sistema de busca:
        </p>

        <CosineSimilarityDemo />

        <Callout tipo="ia">
          Onde isso aparece no mundo real:
          <br />• <strong>Busca semântica:</strong> sua pergunta vira vetor, cada documento vira
          vetor, e o sistema devolve os de maior similaridade do cosseno.
          <br />• <strong>RAG</strong> (o que faz um chatbot consultar documentos): mesma coisa —
          recupera os trechos mais similares à pergunta.
          <br />• <strong>Recomendação:</strong> &quot;quem gostou disso também gostou&quot; compara
          vetores de preferência de usuários.
          <br />• <strong>Detecção de plágio:</strong> textos viram vetores; similaridade alta
          demais acende o alerta.
        </Callout>

        <Callout tipo="atencao">
          Limitação que vale escrever no relatório do Projeto Integrador: similaridade do cosseno
          mede <em>proximidade de direção no espaço vetorial</em>, não significado de verdade. Se o
          embedding foi mal treinado, ou se o contexto importa muito (ironia, negação), a métrica
          erra. O guia da disciplina pede explicitamente &quot;análise de limitações da interpretação
          adotada&quot; — este parágrafo é o tipo de coisa que essa exigência espera.
        </Callout>

        <Checkpoint>
          Você fecha o bloco <strong>Aplicação 1</strong> (entrega de 05/11): vetores, norma,
          produto escalar, ortogonalidade, projeções e similaridade do cosseno. Junto com a Parte 1,
          você já cobriu os conteúdos de 2 das 3 entregas do Projeto Integrador.
        </Checkpoint>
      </Section>
    </article>
  );
}
