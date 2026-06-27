import { prisma } from '@app/lib/prisma';
import { MedicineRegimen } from '@prisma/client';
import { CreateMedicineRegimenInput, UpdateMedicineRegimenInput } from '@app/schemas';
import { syncMedicineReminderJobs } from '@app/services/medicineReminder.sync';

export const getMedicineRegimensByUserId = async (
  userId: number,
): Promise<MedicineRegimen[]> => {
  return prisma.medicineRegimen.findMany({
    where: { userId, active: true },
    orderBy: { createdAt: 'desc' },
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
