/** Tipos do modo Simulado — treino cronometrado com questões tiradas do livro. */

export interface TabelaQuestao {
  /** Rótulo que fica acima da tabela (ex: "resistência a choque"). */
  titulo?: string;
  cabecalho: string[];
  linhas: (string | number)[][];
}

export interface QuestaoSimulado {
  id: string;
  /** Citação da origem, ex: "Montgomery 2-49" ou "Stewart 2.3". */
  fonte: string;
  /** Capítulo/seção do livro, usado para filtrar. */
  capitulo: string;
  /** Assunto curto, mostrado na revisão. */
  assunto: string;
  /** true quando o exercício está na lista que o professor passou. */
  naLista: boolean;
  kind: 'numeric' | 'choice';
  prompt: string;
  tabela?: TabelaQuestao;
  options?: string[];
  /** Índice da alternativa (choice) ou valor numérico (numeric). */
  answer: number;
  /** Tolerância relativa para respostas numéricas. Padrão: 0,5%. */
  tolerancia?: number;
  /** Unidade ou formato esperado, mostrado como dica de preenchimento. */
  formato?: string;
  solucao: string;
}

export interface Simulado {
  id: string;
  titulo: string;
  materia: string;
  /** Slug da disciplina no registro, para linkar de volta às aulas. */
  subjectSlug: string;
  livro: string;
  /** O que a lista do professor confirma. */
  escopoConfirmado: string;
  /** O que o professor falou, mas a lista não confirma. */
  escopoDeclarado?: string;
  /** Quantas questões o simulado sorteia. */
  quantidade: number;
  /** Minutos sugeridos para a prova inteira. */
  minutos: number;
  cor: string;
  questoes: QuestaoSimulado[];
}
