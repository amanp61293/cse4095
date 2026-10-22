import { describe, expect, it } from 'vitest';
import { chooseReviewPattern, generateSimilarQuestion, recordMistake, recordReviewResult, reviewPriority } from './mistakeEngine';
import { generateQuestion } from './questionGenerator';
import type { MathOperation } from '../types/question';

const operations: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];
describe('mistake review', () => {
  it('groups repeated mistakes and resets mastery after another miss', () => {
    const q = generateQuestion('addition', 1);
    const once = recordMistake([], q);
    const twice = recordMistake(once, q);
    expect(twice).toHaveLength(1);
    expect(twice[0].incorrectCount).toBe(2);
    const mastered = [recordReviewResult(recordReviewResult(recordReviewResult(twice, twice[0].id, true, 3), twice[0].id, true, 3), twice[0].id, true, 3)[0]];
    expect(mastered[0].mastered).toBe(true);
    expect(recordMistake(mastered, q)[0].mastered).toBe(false);
  });
  it('tracks correct review answers and wrong answers using configurable mastery', () => {
    const original = recordMistake([], generateQuestion('subtraction', 2));
    const one = recordReviewResult(original, original[0].id, true, 2);
    expect(one[0].mastered).toBe(false);
    expect(recordReviewResult(one, one[0].id, true, 2)[0].mastered).toBe(true);
    expect(recordReviewResult(one, one[0].id, false, 2)[0].similarCorrectCount).toBe(0);
  });
  it('lowers mastered priority and honors operation/level filters', () => {
    const patterns = recordMistake([], generateQuestion('multiplication', 3));
    const mastered = [{ ...patterns[0], mastered: true }];
    expect(reviewPriority(mastered[0])).toBeLessThan(reviewPriority(patterns[0]));
    expect(chooseReviewPattern(patterns, ['addition'], 3)).toBeUndefined();
    expect(chooseReviewPattern(patterns, ['multiplication'], 3)?.id).toBe(patterns[0].id);
  });
  for (const operation of operations) for (const level of [1, 2, 3, 4] as const) {
    it(`generates valid related questions for ${operation} level ${level}`, () => {
      const pattern = recordMistake([], generateQuestion(operation, level))[0];
      for (let i = 0; i < 20; i++) {
        const question = generateSimilarQuestion(pattern, [operation]);
        expect(question.difficulty).toBe(level);
        expect(question.source).toBe('mistake-review');
        expect(question.mistakePatternId).toBe(pattern.id);
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices).toContain(question.correctAnswer);
        expect(question.choices.every((v) => Number.isSafeInteger(v) && v >= 0)).toBe(true);
        if (operation === 'division') {
          expect(question.secondOperand).toBeGreaterThan(0);
          expect(question.firstOperand % question.secondOperand).toBe(0);
        }
        if (operation === 'subtraction') expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      }
    });
  }
});
