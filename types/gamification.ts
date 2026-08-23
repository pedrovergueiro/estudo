export interface TopicProgress {
  topicId: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'mastered';
  exercisesCompleted: number;
  exercisesTotal: number;
  xpEarned: number;
  lastVisitedAt: string;
}

export interface XpEvent {
  id: string;
  type: 'exercise-completed' | 'topic-completed' | 'badge-unlocked';
  xp: number;
  label: string;
  timestamp: string;
}

export interface BadgeDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress) => boolean;
}

export interface UserProgress {
  version: number;
  xp: number;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: string;
  };
  badges: Record<string, { unlockedAt: string }>;
  topics: Record<string, TopicProgress>;
  xpEvents: XpEvent[];
}
