import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { VarianciaPassoAPasso } from '@/components/interactive/VarianciaPassoAPasso';

/** Aula: Medidas de variabilidade — amplitude, variância e desvio-padrão. */
export function VariabilidadeLesson() {
  return (
    <article className="space-y-10">
      <Section title="Duas amostras com a mesma média podem ser opostas">
        <p>
          O livro abre a Seção 1.5 com um exemplo mudo, só de símbolos, que vale mais que a fórmula:
        </p>

        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>Conjunto A:  XXX XXX 0XX0 0XXX0 0  0000 00</div>
          <div>Conjunto B:  XXXXXXXXXXX 00 0  00 00 0  000</div>
        </div>

        <p>
          Nos dois conjuntos a diferença entre as médias dos grupos X e 0 é praticamente a mesma. Mas em
          B os dois grupos estão nitidamente separados, enquanto em A eles se misturam. Só o conjunto B
          permite concluir alguma coisa. <strong>A diferença entre as médias não significa nada sem
          saber a variabilidade.</strong>
        </p>

        <Callout tipo="info">
          Esse é o motivo de os capítulos 9 a 15 do livro existirem. Toda inferência estatística é, no
          fundo, comparar a diferença que você observou com o espalhamento natural dos dados — e decidir
          se ela é grande o bastante para não ser acaso.
        </Callout>
      </Section>

      <Section title="As três medidas, calculadas nos mesmos dados">
        <p>
          Fórmula solta não gruda. Então as três medidas aparecem aqui já aplicadas ao{' '}
          <strong>mesmo conjunto</strong>: a resistência à tensão, em psi, dos 10 espécimes de polímero
          que <em>não</em> passaram pelo envelhecimento acelerado (Exercício 1.3).
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px] text-gray-800 dark:text-gray-200">
          227 · 222 · 218 · 217 · 225 · 218 · 216 · 229 · 228 · 221 &nbsp;&nbsp;(n = 10, em psi)
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Amplitude</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
              A = x<sub>máx</sub> − x<sub>mín</sub>
            </div>
            <div className="mt-2 rounded bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 font-mono text-sm text-indigo-900 dark:text-indigo-100">
              A = 229 − 216 = <strong>13 psi</strong>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>Responde:</strong> qual a maior distância que existe dentro da amostra.{' '}
              <strong>Falha porque:</strong> usou 2 dos 10 números. Os outros 8 podiam estar em qualquer
              lugar entre 216 e 229 que A continuaria 13.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">Variância amostral</div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">
              s² = Σ(xᵢ − x̄)² / (n − 1)
            </div>
            <div className="mt-2 space-y-1 rounded bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 font-mono text-sm text-indigo-900 dark:text-indigo-100">
              <div>x̄ = 2221 / 10 = 222,10 psi</div>
              <div>Σ(xᵢ − x̄)² = (227−222,10)² + (222−222,10)² + … + (221−222,10)² = 212,90</div>
              <div>
                s² = 212,90 / (10 − 1) = 212,90 / 9 = <strong>23,66 psi²</strong>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>Responde:</strong> o tamanho médio do desvio, com todos os 10 valores dentro da
              conta. <strong>Falha porque:</strong> sai em <strong>psi ao quadrado</strong> — ninguém
              consegue imaginar o que são 23,66 psi².
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-1 font-bold text-gray-900 dark:text-gray-100">
              Desvio-padrão amostral
            </div>
            <div className="font-mono text-sm text-gray-800 dark:text-gray-200">s = √s²</div>
            <div className="mt-2 rounded bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 font-mono text-sm text-indigo-900 dark:text-indigo-100">
              s = √23,66 = <strong>4,86 psi</strong>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              <strong>Responde:</strong> a mesma coisa que s², mas na <strong>unidade original</strong>{' '}
              — e agora vira frase: <em>&quot;um espécime típico fica a uns 4,9 psi dos 222,1 psi
              médios&quot;</em>. É por isso que na prática se reporta s.
            </p>
          </div>
        </div>

        <Callout tipo="prova">
          A unidade é cobrada. Se os pesos de caule estão em gramas, então s está em{' '}
          <strong>gramas</strong> e s² está em <strong>gramas²</strong>. No Exercício 1.7, o tempo de
          secagem em horas dá s² = 0,9427 h² e s = 0,9709 h. Escrever a unidade errada custa ponto.
        </Callout>
      </Section>

      <Section title="A conta inteira, uma linha de cada vez">
        <p>
          Ver o resultado pronto é diferente de saber produzir o resultado. Abaixo o roteiro completo
          roda sobre quatro conjuntos diferentes, um passo por vez — inclusive o de tempo de secagem,
          que tem média quebrada de propósito, porque é assim que cai na prova.
        </p>

        <VarianciaPassoAPasso />

        <p>
          O roteiro é sempre o mesmo, e vale a pena decorar como cinco movimentos em vez de uma fórmula
          grande:
        </p>

        <div className="space-y-2">
          {[
            ['1', 'Some tudo e divida por n', 'acha x̄ — sem centro não existe desvio'],
            ['2', 'Subtraia x̄ de cada valor', 'os desvios; confira que somam 0'],
            ['3', 'Eleve cada desvio ao quadrado', 'mata o sinal, sem isso a soma zera'],
            ['4', 'Some os quadrados', 'a soma de quadrados, SQ'],
            ['5', 'Divida por n − 1, depois raiz', 's² e s, com unidade'],
          ].map(([n, acao, porque]) => (
            <div
              key={n}
              className="flex gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
                {n}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">{acao}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{porque}</div>
              </div>
            </div>
          ))}
        </div>

        <Callout tipo="atencao">
          O erro mais caro é <strong>arredondar x̄ cedo demais</strong>. Se x̄ = 3,7867 h e você usa
          3,79, cada um dos 15 desvios entra errado, os erros são elevados ao quadrado e a soma final sai
          fora. Arredonde <strong>só no último passo</strong>, na hora de escrever s.
        </Callout>
      </Section>

      <Section title="Por que dividir por n − 1?">
        <p>
          A pergunta cai em prova, e a resposta está no Exercício 1.16. Considere os dados (5, 17, 6, 4),
          com x̄ = 8. Os desvios são:
        </p>

        <div className="space-y-1 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4 font-mono text-[15px]">
          <div>(5 − 8) = −3</div>
          <div>(17 − 8) = +9</div>
          <div>(6 − 8) = −2</div>
          <div>(4 − 8) = −4</div>
          <div className="pt-1 font-bold">soma = −3 + 9 − 2 − 4 = 0</div>
        </div>

        <p>
          Isso não é coincidência: <strong>a soma dos desvios em relação à média é sempre zero</strong>,
          para qualquer conjunto de dados. É exatamente o que o Exercício 1.16 pede para demonstrar.
        </p>

        <p>
          A consequência é que os n desvios <strong>não são independentes</strong>: sabendo n − 1 deles,
          o último está determinado. Só há n − 1 pedaços independentes de informação sobre a
          variabilidade — os chamados <strong>graus de liberdade</strong>. Por isso o denominador é
          n − 1, e não n.
        </p>

        <Callout tipo="info">
          A demonstração é curta: Σ(xᵢ − x̄) = Σxᵢ − n·x̄. Como x̄ = Σxᵢ/n, temos n·x̄ = Σxᵢ, e a
          subtração zera. Duas linhas.
        </Callout>

        <p>E o que muda na prática? No polímero sem envelhecimento, SQ = 212,90:</p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Denominador</th>
                <th className="py-2 text-right font-medium text-gray-500">Resultado</th>
                <th className="py-2 text-left font-medium text-gray-500 pl-4">O que é</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">212,90 / 9</td>
                <td className="py-1.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  23,66
                </td>
                <td className="py-1.5 pl-4 font-sans text-gray-600 dark:text-gray-400">
                  variância <strong>amostral</strong> — a que se pede
                </td>
              </tr>
              <tr>
                <td className="py-1.5">212,90 / 10</td>
                <td className="py-1.5 text-right font-bold text-red-600 dark:text-red-400">21,29</td>
                <td className="py-1.5 pl-4 font-sans text-gray-600 dark:text-gray-400">
                  subestima a variabilidade em 10%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Dividir por n dá sempre um número <strong>menor</strong> que o certo. Numa amostra de 10 o erro
          é de 10%; numa de 5, de 20%. Com n grande a diferença some — mas as amostras do Capítulo 1 são
          todas pequenas, então aqui o n − 1 importa.
        </p>

        <Callout tipo="atencao">
          <strong>Onde isso te pega fora da prova:</strong> na calculadora científica existem duas
          teclas, <span className="font-mono">sx</span> (ou σ<sub>n−1</sub>) e{' '}
          <span className="font-mono">σx</span> (ou σ<sub>n</sub>). A amostral é a primeira. No Excel em
          português são <span className="font-mono">DESVPAD.A</span> e{' '}
          <span className="font-mono">VAR.A</span> para amostra, contra{' '}
          <span className="font-mono">DESVPAD.P</span> e <span className="font-mono">VAR.P</span> para
          população. Escolher a tecla errada dá o número errado sem nenhum aviso.
        </Callout>
      </Section>

      <Section title="Aplicação 1 — decidir se um material é confiável">
        <p>
          Nos exercícios 1.9 e 1.11, calcular o desvio não é burocracia — é onde está a conclusão. O
          polímero é usado em sistemas de evacuação de aeronave, e a pergunta real do estudo é se ele
          aguenta envelhecer:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="border-b border-gray-300 dark:border-gray-600">
                <th className="py-2 text-left font-medium text-gray-500">Grupo</th>
                <th className="py-2 text-right font-medium text-gray-500">x̄ (psi)</th>
                <th className="py-2 text-right font-medium text-gray-500">A (psi)</th>
                <th className="py-2 text-right font-medium text-gray-500">s² (psi²)</th>
                <th className="py-2 text-right font-medium text-gray-500">s (psi)</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td className="py-1.5">Sem envelhecimento</td>
                <td className="py-1.5 text-right">222,10</td>
                <td className="py-1.5 text-right">13</td>
                <td className="py-1.5 text-right">23,66</td>
                <td className="py-1.5 text-right">4,86</td>
              </tr>
              <tr>
                <td className="py-1.5">Com envelhecimento</td>
                <td className="py-1.5 text-right">209,90</td>
                <td className="py-1.5 text-right">18</td>
                <td className="py-1.5 text-right">42,10</td>
                <td className="py-1.5 text-right">6,49</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p>
          Quem olha só a média conclui: <em>o envelhecimento reduz a resistência em 12 psi</em>. Quem
          calcula a variabilidade conclui algo pior: a variância <strong>quase dobra</strong>{' '}
          (23,66 → 42,10). O material fica mais fraco <strong>e</strong> mais imprevisível.
        </p>

        <p>
          Num sistema de evacuação, a segunda parte é a mais séria. Uma peça que sempre resiste 209 psi é
          projetável — basta dimensionar para 209. Uma peça que às vezes resiste 218 e às vezes 201 não
          é: você precisa dimensionar para o pior caso, e o pior caso piorou junto com a média.
        </p>
      </Section>

      <Section title="Aplicação 2 — descobrir que a diferença entre grupos é ilusão">
        <p>
          O Exercício 1.5 comparou a redução de colesterol de dois grupos, e as médias diziam que o
          tratamento vencia (7,6 contra 5,6). O Exercício 1.11 pede o desvio dos mesmos dados — e a
          história muda:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="space-y-1 font-mono text-[15px]">
            <div>controle:   x̄ = 5,6 &nbsp; s = 8,33</div>
            <div>tratamento: x̄ = 7,6 &nbsp; s = 11,32</div>
          </div>
          <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
            A diferença entre as médias é de <strong>2,0</strong>. O espalhamento dentro de cada grupo é
            de <strong>8 a 11</strong>. A diferença é <em>menor que o ruído</em> — exatamente o
            Conjunto A do começo da aula, em que os dois grupos se misturam.
          </p>
        </div>

        <p>
          Dá para ir mais fundo e achar o culpado. A soma de quadrados do grupo de tratamento é 1152,4.
          Um único paciente, o que reduziu 37, contribui com (37 − 7,6)² = 864,4 disso — ou seja,{' '}
          <strong>75% de toda a variabilidade do grupo vem de uma pessoa só</strong>. A vantagem aparente
          do tratamento e o excesso de variabilidade têm a mesma origem.
        </p>

        <Callout tipo="prova">
          Esse é o formato de resposta que o professor procura em questão discursiva: não pare em{' '}
          <em>&quot;s = 11,32&quot;</em>. Escreva a comparação — <em>&quot;a diferença entre as médias
          (2,0) é pequena diante do desvio de cada grupo (8,33 e 11,32), logo os dados não sustentam que
          o regime funcione&quot;</em>. A conta vale pouco; a leitura da conta vale a questão.
        </Callout>
      </Section>

      <Section title="Aplicação 3 — aferir um instrumento">
        <p>
          O Exemplo 1.4 do livro usa a mesma conta para um problema completamente diferente: um
          engenheiro quer saber se um medidor de pH está viciado. Ele mede dez vezes uma substância
          neutra, de pH conhecido = 7,00:
        </p>

        <div className="rounded-lg bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="font-mono text-[15px]">
            7,07 · 7,00 · 7,10 · 6,97 · 7,00 · 7,03 · 7,01 · 7,01 · 6,98 · 7,08
          </div>
          <div className="mt-3 space-y-1 font-mono text-[15px]">
            <div>x̄ = 7,0250</div>
            <div>s² = 0,001939</div>
            <div>s = 0,0440</div>
          </div>
        </div>

        <p>
          As duas medidas respondem duas perguntas diferentes sobre o aparelho:
        </p>

        <div className="space-y-3">
          <div className="rounded-lg border-l-4 border-rose-500 bg-rose-50 dark:bg-rose-950/40 p-4">
            <div className="font-bold text-rose-900 dark:text-rose-100">
              x̄ = 7,025 → tendenciosidade (viés)
            </div>
            <p className="mt-1 text-sm text-rose-900 dark:text-rose-100">
              O medidor lê, em média, 0,025 acima do valor verdadeiro. Erro <strong>sistemático</strong>
              : some em toda medida, e dá para corrigir subtraindo.
            </p>
          </div>
          <div className="rounded-lg border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-950/40 p-4">
            <div className="font-bold text-sky-900 dark:text-sky-100">
              s = 0,044 → precisão (repetibilidade)
            </div>
            <p className="mt-1 text-sm text-sky-900 dark:text-sky-100">
              Medindo a <em>mesma</em> substância, as leituras oscilam ±0,044. Erro{' '}
              <strong>aleatório</strong>: não dá para corrigir subtraindo, só trocando de aparelho ou
              medindo mais vezes.
            </p>
          </div>
        </div>

        <Callout tipo="info">
          Um aparelho pode ser <strong>preciso e viciado</strong> (s pequeno, x̄ longe de 7) ou{' '}
          <strong>honesto e impreciso</strong> (x̄ = 7,00 exato, s enorme). São defeitos independentes, e
          é por isso que reportar só a média esconde metade do problema. Esse par
          viés / variância volta em cheio no Capítulo 9 e, com outro nome, em aprendizado de máquina.
        </Callout>
      </Section>

      <Section title="Aplicação 4 — a mesma conta, agora em código">
        <p>
          Em BIA você vai calcular desvio-padrão muito mais no teclado do que no papel. A conta é
          idêntica; o que muda é que a biblioteca escolhe o denominador por você — e nem sempre escolhe
          o que a estatística pede.
        </p>

        <div className="overflow-x-auto rounded-lg bg-gray-900 p-4 font-mono text-[13px] leading-relaxed text-gray-100">
          <div className="text-gray-500"># os dados do polímero sem envelhecimento</div>
          <div>x = [227, 222, 218, 217, 225, 218, 216, 229, 228, 221]</div>
          <div className="mt-2">
            np.var(x) <span className="text-gray-500"># 21,29 → divide por n (POPULACIONAL)</span>
          </div>
          <div>
            np.var(x, ddof=1){' '}
            <span className="text-gray-500"># 23,66 → divide por n − 1 (amostral) ✓</span>
          </div>
          <div className="mt-2">
            pd.Series(x).var(){' '}
            <span className="text-gray-500"># 23,66 → pandas já usa n − 1 por padrão ✓</span>
          </div>
        </div>

        <Callout tipo="atencao">
          <span className="font-mono">ddof</span> quer dizer <em>delta degrees of freedom</em>: o
          denominador é n − ddof. O padrão do <span className="font-mono">numpy</span> é ddof=0 e o do{' '}
          <span className="font-mono">pandas</span> é ddof=1 — as duas bibliotecas mais usadas discordam
          entre si. Misturar as duas no mesmo relatório é fonte clássica de número que não bate.
        </Callout>

        <Callout tipo="ia">
          O desvio-padrão é a peça central do <strong>z-score</strong>, z = (x − x̄)/s, que é como quase
          todo modelo recebe seus dados: cada variável é reescrita em &quot;quantos desvios-padrão acima
          ou abaixo da média&quot;. É o que permite jogar altura em metros e renda em reais na mesma
          rede sem que a renda domine só por ter números maiores. Sem s, não existe normalização — e sem
          normalização, boa parte dos modelos simplesmente não treina.
        </Callout>
      </Section>

      <Section title="Fechando">
        <Callout tipo="prova">
          <strong>Roteiro para qualquer questão de variabilidade:</strong>
          <br />
          <strong>1.</strong> Calcule x̄ sem arredondar.
          <br />
          <strong>2.</strong> Monte a coluna dos desvios e confira que somam 0 — é o seu conferidor
          grátis de erro de conta.
          <br />
          <strong>3.</strong> Eleve ao quadrado, some, divida por n − 1, tire a raiz.
          <br />
          <strong>4.</strong> Escreva a unidade: s² em unidade², s em unidade.
          <br />
          <strong>5.</strong> Responda a pergunta do enunciado em uma frase comparando s com a
          diferença que estava em jogo. Sem o passo 5, a questão fica pela metade.
        </Callout>

        <Checkpoint>
          Você calcula amplitude, variância e desvio-padrão do zero em cinco passos, com a unidade certa
          e sem arredondar cedo, sabe justificar o n − 1 pelos graus de liberdade e mostrar que dividir
          por n subestima, e — o que separa nota 6 de nota 10 — usa s para responder à pergunta do
          enunciado: se o material é confiável, se a diferença entre dois grupos é real, se o
          instrumento é preciso. A seguir: como mostrar tudo isso em gráfico.
        </Checkpoint>
      </Section>
    </article>
  );
}
