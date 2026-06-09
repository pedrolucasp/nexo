import { prisma } from "@app/lib/prisma";
import { Insight, InsightType, InsightPeriod } from "@prisma/client";

export const getInsightsByUserId = async (
  userId: number,
  params?: {
    type?: InsightType;
    period?: InsightPeriod;
    limit?: number;
  },
): Promise<Insight[]> => {
  return prisma.insight.findMany({
    where: {
      userId,
      ...(params?.type && { type: params.type }),
      ...(params?.period && { period: params.period }),
    },
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
