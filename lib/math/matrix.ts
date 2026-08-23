import Fraction from 'fraction.js';

export type Matrix = Fraction[][];

export interface MatrixInfo {
  rows: number;
  cols: number;
}

export function createMatrix(rows: number, cols: number, fill: number = 0): Matrix {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(new Fraction(fill)));
}

export function fromArray(arr: number[][] | Fraction[][]): Matrix {
  return arr.map((row) =>
    row.map((val) => (val instanceof Fraction ? val : new Fraction(val)))
  );
}

export function getInfo(matrix: Matrix): MatrixInfo {
  return {
    rows: matrix.length,
    cols: matrix[0]?.length || 0,
  };
}

export function transpose(matrix: Matrix): Matrix {
  const info = getInfo(matrix);
  const result = createMatrix(info.cols, info.rows);

  for (let i = 0; i < info.rows; i++) {
    for (let j = 0; j < info.cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

export function add(a: Matrix, b: Matrix): Matrix {
  const infoA = getInfo(a);
  const infoB = getInfo(b);

  if (infoA.rows !== infoB.rows || infoA.cols !== infoB.cols) {
    throw new Error('Matrizes devem ter as mesmas dimensões para soma');
  }

  const result = createMatrix(infoA.rows, infoA.cols);

  for (let i = 0; i < infoA.rows; i++) {
    for (let j = 0; j < infoA.cols; j++) {
      result[i][j] = a[i][j].add(b[i][j]);
    }
  }

  return result;
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  const infoA = getInfo(a);
  const infoB = getInfo(b);

  if (infoA.rows !== infoB.rows || infoA.cols !== infoB.cols) {
    throw new Error('Matrizes devem ter as mesmas dimensões para subtração');
  }

  const result = createMatrix(infoA.rows, infoA.cols);

  for (let i = 0; i < infoA.rows; i++) {
    for (let j = 0; j < infoA.cols; j++) {
      result[i][j] = a[i][j].sub(b[i][j]);
    }
  }

  return result;
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  const infoA = getInfo(a);
  const infoB = getInfo(b);

  if (infoA.cols !== infoB.rows) {
    throw new Error(
      `Dimensões incompatíveis para multiplicação: ${infoA.rows}x${infoA.cols} * ${infoB.rows}x${infoB.cols}`
    );
  }

  const result = createMatrix(infoA.rows, infoB.cols);

  for (let i = 0; i < infoA.rows; i++) {
    for (let j = 0; j < infoB.cols; j++) {
      let sum = new Fraction(0);
      for (let k = 0; k < infoA.cols; k++) {
        sum = sum.add(a[i][k].mul(b[k][j]));
      }
      result[i][j] = sum;
    }
  }

  return result;
}

export function scalarMultiply(matrix: Matrix, scalar: number | Fraction): Matrix {
  const s = scalar instanceof Fraction ? scalar : new Fraction(scalar);
  const info = getInfo(matrix);
  const result = createMatrix(info.rows, info.cols);

  for (let i = 0; i < info.rows; i++) {
    for (let j = 0; j < info.cols; j++) {
      result[i][j] = matrix[i][j].mul(s);
    }
  }

  return result;
}

export function formatMatrix(matrix: Matrix, decimalPlaces: number = 2): string[][] {
  return matrix.map((row) =>
    row.map((val) => {
      // Fraction has a valueOf() method that returns the decimal value
      const num = typeof val.valueOf === 'function' ? val.valueOf() : Number(val);
      return Number.isFinite(num) ? num.toFixed(decimalPlaces) : val.toFraction();
    })
  );
}
