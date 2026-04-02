import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'                    // связь с базой
import { requireAdmin } from '../middleware/admin.js'       // проверка: только админ может сюда заходить
import { BatchQuestionsSchema, GradeSchema, QuestionSchema } from '../utils/validation.js'  // Zod-правила проверки

const adminRoutes = new Hono({ strict: false })  // группа маршрутов для /api/admin

// Все маршруты ниже требуют, чтобы пользователь был админом
adminRoutes.use('*', requireAdmin)

// GET /api/admin/questions — список всех вопросов (с пагинацией)
adminRoutes.get('/questions', async (c) => {
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1)     // номер страницы
  const limit = Math.min(Math.max(Number(c.req.query('limit') ?? '20'), 1), 100)  // сколько на странице
  const skip = (page - 1) * limit

  // Считаем общее количество и берём нужную порцию вопросов
  const [total, questions] = await Promise.all([
    prisma.question.count(),
    prisma.question.findMany({
      orderBy: { createdAt: 'desc' },  // новые сверху
      skip,
      take: limit,
      select: {
        id: true, text: true, type: true, points: true, categoryId: true,
        createdAt: true, updatedAt: true,
        category: { select: { id: true, name: true, slug: true } },  // тема вопроса
        _count: { select: { answers: true } },  // сколько ответов дали ученики
      },
    }),
  ])

  return c.json({
    items: questions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

// POST /api/admin/questions — добавить один новый вопрос
adminRoutes.post('/questions', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = QuestionSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const q = parsed.data

  const question = await prisma.question.create({
    data: {
      text: q.text,
      type: q.type,
      categoryId: q.categoryId,
      correctAnswer: (q.correctAnswer ?? null) as any,
      points: q.points,
    },
  })

  return c.json({ question }, 201)  // 201 = created
})

// POST /api/admin/questions/batch — добавить сразу много вопросов
adminRoutes.post('/questions/batch', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = BatchQuestionsSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const data = parsed.data.questions.map((q) => ({
    text: q.text,
    type: q.type,
    categoryId: q.categoryId,
    correctAnswer: (q.correctAnswer ?? null) as any,
    points: q.points,
  }))

  const result = await prisma.question.createMany({ data })

  return c.json({ inserted: result.count }, 201)
})

// PUT /api/admin/questions/:id — обновить существующий вопрос
adminRoutes.put('/questions/:id', async (c) => {
  const { id } = c.req.param()
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  // Можно обновлять частично, но хотя бы одно поле должно быть
  const updateSchema = QuestionSchema.partial().refine(
    (v) => Object.keys(v).length > 0,
    'At least one field is required'
  )

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const existing = await prisma.question.findUnique({ where: { id } })
  if (!existing) return c.json({ error: 'Question not found' }, 404)

  const d = parsed.data as Record<string, unknown>

  const question = await prisma.question.update({
    where: { id },
    data: {
      ...(d.text !== undefined ? { text: d.text as string } : {}),
      ...(d.type !== undefined ? { type: d.type as string } : {}),
      ...(d.categoryId !== undefined ? { categoryId: d.categoryId as string } : {}),
      ...(d.correctAnswer !== undefined ? { correctAnswer: d.correctAnswer as any } : {}),
      ...(d.points !== undefined ? { points: d.points as number } : {}),
    },
  })

  return c.json({ question })
})

// GET /api/admin/answers/pending — список неотмеченных эссе-ответов (с пагинацией)
adminRoutes.get('/answers/pending', async (c) => {
  const page = Math.max(Number(c.req.query('page') ?? '1'), 1)
  const limit = Math.min(Math.max(Number(c.req.query('limit') ?? '20'), 1), 100)
  const skip = (page - 1) * limit

  const where = { score: null, question: { type: 'essay' } }

  const [total, answers] = await Promise.all([
    prisma.answer.count({ where }),
    prisma.answer.findMany({
      where,
      orderBy: { createdAt: 'asc' },  // старые сверху
      skip,
      take: limit,
      select: {
        id: true, userAnswer: true, createdAt: true,
        question: { select: { id: true, text: true, points: true, type: true } },
        session: {
          select: {
            id: true, userId: true, status: true, startedAt: true,
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    }),
  ])

  return c.json({
    items: answers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
})

// POST /api/admin/answers/:id/grade — поставить баллы за эссе
adminRoutes.post('/answers/:id/grade', async (c) => {
  const { id } = c.req.param()

  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400)

  const parsed = GradeSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: 'Validation error', details: parsed.error.flatten() }, 400)
  }

  const { score } = parsed.data

  try {
    const result = await prisma.$transaction(async (tx: any) => {
      const answer = await tx.answer.findUnique({
        where: { id },
        include: { question: true, session: true },
      })

      if (!answer) throw new Error('Answer not found')
      if (answer.question.type !== 'essay') throw new Error('Only essay answers can be graded')

      const updatedAnswer = await tx.answer.update({
        where: { id },
        data: { score, isCorrect: null },
      })

      // Проверяем, все ли эссе в сессии оценены
      const ungradedEssayCount = await tx.answer.count({
        where: {
          sessionId: answer.sessionId,
          question: { type: 'essay' },
          score: null,
        },
      })

      let updatedSession = null

      if (ungradedEssayCount === 0) {
        // Если все эссе оценены — пересчитываем общий балл сессии
        const allAnswers = await tx.answer.findMany({
          where: { sessionId: answer.sessionId },
          select: { score: true },
        })

        const totalScore = Number(
          allAnswers.reduce((sum: number, a: { score: number | null }) => sum + (a.score ?? 0), 0).toFixed(2)
        )

        updatedSession = await tx.session.update({
          where: { id: answer.sessionId },
          data: { score: totalScore },
        })
      }

      return { updatedAnswer, updatedSession }
    })

    return c.json(result)
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    if (message === 'Answer not found') return c.json({ error: message }, 404)
    if (message === 'Only essay answers can be graded') return c.json({ error: message }, 400)
    return c.json({ error: 'Internal server error' }, 500)
  }
})

// GET /api/admin/students/:userId/stats — статистика по ученику
adminRoutes.get('/students/:userId/stats', async (c) => {
  const { userId } = c.req.param()

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true },
  })

  if (!user) return c.json({ error: 'User not found' }, 404)

  const [totalSessions, completedSessions, scoreAgg] = await Promise.all([
    prisma.session.count({ where: { userId } }),
    prisma.session.count({ where: { userId, status: 'completed' } }),
    prisma.session.aggregate({
      where: { userId, status: 'completed' },
      _avg: { score: true },
      _sum: { score: true },
    }),
  ])

  return c.json({
    student: user,
    stats: {
      totalSessions,
      completedSessions,
      averageScore: Number((scoreAgg._avg.score ?? 0).toFixed(2)),
      totalScore: Number((scoreAgg._sum.score ?? 0).toFixed(2)),
    },
  })
})

export default adminRoutes