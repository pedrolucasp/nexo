import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, User } from '@/lib/api';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateAuthUser: (user: {
    firstName: string;
    lastName?: string;
    email: string;
    updatedAt: date;
  }) => void;
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

  console.log("user & auth", isAuthenticated, user)
  const isAuthenticated = !!user;
  console.log("after user & auth", isAuthenticated, user)

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const { token } = await apiClient.getStoredAuthData();
      console.log("We have a token?", token);

      if (token) {
        const verifyResponse = await apiClient.verifyToken();
        console.log("Checking response: ", verifyResponse)
        if (verifyResponse.valid && verifyResponse.userId && verifyResponse.email) {
          // TODO: Fetch the full user profile
          // For now, we'll create a basic user object
          setUser({
            id: verifyResponse.userId,
            email: verifyResponse.email,
            firstName: verifyResponse.user.firstName,
            lastName: verifyResponse.user.lastName,
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
    updateAuthUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
