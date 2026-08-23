'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useGameificationStore from '@/lib/gamification/store';

type Area = 'fracoes' | 'sinais' | 'potencias' | 'equacoes';

interface Questao {
  area: Area;
  pergunta: string;
  opcoes: string[];
  correta: number;
  porque: string;
}

const AREAS: Record<Area, { nome: string; slug: string; oQueTrava: string }> = {
  fracoes: {
    nome: 'Frações',
    slug: 'fracoes',
    oQueTrava: 'escalonamento de Gauss, onde você divide linhas por pivôs e aparecem frações direto',
  },
  sinais: {
    nome: 'Números negativos',
    slug: 'sinais',
    oQueTrava: 'produto escalar e qualquer conta longa — um sinal trocado derruba a questão inteira',
  },
  potencias: {
    nome: 'Potências e raízes',
    slug: 'potencias-raizes',
    oQueTrava: 'norma de vetor, que é raiz quadrada de soma de quadrados',
  },
  equacoes: {
    nome: 'Isolar incógnita',
    slug: 'equacoes',
    oQueTrava: 'questões do tipo "determine k para que os vetores sejam ortogonais"',
  },
};

const QUESTOES: Questao[] = [
  {
    area: 'fracoes',
    pergunta: 'Quanto é 1/2 + 1/3?',
    opcoes: ['2/5', '5/6', '1/5', '2/6'],
    correta: 1,
    porque:
      'Para somar frações com denominadores diferentes, iguale os denominadores primeiro: ' +
      '1/2 = 3/6 e 1/3 = 2/6. Aí soma os de cima: 3/6 + 2/6 = 5/6. ' +
      'Somar "reto" (1+1 e 2+3 = 2/5) é o erro mais comum, e é o que a alternativa a) representa.',
  },
  {
    area: 'fracoes',
    pergunta: 'Quanto é 2/3 × 3/4?',
    opcoes: ['6/12 = 1/2', '5/7', '8/9', '6/7'],
    correta: 0,
    porque:
      'Multiplicar frações é o caso FÁCIL: multiplica de cima com de cima, de baixo com de baixo. ' +
      '2×3 = 6 e 3×4 = 12, dando 6/12 que simplifica para 1/2. ' +
      'Não precisa igualar denominador — isso só vale para soma e subtração.',
  },
  {
    area: 'fracoes',
    pergunta: 'Quanto é 6 ÷ (1/2)?',
    opcoes: ['3', '12', '6', '1/12'],
    correta: 1,
    porque:
      'Dividir por uma fração é multiplicar pelo inverso dela: 6 ÷ (1/2) = 6 × 2 = 12. ' +
      'Faz sentido pensando assim: "quantas metades cabem em 6?" Cabem 12. ' +
      'Muita gente responde 3 por reflexo (dividir por 2), mas dividir POR meio é o oposto de dividir EM dois.',
  },
  {
    area: 'sinais',
    pergunta: 'Quanto é (−3) × (−4)?',
    opcoes: ['−12', '12', '−7', '7'],
    correta: 1,
    porque:
      'Menos vezes menos dá mais: (−3) × (−4) = +12. ' +
      'A regra: sinais IGUAIS na multiplicação resultam em positivo; sinais diferentes, negativo.',
  },
  {
    area: 'sinais',
    pergunta: 'Quanto é 5 − (−3)?',
    opcoes: ['2', '8', '−8', '−2'],
    correta: 1,
    porque:
      'Subtrair um número negativo é o mesmo que somar o positivo: 5 − (−3) = 5 + 3 = 8. ' +
      'Os dois sinais de menos "se cancelam". Este é o ponto que mais gera erro em conta longa.',
  },
  {
    area: 'sinais',
    pergunta: 'Quanto é (−2) + (−5)?',
    opcoes: ['−7', '7', '−3', '3'],
    correta: 0,
    porque:
      'Somar dois negativos afunda mais ainda: (−2) + (−5) = −7. ' +
      'Pense em dívida: você devia 2, ficou devendo mais 5, agora deve 7. ' +
      'Cuidado para não confundir com multiplicação — na SOMA, dois negativos continuam negativo.',
  },
  {
    area: 'potencias',
    pergunta: 'Quanto é (−3)²?',
    opcoes: ['−9', '9', '−6', '6'],
    correta: 1,
    porque:
      '(−3)² significa (−3) × (−3) = +9. Elevar ao quadrado SEMPRE dá positivo, porque você ' +
      'multiplica o número por ele mesmo e os sinais iguais dão positivo. ' +
      'É por isso que a norma de um vetor nunca é negativa.',
  },
  {
    area: 'potencias',
    pergunta: 'Quanto é √64?',
    opcoes: ['8', '32', '16', '6'],
    correta: 0,
    porque:
      '√64 pergunta: "que número multiplicado por ele mesmo dá 64?" Resposta: 8, porque 8 × 8 = 64. ' +
      'Raiz quadrada NÃO é dividir por 2 — 64 ÷ 2 = 32, que é a alternativa b) e um erro bem comum.',
  },
  {
    area: 'potencias',
    pergunta: 'Um triângulo retângulo tem catetos 3 e 4. Quanto mede a hipotenusa?',
    opcoes: ['7', '5', '12', '25'],
    correta: 1,
    porque:
      'Pitágoras: h² = 3² + 4² = 9 + 16 = 25. Então h = √25 = 5. ' +
      'O passo que muita gente esquece é o último: depois de somar os quadrados, precisa TIRAR A RAIZ. ' +
      'Parar em 25 (alternativa d) é o deslize clássico — e é exatamente o mesmo cálculo da norma de um vetor.',
  },
  {
    area: 'equacoes',
    pergunta: 'Se 3x = 12, quanto vale x?',
    opcoes: ['4', '36', '9', '15'],
    correta: 0,
    porque:
      'O x está sendo MULTIPLICADO por 3, então para isolá-lo você divide os dois lados por 3: ' +
      '3x/3 = 12/3, dando x = 4. ' +
      'A regra de ouro: o que você faz de um lado, faz do outro igual.',
  },
  {
    area: 'equacoes',
    pergunta: 'Se x + 7 = 10, quanto vale x?',
    opcoes: ['17', '3', '70', '−3'],
    correta: 1,
    porque:
      'O 7 está SOMANDO, então você subtrai 7 dos dois lados: x + 7 − 7 = 10 − 7, dando x = 3. ' +
      'A operação que desfaz uma soma é a subtração — e ela precisa ser aplicada aos dois lados ' +
      'para a igualdade continuar verdadeira.',
  },
  {
    area: 'equacoes',
    pergunta: 'Se 12 − 4k = 0, quanto vale k?',
    opcoes: ['3', '−3', '48', '8'],
    correta: 0,
    porque:
      'Passo 1: leve o 4k para o outro lado somando 4k dos dois lados → 12 = 4k. ' +
      'Passo 2: divida os dois lados por 4 → k = 3. ' +
      'Esta questão é literalmente a conta que aparece em GAAL quando se pede "determine k para que ' +
      'os vetores sejam ortogonais". Mesma equação, outro contexto.',
  },
];

export function DiagnosticQuiz() {
  const [i, setI] = useState(0);
  const [respostas, setRespostas] = useState<(number | null)[]>(
    Array(QUESTOES.length).fill(null)
  );
  const [escolha, setEscolha] = useState<number | null>(null);
  const [mostrandoPorque, setMostrandoPorque] = useState(false);
  const [terminou, setTerminou] = useState(false);

  const q = QUESTOES[i];

  const confirmar = () => {
    if (escolha === null) return;
    const novas = [...respostas];
    novas[i] = escolha;
    setRespostas(novas);
    setMostrandoPorque(true);
  };

  const proxima = () => {
    setMostrandoPorque(false);
    setEscolha(null);
    if (i === QUESTOES.length - 1) setTerminou(true);
    else setI(i + 1);
  };

  if (terminou) {
    const porArea = (Object.keys(AREAS) as Area[]).map((area) => {
      const idx = QUESTOES.map((qq, n) => (qq.area === area ? n : -1)).filter((n) => n >= 0);
      const acertos = idx.filter((n) => respostas[n] === QUESTOES[n].correta).length;
      return { area, acertos, total: idx.length };
    });

    const fracos = porArea.filter((a) => a.acertos < a.total);
    const totalAcertos = porArea.reduce((s, a) => s + a.acertos, 0);

    return (
      <>
        <SalvarResultado
          acertos={totalAcertos}
          total={QUESTOES.length}
          porArea={Object.fromEntries(porArea.map((a) => [a.area, a.acertos]))}
        />
      <div className="my-8 space-y-5">
        <div className="rounded-xl border-2 border-indigo-300 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 p-6 text-center">
          <div className="text-sm font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">
            Resultado
          </div>
          <div className="mt-2 text-4xl font-bold text-indigo-900 dark:text-indigo-100">
            {totalAcertos} de {QUESTOES.length}
          </div>
          <p className="mt-3 text-sm text-indigo-800 dark:text-indigo-200">
            Isto não é nota e não vai para lugar nenhum. Serve só para saber por onde começar.
          </p>
        </div>

        <div className="space-y-3">
          {porArea.map(({ area, acertos, total }) => {
            const ok = acertos === total;
            return (
              <div
                key={area}
                className={`rounded-xl border-2 p-5 ${
                  ok
                    ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-bold text-gray-900 dark:text-gray-100">
                    {ok ? '✅' : '📌'} {AREAS[area].nome}
                  </div>
                  <div className="font-mono text-sm font-bold">
                    {acertos}/{total}
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                  {ok ? (
                    <>Está tranquilo aqui. Pode pular este tópico se quiser.</>
                  ) : (
                    <>
                      Vale estudar. Isso é o que trava você em{' '}
                      <strong>{AREAS[area].oQueTrava}</strong>.
                    </>
                  )}
                </p>

                {!ok && (
                  <Link
                    href={`/fundamentos/${AREAS[area].slug}`}
                    className="mt-3 inline-block rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition"
                  >
                    Estudar {AREAS[area].nome} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-5">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
            {fracos.length === 0 ? (
              <>
                <strong>Sua base está melhor do que você imagina.</strong> Acertou tudo. O problema
                nas outras matérias provavelmente não é aritmética — é o conteúdo novo mesmo. Pode ir
                direto para Álgebra Linear.
              </>
            ) : fracos.length === 1 ? (
              <>
                <strong>Só um ponto para arrumar.</strong> É bem menos do que parecia, né? Estuda
                esse tópico e sua base já fica sólida para as três matérias.
              </>
            ) : (
              <>
                <strong>{fracos.length} pontos para arrumar</strong> — e é bom que sejam poucos e
                bem definidos, porque agora você sabe exatamente onde atacar em vez de achar que
                &quot;é ruim em matemática&quot; no geral. Comece pelo primeiro da lista.
              </>
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setI(0);
            setRespostas(Array(QUESTOES.length).fill(null));
            setEscolha(null);
            setMostrandoPorque(false);
            setTerminou(false);
          }}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Refazer o diagnóstico
        </button>
        </div>
      </>
    );
  }

  const acertou = escolha === q.correta;

  return (
    <div className="my-8 rounded-xl border-2 border-indigo-200 dark:border-indigo-900 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Progresso */}
      <div className="bg-indigo-100 dark:bg-indigo-900/50 px-5 py-3">
        <div className="flex items-center justify-between text-sm font-medium text-indigo-900 dark:text-indigo-100">
          <span>
            Questão {i + 1} de {QUESTOES.length}
          </span>
          <span className="text-xs uppercase tracking-wide">{AREAS[q.area].nome}</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo-200 dark:bg-indigo-800">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((i + (mostrandoPorque ? 1 : 0)) / QUESTOES.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-4 p-5">
        <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{q.pergunta}</p>

        <div className="space-y-2">
          {q.opcoes.map((op, n) => {
            const eCorreta = n === q.correta;
            const escolhida = escolha === n;
            return (
              <button
                key={n}
                disabled={mostrandoPorque}
                onClick={() => setEscolha(n)}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left font-mono transition ${
                  mostrandoPorque && eCorreta
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/40'
                    : mostrandoPorque && escolhida
                      ? 'border-red-400 bg-red-50 dark:bg-red-900/30'
                      : escolhida
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                }`}
              >
                <span className="mr-2 font-sans font-bold text-gray-400">
                  {String.fromCharCode(97 + n)})
                </span>
                {op}
                {mostrandoPorque && eCorreta && <span className="ml-2">✓</span>}
              </button>
            );
          })}
        </div>

        {mostrandoPorque && (
          <div
            className={`rounded-lg border p-4 ${
              acertou
                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
            }`}
          >
            <div className="mb-1 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {acertou ? '✅ Isso aí' : '📖 Sem problema — olha só'}
            </div>
            <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{q.porque}</p>
          </div>
        )}

        {mostrandoPorque ? (
          <button
            onClick={proxima}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-3 font-semibold text-white transition"
          >
            {i === QUESTOES.length - 1 ? 'Ver meu resultado →' : 'Próxima questão →'}
          </button>
        ) : (
          <button
            onClick={confirmar}
            disabled={escolha === null}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-3 font-semibold text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
}

/** Grava o resultado do diagnóstico no banco, uma vez por execução. */
function SalvarResultado({
  acertos,
  total,
  porArea,
}: {
  acertos: number;
  total: number;
  porArea: Record<string, number>;
}) {
  const salvar = useGameificationStore((s) => s.salvarDiagnostico);

  useEffect(() => {
    void salvar(acertos, total, porArea);
    // Só na montagem: remontar acontece apenas quando o aluno refaz o quiz.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
