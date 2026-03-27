/**
 * Фича-тесты входа: как настоящий клиент бьёмся в API (без браузера).
 * Поднимается реальное приложение и тестовая база; в начале в неё кладут пользователей и токены.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../../tests/setup/test-app.js'
import { resetAndSeed, type TestSeed } from '../../tests/setup/test-db.js'

let ctx: TestSeed

// Один раз перед всеми тестами в файле: готовим БД и токены (студент и т.д.).
beforeAll(async () => {
  ctx = await resetAndSeed()
})

describe('GET /api/auth/me', () => {
  // Не прислали токен — «кто ты?» — доступ закрыт (401).
  it('returns 401 without Authorization header', async () => {
    const res = await app.request('/api/auth/me')
    expect(res.status).toBe(401)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Unauthorized')
  })

  // Прислали не похожее на JWT — токен битый (401, другое сообщение об ошибке).
  it('returns 401 for malformed Bearer token', async () => {
    const res = await app.request('/api/auth/me', {
      headers: { Authorization: 'Bearer not-a-valid-jwt' },
    })
    expect(res.status).toBe(401)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Invalid token')
  })

  // Нормальный токен студента — возвращаем его профиль (200).
  it('returns 200 with user for valid token', async () => {
    const res = await app.request('/api/auth/me', {
      headers: { Authorization: `Bearer ${ctx.studentToken}` },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { user: { id: string; email: string | null } }
    expect(body.user.id).toBe(ctx.student.id)
    expect(body.user.email).toBe(ctx.student.email)
  })
})

describe('POST /api/auth/github/callback', () => {
  // Тело запроса — битый JSON (оборвалась скобка) — честно говорим «JSON невалидный» (400).
  it('returns 400 for invalid JSON body', async () => {
    const res = await app.request('/api/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{',
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Invalid JSON body')
  })

  // Код пустой — Zod не пускает, до GitHub даже не идём (400).
  it('returns 400 when code fails validation', async () => {
    const res = await app.request('/api/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: '' }),
    })
    expect(res.status).toBe(400)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Validation error')
  })

  // Тестовый код test_... — специальная ветка без реального GitHub: выдаём токен и пользователя (200).
  it('returns token and user for test_ OAuth code', async () => {
    const res = await app.request('/api/auth/github/callback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'test_callback_user' }),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { token: string; user: { githubId: string } }
    expect(body.token.length).toBeGreaterThan(10)
    expect(body.user.githubId).toBe('test_callback_user')
  })
})
