import { AuthTokens, UserProfile, getStoredTokens } from './auth';

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

// Export the generic fetch function for other API calls
export default fetchApi; 