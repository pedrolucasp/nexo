import { Job } from "bullmq";
import { prisma } from "@app/lib/prisma";
import { sendPushNotification } from "@app/lib/sendPushNotification";
import { MedicineReminderPayload } from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";

export async function medicineReminderProcessor(job: Job): Promise<void> {
  const { userId, regimenId, medicineName, dosage } =
    job.data as MedicineReminderPayload;

  logger.info(
    { jobId: job.id, userId, regimenId, medicine: medicineName },
    "[medicine-reminder] job started",
  );

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });

  if (!user) {
    logger.warn({ userId }, "[medicine-reminder] user not found, skipping");
    return;
  }
  if (!user.pushToken) {
    logger.warn({ userId }, "[medicine-reminder] no pushToken, skipping");
    return;
  }

  await sendPushNotification({
    token: user.pushToken,
    title: `Hora de tomar ${medicineName}`,
    body: dosage,
    data: { screen: "medicine-regimens", regimenId },
  });

  logger.info({ userId }, "[medicine-reminder] push sent");
}
