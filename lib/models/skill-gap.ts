// Resource for learning or projects
export interface Resource {
  title: string;
  url: string;
  type: string;
}

// Detailed resource with additional information
export interface DetailedResource extends Resource {
  difficulty: string;
  description: string;
}

// Matching skill between resume and job requirements
export interface SkillMatch {
  skill: string;
  level: string;
  match_score: number;
  context: string;
}

// Missing or underdeveloped skill
export interface SkillGap {
  skill: string;
  importance: string;
  description: string;
  learning_resources: Resource[];
}

// Project recommendation to address skill gaps
export interface ProjectRecommendation {
  title: string;
  description: string;
  difficulty: string;
  estimated_time: string;
  skills_addressed: string[];
  resources: Resource[];
}

// Complete skill gap analysis
export interface SkillGapAnalysis {
  id?: string;
  userId?: string;
  job_title: string;
  job_description: string;
  resume_text: string;
  match_percentage: number;
  matched_skills: SkillMatch[];
  missing_skills: SkillGap[];
  project_recommendations: ProjectRecommendation[];
  improvement_suggestions: Record<string, string[]>;
  overall_assessment: string;
  createdAt?: string; 
  job_posting_url?: string;
}

// Request payload for skill gap analysis
export interface SkillGapAnalysisRequest {
  resumeFile?: File;
  resumeText?: string;
  resumeId?: string; // Added resumeId for selecting stored resumes
  jobDescription?: string;
  jobPostingUrl?: string;
  githubUrl?: string;
}

// Resume analysis result (ATS optimization)
export interface ResumeAnalysisResult {
  ats_score: number;
  keyword_match: number;
  formatting_score: number;
  content_score: number;
  suggestions: Record<string, string[]>;
  highlighted_resume: string;
}

// Learning resources for a specific skill
export interface SkillLearningResources {
  skill: string;
  resources: DetailedResource[];
} 