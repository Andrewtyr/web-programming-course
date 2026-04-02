/**
 * Zod-схемы входящих тел запросов (auth, сессии, админка). Используются в роутерах через `.safeParse`;
 * при ошибке возвращается 400 и детали `flatten()` для отладки клиента.
 */
import { z } from 'zod'

// Схемы — это как "правила проверки": что должно прийти в запросе, чтобы сервер не сломался

// Для GitHub логина: после клика на "Войти через GitHub" приходит код
export const githubCallbackSchema = z.object({
  code: z.string().min(1, 'code is required'),  // код от GitHub — обязательный
})

// Начать новый тест (сессию) — совместимо с LR5 OpenAPI (CreateSessionRequest) и старым полем categoryId
export const CreateSessionSchema = z.object({
  categoryId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  questionCount: z.number().int().min(1).max(100).optional(),
})

// Отправить ответ — LR5: { questionId, selectedOptions?, text? } или legacy { userAnswer }
export const SubmitAnswerRequestSchema = z
  .object({
    sessionId: z.string().optional(),
    questionId: z.string().min(1, 'questionId is required'),
    selectedOptions: z.array(z.number().int().min(0)).optional(),
    text: z.string().optional(),
    userAnswer: z.any().optional(),
  })
  .refine(
    (d) =>
      d.userAnswer !== undefined ||
      d.text !== undefined ||
      (d.selectedOptions !== undefined && d.selectedOptions.length > 0),
    { message: 'Provide userAnswer, text, or selectedOptions' }
  )

export const AnswerSchema = SubmitAnswerRequestSchema

// Завершить тест — тело может быть пустым (LR5: без body)
export const SubmitSessionSchema = z.object({
  sessionId: z.string().optional(),
})

// Поставить оценку за эссе-ответ (только админ)
export const GradeSchema = z.object({
  score: z.number().min(0),               // баллы ≥ 0
  feedback: z.string().max(2000).optional(),  
})

// Один вопрос (когда админ добавляет вопрос)
export const QuestionSchema = z.object({
  text: z.string().min(3),                     // текст вопроса, минимум 3 буквы
  type: z.enum(['single-select', 'multiple-select', 'essay']), 
  categoryId: z.string().min(1),              
  correctAnswer: z.any().optional(),           
  points: z.number().int().min(1).max(100).default(1),  // сколько баллов даёт, по умолчанию 1
})

// Добавить сразу много вопросов (пачкой)
export const BatchQuestionsSchema = z.object({
  questions: z.array(QuestionSchema).min(1).max(100), 
})