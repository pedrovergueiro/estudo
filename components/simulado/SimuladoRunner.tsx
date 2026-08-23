'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { QuestaoSimulado, Simulado } from '@/types/simulado';

type Modo = 'prova' | 'treino';

/**
 * Leituras possíveis do que a pessoa digitou.
 *
 * Aceita "0,4", "0.4", "1/12", "  12 " e o formato brasileiro com ponto de
 * milhar ("16.777.216"). Um ponto sozinho é genuinamente ambíguo — "14.400"
 * pode ser catorze mil e quatrocentos ou catorze vírgula quatro —, então nesse
 * caso devolvemos as DUAS leituras e a correção aceita qualquer uma que bata.
 */
export function candidatos(txt: string): number[] {
  const limpo = txt.trim().replace(/\s/g, '');
  if (!limpo) return [];

  const lerSimples = (s: string): number[] => {
    if (s.includes(',')) return [Number(s.replace(/\./g, '').replace(',', '.'))];
    const pontos = (s.match(/\./g) ?? []).length;
    if (pontos >= 2) return [Number(s.replace(/\./g, ''))];
    if (pontos === 1) return [Number(s), Number(s.replace('.', ''))];
    return [Number(s)];
  };

  const fracao = limpo.match(/^(-?[\d.,]+)\/([\d.,]+)$/);
  const brutos = fracao
    ? lerSimples(fracao[1]).flatMap((n) =>
        lerSimples(fracao[2]).map((d) => (d === 0 ? NaN : n / d)),
      )
    : lerSimples(limpo);

  return brutos.filter((v) => Number.isFinite(v));
}

export function acertou(q: QuestaoSimulado, resposta: string): boolean {
  if (resposta === '') return false;
  if (q.kind === 'choice') return Number(resposta) === q.answer;

  /* Resposta inteira exige acerto exato: uma tolerância relativa de 0,5% sobre
     3.628.800 aceitaria erro de 18 mil, o que não é acerto nenhum. */
  const margem = Number.isInteger(q.answer)
    ? 1e-9
    : Math.max(Math.abs(q.answer) * (q.tolerancia ?? 0.005), 1e-9);

  return candidatos(resposta).some((v) => Math.abs(v - q.answer) <= margem);
}

/** Sorteio: as questões da lista do professor entram primeiro, depois o resto. */
function sortear(questoes: QuestaoSimulado[], n: number): QuestaoSimulado[] {
  const embaralhar = (arr: QuestaoSimulado[]) => {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const daLista = embaralhar(questoes.filter((q) => q.naLista));
  const resto = embaralhar(questoes.filter((q) => !q.naLista));
  return [...daLista, ...resto].slice(0, n);
}

const mmss = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

function Tabela({ t }: { t: NonNullable<QuestaoSimulado['tabela']> }) {
  return (
    <div className="my-4 overflow-x-auto">
      {t.titulo && (
        <div className="mb-1 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          {t.titulo}
        </div>
      )}
      <table className="mx-auto text-sm tabular-nums">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-600">
            {t.cabecalho.map((c, i) => (
              <th
                key={i}
                className={`px-4 py-1.5 font-medium text-gray-600 dark:text-gray-400 ${
                  i === 0 ? 'text-left' : 'text-right'
                }`}
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {t.linhas.map((linha, i) => (
            <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
              {linha.map((celula, j) => (
                <td
                  key={j}
                  className={`px-4 py-1.5 ${
                    j === 0
                      ? 'text-left font-medium text-gray-900 dark:text-gray-100'
                      : 'text-right font-mono text-gray-800 dark:text-gray-200'
                  }`}
                >
                  {celula}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * O motor do simulado: sorteia as questões, cronometra, corrige e revisa.
 *
 * Recebe só dados serializáveis (o Simulado é objeto puro), então a página
 * continua sendo Server Component.
 */
export function SimuladoRunner({ simulado }: { simulado: Simulado }) {
  const [modo, setModo] = useState<Modo>('prova');
  const [questoes, setQuestoes] = useState<QuestaoSimulado[] | null>(null);
  const [atual, setAtual] = useState(0);
  const [respostas, setRespostas] = useState<string[]>([]);
  const [conferida, setConferida] = useState(false);
  const [entregue, setEntregue] = useState(false);
  const [restante, setRestante] = useState(simulado.minutos * 60);

  /** Acabou por entrega manual ou porque o cronômetro zerou. */
  const finalizado = entregue || restante <= 0;

  const totalDaLista = simulado.questoes.filter((q) => q.naLista).length;

  const iniciar = useCallback(() => {
    const sorteadas = sortear(simulado.questoes, simulado.quantidade);
    setQuestoes(sorteadas);
    setRespostas(Array(sorteadas.length).fill(''));
    setAtual(0);
    setConferida(false);
    setEntregue(false);
    setRestante(simulado.minutos * 60);
  }, [simulado]);

  useEffect(() => {
    if (!questoes || finalizado) return;
    const t = setTimeout(() => setRestante((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [questoes, finalizado, restante]);

  const acertos = useMemo(
    () => (questoes ? questoes.filter((q, i) => acertou(q, respostas[i])).length : 0),
    [questoes, respostas],
  );

  /* ---------- tela inicial ---------- */
  if (!questoes) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {simulado.quantidade} questões · {simulado.minutos} minutos
          </h2>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            O sorteio prioriza os <strong>{totalDaLista} exercícios que o professor já cobrou na
            lista</strong> — são os candidatos mais prováveis para a prova. O restante do banco entra
            para completar as {simulado.quantidade}.
          </p>

          <div className="mt-5">
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
              Como você quer fazer
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setModo('prova')}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  modo === 'prova'
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                }`}
              >
                <div className="font-bold text-gray-900 dark:text-gray-100">🎯 Modo prova</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Responde tudo primeiro, corrige no fim. É como vai ser no dia.
                </div>
              </button>
              <button
                onClick={() => setModo('treino')}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  modo === 'treino'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                }`}
              >
                <div className="font-bold text-gray-900 dark:text-gray-100">🔧 Modo treino</div>
                <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Corrige na hora, com a resolução completa antes de seguir.
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={iniciar}
            className={`mt-5 w-full rounded-lg bg-gradient-to-r ${simulado.cor} px-6 py-3 text-lg font-bold text-white shadow hover:opacity-90`}
          >
            Começar →
          </button>
        </div>
      </div>
    );
  }

  const q = questoes[atual];
  const resposta = respostas[atual];
  const certa = acertou(q, resposta);
  const ultima = atual === questoes.length - 1;

  const responder = (v: string) =>
    setRespostas((r) => r.map((x, i) => (i === atual ? v : x)));

  const avancar = () => {
    if (modo === 'treino' && !conferida && resposta !== '') {
      setConferida(true);
      return;
    }
    setConferida(false);
    if (ultima) setEntregue(true);
    else setAtual((a) => a + 1);
  };

  /* ---------- resultado ---------- */
  if (finalizado) {
    const pct = Math.round((acertos / questoes.length) * 100);
    const gastos = simulado.minutos * 60 - restante;
    return (
      <div className="space-y-6">
        <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-center">
          <div className="text-5xl font-bold text-gray-900 dark:text-gray-100">
            {acertos}/{questoes.length}
          </div>
          <div
            className={`mt-1 text-lg font-bold ${
              pct >= 70
                ? 'text-emerald-600 dark:text-emerald-400'
                : pct >= 50
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-red-600 dark:text-red-400'
            }`}
          >
            {pct}% de acerto
          </div>
          <div className="mt-1 text-sm text-gray-500">
            Tempo usado: {mmss(gastos)} de {simulado.minutos}:00
            {restante <= 0 && ' — o tempo acabou'}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={iniciar}
              className={`rounded-lg bg-gradient-to-r ${simulado.cor} px-5 py-2 font-bold text-white hover:opacity-90`}
            >
              ↺ Sortear outras {simulado.quantidade}
            </button>
            <Link
              href={`/${simulado.subjectSlug}`}
              className="rounded-lg border-2 border-gray-200 dark:border-gray-700 px-5 py-2 font-medium text-gray-700 dark:text-gray-300 hover:border-gray-400"
            >
              Revisar as aulas →
            </Link>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Revisão questão a questão</h3>

        {questoes.map((qq, i) => {
          const ok = acertou(qq, respostas[i]);
          const marcada =
            qq.kind === 'choice'
              ? respostas[i] === ''
                ? '(em branco)'
                : (qq.options?.[Number(respostas[i])] ?? '?')
              : respostas[i] === ''
                ? '(em branco)'
                : respostas[i];
          const correta =
            qq.kind === 'choice' ? (qq.options?.[qq.answer] ?? '?') : String(qq.answer).replace('.', ',');

          return (
            <div
              key={qq.id}
              className={`rounded-xl border-2 p-5 ${
                ok
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20'
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold">{ok ? '✅' : '❌'}</span>
                <span className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 font-mono font-bold text-gray-700 dark:text-gray-300">
                  {qq.fonte}
                </span>
                <span className="text-gray-500">{qq.capitulo}</span>
                {qq.naLista && (
                  <span className="rounded bg-amber-200 dark:bg-amber-900 px-2 py-0.5 font-bold text-amber-900 dark:text-amber-100">
                    na lista do professor
                  </span>
                )}
              </div>

              <p className="text-[15px] text-gray-800 dark:text-gray-200">{qq.prompt}</p>
              {qq.tabela && <Tabela t={qq.tabela} />}

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-white dark:bg-gray-900 p-2 text-sm">
                  <span className="text-gray-500">Você marcou: </span>
                  <span className="font-mono font-bold text-gray-900 dark:text-gray-100">{marcada}</span>
                </div>
                <div className="rounded-lg bg-white dark:bg-gray-900 p-2 text-sm">
                  <span className="text-gray-500">Resposta: </span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {correta}
                  </span>
                </div>
              </div>

              <div className="mt-3 rounded-lg bg-white dark:bg-gray-900 p-4 text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                {qq.solucao}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---------- questão ---------- */
  return (
    <div className="space-y-4">
      {/* Barra de topo */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Questão {atual + 1} de {questoes.length}
        </div>
        <div
          className={`rounded-lg px-3 py-1 font-mono text-sm font-bold ${
            restante < 300
              ? 'bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
        >
          ⏱ {mmss(restante)}
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
        <div
          className={`h-2 bg-gradient-to-r ${simulado.cor} transition-all`}
          style={{ width: `${((atual + 1) / questoes.length) * 100}%` }}
        />
      </div>

      <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded bg-gray-200 dark:bg-gray-700 px-2 py-0.5 font-mono font-bold text-gray-700 dark:text-gray-300">
            {q.fonte}
          </span>
          <span className="text-gray-500">{q.assunto}</span>
          {q.naLista && (
            <span className="rounded bg-amber-200 dark:bg-amber-900 px-2 py-0.5 font-bold text-amber-900 dark:text-amber-100">
              na lista
            </span>
          )}
        </div>

        <p className="text-[17px] leading-relaxed text-gray-900 dark:text-gray-100">{q.prompt}</p>

        {q.tabela && <Tabela t={q.tabela} />}

        {q.kind === 'choice' ? (
          <div className="mt-5 space-y-2">
            {q.options?.map((opt, i) => (
              <button
                key={i}
                disabled={conferida}
                onClick={() => responder(String(i))}
                className={`block w-full rounded-lg border-2 p-3 text-left transition-colors ${
                  resposta === String(i)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                } ${conferida ? 'cursor-default' : ''}`}
              >
                <span className="mr-2 font-mono font-bold text-gray-500">
                  {String.fromCharCode(97 + i)})
                </span>
                <span className="text-gray-800 dark:text-gray-200">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
              Sua resposta {q.formato && <span className="normal-case">— {q.formato}</span>}
            </label>
            <input
              type="text"
              inputMode="decimal"
              disabled={conferida}
              value={resposta}
              onChange={(e) => responder(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && resposta !== '' && avancar()}
              placeholder="digite o valor"
              className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-transparent px-4 py-3 font-mono text-lg text-gray-900 dark:text-gray-100 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              Aceita vírgula ou ponto, e também fração (ex: 1/12).
            </p>
          </div>
        )}

        {/* Correção imediata — só no modo treino */}
        {conferida && (
          <div
            className={`mt-5 rounded-lg border-2 p-4 ${
              certa
                ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40'
                : 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/40'
            }`}
          >
            <div
              className={`mb-2 font-bold ${
                certa
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-red-800 dark:text-red-200'
              }`}
            >
              {certa ? '✅ Certo!' : '❌ Não é essa.'}{' '}
              {!certa && (
                <span className="font-mono">
                  Resposta:{' '}
                  {q.kind === 'choice'
                    ? q.options?.[q.answer]
                    : String(q.answer).replace('.', ',')}
                </span>
              )}
            </div>
            <div className="text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
              {q.solucao}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setConferida(false);
              setAtual((a) => Math.max(0, a - 1));
            }}
            disabled={atual === 0}
            className="rounded-lg border-2 border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 disabled:opacity-30"
          >
            ← Anterior
          </button>

          <div className="flex gap-2">
            {modo === 'prova' && !ultima && (
              <button
                onClick={() => setAtual((a) => a + 1)}
                className="rounded-lg border-2 border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                Pular
              </button>
            )}
            <button
              onClick={avancar}
              disabled={resposta === '' && !conferida}
              className={`rounded-lg bg-gradient-to-r ${simulado.cor} px-5 py-2 font-bold text-white disabled:opacity-40`}
            >
              {modo === 'treino' && !conferida
                ? 'Conferir'
                : ultima
                  ? 'Finalizar e corrigir'
                  : 'Próxima →'}
            </button>
          </div>
        </div>
      </div>

      {/* Mapa das questões */}
      <div className="flex flex-wrap gap-1.5">
        {questoes.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setConferida(false);
              setAtual(i);
            }}
            className={`h-8 w-8 rounded text-xs font-bold transition-colors ${
              i === atual
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : respostas[i] !== ''
                  ? 'bg-indigo-200 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        onClick={() => setEntregue(true)}
        className="text-sm text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
      >
        Entregar agora e ver o resultado
      </button>
    </div>
  );
}
