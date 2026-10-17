import { Notification, NotificationKind } from "@prisma/client";
import { endOfDay } from "date-fns";

import { prisma } from "@app/lib/prisma";
import { APP_TIMEZONE } from "@app/lib/appTime";
import { logger } from "@app/lib/logger";
import { sendPushNotification } from "@app/lib/sendPushNotification";

export type CreateNotificationInput = {
  userId: number;
  kind: NotificationKind;
  title: string;
  body: string;
  scheduledFor: Date;
  regimenId?: number | null;
};

const endOfAppDay = (scheduledFor: Date): Date =>
  endOfDay(scheduledFor, { in: APP_TIMEZONE });

// The only place a kind's behaviour is described: how long it stays relevant,
// and where tapping it should lead
type NotificationRule = {
  expiresAt: (scheduledFor: Date) => Date | null;
  screen?: string;
};

const notificationRules: Record<NotificationKind, NotificationRule> = {
  [NotificationKind.DAILY_REMINDER]: {
    expiresAt: endOfAppDay,
    screen: "moods",
  },
  [NotificationKind.MEDICINE_REMINDER]: {
    expiresAt: endOfAppDay,
    screen: "medicine-regimens",
  },
  [NotificationKind.INSIGHT_ALERT]: {
    expiresAt: () => null,
  },
};

export const createNotification = async (
  input: CreateNotificationInput
): Promise<Notification | null> => {
  const { userId, kind, title, body, scheduledFor, regimenId = null } = input;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true, pushEnabled: true },
  });

  if (!user) {
    logger.warn({ userId, kind }, "[notification] user not found, skipping");

    return null;
  }

  const rule = notificationRules[kind];

  const notification = await prisma.notification.create({
    data: {
      userId,
      kind,
      title,
      body,
      scheduledFor,
      regimenId,
      expiresAt: rule.expiresAt(scheduledFor),
    },
  });

  if (!user.pushEnabled || !user.pushToken) {
    logger.info(
      { notificationId: notification.id, userId, kind },
      "[notification] stored without push"
    );

    return notification;
  }

  const data = {
    ...(rule.screen ? { screen: rule.screen } : {}),
    ...(regimenId !== null ? { regimenId } : {}),
  };

  try {
    await sendPushNotification({
      token: user.pushToken,
      title,
      body,
      data,
    });
  } catch (error) {
    logger.error(
      { notificationId: notification.id, userId, err: error },
      "[notification] push failed"
    );

    return notification;
  }

  logger.info(
    { notificationId: notification.id, userId, kind },
    "[notification] push sent"
  );

  return prisma.notification.update({
    where: { id: notification.id },
    data: { pushedAt: new Date() },
  });
};
