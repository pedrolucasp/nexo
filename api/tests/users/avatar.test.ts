import { describe, it, expect, afterAll, beforeEach, vi } from 'vitest'
import request from 'supertest'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { createApp } from '@app/createApp'
import s3 from '@app/lib/s3'
import {
  buildPrisma,
  cleanupTestDb,
  createTestUser,
  generateTestToken,
} from '../test-helper'

import { resetAvatarMock, setUploadedFile } from '../mocks/avatar'

const app = createApp()
const db = buildPrisma()
const mockedSend = vi.mocked(s3.send)

afterAll(() => db.$disconnect())

beforeEach(async () => {
  await cleanupTestDb(db)

  resetAvatarMock()
  mockedSend.mockClear()
})

const uploadedFile = {
  location: 'https://cdn.example.com/avatars/new.png',
  key: 'avatars/new.png',
  originalname: 'new.png',
  size: 1234,
  mimetype: 'image/png',
}

describe('POST /users/me/avatar', () => {
  it('stores the uploaded file on the user', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    setUploadedFile(uploadedFile)

    const res = await request(app)
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.key).toBe('avatars/new.png')
    expect(res.body.user.avatarURL).toBe(uploadedFile.location)
    expect(res.body.user.avatarKey).toBe('avatars/new.png')

    const dbUser = await db.user.findUnique({ where: { id: user.id } })

    expect(dbUser!.avatarURL).toBe(uploadedFile.location)
  })

  it('deletes the previous object when replacing an avatar', async () => {
    const user = await createTestUser(db)
    await db.user.update({
      where: { id: user.id },
      data: {
        avatarKey: 'avatars/old.png',
        avatarURL: 'https://cdn.example.com/avatars/old.png'
      },
    })

    const token = generateTestToken(user.id, user.email)
    setUploadedFile(uploadedFile)

    const res = await request(app)
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(mockedSend).toHaveBeenCalledOnce()
    expect(mockedSend).toHaveBeenCalledWith(expect.any(DeleteObjectCommand))
  })

  it('returns 400 when no file is present', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .post('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(400)
    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('returns 401 without a token', async () => {
    setUploadedFile(uploadedFile)

    const res = await request(app).post('/users/me/avatar')
    expect(res.status).toBe(401)
  })
})

describe('DELETE /users/me/avatar', () => {
  it('clears the stored avatar and deletes the object', async () => {
    const user = await createTestUser(db)

    await db.user.update({
      where: { id: user.id },
      data: {
        avatarKey: 'avatars/old.png',
        avatarURL: 'https://cdn.example.com/avatars/old.png'
      },
    })
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .delete('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.avatarKey).toBeNull()
    expect(res.body.user.avatarURL).toBeNull()
    expect(mockedSend).toHaveBeenCalledOnce()

    const dbUser = await db.user.findUnique({ where: { id: user.id } })

    expect(dbUser!.avatarKey).toBeNull()
  })

  it('is a no-op when there is no avatar to remove', async () => {
    const user = await createTestUser(db)
    const token = generateTestToken(user.id, user.email)

    const res = await request(app)
      .delete('/users/me/avatar')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body.user.id).toBe(user.id)
    expect(mockedSend).not.toHaveBeenCalled()
  })

  it('returns 401 without a token', async () => {
    const res = await request(app).delete('/users/me/avatar')
    expect(res.status).toBe(401)
  })
})
