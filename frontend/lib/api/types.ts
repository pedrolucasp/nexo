export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName?: string;
  updatedAt: Date;
  avatarKey?: string;
  avatarURL?: string;
};

// Auth
export interface AuthResponse {
  token: string;
  user: User;
};

export interface VerifyTokenResponse {
  valid: boolean;
  userId?: number;
  email?: string;
  user: Pick<User, 'firstName' | 'lastName'>;
};

export interface SignUpPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
};

export interface ResetPasswordRequestResponse {
  message: string;
  token?: string;
};

export interface ResetPasswordResponse {
  message: string;
};

// User
export interface UserUpdatePayload extends Partial<User> {
  id: number;
}

export interface UserUpdateResponse {
  user: User
};

// Mood entries
export interface MoodComponentPayload {
  component: string;
  intensity: string;
};

export interface CreateMoodEntryPayload {
  annotation: string;
  moment: Date;
  selectedMood: string;
  anxietyLevel: number;
  energyLevel: number;
  stressLevel: number;
  moodComponents: MoodComponentPayload[]
};

export interface MoodComponent {
  id: number;
  component: string;
  intensity: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodEntry {
  id: number;
  annotation: string;
  moment: Date;
  selectedMood: string;
  anxietyLevel: number;
  energyLevel: number;
  stressLevel: number;
  moodComponents: MoodComponent[];
  createdAt: Date;
  updatedAt: Date;
}

// Generic stuff
export interface PaginatedResponse<T> {
  entries: T[];
  total: number;
  page: number;
  nextPage: number | null;
};
