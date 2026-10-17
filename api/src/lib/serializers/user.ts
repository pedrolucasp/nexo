import { Prisma, User } from '@prisma/client';

// DB-level projection of the allow-list below — keep the two in sync.
export const publicUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  updatedAt: true,
  avatarKey: true,
  avatarURL: true,
  active: true,
  notificationsEnabled: true,
  dailyReminderTime: true,
  weeklyResumeEnabled: true,
  onboardingSeenAt: true,
} satisfies Prisma.UserSelect;

// The only shape a user leaves the API in. Everything not listed here
// (encryptedPassword, reset secrets, activation code, pushToken) stays server-side.
export const publicUser = (user: User) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  updatedAt: user.updatedAt,
  avatarKey: user.avatarKey,
  avatarURL: user.avatarURL,
  active: user.active,
  notificationsEnabled: user.notificationsEnabled,
  dailyReminderTime: user.dailyReminderTime,
  weeklyResumeEnabled: user.weeklyResumeEnabled,
  onboardingSeenAt: user.onboardingSeenAt,
});
