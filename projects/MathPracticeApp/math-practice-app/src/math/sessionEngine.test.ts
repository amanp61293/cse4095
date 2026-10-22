import { describe, expect, it } from 'vitest';
import { finishPractice, nextQuestion, sameFact, scoreAttempt, sessionComplete, startPractice, validConfig } from './sessionEngine';
import type { PracticeConfig } from '../types/practiceConfig';
import { generateMixedQuestion } from './questionGenerator';

const config: PracticeConfig = { operations: ['addition'], difficulty: 1, sessionLength: 5, reviewMode: 'regular' };

describe('practice session engine', () => {
  it('validates configurations', () => {
    expect(validConfig(config)).toBe(true);
    expect(validConfig({ ...config, operations: [] })).toBe(false);
    expect(validConfig({ ...config, reviewMode: 'mistake-review' })).toBe(true);
    expect(validConfig(null)).toBe(false);
  });
  it('counts self-reported results and completes after the selected length', () => {
    let session = startPractice(config);
    expect(session.attempted).toBe(0);
    for (let i = 0; i < 4; i++) session = scoreAttempt(session, true);
    expect(sessionComplete(session)).toBe(false);
    session = scoreAttempt(session, false);
    expect(sessionComplete(session)).toBe(true);
    expect(session.correct).toBe(4);
    expect(session.incorrect).toBe(1);
    expect(finishPractice(session).attempted).toBe(5);
  });
  it('supports continuous sessions without automatic completion', () => {
    let session = startPractice({ ...config, sessionLength: 'continuous' });
    for (let i = 0; i < 25; i++) session = scoreAttempt(session, false);
    expect(sessionComplete(session)).toBe(false);
  });
  it('does not immediately repeat the same fact', () => {
    for (let i = 0; i < 100; i++) {
      const old = generateMixedQuestion(config.operations, config.difficulty);
      const fresh = nextQuestion(config, old);
      expect(sameFact(old, fresh)).toBe(false);
    }
  });
  it('generates valid questions for all operations', () => {
    for (const operation of ['addition', 'subtraction', 'multiplication', 'division'] as const) {
      const session = startPractice({ ...config, operations: [operation] });
      expect(session.question.operation).toBe(operation);
      expect(session.question.choices).toHaveLength(4);
    }
  });
});
