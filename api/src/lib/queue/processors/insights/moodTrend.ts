import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod, BaseMoodOption } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";

const MOOD_SCORE: Record<BaseMoodOption, number> = {
  GREAT: 5,
  GOOD: 4,
  NEUTRAL: 3,
  SAD: 2,
  ANGRY: 1,
};

const avg = (values: number[]) =>
  values.reduce((a, b) => a + b, 0) / values.length;

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

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.MOOD_TREND,
        periodStart: start,
      },
    },
    update: {
      body: buildBody(delta),
      metadata: { delta, avgFirst, avgSecond, dominantMood, avgEnergy },
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.MOOD_TREND,
      period: InsightPeriod.WEEKLY,
      title: "Tendência de Humor",
      body: buildBody(delta),
      metadata: { delta, avgFirst, avgSecond, dominantMood, avgEnergy },
      periodStart: start,
      periodEnd: end,
    },
  });
}

function buildBody(delta: number): string {
  if (delta > 10)
    return `Seu humor melhorou ${delta}% em relação ao início do período.`;
  if (delta < -10)
    return `Seu humor caiu ${Math.abs(delta)}% em relação ao início do período.`;
  return "Seu humor se manteve estável durante o período.";
}
