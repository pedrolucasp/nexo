import { prisma } from "@app/lib/prisma";
import { InsightType, InsightPeriod, TriggerType } from "@prisma/client";
import { InsightPeriodPayload } from "@app/lib/queue/types";

const TRIGGER_LABEL: Record<TriggerType, string> = {
  SOCIAL: "social",
  WORK: "trabalho",
  HEALTH: "saúde",
  PHYSICAL: "físico",
  FAMILY: "família",
  OTHER: "outros",
};

export async function processTriggerPattern({
  userId,
  periodStart,
  periodEnd,
}: InsightPeriodPayload): Promise<void> {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);

  const triggers = await prisma.trigger.findMany({
    where: { userId, moment: { gte: start, lte: end } },
    select: { category: true },
  });

  if (triggers.length === 0) return;

  // Count by category
  const counts = triggers.reduce<Partial<Record<TriggerType, number>>>(
    (acc, t) => ({ ...acc, [t.category]: (acc[t.category] ?? 0) + 1 }),
    {},
  );

  const sorted = (Object.entries(counts) as [TriggerType, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  const [topCategory, topCount] = sorted[0];
  const distribution = Object.fromEntries(sorted);

  await prisma.insight.upsert({
    where: {
      userId_type_periodStart: {
        userId,
        type: InsightType.TRIGGER_PATTERN,
        periodStart: start,
      },
    },
    update: {
      body: buildBody(topCategory, topCount, triggers.length),
      metadata: {
        topCategory,
        topCount,
        total: triggers.length,
        distribution,
      },
      generatedAt: new Date(),
    },
    create: {
      userId,
      type: InsightType.TRIGGER_PATTERN,
      period: InsightPeriod.WEEKLY,
      title: "Padrão de Gatilhos",
      body: buildBody(topCategory, topCount, triggers.length),
      metadata: {
        topCategory,
        topCount,
        total: triggers.length,
        distribution,
      },
      periodStart: start,
      periodEnd: end,
    },
  });
}

function buildBody(top: TriggerType, count: number, total: number): string {
  const pct = Math.round((count / total) * 100);
  const label = TRIGGER_LABEL[top];
  let template = "";

  if (top == "OTHER") {
    template = `
    Gatilhos do tipo "${label}" foram os mais frequentes,
    representando ${pct}% dos registros do período.
  `
  } else {
    template = `
    Gatilhos de ${label} foram os mais frequentes,
    representando ${pct}% dos registros do período.
  `
  }

  return template.replace(/\s*\n\s*/g, " ").trim();
}
