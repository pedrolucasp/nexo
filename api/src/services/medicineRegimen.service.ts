import { prisma } from '@app/lib/prisma';
import { MedicineRegimen } from '@prisma/client';
import { CreateMedicineRegimenInput, UpdateMedicineRegimenInput } from '@app/schemas';

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
  return prisma.medicineRegimen.create({
    data: { ...input, userId },
  });
};

export const updateMedicineRegimen = async (
  userId: number,
  id: number,
  input: UpdateMedicineRegimenInput,
): Promise<MedicineRegimen> => {
  return prisma.medicineRegimen.update({
    where: { id, userId },
    data: input,
  });
};

export const deactivateMedicineRegimen = async (
  userId: number,
  id: number,
): Promise<MedicineRegimen> => {
  return prisma.medicineRegimen.update({
    where: { id, userId },
    data: { active: false },
  });
};
