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

type MoodTrendEntry = { selectedMood: BaseMoodOption; energyLevel: number };

export type MoodTrend = {
  delta: number;
  avgFirst: number;
  avgSecond: number;
  dominantMood: BaseMoodOption;
  avgEnergy: number;
};

export function computeMoodTrend(moods: MoodTrendEntry[]): MoodTrend {
  const scores = moods.map((m) => MOOD_SCORE[m.selectedMood]);
  const mid = Math.floor(scores.length / 2);
  const avgFirst = avg(scores.slice(0, mid));
  const avgSecond = avg(scores.slice(mid));
  const delta = Math.round(((avgSecond - avgFirst) / avgFirst) * 100);

  // Dominant mood in the period
  const moodCounts = moods.reduce<Partial<Record<BaseMoodOption, number>>>(
    (acc, m) => ({ ...acc, [m.selectedMood]: (acc[m.selectedMood] ?? 0) + 1 }),
    {},
  );
  const dominantMood = (
    Object.entries(moodCounts) as [BaseMoodOption, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  const avgEnergy = avg(moods.map((m) => m.energyLevel));

  return { delta, avgFirst, avgSecond, dominantMood, avgEnergy };
}

export function moodTrendBody(delta: number): string {
  if (delta > 10)
    return `Seu humor melhorou ${delta}% em relação ao início do período.`;
  if (delta < -10)
    return `Seu humor caiu ${Math.abs(delta)}% em relação ao início do período.`;
  return "Seu humor se manteve estável durante o período.";
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

  if (moods.length < 3) return;

  const trend = computeMoodTrend(moods);

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.MOOD_TREND,
        periodStart: start,
      },
    },
    update: {
      body: moodTrendBody(trend.delta),
      metadata: trend,
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.MOOD_TREND,
      period: InsightPeriod.WEEKLY,
      title: "Tendência de Humor",
      body: moodTrendBody(trend.delta),
      metadata: trend,
      periodStart: start,
      periodEnd: end,
    },
  });
}
