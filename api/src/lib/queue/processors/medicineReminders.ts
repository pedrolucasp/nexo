import { Job } from "bullmq";
import { NotificationKind } from "@prisma/client";

import { createNotification } from "@app/services/notification.service";
import { MedicineReminderPayload } from "@app/lib/queue/types";
import { appTimeToday } from "@app/lib/appTime";
import { logger } from "@app/lib/logger";

export async function medicineReminderProcessor(job: Job): Promise<void> {
  const { userId, regimenId, medicineName, dosage, scheduledTime } =
    job.data as MedicineReminderPayload;

  logger.info(
    { jobId: job.id, userId, regimenId, medicine: medicineName },
    "[medicine-reminder] job started",
  );

  await createNotification({
    userId,
    kind: NotificationKind.MEDICINE_REMINDER,
    title: `Hora de tomar ${medicineName}`,
    body: dosage,
    scheduledFor: appTimeToday(scheduledTime),
    regimenId,
  });

  logger.info({ userId, regimenId }, "[medicine-reminder] notification stored");
}
