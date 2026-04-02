/**
 * Юнит-тесты: проверяем только математику подсчёта баллов.
 * База данных здесь не нужна — вызываем функции напрямую.
 */
import { describe, it, expect } from 'vitest'
import { scoringService } from './scoringService.js'

// Эти тесты проверяют "правила игры" для подсчёта баллов.
// Если потом кто-то изменит формулу и случайно сломает логику, тесты это сразу покажут.
describe('ScoringService.scoreMultipleSelect', () => {
  // Студент отметил ровно те варианты, что правильные — получает полный балл.
  it('gives full score for all correct answers', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], ['A', 'B'])).toBe(2)
  })

  // Часть ответов верная, часть нет — балл считается по правилам (плюс за верное, минус за лишнее).
  it('adds for correct and subtracts for wrong', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], ['A', 'C'])).toBe(0.5)
  })

  // Даже если студент всё перепутал, итог не может быть меньше нуля.
  it('never returns below zero', () => {
    expect(scoringService.scoreMultipleSelect(['A'], ['X', 'Y', 'Z'])).toBe(0)
  })

  // Если студент несколько раз указал один и тот же вариант, это не должно умножать балл.
  it('ignores duplicate student answers', () => {
    expect(scoringService.scoreMultipleSelect(['A'], ['A', 'A', 'A'])).toBe(1)
  })

  // Ничего не отметил — ноль баллов.
  it('returns zero for empty student answers', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], [])).toBe(0)
  })
})

describe('ScoringService.scoreEssay', () => {
  // Обычная ситуация: оценки по критериям в допустимых пределах — просто складываем.
  it('sums grades when all are within rubric max', () => {
    expect(scoringService.scoreEssay([2, 3, 4], { maxByCriterion: [2, 3, 5] })).toBe(9)
  })

  // Если преподаватель поставил больше максимума по критерию — берём только «потолок» из рубрики.
  it('clamps values above max', () => {
    expect(scoringService.scoreEssay([10, 3], { maxByCriterion: [2, 3] })).toBe(5)
  })

  // Отрицательная оценка по критерию считается как ноль.
  it('clamps negative values to zero', () => {
    expect(scoringService.scoreEssay([-1, 2], { maxByCriterion: [3, 3] })).toBe(2)
  })

  // Число оценок должно совпадать с числом критериев в рубрике — иначе программа должна явно «ругнуться».
  it('throws on grades/rubric length mismatch', () => {
    expect(() =>
      scoringService.scoreEssay([1, 2], { maxByCriterion: [5] })
    ).toThrowError('Grades count must match rubric criteria count')
  })

  // Дробные баллы (например 1.5) тоже должны складываться правильно.
  it('supports decimal grades', () => {
    expect(scoringService.scoreEssay([1.25, 2.5], { maxByCriterion: [2, 3] })).toBe(3.75)
  })
})
