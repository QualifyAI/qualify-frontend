// Learning path related interfaces

// Industry niche
export interface Niche {
  id: number;
  name: string;
  icon: string;
  description: string;
}

// Questions to tailor the learning path
export interface PathQuestion {
  id: string;
  label: string;
  options: string[];
}

// Resource in a learning module
export interface LearningResource {
  id?: string;
  type: string;
  name: string;
  link: string;
  rating?: number;
  description?: string;
  isFree?: boolean;
  estimatedTime?: string;
}

// Subtopic within a learning module
export interface LearningSubtopic {
  title: string;
  description: string;
  resources?: LearningResource[];
}

// Learning module in a path
export interface LearningModule {
  id: number;
  title: string;
  timeline: string;
  difficulty: string;
  description: string;
  topics: string[];
  resources: LearningResource[];
  tips: string;
  subtopics?: LearningSubtopic[];
  prerequisites?: string[];
  learningObjectives?: string[];
  projects?: string[];
  completed?: boolean;
  progress?: number;
}

// Complete learning path
export interface LearningPath {
  id?: string;
  title: string;
  description: string;
  estimatedTime: string;
  modules: LearningModule[];
  niche: string;
  overview?: string;
  prerequisites?: string[];
  intendedAudience?: string;
  careerOutcomes?: string[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request to generate a learning path
export interface LearningPathRequest {
  nicheId: number;
  customNiche?: string;
  answers: Record<string, string>;
}
