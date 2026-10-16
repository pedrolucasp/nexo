import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiClient, User } from "@/lib/api";
import { queryClient, storage } from "@/lib/queryClient";
import { AuthStatus, deriveStatus } from "@/context/authRouting";

interface AuthProviderProps {
  children: React.ReactNode;
}

interface SignUpInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
  acceptedTerms: boolean;
}

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  updateAuthUser: (user: User) => void;
  login: (email: string, password: string) => Promise<{ user: User } | null>;
  signup: (userData: SignUpInput) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean }>;
  resetPassword: (token: string, password: string) => Promise<void>;
  activate: (code: string) => Promise<void>;
  requestActivateCode: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
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
  const status = deriveStatus(isLoading, user);

  const logout = useCallback(async () => {
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
  }, []);

  const checkAuthState = useCallback(async () => {
    const doAuthCheck = async () => {
      const { token } = await apiClient.getStoredAuthData();
      if (token) {
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
  }, []);

  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]);

  useEffect(() => {
    apiClient.registerUnauthorizedHandler(logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.login(email, password);

    if (response.user) {
      setUser(response.user);
    }

    return response;
  }, []);

  const signup = useCallback(async (userData: SignUpInput) => {
    const response = await apiClient.signup(userData);

    if (response.user) {
      setUser(response.user);
    }
  }, []);

  const forgotPassword = useCallback(
    (email: string) => apiClient.forgotPassword(email),
    [],
  );

  const resetPassword = useCallback(async (token: string, password: string) => {
    await apiClient.resetPassword(token, password);
  }, []);

  const activate = useCallback(async (code: string) => {
    const response = await apiClient.activate(code);
    setUser(response.user);
  }, []);

  const requestActivateCode = useCallback(
    () => apiClient.requestActivateCode(),
    [],
  );

  const completeOnboarding = useCallback(async () => {
    const { user } = await apiClient.completeOnboarding();
    setUser(user);
  }, []);

  const updateAuthUser = useCallback((user: User) => {
    setUser(user);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      status,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      updateAuthUser,
      activate,
      requestActivateCode,
      completeOnboarding,
    }),
    [
      user,
      status,
      isLoading,
      login,
      signup,
      logout,
      forgotPassword,
      resetPassword,
      updateAuthUser,
      activate,
      requestActivateCode,
      completeOnboarding,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
