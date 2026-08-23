import { MatrixStep } from '@/types/steps';

/**
 * Geradores de passos.
 *
 * Cada função aqui pega uma operação matemática e devolve a LISTA de passos
 * intermediários com explicação em português. É isso que faz o site "mostrar
 * como chegou" em vez de só cuspir o resultado.
 */

type Grid = number[][];

const blank = (rows: number, cols: number): string[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => ''));

const toStr = (g: Grid): string[][] => g.map((r) => r.map((v) => String(v)));

/** Soma de matrizes, célula por célula. */
export function matrixAdditionSteps(a: Grid, b: Grid): MatrixStep[] {
  const rows = a.length;
  const cols = a[0].length;
  const result = blank(rows, cols);
  const steps: MatrixStep[] = [];

  steps.push({
    matrix: blank(rows, cols),
    operation: 'Ponto de partida',
    explanation:
      `Vamos somar duas matrizes ${rows}×${cols}. A regra é simples: soma-se cada posição com ` +
      `a MESMA posição da outra matriz. O resultado começa vazio e vamos preenchendo posição a posição.`,
    secondary: { matrix: toStr(b), label: 'Matriz B' },
  });

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i][j] = String(a[i][j] + b[i][j]);
      steps.push({
        matrix: result.map((r) => [...r]),
        operation: `c${i + 1}${j + 1} = a${i + 1}${j + 1} + b${i + 1}${j + 1}`,
        explanation:
          `Posição linha ${i + 1}, coluna ${j + 1}. Pego o valor ${a[i][j]} da matriz A e o valor ` +
          `${b[i][j]} da matriz B — os dois estão exatamente na mesma posição. Somo: ` +
          `${a[i][j]} + ${b[i][j]} = ${a[i][j] + b[i][j]}.`,
        highlight: { cells: [[i, j]] },
        secondary: { matrix: toStr(b), label: 'Matriz B', highlight: { cells: [[i, j]] } },
      });
    }
  }

  steps.push({
    matrix: result.map((r) => [...r]),
    operation: 'Resultado final',
    explanation:
      `Pronto. Percorremos todas as ${rows * cols} posições e somamos cada par. Repare que a matriz ` +
      `resultado tem exatamente as mesmas dimensões (${rows}×${cols}) das originais — na soma, as ` +
      `dimensões nunca mudam. É por isso que só dá para somar matrizes do mesmo tamanho.`,
  });

  return steps;
}

/** Multiplicação de matrizes, mostrando cada produto escalar linha×coluna. */
export function matrixMultiplicationSteps(a: Grid, b: Grid): MatrixStep[] {
  const n = a.length;
  const m = a[0].length;
  const p = b[0].length;
  const result = blank(n, p);
  const steps: MatrixStep[] = [];

  steps.push({
    matrix: blank(n, p),
    operation: 'Ponto de partida',
    explanation:
      `A é ${n}×${m} e B é ${m}×${p}. Para multiplicar, o número de COLUNAS de A (${m}) precisa ser ` +
      `igual ao número de LINHAS de B (${m}) — e é. O resultado será ${n}×${p}. ` +
      `A regra: cada posição do resultado é a LINHA de A vezes a COLUNA de B, termo a termo, somando tudo.`,
    secondary: { matrix: toStr(b), label: 'Matriz B' },
  });

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      const termos: string[] = [];
      let soma = 0;
      for (let k = 0; k < m; k++) {
        termos.push(`${a[i][k]}×${b[k][j]}`);
        soma += a[i][k] * b[k][j];
      }
      result[i][j] = String(soma);

      steps.push({
        matrix: result.map((r) => [...r]),
        operation: `c${i + 1}${j + 1} = linha ${i + 1} de A · coluna ${j + 1} de B`,
        explanation:
          `Para a posição (${i + 1}, ${j + 1}): pego a linha ${i + 1} inteira de A [${a[i].join(', ')}] ` +
          `e a coluna ${j + 1} inteira de B [${b.map((r) => r[j]).join(', ')}]. ` +
          `Multiplico o 1º com o 1º, o 2º com o 2º, e assim por diante — depois somo tudo: ` +
          `${termos.join(' + ')} = ${soma}.`,
        highlight: { cells: [[i, j]] },
        secondary: { matrix: toStr(b), label: 'Matriz B', highlight: { cols: [j] } },
      });
    }
  }

  steps.push({
    matrix: result.map((r) => [...r]),
    operation: 'Resultado final',
    explanation:
      `Resultado: matriz ${n}×${p}. Note que ela NÃO tem o tamanho de A nem de B — herdou as linhas ` +
      `de A e as colunas de B. Esse é o detalhe que mais confunde no começo: na multiplicação, ` +
      `a dimensão do meio "some".`,
  });

  return steps;
}

/** Transposta: mostra a troca de linhas por colunas, uma de cada vez. */
export function transposeSteps(a: Grid): MatrixStep[] {
  const rows = a.length;
  const cols = a[0].length;
  const result = blank(cols, rows);
  const steps: MatrixStep[] = [];

  steps.push({
    matrix: blank(cols, rows),
    operation: 'Ponto de partida',
    explanation:
      `A matriz A é ${rows}×${cols}. A transposta Aᵀ vira ${cols}×${rows} — as dimensões se invertem. ` +
      `A ideia: o que era linha vira coluna. Vamos fazer uma linha por vez para você ver acontecendo.`,
    secondary: { matrix: toStr(a), label: 'Matriz A (original)' },
  });

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = String(a[i][j]);
    }
    steps.push({
      matrix: result.map((r) => [...r]),
      operation: `Linha ${i + 1} de A → coluna ${i + 1} de Aᵀ`,
      explanation:
        `A linha ${i + 1} de A é [${a[i].join(', ')}]. Ela foi "deitada de pé" e virou a coluna ${i + 1} ` +
        `da transposta. Em notação: o elemento que estava em a${i + 1}ⱼ agora está em aⱼ${i + 1} — ` +
        `os índices simplesmente trocam de lugar.`,
      highlight: { cols: [i] },
      secondary: { matrix: toStr(a), label: 'Matriz A (original)', highlight: { rows: [i] } },
    });
  }

  steps.push({
    matrix: result.map((r) => [...r]),
    operation: 'Resultado final',
    explanation:
      `Aᵀ está pronta: ${cols}×${rows}. Um jeito de conferir se você acertou: a diagonal principal ` +
      `(canto superior esquerdo descendo) fica IGUAL na original e na transposta. Se mudou, errou em algum lugar.`,
  });

  return steps;
}
