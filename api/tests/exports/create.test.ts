import { describe, it, expect, afterAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'
import { ExportJobName } from '@app/lib/queue/types'
import { buildPrisma, cleanupTestDb, createTestUser, generateTestToken } from '../test-helper'
import { recordedJobs, resetQueueMocks } from '../mocks/queue'

const app = createApp()
const db = buildPrisma()

afterAll(() => db.$disconnect())
beforeEach(async () => {
  await cleanupTestDb(db)

  resetQueueMocks()
})

describe('POST /exports', () => {
  it('returns 401 without a token and enqueues nothing', async () => {
    const res = await request(app).post('/exports')

    expect(res.status).toBe(401)
    expect(recordedJobs).toHaveLength(0)
  })

  it('enqueues exactly one export job for the authenticated user', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/exports')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(202)
    expect(res.body.message).toBeTruthy()

    expect(recordedJobs).toHaveLength(1)
    expect(recordedJobs[0]).toEqual(
      expect.objectContaining({
        queue: 'exports',
        name: ExportJobName.Data,
        data: { userId: user.id },
      })
    )
  })
})
