import { describe, expect, it } from 'vitest';
import { accuracy, countAttempts, recentSessions } from './statisticsEngine';
import type { PracticeAttempt, PracticeSession } from '../types/session';

describe('statistics calculations', () => {
  it('supports zero attempts and ordinary percentages', () => {
    expect(accuracy(0, 0)).toBe(0);
    expect(accuracy(2, 3)).toBe(67);
    expect(countAttempts([]).attempted).toBe(0);
  });
  it('counts operation, difficulty, and correct/incorrect independently', () => {
    const sample = (
      operation: PracticeAttempt['operation'],
      correct: boolean,
    ): PracticeAttempt => ({
      id: String(Math.random()),
      questionId: 'q',
      sessionId: 's',
      operation,
      difficulty: 2,
      firstOperand: 8,
      secondOperand: 2,
      correctAnswer: 4,
      selectedAnswer: 4,
      selfReportedCorrect: correct,
      source: 'regular',
      attemptedAt: '2026-10-21T10:00:00Z',
    });
    const stats = countAttempts([
      sample('division', true),
      sample('division', false),
      sample('addition', true),
    ]);
    expect(stats).toMatchObject({ attempted: 3, correct: 2, incorrect: 1 });
    expect(stats.byOperation.division.attempted).toBe(2);
    expect(stats.byDifficulty[2].correct).toBe(2);
  });
  it('shows recent completed sessions newest first', () => {
    const session = (id: string, completedAt?: string): PracticeSession => ({
      id,
      startedAt: '2026-10-21T10:00:00Z',
      completedAt,
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      attempted: 0,
      correct: 0,
      incorrect: 0,
    });
    expect(
      recentSessions(
        [
          session('old', '2026-10-20T10:00:00Z'),
          session('active'),
          session('new', '2026-10-21T10:00:00Z'),
        ],
        1,
      )[0].id,
    ).toBe('new');
  });
});
