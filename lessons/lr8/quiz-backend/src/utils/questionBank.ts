/**
 * Разбор поля Question.correctAnswer для подсчёта баллов и превью вариантов (LR5 / OpenAPI).
 * Поддерживаемые форматы:
 * - Расширенный: { options: string[], correct: string | string[] } — варианты для UI и правильные ответы
 * - Строка или число: одно значение (как в старых сидах single-select)
 * - Массив строк: только правильные варианты (как раньше для multiple-select)
 */
export type ParsedQuestionBank = {
  options: string[]
  correct: string[]
}

export function parseQuestionBank(correctAnswer: unknown): ParsedQuestionBank {
  if (correctAnswer && typeof correctAnswer === 'object' && !Array.isArray(correctAnswer)) {
    const o = correctAnswer as Record<string, unknown>
    const options = Array.isArray(o.options) ? o.options.map((v) => String(v)) : []
    let correct: string[] = []
    if (Array.isArray(o.correct)) correct = o.correct.map((v) => String(v))
    else if (typeof o.correct === 'string' || typeof o.correct === 'number') correct = [String(o.correct)]
    return { options, correct }
  }
  if (Array.isArray(correctAnswer)) {
    const arr = correctAnswer.map((v) => String(v))
    return { options: [], correct: arr }
  }
  if (typeof correctAnswer === 'string' || typeof correctAnswer === 'number') {
    const s = String(correctAnswer)
    return { options: [], correct: [s] }
  }
  return { options: [], correct: [] }
}

export function getOptionsForPreview(correctAnswer: unknown): string[] {
  const { options, correct } = parseQuestionBank(correctAnswer)
  if (options.length > 0) return options
  return correct
}
