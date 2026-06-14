import { Job } from "bullmq";
import {
  InsightJobName,
  InsightJobData,
  InsightPeriodPayload,
} from "@app/lib/queue/types";
import { getQueue } from "@app/lib/queue/QueueRegistry";
import { prisma } from "@app/lib/prisma";
import { processMoodTrend } from "@app/lib/queue/processors/insights/moodTrend";
import { processEnergySleep } from "@app/lib/queue/processors/insights/energySleep";
import { processTriggerPattern } from "@app/lib/queue/processors/insights/triggerPattern";
import { processDailyEnergy } from "@app/lib/queue/processors/insights/dailyEnergy";
import { processDailySleep } from "@app/lib/queue/processors/insights/dailySleep";

export async function insightProcessor(
  job: Job<InsightJobData["data"]>,
): Promise<void> {
  console.log(`Insight job ${job.name} started`);

  switch (job.name as InsightJobName) {
    case InsightJobName.FanOut:
      return fanOut();

    case InsightJobName.MoodTrend:
      return processMoodTrend(job.data as InsightPeriodPayload);

    case InsightJobName.EnergySleep:
      return processEnergySleep(job.data as InsightPeriodPayload);

    case InsightJobName.TriggerPattern:
      return processTriggerPattern(job.data as InsightPeriodPayload);

    case InsightJobName.DailyEnergy:
      return processDailyEnergy(job.data as InsightPeriodPayload);

    case InsightJobName.DailySleep:
      return processDailySleep(job.data as InsightPeriodPayload);

    default:
      throw new Error(`Unknown insight job: ${job.name}`);
  }
}

async function fanOut(): Promise<void> {
  const users = await prisma.user.findMany({
    where: { active: true },
    select: { id: true },
  });

  const queue = getQueue("insights");
  const periodEnd = new Date();
  const periodStart = new Date();
  periodStart.setDate(periodEnd.getDate() - 7);

  const payload: Omit<InsightPeriodPayload, "userId"> = {
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
  };

  await queue.addBulk(
    users.flatMap((u) => [
      { name: InsightJobName.MoodTrend, data: { userId: u.id, ...payload } },
      { name: InsightJobName.EnergySleep, data: { userId: u.id, ...payload } },
      {
        name: InsightJobName.TriggerPattern,
        data: { userId: u.id, ...payload },
      },
    ]),
  );
}
