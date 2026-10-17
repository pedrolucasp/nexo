import { Job } from "bullmq";
import { NotificationKind } from "@prisma/client";

import { createNotification } from "@app/services/notification.service";
import { DailyReminderPayload } from "@app/lib/queue/types";
import { appTimeToday } from "@app/lib/appTime";
import { logger } from "@app/lib/logger";

export async function dailyReminderProcessor(job: Job): Promise<void> {
  const { userId, scheduledTime } = job.data as DailyReminderPayload;

  logger.info({ jobId: job.id, userId }, "[daily-reminder] job started");

  await createNotification({
    userId,
    kind: NotificationKind.DAILY_REMINDER,
    title: "Como você está?",
    body: "Registre seu humor para acompanhar sua saúde.",
    scheduledFor: appTimeToday(scheduledTime),
  });

  logger.info({ userId }, "[daily-reminder] notification stored");
}
