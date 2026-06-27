import { MedicineRegimen } from "@prisma/client";
import { getQueue } from "@app/lib/queue/QueueRegistry";
import { MedicineReminderJobName } from "@app/lib/queue/types";

function timeToCron(time: string): string {
  const [hour, minute] = time.split(":").map(Number);
  return `${minute} ${hour} * * *`;
}

export async function syncMedicineReminderJobs(
  regimen: MedicineRegimen
): Promise<void> {
  console.log(`[medicine-sync] syncing regimen ${regimen.id} (active=${regimen.active}, times=[${regimen.scheduledAt}])`);

  const queue = getQueue("medicine-reminders");

  const existing = await queue.getRepeatableJobs();
  let removedCount = 0;

  for (const job of existing) {
    if (job.id?.startsWith(`regimen-${regimen.id}-`)) {
      await queue.removeRepeatableByKey(job.key);
      removedCount++;
    }
  }

  console.log(`[medicine-sync] removed ${removedCount} existing jobs for regimen ${regimen.id}`);

  if (!regimen.active) {
    console.log(`[medicine-sync] regimen ${regimen.id} inactive, no jobs scheduled`);

    return;
  }

  if (regimen.scheduledAt.length === 0) {
    console.log(`[medicine-sync] regimen ${regimen.id} has no scheduledAt times, skipping`);

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

    console.log(`[medicine-sync] scheduled job for regimen ${regimen.id} at ${time} => cron ${cron}`);
  }
}
