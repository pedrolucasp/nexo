import { Worker, WorkerOptions, Processor } from 'bullmq';
import { QueueName } from '@app/lib/queue/QueueRegistry';
import { mailProcessor } from  '@app/lib/queue/processors/mail';

type ProcessorMap = Record<QueueName, Processor>;

const processorMap: ProcessorMap = {
  mail: mailProcessor
};

// Per-queue concurrency
// TODO: When we process images, we need to bump for that queue
const concurrencyMap: Record<QueueName, number> = {
  mail: 10
};

const workers: Worker[] = [];

export function bootWorkers(): void {
  for (const [name, processor] of Object.entries(processorMap)) {
    const queueName = name as QueueName;

    const worker = new Worker(queueName, processor, {
      connection: {
        host: process.env.VALKEY_HOST,
        port: Number(process.env.VALKEY_PORT)
      },
      concurrency: concurrencyMap[queueName],
    } satisfies WorkerOptions);

    worker.on('failed', (job, err) => {
      console.error(`[${queueName}] job ${job?.id} failed:`, err.message);
    });

    workers.push(worker);
  }
}

export async function closeAllWorkers(): Promise<void> {
  await Promise.all(workers.map(w => w.close()));
}
