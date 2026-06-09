import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";

// Pearson correlation coefficient, returns value in [-1, 1]
// TODO: Document this more and write to thesis
function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;

  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;

  const num = xs.reduce((sum, x, i) => sum + (x - meanX) * (ys[i] - meanY), 0);
  const denX = Math.sqrt(xs.reduce((sum, x) => sum + (x - meanX) ** 2, 0));
  const denY = Math.sqrt(ys.reduce((sum, y) => sum + (y - meanY) ** 2, 0));

  if (denX === 0 || denY === 0) return 0;
  return num / (denX * denY);
}

export async function processEnergySleep({
  userId,
  periodStart,
  periodEnd,
}: InsightPeriodPayload): Promise<void> {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const sleepRecords = await prisma.sleepRecord.findMany({
    where: { userId, date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  });

  if (sleepRecords.length < 3) return;

  // For each sleep record, find the closest mood entry on the following day
  // XXX: What if the user logs two sleep entries on the same day?
  const pairs: Array<{ sleep: number; energy: number }> = [];

  for (const record of sleepRecords) {
    const nextDayStart = new Date(record.date);
    nextDayStart.setDate(nextDayStart.getDate() + 1);
    const nextDayEnd = new Date(nextDayStart);
    nextDayEnd.setDate(nextDayEnd.getDate() + 1);

    const mood = await prisma.mood.findFirst({
      where: { userId, moment: { gte: nextDayStart, lt: nextDayEnd } },
      orderBy: { moment: "asc" },
      select: { energyLevel: true },
    });

    if (mood) {
      pairs.push({ sleep: record.average, energy: mood.energyLevel });
    }
  }

  if (pairs.length < 3) return;

  const sleepValues = pairs.map((p) => p.sleep);
  const energyValues = pairs.map((p) => p.energy);
  const score = parseFloat(pearson(sleepValues, energyValues).toFixed(3));

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.ENERGY_SLEEP_CORRELATION,
        periodStart: start,
      },
    },
    update: {
      body: buildBody(score, pairs.length),
      metadata: { correlationScore: score, sampleSize: pairs.length },
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.ENERGY_SLEEP_CORRELATION,
      period: InsightPeriod.WEEKLY,
      title: "Sono e Energia",
      body: buildBody(score, pairs.length),
      metadata: { correlationScore: score, sampleSize: pairs.length },
      periodStart: start,
      periodEnd: end,
    },
  });
}

function buildBody(score: number, sampleSize: number): string {
  const base = sampleSize < 5 ? " (dados limitados, continue registrando)" : "";

  if (score > 0.6)
    return `Seu sono tem forte impacto positivo na sua energia no dia seguinte.${base}`;
  if (score > 0.3)
    return `Seu sono tem impacto moderado na sua energia no dia seguinte.${base}`;
  if (score < -0.3)
    return `Curiosamente, mais sono está associado a menos energia — vale investigar.${base}`;
  return `Não encontramos uma relação clara entre seu sono e energia ainda.${base}`;
}
