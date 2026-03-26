/**
 * Feature-тесты сессий: создание сессии, валидация тела, запрет чужой сессии (403).
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../../tests/setup/test-app.js'
import { resetAndSeed, type TestSeed } from '../../tests/setup/test-db.js'

let ctx: TestSeed

beforeAll(async () => {
  ctx = await resetAndSeed()
})

describe('POST /api/sessions', () => {
  it('returns 401 without token', async () => {
    const res = await app.request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  it('returns 400 when categoryId has wrong type', async () => {
    const res = await app.request('/api/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ categoryId: 123 }),
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Validation error')
  })

  it('creates a session when authorized', async () => {
    const res = await app.request('/api/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as {
      session: { id: string; userId: string }
      questionCount: number
    }
    expect(body.session.userId).toBe(ctx.student.id)
    expect(body.questionCount).toBeGreaterThan(0)
  })
})

describe('GET /api/sessions/:id', () => {
  it('returns 403 when another user requests the session', async () => {
    const create = await app.request('/api/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    expect(create.status).toBe(200)
    const { session } = (await create.json()) as { session: { id: string } }

    const res = await app.request(`/api/sessions/${session.id}`, {
      headers: { Authorization: `Bearer ${ctx.otherStudentToken}` },
    })
    expect(res.status).toBe(403)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Forbidden')
  })

  it('returns 200 for owner', async () => {
    const create = await app.request('/api/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    const { session } = (await create.json()) as { session: { id: string } }

    const res = await app.request(`/api/sessions/${session.id}`, {
      headers: { Authorization: `Bearer ${ctx.studentToken}` },
    })
    expect(res.status).toBe(200)
  })
})
