import { Job } from "bullmq";
import { prisma } from "@app/lib/prisma";
import { sendPushNotification } from "@app/lib/sendPushNotification";
import { MedicineReminderPayload } from "@app/lib/queue/types";

export async function medicineReminderProcessor(job: Job): Promise<void> {
  const { userId, regimenId, medicineName, dosage } =
    job.data as MedicineReminderPayload;

  console.log(`[medicine-reminder] job ${job.id}: user=${userId} regimen=${regimenId} medicine=${medicineName}`);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { pushToken: true },
  });

  if (!user) {
    console.warn(`[medicine-reminder] user ${userId} not found, skipping`);
    return;
  }
  if (!user.pushToken) {
    console.warn(`[medicine-reminder] user ${userId} has no pushToken, skipping`);
    return;
  }

  await sendPushNotification({
    token: user.pushToken,
    title: `Hora de tomar ${medicineName}`,
    body: dosage,
    data: { screen: "medicine-regimens", regimenId },
  });

  console.log(`[medicine-reminder] sent OK to user ${userId}`);
}
