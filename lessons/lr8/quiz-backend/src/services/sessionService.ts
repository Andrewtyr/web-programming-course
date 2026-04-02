import { prisma } from '../lib/prisma.js'
import { parseQuestionBank } from '../utils/questionBank.js'
import { scoringService } from './scoringService.js' 

/**
 * Доменная ошибка сервиса.
 * Маршрутный слой (routes/sessions.ts) ловит её и преобразует в HTTP-ответ:
 * - message -> тело ответа
 * - status  -> HTTP статус (400/403/404...)
 */
export class ServiceError extends Error {
  status: number

  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

// Нормализация значения к массиву строк:
// нужна, чтобы одинаково обрабатывать одиночный и множественный ответ.
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
    // Всё делаем в одной транзакции:
    // если любой шаг падает, БД откатит изменения, и состояние останется целостным.
    return prisma.$transaction(async (tx: any) => {
      // Ищем сессию (тест, который проходит человек)
      const session = await tx.session.findUnique({ where: { id: sessionId } })

      // Проверки безопасности и состояния сессии
      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)           // это не твой тест!
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      // Если время вышло — помечаем как просроченную
      if (session.expiresAt < new Date()) {
        await tx.session.update({ where: { id: sessionId }, data: { status: 'expired' } })
        throw new ServiceError('Session expired', 400)
      }

      // Ищем вопрос, на который пришёл ответ
      const question = await tx.question.findUnique({ where: { id: questionId } })
      if (!question) throw new ServiceError('Question not found', 404)

      const allowed = session.questionIds as string[] | null | undefined
      if (allowed && Array.isArray(allowed) && allowed.length > 0 && !allowed.includes(questionId)) {
        throw new ServiceError('Question is not part of this session', 400)
      }

      let score: number | null = null
      let isCorrect: boolean | null = null

      // Считаем баллы в зависимости от типа вопроса.
      // score/isCorrect для essay остаются null до ручной проверки админом.
      if (question.type === 'essay') {
        // Эссе — баллы ставит учитель позже, поэтому пока null
        score = null
        isCorrect = null
      } else if (question.type === 'single-select') {
        // Один правильный вариант
        const bank = parseQuestionBank(question.correctAnswer)
        const correct = bank.correct[0]
        const student = toStringArray(userAnswer)[0]
        isCorrect = Boolean(correct && student && correct === student)
        score = isCorrect ? question.points : 0
      } else if (question.type === 'multiple-select') {
        // Несколько правильных вариантов
        const bank = parseQuestionBank(question.correctAnswer)
        const correct = bank.correct
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

      // Сохраняем или обновляем ответ:
      // одна сессия -> один ответ на один вопрос (уникальная пара sessionId+questionId).
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
      // Ищем сессию вместе с текущими ответами для подсчёта итогового score
      const session = await tx.session.findUnique({
        where: { id: sessionId },
        include: { answers: true },
      })

      if (!session) throw new ServiceError('Session not found', 404)
      if (session.userId !== userId) throw new ServiceError('Forbidden', 403)
      if (session.status === 'completed') throw new ServiceError('Session already completed', 400)

      // Если время вышло — сессию закрываем как expired.
      // Это защищает от отправки результатов после дедлайна.
      if (session.expiresAt < new Date()) {
        const expired = await tx.session.update({
          where: { id: sessionId },
          data: { status: 'expired' },
          include: { answers: { include: { question: { select: { id: true, text: true, type: true, points: true } } } } },
        })
        return expired
      }

      // Считаем общий балл: суммируем score всех ответов (null считаем как 0).
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