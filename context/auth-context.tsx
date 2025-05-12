'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { 
  AuthTokens, 
  UserProfile, 
  getStoredTokens, 
  isTokenValid, 
  removeStoredTokens, 
  storeTokens 
} from '@/lib/auth';

// Define Auth Context types
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Props
interface AuthProviderProps {
  children: React.ReactNode;
}

// Auth Provider Component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const tokens = getStoredTokens();
      
      if (tokens && isTokenValid(tokens.access_token)) {
        try {
          // Get user profile
          const profile = await authApi.getProfile();
          setUser(profile as UserProfile);
          setIsAuthenticated(true);
        } catch (error) {
          // If API call fails, clear tokens
          removeStoredTokens();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        // If no valid tokens, ensure user is logged out
        removeStoredTokens();
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const tokens = await authApi.login(email, password);
      storeTokens(tokens);
      
      // Get user profile
      const profile = await authApi.getProfile();
      setUser(profile as UserProfile);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Register user
      await authApi.register({ email, password, full_name: fullName });
      
      // Auto login after registration
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    removeStoredTokens();
    setUser(null);
    setIsAuthenticated(false);
    router.push('/');
  };

  // Context value
  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 