import { prisma } from '@app/lib/prisma';
import { MedicineRegimen } from '@prisma/client';
import { CreateMedicineRegimenInput, UpdateMedicineRegimenInput } from '@app/schemas';
import { syncMedicineReminderJobs } from '@app/services/medicineReminder.sync';
import { appDayWindow } from '@app/lib/queue/processors/insights/utils';

export const toggleMedicineRegimen = async (
  userId: number,
  id: number,
  active: boolean,
): Promise<MedicineRegimen> => {
  const regimen = await prisma.medicineRegimen.update({
    where: { id, userId },
    data: { active },
  });

  await syncMedicineReminderJobs(regimen);

  return regimen;
};

type TodayEntry = {
  regimen: Pick<MedicineRegimen, 'id' | 'name' | 'dosage' | 'scheduledAt'>;
  logs: { id: number; takenAt: Date; scheduledSlot: string | null }[];
};

export const getMedicineRegimenById = async (
  userId: number,
  id: number,
): Promise<MedicineRegimen | null> => {
  return prisma.medicineRegimen.findUnique({
    where: { id, userId },
  });
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
  const { start, end } = appDayWindow();

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
          takenAt: { gte: start, lt: end },
        },
        select: { id: true, takenAt: true, scheduledSlot: true },
      });
      return { regimen, logs };
    })
  );
};

