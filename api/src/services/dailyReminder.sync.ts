import { User } from "@prisma/client";
import { getQueue } from "@app/lib/queue/QueueRegistry";
import { DailyReminderJobName } from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";
import { timeToCron } from "@app/utils/calc";

export async function syncDailyReminderJob(user: User): Promise<void> {
  logger.info({ userId: user.id }, "[daily-sync] syncing user");

  const queue = getQueue("daily-reminders");

  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.id?.includes(`daily-reminder-user-${user.id}`)) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  if (!user.dailyReminderTime) {
    logger.info(
      { userId: user.id, time: user.dailyReminderTime },
      "[daily-sync] user skipped",
    );

    return;
  }

  const cron = timeToCron(user.dailyReminderTime);

  await queue.add(
    DailyReminderJobName.Send,
    { userId: user.id, scheduledTime: user.dailyReminderTime },
    {
      repeat: { pattern: cron, tz: "America/Sao_Paulo" },
      jobId: `daily-reminder-user-${user.id}`,
    }
  );

  logger.info(
    { userId: user.id, time: user.dailyReminderTime, cron },
    "[daily-sync] scheduled daily reminder",
  );
}
