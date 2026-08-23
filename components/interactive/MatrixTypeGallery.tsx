'use client';

import React, { useState } from 'react';
import { MatrixGrid } from '@/components/math/MatrixGrid';

interface TipoMatriz {
  id: string;
  nome: string;
  data: (string | number)[][];
  highlight?: { cells?: [number, number][]; rows?: number[]; cols?: number[] };
  comoReconhecer: string;
  ondeAparece: string;
}

const TIPOS: TipoMatriz[] = [
  {
    id: 'quadrada',
    nome: 'Quadrada',
    data: [
      [2, 7, 1],
      [9, 4, 3],
      [5, 8, 6],
    ],
    comoReconhecer:
      'Conte as linhas e as colunas. Se der o mesmo número, é quadrada. Aqui: 3 linhas, 3 colunas → quadrada 3×3.',
    ondeAparece:
      'É o tipo mais importante do curso. Determinante, matriz inversa e autovalores só existem para matrizes quadradas.',
  },
  {
    id: 'identidade',
    nome: 'Identidade (I)',
    data: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    highlight: { cells: [[0, 0], [1, 1], [2, 2]] },
    comoReconhecer:
      'Quadrada, com 1 em toda a diagonal principal (destacada) e 0 em todo o resto. Sem exceção.',
    ondeAparece:
      'É o "número 1" das matrizes: multiplicar qualquer matriz por I não muda nada (A · I = A). Aparece o tempo todo ao calcular inversas.',
  },
  {
    id: 'nula',
    nome: 'Nula (0)',
    data: [
      [0, 0, 0],
      [0, 0, 0],
    ],
    comoReconhecer: 'Todos os elementos são zero. Pode ter qualquer dimensão, não precisa ser quadrada.',
    ondeAparece:
      'É o "número 0" das matrizes: somar a matriz nula não muda nada (A + 0 = A). Aparece como resultado quando um sistema não tem solução não-trivial.',
  },
  {
    id: 'diagonal',
    nome: 'Diagonal',
    data: [
      [4, 0, 0],
      [0, 7, 0],
      [0, 0, 2],
    ],
    highlight: { cells: [[0, 0], [1, 1], [2, 2]] },
    comoReconhecer:
      'Quadrada, com números na diagonal principal e ZERO em todo o resto. Os valores da diagonal podem ser quaisquer (aqui 4, 7, 2).',
    ondeAparece:
      'É a matriz mais fácil de trabalhar: multiplicar, inverter e elevar a potências fica trivial. Boa parte da Álgebra Linear avançada consiste em transformar matrizes complicadas em diagonais.',
  },
  {
    id: 'triangular-sup',
    nome: 'Triangular superior',
    data: [
      [3, 5, 1],
      [0, 6, 8],
      [0, 0, 2],
    ],
    highlight: { cells: [[1, 0], [2, 0], [2, 1]] },
    comoReconhecer:
      'Tudo ABAIXO da diagonal principal é zero (destacado). Acima da diagonal, qualquer coisa. Forma um "triângulo" de números no canto superior.',
    ondeAparece:
      'É exatamente o formato que a eliminação de Gauss produz. Quando você escalona um sistema, o objetivo é chegar nesta forma — aí a solução sai de trás para frente.',
  },
  {
    id: 'triangular-inf',
    nome: 'Triangular inferior',
    data: [
      [3, 0, 0],
      [5, 6, 0],
      [1, 8, 2],
    ],
    highlight: { cells: [[0, 1], [0, 2], [1, 2]] },
    comoReconhecer: 'O espelho da anterior: tudo ACIMA da diagonal principal é zero (destacado).',
    ondeAparece:
      'Aparece na decomposição LU (L de "lower"), um método usado por computadores para resolver sistemas grandes de forma eficiente.',
  },
  {
    id: 'linha',
    nome: 'Linha',
    data: [[8, 3, 5, 1]],
    comoReconhecer: 'Uma única linha. Dimensão 1 × n.',
    ondeAparece:
      'É um vetor deitado. Em IA, o embedding de uma palavra costuma ser exatamente isso: uma matriz linha com centenas de números.',
  },
  {
    id: 'coluna',
    nome: 'Coluna',
    data: [[8], [3], [5]],
    comoReconhecer: 'Uma única coluna. Dimensão m × 1.',
    ondeAparece:
      'É o formato padrão de vetor em Álgebra Linear. Quando você escreve um sistema como A·x = b, tanto x quanto b são matrizes coluna.',
  },
];

/**
 * Galeria de tipos de matriz.
 *
 * Em vez de listar 8 definições em texto corrido (que ninguém com TDAH lê até
 * o fim), o aluno troca de aba e vê o padrão destacado na própria matriz.
 */
export function MatrixTypeGallery() {
  const [ativo, setAtivo] = useState(TIPOS[0].id);
  const tipo = TIPOS.find((t) => t.id === ativo)!;

  return (
    <div className="my-8 rounded-xl border-2 border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/30 overflow-hidden">
      <div className="bg-purple-100 dark:bg-purple-900/50 px-5 py-3">
        <h4 className="font-bold text-purple-900 dark:text-purple-100">
          🗂️ Os tipos que você precisa reconhecer de bate-pronto
        </h4>
      </div>

      <div className="p-5 space-y-5">
        {/* Abas */}
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.id}
              onClick={() => setAtivo(t.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                t.id === ativo
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
              }`}
            >
              {t.nome}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <MatrixGrid data={tipo.data} highlight={tipo.highlight} />
          </div>

          <div className="flex-1 space-y-3">
            <div className="rounded-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 p-4">
              <div className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
                Como reconhecer
              </div>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{tipo.comoReconhecer}</p>
            </div>

            <div className="rounded-lg bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800 p-4">
              <div className="text-xs font-semibold uppercase text-purple-700 dark:text-purple-300">
                Por que isso importa
              </div>
              <p className="mt-1 text-sm text-gray-800 dark:text-gray-200">{tipo.ondeAparece}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
