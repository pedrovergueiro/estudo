import { notFound } from 'next/navigation';
import { getSubject, getBlocksBySubject, getTopicsByBlock } from '@/lib/content/registry';
import Link from 'next/link';

interface SubjectPageProps {
  params: Promise<{
    subject: string;
  }>;
}

export default async function SubjectPage({ params }: SubjectPageProps) {
  const { subject } = await params;
  const subjectData = getSubject(subject);

  if (!subjectData) {
    notFound();
  }

  const blocks = getBlocksBySubject(subjectData.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline text-sm mb-4 inline-block">
          ← Voltar para Home
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {subjectData.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore os tópicos e complete os exercícios para ganhar XP
        </p>
      </div>

      {/* Blocks and Topics */}
      <div className="space-y-8">
        {blocks.map((block, blockIndex) => {
          const topicsInBlock = getTopicsByBlock(block.id);

          return (
            <div
              key={block.id}
              className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {blockIndex + 1}. {block.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{block.description}</p>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {topicsInBlock.map((topic) => {
                  const isActive = topic.status === 'active';

                  return isActive ? (
                    <Link
                      key={topic.id}
                      href={`/${subjectData.slug}/${topic.slug}`}
                      className="group p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md transition-all bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          {topic.title}
                        </h3>
                        <span className="text-lg">✅</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {topic.description}
                      </p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded">
                          ⏱️ {topic.estimatedMinutes}m
                        </span>
                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded">
                          ⭐ {topic.xpReward} XP
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            topic.difficulty === 1
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                              : topic.difficulty === 2
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {topic.difficulty === 1
                            ? '🟢 Fácil'
                            : topic.difficulty === 2
                            ? '🟡 Médio'
                            : '🔴 Difícil'}
                        </span>
                      </div>
                    </Link>
                  ) : (
                    <div
                      key={topic.id}
                      className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 opacity-60 cursor-not-allowed"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-600 dark:text-gray-400">
                          {topic.title}
                        </h3>
                        <span className="text-lg">🔜</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                        {topic.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">Em breve</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: SubjectPageProps) {
  const { subject } = await params;
  const subjectData = getSubject(subject);

  return {
    title: subjectData?.title || 'Disciplina',
    description: `Estude ${subjectData?.title} com exercícios interativos e ganhe XP`,
  };
}
