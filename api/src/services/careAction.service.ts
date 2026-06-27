import { prisma } from '@app/lib/prisma';
import { CareAction, CareActionType } from '@prisma/client';
import { CreateCareActionInput, PatchCareActionInput } from '@app/schemas';
import { syncMedicineReminderJobs } from '@app/services/medicineReminder.sync';

const careActionIncludes = {
  medicineLog: { include: { regimen: true } },
  appointment: true,
  activity: true,
} as const;

export const getCareActionsByUserId = async (
  userId: number,
  params?: {
    type?: CareActionType;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  },
) => {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(params?.type ? { type: params.type } : {}),
    ...(params?.from || params?.to
      ? {
          moment: {
            ...(params?.from && { gte: new Date(params.from) }),
            ...(params?.to && { lte: new Date(params.to) }),
          },
        }
      : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.careAction.findMany({
      where,
      include: careActionIncludes,
      orderBy: { moment: 'desc' },
      take: limit,
      skip,
    }),

    prisma.careAction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    entries,
    total,
    page,
    nextPage: page < totalPages ? page + 1 : null,
  };
};

export const getCareActionById = async (userId: number, id: number) => {
  return prisma.careAction.findUnique({
    where: { id, userId },
    include: careActionIncludes,
  });
};

export const destroyCareActionById = async (
  userId: number,
  id: number,
): Promise<CareAction> => {
  return prisma.careAction.delete({
    where: { id, userId },
  });
};

export const patchCareActionById = async (
  userId: number,
  id: number,
  data: PatchCareActionInput,
) => {
  return prisma.careAction.update({
    where: { id, userId },
    data,
    include: careActionIncludes,
  });
};

export const createCareAction = async (
  userId: number,
  input: CreateCareActionInput,
) => {
  if (input.type === CareActionType.MEDICINE) {
    if (input.regimenId) {
      const regimenId = input.regimenId;

      const [careAction] = await prisma.$transaction([
        prisma.careAction.create({
          data: {
            userId,
            type: input.type,
            moment: input.moment,
            triggerId: input.triggerId,
            moodId: input.moodId,
            medicineLog: {
              create: { regimenId },
            },
          },
          include: careActionIncludes,
        }),
      ]);

      return careAction;
    }

    if (input.medicine) {
      const med = input.medicine;

      const [careAction] = await prisma.$transaction([
        prisma.careAction.create({
          data: {
            userId,
            type: input.type,
            moment: input.moment,
            triggerId: input.triggerId,
            moodId: input.moodId,
            medicineLog: {
              create: {
                regimen: {
                  create: {
                    name: med.name,
                    dosage: med.dosage,
                    periodicity: med.periodicity,
                    scheduledAt: med.scheduledAt,
                    userId,
                  },
                },
              },
            },
          },
          include: careActionIncludes,
        }),
      ]);

      if (careAction.medicineLog?.regimen) {
        await syncMedicineReminderJobs(careAction.medicineLog.regimen as any);
      }

      return careAction;
    }

    // MEDICINE with no regimen info: create action without log
    const [careAction] = await prisma.$transaction([
      prisma.careAction.create({
        data: {
          userId,
          type: input.type,
          moment: input.moment,
          triggerId: input.triggerId,
          moodId: input.moodId,
        },
        include: careActionIncludes,
      }),
    ]);

    return careAction;
  }

  if (input.type === CareActionType.APPOINTMENT && input.appointment) {
    const appt = input.appointment;

    const [careAction] = await prisma.$transaction([
      prisma.careAction.create({
        data: {
          userId,
          type: input.type,
          moment: input.moment,
          triggerId: input.triggerId,
          moodId: input.moodId,
          appointment: {
            create: {
              type: appt.type,
              duration: appt.duration,
              note: appt.note,
            },
          },
        },
        include: careActionIncludes,
      }),
    ]);

    return careAction;
  }

  if (input.type === CareActionType.ACTIVITY && input.activity) {
    const act = input.activity;

    const [careAction] = await prisma.$transaction([
      prisma.careAction.create({
        data: {
          userId,
          type: input.type,
          moment: input.moment,
          triggerId: input.triggerId,
          moodId: input.moodId,
          activity: {
            create: {
              type: act.type,
              duration: act.duration,
            },
          },
        },
        include: careActionIncludes,
      }),
    ]);

    return careAction;
  }

  // Fallback: create without subtype
  return prisma.careAction.create({
    data: {
      userId,
      type: input.type,
      moment: input.moment,
      triggerId: input.triggerId,
      moodId: input.moodId,
    },
    include: careActionIncludes,
  });
};
