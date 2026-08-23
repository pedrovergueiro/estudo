import { Simulado } from '@/types/simulado';
import { simuladoProbabilidade } from '@/content/simulados/probabilidade.simulado';
import { simuladoCalculo } from '@/content/simulados/calculo.simulado';

/** Registro central dos simulados. Para adicionar um: escreva o banco e some aqui. */
export const simulados: Simulado[] = [simuladoProbabilidade, simuladoCalculo];

export function getSimulado(id: string) {
  return simulados.find((s) => s.id === id);
}

/** Quantas questões do banco vieram da lista que o professor passou. */
export function contarDaLista(s: Simulado) {
  return s.questoes.filter((q) => q.naLista).length;
}
