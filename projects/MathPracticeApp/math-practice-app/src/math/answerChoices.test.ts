import { describe, expect, it } from 'vitest';
import type { DifficultyLevel, MathOperation } from '../types/question';
import { generateAnswerChoices } from './answerChoices';
import { generateMixedQuestion, generateQuestion } from './questionGenerator';

const operations: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];
const levels: DifficultyLevel[] = [1, 2, 3, 4];

describe('Phase 5 answer choices', () => {
  it('produces four unique nonnegative integers with exactly one correct answer across all levels', () => {
    for (const operation of operations) for (const difficulty of levels) {
      for (let sample = 0; sample < 200; sample++) {
        const question = generateQuestion(operation, difficulty);
        expect(question.choices).toHaveLength(4);
        expect(new Set(question.choices).size).toBe(4);
        expect(question.choices.filter((v) => v === question.correctAnswer)).toHaveLength(1);
        expect(question.choices.every((v) => Number.isSafeInteger(v) && v >= 0)).toBe(true);
      }
    }
  });

  it.each(operations)('handles zero answers for %s', (operation) => {
    const choices = generateAnswerChoices({ operation, firstOperand: 0, secondOperand: operation === 'division' ? 2 : 0, correctAnswer: 0, difficulty: 1 });
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain(0);
    expect(choices.every((c) => c >= 0)).toBe(true);
  });

  it('handles large multiplication results', () => {
    const choices = generateAnswerChoices({ operation: 'multiplication', firstOperand: 99, secondOperand: 99, correctAnswer: 9801, difficulty: 4 });
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain(9801);
  });

  it('mixes operations while including completed answer choices', () => {
    for (let i = 0; i < 100; i++) {
      const q = generateMixedQuestion(operations, 3);
      expect(q.choices).toHaveLength(4);
      expect(q.choices).toContain(q.correctAnswer);
    }
  });

  it('shuffles the position of the correct answer across repeated generations', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 120; i++) {
      const choices = generateAnswerChoices({ operation: 'multiplication', firstOperand: 8, secondOperand: 7, correctAnswer: 56, difficulty: 2 });
      positions.add(choices.indexOf(56));
    }
    expect(positions.size).toBeGreaterThan(1);
  });

  it('rejects invalid inputs instead of silently producing invalid distractors', () => {
    expect(() => generateAnswerChoices({ operation: 'addition', firstOperand: 1, secondOperand: 2, correctAnswer: -1, difficulty: 1 })).toThrow(RangeError);
  });
});
