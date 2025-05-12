// Skill Gap Analysis related interfaces

// Basic skill interface
export interface Skill {
  name: string;
  category: string;
  relevance: number;
}

// Missing skill with additional properties
export interface MissingSkill extends Skill {
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

// Skills to emphasize with recommendation
export interface EmphasisSkill extends Skill {
  recommendation: string;
}

// Learning resource for a skill
export interface SkillResource {
  type: string;
  name: string;
  link: string;
  provider: string;
  rating: number;
  description?: string;
}

// Skill-specific learning resources
export interface SkillLearningResources {
  skill: string;
  resources: SkillResource[];
}

// Project recommendation
export interface ProjectRecommendation {
  title: string;
  skills: string[];
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeEstimate: string;
}

// Complete skill gap analysis result
export interface SkillGapAnalysis {
  matchedSkills: Skill[];
  missingSkills: MissingSkill[];
  emphasizeSkills: EmphasisSkill[];
  projectRecommendations: ProjectRecommendation[];
  keywordSuggestions: string[];
  learningResources: SkillLearningResources[];
  jobFitScore: number;
  industry: string;
  role: string;
  analysisId?: string;
  createdAt?: string;
}

// Request payload for skill gap analysis
export interface SkillGapAnalysisRequest {
  resumeFile?: File;
  resumeText?: string;
  githubUrl?: string;
  jobDescription?: string;
  jobPostingUrl?: string;
}

// Resume analysis result (for future integration with resume enhancement)
export interface ResumeAnalysisResult {
  atsScore: number;
  contentFeedback: {
    strengths: string[];
    weaknesses: string[];
  };
  structureFeedback: {
    sections: {
      name: string;
      score: number;
      feedback: string;
    }[];
  };
  recommendations: string[];
} 