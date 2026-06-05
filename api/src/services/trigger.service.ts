import { prisma } from '@app/lib/prisma';
import { Trigger } from '@prisma/client';

import { CreateTriggerInput } from '@app/schemas';

export const createTrigger = async (
  userId: number, input: CreateTriggerInput
): Promise<Trigger> => {
  return prisma.trigger.create({
    data: {
      ...input,
      userId
    }
  });
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
  const page  = params?.page  ?? 1;
  const limit = params?.limit ?? 20;
  const skip  = (page - 1) * limit;

  const where = {
    userId,
    ...(params?.from || params?.to ? {
      moment: {
        ...(params.from && { gte: new Date(params.from) }),
        ...(params.to   && { lte: new Date(params.to)   }),
      }
    } : {}),
  };

  const [entries, total] = await Promise.all([
    prisma.trigger.findMany({
      where,
      orderBy: { moment: 'desc' },
      take: limit,
      skip,
    }),
    prisma.trigger.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    entries,
    total,
    page,
    nextPage: page < totalPages ? page + 1 : null,
  };
};

export const destroyTriggerById = async (
  userId: number, id: number
): Promise<Trigger> => {
  return await prisma.trigger.delete({
    where: {
      id,
      userId
    }
  })
}
