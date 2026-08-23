import { lerEstatisticas } from '@/lib/db/queries';
import { topics, subjects } from '@/lib/content/registry';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const metadata = {
  title: 'Estatísticas — Estudo de Matemática',
  description: 'Onde você mais erra, medido a partir de todas as suas tentativas.',
};

const tituloTopico = (id: string) => topics.find((t) => t.id === id)?.title ?? id;
const linkTopico = (id: string) => {
  const t = topics.find((x) => x.id === id);
  if (!t) return null;
  const s = subjects.find((x) => x.id === t.subjectId);
  return s ? `/${s.slug}/${t.slug}` : null;
};

export default function EstatisticasPage() {
  const { geral, maisErrados, porTopico, dias, ultimoDiagnostico } = lerEstatisticas();

  const taxaGeral =
    geral.tentativas > 0 ? Math.round((geral.acertos / geral.tentativas) * 100) : 0;

  const semDados = geral.tentativas === 0;

  return (
    <div className="viz-root mx-auto max-w-4xl px-4 py-8">
      {/* Roles de cor: uma hue só (série única) + tinta de texto recessiva. */}
      <style>{`
        .viz-root {
          --surface-1: #fcfcfb;
          --text-primary: #0b0b0b;
          --text-secondary: #52514e;
          --series-1: #2a78d6;
          --grid: #e6e6e3;
        }
        @media (prefers-color-scheme: dark) {
          :root:where(:not([data-theme="light"])) .viz-root {
            --surface-1: #1a1a19;
            --text-primary: #ffffff;
            --text-secondary: #c3c2b7;
            --series-1: #3987e5;
            --grid: #33332f;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --surface-1: #1a1a19;
          --text-primary: #ffffff;
          --text-secondary: #c3c2b7;
          --series-1: #3987e5;
          --grid: #33332f;
        }
      `}</style>

      <div className="mb-8">
        <Link
          href="/"
          className="mb-4 inline-block text-sm text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Voltar
        </Link>
        <h1 className="text-4xl font-bold">Estatísticas</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Calculado a partir de <strong>todas</strong> as suas tentativas — acertos e erros —
          guardadas no banco local.
        </p>
      </div>

      {semDados ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
            Nenhuma tentativa registrada ainda
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Resolva alguns exercícios e volte aqui — esta página mostra onde você mais erra.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* KPIs — números, sem codificação por cor */}
          <section>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { v: geral.tentativas, l: 'tentativas' },
                { v: `${taxaGeral}%`, l: 'de acerto' },
                { v: geral.exercicios_distintos, l: 'exercícios tocados' },
                { v: geral.dicas, l: 'dicas usadas' },
              ].map((k) => (
                <div
                  key={k.l}
                  className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {k.v}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {k.l}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Acerto por tópico — série única, ordenada do pior para o melhor */}
          {porTopico.length > 0 && (
            <section>
              <h2 className="mb-1 text-xl font-bold">Acerto por tópico</h2>
              <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Ordenado do mais difícil para você até o mais tranquilo. O topo da lista é onde
                revisar rende mais.
              </p>

              <div className="space-y-3">
                {porTopico.map((t) => {
                  const href = linkTopico(t.topic_id);
                  const nome = tituloTopico(t.topic_id);
                  return (
                    <div key={t.topic_id}>
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <span className="truncate text-sm font-medium">
                          {href ? (
                            <Link href={href} className="hover:underline">
                              {nome}
                            </Link>
                          ) : (
                            nome
                          )}
                        </span>
                        <span
                          className="shrink-0 font-mono text-sm font-bold tabular-nums"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {t.taxa}%
                          <span
                            className="ml-2 font-sans text-xs font-normal"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {t.acertos}/{t.tentativas}
                          </span>
                        </span>
                      </div>

                      {/* Trilho recessivo + barra fina com ponta arredondada */}
                      <div
                        className="h-2.5 w-full overflow-hidden rounded-full"
                        style={{ backgroundColor: 'var(--grid)' }}
                      >
                        <div
                          className="h-full rounded-r-[4px]"
                          style={{
                            width: `${Math.max(t.taxa, 1)}%`,
                            backgroundColor: 'var(--series-1)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Exercícios mais errados */}
          {maisErrados.length > 0 && (
            <section>
              <h2 className="mb-1 text-xl font-bold">Onde você mais tropeça</h2>
              <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                Exercícios específicos que exigiram mais tentativas. Refazer estes vale mais do que
                fazer exercício novo.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px] border-collapse text-sm">
                  <thead>
                    <tr style={{ color: 'var(--text-secondary)' }}>
                      <th className="border-b border-gray-200 p-2 text-left font-medium dark:border-gray-700">
                        Exercício
                      </th>
                      <th className="border-b border-gray-200 p-2 text-left font-medium dark:border-gray-700">
                        Tópico
                      </th>
                      <th className="border-b border-gray-200 p-2 text-right font-medium dark:border-gray-700">
                        Erros
                      </th>
                      <th className="border-b border-gray-200 p-2 text-right font-medium dark:border-gray-700">
                        Tentativas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {maisErrados.map((e) => {
                      const href = linkTopico(e.topic_id);
                      return (
                        <tr key={e.exercise_id}>
                          <td className="border-b border-gray-100 p-2 font-mono text-xs dark:border-gray-800">
                            {e.exercise_id}
                          </td>
                          <td className="border-b border-gray-100 p-2 dark:border-gray-800">
                            {href ? (
                              <Link href={href} className="hover:underline">
                                {tituloTopico(e.topic_id)}
                              </Link>
                            ) : (
                              tituloTopico(e.topic_id)
                            )}
                          </td>
                          <td className="border-b border-gray-100 p-2 text-right font-mono font-bold tabular-nums dark:border-gray-800">
                            {e.erros}
                          </td>
                          <td
                            className="border-b border-gray-100 p-2 text-right font-mono tabular-nums dark:border-gray-800"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            {e.tentativas}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Dias estudados */}
          {dias.length > 0 && (
            <section>
              <h2 className="mb-1 text-xl font-bold">Últimos dias de estudo</h2>
              <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                {dias.length} {dias.length === 1 ? 'dia registrado' : 'dias registrados'}.
              </p>

              <div className="space-y-2">
                {dias.slice(0, 10).map((d) => {
                  const maxXp = Math.max(...dias.map((x) => x.xp_ganho), 1);
                  return (
                    <div key={d.date} className="flex items-center gap-3">
                      <span
                        className="w-24 shrink-0 font-mono text-xs tabular-nums"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {d.date.split('-').reverse().join('/')}
                      </span>
                      <div
                        className="h-2.5 flex-1 overflow-hidden rounded-full"
                        style={{ backgroundColor: 'var(--grid)' }}
                      >
                        <div
                          className="h-full rounded-r-[4px]"
                          style={{
                            width: `${Math.max((d.xp_ganho / maxXp) * 100, 1)}%`,
                            backgroundColor: 'var(--series-1)',
                          }}
                        />
                      </div>
                      <span className="w-28 shrink-0 text-right font-mono text-xs tabular-nums">
                        {d.xp_ganho} XP
                        <span className="ml-1" style={{ color: 'var(--text-secondary)' }}>
                          · {d.exercicios} ex.
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Diagnóstico */}
          {ultimoDiagnostico && (
            <section>
              <h2 className="mb-1 text-xl font-bold">Último diagnóstico</h2>
              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                <div className="text-2xl font-bold">
                  {ultimoDiagnostico.acertos} de {ultimoDiagnostico.total}
                </div>
                <div className="mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  em {new Date(ultimoDiagnostico.realizado_em + 'Z').toLocaleString('pt-BR')}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {Object.entries(
                    JSON.parse(ultimoDiagnostico.por_area) as Record<string, number>
                  ).map(([area, n]) => (
                    <div key={area} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
                      <div className="text-xs capitalize" style={{ color: 'var(--text-secondary)' }}>
                        {area}
                      </div>
                      <div className="font-mono text-lg font-bold">{n}/3</div>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Refaça o diagnóstico depois de estudar Fundamentos — o banco guarda cada execução,
                  então dá para ver a evolução preto no branco.
                </p>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-12 rounded-xl bg-gray-100 p-5 text-sm dark:bg-gray-800">
        <p style={{ color: 'var(--text-secondary)' }}>
          💾 Tudo isto sai de <code className="font-mono">data/estudo.db</code>, um SQLite no seu
          computador. Nada vai para a internet, e limpar o navegador não apaga mais nada.
        </p>
      </div>
    </div>
  );
}
