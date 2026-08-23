import { Deadline } from '@/types/content';

export const deadlines: Deadline[] = [
  {
    id: 'cal-lista1-deadline',
    label: 'Lista 1 — Limites (Stewart Vol. 1, seções 2.1 a 2.4)',
    dueDate: '2026-08-21',
    subjectId: 'calculo-a',
    description:
      '2.1: ex. 1,3,5,7,9 · 2.2: ex. 1,3,5,9,11,15,21,27,31,39,41,47 · 2.3: ex. 1,3,5,9,11,17,23,29,33,41,47,51,63 · 2.4: ex. 1,3,9,11,17,25,31,35,37,43. Entrega no SIGAA, pode ser em dupla.',
    requiredTopicIds: [
      'cal-tangente-velocidade',
      'cal-limite-intuitivo',
      'cal-propriedades-limites',
      'cal-limites-algebricos',
      'cal-epsilon-delta',
    ],
  },
  {
    id: 'pe-lista1-deadline',
    label: 'Lista 1 — Estatística descritiva (Walpole, Cap. 1)',
    dueDate: '2026-08-12',
    subjectId: 'probabilidade-estatistica',
    description:
      'Exercícios 1.3, 1.5, 1.7, 1.9, 1.11, 1.13, 1.15, 1.25, 1.27 e 1.29. Entrega no SIGAA, pode ser em dupla.',
    requiredTopicIds: ['pe-centro', 'pe-variabilidade', 'pe-graficos', 'pe-tipos-estudo'],
  },
  {
    id: 'al-at1',
    label: 'Avaliação Teórica 1 — GAAL',
    dueDate: '2026-09-24',
    subjectId: 'algebra-linear',
    description:
      'Matrizes, sistemas lineares, inversão e determinantes. Aula pré-avaliação em 22/09.',
    requiredTopicIds: [
      'al-matrizes-def',
      'al-matrizes-operacoes',
      'al-sistemas-lineares',
      'al-escalonada',
      'al-inversao-matrizes',
      'al-determinantes',
      'al-determinante-propriedades',
    ],
  },
  {
    id: 'al-at2',
    label: 'Avaliação Teórica 2 — GAAL',
    dueDate: '2026-11-03',
    subjectId: 'algebra-linear',
    description:
      'Vetores, produtos, projeção, retas, planos, ângulos e distâncias. Aula pré-avaliação em 29/10.',
    requiredTopicIds: [
      'al-vetores-def',
      'al-norma-produto-escalar',
      'al-ortogonalidade-projecoes',
      'al-produto-vetorial',
      'al-retas-planos',
    ],
  },
  {
    id: 'al-at3',
    label: 'Avaliação Teórica 3 — GAAL',
    dueDate: '2026-11-26',
    subjectId: 'algebra-linear',
    description:
      'Rⁿ, combinação linear, independência, subespaços, base, dimensão, produto interno, bases ortonormais e mudança de coordenadas. Aula pré-avaliação em 24/11.',
    requiredTopicIds: [
      'al-espacos-vetoriais',
      'al-combinacao-linear',
      'al-base-dimensao',
      'al-produto-interno-rn',
      'al-coordenadas',
    ],
  },
  {
    id: 'al-part1-deadline',
    label: 'Parte 1: Matrizes e Sistemas Lineares',
    dueDate: '2026-09-17',
    subjectId: 'algebra-linear',
    description: 'Entrega da Parte 1 do Projeto Integrador',
    requiredTopicIds: [
      'al-matrizes-def',
      'al-matrizes-operacoes',
      'al-sistemas-lineares',
      'al-inversao-matrizes',
    ],
  },
  {
    id: 'al-app1-deadline',
    label: 'Aplicação 1: Vetores e Similaridade',
    dueDate: '2026-11-05',
    subjectId: 'algebra-linear',
    description: 'Entrega da Aplicação 1 do Projeto Integrador',
    requiredTopicIds: [
      'al-vetores-def',
      'al-norma-produto-escalar',
      'al-ortogonalidade-projecoes',
      'al-similaridade-cosseno',
    ],
  },
  {
    id: 'al-prop-final-deadline',
    label: 'Proposta do Projeto Final',
    dueDate: '2026-11-19',
    subjectId: 'algebra-linear',
    description: 'Apresentar proposta do Projeto Final para aprovação',
    requiredTopicIds: [
      'al-retas-planos',
      'al-espacos-vetoriais',
      'al-combinacao-linear',
    ],
  },
  {
    id: 'al-final-deadline',
    label: 'Projeto Final: Espaços Vetoriais',
    dueDate: '2026-12-08',
    subjectId: 'algebra-linear',
    description: 'Entrega do Projeto Final do Projeto Integrador',
    requiredTopicIds: [
      'al-retas-planos',
      'al-espacos-vetoriais',
      'al-combinacao-linear',
      'al-base-dimensao',
      'al-coordenadas',
    ],
  },
];

export function getDeadlineById(id: string) {
  return deadlines.find((d) => d.id === id);
}

export function getDeadlinesBySubject(subjectId: string) {
  return deadlines.filter((d) => d.subjectId === subjectId);
}

export function getUpcomingDeadlines() {
  const today = new Date().toISOString().split('T')[0];
  return deadlines
    .filter((d) => d.dueDate >= today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
}

export function getNearestDeadline() {
  return getUpcomingDeadlines()[0];
}
