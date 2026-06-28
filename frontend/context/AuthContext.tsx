import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient, User } from "@/lib/api";
import { queryClient, storage } from "@/lib/queryClient";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  updateAuthUser: (user: User) => void;
  login: (email: string, password: string) => Promise<{ user: User } | null>;
  signup: (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (
    email: string,
  ) => Promise<{ message: string; token?: string }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  activate: (code: number) => Promise<void>;
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
    active: data.active,
    notificationsEnabled: data.notificationsEnabled,
    dailyReminderTime: data.dailyReminderTime,
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    checkAuthState();
  }, []);

  useEffect(() => {
    apiClient.registerUnauthorizedHandler(() => {
      logout();
    });
  }, []);

  const checkAuthState = async () => {
    const doAuthCheck = async () => {
      const { token } = await apiClient.getStoredAuthData();
      if (token) {
        await apiClient.verifyToken();
        const { user } = await apiClient.getMe();
        setUser(user);
      }
    };

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Auth check timed out")), 10_000),
    );

    try {
      await Promise.race([doAuthCheck(), timeout]);
    } catch (error) {
      console.error("Auth check failed:", error);
      await apiClient.logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
  ): Promise<{ user: User } | null> => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.user) {
        setUser(response.user);
      }

      return response;
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
    setUser(response.user);
  };

  const requestActivateCode = async () => {
    await apiClient.requestActivateCode();
  };

  const updateAuthUser = (user: User) => {
    setUser(user);
  };

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
    requestActivateCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
