import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";
import { avg } from "@app/utils/calc";
import {
  appDayWindow,
  previousAppDay,
  DAY_WINDOW_LABEL,
} from "@app/lib/queue/processors/insights/utils";

type EnergyEntry = {
  energyLevel: number;
  stressLevel: number;
  anxietyLevel: number;
};

export type DailyEnergyMetadata = {
  avgEnergy: number;
  avgStress: number;
  avgAnxiety: number;
  peak: number;
  trough: number;
  dayTrend: number | null;
  entryCount: number;
  yesterdayAvg: number | null;
  diffEnergy: number | null;
  windowLabel: string;
};

export function computeDailyEnergy(
  moods: EnergyEntry[],
  yesterdayMoods: { energyLevel: number }[],
): { metadata: DailyEnergyMetadata; dayTrend: number | null } {
  const avgEnergy = parseFloat(avg(moods.map((m) => m.energyLevel)).toFixed(2));
  const avgStress = parseFloat(avg(moods.map((m) => m.stressLevel)).toFixed(2));
  const avgAnxiety = parseFloat(
    avg(moods.map((m) => m.anxietyLevel)).toFixed(2),
  );
  const peak = Math.max(...moods.map((m) => m.energyLevel));
  const trough = Math.min(...moods.map((m) => m.energyLevel));

  // Trend across the day: compare first half vs second half entries
  // Not that great, but it works
  const mid = Math.floor(moods.length / 2);
  const morningAvg =
    moods.length > 1
      ? avg(moods.slice(0, mid).map((m) => m.energyLevel))
      : null;

  const eveningAvg =
    moods.length > 1 ? avg(moods.slice(mid).map((m) => m.energyLevel)) : null;

  const dayTrend =
    morningAvg && eveningAvg
      ? parseFloat((((eveningAvg - morningAvg) / morningAvg) * 100).toFixed(1))
      : null;

  const yesterdayAvg =
    yesterdayMoods.length > 0
      ? parseFloat(avg(yesterdayMoods.map((m) => m.energyLevel)).toFixed(2))
      : null;

  // Positive means more energy than yesterday; null when there is nothing to
  // compare against
  const diffEnergy =
    yesterdayAvg !== null
      ? parseFloat((avgEnergy - yesterdayAvg).toFixed(2))
      : null;

  const metadata: DailyEnergyMetadata = {
    avgEnergy,
    avgStress,
    avgAnxiety,
    peak,
    trough,
    dayTrend,
    entryCount: moods.length,
    yesterdayAvg,
    diffEnergy,
    windowLabel: DAY_WINDOW_LABEL,
  };

  return { metadata, dayTrend };
}

export function dailyEnergyBody(
  avgEnergy: number,
  dayTrend: number | null,
): string {
  const level = avgEnergy >= 7 ? "alta" : avgEnergy >= 4 ? "moderada" : "baixa";
  if (dayTrend === null) return `Energia ${level} hoje.`;
  if (dayTrend > 10)
    return `Energia ${level} hoje, com melhora ao longo do dia.`;
  if (dayTrend < -10)
    return `Energia ${level} hoje, com queda ao longo do dia.`;
  return `Energia ${level} e estável ao longo do dia.`;
}

export async function processDailyEnergy({
  userId,
  periodStart,
}: InsightPeriodPayload): Promise<void> {
  const { start, end } = appDayWindow(new Date(periodStart));
  const yesterdayStart = previousAppDay(start);

  const [moods, yesterdayMoods] = await Promise.all([
    prisma.mood.findMany({
      where: { userId, moment: { gte: start, lt: end } },
      orderBy: { moment: "asc" },
      select: {
        energyLevel: true,
        stressLevel: true,
        anxietyLevel: true,
        selectedMood: true,
        moment: true,
      },
    }),
    prisma.mood.findMany({
      where: { userId, moment: { gte: yesterdayStart, lt: start } },
      select: { energyLevel: true },
    }),
  ]);

  if (moods.length === 0) return;

  const { metadata, dayTrend } = computeDailyEnergy(moods, yesterdayMoods);

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.DAILY_ENERGY,
        periodStart: start,
      },
    },
    update: {
      body: dailyEnergyBody(metadata.avgEnergy, dayTrend),
      metadata,
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.DAILY_ENERGY,
      period: InsightPeriod.DAILY,
      title: "Energia do Dia",
      body: dailyEnergyBody(metadata.avgEnergy, dayTrend),
      metadata,
      periodStart: start,
      periodEnd: end,
    },
  });
}
