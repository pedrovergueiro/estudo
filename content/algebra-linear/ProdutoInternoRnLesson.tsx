import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { OrthonormalChecker } from '@/components/interactive/OrthonormalChecker';

/** Aula: Produto interno em Rⁿ, bases ortogonais e ortonormais. */
export function ProdutoInternoRnLesson() {
  return (
    <article className="space-y-10">
      <Section title="A mesma conta, agora em n dimensões">
        <p>
          Você já usou produto escalar em R² e R³. Em <strong>Rⁿ</strong> a definição não muda — só fica
          mais longa:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center">
            <div className="font-mono text-lg font-bold">
              ⟨u, v⟩ = u₁v₁ + u₂v₂ + ... + u<sub>n</sub>v<sub>n</sub>
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              também escrito u · v ou uᵀv
            </div>
          </div>
        </div>

        <p>
          Norma, distância e ortogonalidade seguem todas do produto interno, exatamente como antes:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>‖u‖ = √⟨u, u⟩ = √(u₁² + ... + uₙ²)</div>
          <div>d(u, v) = ‖u − v‖</div>
          <div>u ⊥ v ⟺ ⟨u, v⟩ = 0</div>
          <div>cos(θ) = ⟨u, v⟩ / (‖u‖·‖v‖)</div>
        </div>

        <Callout tipo="info">
          A mudança conceitual: em R² e R³ você <em>desenhava</em> o ângulo e depois calculava. Em R⁷
          não há desenho — a fórmula passa a ser a <strong>definição</strong> de ângulo. É o mesmo
          movimento de abstração de espaços vetoriais: a álgebra continua valendo onde a geometria não
          alcança mais.
        </Callout>

        <p>As propriedades que caracterizam um produto interno, e que a prova pode pedir para verificar:</p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-[15px]">
          <div>
            <strong>Simetria:</strong> ⟨u, v⟩ = ⟨v, u⟩
          </div>
          <div>
            <strong>Linearidade:</strong> ⟨u + w, v⟩ = ⟨u, v⟩ + ⟨w, v⟩ e ⟨ku, v⟩ = k⟨u, v⟩
          </div>
          <div>
            <strong>Positividade:</strong> ⟨u, u⟩ ≥ 0, valendo zero só quando u = 0
          </div>
        </div>
      </Section>

      <Section title="Ortogonal, unitário, ortonormal — três palavras diferentes">
        <p>
          Estes três termos aparecem juntos e são confundidos o tempo todo. A diferença é simples:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Conjunto ortogonal</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Todos os pares são perpendiculares: ⟨v<sub>i</sub>, v<sub>j</sub>⟩ = 0 para i ≠ j. Nada se
              exige do comprimento.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Vetor unitário</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tem norma 1. Consegue-se dividindo qualquer vetor não nulo pela própria norma — é{' '}
              <strong>normalizar</strong>.
            </p>
          </div>
          <div className="rounded-lg border-2 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 p-4">
            <div className="mb-1 font-bold text-teal-900 dark:text-teal-100">Conjunto ortonormal</div>
            <p className="text-sm text-teal-900 dark:text-teal-100">
              As duas coisas ao mesmo tempo: <strong>ortogonal E todos unitários</strong>.
            </p>
          </div>
        </div>

        <OrthonormalChecker />

        <Callout tipo="prova">
          Todo conjunto ortogonal de vetores <strong>não nulos</strong> é automaticamente{' '}
          <strong>linearmente independente</strong>. É um teorema de uma linha de prova e resolve
          questão: se te pedem para mostrar que certos vetores formam base de Rⁿ e eles são ortogonais e
          são n, acabou — não precisa escalonar nada.
        </Callout>
      </Section>

      <Section title="Por que ortonormal facilita tudo">
        <p>
          Achar as coordenadas de um vetor numa base qualquer exige <strong>resolver um sistema</strong>.
          Numa base ortonormal, não:
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg border-2 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 px-6 py-4 text-center">
            <div className="font-mono text-lg font-bold text-teal-900 dark:text-teal-100">
              u = ⟨u, v₁⟩·v₁ + ⟨u, v₂⟩·v₂ + ... + ⟨u, v<sub>n</sub>⟩·v<sub>n</sub>
            </div>
            <div className="mt-2 text-sm text-teal-800 dark:text-teal-200">
              cada coordenada é um produto escalar — nenhum sistema para resolver
            </div>
          </div>
        </div>

        <p>
          Se a base for apenas <strong>ortogonal</strong> (sem normalizar), a fórmula ganha um
          denominador:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 text-center font-mono text-[15px]">
          c<sub>i</sub> = ⟨u, v<sub>i</sub>⟩ / ⟨v<sub>i</sub>, v<sub>i</sub>⟩
        </div>

        <p>
          Repare que isso é exatamente a <strong>projeção ortogonal</strong> que você já viu: cada
          coordenada é a projeção de u na direção de v<sub>i</sub>. Numa base ortonormal o denominador
          vale 1 e some — daí a simplificação.
        </p>

        <Callout tipo="ia">
          É por isso que bases ortonormais são o padrão em computação. Numa base ortonormal, projetar,
          medir distância e reconstruir vetores viram somas de produtos escalares — operações baratas e
          numericamente estáveis. PCA, compressão de imagem e a decomposição usada em embeddings
          dependem disso.
        </Callout>

        <p>
          A ligação com matrizes: uma matriz cujas <strong>colunas formam uma base ortonormal</strong> é
          chamada <strong>ortogonal</strong>, e tem a propriedade notável Q⁻¹ = Qᵀ — inverter vira
          transpor, que é a operação mais barata que existe.
        </p>

        <Checkpoint>
          Você calcula produto interno, norma, distância e ângulo em Rⁿ, distingue ortogonal de unitário
          de ortonormal, sabe normalizar, e usa a fórmula das coordenadas por produto escalar. Junto com
          base, dimensão e mudança de coordenadas, isso fecha a Avaliação Teórica 3.
        </Checkpoint>
      </Section>
    </article>
  );
}
