import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { SquareRootVisual, PythagorasVisual } from '@/components/interactive/SquareRootVisual';

/** Aula: Potências e raízes. */
export function PotenciasLesson() {
  return (
    <article className="space-y-10">
      <Section title="Potência é multiplicação repetida">
        <p>
          <span className="font-mono">5³</span> não é 5 × 3. É{' '}
          <span className="font-mono">5 × 5 × 5 = 125</span>. O número pequeno lá em cima (o
          expoente) diz <strong>quantas vezes o número aparece na multiplicação</strong>, não por
          quanto multiplicar.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="border border-gray-300 dark:border-gray-700 p-2">Escrito</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Significa</th>
                <th className="border border-gray-300 dark:border-gray-700 p-2">Vale</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['5²', '5 × 5', '25'],
                ['5³', '5 × 5 × 5', '125'],
                ['2⁴', '2 × 2 × 2 × 2', '16'],
                ['(−3)²', '(−3) × (−3)', '9  (positivo!)'],
                ['(−3)³', '(−3) × (−3) × (−3)', '−27'],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 text-center font-mono font-bold">
                    {a}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 text-center font-mono">
                    {b}
                  </td>
                  <td className="border border-gray-300 dark:border-gray-700 p-2 text-center font-mono font-bold">
                    {c}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Callout tipo="info" titulo="Por que (−3)² dá positivo">
          Porque é (−3) × (−3), e você já viu na aula de sinais: sinais iguais na multiplicação dão
          positivo. Expoente <strong>par</strong> sempre elimina o negativo; expoente{' '}
          <strong>ímpar</strong> preserva. Isso explica por que a norma de um vetor nunca é
          negativa — ela soma quadrados.
        </Callout>
      </Section>

      <Section title="Quadrado é literalmente um quadrado">
        <p>
          O nome não é coincidência. Elevar ao quadrado é calcular a área de um quadrado com aquele
          lado. Arraste e veja:
        </p>

        <SquareRootVisual />

        <p>
          E a <strong>raiz quadrada</strong> é o caminho de volta: você tem a área e quer descobrir
          o lado. São operações inversas, como somar e subtrair.
        </p>

        <Callout tipo="atencao">
          Os dois erros que mais aparecem:
          <br />• <span className="font-mono">7²</span> não é 14. É 7 × 7 = 49.
          <br />• <span className="font-mono">√64</span> não é 32. É 8, porque 8 × 8 = 64.
          <br />
          Nos dois casos o erro é tratar potência/raiz como se fosse multiplicação ou divisão por 2.
        </Callout>

        <p>Vale ter na cabeça os quadrados perfeitos até 12 — aparecem o tempo todo:</p>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
            <div
              key={n}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 text-center"
            >
              <div className="font-mono text-xs text-gray-500">{n}²</div>
              <div className="font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
                {n * n}
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Reconhecer que 144 é 12² faz você calcular √144 na hora, sem calculadora. Não precisa
          decorar à força — usar bastante já grava.
        </p>
      </Section>

      <Section title="Pitágoras: a conta que vira norma de vetor">
        <p>
          Num triângulo retângulo (aquele com um ângulo de 90°), vale{' '}
          <span className="font-mono font-bold">h² = a² + b²</span>, onde h é a hipotenusa (o lado
          maior, oposto ao ângulo reto) e a, b são os catetos.
        </p>

        <PythagorasVisual />

        <Callout tipo="atencao" titulo="O passo que todo mundo esquece">
          A fórmula te dá <span className="font-mono">h²</span>, não <span className="font-mono">h</span>.
          Depois de somar os quadrados, você <strong>ainda precisa tirar a raiz</strong>. Em 3² + 4²
          = 25, a resposta não é 25 — é √25 = 5. Parar cedo demais aqui custa questão.
        </Callout>

        <Callout tipo="prova" titulo="A ligação direta com GAAL">
          A norma de um vetor é Pitágoras com outro nome: ‖(3, 4)‖ = √(3² + 4²) = 5. As componentes
          do vetor são os catetos e o vetor é a hipotenusa. Se Pitágoras estiver firme, todo o
          tópico 6 de Álgebra Linear já está meio caminho andado — e ele é pré-requisito de
          projeções e similaridade do cosseno.
        </Callout>

        <Checkpoint>
          Você sabe que potência é multiplicação repetida, que expoente par mata o sinal negativo,
          que raiz desfaz o quadrado, e sabe aplicar Pitágoras até o final (incluindo a raiz). É
          exatamente o que a norma de vetor exige.
        </Checkpoint>
      </Section>
    </article>
  );
}
