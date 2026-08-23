import Fraction from 'fraction.js';
import { MatrixStep } from '@/types/steps';

/**
 * Eliminação de Gauss com narração de cada operação elementar.
 *
 * Usa fração exata (fraction.js) de propósito: escalonar com float produz
 * "0.30000000000000004" na tela, o que confunde quem está aprendendo. Aqui
 * 1/3 aparece como 1/3.
 */

type Frac = InstanceType<typeof Fraction>;

const f = (n: number): Frac => new Fraction(n);

/** Formata para exibição: inteiro puro quando possível, fração caso contrário. */
function fmt(x: Frac): string {
  const s = x.toFraction(false);
  return s;
}

function render(m: Frac[][]): string[][] {
  return m.map((row) => row.map(fmt));
}

export type Classificacao = 'SPD' | 'SPI' | 'SI';

export interface ResultadoGauss {
  steps: MatrixStep[];
  classificacao: Classificacao;
  /** Solução quando SPD. */
  solucao?: string[];
  resumo: string;
}

/**
 * Escalona a matriz aumentada [A | b] e narra cada passo.
 *
 * @param a  coeficientes (n×n ou n×m)
 * @param b  termos independentes
 */
export function gaussSteps(a: number[][], b: number[]): ResultadoGauss {
  const linhas = a.length;
  const colunas = a[0].length;

  // Matriz aumentada como frações
  const M: Frac[][] = a.map((row, i) => [...row.map(f), f(b[i])]);

  const steps: MatrixStep[] = [];

  steps.push({
    matrix: render(M),
    operation: 'Matriz aumentada [A | b]',
    explanation:
      `Primeiro passo sempre: transformar o sistema numa matriz. Cada linha é uma equação, ` +
      `cada coluna é uma incógnita, e a última coluna guarda os resultados (o lado direito do "="). ` +
      `A partir daqui não escrevemos mais "x", "y", "z" — só mexemos nos números, o que reduz muito ` +
      `a chance de erro.`,
  });

  let pivoLinha = 0;

  for (let col = 0; col < colunas && pivoLinha < linhas; col++) {
    // Encontrar pivô não-nulo
    let linhaPivo = -1;
    for (let r = pivoLinha; r < linhas; r++) {
      if (!M[r][col].equals(0)) {
        linhaPivo = r;
        break;
      }
    }

    if (linhaPivo === -1) {
      // Coluna inteira zerada abaixo — variável livre
      continue;
    }

    // Trocar linhas se necessário
    if (linhaPivo !== pivoLinha) {
      [M[pivoLinha], M[linhaPivo]] = [M[linhaPivo], M[pivoLinha]];
      steps.push({
        matrix: render(M),
        operation: `L${pivoLinha + 1} ↔ L${linhaPivo + 1}`,
        explanation:
          `A posição do pivô (linha ${pivoLinha + 1}, coluna ${col + 1}) estava com zero. ` +
          `Não dá para usar zero como pivô — dividir por zero não existe. Então trocamos de lugar ` +
          `com a linha ${linhaPivo + 1}, que tem um número válido nessa coluna. ` +
          `Trocar linhas de lugar é permitido: só muda a ordem em que escrevemos as equações, ` +
          `o sistema continua o mesmo.`,
        highlight: { rows: [pivoLinha, linhaPivo] },
      });
    }

    const pivo = M[pivoLinha][col];

    // Normalizar o pivô para 1
    if (!pivo.equals(1)) {
      for (let c = 0; c < M[pivoLinha].length; c++) {
        M[pivoLinha][c] = M[pivoLinha][c].div(pivo);
      }
      steps.push({
        matrix: render(M),
        operation: `L${pivoLinha + 1} ← L${pivoLinha + 1} ÷ ${fmt(pivo)}`,
        explanation:
          `Dividimos a linha ${pivoLinha + 1} inteira por ${fmt(pivo)} para o pivô virar 1. ` +
          `Por que 1? Porque com pivô 1 as próximas contas ficam simples: para zerar o que está ` +
          `abaixo, basta subtrair um múltiplo desta linha. ` +
          `Multiplicar (ou dividir) uma equação inteira por um número não-zero não muda sua solução — ` +
          `é como dizer que 2x = 6 e x = 3 são a mesma informação.`,
        highlight: { rows: [pivoLinha], cells: [[pivoLinha, col]] },
      });
    }

    // Zerar abaixo do pivô
    for (let r = pivoLinha + 1; r < linhas; r++) {
      const fator = M[r][col];
      if (fator.equals(0)) continue;

      for (let c = 0; c < M[r].length; c++) {
        M[r][c] = M[r][c].sub(fator.mul(M[pivoLinha][c]));
      }

      steps.push({
        matrix: render(M),
        operation: `L${r + 1} ← L${r + 1} − (${fmt(fator)})·L${pivoLinha + 1}`,
        explanation:
          `Objetivo: zerar a posição (linha ${r + 1}, coluna ${col + 1}), que valia ${fmt(fator)}. ` +
          `Como o pivô da linha ${pivoLinha + 1} é 1, multiplicamos aquela linha por ${fmt(fator)} ` +
          `e subtraímos da linha ${r + 1}. O elemento da coluna ${col + 1} vira ` +
          `${fmt(fator)} − ${fmt(fator)}×1 = 0, exatamente o que queríamos. ` +
          `Os outros elementos da linha mudam junto — isso é normal e necessário.`,
        highlight: { rows: [r], cells: [[r, col]] },
      });
    }

    pivoLinha++;
  }

  // Classificação
  let classificacao: Classificacao = 'SPD';
  let postoA = 0;
  let postoAmpliada = 0;

  for (let r = 0; r < linhas; r++) {
    const temCoefNaoNulo = M[r].slice(0, colunas).some((v) => !v.equals(0));
    const termoNaoNulo = !M[r][colunas].equals(0);

    if (temCoefNaoNulo) {
      postoA++;
      postoAmpliada++;
    } else if (termoNaoNulo) {
      postoAmpliada++;
    }
  }

  let resumo: string;
  let solucao: string[] | undefined;

  if (postoA < postoAmpliada) {
    classificacao = 'SI';
    resumo =
      'Sistema IMPOSSÍVEL (SI). Apareceu uma linha do tipo "0 = número diferente de zero", ' +
      'o que é uma contradição — nenhuma escolha de valores satisfaz isso. Geometricamente, ' +
      'são retas ou planos paralelos que nunca se cruzam.';
  } else if (postoA < colunas) {
    classificacao = 'SPI';
    const grausLiberdade = colunas - postoA;
    resumo =
      `Sistema POSSÍVEL e INDETERMINADO (SPI). Sobraram menos equações úteis (${postoA}) do que ` +
      `incógnitas (${colunas}), então existem infinitas soluções, com ${grausLiberdade} ` +
      `variável(is) livre(s). Geometricamente: as equações descrevem a mesma reta/plano, ` +
      `ou se cruzam formando uma reta inteira em vez de um ponto só.`;
  } else {
    classificacao = 'SPD';

    // Retrosubstituição
    const x: Frac[] = Array(colunas).fill(f(0));
    for (let r = colunas - 1; r >= 0; r--) {
      let soma = M[r][colunas];
      for (let c = r + 1; c < colunas; c++) {
        soma = soma.sub(M[r][c].mul(x[c]));
      }
      x[r] = soma.div(M[r][r]);
    }
    solucao = x.map(fmt);

    steps.push({
      matrix: render(M),
      operation: 'Retrosubstituição',
      explanation:
        `A matriz está escalonada (formato triangular). Agora resolvemos de BAIXO para CIMA: ` +
        `a última linha tem só uma incógnita, então ela sai direto. Com esse valor em mãos, ` +
        `subimos para a linha anterior, substituímos o que já sabemos e achamos a próxima. ` +
        `Repetindo até o topo, saem todas: ` +
        solucao.map((v, i) => `x${i + 1} = ${v}`).join(', ') + '.',
    });

    resumo =
      `Sistema POSSÍVEL e DETERMINADO (SPD): solução única, ` +
      solucao.map((v, i) => `x${i + 1} = ${v}`).join(', ') +
      `. Geometricamente, as retas/planos se cruzam em exatamente um ponto.`;
  }

  steps.push({
    matrix: render(M),
    operation: `Classificação: ${classificacao}`,
    explanation: resumo,
  });

  return { steps, classificacao, solucao, resumo };
}

export interface ResultadoInversa {
  steps: MatrixStep[];
  invertivel: boolean;
  resumo: string;
}

/**
 * Inversa por Gauss-Jordan: monta [A | I] e reduz A até virar I.
 * O que sobra do lado direito é A⁻¹.
 */
export function inversaSteps(a: number[][]): ResultadoInversa {
  const n = a.length;

  // [A | I]
  const M: Frac[][] = a.map((row, i) => [
    ...row.map(f),
    ...Array.from({ length: n }, (_, j) => f(i === j ? 1 : 0)),
  ]);

  const steps: MatrixStep[] = [];

  steps.push({
    matrix: render(M),
    operation: 'Montagem: [A | I]',
    explanation:
      `A matriz inversa A⁻¹ é aquela que satisfaz A · A⁻¹ = I (a identidade). ` +
      `O método de Gauss-Jordan usa um truque elegante: colamos a identidade ao lado de A, ` +
      `formando uma matriz ${n}×${2 * n}. Depois aplicamos operações de linha até o lado ESQUERDO ` +
      `virar a identidade. Quando isso acontece, o lado DIREITO virou automaticamente a inversa. ` +
      `A ideia é que cada operação que "desmonta" A vai simultaneamente "montando" A⁻¹ do outro lado.`,
    highlight: { cols: Array.from({ length: n }, (_, i) => n + i) },
  });

  for (let col = 0; col < n; col++) {
    // Achar pivô
    let linhaPivo = -1;
    for (let r = col; r < n; r++) {
      if (!M[r][col].equals(0)) {
        linhaPivo = r;
        break;
      }
    }

    if (linhaPivo === -1) {
      steps.push({
        matrix: render(M),
        operation: 'Impossível continuar',
        explanation:
          `A coluna ${col + 1} ficou inteiramente zerada da linha ${col + 1} para baixo. ` +
          `Isso significa que uma linha de A é combinação das outras — a matriz é SINGULAR ` +
          `(determinante zero) e NÃO possui inversa. ` +
          `Nem toda matriz quadrada é invertível, assim como o número 0 não tem inverso multiplicativo.`,
      });
      return {
        steps,
        invertivel: false,
        resumo:
          'A matriz NÃO é invertível (é singular). Isso acontece quando suas linhas são ' +
          'linearmente dependentes — uma delas não traz informação nova. Equivale a determinante = 0.',
      };
    }

    if (linhaPivo !== col) {
      [M[col], M[linhaPivo]] = [M[linhaPivo], M[col]];
      steps.push({
        matrix: render(M),
        operation: `L${col + 1} ↔ L${linhaPivo + 1}`,
        explanation:
          `Precisamos de um número diferente de zero na posição do pivô (linha ${col + 1}, ` +
          `coluna ${col + 1}), e ali havia zero. Trocamos com a linha ${linhaPivo + 1}. ` +
          `Importante: a troca vale para a linha INTEIRA, incluindo o lado direito.`,
        highlight: { rows: [col, linhaPivo] },
      });
    }

    const pivo = M[col][col];
    if (!pivo.equals(1)) {
      for (let c = 0; c < 2 * n; c++) M[col][c] = M[col][c].div(pivo);
      steps.push({
        matrix: render(M),
        operation: `L${col + 1} ← L${col + 1} ÷ ${fmt(pivo)}`,
        explanation:
          `Dividimos a linha ${col + 1} por ${fmt(pivo)} para o pivô virar exatamente 1 — ` +
          `que é o valor que ele precisa ter na identidade final. ` +
          `Repare que o lado direito também é dividido: ele está registrando tudo o que fazemos.`,
        highlight: { cells: [[col, col]] },
      });
    }

    // Zerar TODA a coluna (acima e abaixo) — é isso que diferencia Jordan de Gauss puro
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const fator = M[r][col];
      if (fator.equals(0)) continue;

      for (let c = 0; c < 2 * n; c++) M[r][c] = M[r][c].sub(fator.mul(M[col][c]));

      steps.push({
        matrix: render(M),
        operation: `L${r + 1} ← L${r + 1} − (${fmt(fator)})·L${col + 1}`,
        explanation:
          `Zerando a posição (${r + 1}, ${col + 1}), que valia ${fmt(fator)}. ` +
          `Diferente do Gauss simples (que só zera ABAIXO do pivô), o Gauss-Jordan zera a coluna ` +
          `inteira — acima e abaixo. É esse trabalho extra que leva o lado esquerdo até a identidade ` +
          `perfeita, em vez de parar na forma triangular.`,
        highlight: { rows: [r], cells: [[r, col]] },
      });
    }
  }

  const inversa = M.map((row) => row.slice(n));

  steps.push({
    matrix: render(M),
    operation: 'Pronto: [I | A⁻¹]',
    explanation:
      `O lado esquerdo virou a identidade, então o lado direito é a inversa A⁻¹. ` +
      `Como conferir se acertou: multiplique A por essa matriz. Se o resultado for a identidade, ` +
      `está correto. Essa verificação é rápida e vale a pena sempre — inverter matriz na mão tem ` +
      `muitas contas e é fácil escorregar em um sinal.`,
    highlight: { cols: Array.from({ length: n }, (_, i) => n + i) },
  });

  return {
    steps,
    invertivel: true,
    resumo:
      'A matriz é invertível. A inversa é a metade direita da matriz final — ' +
      'aquela que sobrou depois que o lado esquerdo virou a identidade.',
  };
}
