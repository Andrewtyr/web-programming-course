/**
 * Фича-тесты сессий квиза: создать попытку, прочитать её.
 * Проверяем и «всё хорошо», и типичные ошибки (нет токена, не тот тип данных, чужая сессия).
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../../tests/setup/test-app.js'
import { resetAndSeed, type TestSeed } from '../../tests/setup/test-db.js'

let ctx: TestSeed

// Перед тестами: заполняем тестовую БД и создаём два студента с разными токенами (чтобы проверить «чужая сессия»).
beforeAll(async () => {
  ctx = await resetAndSeed()
})

describe('POST /api/sessions', () => {
  // Без токена создать сессию нельзя — неизвестно, кто ты (401).
  it('returns 401 without token', async () => {
    const res = await app.request('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    expect(res.status).toBe(401)
  })

  // categoryId должен быть строкой; число 123 — ошибка валидации (400), сервер не падает.
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

  // Залогиненный студент создаёт сессию — она привязана к нему, вопросы есть (200).
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
  // Студент А создал сессию; студент Б с другим токеном не может её читать (403 — доступ запрещён).
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

  // Владелец сессии может открыть свою попытку (200).
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
