/**
 * Проверяем правила Zod: «какие JSON-данные сервер считает допустимыми».
 *
 * safeParse возвращает success: true — ок, false — данные отклоняем (обычно ответ 400 клиенту).
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
  // Код от GitHub непустой — всё хорошо, можно обрабатывать.
  it('accepts a non-empty code', () => {
    expect(githubCallbackSchema.safeParse({ code: 'abc' }).success).toBe(true)
  })

  // Пустая строка кода — бессмысленный запрос, отклоняем.
  it('rejects empty code', () => {
    const r = githubCallbackSchema.safeParse({ code: '' })
    expect(r.success).toBe(false)
  })

  // Поля code вообще нет — тоже отклоняем.
  it('rejects missing code', () => {
    const r = githubCallbackSchema.safeParse({})
    expect(r.success).toBe(false)
  })
})

describe('CreateSessionSchema', () => {
  // Можно отправить пустой объект {} — категория не обязательна.
  it('accepts empty object (optional categoryId)', () => {
    expect(CreateSessionSchema.safeParse({}).success).toBe(true)
  })

  // Если указали категорию — это должна быть строка (текст id), а не число.
  it('accepts string categoryId', () => {
    expect(CreateSessionSchema.safeParse({ categoryId: 'cat_1' }).success).toBe(true)
  })

  // Число вместо строки — тип не тот, отклоняем.
  it('rejects non-string categoryId', () => {
    const r = CreateSessionSchema.safeParse({ categoryId: 1 })
    expect(r.success).toBe(false)
  })
})

describe('AnswerSchema', () => {
  // Без id вопроса сервер не поймёт, на что отвечаем — отклоняем.
  it('requires questionId', () => {
    const r = AnswerSchema.safeParse({ userAnswer: 'x' })
    expect(r.success).toBe(false)
  })

  // Минимум данных: на какой вопрос ответ и сам ответ — принимаем.
  it('accepts minimal valid payload', () => {
    const r = AnswerSchema.safeParse({ questionId: 'q1', userAnswer: 'A' })
    expect(r.success).toBe(true)
  })
})

describe('SubmitSessionSchema', () => {
  // Завершить сессию можно без лишних полей (если схема так задана).
  it('accepts empty object', () => {
    expect(SubmitSessionSchema.safeParse({}).success).toBe(true)
  })
})

describe('GradeSchema', () => {
  // Балл за эссе может быть ноль или больше — ок.
  it('accepts non-negative score', () => {
    expect(GradeSchema.safeParse({ score: 0 }).success).toBe(true)
  })

  // Отрицательный балл — не принимаем.
  it('rejects negative score', () => {
    const r = GradeSchema.safeParse({ score: -1 })
    expect(r.success).toBe(false)
  })
})

describe('QuestionSchema', () => {
  // Текст вопроса слишком короткий — по правилам схемы нельзя.
  it('rejects text shorter than 3 chars', () => {
    const r = QuestionSchema.safeParse({
      text: 'ab',
      type: 'single-select',
      categoryId: 'c1',
      points: 1,
    })
    expect(r.success).toBe(false)
  })

  // Тип вопроса должен быть из разрешённого списка (например single-select), а не любая строка.
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
  // Массив вопросов пустой — загружать нечего, отклоняем.
  it('rejects empty questions array', () => {
    const r = BatchQuestionsSchema.safeParse({ questions: [] })
    expect(r.success).toBe(false)
  })

  // Один корректный вопрос в списке — достаточно, чтобы схема прошла.
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
