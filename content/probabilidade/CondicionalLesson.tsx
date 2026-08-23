import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';

/** Aula: Probabilidade condicional e regras multiplicativas. */
export function CondicionalLesson() {
  return (
    <article className="space-y-10">
      <Section title="Condicional é encolher o espaço amostral">
        <p>
          <span className="font-mono">P(A | B)</span> lê-se &quot;probabilidade de A{' '}
          <strong>dado que</strong> B ocorreu&quot;. A ideia é simples: saber que B aconteceu{' '}
          <strong>elimina</strong> todos os resultados fora de B. O espaço amostral encolhe, e você
          recalcula dentro do que sobrou.
        </p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A | B) = P(A ∩ B) / P(B), com P(B) &gt; 0
          </div>
        </div>

        <p>
          O numerador é a parte de A que sobreviveu (a que está dentro de B), e o denominador é o novo
          total. Num dado, P(sair 6 | saiu par) = P(&#123;6&#125;)/P(&#123;2,4,6&#125;) = (1/6)/(3/6) =
          1/3 — subiu de 1/6 para 1/3, porque três resultados foram descartados.
        </p>

        <Callout tipo="prova">
          Em tabela de dupla entrada, condicional é <strong>olhar só uma linha ou só uma coluna</strong>.
          Se o enunciado diz &quot;dado que a peça veio da máquina A&quot;, você ignora as outras linhas
          e usa o total daquela linha como denominador. Esse é o atalho que resolve quase todo exercício
          da Seção 2.6.
        </Callout>
      </Section>

      <Section title="A regra multiplicativa">
        <p>Reorganizando a definição, sai a fórmula que se usa para calcular interseções:</p>

        <div className="flex justify-center py-2">
          <div className="rounded-lg bg-gray-100 dark:bg-gray-800 px-8 py-4 text-center font-mono text-lg font-bold">
            P(A ∩ B) = P(B) · P(A | B) = P(A) · P(B | A)
          </div>
        </div>

        <p>
          Ela descreve eventos <strong>em sequência</strong>: a chance de o primeiro acontecer, vezes a
          chance do segundo <em>já sabendo</em> que o primeiro aconteceu.
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — duas cartas, sem reposição
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>P(1ª ser ás) = 4/52</div>
            <div>P(2ª ser ás | 1ª foi ás) = 3/51 &nbsp;&nbsp;← sobraram 3 ases em 51 cartas</div>
            <div className="pt-1 font-bold">P(dois ases) = (4/52)(3/51) = 12/2652 ≈ 0,0045</div>
          </div>
        </div>

        <Callout tipo="atencao">
          <strong>Com reposição ou sem reposição</strong> muda tudo. Se você devolve a carta ao baralho,
          a segunda probabilidade continua 4/52 e os eventos ficam independentes. Sem devolver, o
          denominador cai para 51 e o numerador para 3. Leia o enunciado procurando essa palavra.
        </Callout>

        <p>
          A regra se estende naturalmente para três ou mais eventos, encadeando os condicionamentos —
          como no exemplo do livro em que se sorteia um ás vermelho, depois um 10 ou valete, depois uma
          terceira carta, cada uma condicionada a tudo que veio antes.
        </p>
      </Section>

      <Section title="Independência: quando a informação não muda nada">
        <p>Dois eventos são independentes quando saber de um não altera a chance do outro:</p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>P(A | B) = P(A)</div>
          <div className="pt-1">
            equivalente a: <strong>P(A ∩ B) = P(A) · P(B)</strong>
          </div>
        </div>

        <p>
          A segunda forma é a mais prática: para <strong>testar</strong> independência, calcule P(A)·P(B)
          e compare com P(A ∩ B). Se der igual, são independentes; se não, são dependentes.
        </p>

        <Callout tipo="atencao">
          A confusão mais comum do capítulo inteiro:
          <br />• <strong>Mutuamente exclusivos</strong> → P(A ∩ B) = 0. Um exclui o outro.
          <br />• <strong>Independentes</strong> → P(A ∩ B) = P(A)·P(B). Um ignora o outro.
          <br />
          Se A e B têm probabilidade positiva e são mutuamente exclusivos, então P(A|B) = 0 ≠ P(A), ou
          seja, eles são <strong>dependentes</strong> — saber que B ocorreu te diz, com certeza, que A
          não ocorreu. São conceitos diferentes, e um quase exclui o outro.
        </Callout>

        <p>
          Independência costuma vir do <strong>contexto físico</strong>: lançamentos sucessivos de moeda,
          componentes que falham por causas separadas, amostragem com reposição. É por isso que, no
          Exercício 1.15, a probabilidade de cinco caras é (1/2)⁵ — os lançamentos são independentes,
          então as probabilidades se multiplicam.
        </p>

        <Checkpoint>
          Você calcula condicional encolhendo o espaço amostral (ou lendo uma linha da tabela), usa a
          regra multiplicativa para sequências com e sem reposição, e testa independência comparando
          P(A ∩ B) com P(A)·P(B). Falta inverter o condicionamento — é a regra de Bayes.
        </Checkpoint>
      </Section>

      <Section title="Aplicação: confiabilidade de sistemas em série e paralelo">
        <p>
          Uma aplicação direta de independência que aparece muito em engenharia: cada componente de um
          sistema tem uma probabilidade de funcionar, e a pergunta é <strong>qual a confiabilidade do
          sistema inteiro</strong>. A resposta depende de como os componentes estão ligados.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border-2 border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40 p-4">
            <div className="mb-1 font-bold text-red-900 dark:text-red-100">Série — regra multiplicativa</div>
            <p className="text-sm text-red-900 dark:text-red-100">
              Se qualquer componente falhar, o sistema todo para. Funcionar exige que{' '}
              <strong>todos</strong> funcionem — é a interseção de eventos independentes.
            </p>
            <div className="mt-2 font-mono text-sm text-red-900 dark:text-red-100">
              P(A ∩ B) = P(A) · P(B)
            </div>
          </div>
          <div className="rounded-lg border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-4">
            <div className="mb-1 font-bold text-emerald-900 dark:text-emerald-100">
              Paralelo — regra do complemento
            </div>
            <p className="text-sm text-emerald-900 dark:text-emerald-100">
              O sistema só falha se <strong>todos</strong> os caminhos falharem ao mesmo tempo —
              redundância. Funcionar é o complemento de &quot;todos falham&quot;.
            </p>
            <div className="mt-2 font-mono text-sm text-emerald-900 dark:text-emerald-100">
              P(C ∪ D) = 1 − P(C&#39;)·P(D&#39;)
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="mb-2 font-bold text-gray-900 dark:text-gray-100">
            Exemplo — dois nós em série (0,90 cada) alimentando dois nós em paralelo (0,80 cada)
          </div>
          <div className="space-y-1 font-mono text-[15px]">
            <div>Bloco em série: P(A ∩ B) = 0,90 × 0,90 = 0,81</div>
            <div>Bloco em paralelo: P(C ∪ D) = 1 − (1 − 0,80)(1 − 0,80) = 1 − 0,04 = 0,96</div>
            <div className="pt-1 font-bold">Confiabilidade total = 0,81 × 0,96 = 0,7776 (77,8%)</div>
          </div>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Os dois blocos, por sua vez, estão em série entre si — por isso as confiabilidades deles se
            multiplicam de novo no final.
          </p>
        </div>

        <Callout tipo="prova">
          O truque mental: <strong>série multiplica probabilidades de sucesso</strong> (por isso a
          confiabilidade só cai, nunca sobe, ao adicionar componentes em série).{' '}
          <strong>Paralelo multiplica probabilidades de falha</strong>, e depois faz 1 menos o resultado
          — é exatamente a regra do complemento para &quot;pelo menos um funciona&quot;, vista na aula
          anterior.
        </Callout>

        <Callout tipo="ia">
          É o mesmo raciocínio por trás de arquiteturas tolerantes a falha em sistemas distribuídos:
          servidores redundantes em paralelo aumentam a disponibilidade; uma cadeia de microsserviços
          onde cada um depende do anterior é uma série — e a confiabilidade do pipeline inteiro cai
          multiplicativamente a cada elo adicionado.
        </Callout>
      </Section>
    </article>
  );
}
