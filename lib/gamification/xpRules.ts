export const XP_RULES = {
  EXERCISE_COMPLETED: 25,
  EXERCISE_HINT_USED: -5,
  TOPIC_COMPLETED: 50,
  TOPIC_MASTERED: 100,
  FIRST_SESSION: 10,
  STREAK_BONUS_PER_DAY: 5,
} as const;

export function calculateLevel(xp: number): number {
  // Level increases every 500 XP
  return Math.floor(xp / 500) + 1;
}

export function getXpForNextLevel(xp: number): number {
  const currentLevel = calculateLevel(xp);
  const nextLevelThreshold = currentLevel * 500;
  return nextLevelThreshold - xp;
}

export function getTotalXpForLevel(level: number): number {
  return (level - 1) * 500;
}
