import { describe, it, expect } from 'vitest'
import { scoringService } from './scoringService.js'

describe('ScoringService.scoreMultipleSelect', () => {
  it('gives full score for all correct answers', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], ['A', 'B'])).toBe(2)
  })

  it('adds for correct and subtracts for wrong', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], ['A', 'C'])).toBe(0.5)
  })

  it('never returns below zero', () => {
    expect(scoringService.scoreMultipleSelect(['A'], ['X', 'Y', 'Z'])).toBe(0)
  })

  it('ignores duplicate student answers', () => {
    expect(scoringService.scoreMultipleSelect(['A'], ['A', 'A', 'A'])).toBe(1)
  })

  it('returns zero for empty student answers', () => {
    expect(scoringService.scoreMultipleSelect(['A', 'B'], [])).toBe(0)
  })
})

describe('ScoringService.scoreEssay', () => {
  it('sums grades when all are within rubric max', () => {
    expect(scoringService.scoreEssay([2, 3, 4], { maxByCriterion: [2, 3, 5] })).toBe(9)
  })

  it('clamps values above max', () => {
    expect(scoringService.scoreEssay([10, 3], { maxByCriterion: [2, 3] })).toBe(5)
  })

  it('clamps negative values to zero', () => {
    expect(scoringService.scoreEssay([-1, 2], { maxByCriterion: [3, 3] })).toBe(2)
  })

  it('throws on grades/rubric length mismatch', () => {
    expect(() =>
      scoringService.scoreEssay([1, 2], { maxByCriterion: [5] })
    ).toThrowError('Grades count must match rubric criteria count')
  })

  it('supports decimal grades', () => {
    expect(scoringService.scoreEssay([1.25, 2.5], { maxByCriterion: [2, 3] })).toBe(3.75)
  })
})