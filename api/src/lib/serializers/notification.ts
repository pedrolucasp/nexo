import { Prisma } from '@prisma/client';

// DB-level projection of what a notification leaves the API as -- the inbox
// needs the rendered text, the moment it was meant for, its window and what it
// relates to. The owning user and the delivery timestamp stay server-side.
export const publicNotificationSelect = {
  id: true,
  kind: true,
  title: true,
  body: true,
  scheduledFor: true,
  expiresAt: true,
  regimenId: true,
  createdAt: true,
} satisfies Prisma.NotificationSelect;

export type PublicNotification = Prisma.NotificationGetPayload<{
  select: typeof publicNotificationSelect;
}>;
