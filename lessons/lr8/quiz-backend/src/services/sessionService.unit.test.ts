/**
 * Юнит-тесты для SessionService: ответ на вопрос в сессии.
 *
 * Настоящую базу не трогаем — подменяем её «заглушкой» (mock).
 * Так мы быстро проверяем: правильные ли сообщения об ошибках (404, 403, 400).
 *
 * Не импортируйте сложные библиотеки внутри vi.hoisted — иначе Vitest может упасть при старте тестов.
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

import { sessionService } from './sessionService.js'

// Перед каждым тестом: обнуляем вызовы заглушек.
// Транзакция в коде имитируется так: вызываем переданную функцию с тем же mock-объектом, что и «база».
beforeEach(() => {
  vi.resetAllMocks()
  prismaMock.$transaction.mockImplementation(async (fn: (tx: typeof prismaMock) => Promise<unknown>) =>
    fn(prismaMock)
  )
})

describe('SessionService.submitAnswer', () => {
  // В базе нет такой сессии — ожидаем ошибку «не найдено» (как HTTP 404).
  it('throws ServiceError 404 when session not found', async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce(null)

    await expect(
      sessionService.submitAnswer('sid', 'qid', 'A', 'uid')
    ).rejects.toMatchObject({ message: 'Session not found', status: 404 })
  })

  // Сессия есть, но принадлежит другому пользователю — чужое трогать нельзя (как HTTP 403).
  it('throws ServiceError 403 when session belongs to another user', async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      id: 'sid',
      userId: 'other',
      status: 'in_progress',
      expiresAt: new Date(Date.now() + 60_000),
    })

    await expect(
      sessionService.submitAnswer('sid', 'qid', 'A', 'uid')
    ).rejects.toMatchObject({ message: 'Forbidden', status: 403 })
  })

  // Сессия уже завершена — новые ответы не принимаем (как HTTP 400).
  it('throws ServiceError 400 when session already completed', async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
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
