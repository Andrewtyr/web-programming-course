/**
 * Проверки Zod-схем: валидные payload и ожидаемые отказы (негативные кейсы для LR10).
 */
import { describe, it, expect } from 'vitest'
import {
  AnswerSchema,
  BatchQuestionsSchema,
  CreateSessionSchema,
  githubCallbackSchema,
  GradeSchema,
  QuestionSchema,
  SubmitSessionSchema,
} from './validation.js'

describe('githubCallbackSchema', () => {
  it('accepts a non-empty code', () => {
    expect(githubCallbackSchema.safeParse({ code: 'abc' }).success).toBe(true)
  })

  it('rejects empty code', () => {
    const r = githubCallbackSchema.safeParse({ code: '' })
    expect(r.success).toBe(false)
  })

  it('rejects missing code', () => {
    const r = githubCallbackSchema.safeParse({})
    expect(r.success).toBe(false)
  })
})

describe('CreateSessionSchema', () => {
  it('accepts empty object (optional categoryId)', () => {
    expect(CreateSessionSchema.safeParse({}).success).toBe(true)
  })

  it('accepts string categoryId', () => {
    expect(CreateSessionSchema.safeParse({ categoryId: 'cat_1' }).success).toBe(true)
  })

  it('rejects non-string categoryId', () => {
    const r = CreateSessionSchema.safeParse({ categoryId: 1 })
    expect(r.success).toBe(false)
  })
})

describe('AnswerSchema', () => {
  it('requires questionId', () => {
    const r = AnswerSchema.safeParse({ userAnswer: 'x' })
    expect(r.success).toBe(false)
  })

  it('accepts minimal valid payload', () => {
    const r = AnswerSchema.safeParse({ questionId: 'q1', userAnswer: 'A' })
    expect(r.success).toBe(true)
  })
})

describe('SubmitSessionSchema', () => {
  it('accepts empty object', () => {
    expect(SubmitSessionSchema.safeParse({}).success).toBe(true)
  })
})

describe('GradeSchema', () => {
  it('accepts non-negative score', () => {
    expect(GradeSchema.safeParse({ score: 0 }).success).toBe(true)
  })

  it('rejects negative score', () => {
    const r = GradeSchema.safeParse({ score: -1 })
    expect(r.success).toBe(false)
  })
})

describe('QuestionSchema', () => {
  it('rejects text shorter than 3 chars', () => {
    const r = QuestionSchema.safeParse({
      text: 'ab',
      type: 'single-select',
      categoryId: 'c1',
      points: 1,
    })
    expect(r.success).toBe(false)
  })

  it('rejects invalid question type', () => {
    const r = QuestionSchema.safeParse({
      text: 'Long enough',
      type: 'open',
      categoryId: 'c1',
      points: 1,
    })
    expect(r.success).toBe(false)
  })
})

describe('BatchQuestionsSchema', () => {
  it('rejects empty questions array', () => {
    const r = BatchQuestionsSchema.safeParse({ questions: [] })
    expect(r.success).toBe(false)
  })

  it('accepts one valid question', () => {
    const r = BatchQuestionsSchema.safeParse({
      questions: [
        {
          text: 'What?',
          type: 'essay',
          categoryId: 'c1',
          points: 2,
        },
      ],
    })
    expect(r.success).toBe(true)
  })
})
