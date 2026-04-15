import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const TOKEN_KEY = process.env.EXPO_PUBLIC_TOKEN_KEY; // Gary B.B Coleman fucking slaps

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

class ApiClient {
  private async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  private async storeToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } catch (error) {
      console.error('Failed to store token:', error);
      throw error;
    }
  }

  private async removeToken(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to remove token:', error);
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getStoredToken();

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await this.storeToken(response.token);
    return response;
  }

  async signup(userData: {
    first_name: string;
    last_name?: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    await this.storeToken(response.token);
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string; token?: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async verifyToken(): Promise<{ valid: boolean; userId?: number; email?: string }> {
    try {
      return await this.request('/auth/verify');
    } catch (error) {
      // Token is invalid or expired
      await this.removeToken();
      throw error;
    }
  }

  async logout(): Promise<void> {
    await this.removeToken();
  }

  async getStoredAuthData(): Promise<{ token: string | null }> {
    const token = await this.getStoredToken();
    return { token };
  }
}

export const apiClient = new ApiClient();
