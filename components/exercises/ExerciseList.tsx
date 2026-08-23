'use client';

import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { MatrixGrid } from '@/components/math/MatrixGrid';
import useGameificationStore from '@/lib/gamification/store';
import { toast } from 'sonner';

interface ExerciseListProps {
  exercises: Exercise[];
  topicId: string;
}

/**
 * Lista de exercícios.
 *
 * Client Component de ponta a ponta: a página do tópico (Server Component) passa
 * apenas dados serializáveis, sem callbacks — era exatamente isso que quebrava antes.
 */
export function ExerciseList({ exercises, topicId }: ExerciseListProps) {
  const solvedCount = useGameificationStore(
    (s) => s.topics[topicId]?.exercisesCompleted ?? 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg bg-gray-100 dark:bg-gray-800 px-4 py-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {exercises.length} exercícios neste tópico
        </span>
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
          {solvedCount} resolvido{solvedCount === 1 ? '' : 's'}
        </span>
      </div>

      {exercises.map((ex, i) => (
        <ExerciseItem key={ex.id} exercise={ex} number={i + 1} />
      ))}
    </div>
  );
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, '').replace(/[×,]/g, 'x');
}

function ExerciseItem({ exercise, number }: { exercise: Exercise; number: number }) {
  const [input, setInput] = useState('');
  const [choice, setChoice] = useState<number | null>(null);
  const [hintsShown, setHintsShown] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [solved, setSolved] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [wrong, setWrong] = useState(false);

  const registrarTentativa = useGameificationStore((s) => s.registrarTentativa);

  // Cada dica revelada reduz o XP: 100% → 70% → 40% → 20%
  const xpMultiplier = [1, 0.7, 0.4, 0.2][Math.min(hintsShown, 3)];
  const xpNow = Math.round(exercise.xpReward * xpMultiplier);

  const check = () => {
    let correct = false;

    if (exercise.kind === 'choice') {
      correct = choice === exercise.answer;
    } else if (exercise.kind === 'numeric') {
      const v = parseFloat(input.replace(',', '.').replace(/\./g, (m, o, s) =>
        s.indexOf('.') === s.lastIndexOf('.') ? '.' : ''
      ));
      correct = Number.isFinite(v) && Math.abs(v - Number(exercise.answer)) < 1e-6;
    } else {
      const accepted = [String(exercise.answer), ...(exercise.accept ?? [])].map(normalize);
      correct = accepted.includes(normalize(input));
    }

    setAttempts((a) => a + 1);

    // Toda tentativa vai para o banco — acertos E erros. É o que alimenta
    // a página de estatísticas ("onde eu mais erro").
    void registrarTentativa({
      exerciseId: exercise.id,
      topicId: exercise.topicId,
      correct,
      hintsUsed: hintsShown,
      xp: xpNow,
    });

    if (correct) {
      setSolved(true);
      setWrong(false);
      toast.success(`Acertou! +${xpNow} XP`);
    } else {
      setWrong(true);
      // Errou? Libera a próxima dica automaticamente — nunca deixa travado.
      if (hintsShown < exercise.hints.length) {
        setHintsShown((h) => h + 1);
        toast.error('Ainda não. Soltei uma dica pra te destravar.');
      } else {
        toast.error('Ainda não. Confira a resolução se precisar.');
      }
    }
  };

  const answered = solved || gaveUp;

  return (
    <div
      className={`rounded-xl border-2 p-5 transition-colors ${
        solved
          ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      }`}
    >
      {/* Cabeçalho */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              solved
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            {solved ? '✓' : number}
          </span>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {['', '🟢 Fácil', '🟡 Médio', '🔴 Difícil'][exercise.difficulty]}
          </span>
        </div>
        <span className="shrink-0 text-sm font-bold text-amber-600 dark:text-amber-400">
          {solved ? `+${xpNow} XP` : `${xpNow} XP`}
        </span>
      </div>

      {/* Enunciado */}
      <p className="mb-4 text-[15px] leading-relaxed text-gray-900 dark:text-gray-100">
        {exercise.prompt}
      </p>

      {exercise.matrix && (
        <div className="mb-4 flex justify-center">
          <MatrixGrid data={exercise.matrix} label={exercise.matrixLabel} />
        </div>
      )}

      {/* Entrada de resposta */}
      {exercise.kind === 'choice' ? (
        <div className="space-y-2">
          {exercise.options!.map((opt, i) => {
            const isAnswer = i === exercise.answer;
            const isPicked = choice === i;
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => {
                  setChoice(i);
                  setWrong(false);
                }}
                className={`w-full rounded-lg border-2 px-4 py-3 text-left text-sm transition ${
                  answered && isAnswer
                    ? 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40'
                    : isPicked
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                } ${answered ? 'cursor-default' : ''}`}
              >
                <span className="mr-2 font-bold text-gray-500">
                  {String.fromCharCode(97 + i)})
                </span>
                {opt}
                {answered && isAnswer && <span className="ml-2">✓</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <input
          type="text"
          value={input}
          disabled={answered}
          onChange={(e) => {
            setInput(e.target.value);
            setWrong(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && !answered && check()}
          placeholder={exercise.kind === 'numeric' ? 'Digite o número' : 'Ex: 3x4'}
          className={`w-full rounded-lg border-2 px-4 py-3 font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60 ${
            wrong ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
          }`}
        />
      )}

      {/* Dicas reveladas */}
      {hintsShown > 0 && !solved && (
        <div className="mt-4 space-y-2">
          {exercise.hints.slice(0, hintsShown).map((h, i) => (
            <div
              key={i}
              className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-3 text-sm text-blue-900 dark:text-blue-100"
            >
              <strong>Dica {i + 1}:</strong> {h}
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      {!answered && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={check}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-sm font-semibold text-white transition"
          >
            Verificar
          </button>

          {hintsShown < exercise.hints.length && (
            <button
              onClick={() => setHintsShown((h) => h + 1)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              💡 Dica ({exercise.hints.length - hintsShown} restante
              {exercise.hints.length - hintsShown === 1 ? '' : 's'})
            </button>
          )}

          {attempts >= 2 && (
            <button
              onClick={() => setGaveUp(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
            >
              Ver resolução
            </button>
          )}
        </div>
      )}

      {/* Resolução */}
      {answered && (
        <div
          className={`mt-4 rounded-lg border p-4 ${
            solved
              ? 'border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900'
              : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30'
          }`}
        >
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {solved ? '✅ Por que essa é a resposta' : '📖 Resolução'}
          </div>
          <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
            {exercise.solution}
          </p>
        </div>
      )}
    </div>
  );
}
