import { Queue, QueueOptions } from "bullmq";

export type QueueName = "mail" | "insights";

const queues = new Map<QueueName, Queue>();

const defaultOpts: QueueOptions = {
  connection: {
    host: process.env.VALKEY_HOST,
    port: Number(process.env.VALKEY_PORT),
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
};

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    queues.set(name, new Queue(name, defaultOpts));
  }

  return queues.get(name)!;
}

export async function closeAllQueues(): Promise<void> {
  await Promise.all([...queues.values()].map((q) => q.close()));
}
