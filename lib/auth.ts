import { jwtDecode } from 'jwt-decode';

// Types
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

// Auth storage helpers
export const storeTokens = (tokens: AuthTokens): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }
};

export const getStoredTokens = (): AuthTokens | null => {
  if (typeof window !== 'undefined') {
    const tokensString = localStorage.getItem('auth_tokens');
    if (tokensString) {
      try {
        return JSON.parse(tokensString);
      } catch (e) {
        console.error('Failed to parse stored tokens', e);
      }
    }
  }
  return null;
};

export const removeStoredTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_tokens');
  }
};

// Check if token is valid and not expired
export const isTokenValid = (token: string | undefined | null): boolean => {
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    // Check if token is expired
    const currentTime = Date.now() / 1000;
    return decoded.exp ? decoded.exp > currentTime : false;
  } catch (error) {
    return false;
  }
};

// Get user from token
export const getUserFromToken = (token: string): UserProfile | null => {
  try {
    const decoded = jwtDecode<{ sub: string }>(token);
    // We only get the subject from the token, not the full user profile
    // For a real app, you might want to fetch the user profile from the API
    return {
      id: decoded.sub,
      email: '',  // This would be retrieved from the API in a real app
      full_name: '',
      is_active: true,
      created_at: '',
      updated_at: ''
    };
  } catch (error) {
    return null;
  }
}; 