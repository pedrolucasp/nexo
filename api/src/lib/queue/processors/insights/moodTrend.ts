import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod, BaseMoodOption } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";
import { avg } from "@app/utils/calc";

const MOOD_SCORE: Record<BaseMoodOption, number> = {
  GREAT: 5,
  GOOD: 4,
  NEUTRAL: 3,
  SAD: 2,
  ANGRY: 1,
};

type MoodTrendEntry = {
  selectedMood: BaseMoodOption;
  energyLevel: number;
  moment: Date;
};

export type MoodTrend = {
  delta: number;
  deltaPoints: number;
  avgFirst: number;
  avgSecond: number;
  dominantMood: BaseMoodOption;
  avgEnergy: number;
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

const formatDecimal = (value: number): string =>
  value.toFixed(1).replace(".", ",");

export function computeMoodTrend(
  moods: MoodTrendEntry[],
  periodStart: Date,
  periodEnd: Date,
): MoodTrend | null {
  const midpoint = new Date((periodStart.getTime() + periodEnd.getTime()) / 2);
  const first = moods.filter((m) => m.moment <= midpoint);
  const second = moods.filter((m) => m.moment > midpoint);

  if (first.length < 2 || second.length < 2) return null;

  const avgFirst = round1(avg(first.map((m) => MOOD_SCORE[m.selectedMood])));
  const avgSecond = round1(avg(second.map((m) => MOOD_SCORE[m.selectedMood])));
  const deltaPoints = round1(avgSecond - avgFirst);
  const delta = Math.round((deltaPoints / avgFirst) * 100);

  // Dominant mood in the period
  const moodCounts = moods.reduce<Partial<Record<BaseMoodOption, number>>>(
    (acc, m) => ({ ...acc, [m.selectedMood]: (acc[m.selectedMood] ?? 0) + 1 }),
    {},
  );
  const dominantMood = (
    Object.entries(moodCounts) as [BaseMoodOption, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  const avgEnergy = avg(moods.map((m) => m.energyLevel));

  return { delta, deltaPoints, avgFirst, avgSecond, dominantMood, avgEnergy };
}

export function moodTrendBody(deltaPoints: number): string {
  const sign = deltaPoints > 0 ? "+" : "";
  return (
    "Média de humor nos últimos 7 dias. " +
    `Diferença de ${sign}${formatDecimal(deltaPoints)} ponto.`
  );
}

export async function processMoodTrend({
  userId,
  periodStart,
  periodEnd,
}: InsightPeriodPayload): Promise<void> {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const moods = await prisma.mood.findMany({
    where: { userId, moment: { gte: start, lte: end } },
    orderBy: { moment: "asc" },
    select: { selectedMood: true, energyLevel: true, moment: true },
  });

  const trend = computeMoodTrend(moods, start, end);
  if (!trend) return;

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.MOOD_TREND,
        periodStart: start,
      },
    },
    update: {
      body: moodTrendBody(trend.deltaPoints),
      metadata: trend,
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.MOOD_TREND,
      period: InsightPeriod.WEEKLY,
      title: "Tendência de Humor",
      body: moodTrendBody(trend.deltaPoints),
      metadata: trend,
      periodStart: start,
      periodEnd: end,
    },
  });
}
