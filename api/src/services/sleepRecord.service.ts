import { prisma } from '@app/lib/prisma';
import { SleepRecord } from '@prisma/client';

import { CreateSleepRecordInput, UpdateSleepRecordInput } from '@app/schemas';
import {
  rollingPeriod,
  appDayPeriod,
} from "@app/lib/queue/processors/insights/utils";
import { InsightJobName } from "@app/lib/queue/types";
import { getQueue } from "@app/lib/queue";
import { paginate } from '@app/utils/calc';

export const createSleepRecord = async (
  userId: number, input: CreateSleepRecordInput
): Promise<SleepRecord> => {
  const sleepRecord = await prisma.sleepRecord.create({
    data: {
      ...input,
      userId
    }
  });

  void enqueueEnergySleepInsights(userId);

  return sleepRecord;
};

export const getSleepRecordsByUserId = async (
  userId: number,
  params?: {
    limit?: number;
    page?: number;
    from?: string;
    to?: string;
  }
): Promise<{ entries: SleepRecord[]; total: number; page: number; nextPage: number | null }> => {
  const limit = params?.limit ?? 20;

  const where = {
    userId,
    ...(params?.from || params?.to ? {
      date: {
        ...(params.from && { gte: new Date(params.from) }),
        ...(params.to   && { lte: new Date(params.to)   }),
      }
    } : {}),
  };

  const total = await prisma.sleepRecord.count({ where });
  const { page, skip, nextPage } = paginate(params?.page ?? 1, limit, total);

  const entries = await prisma.sleepRecord.findMany({
    where,
    orderBy: { date: 'desc' },
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

export const destroySleepRecordById = async (
  userId: number, id: number
): Promise<SleepRecord> => {
  return await prisma.sleepRecord.delete({
    where: {
      id,
      userId
    }
  })
}

export const getSleepRecordById = async (userId: number, id: number): Promise<SleepRecord | null> => {
  return await prisma.sleepRecord.findUnique({
    where: { userId, id }
  })
}

export const updateSleepRecordById = async (
  userId: number, id: number, input: UpdateSleepRecordInput
): Promise<SleepRecord> => {
  const sleepRecord = await prisma.sleepRecord.update({
    where: {
      id,
      userId
    },
    data: input
  });

  void enqueueEnergySleepInsights(userId);

  return sleepRecord;
}

async function enqueueEnergySleepInsights(userId: number): Promise<void> {
  const queue = getQueue("insights");
  const week = { userId, ...rollingPeriod(7) };
  const day = { userId, ...appDayPeriod() };

  await queue.addBulk([
    {
      name: InsightJobName.EnergySleep,
      data: week,
      opts: {
        jobId: `energy-sleep-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      }
    },
    {
      name: InsightJobName.DailySleep,
      data: day,
      opts: {
        jobId: `daily-sleep-${userId}-${new Date().toDateString()}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    },
  ]);
}
