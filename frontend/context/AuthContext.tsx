import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';
import { queryClient, storage } from '@/lib/queryClient';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateAuthUser: (user: User) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message: string; token?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  activate: (code: string) => Promise<void>;
  requestActivateCode: () => Promise<void>;
}

export function sanitizeUser(data: any): User {
  return {
    id: data.id,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    updatedAt: data.updatedAt,
    avatarKey: data.avatarKey,
    avatarURL: data.avatarURL,
    active: data.active
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { token } = await apiClient.getStoredAuthData();

      if (token) {
        const verifyResponse = await apiClient.verifyToken();
        if (verifyResponse.valid && verifyResponse.userId && verifyResponse.email) {
          // TODO: Fetch the full user profile
          // For now, we'll create a basic user object
          setUser({
            id: verifyResponse.userId,
            email: verifyResponse.email,
            ...verifyResponse.user
          });
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Token is invalid, wipe out any stored data
      await apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => {
    setIsLoading(true);
    try {
      const response = await apiClient.signup(userData);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiClient.logout();

      setUser(null);
      // Clear both the in-memory cache and the persisted MMKV cache
      queryClient.clear();
      storage.clearAll();
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    return apiClient.forgotPassword(email);
  };

  const resetPassword = async (token: string, password: string) => {
    await apiClient.resetPassword(token, password);
  };

  const activate = async (code: number) => {
    const response = await apiClient.activate(code);

    if (response.user) {
      setUser(response.user)
    }

    return response
  }

  const requestActivateCode = async() => {
    await apiClient.requestActivateCode();
  }

  const updateAuthUser = (user) => {
    setUser(user);
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateAuthUser,
    activate,
    requestActivateCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
