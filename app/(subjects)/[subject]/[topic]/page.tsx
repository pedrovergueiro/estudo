import { notFound } from 'next/navigation';
import { topics, getSubject } from '@/lib/content/registry';
import { TopicHeader } from '@/components/navigation/TopicHeader';
import { TopicTabs } from '@/components/navigation/TopicTabs';
import { getLesson } from '@/content/lessons';
import { getExercises } from '@/content/exercises';

interface TopicPageProps {
  params: Promise<{ subject: string; topic: string }>;
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { subject, topic } = await params;

  const subjectData = getSubject(subject);
  const currentTopic = topics.find((t) => t.slug === topic && t.subjectId === subject);

  if (!subjectData || !currentTopic) {
    notFound();
  }

  const lesson = getLesson(currentTopic.id);
  const exercises = getExercises(currentTopic.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <TopicHeader topic={currentTopic} />
      <TopicTabs topicId={currentTopic.id} exercises={exercises} lesson={lesson} />
    </div>
  );
}

export async function generateMetadata({ params }: TopicPageProps) {
  const { subject, topic } = await params;
  const currentTopic = topics.find((t) => t.slug === topic && t.subjectId === subject);

  return {
    title: currentTopic ? `${currentTopic.title} — Estudo de Matemática` : 'Tópico',
    description: currentTopic?.description ?? '',
  };
}
