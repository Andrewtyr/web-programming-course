/**
 * Сервис прохождения квиза: ответ на вопрос (транзакция, проверка владельца сессии, подсчёт баллов
 * через `scoringService`) и завершение сессии с итоговым score.
 * Ошибки домена — `ServiceError` с HTTP-статусом для маршрутов.
 */
import { prisma } from '../lib/prisma.js'         
import { scoringService } from './scoringService.js' 

// вывод ошибки 
export class ServiceError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

//превращают любой ответ в массив строк или в JSON
function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v))
  if (typeof value === 'string') return [value]
  return []
}

function toJson(value: unknown) {
  return value as any
}

// Главный сервис — всё, что связано с прохождением теста (сессией)
class SessionService {
  // Отправить ответ на один вопрос (самая важная функция!)
  async submitAnswer(sessionId: string, questionId: string, userAnswer: unknown, userId: string) {
    // Всё делаем в одной транзакции — если что-то сломается, ничего не сохранится
    return prisma.$transaction(async (tx: any) => {
      // Ищем сессию (тест, который проходит человек)
      const session = await tx.session.findUnique({ where: { id: sessionId } })

      // Проверки безопасности
      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)           // это не твой тест!
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      // Если время вышло — помечаем как просроченную
      if (session.expiresAt < new Date()) {
        await tx.session.update({ where: { id: sessionId }, data: { status: 'expired' } })
        throw new ServiceError('Session expired', 400)
      }

      // Ищем сам вопрос
      const question = await tx.question.findUnique({ where: { id: questionId } })
      if (!question) throw new ServiceError('Question not found', 404)

      let score: number | null = null
      let isCorrect: boolean | null = null

      // Считаем баллы в зависимости от типа вопроса
      if (question.type === 'essay') {
        // Эссе — баллы ставит учитель позже, поэтому пока null
        score = null
        isCorrect = null
      } else if (question.type === 'single-select') {
        // Один правильный вариант
        const correct = toStringArray(question.correctAnswer)[0]
        const student = toStringArray(userAnswer)[0]
        isCorrect = Boolean(correct && student && correct === student)
        score = isCorrect ? question.points : 0
      } else if (question.type === 'multiple-select') {
        // Несколько правильных вариантов
        const correct = toStringArray(question.correctAnswer)
        const student = toStringArray(userAnswer)

        // scoringService считает, сколько совпало
        const raw = scoringService.scoreMultipleSelect(correct, student)
        const maxRaw = Math.max(correct.length, 1)
        const normalized = (raw / maxRaw) * question.points

        score = Number(Math.max(0, normalized).toFixed(2))  // округляем до 2 знаков
        isCorrect = student.length === correct.length && student.every((ans) => correct.includes(ans))
      } else {
        throw new ServiceError('Unsupported question type', 400)
      }

      // Сохраняем или обновляем ответ в базе
      const answer = await tx.answer.upsert({
        where: { sessionId_questionId: { sessionId, questionId } },
        update: { userAnswer: toJson(userAnswer), score, isCorrect },
        create: { sessionId, questionId, userAnswer: toJson(userAnswer), score, isCorrect },
      })

      return answer
    })
  }

  // Завершить тест — посчитать все баллы и закрыть сессию
  async submitSession(sessionId: string, userId: string) {
    return prisma.$transaction(async (tx: any) => {
      // Ищем сессию вместе со всеми ответами
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      })

      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      // Если время вышло — просто помечаем как expired и возвращаем
      if (session.expiresAt < new Date()) {
        const expired = await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
          include: { answers: { include: { question: { select: { id: true, text: true, type: true, points: true } } } } },
        })
        return expired
      }

      // Считаем общий балл: суммируем все score из ответов
      const totalScore = Number(
        session.answers
          .reduce((sum: number, a: { score: number | null }) => sum + (a.score ?? 0), 0)
          .toFixed(2)
      )

      // Закрываем сессию, ставим статус, время завершения и общий балл
      const completed = await tx.session.update({
        where: { id: sessionId },
        data: {
          status: 'completed',
          completedAt: new Date(),
          score: totalScore,
        },
        include: {
          answers: {
            include: { question: { select: { id: true, text: true, type: true, points: true } } },
          },
        },
      })

      return completed
    })
  }
}

// Экспортируем готовый сервис, чтобы использовать в routes/sessions.ts
export const sessionService = new SessionService()