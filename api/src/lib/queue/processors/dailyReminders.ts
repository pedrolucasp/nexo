import { Job } from "bullmq";
import { prisma } from "@app/lib/prisma";
import { sendPushNotification } from "@app/lib/sendPushNotification";
import { DailyReminderPayload } from "@app/lib/queue/types";

export async function dailyReminderProcessor(job: Job): Promise<void> {
  const { userId } = job.data as DailyReminderPayload;

  console.log(`[daily-reminder] job ${job.id}: user=${userId}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true, notificationsEnabled: true },
  });

  if (!user) {
    console.warn(`[daily-reminder] user ${userId} not found, skipping`);

    return;
  }

  if (!user.notificationsEnabled) {
    console.warn(`[daily-reminder] user ${userId} has notifications disabled, skipping`);

    return;
  }

  if (!user.pushToken) {
    console.warn(`[daily-reminder] user ${userId} has no pushToken, skipping`);

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

  console.log(`[daily-reminder] sent OK to user ${userId}`);
}
