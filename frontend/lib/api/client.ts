import * as SecureStore from 'expo-secure-store';
import {
  User,
  AuthResponse,
  VerifyTokenResponse,
  SignUpPayload,
  ResetPasswordRequestResponse,
  ResetPasswordResponse,
  UserUpdatePayload,
  UserUpdateResponse,
  MoodComponentPayload,
  MoodEntryPayload,
  SleepRecordPayload,
  PaginatedResponse
} from '@/lib/api/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
const TOKEN_KEY = process.env.EXPO_PUBLIC_TOKEN_KEY;

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

  async getStoredAuthData(): Promise<{ token: string | null }> {
    const token = await this.getStoredToken();
    return { token };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getStoredToken();
    const isFormData = options.body instanceof FormData;

    const config: RequestInit = {
      ...options,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json()
        .catch(() => ({ error: 'Network error' }));

      console.error("[API]: ", error, response.status)

      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await this.storeToken(response.token);
    return response;
  }

  async signup(user: SignUpPayload): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/users', {
      method: 'POST',
      body: JSON.stringify({ user }),
    });

    await this.storeToken(response.token);
    return response;
  }

  async forgotPassword(email: string): Promise<ResetPasswordRequestResponse> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: password }),
    });
  }

  async verifyToken(): Promise<VerifyTokenResponse> {
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

  // User-related
  async updateUser(user: UserUpdatePayload): Promise<User> {
    return await this.request(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify({ user })
    })
  }

  async avatar(formData: FormData): Promise<User> {
    return await this.request(`/users/me/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      } as any,
    })
  }

  async removeAvatar(): Promise<void> {
    return await this.request(`/users/me/avatar`, {
      method: 'DELETE'
    });
  }

  // Mood-related
  async createMoodEntry(mood: CreateMoodEntryPayload): Promise<MoodEntryResponse> {
    return await this.request(`/moods`, {
      method: 'POST',
      body: JSON.stringify({ mood })
    })
  }

  async getMoodEntries(params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<MoodEntry>> {
    const query = new URLSearchParams();
    if (params?.from)  query.set('from', params.from);
    if (params?.to)    query.set('to', params.to);
    if (params?.page)  query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return this.request(`/moods${qs ? `?${qs}` : ''}`);
  }

  async getMoodEntry(id: string): Promise<MoodEntry> {
    return this.request(`/moods/${id}`);
  }

  async deleteMoodEntry(id: string): Promise<void> {
    return this.request(`/moods/${id}`, { method: 'DELETE' });
  }

  // Sleep Record
  async createSleepRecord(sleepRecord: CreateSleepRecordPayload): Promise<SleepRecordResponse> {
    return await this.request(`/sleep_records`, {
      method: 'POST',
      body: JSON.stringify({ sleepRecord })
    })
  }

  async getSleepRecords(params?: {
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<SleepRecord>> {
    const query = new URLSearchParams();
    if (params?.from)  query.set('from', params.from);
    if (params?.to)    query.set('to', params.to);
    if (params?.page)  query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const qs = query.toString();
    return this.request(`/sleep_records${qs ? `?${qs}` : ''}`);
  }
}

export const apiClient = new ApiClient();
