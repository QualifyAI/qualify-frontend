import { AuthTokens, UserProfile, getStoredTokens } from './auth';
import { LearningPath, LearningPathRequest, Niche, PathQuestion } from './models/learning-path';
import { 
  SkillGapAnalysis, 
  SkillGapAnalysisRequest, 
  ResumeAnalysisResult,
  ProjectRecommendation,
  SkillLearningResources
} from './models/skill-gap';

// Define API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Interface for login request
interface LoginRequest {
  username: string; // Uses username for OAuth2 compatibility
  password: string;
}

// Interface for registration request
interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

// Generic fetch function with authentication and error handling
async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Add default headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  // Add auth token if available
  const tokens = getStoredTokens();
  if (tokens?.access_token) {
    headers['Authorization'] = `Bearer ${tokens.access_token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  const response = await fetch(url, config);
  
  // Handle HTTP errors
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
  }
  
  // Parse JSON response
  const data = await response.json();
  return data as T;
}

// Auth API functions
export const authApi = {
  // Login endpoint
  login: async (email: string, password: string): Promise<AuthTokens> => {
    // Convert to FormData for OAuth2 compatibility with FastAPI
    const formData = new URLSearchParams();
    formData.append('username', email);  // FastAPI OAuth2 uses 'username'
    formData.append('password', password);
    
    return fetchApi<AuthTokens>('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
  },
  
  // Register endpoint
  register: async (userData: RegisterRequest): Promise<UserProfile> => {
    return fetchApi<UserProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },
  
  // Get current user profile
  getProfile: async (): Promise<UserProfile> => {
    return fetchApi<UserProfile>('/auth/me');
  },
};

// Learning Paths API functions
export const learningPathsApi = {
  // Get all available niches
  getNiches: async (): Promise<Niche[]> => {
    return fetchApi<Niche[]>('/learning-paths/niches');
  },
  
  // Get questions for tailoring learning path based on niche
  getQuestions: async (nicheId: number): Promise<PathQuestion[]> => {
    return fetchApi<PathQuestion[]>(`/learning-paths/questions?niche_id=${nicheId}`);
  },
  
  // Generate a learning path based on user's answers
  generatePath: async (request: LearningPathRequest): Promise<LearningPath> => {
    return fetchApi<LearningPath>('/learning-paths/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Save a learning path to user's account
  savePath: async (path: LearningPath): Promise<LearningPath> => {
    return fetchApi<LearningPath>('/learning-paths', {
      method: 'POST',
      body: JSON.stringify(path),
    });
  },
  
  // Get user's saved learning paths
  getUserPaths: async (): Promise<LearningPath[]> => {
    return fetchApi<LearningPath[]>('/learning-paths/user');
  },
  
  // Get a specific learning path by ID
  getPathById: async (pathId: string): Promise<LearningPath> => {
    return fetchApi<LearningPath>(`/learning-paths/${pathId}`);
  },
};

// Skill Gap Analysis API functions
export const skillGapApi = {
  // Analyze resume and job description to identify skill gaps
  analyzeSkills: async (data: SkillGapAnalysisRequest): Promise<SkillGapAnalysis> => {
    // For file uploads, we need to use FormData
    const formData = new FormData();
    
    if (data.resumeFile) {
      formData.append('resume_file', data.resumeFile);
    }
    
    if (data.resumeText) {
      formData.append('resume_text', data.resumeText);
    }
    
    if (data.githubUrl) {
      formData.append('github_url', data.githubUrl);
    }
    
    if (data.jobDescription) {
      formData.append('job_description', data.jobDescription);
    }
    
    if (data.jobPostingUrl) {
      formData.append('job_posting_url', data.jobPostingUrl);
    }
    
    return fetchApi<SkillGapAnalysis>('/skill-gap/analyze', {
      method: 'POST',
      headers: {
        // Let the browser set the appropriate Content-Type for FormData
        'Content-Type': undefined as any,
      },
      body: formData,
    });
  },
  
  // Get skill gap analysis history
  getAnalysisHistory: async (): Promise<SkillGapAnalysis[]> => {
    return fetchApi<SkillGapAnalysis[]>('/skill-gap/history');
  },
  
  // Get a specific analysis by ID
  getAnalysisById: async (analysisId: string): Promise<SkillGapAnalysis> => {
    return fetchApi<SkillGapAnalysis>(`/skill-gap/history/${analysisId}`);
  },
  
  // Generate project recommendations based on missing skills
  getProjectRecommendations: async (skills: string[]): Promise<ProjectRecommendation[]> => {
    return fetchApi<ProjectRecommendation[]>('/skill-gap/projects', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    });
  },
  
  // Get learning resources for specific skills
  getLearningResources: async (skills: string[]): Promise<SkillLearningResources[]> => {
    return fetchApi<SkillLearningResources[]>('/skill-gap/resources', {
      method: 'POST',
      body: JSON.stringify({ skills }),
    });
  },
  
  // Analyze resume for ATS optimization (part of Resume Enhancement)
  analyzeResume: async (resumeFile: File): Promise<ResumeAnalysisResult> => {
    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    
    return fetchApi<ResumeAnalysisResult>('/resume/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': undefined as any,
      },
      body: formData,
    });
  },
};

// Export the generic fetch function for other API calls
export default fetchApi; 