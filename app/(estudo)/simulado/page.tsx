import Link from 'next/link';
import { simulados, contarDaLista } from '@/lib/content/simulados';

export const metadata = {
  title: 'Simulado — Estudo de Matemática',
  description: 'Treino cronometrado com as questões do livro que o professor deve cobrar.',
};

/** As listas do professor, conferidas nos PDFs originais. */
const LISTAS = [
  {
    materia: 'Probabilidade e Estatística',
    codigo: 'MATPA2705',
    livro: 'Montgomery & Runger — Estatística Aplicada e Probabilidade para Engenheiros, 4ª ed.',
    entrega: '20/08/2026',
    escopo: 'Cap. 2 — Probabilidade',
    exercicios:
      '2-1 · 2-5 · 2-7 · 2-15 · 2-19 · 2-21 · 2-31 · 2-37 · 2-49 · 2-53 · 2-55 · 2-57 · 2-65 · 2-67 · 2-71 · 2-77 · 2-89 · 2-95 · 2-97 · 2-101 · 2-103 · 2-111 · 2-115 · 2-127 · 2-129',
  },
  {
    materia: 'Cálculo A',
    codigo: 'MAT00APA',
    livro: 'Stewart — Cálculo, Volume 1, 7ª ed.',
    entrega: '21/08/2026',
    escopo: 'Seções 2.1 a 2.4 — Tangente, limite, propriedades e definição precisa',
    exercicios:
      '2.1: 1,3,5,7,9 · 2.2: 1,3,5,9,11,15,21,27,31,39,41,47 · 2.3: 1,3,5,9,11,17,23,29,33,41,47,51,63 · 2.4: 1,3,9,11,17,25,31,35,37,43',
  },
];

export default function SimuladoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          ← Início
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
          Simulado 🎯
        </h1>
        <p className="mt-1 text-lg text-gray-600 dark:text-gray-400">
          Dez questões tiradas do livro, cronometradas, com correção e resolução completa. O sorteio
          prioriza os exercícios que o professor já colocou na lista.
        </p>
      </div>

      {/* Os simulados */}
      <div className="grid gap-4 sm:grid-cols-2">
        {simulados.map((s) => (
          <Link
            key={s.id}
            href={`/simulado/${s.id}`}
            className="group overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors hover:border-gray-400 dark:hover:border-gray-500"
          >
            <div className={`bg-gradient-to-r ${s.cor} px-5 py-4`}>
              <div className="text-lg font-bold text-white">{s.materia}</div>
              <div className="text-sm text-white/80">
                {s.quantidade} questões · {s.minutos} min
              </div>
            </div>
            <div className="space-y-2 p-5">
              <div className="text-sm text-gray-600 dark:text-gray-400">{s.livro}</div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded bg-gray-100 dark:bg-gray-800 px-2 py-1 font-medium text-gray-700 dark:text-gray-300">
                  {s.questoes.length} no banco
                </span>
                <span className="rounded bg-amber-100 dark:bg-amber-900/50 px-2 py-1 font-medium text-amber-800 dark:text-amber-200">
                  {contarDaLista(s)} da lista do professor
                </span>
              </div>
              <div className="pt-1 font-medium text-gray-900 dark:text-gray-100 group-hover:underline">
                Começar →
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Confirmação do escopo */}
      <div className="mt-10">
        <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
          O que as listas confirmam
        </h2>
        <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Conferido nos PDFs originais das listas, não de memória.
        </p>

        <div className="space-y-3">
          {LISTAS.map((l) => (
            <div
              key={l.codigo}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-bold text-gray-900 dark:text-gray-100">{l.materia}</span>
                <span className="font-mono text-xs text-gray-500">{l.codigo}</span>
                <span className="ml-auto text-xs text-gray-500">entrega {l.entrega}</span>
              </div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">{l.livro}</div>
              <div className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                {l.escopo}
              </div>
              <div className="mt-1 break-words font-mono text-xs text-gray-600 dark:text-gray-400">
                {l.exercicios}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border-2 border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4">
          <div className="mb-1 text-sm font-bold text-amber-900 dark:text-amber-100">
            ⚠️ Duas coisas a checar com o professor
          </div>
          <ul className="list-disc space-y-1 pl-5 text-[15px] text-amber-900 dark:text-amber-100">
            <li>
              O livro de Probabilidade é o <strong>Montgomery</strong>, não o Walpole — a numeração
              com hífen (2-49) é dele. Boa parte do conteúdo antigo da plataforma foi escrita sobre o
              Walpole, então os números de exercício não batem entre os dois.
            </li>
            <li>
              A lista só confirma o <strong>Cap. 2</strong>. Se ele falou em caps. 1 a 3, o Cap. 1
              (papel da estatística) e o Cap. 3 (variáveis aleatórias discretas) entram na prova sem
              lista — vale confirmar antes de estudar por eles.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
