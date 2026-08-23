import { Exercise } from '@/types/exercise';
import { complexidadeExercises } from '@/content/estrutura-dados/complexidade.exercises';
import {
  fracoesExercises,
  sinaisExercises,
  potenciasExercises,
  equacoesExercises,
} from '@/content/fundamentos/fundamentos.exercises';
import { matrizesExercises } from '@/content/algebra-linear/matrizes.exercises';
import { operacoesExercises } from '@/content/algebra-linear/operacoes.exercises';
import { sistemasExercises } from '@/content/algebra-linear/sistemas.exercises';
import { inversaoExercises } from '@/content/algebra-linear/inversao.exercises';
import { vetoresExercises } from '@/content/algebra-linear/vetores.exercises';
import { normaExercises } from '@/content/algebra-linear/norma.exercises';
import { projecoesExercises } from '@/content/algebra-linear/projecoes.exercises';
import { cossenoExercises } from '@/content/algebra-linear/cosseno.exercises';
import {
  retasPlanosExercises,
  espacosExercises,
  combinacaoExercises,
  baseExercises,
  coordenadasExercises,
} from '@/content/algebra-linear/projetofinal.exercises';
import {
  escalonadaExercises,
  determinantesExercises,
  propriedadesDetExercises,
} from '@/content/algebra-linear/determinantes.exercises';
import {
  produtoVetorialExercises,
  produtoInternoRnExercises,
} from '@/content/algebra-linear/produtos.exercises';
import {
  funcoesExercises,
  dominioExercises,
  inequacoesExercises,
  simplificacaoExercises,
  graficosExercises,
} from '@/content/calculo-a/nivelamento.exercises';
import {
  limiteIntuitivoExercises,
  limitesAlgebricosExercises,
  continuidadeExercises,
  limitesInfinitoExercises,
  assintotasExercises,
} from '@/content/calculo-a/limites.exercises';
import {
  propriedadesLimitesExercises,
  epsilonDeltaExercises,
} from '@/content/calculo-a/formalizacao.exercises';
import { tangenteVelocidadeExercises } from '@/content/calculo-a/tangente.exercises';
import {
  centroExercises,
  variabilidadeExercises,
  graficosDadosExercises,
  tiposEstudoExercises,
} from '@/content/probabilidade/descritiva.exercises';
import {
  espacoAmostralExercises,
  contagemExercises,
  regrasAditivasExercises,
  condicionalExercises,
  bayesExercises,
} from '@/content/probabilidade/probabilidade.exercises';
import {
  variaveisAleatoriasExercises,
  esperancaExercises,
  uniformeDiscretaExercises,
  binomialExercises,
  geometricaExercises,
  binomialNegativaExercises,
  hipergeometricaExercises,
  poissonExercises,
  normalExercises,
} from '@/content/probabilidade/distribuicoes.exercises';

/**
 * Registro central de exercícios, por topicId.
 * Mesma lógica do registro de aulas: adicionar tópico = adicionar uma linha aqui.
 */
const EXERCISES: Record<string, Exercise[]> = {
  // Fundamentos
  'fund-fracoes': fracoesExercises,
  'fund-sinais': sinaisExercises,
  'fund-potencias': potenciasExercises,
  'fund-equacoes': equacoesExercises,

  // Álgebra Linear
  'al-matrizes-def': matrizesExercises,
  'al-matrizes-operacoes': operacoesExercises,
  'al-sistemas-lineares': sistemasExercises,
  'al-inversao-matrizes': inversaoExercises,
  'al-vetores-def': vetoresExercises,
  'al-norma-produto-escalar': normaExercises,
  'al-ortogonalidade-projecoes': projecoesExercises,
  'al-similaridade-cosseno': cossenoExercises,
  'al-retas-planos': retasPlanosExercises,
  'al-espacos-vetoriais': espacosExercises,
  'al-combinacao-linear': combinacaoExercises,
  'al-base-dimensao': baseExercises,
  'al-coordenadas': coordenadasExercises,
  'al-escalonada': escalonadaExercises,
  'al-determinantes': determinantesExercises,
  'al-determinante-propriedades': propriedadesDetExercises,
  'al-produto-vetorial': produtoVetorialExercises,
  'al-produto-interno-rn': produtoInternoRnExercises,

  // Cálculo A — Nivelamento
  'cal-funcoes-avaliacao': funcoesExercises,
  'cal-dominio': dominioExercises,
  'cal-inequacoes': inequacoesExercises,
  'cal-simplificacao': simplificacaoExercises,
  'cal-graficos': graficosExercises,

  // Cálculo A — Limites
  'cal-tangente-velocidade': tangenteVelocidadeExercises,
  'cal-limite-intuitivo': limiteIntuitivoExercises,
  'cal-propriedades-limites': propriedadesLimitesExercises,
  'cal-limites-algebricos': limitesAlgebricosExercises,
  'cal-continuidade': continuidadeExercises,
  'cal-limites-infinito': limitesInfinitoExercises,
  'cal-assintotas': assintotasExercises,
  'cal-epsilon-delta': epsilonDeltaExercises,

  // Probabilidade e Estatística — Cap. 1
  'pe-centro': centroExercises,
  'pe-variabilidade': variabilidadeExercises,
  'pe-graficos': graficosDadosExercises,
  'pe-tipos-estudo': tiposEstudoExercises,

  // Probabilidade e Estatística — Cap. 2
  'pe-espaco-amostral': espacoAmostralExercises,
  'pe-contagem': contagemExercises,
  'pe-regras-aditivas': regrasAditivasExercises,
  'pe-condicional': condicionalExercises,
  'pe-bayes': bayesExercises,

  // Probabilidade e Estatística — Cap. 3 e 4
  'pe-variaveis-aleatorias': variaveisAleatoriasExercises,
  'pe-esperanca': esperancaExercises,

  // Probabilidade e Estatística — Cap. 5 e 6
  'pe-uniforme-discreta': uniformeDiscretaExercises,
  'pe-binomial': binomialExercises,
  'pe-geometrica': geometricaExercises,
  'pe-binomial-negativa': binomialNegativaExercises,
  'pe-hipergeometrica': hipergeometricaExercises,
  'pe-poisson': poissonExercises,
  'pe-normal': normalExercises,

  // Estrutura de Dados e Análise de Algoritmos
  'ed-complexidade-bigo': complexidadeExercises,
};

export function getExercises(topicId: string): Exercise[] {
  return EXERCISES[topicId] ?? [];
}
