// Тип для рубрики эссе — сколько максимум баллов по каждому критерию
// Пример: [5, 3, 2] → первый критерий до 5 баллов, второй до 3, третий до 2
export type EssayRubric = {
  maxByCriterion: number[]
}

// Главный сервис, который считает баллы за ответы
export class ScoringService {
  // Считает баллы за вопрос с несколькими правильными вариантами
  // correctAnswers — правильные варианты (массив строк)
  // studentAnswers — что выбрал ученик (тоже массив строк)
  scoreMultipleSelect(correctAnswers: string[], studentAnswers: string[]): number {
    // Делаем наборы, чтобы удобно проверять совпадения
    const correctSet = new Set(correctAnswers)
    const studentSet = new Set(studentAnswers)

    let score = 0

    // За каждый правильный вариант ученика +1
    // За каждый лишний (неправильный) вариант -0.5
    for (const answer of studentSet) {
      if (correctSet.has(answer)) {
        score += 1
      } else {
        score -= 0.5
      }
    }

    // Баллы не могут быть меньше 0, округляем до 2 знаков
    return Math.max(0, Number(score.toFixed(2)))
  }

  // Считает баллы за эссе (открытый ответ)
  // grades — массив оценок по каждому критерию (что поставил учитель)
  // rubric — рубрика: максимум баллов по каждому критерию
  scoreEssay(grades: number[], rubric: EssayRubric): number {
    // Проверяем, что количество оценок совпадает с количеством критериев
    if (grades.length !== rubric.maxByCriterion.length) {
      throw new Error('Grades count must match rubric criteria count')
    }

    let total = 0

    // Проходим по каждому критерию
    for (let i = 0; i < grades.length; i++) {
      const max = rubric.maxByCriterion[i]     // максимум по этому критерию
      const raw = grades[i]                    // что поставил учитель
      // Баллы не могут быть меньше 0 и больше максимума
      const normalized = Math.max(0, Math.min(raw, max))
      total += normalized
    }

    // Возвращаем сумму, округлённую до 2 знаков
    return Number(total.toFixed(2))
  }
}

// Готовый экземпляр, чтобы использовать в других файлах
export const scoringService = new ScoringService()