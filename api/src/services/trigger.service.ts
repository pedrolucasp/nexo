import { prisma } from '@app/lib/prisma';
import { Trigger } from '@prisma/client';

import { CreateTriggerInput, UpdateTriggerInput } from '@app/schemas';
import { rollingPeriod } from "@app/lib/queue/processors/insights/utils";
import { InsightJobName } from "@app/lib/queue/types";
import { getQueue } from "@app/lib/queue";
import { paginate } from '@app/utils/calc';

export const createTrigger = async (
  userId: number, input: CreateTriggerInput
): Promise<Trigger> => {
  const trigger = await prisma.trigger.create({
    data: {
      ...input,
      userId
    }
  });

  void enqueueTriggerPatternInsight(userId);

  return trigger
};

export const getTriggersByUserId = async (
  userId: number,
  params?: {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
  }
): Promise<{ entries: Trigger[]; total: number; page: number; nextPage: number | null }> => {
  const limit = params?.limit ?? 20;

  const where = {
    userId,
    ...(params?.from || params?.to ? {
      moment: {
        ...(params.from && { gte: new Date(params.from) }),
        ...(params.to   && { lte: new Date(params.to)   }),
      }
    } : {}),
  };

  const total = await prisma.trigger.count({ where });
  const { page, skip, nextPage } = paginate(params?.page ?? 1, limit, total);

  const entries = await prisma.trigger.findMany({
    where,
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

export const destroyTriggerById = async (
  userId: number, id: number
): Promise<Trigger> => {
  const trigger = await prisma.trigger.delete({
    where: {
      id,
      userId
    }
  })

  void enqueueTriggerPatternInsight(userId);

  return trigger
}

export const getTriggerById = async (userId: number, id: number) => {
  return await prisma.trigger.findUnique({
    where: { userId, id },
    include: {
      moodLinks: {
        include: { mood: { include: { moodComponents: true } } },
        orderBy: { linkedAt: 'desc' },
      },
      careActions: {
        include: {
          medicineLog: { include: { regimen: true } },
          appointment: true,
          activity: true,
        },
        orderBy: { moment: 'desc' },
      },
    },
  });
}

export const updateTriggerById = async (
  userId: number, id: number, input: UpdateTriggerInput
): Promise<Trigger> => {
  const trigger = await prisma.trigger.update({
    where: {
      id,
      userId
    },
    data: input
  });

  void enqueueTriggerPatternInsight(userId);

  return trigger;
}

async function enqueueTriggerPatternInsight(userId: number): Promise<void> {
  await getQueue('insights').add(
    InsightJobName.TriggerPattern,
    { userId, ...rollingPeriod(7) },
    {
      jobId: `trigger-pattern-${userId}-${new Date().toDateString()}`,
      removeOnComplete: true,
      removeOnFail: true,
    }
  );
}
