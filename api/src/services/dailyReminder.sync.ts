import { User } from "@prisma/client";
import { getQueue } from "@app/lib/queue/QueueRegistry";
import { DailyReminderJobName } from "@app/lib/queue/types";

// XXX: Might be moved to the utilities?
function timeToCron(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return `${minute} ${hour} * * *`;
}

export async function syncDailyReminderJob(user: User): Promise<void> {
  console.log(`[daily-sync] syncing user ${user.id}`);

  const queue = getQueue("daily-reminders");

  const existing = await queue.getRepeatableJobs();
  for (const job of existing) {
    if (job.id?.includes(`daily-reminder-user-${user.id}`)) {
      await queue.removeRepeatableByKey(job.key);
    }
  }

  if (!user.notificationsEnabled || !user.dailyReminderTime) {
    console.log(`[daily-sync] user ${user.id} skipped (enabled=${user.notificationsEnabled}, time=${user.dailyReminderTime})`);

    return;
  }

  const cron = timeToCron(user.dailyReminderTime);

  await queue.add(
    DailyReminderJobName.Send,
    { userId: user.id },
    {
      repeat: { pattern: cron, tz: "America/Sao_Paulo" },
      jobId: `daily-reminder-user-${user.id}`,
    }
  );

  console.log(`[daily-sync] scheduled daily reminder for user ${user.id} at ${user.dailyReminderTime} => cron ${cron}`);
}
