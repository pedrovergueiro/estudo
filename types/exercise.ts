export type ExerciseKind = 'numeric' | 'choice' | 'text';

export interface Exercise {
  id: string;
  topicId: string;
  kind: ExerciseKind;
  /** Enunciado. */
  prompt: string;
  /** Matriz opcional exibida junto do enunciado. */
  matrix?: (string | number)[][];
  matrixLabel?: string;
  /** Alternativas — só para kind: 'choice'. */
  options?: string[];
  /** Resposta: índice da alternativa, número, ou texto aceito. */
  answer: number | string;
  /** Variações de texto aceitas (ex: "3x4", "3 x 4", "3×4"). */
  accept?: string[];
  /** Dicas em ordem crescente de entrega. Cada uma revelada custa XP. */
  hints: string[];
  /** Explicação completa, mostrada depois de acertar ou desistir. */
  solution: string;
  xpReward: number;
  difficulty: 1 | 2 | 3;
}
