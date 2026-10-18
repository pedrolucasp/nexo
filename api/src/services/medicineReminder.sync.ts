import { MedicineRegimen } from "@prisma/client";
import { getQueue } from "@app/lib/queue/QueueRegistry";
import { MedicineReminderJobName } from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";
import { timeToCron } from "@app/utils/calc";

export async function syncMedicineReminderJobs(
  regimen: MedicineRegimen
): Promise<void> {
  logger.info(
    {
      regimenId: regimen.id,
      active: regimen.active,
      scheduledAt: regimen.scheduledAt,
    },
    "[medicine-sync] syncing regimen",
  );

  const queue = getQueue("medicine-reminders");

  const existing = await queue.getRepeatableJobs();
  let removedCount = 0;

  for (const job of existing) {
    if (job.id?.startsWith(`regimen-${regimen.id}-`)) {
      await queue.removeRepeatableByKey(job.key);
      removedCount++;
    }
  }

  logger.info(
    { regimenId: regimen.id, removedCount },
    "[medicine-sync] removed existing jobs",
  );

  if (!regimen.active) {
    logger.info(
      { regimenId: regimen.id },
      "[medicine-sync] regimen inactive, no jobs scheduled",
    );

    return;
  }

  if (regimen.scheduledAt.length === 0) {
    logger.info(
      { regimenId: regimen.id },
      "[medicine-sync] regimen has no scheduledAt times, skipping",
    );

    return;
  }

  for (const time of regimen.scheduledAt) {
    const cron = timeToCron(time);
    await queue.add(
      MedicineReminderJobName.Send,
      {
        userId: regimen.userId,
        regimenId: regimen.id,
        medicineName: regimen.name,
        dosage: regimen.dosage,
        scheduledTime: time,
      },
      {
        repeat: { pattern: cron, tz: "America/Sao_Paulo" },
        jobId: `regimen-${regimen.id}-${time}`,
      }
    );

    logger.info(
      { regimenId: regimen.id, time, cron },
      "[medicine-sync] scheduled job",
    );
  }
}
