import { prisma } from "@app/lib/prisma";
import { Mood } from "@prisma/client";
import { rollingPeriod } from "@app/lib/queue/processors/insights/utils";
import { InsightJobName } from "@app/lib/queue/types";
import { getQueue } from "@app/lib/queue";

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
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;

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

  const [entries, total] = await Promise.all([
    prisma.mood.findMany({
      where,
      include: { moodComponents: true },
      orderBy: { moment: "desc" },
      take: limit,
      skip,
    }),
    prisma.mood.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    entries,
    total,
    page,
    nextPage: page < totalPages ? page + 1 : null,
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
  const period = rollingPeriod(7);
  const payload = { userId, ...period };

  await queue.addBulk([
    {
      name: InsightJobName.MoodTrend,
      data: payload,
      opts: {
        jobId: `mood-trend-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
    {
      name: InsightJobName.EnergySleep,
      data: payload,
      opts: {
        jobId: `energy-sleep-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
    {
      name: InsightJobName.DailyEnergy,
      data: payload,
      opts: {
        jobId: `daily-energy-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  ]);
};
