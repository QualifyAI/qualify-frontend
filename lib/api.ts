import { AuthTokens, UserProfile, getStoredTokens } from './auth';
import { LearningPath, LearningPathRequest, Niche, PathQuestion } from './models/learning-path';
import { 
  SkillGapAnalysis, 
  SkillGapAnalysisRequest, 
  ResumeAnalysisResult,
  ProjectRecommendation,
  SkillLearningResources
} from './models/skill-gap';

// Resume types
export interface Resume {
  id: string;
  title: string;
  content: string;
  file_name?: string;
  is_primary: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total: number;
}

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

// Interface for update profile request
interface UpdateProfileRequest {
  full_name: string;
  // Add any other necessary fields for updating the profile
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
  } else {
    // Log authentication issues - in a real app you might want to redirect here
    console.warn(`API call to ${endpoint} attempted without authentication token`);
    
    // For endpoints that require authentication, throw an error
    if (endpoint.includes('/learning-paths/generate') || 
        endpoint.includes('/learning-paths/user') ||
        endpoint === '/auth/me' || 
        endpoint.includes('/skill-gap/')) {
      throw new Error('Authentication required. Please log in.');
    }
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle HTTP errors
    if (!response.ok) {
      let errorData;
      let errorMsg = `HTTP error! Status: ${response.status}`;
      
      try {
        errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {
        // If we can't parse JSON, use the default error message
      }
      
      // Special handling for authentication errors
      if (response.status === 401) {
        console.error('Authentication failed:', errorMsg);
        errorMsg = `Authentication failed (401): ${errorMsg}`;
      }
      
      throw new Error(errorMsg);
    }
    
    // Parse JSON response
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API Error for ${endpoint}:`, error);
    throw error;
  }
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
  
  // Update user profile
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    return fetchApi<UserProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Learning Paths API functions
export const learningPathsApi = {
  // Get all available niches
  getNiches: async (): Promise<Niche[]> => {
    return await fetchApi<Niche[]>('/learning-path/niches');
  },
  
  // Get questions for tailoring learning path based on niche
  getQuestions: async (nicheId: number, useAi: boolean = true): Promise<PathQuestion[]> => {
    return await fetchApi<PathQuestion[]>(`/learning-path/questions?nicheId=${nicheId}&use_ai=${useAi}`);
  },
  
  // Generate a learning path based on user's answers
  generatePath: async (request: LearningPathRequest): Promise<LearningPath> => {
    return await fetchApi<LearningPath>('/learning-path/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
  
  // Save a learning path to user's account
  savePath: async (path: LearningPath): Promise<LearningPath> => {
    return await fetchApi<LearningPath>('/learning-path/save', {
      method: 'POST',
      body: JSON.stringify(path),
    });
  },
  
  // Get user's saved learning paths
  getUserPaths: async (): Promise<LearningPath[]> => {
    return await fetchApi<LearningPath[]>('/learning-path/user');
  },
  
  // Get a specific learning path by ID
  getPathById: async (id: string): Promise<LearningPath> => {
    return await fetchApi<LearningPath>(`/learning-path/${id}`);
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
    
    if (data.resumeId) {
      formData.append('resume_id', data.resumeId);
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
    
    // Get the stored auth token
    const tokens = getStoredTokens();
    const authHeader = tokens?.access_token ? `Bearer ${tokens.access_token}` : '';
    
    // Make a direct fetch call instead of using fetchApi to avoid header issues with FormData
    const url = `${API_BASE_URL}/skill-gap/analyze`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader
        },
        body: formData,
      });
      
      if (!response.ok) {
        let errorMsg = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.detail || errorMsg;
        } catch (e) {
          // If we can't parse JSON, use the default error message
        }
        throw new Error(errorMsg);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error for skill gap analysis:', error);
      throw error;
    }
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

// Resume management API functions
export const resumeApi = {
  // Upload a new resume
  uploadResume: async (file: File, title: string, isPrimary: boolean = false): Promise<Resume> => {
    const formData = new FormData();
    formData.append('resume_file', file);
    formData.append('title', title);
    formData.append('is_primary', isPrimary.toString());
    
    const tokens = getStoredTokens();
    const authHeader = tokens?.access_token ? `Bearer ${tokens.access_token}` : '';
    
    const response = await fetch(`${API_BASE_URL}/resumes`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      },
      body: formData,
    });
    
    if (!response.ok) {
      let errorMsg = `HTTP error! Status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
      } catch (e) {
        // If we can't parse JSON, use the default error message
      }
      throw new Error(errorMsg);
    }
    
    return await response.json();
  },
  
  // Save resume text directly
  saveResumeText: async (title: string, content: string, isPrimary: boolean = false): Promise<Resume> => {
    return fetchApi<Resume>('/resumes/text', {
      method: 'POST',
      body: JSON.stringify({
        title,
        content,
        is_primary: isPrimary
      }),
    });
  },
  
  // Get all user's resumes
  getUserResumes: async (): Promise<ResumeListResponse> => {
    return fetchApi<ResumeListResponse>('/resumes');
  },
  
  // Get primary resume
  getPrimaryResume: async (): Promise<Resume | null> => {
    return fetchApi<Resume | null>('/resumes/primary');
  },
  
  // Get resume by ID
  getResumeById: async (id: string): Promise<Resume> => {
    return fetchApi<Resume>(`/resumes/${id}`);
  },
  
  // Update resume
  updateResume: async (id: string, data: Partial<Resume>): Promise<Resume> => {
    return fetchApi<Resume>(`/resumes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  // Set resume as primary
  setPrimaryResume: async (id: string): Promise<Resume> => {
    return fetchApi<Resume>(`/resumes/${id}/set-primary`, {
      method: 'PUT',
    });
  },
  
  // Delete resume
  deleteResume: async (id: string): Promise<void> => {
    return fetchApi<void>(`/resumes/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export the generic fetch function for other API calls
export default fetchApi; 