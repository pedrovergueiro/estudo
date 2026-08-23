import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { ProjectionExplorer } from '@/components/interactive/ProjectionExplorer';

/** Aula: Ortogonalidade e Projeções. */
export function ProjecoesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Ortogonalidade: perpendicular, com nome chique">
        <p>
          <strong>Ortogonal</strong> é o termo que a Álgebra Linear usa para
          &quot;perpendicular&quot;. Dois vetores são ortogonais quando formam 90° entre si.
        </p>
        <p>
          A graça é que você <strong>não precisa medir ângulo nenhum</strong> para verificar isso.
          Basta calcular o produto escalar:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            a · b = 0 &nbsp;⟺&nbsp; a e b são ortogonais
          </div>
        </div>

        <p>
          Por que funciona? Pela fórmula a · b = ‖a‖·‖b‖·cos(θ). Quando θ = 90°, cos(90°) = 0, e
          todo o produto zera. Como as normas não são zero (se os vetores existem de fato), a única
          forma do produto dar zero é o ângulo ser reto.
        </p>

        <Callout tipo="prova">
          Questão típica: &quot;determine k para que os vetores (2, k) e (6, −4) sejam
          ortogonais&quot;. Você monta o produto escalar, iguala a zero e resolve:
          2(6) + k(−4) = 0 → 12 − 4k = 0 → k = 3. Sempre a mesma receita: produto escalar = 0,
          resolve a equação.
        </Callout>
      </Section>

      <Section title="Projeção: a sombra de um vetor sobre o outro">
        <p>
          Projetar <strong>a</strong> sobre <strong>b</strong> responde à pergunta: &quot;quanto de{' '}
          <strong>a</strong> vai na direção de <strong>b</strong>?&quot;
        </p>
        <p>
          A imagem que funciona: imagine uma luz batendo de cima, perpendicular a b. A sombra que
          o vetor a projeta em cima de b é a projeção. Mexa nos vetores e veja:
        </p>

        <ProjectionExplorer />

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            proj<sub>b</sub>(a) = (a · b / ‖b‖²) · b
          </div>
        </div>

        <p>
          Lendo a fórmula por partes, ela deixa de ser um amontoado de símbolos:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-mono">(a · b / ‖b‖²)</span> é só um <strong>número</strong>: diz
            quantas vezes b cabe dentro da sombra.
          </li>
          <li>
            Multiplicar esse número por <strong>b</strong> devolve um vetor apontando na direção de
            b, com o comprimento certo.
          </li>
          <li>
            Por isso o resultado é sempre um vetor <em>na mesma reta</em> de b — a sombra nunca sai
            da direção de b.
          </li>
        </ul>

        <Callout tipo="atencao">
          Atenção à ordem: proj<sub>b</sub>(a) e proj<sub>a</sub>(b) são coisas diferentes. A
          primeira é a sombra de a em cima de b; a segunda é o contrário. O vetor que aparece
          multiplicando no final da fórmula é sempre aquele <em>sobre o qual</em> você projeta.
        </Callout>
      </Section>

      <Section title="A decomposição: todo vetor vira duas partes">
        <p>
          O resultado mais útil deste tópico: qualquer vetor <strong>a</strong> pode ser quebrado em
          exatamente duas partes em relação a <strong>b</strong>:
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            uma parte <strong>paralela</strong> a b — que é a projeção;
          </li>
          <li>
            uma parte <strong>perpendicular</strong> a b — que é o que sobra (a linha tracejada no
            gráfico acima).
          </li>
        </ul>
        <p>
          Em fórmula: <span className="font-mono">a = proj_b(a) + (a − proj_b(a))</span>. Essa
          separação é a base de vários métodos importantes — mínimos quadrados, Gram-Schmidt,
          decomposição QR — que você reencontra em Ciência de Dados.
        </p>

        <Callout tipo="ia">
          Regressão linear por mínimos quadrados é exatamente uma projeção: você tem dados que não
          caem perfeitamente numa reta e projeta esses dados no espaço das retas possíveis. A reta
          escolhida é aquela cuja &quot;sobra perpendicular&quot; (o erro) é a menor possível.
          Quando um professor de IA fala em &quot;minimizar o erro&quot;, geometricamente é isto.
        </Callout>

        <Checkpoint>
          Você sabe testar ortogonalidade pelo produto escalar, calcular a projeção de um vetor
          sobre outro e entender que qualquer vetor se decompõe numa parte paralela e outra
          perpendicular. Isso completa as ferramentas que a entrega da Aplicação 1 (05/11) pede.
        </Checkpoint>
      </Section>
    </article>
  );
}
