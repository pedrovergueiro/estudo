export interface Topic {
  id: string;
  title: string;
  slug: string;
  subjectId: string;
  blockId: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  prerequisiteTopicIds: string[];
  difficulty: 1 | 2 | 3;
  status: 'active' | 'coming-soon';
}

export interface Block {
  id: string;
  title: string;
  description: string;
  subjectId: string;
  topics: string[]; // topicIds
  deadlineId?: string;
}

export interface Subject {
  id: string;
  title: string;
  slug: string;
  color: string; // hex or tailwind class
  status: 'active' | 'planned';
  blocks: string[]; // blockIds
}

export interface Deadline {
  id: string;
  label: string;
  dueDate: string; // YYYY-MM-DD
  subjectId: string;
  requiredTopicIds: string[];
  description?: string;
}
