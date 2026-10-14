import { Job } from "bullmq";
import { prisma } from "@app/lib/prisma";
import { sendPushNotification } from "@app/lib/sendPushNotification";
import { DailyReminderPayload } from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";

export async function dailyReminderProcessor(job: Job): Promise<void> {
  const { userId } = job.data as DailyReminderPayload;

  logger.info({ jobId: job.id, userId }, "[daily-reminder] job started");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true, notificationsEnabled: true },
  });

  if (!user) {
    logger.warn({ userId }, "[daily-reminder] user not found, skipping");

    return;
  }

  if (!user.notificationsEnabled) {
    logger.warn({ userId }, "[daily-reminder] notifications disabled, skipping");

    return;
  }

  if (!user.pushToken) {
    logger.warn({ userId }, "[daily-reminder] no pushToken, skipping");

    return;
  }

  // TODO: These should be a side-effect from a new entry on the notifications
  // table
  await sendPushNotification({
    token: user.pushToken,
    title: "Como você está?",
    body: "Registre seu humor para acompanhar sua saúde.",
    data: { screen: "moods" },
  });

  logger.info({ userId }, "[daily-reminder] push sent");
}
