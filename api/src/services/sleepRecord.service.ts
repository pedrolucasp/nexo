import { prisma } from '@app/lib/prisma';
import { SleepRecord } from '@prisma/client';

import { CreateSleepRecordInput } from '@app/schemas';

export const createSleepRecord = async (
  userId: number, input: CreateSleepRecordInput
): Promise<SleepRecord> => {
  return prisma.sleepRecord.create({
    data: {
      ...input,
      userId
    }
  });
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
  const page  = params?.page  ?? 1;
  const limit = params?.limit ?? 20;
  const skip  = (page - 1) * limit;

  const where = {
    userId,
    ...(params?.from || params?.to ? {
      date: {
        ...(params.from && { gte: new Date(params.from) }),
        ...(params.to   && { lte: new Date(params.to)   }),
      }
    } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.sleepRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      skip,
    }),
    prisma.sleepRecord.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    entries,
    total,
    page,
    nextPage: page < totalPages ? page + 1 : null,
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
