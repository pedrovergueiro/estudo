import { BadgeDefinition, UserProgress } from '@/types/gamification';

export const badges: BadgeDefinition[] = [
  {
    id: 'first-session',
    label: 'Primeira Sessão',
    description: 'Complete seu primeiro exercício',
    icon: '🚀',
    condition: (progress) => Object.keys(progress.topics).length > 0,
  },
  {
    id: 'first-exercise',
    label: 'Primeiro Exercício',
    description: 'Complete seu primeiro exercício corretamente',
    icon: '✅',
    condition: (progress) =>
      Object.values(progress.topics).some((t) => t.exercisesCompleted > 0),
  },
  {
    id: 'hundred-xp',
    label: '100 XP',
    description: 'Ganhe 100 pontos de experiência',
    icon: '⭐',
    condition: (progress) => progress.xp >= 100,
  },
  {
    id: 'three-day-streak',
    label: 'Sequência de 3 Dias',
    description: 'Mantenha uma sequência de estudo por 3 dias',
    icon: '🔥',
    condition: (progress) => progress.streak.current >= 3,
  },
  {
    id: 'topic-master',
    label: 'Mestre em um Tópico',
    description: 'Complete todos os exercícios de um tópico',
    icon: '🏆',
    condition: (progress) =>
      Object.values(progress.topics).some(
        (t) => t.status === 'mastered' || t.exercisesCompleted === t.exercisesTotal
      ),
  },
];

export function checkBadgeConditions(
  progress: UserProgress
): { unlockedBadges: string[]; newBadges: string[] } {
  const newBadges: string[] = [];
  const unlockedBadges = Object.keys(progress.badges);

  for (const badge of badges) {
    const isUnlocked = unlockedBadges.includes(badge.id);
    const meetsCondition = badge.condition(progress);

    if (!isUnlocked && meetsCondition) {
      newBadges.push(badge.id);
    }
  }

  return { unlockedBadges, newBadges };
}
