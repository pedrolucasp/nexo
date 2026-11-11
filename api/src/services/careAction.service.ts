import { prisma } from '@app/lib/prisma';
import { paginate } from '@app/utils/calc';
import { CareAction, CareActionType } from '@prisma/client';
import { CreateCareActionInput, PatchCareActionInput } from '@app/schemas';
import { assertWithinEditingWindow } from '@app/lib/editingWindow';
import { InvalidCareActionSubtypeError } from '@app/lib/errors/editingErrors';
import { MedicineRegimenNotFoundError } from '@app/lib/errors/medicineErrors';
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
  const limit = params?.limit ?? 20;

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

  const total = await prisma.careAction.count({ where });
  const { page, skip, nextPage } = paginate(params?.page ?? 1, limit, total);

  const entries = await prisma.careAction.findMany({
    where,
    include: careActionIncludes,
    orderBy: { moment: 'desc' },
    take: limit,
    skip,
  });

  return {
    entries,
    total,
    page,
    nextPage,
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
): Promise<CareAction | null> => {
  const existing = await prisma.careAction.findUnique({ where: { id, userId } });

  if (!existing) return null;

  assertWithinEditingWindow(existing.createdAt);

  return prisma.careAction.delete({
    where: { id, userId },
  });
};

// Link changes are not record edits: the app deliberately offers linking
// after a care action is created, and the post-appointment flow can run past
// the window. Only content changes are gated.
const isContentChange = (data: PatchCareActionInput): boolean =>
  data.moment !== undefined ||
  data.appointment !== undefined ||
  data.activity !== undefined;

export const patchCareActionById = async (
  userId: number,
  id: number,
  data: PatchCareActionInput,
) => {
  const existing = await prisma.careAction.findUnique({
    where: { id, userId },
    include: careActionIncludes,
  });

  if (!existing) return null;

  if (isContentChange(data)) {
    assertWithinEditingWindow(existing.createdAt);
  }

  const { appointment, activity, ...fields } = data;

  if (appointment) {
    if (existing.type !== CareActionType.APPOINTMENT) {
      throw new InvalidCareActionSubtypeError("appointment");
    }

    // A care action created without its subtype payload has no row yet, so the
    // upsert's create branch needs the required columns spelled out.
    if (!existing.appointment && !appointment.type) {
      throw new InvalidCareActionSubtypeError("appointment");
    }
  }

  if (activity) {
    if (existing.type !== CareActionType.ACTIVITY) {
      throw new InvalidCareActionSubtypeError("activity");
    }

    if (!existing.activity && !activity.type) {
      throw new InvalidCareActionSubtypeError("activity");
    }
  }

  return prisma.careAction.update({
    where: { id, userId },
    data: {
      ...fields,
      ...(appointment && {
        appointment: {
          upsert: {
            create: {
              type: appointment.type!,
              duration: appointment.duration!,
              note: appointment.note,
            },
            update: appointment,
          },
        },
      }),
      ...(activity && {
        activity: {
          upsert: {
            create: {
              type: activity.type!,
              duration: activity.duration,
            },
            update: activity,
          },
        },
      }),
    },
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

      const regimen = await prisma.medicineRegimen.findUnique({
        where: { id: regimenId, userId },
        select: { id: true },
      });

      if (!regimen) throw new MedicineRegimenNotFoundError();

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
