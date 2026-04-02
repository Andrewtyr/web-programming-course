/**
 * Маршруты `/api/sessions`: создание сессии теста, просмотр, отправка ответа, завершение.
 * Совместимость с LR5 OpenAPI: CreateSessionRequest, SessionResponse, SubmitAnswerRequest,
 * AnswerResult / AnswerPending, SessionResults.
 * Все защищённые действия требуют валидный JWT; бизнес-логика в `sessionService`.
 */
import type { Prisma } from '@prisma/client'
import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { requireAuth, type AuthEnv } from '../middleware/auth.js'
import { ServiceError, sessionService } from '../services/sessionService.js'
import { getOptionsForPreview, parseQuestionBank } from '../utils/questionBank.js'
import {
  toAnswerPending,
  toAnswerResult,
  toSessionResponse,
  toSessionResults,
} from '../utils/sessionApiMappers.js'
import {
  AnswerSchema,
  CreateSessionSchema,
  SubmitSessionSchema,
} from '../utils/validation.js'

const sessionsRoutes = new Hono<AuthEnv>({ strict: false })
sessionsRoutes.use('*', requireAuth)

/** Как в `loadSessionQuestions`: вопрос + имя категории для превью. */
type SessionQuestionWithCategory = Prisma.QuestionGetPayload<{
  include: { category: { select: { name: true } } }
}>

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Загружает вопросы сессии по сохранённому порядку `questionIds` (сессия фиксирует набор попытки).
 */
async function loadSessionQuestions(session: object): Promise<SessionQuestionWithCategory[]> {
  const ids = (session as { questionIds?: unknown }).questionIds as string[] | null | undefined
  if (!ids || !Array.isArray(ids) || ids.length === 0) return []
  const qs = await prisma.question.findMany({
    where: { id: { in: ids } },
    include: { category: { select: { name: true } } },
  })
  const order = new Map(ids.map((id, i) => [id, i]))
  return qs.sort(
    (a: SessionQuestionWithCategory, b: SessionQuestionWithCategory) =>
      (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
  )
}

/**
 * Приводит тело запроса (индексы `selectedOptions`, `text`, legacy `userAnswer`) к значению для сохранения в БД.
 */
function resolveUserAnswer(
  question: {
    id: string
    type: string
    correctAnswer: unknown
  },
  body: {
    userAnswer?: unknown
    text?: string
    selectedOptions?: number[]
  }
): unknown {
  if (body.userAnswer !== undefined && body.userAnswer !== null) {
    return body.userAnswer
  }
  if (question.type === 'essay') {
    if (body.text === undefined || body.text === '') {
      throw new ServiceError('text is required for essay questions', 400)
    }
    return body.text
  }
  const bank = parseQuestionBank(question.correctAnswer)
  const options = bank.options.length > 0 ? bank.options : getOptionsForPreview(question.correctAnswer)
  if (!body.selectedOptions?.length) {
    throw new ServiceError('selectedOptions is required for this question', 400)
  }
  if (options.length === 0) {
    throw new ServiceError(
      'Question has no options list; use userAnswer in body or store { options, correct } in correctAnswer',
      400
    )
  }
  const texts = body.selectedOptions.map((i) => {
    if (i < 0 || i >= options.length) {
      throw new ServiceError('Invalid option index', 400)
    }
    return options[i]
  })
  if (question.type === 'single-select') {
    return texts[0]
  }
  return texts
}

// GET /api/sessions/questions — список вопросов (опционально по categoryId)
sessionsRoutes.get('/questions', async (c) => {
  const categoryId = c.req.query('categoryId')
  const where = categoryId ? { categoryId } : undefined

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      text: true,
      type: true,
      points: true,
      categoryId: true,
      correctAnswer: true,
    },
  })

  const items = questions.map((q) => ({
    id: q.id,
    text: q.text,
    type: q.type,
    points: q.points,
    categoryId: q.categoryId,
    options: getOptionsForPreview(q.correctAnswer),
  }))

  return c.json({ items, total: items.length })
})

// POST /api/sessions — создать сессию (LR5: 201 + SessionResponse)
sessionsRoutes.post('/', async (c) => {
  const userId = c.get('userId')

  const body = await c.req.json().catch(() => ({}))
  const parsed = CreateSessionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const { categoryId, categoryIds, questionCount } = parsed.data
  const cats =
    categoryIds && categoryIds.length > 0
      ? categoryIds
      : categoryId
        ? [categoryId]
        : undefined
  const where =
    cats && cats.length > 0 ? { categoryId: { in: cats } } : undefined

  const pool = await prisma.question.findMany({
    where,
    select: { id: true },
  })

  const take = questionCount ?? Math.min(10, pool.length)
  if (pool.length === 0) {
    return c.json({ error: 'No questions found for this quiz/category' }, 400)
  }
  if (take > pool.length) {
    return c.json(
      { error: `Not enough questions: need ${take}, have ${pool.length}` },
      400
    )
  }

  const pickedIds = shuffle(pool.map((p) => p.id)).slice(0, take)

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      questionIds: pickedIds,
    } as Prisma.SessionUncheckedCreateInput,
  })

  const questions = await loadSessionQuestions(session)
  const answers = await prisma.answer.findMany({
    where: { sessionId: session.id },
    select: { questionId: true, score: true },
  })

  return c.json(toSessionResponse(session, questions, answers), 201)
})

// GET /api/sessions/:id/results — итоги (до /:id, чтобы не перехватывалось как id)
sessionsRoutes.get('/:id/results', async (c) => {
  const userId = c.get('userId')
  const { id: sessionId } = c.req.param()

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      answers: {
        include: {
          question: { include: { category: { select: { name: true } } } },
        },
      },
    },
  })

  if (!session) return c.json({ error: 'Session not found' }, 404)
  if (session.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const questions = await loadSessionQuestions(session)
  return c.json(toSessionResults(session, questions))
})

// GET /api/sessions/:id — информация о сессии (SessionResponse)
sessionsRoutes.get('/:id', async (c) => {
  const userId = c.get('userId')
  const { id } = c.req.param()

  const session = await prisma.session.findUnique({ where: { id } })
  if (!session) return c.json({ error: 'Session not found' }, 404)
  if (session.userId !== userId) return c.json({ error: 'Forbidden' }, 403)

  const questions = await loadSessionQuestions(session)
  const answers = await prisma.answer.findMany({
    where: { sessionId: id },
    select: { questionId: true, score: true },
  })

  return c.json(toSessionResponse(session, questions, answers))
})

// POST /api/sessions/:id/answers — ответ на вопрос
sessionsRoutes.post('/:id/answers', async (c) => {
  const userId = c.get('userId')
  const { id: sessionId } = c.req.param()

  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = AnswerSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  if (parsed.data.sessionId && parsed.data.sessionId !== sessionId) {
    return c.json({ error: 'sessionId in body does not match path id' }, 400)
  }

  const question = await prisma.question.findUnique({
    where: { id: parsed.data.questionId },
    include: { category: { select: { name: true } } },
  })
  if (!question) return c.json({ error: 'Question not found' }, 404)

  let userAnswer: unknown
  try {
    userAnswer = resolveUserAnswer(question, parsed.data)
  } catch (e) {
    if (e instanceof ServiceError) {
      return c.json({ error: e.message }, e.status as 400)
    }
    throw e
  }

  try {
    const answer = await sessionService.submitAnswer(
      sessionId,
      parsed.data.questionId,
      userAnswer,
      userId
    )

    if (question.type === 'essay') {
      return c.json(toAnswerPending(answer, question), 202)
    }

    return c.json(toAnswerResult(answer, question), 200)
  } catch (error) {
    if (error instanceof ServiceError) {
      return c.json({ error: error.message }, error.status as 400 | 401 | 403 | 404)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// POST /api/sessions/:id/submit — завершить сессию (LR5: SessionResults, тело опционально)
sessionsRoutes.post('/:id/submit', async (c) => {
  const userId = c.get('userId')
  const { id: sessionId } = c.req.param()

  const body = await c.req.json().catch(() => ({}))
  const parsed = SubmitSessionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }
  if (parsed.data.sessionId && parsed.data.sessionId !== sessionId) {
    return c.json({ error: 'sessionId in body does not match path id' }, 400)
  }

  try {
    const session = await sessionService.submitSession(sessionId, userId)
    const questions = await loadSessionQuestions(session)
    const full = await prisma.session.findUnique({
      where: { id: session.id },
      include: {
        answers: {
          include: {
            question: { include: { category: { select: { name: true } } } },
          },
        },
      },
    })
    if (!full) return c.json({ error: 'Session not found' }, 404)
    return c.json(toSessionResults(full, questions), 200)
  } catch (error) {
    if (error instanceof ServiceError) {
      return c.json({ error: error.message }, error.status as 400 | 401 | 403 | 404)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
})

export default sessionsRoutes
