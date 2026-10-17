import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'

const app = createApp()

// The unauthenticated demo broadcast was deleted once notifications became
// stored records; this guards against reintroducing it.
describe('POST /moods/notify', () => {
  it('is no longer routed', async () => {
    const res = await request(app).post('/moods/notify').send({})

    expect(res.status).toBe(404)
  })
})
