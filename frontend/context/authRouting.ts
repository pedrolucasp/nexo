import { type Href } from 'expo-router';
import { User } from '@/lib/api';

export type AuthStatus =
  | 'loading'
  | 'signedOut'
  | 'awaitingActivation'
  | 'active';

// The single source of truth for "where does this account belong". Everything
// that routes on auth state reads this instead of re-deriving it from
// `user.active` and ad-hoc booleans.
export function deriveStatus(isLoading: boolean, user: User | null): AuthStatus {
  if (isLoading) return 'loading';
  if (!user) return 'signedOut';
  if (!user.active) return 'awaitingActivation';
  return 'active';
}

// `null` means "still loading — show a spinner, do not navigate".
export function routeForStatus(
  status: AuthStatus,
  user: User | null,
): Href | null {
  switch (status) {
    case 'loading':
      return null;
    case 'signedOut':
      return '/auth/login';
    case 'awaitingActivation':
      return '/auth/activate';
    case 'active':
      return user?.onboardingSeenAt ? '/(tabs)/new' : '/onboarding';
  }
}
