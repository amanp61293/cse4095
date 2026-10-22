import { describe, expect, it } from 'vitest';
import type { DifficultyLevel, MathOperation } from '../types/question';
import { generateAddition, generateDivision, generateMixedQuestion, generateMultiplication, generateQuestion, generateSubtraction } from './questionGenerator';

const levels: DifficultyLevel[] = [1, 2, 3, 4];
const operations: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];

function verify(operation: MathOperation, level: DifficultyLevel) {
  for (let i = 0; i < 300; i++) {
    const q = generateQuestion(operation, level);
    expect(q.operation).toBe(operation);
    expect(q.difficulty).toBe(level);
    expect(q.id).toBeTruthy();
    expect(q.choices).toEqual([]); // Multiple-choice belongs to Phase 5.
    expect(q.source).toBe('regular');
    expect(q.displayText).toContain('= ?');
    expect(Number.isInteger(q.correctAnswer)).toBe(true);
    const [a, b] = [q.firstOperand, q.secondOperand];
    if (operation === 'addition') {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(a).toBeLessThanOrEqual([0, 10, 50, 100, 1000][level]);
      expect(b).toBeLessThanOrEqual([0, 10, 50, 100, 1000][level]);
      expect(q.correctAnswer).toBe(a + b);
    }
    if (operation === 'subtraction') {
      expect(a).toBeLessThanOrEqual([0, 10, 50, 100, 1000][level]);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(a).toBeGreaterThanOrEqual(b);
      expect(q.correctAnswer).toBe(a - b);
    }
    if (operation === 'multiplication') {
      expect(q.correctAnswer).toBe(a * b);
      if (level <= 2) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(b).toBeGreaterThanOrEqual(0);
        expect(Math.max(a, b)).toBeLessThanOrEqual(level === 1 ? 5 : 10);
      } else if (level === 3) {
        expect(a).toBeGreaterThanOrEqual(0);
        expect(a).toBeLessThanOrEqual(9);
        expect(b).toBeLessThanOrEqual(99);
      } else {
        expect(a).toBeGreaterThanOrEqual(10);
        expect(a).toBeLessThanOrEqual(99);
        expect(b).toBeGreaterThanOrEqual(1);
        expect(b).toBeLessThanOrEqual(99);
      }
    }
    if (operation === 'division') {
      expect(b).toBeGreaterThan(0);
      expect(a % b).toBe(0);
      expect(q.correctAnswer).toBe(a / b);
      if (level === 1) expect(b).toBeLessThanOrEqual(5);
      if (level === 2) expect(b).toBeLessThanOrEqual(10);
      if (level === 3) {
        expect(b).toBeLessThanOrEqual(12);
        expect(a).toBeLessThanOrEqual(144);
      }
      if (level === 4) expect(b).toBeLessThanOrEqual(99);
    }
  }
}

describe('question generation at all levels', () => {
  for (const operation of operations) {
    for (const level of levels) {
      it(`${operation} level ${level} respects its rules`, () => verify(operation, level));
    }
  }
  it('supports named operation generators', () => {
    expect(generateAddition(1).operation).toBe('addition');
    expect(generateSubtraction(1).operation).toBe('subtraction');
    expect(generateMultiplication(1).operation).toBe('multiplication');
    expect(generateDivision(1).operation).toBe('division');
  });
  it('chooses only selected operations in mixed mode', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 250; i++) seen.add(generateMixedQuestion(['addition', 'division'], 2).operation);
    expect(seen).toEqual(new Set(['addition', 'division']));
  });
  it('rejects invalid selections', () => {
    expect(() => generateMixedQuestion([], 1)).toThrow(RangeError);
    expect(() => generateQuestion('modulo' as MathOperation, 1)).toThrow(RangeError);
    expect(() => generateQuestion('addition', 9 as DifficultyLevel)).toThrow(RangeError);
  });
});
