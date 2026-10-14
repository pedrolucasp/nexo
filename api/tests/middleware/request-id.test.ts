import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from '@app/createApp'

const app = createApp()

describe('request id', () => {
  it('echoes an inbound X-Request-Id back on the response', async () => {
    const res = await request(app)
      .get('/moods')
      .set('X-Request-Id', 'test-request-id')

    expect(res.headers['x-request-id']).toBe('test-request-id')
  })

  it('generates a request id when the client does not send one', async () => {
    const res = await request(app).get('/moods')

    expect(res.headers['x-request-id']).toBeTruthy()
  })
})
