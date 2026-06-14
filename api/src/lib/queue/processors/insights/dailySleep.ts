import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";
// XXX: date-fns?
import { formatHours, formatDiff } from "@app/utils/calc";
import { startOfDay, addDays, subDays } from "date-fns";

export async function processDailySleep({
  userId,
  periodStart,
}: InsightPeriodPayload): Promise<void> {
  const today = startOfDay(new Date(periodStart));
  const tomorrow = addDays(today, 1);
  const yesterday = subDays(today, 1);

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

  console.log("todayRecords, yesterdayRecords", todayRecords, yesterdayRecords);

  if (todayRecords.length === 0) return;

  // average is stored in hours
  // sum across all records for the day
  const totalToday = todayRecords.reduce(
    (sum: number, r: { average: number }) => sum + r.average,
    0,
  );
  const totalYesterday =
    yesterdayRecords.length > 0
      ? yesterdayRecords.reduce(
          (sum: number, r: { average: number }) => sum + r.average,
          0,
        )
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

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.DAILY_SLEEP,
        periodStart: today,
      },
    },
    update: {
      body: buildBody(totalToday),
      metadata: {
        totalHours: totalToday,
        diffMinutes,
        diffStr,
        sessionCount,
        napStr,
        hadNaps: sessionCount > 1,
      },
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.DAILY_SLEEP,
      period: InsightPeriod.DAILY,
      title: "Sono",
      body: buildBody(totalToday),
      metadata: {
        totalHours: totalToday,
        diffMinutes,
        sessionCount,
        diffStr,
        napStr,
        hadNaps: sessionCount > 1,
      },
      periodStart: today,
      periodEnd: tomorrow,
    },
  });
}

function buildBody(total: number): string {
  const totalStr = formatHours(total);

  return `${totalStr} de sono hoje`;
}
