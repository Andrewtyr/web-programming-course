/**
 * Feature-тесты админки: 401 без токена, 403 для студента, 200 для админа на списке вопросов.
 */
import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../../tests/setup/test-app.js'
import { resetAndSeed, type TestSeed } from '../../tests/setup/test-db.js'

let ctx: TestSeed

beforeAll(async () => {
  ctx = await resetAndSeed()
})

describe('GET /api/admin/questions', () => {
  it('returns 401 without token', async () => {
    const res = await app.request('/api/admin/questions')
    expect(res.status).toBe(401)
  })

  it('returns 403 for student role', async () => {
    const res = await app.request('/api/admin/questions', {
      headers: { Authorization: `Bearer ${ctx.studentToken}` },
    })
    expect(res.status).toBe(403)
    const body = (await res.json()) as { error: string }
    expect(body.error).toBe('Forbidden: admin only')
  })

  it('returns 200 for admin', async () => {
    const res = await app.request('/api/admin/questions', {
      headers: { Authorization: `Bearer ${ctx.adminToken}` },
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { items: unknown[]; pagination: { total: number } }
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.pagination.total).toBeGreaterThanOrEqual(0)
  })
})
