/**
 * Um "passo" de uma resolução matemática.
 *
 * Tudo aqui é serializável (só string/number/array) de propósito: assim um
 * Server Component consegue gerar os passos e passar para o componente
 * interativo no cliente sem quebrar a fronteira RSC.
 */
export interface MatrixStep {
  /** Estado da matriz DEPOIS que este passo foi aplicado. */
  matrix: string[][];
  /** O que foi feito, em notação curta. Ex: "L2 ← L2 − 4·L1" */
  operation: string;
  /** A narrativa: POR QUE e COMO chegamos aqui. É o coração pedagógico. */
  explanation: string;
  /** Células/linhas/colunas para destacar visualmente neste passo. */
  highlight?: {
    rows?: number[];
    cols?: number[];
    cells?: [number, number][];
  };
  /** Matriz secundária mostrada ao lado (ex: a segunda matriz da soma). */
  secondary?: {
    matrix: string[][];
    label: string;
    highlight?: { cells?: [number, number][]; rows?: number[]; cols?: number[] };
  };
}
