import type { Answer, Question, Session } from '@prisma/client'
import { getOptionsForPreview, parseQuestionBank } from './questionBank.js'

type QuestionWithCategory = Question & { category?: { name: string } | null }

export function mapSessionStatusToApi(status: string): 'active' | 'completed' | 'expired' {
  if (status === 'in_progress') return 'active'
  if (status === 'completed') return 'completed'
  return 'expired'
}

/** LR5 / OpenAPI допускает только multiple-select и essay в превью */
export function mapQuestionTypeToApi(type: string): 'multiple-select' | 'essay' {
  if (type === 'essay') return 'essay'
  return 'multiple-select'
}

export function toQuestionPreview(q: QuestionWithCategory) {
  const opts = getOptionsForPreview(q.correctAnswer)
  return {
    id: q.id,
    type: mapQuestionTypeToApi(q.type),
    question: q.text,
    difficulty: 'medium' as const,
    categoryId: q.categoryId,
    ...(q.category?.name != null ? { categoryName: q.category.name } : {}),
    maxPoints: q.points,
    options: opts,
    ...(q.type === 'essay'
      ? { minLength: 10, maxLength: 1000 }
      : {}),
  }
}

function sumQuestionPoints(questions: Question[]): number {
  return questions.reduce((s, q) => s + q.points, 0)
}

function sumAnsweredScore(answers: { score: number | null }[]): number {
  return Number(
    answers.reduce((s, a) => s + (a.score ?? 0), 0).toFixed(2)
  )
}

export function toSessionResponse(
  session: Session,
  questions: QuestionWithCategory[],
  answers: Pick<Answer, 'questionId' | 'score'>[]
) {
  const answeredCount = answers.length
  const maxScore = sumQuestionPoints(questions)
  const currentScore = sumAnsweredScore(answers)

  return {
    sessionId: session.id,
    userId: session.userId,
    status: mapSessionStatusToApi(session.status),
    mode: 'game' as const,
    questions: questions.map(toQuestionPreview),
    totalQuestions: questions.length,
    answeredCount,
    maxScore,
    currentScore,
    createdAt: session.createdAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  }
}

function indicesOf(values: string[], options: string[]): number[] {
  return values.map((v) => options.indexOf(v)).filter((i) => i >= 0)
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map((v) => String(v))
  if (typeof value === 'string') return [value]
  return []
}

export function answerStatusForApi(
  question: Question,
  answer: Pick<Answer, 'score' | 'isCorrect'>
): 'correct' | 'incorrect' | 'partial' | 'pending' {
  if (question.type === 'essay') return 'pending'
  if (answer.score === null) return 'pending'
  if (answer.isCorrect === true) return 'correct'
  if (
    (question.type === 'multiple-select' || question.type === 'single-select') &&
    (answer.score ?? 0) > 0 &&
    !answer.isCorrect
  ) {
    return 'partial'
  }
  return 'incorrect'
}

export function toAnswerResult(answer: Answer, question: QuestionWithCategory) {
  const bank = parseQuestionBank(question.correctAnswer)
  const options = bank.options.length > 0 ? bank.options : getOptionsForPreview(question.correctAnswer)
  const status = answerStatusForApi(question, answer)
  const correctOptions = indicesOf(bank.correct, options)
  const pointsEarned = answer.score ?? 0
  const maxPoints = question.points
  const feedback = `Вы набрали ${pointsEarned} из ${maxPoints} баллов.`

  const student = toStringArray(answer.userAnswer)
  const correctSet = new Set(bank.correct)
  let correctSelected = 0
  let incorrectSelected = 0
  for (const s of student) {
    if (correctSet.has(s)) correctSelected++
    else incorrectSelected++
  }

  const base: Record<string, unknown> = {
    answerId: answer.id,
    questionId: answer.questionId,
    status,
    pointsEarned,
    maxPoints,
    feedback,
  }

  if (status !== 'pending' && correctOptions.length > 0) {
    base.correctOptions = correctOptions
  }

  if (
    status === 'partial' &&
    (question.type === 'multiple-select' || question.type === 'single-select')
  ) {
    base.breakdown = {
      correctSelected,
      incorrectSelected,
      pointsFromCorrect: Math.round(pointsEarned),
      penaltyFromIncorrect: incorrectSelected > 0 ? -incorrectSelected : 0,
      totalBeforeMin: Math.round(pointsEarned),
    }
  }

  return base
}

export function toAnswerPending(answer: Answer, question: QuestionWithCategory) {
  return {
    answerId: answer.id,
    questionId: answer.questionId,
    status: 'pending' as const,
    message: 'Ответ сохранен и ожидает проверки преподавателем',
  }
}

function userAnswerForSessionResults(
  q: Question,
  raw: unknown,
  options: string[]
): number[] | string {
  if (q.type === 'essay') {
    if (typeof raw === 'string') return raw
    if (raw && typeof raw === 'object') return JSON.stringify(raw)
    return String(raw ?? '')
  }
  const texts = Array.isArray(raw) ? raw.map(String) : [String(raw)]
  return texts.map((t) => options.indexOf(t)).filter((i) => i >= 0)
}

export function toSessionResults(
  session: Session & { answers: (Answer & { question: QuestionWithCategory })[] },
  questions: QuestionWithCategory[]
) {
  const byId = new Map(questions.map((q) => [q.id, q]))
  const scoreEarned = sumAnsweredScore(session.answers)
  const max = sumQuestionPoints(questions)

  const answers = session.answers.map((a) => {
    const q = a.question ?? byId.get(a.questionId)
    const preview = q ? toQuestionPreview(q) : undefined
    const bank = q ? parseQuestionBank(q.correctAnswer) : { options: [] as string[], correct: [] as string[] }
    const options = bank.options.length > 0 ? bank.options : q ? getOptionsForPreview(q.correctAnswer) : []
    const st = q ? answerStatusForApi(q, a) : 'pending'

    const userAnswer = q
      ? userAnswerForSessionResults(q, a.userAnswer, options)
      : []

    return {
      answerId: a.id,
      questionId: a.questionId,
      ...(preview ? { question: preview } : {}),
      userAnswer,
      status: st,
      pointsEarned: a.score ?? 0,
      maxPoints: q?.points ?? 0,
      ...(st !== 'pending' && q && q.type !== 'essay'
        ? { correctOptions: indicesOf(bank.correct, options) }
        : {}),
    }
  })

  return {
    sessionId: session.id,
    userId: session.userId,
    status: session.status === 'completed' ? ('completed' as const) : ('partial' as const),
    mode: 'game' as const,
    totalQuestions: questions.length,
    answeredQuestions: session.answers.length,
    score: {
      earned: scoreEarned,
      max,
      percentage: max > 0 ? Number(((scoreEarned / max) * 100).toFixed(1)) : 0,
    },
    answers,
    completedAt: session.completedAt ? session.completedAt.toISOString() : null,
  }
}
