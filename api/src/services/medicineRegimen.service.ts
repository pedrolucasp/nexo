import { prisma } from '@app/lib/prisma';
import { MedicineRegimen } from '@prisma/client';
import { CreateMedicineRegimenInput, UpdateMedicineRegimenInput } from '@app/schemas';
import { syncMedicineReminderJobs } from '@app/services/medicineReminder.sync';

type TodayEntry = {
  regimen: Pick<MedicineRegimen, 'id' | 'name' | 'dosage' | 'scheduledAt'>;
  logs: { id: number; takenAt: Date }[];
};

export const getMedicineRegimensByUserId = async (
  userId: number,
): Promise<MedicineRegimen[]> => {
  return prisma.medicineRegimen.findMany({
    where: { userId },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  });
};

export const createMedicineRegimen = async (
  userId: number,
  input: CreateMedicineRegimenInput,
): Promise<MedicineRegimen> => {
  const regimen = await prisma.medicineRegimen.create({
    data: { ...input, userId },
  });
  await syncMedicineReminderJobs(regimen);
  return regimen;
};

export const updateMedicineRegimen = async (
  userId: number,
  id: number,
  input: UpdateMedicineRegimenInput,
): Promise<MedicineRegimen> => {
  const regimen = await prisma.medicineRegimen.update({
    where: { id, userId },
    data: input,
  });
  await syncMedicineReminderJobs(regimen);
  return regimen;
};

export const getTodayMedicineRegimens = async (
  userId: number,
): Promise<TodayEntry[]> => {
  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const regimens = await prisma.medicineRegimen.findMany({
    where: { userId, active: true },
    select: { id: true, name: true, dosage: true, scheduledAt: true },
    orderBy: { createdAt: 'desc' },
  });

  return Promise.all(
    regimens.map(async (regimen) => {
      const logs = await prisma.medicineLog.findMany({
        where: {
          regimenId: regimen.id,
          takenAt: { gte: startOfDay, lte: endOfDay },
        },
        select: { id: true, takenAt: true },
      });
      return { regimen, logs };
    })
  );
};

export const deactivateMedicineRegimen = async (
  userId: number,
  id: number,
): Promise<MedicineRegimen> => {
  const regimen = await prisma.medicineRegimen.update({
    where: { id, userId },
    data: { active: false },
  });
  await syncMedicineReminderJobs(regimen);
  return regimen;
};
