import { prisma } from "@app/lib/prisma";
import { Mood } from "@prisma/client";
import {
  rollingPeriod,
  appDayPeriod,
} from "@app/lib/queue/processors/insights/utils";
import { InsightJobName } from "@app/lib/queue/types";
import { getQueue } from "@app/lib/queue";
import { paginate } from "@app/utils/calc";

import { CreateMoodInput } from "@app/schemas";

export const createMood = async (
  userId: number,
  input: CreateMoodInput,
): Promise<Mood> => {
  const { moodComponents, ...moodData } = input;

  const mood = prisma.mood.create({
    data: {
      ...moodData,
      userId,
      moodComponents: {
        create: moodComponents,
      },
    },
    include: { moodComponents: true },
  });

  void enqueueOnDemandInsights(userId);

  return mood;
};

export const getMoodsByUserId = async (
  userId: number,
  params?: {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
  },
): Promise<{
  entries: Mood[];
  total: number;
  page: number;
  nextPage: number | null;
}> => {
  const limit = params?.limit ?? 20;

  const where = {
    userId,
    ...(params?.from || params?.to
      ? {
          moment: {
            ...(params.from && { gte: new Date(params.from) }),
            ...(params.to && { lte: new Date(params.to) }),
          },
        }
      : {}),
  };

  const total = await prisma.mood.count({ where });
  const { page, skip, nextPage } = paginate(params?.page ?? 1, limit, total);

  const entries = await prisma.mood.findMany({
    where,
    include: { moodComponents: true },
    orderBy: { moment: "desc" },
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

export const getMoodById = async (id: number) => {
  return await prisma.mood.findUnique({
    where: {
      id,
    },
    include: {
      moodComponents: true,
      triggerLinks: {
        include: { trigger: true },
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
};

export const destroyMoodById = async (
  userId: number,
  id: number,
): Promise<Mood> => {
  return await prisma.mood.delete({
    where: {
      id,
      userId,
    },
  });
};

export const enqueueOnDemandInsights = async (
  userId: number,
): Promise<void> => {
  const queue = getQueue("insights");
  const week = { userId, ...rollingPeriod(7) };
  const day = { userId, ...appDayPeriod() };

  await queue.addBulk([
    {
      name: InsightJobName.MoodTrend,
      data: week,
      opts: {
        jobId: `mood-trend-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
    {
      name: InsightJobName.EnergySleep,
      data: week,
      opts: {
        jobId: `energy-sleep-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
    {
      name: InsightJobName.DailyEnergy,
      data: day,
      opts: {
        jobId: `daily-energy-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  ]);
};
