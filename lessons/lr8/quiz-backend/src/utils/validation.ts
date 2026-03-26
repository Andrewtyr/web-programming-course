import { z } from 'zod'

// Схемы — это как "правила проверки": что должно прийти в запросе, чтобы сервер не сломался

// Для GitHub логина: после клика на "Войти через GitHub" приходит код
export const githubCallbackSchema = z.object({
  code: z.string().min(1, 'code is required'),  // код от GitHub — обязательный
})

// Начать новый тест (сессию)
export const CreateSessionSchema = z.object({
  categoryId: z.string().optional(), 
})

// Отправить ответ на один вопрос
export const AnswerSchema = z.object({
  sessionId: z.string().optional(),      
  questionId: z.string().min(1, 'questionId is required'),  
  userAnswer: z.any(),                   
})

// Завершить тест (отправить все ответы на проверку)
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