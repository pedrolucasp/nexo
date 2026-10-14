import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { NextFunction, Request, Response } from 'express'
import { createApp } from '@app/createApp'
import { errorHandler } from '@app/middleware/errorHandler'
import { DomainError } from '@app/lib/errors/base'

const app = createApp()

function buildRequest() {
  return { log: { error: vi.fn() } }
}

function buildResponse() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  }
}

describe('errorHandler', () => {
  it('returns 500 for an error that reaches it through the app', async () => {
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ')

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: 'Internal server error' })
  })

  it('logs the error through the request logger', () => {
    const req = buildRequest()
    const res = buildResponse()
    const err = new Error('kaboom')

    errorHandler(
      err,
      req as unknown as Request,
      res as unknown as Response,
      vi.fn() as unknown as NextFunction,
    )

    expect(req.log.error).toHaveBeenCalledWith({ err }, 'request failed')
    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('maps domain errors to their status and message', () => {
    const req = buildRequest()
    const res = buildResponse()

    errorHandler(
      new DomainError('nope', 409),
      req as unknown as Request,
      res as unknown as Response,
      vi.fn() as unknown as NextFunction,
    )

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.json).toHaveBeenCalledWith({ error: 'nope' })
  })
})
