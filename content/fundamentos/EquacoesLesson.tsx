import React from 'react';
import { Section, Callout, Checkpoint } from '@/components/content/Blocks';
import { EquationBalance } from '@/components/interactive/EquationBalance';

/** Aula: Isolar a incógnita. */
export function EquacoesLesson() {
  return (
    <article className="space-y-10">
      <Section title="Uma equação é uma balança equilibrada">
        <p>
          O sinal de igual não é &quot;o resultado é&quot;. Ele significa{' '}
          <strong>&quot;os dois lados valem exatamente a mesma coisa&quot;</strong>. Como uma
          balança de pratos em equilíbrio.
        </p>
        <p>
          Daí sai a única regra que você precisa: <strong>o que você fizer de um lado, faça igual
          do outro</strong>. Tirou 3 kg de um prato? Tire 3 kg do outro, senão a balança desequilibra
          e a igualdade deixa de ser verdade.
        </p>
        <p>
          Resolver uma equação é usar essa regra repetidamente até o x ficar sozinho de um lado.
          Só isso. Teste você mesmo — pode errar, nada quebra:
        </p>

        <EquationBalance />
      </Section>

      <Section title="Cada operação tem uma que a desfaz">
        <p>
          Para tirar algo de perto do x, você aplica a operação <strong>inversa</strong> nos dois
          lados:
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { tem: 'x + 7', faz: 'subtrair 7', ex: 'x + 7 = 10 → x = 3' },
            { tem: 'x − 4', faz: 'somar 4', ex: 'x − 4 = 6 → x = 10' },
            { tem: '3x', faz: 'dividir por 3', ex: '3x = 12 → x = 4' },
            { tem: 'x/5', faz: 'multiplicar por 5', ex: 'x/5 = 2 → x = 10' },
          ].map((o) => (
            <div
              key={o.tem}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
            >
              <div className="font-mono text-sm">
                <span className="text-gray-500">está assim:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-gray-100">{o.tem}</span>
              </div>
              <div className="mt-1 font-mono text-sm">
                <span className="text-gray-500">você faz:</span>{' '}
                <span className="font-bold text-purple-600 dark:text-purple-400">{o.faz}</span>
              </div>
              <div className="mt-2 font-mono text-xs text-gray-600 dark:text-gray-400">{o.ex}</div>
            </div>
          ))}
        </div>

        <Callout tipo="info" titulo="A ordem que dá menos trabalho">
          Numa equação tipo <span className="font-mono">3x + 6 = 15</span>, tire primeiro o que está{' '}
          <strong>somando/subtraindo</strong> e só depois o que está multiplicando/dividindo. Se
          você dividir tudo por 3 primeiro, aparecem frações no caminho sem necessidade. Dá o mesmo
          resultado, mas com mais chance de errar conta.
        </Callout>
      </Section>

      <Section title="O passo a passo completo">
        <div className="rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-white dark:bg-gray-900 p-5">
          <div className="mb-3 font-mono text-lg font-bold text-gray-900 dark:text-gray-100">
            Resolver: 3x + 6 = 15
          </div>
          <div className="space-y-3">
            {[
              {
                n: '1',
                eq: '3x + 6 − 6 = 15 − 6',
                r: '3x = 9',
                p: 'O 6 está somando. Subtraio 6 dos DOIS lados. À esquerda ele some; à direita, 15 − 6 = 9.',
              },
              {
                n: '2',
                eq: '3x ÷ 3 = 9 ÷ 3',
                r: 'x = 3',
                p: 'Agora o x está multiplicado por 3. Divido os dois lados por 3. À esquerda sobra x sozinho; à direita, 9 ÷ 3 = 3.',
              },
              {
                n: '3',
                eq: '3(3) + 6 = 9 + 6 = 15 ✓',
                r: 'confere',
                p: 'Substituo x = 3 na equação ORIGINAL. Deu 15, que é o lado direito. Está certo.',
              },
            ].map((s) => (
              <div key={s.n} className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
                  {s.n}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-sm text-gray-700 dark:text-gray-300">{s.eq}</div>
                  <div className="font-mono text-base font-bold text-gray-900 dark:text-gray-100">
                    {s.r}
                  </div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">{s.p}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Callout tipo="info" titulo="Conferir não é opcional">
          O passo 3 leva 15 segundos e pega praticamente todo erro de sinal ou de conta. Numa prova,
          é a diferença entre entregar errado e corrigir a tempo. Crie o hábito agora, enquanto as
          equações são fáceis.
        </Callout>
      </Section>

      <Section title="Onde isso aparece no seu semestre">
        <Callout tipo="prova" titulo="GAAL — ortogonalidade">
          A questão &quot;determine k para que (2, k) e (6, −4) sejam ortogonais&quot; vira{' '}
          <span className="font-mono">12 − 4k = 0</span>. Somando 4k dos dois lados: 12 = 4k.
          Dividindo por 4: k = 3. É <strong>exatamente</strong> a mesma mecânica desta aula, só que
          com contexto de vetores por cima.
        </Callout>

        <Callout tipo="prova" titulo="GAAL — retrosubstituição no Gauss">
          Depois de escalonar um sistema, você resolve de baixo para cima isolando uma incógnita por
          vez. Cada linha vira uma equação simples do tipo desta aula. Escalonar é a parte nova;
          isolar é esta parte aqui.
        </Callout>

        <Callout tipo="prova" titulo="Cálculo 1">
          Achar onde a derivada zera (para encontrar máximos e mínimos) é resolver f&apos;(x) = 0 —
          uma equação. Todo problema de otimização termina numa equação para isolar. Se isolar
          incógnita for automático, sobra energia mental para o conceito de derivada em si.
        </Callout>

        <Checkpoint>
          Você entende a equação como balança, sabe qual operação desfaz cada uma, sabe a ordem que
          evita frações desnecessárias, e sabe conferir. Isso fecha o módulo Fundamentos — e é a
          base concreta das três matérias que você está carregando.
        </Checkpoint>
      </Section>
    </article>
  );
}
