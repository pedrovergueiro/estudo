/**
 * Operações com vetores.
 *
 * Tudo em número comum (não fração): aqui a norma envolve raiz quadrada, então
 * fração exata não ajudaria — o que importa é arredondar bonito na hora de exibir.
 */

export type Vec = number[];

export const add = (a: Vec, b: Vec): Vec => a.map((v, i) => v + b[i]);
export const sub = (a: Vec, b: Vec): Vec => a.map((v, i) => v - b[i]);
export const scale = (a: Vec, k: number): Vec => a.map((v) => v * k);

/** Produto escalar (produto interno): soma dos produtos componente a componente. */
export const dot = (a: Vec, b: Vec): number => a.reduce((s, v, i) => s + v * b[i], 0);

/** Norma (comprimento) do vetor: raiz da soma dos quadrados. */
export const norm = (a: Vec): number => Math.sqrt(dot(a, a));

/** Ângulo entre dois vetores, em graus. */
export function angleDeg(a: Vec, b: Vec): number {
  const denom = norm(a) * norm(b);
  if (denom === 0) return 0;
  // clamp evita NaN por erro de ponto flutuante quando o cos dá 1.0000000002
  const c = Math.max(-1, Math.min(1, dot(a, b) / denom));
  return (Math.acos(c) * 180) / Math.PI;
}

/** Similaridade do cosseno: vai de -1 (opostos) a 1 (mesma direção). */
export function cosineSimilarity(a: Vec, b: Vec): number {
  const denom = norm(a) * norm(b);
  if (denom === 0) return 0;
  return dot(a, b) / denom;
}

/** Projeção ortogonal de a sobre b (o "vetor sombra"). */
export function projection(a: Vec, b: Vec): Vec {
  const bb = dot(b, b);
  if (bb === 0) return b.map(() => 0);
  return scale(b, dot(a, b) / bb);
}

export const isOrthogonal = (a: Vec, b: Vec): boolean => Math.abs(dot(a, b)) < 1e-9;

/** Arredonda para exibir sem poluir a tela com casas decimais infinitas. */
export const r = (x: number, casas = 2): number =>
  Math.round(x * 10 ** casas) / 10 ** casas;
