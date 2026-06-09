import { Worker, WorkerOptions, Processor } from "bullmq";
import { getQueue, QueueName } from "@app/lib/queue/QueueRegistry";
import { mailProcessor } from "@app/lib/queue/processors/mail";
import { insightProcessor } from "@app/lib/queue/processors/insights";
import { InsightJobName } from "@app/lib/queue/types";

type ProcessorMap = Record<QueueName, Processor>;

const processorMap: ProcessorMap = {
  mail: mailProcessor,
  insights: insightProcessor,
};

// Per-queue concurrency
// TODO: When we process images, we need to bump for that queue
const concurrencyMap: Record<QueueName, number> = {
  mail: 10,
  insights: 5,
};

const workers: Worker[] = [];

export function bootWorkers(): void {
  console.log("Booting workers...");
  for (const [name, processor] of Object.entries(processorMap)) {
    const queueName = name as QueueName;

    console.log(`Worker ${queueName} booting...`);
    const worker = new Worker(queueName, processor, {
      connection: {
        host: process.env.VALKEY_HOST,
        port: Number(process.env.VALKEY_PORT),
      },
      concurrency: concurrencyMap[queueName],
    } satisfies WorkerOptions);

    worker.on("failed", (job, err) => {
      console.error(`[${queueName}] job ${job?.id} failed:`, err.message);
    });

    workers.push(worker);
  }
}

export async function scheduleInsights(): Promise<void> {
  const queue = getQueue("insights");
  await queue.add(
    InsightJobName.FanOut,
    {},
    {
      repeat: { pattern: "0 3 * * 1" }, // Mondays at 3am
      jobId: "insight-fan-out-weekly", // prevents duplicate repeatable jobs on restart
    },
  );
}

export async function closeAllWorkers(): Promise<void> {
  await Promise.all(workers.map((w) => w.close()));
}
