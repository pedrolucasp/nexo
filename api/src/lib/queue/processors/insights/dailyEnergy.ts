import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";
import { avg } from "@app/utils/calc";

export async function processDailyEnergy({
  userId,
  periodStart,
  periodEnd,
}: InsightPeriodPayload): Promise<void> {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const moods = await prisma.mood.findMany({
    where: { userId, moment: { gte: start, lte: end } },
    orderBy: { moment: "asc" },
    select: {
      energyLevel: true,
      stressLevel: true,
      anxietyLevel: true,
      selectedMood: true,
      moment: true,
    },
  });

  if (moods.length === 0) return;

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

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.DAILY_ENERGY,
        periodStart: start,
      },
    },
    update: {
      body: buildBody(avgEnergy, dayTrend),
      metadata: {
        avgEnergy,
        avgStress,
        avgAnxiety,
        peak,
        trough,
        dayTrend,
        entryCount: moods.length,
      },
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.DAILY_ENERGY,
      period: InsightPeriod.DAILY,
      title: "Energia do Dia",
      body: buildBody(avgEnergy, dayTrend),
      metadata: {
        avgEnergy,
        avgStress,
        avgAnxiety,
        peak,
        trough,
        dayTrend,
        entryCount: moods.length,
      },
      periodStart: start,
      periodEnd: end,
    },
  });
}

function buildBody(avgEnergy: number, dayTrend: number | null): string {
  const level = avgEnergy >= 7 ? "alta" : avgEnergy >= 4 ? "moderada" : "baixa";
  if (dayTrend === null) return `Energia ${level} hoje.`;
  if (dayTrend > 10)
    return `Energia ${level} hoje, com melhora ao longo do dia.`;
  if (dayTrend < -10)
    return `Energia ${level} hoje, com queda ao longo do dia.`;
  return `Energia ${level} e estável ao longo do dia.`;
}
