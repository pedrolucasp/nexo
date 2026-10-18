import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";
import { logger } from "@app/lib/logger";
import { formatHours, formatDiff } from "@app/utils/calc";
import {
  appDayWindow,
  previousAppDay,
  DAY_WINDOW_LABEL,
} from "@app/lib/queue/processors/insights/utils";

type SleepRecordEntry = { average: number };

export type DailySleepMetadata = {
  totalHours: number;
  diffMinutes: number | null;
  diffStr: string;
  sessionCount: number;
  napStr: string;
  hadNaps: boolean;
  windowLabel: string;
};

export function computeDailySleep(
  todayRecords: SleepRecordEntry[],
  yesterdayRecords: SleepRecordEntry[],
): { metadata: DailySleepMetadata } {
  // average is stored in hours
  // sum across all records for the day
  const totalToday = todayRecords.reduce((sum, r) => sum + r.average, 0);
  const totalYesterday =
    yesterdayRecords.length > 0
      ? yesterdayRecords.reduce((sum, r) => sum + r.average, 0)
      : null;

  const diffMinutes =
    totalYesterday !== null
      ? Math.round((totalToday - totalYesterday) * 60)
      : null;

  const sessionCount = todayRecords.length; // 1 = normal night, 2+ = nap(s)

  const diffStr =
    diffMinutes !== null && Math.abs(diffMinutes) >= 5
      ? `${formatDiff(diffMinutes)} que ontem`
      : "";

  const napStr =
    sessionCount > 1
      ? `incluindo ${sessionCount - 1} cochilo${sessionCount > 2 ? "s" : ""}`
      : "";

  const metadata: DailySleepMetadata = {
    totalHours: totalToday,
    diffMinutes,
    diffStr,
    sessionCount,
    napStr,
    hadNaps: sessionCount > 1,
    windowLabel: DAY_WINDOW_LABEL,
  };

  return { metadata };
}

export function dailySleepBody(total: number): string {
  const totalStr = formatHours(total);

  return `${totalStr} de sono hoje`;
}

export async function processDailySleep({
  userId,
  periodStart,
}: InsightPeriodPayload): Promise<void> {
  const { start: today, end: tomorrow } = appDayWindow(new Date(periodStart));
  const yesterday = previousAppDay(today);

  const [todayRecords, yesterdayRecords] = await Promise.all([
    prisma.sleepRecord.findMany({
      where: { userId, date: { gte: today, lt: tomorrow } },
      select: { average: true },
    }),
    prisma.sleepRecord.findMany({
      where: { userId, date: { gte: yesterday, lt: today } },
      select: { average: true },
    }),
  ]);

  logger.debug(
    { todayRecords, yesterdayRecords },
    "[insights] daily sleep records",
  );

  if (todayRecords.length === 0) return;

  const { metadata } = computeDailySleep(todayRecords, yesterdayRecords);

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.DAILY_SLEEP,
        periodStart: today,
      },
    },
    update: {
      body: dailySleepBody(metadata.totalHours),
      metadata,
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.DAILY_SLEEP,
      period: InsightPeriod.DAILY,
      title: "Sono",
      body: dailySleepBody(metadata.totalHours),
      metadata,
      periodStart: today,
      periodEnd: tomorrow,
    },
  });
}
