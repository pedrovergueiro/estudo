import React from 'react';
import { DiagnosticoLesson } from '@/content/fundamentos/DiagnosticoLesson';
import { FracoesLesson } from '@/content/fundamentos/FracoesLesson';
import { SinaisLesson } from '@/content/fundamentos/SinaisLesson';
import { PotenciasLesson } from '@/content/fundamentos/PotenciasLesson';
import { EquacoesLesson } from '@/content/fundamentos/EquacoesLesson';
import { MatrizesLesson } from '@/content/algebra-linear/MatrizesLesson';
import { OperacoesLesson } from '@/content/algebra-linear/OperacoesLesson';
import { SistemasLesson } from '@/content/algebra-linear/SistemasLesson';
import { InversaoLesson } from '@/content/algebra-linear/InversaoLesson';
import { VetoresLesson } from '@/content/algebra-linear/VetoresLesson';
import { NormaLesson } from '@/content/algebra-linear/NormaLesson';
import { ProjecoesLesson } from '@/content/algebra-linear/ProjecoesLesson';
import { CossenoLesson } from '@/content/algebra-linear/CossenoLesson';
import { RetasPlanosLesson } from '@/content/algebra-linear/RetasPlanosLesson';
import { EspacosLesson } from '@/content/algebra-linear/EspacosLesson';
import { CombinacaoLesson } from '@/content/algebra-linear/CombinacaoLesson';
import { BaseLesson } from '@/content/algebra-linear/BaseLesson';
import { CoordenadasLesson } from '@/content/algebra-linear/CoordenadasLesson';
import { EscalonadaLesson } from '@/content/algebra-linear/EscalonadaLesson';
import { DeterminantesLesson } from '@/content/algebra-linear/DeterminantesLesson';
import { PropriedadesDetLesson } from '@/content/algebra-linear/PropriedadesDetLesson';
import { ProdutoVetorialLesson } from '@/content/algebra-linear/ProdutoVetorialLesson';
import { ProdutoInternoRnLesson } from '@/content/algebra-linear/ProdutoInternoRnLesson';
import { FuncoesLesson } from '@/content/calculo-a/FuncoesLesson';
import { DominioLesson } from '@/content/calculo-a/DominioLesson';
import { InequacoesLesson } from '@/content/calculo-a/InequacoesLesson';
import { SimplificacaoLesson } from '@/content/calculo-a/SimplificacaoLesson';
import { GraficosLesson } from '@/content/calculo-a/GraficosLesson';
import { TangenteVelocidadeLesson } from '@/content/calculo-a/TangenteVelocidadeLesson';
import { LimiteIntuitivoLesson } from '@/content/calculo-a/LimiteIntuitivoLesson';
import { PropriedadesLimitesLesson } from '@/content/calculo-a/PropriedadesLimitesLesson';
import { LimitesAlgebricosLesson } from '@/content/calculo-a/LimitesAlgebricosLesson';
import { EpsilonDeltaLesson } from '@/content/calculo-a/EpsilonDeltaLesson';
import { ContinuidadeLesson } from '@/content/calculo-a/ContinuidadeLesson';
import { LimitesInfinitoLesson } from '@/content/calculo-a/LimitesInfinitoLesson';
import { AssintotasLesson } from '@/content/calculo-a/AssintotasLesson';
import { CentroLesson } from '@/content/probabilidade/CentroLesson';
import { VariabilidadeLesson } from '@/content/probabilidade/VariabilidadeLesson';
import { GraficosDadosLesson } from '@/content/probabilidade/GraficosDadosLesson';
import { TiposEstudoLesson } from '@/content/probabilidade/TiposEstudoLesson';
import { EspacoAmostralLesson } from '@/content/probabilidade/EspacoAmostralLesson';
import { ContagemLesson } from '@/content/probabilidade/ContagemLesson';
import { RegrasAditivasLesson } from '@/content/probabilidade/RegrasAditivasLesson';
import { CondicionalLesson } from '@/content/probabilidade/CondicionalLesson';
import { BayesLesson } from '@/content/probabilidade/BayesLesson';
import { VariaveisAleatoriasLesson } from '@/content/probabilidade/VariaveisAleatoriasLesson';
import { EsperancaLesson } from '@/content/probabilidade/EsperancaLesson';
import { UniformeDiscretaLesson } from '@/content/probabilidade/UniformeDiscretaLesson';
import { BinomialLesson } from '@/content/probabilidade/BinomialLesson';
import { GeometricaLesson } from '@/content/probabilidade/GeometricaLesson';
import { BinomialNegativaLesson } from '@/content/probabilidade/BinomialNegativaLesson';
import { HipergeometricaLesson } from '@/content/probabilidade/HipergeometricaLesson';
import { PoissonLesson } from '@/content/probabilidade/PoissonLesson';
import { NormalLesson } from '@/content/probabilidade/NormalLesson';
import { ComplexidadeLesson } from '@/content/estrutura-dados/ComplexidadeLesson';

/**
 * Registro central de aulas.
 *
 * Para adicionar um tópico novo: escreva o componente da aula e registre aqui.
 * Nenhuma rota ou outro arquivo precisa mudar.
 */
const LESSONS: Record<string, React.ReactNode> = {
  // Fundamentos
  'fund-diagnostico': <DiagnosticoLesson />,
  'fund-fracoes': <FracoesLesson />,
  'fund-sinais': <SinaisLesson />,
  'fund-potencias': <PotenciasLesson />,
  'fund-equacoes': <EquacoesLesson />,

  // Álgebra Linear
  'al-matrizes-def': <MatrizesLesson />,
  'al-matrizes-operacoes': <OperacoesLesson />,
  'al-sistemas-lineares': <SistemasLesson />,
  'al-inversao-matrizes': <InversaoLesson />,
  'al-vetores-def': <VetoresLesson />,
  'al-norma-produto-escalar': <NormaLesson />,
  'al-ortogonalidade-projecoes': <ProjecoesLesson />,
  'al-similaridade-cosseno': <CossenoLesson />,
  'al-retas-planos': <RetasPlanosLesson />,
  'al-espacos-vetoriais': <EspacosLesson />,
  'al-combinacao-linear': <CombinacaoLesson />,
  'al-base-dimensao': <BaseLesson />,
  'al-coordenadas': <CoordenadasLesson />,
  'al-escalonada': <EscalonadaLesson />,
  'al-determinantes': <DeterminantesLesson />,
  'al-determinante-propriedades': <PropriedadesDetLesson />,
  'al-produto-vetorial': <ProdutoVetorialLesson />,
  'al-produto-interno-rn': <ProdutoInternoRnLesson />,

  // Cálculo A — Nivelamento
  'cal-funcoes-avaliacao': <FuncoesLesson />,
  'cal-dominio': <DominioLesson />,
  'cal-inequacoes': <InequacoesLesson />,
  'cal-simplificacao': <SimplificacaoLesson />,
  'cal-graficos': <GraficosLesson />,

  // Cálculo A — Limites
  'cal-tangente-velocidade': <TangenteVelocidadeLesson />,
  'cal-limite-intuitivo': <LimiteIntuitivoLesson />,
  'cal-propriedades-limites': <PropriedadesLimitesLesson />,
  'cal-limites-algebricos': <LimitesAlgebricosLesson />,
  'cal-continuidade': <ContinuidadeLesson />,
  'cal-limites-infinito': <LimitesInfinitoLesson />,
  'cal-assintotas': <AssintotasLesson />,
  'cal-epsilon-delta': <EpsilonDeltaLesson />,

  // Probabilidade e Estatística — Cap. 1
  'pe-centro': <CentroLesson />,
  'pe-variabilidade': <VariabilidadeLesson />,
  'pe-graficos': <GraficosDadosLesson />,
  'pe-tipos-estudo': <TiposEstudoLesson />,

  // Probabilidade e Estatística — Cap. 2
  'pe-espaco-amostral': <EspacoAmostralLesson />,
  'pe-contagem': <ContagemLesson />,
  'pe-regras-aditivas': <RegrasAditivasLesson />,
  'pe-condicional': <CondicionalLesson />,
  'pe-bayes': <BayesLesson />,

  // Probabilidade e Estatística — Cap. 3 e 4
  'pe-variaveis-aleatorias': <VariaveisAleatoriasLesson />,
  'pe-esperanca': <EsperancaLesson />,

  // Probabilidade e Estatística — Cap. 5 e 6
  'pe-uniforme-discreta': <UniformeDiscretaLesson />,
  'pe-binomial': <BinomialLesson />,
  'pe-geometrica': <GeometricaLesson />,
  'pe-binomial-negativa': <BinomialNegativaLesson />,
  'pe-hipergeometrica': <HipergeometricaLesson />,
  'pe-poisson': <PoissonLesson />,
  'pe-normal': <NormalLesson />,

  // Estrutura de Dados e Análise de Algoritmos
  'ed-complexidade-bigo': <ComplexidadeLesson />,
};

export function getLesson(topicId: string): React.ReactNode | null {
  return LESSONS[topicId] ?? null;
}
