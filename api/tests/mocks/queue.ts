import { vi } from 'vitest'

export type RecordedJob = {
  queue: string
  name: string
  data: unknown
  options?: unknown
}

// Every job enqueued through a mocked queue lands here, so specs can assert
// on what the controllers/services scheduled without a real Valkey
export const recordedJobs: RecordedJob[] = []

function createQueueMock(name: string) {
  return {
    name,

    add: vi.fn(async (jobName: string, data: unknown, options?: unknown) => {
      recordedJobs.push({ queue: name, name: jobName, data, options })

      return {}
    }),

    addBulk: vi.fn(async (jobs: { name: string; data: unknown; opts?: unknown }[] = []) => {
      for (const job of jobs) {
        recordedJobs.push({
          queue: name,
          name: job.name,
          data: job.data,
          options: job.opts
        })
      }
      return []
    }),

    getRepeatableJobs: vi.fn(async () => []),
    removeRepeatableByKey: vi.fn(async () => undefined),
  }
}

const queues = new Map<string, ReturnType<typeof createQueueMock>>()

export function getQueueMock(name: string) {
  if (!queues.has(name)) {
    queues.set(name, createQueueMock(name))
  }

  return queues.get(name)!
}

export function resetQueueMocks() {
  recordedJobs.length = 0

  for (const queue of queues.values()) {
    queue.add.mockClear()
    queue.addBulk.mockClear()
    queue.getRepeatableJobs.mockClear()
    queue.removeRepeatableByKey.mockClear()
  }
}
