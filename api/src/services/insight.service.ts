import { prisma } from "@app/lib/prisma";
import { appDayWindow } from "@app/lib/queue/processors/insights/utils";
import { Prisma, Insight, InsightType, InsightPeriod } from "@prisma/client";

export const getInsightsByUserId = async (
  userId: number,
  params?: {
    type?: InsightType;
    period?: InsightPeriod;
    limit?: number;
    day?: Date;
  },
): Promise<Insight[]> => {
  const where: Prisma.InsightWhereInput = {
    userId,
    ...(params?.type && { type: params.type }),
    ...(params?.period && { period: params.period }),
  };

  if (params?.day) {
    const { start, end } = appDayWindow(params.day);
    where.periodStart = { gte: start, lt: end };
  }

  return prisma.insight.findMany({
    where,
    orderBy: { generatedAt: "desc" },
    take: params?.limit ?? 10,
  });
};

export const getLatestInsightByType = async (
  userId: number,
  type: InsightType,
): Promise<Insight | null> => {
  return prisma.insight.findFirst({
    where: { userId, type },
    orderBy: { generatedAt: "desc" },
  });
};
