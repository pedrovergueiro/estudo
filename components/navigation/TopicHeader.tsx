import { Topic } from '@/types/content';
import Link from 'next/link';

interface TopicHeaderProps {
  topic: Topic;
}

const difficultyColors = {
  1: 'text-green-600 dark:text-green-400',
  2: 'text-yellow-600 dark:text-yellow-400',
  3: 'text-red-600 dark:text-red-400',
};

const difficultyLabels = {
  1: 'Fácil',
  2: 'Médio',
  3: 'Difícil',
};

export function TopicHeader({ topic }: TopicHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
        <Link href={`/${topic.subjectId}`} className="hover:underline">
          ← Voltar
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {topic.title}
      </h1>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <span>📋</span> {topic.description}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
          ⏱️ {topic.estimatedMinutes} min
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm">
          ⭐ {topic.xpReward} XP
        </span>
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm ${difficultyColors[topic.difficulty]}`}
        >
          Dificuldade: {difficultyLabels[topic.difficulty]}
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-full text-sm">
          {topic.status === 'active' ? '✅ Disponível' : '🔜 Em breve'}
        </span>
      </div>
    </div>
  );
}
