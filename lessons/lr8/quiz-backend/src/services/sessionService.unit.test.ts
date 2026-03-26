/**
 * Unit-тесты `SessionService`: Prisma замокан через `vi.mock` + `vi.fn()` (без реальной БД).
 * Проверяем доменные ошибки (404/403/400) при невалидной сессии.
 *
 * Важно: не вызывать `mockDeep` / другие импорты из пакетов внутри `vi.hoisted` —
 * импорты ещё не инициализированы → ReferenceError `__vi_import_*__`.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    $transaction: vi.fn(),
    session: { findUnique: vi.fn() },
    question: { findUnique: vi.fn() },
    answer: { upsert: vi.fn() },
  }
  return { prismaMock }
})

vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }))

import { prisma } from '../lib/prisma.js'
import { sessionService } from './sessionService.js'

/** После `vi.mock` Prisma — мок; типы остаются от реального клиента. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pm = prisma as any

beforeEach(() => {
  vi.resetAllMocks()
  pm.$transaction.mockImplementation(async (fn: (tx: typeof pm) => Promise<unknown>) =>
    fn(pm)
  )
})

describe('SessionService.submitAnswer', () => {
  it('throws ServiceError 404 when session not found', async () => {
    pm.session.findUnique.mockResolvedValueOnce(null)

    await expect(
      sessionService.submitAnswer('sid', 'qid', 'A', 'uid')
    ).rejects.toMatchObject({ message: 'Session not found', status: 404 })
  })

  it('throws ServiceError 403 when session belongs to another user', async () => {
    pm.session.findUnique.mockResolvedValueOnce({
      id: 'sid',
      userId: 'other',
      status: 'in_progress',
      expiresAt: new Date(Date.now() + 60_000),
    })

    await expect(
      sessionService.submitAnswer('sid', 'qid', 'A', 'uid')
    ).rejects.toMatchObject({ message: 'Forbidden', status: 403 })
  })

  it('throws ServiceError 400 when session already completed', async () => {
    pm.session.findUnique.mockResolvedValueOnce({
      id: 'sid',
      userId: 'uid',
      status: 'completed',
      expiresAt: new Date(Date.now() + 60_000),
    })

    await expect(
      sessionService.submitAnswer('sid', 'qid', 'A', 'uid')
    ).rejects.toMatchObject({ message: 'Session already completed', status: 400 })
  })
})
