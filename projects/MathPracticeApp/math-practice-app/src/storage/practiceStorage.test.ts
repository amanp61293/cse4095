import { beforeEach, describe, expect, it, vi } from 'vitest';
import { loadPractice, loadStatistics, parseSavedPractice, resetStatistics, saveAttempt, saveSession, saveSettings, STORAGE_KEY } from './practiceStorage';
import { DEFAULT_APP_SETTINGS } from '../types/settings';
import type { PracticeAttempt, PracticeSession } from '../types/session';

const attempt = (id: string, operation: PracticeAttempt['operation'] = 'addition', correct = true): PracticeAttempt => ({
  id, questionId: `q-${id}`, operation, firstOperand: 3, secondOperand: 2, correctAnswer: 5,
  selectedAnswer: correct ? 5 : 4, selfReportedCorrect: correct, difficulty: 1,
  source: 'regular', attemptedAt: '2026-10-21T10:00:00.000Z', sessionId: 's1',
});
const session: PracticeSession = {
  id: 's1', startedAt: '2026-10-21T10:00:00.000Z', completedAt: '2026-10-21T10:05:00.000Z',
  operations: ['addition'], difficulty: 1, sessionLength: 5, attempted: 2, correct: 1, incorrect: 1,
};

beforeEach(() => { window.localStorage.clear(); vi.restoreAllMocks(); });

describe('practice storage', () => {
  it('handles missing and malformed data, and migrates legacy records', () => {
    expect(loadPractice().attempts).toEqual([]);
    window.localStorage.setItem(STORAGE_KEY, 'not-json');
    expect(loadPractice().sessions).toEqual([]);
    expect(parseSavedPractice(JSON.stringify({ attempts: [attempt('1'), { malformed: true }], sessions: [session], settings: DEFAULT_APP_SETTINGS } )).attempts).toHaveLength(1);
  });
  it('persists attempts and sessions without duplicates, then computes statistics', () => {
    expect(saveAttempt(attempt('1'))).toBe(true);
    expect(saveAttempt(attempt('2', 'subtraction', false))).toBe(true);
    expect(saveAttempt(attempt('1'))).toBe(false);
    expect(saveSession(session)).toBe(true);
    expect(saveSession(session)).toBe(true);
    expect(loadPractice().sessions).toHaveLength(1);
    expect(loadPractice().attempts).toHaveLength(2);
    expect(loadStatistics().attempted).toBe(2);
    expect(loadStatistics().correct).toBe(1);
    expect(loadStatistics().byOperation.subtraction.incorrect).toBe(1);
    expect(loadStatistics().byDifficulty[1].attempted).toBe(2);
  });
  it('reset clears only practice history and preserves settings and unrelated storage', () => {
    window.localStorage.setItem('unrelated-app', 'keep');
    saveSettings({ ...DEFAULT_APP_SETTINGS, cardAnimationEnabled: false });
    saveAttempt(attempt('1')); saveSession(session);
    expect(resetStatistics()).toBe(true);
    expect(loadStatistics().attempted).toBe(0);
    expect(loadPractice().sessions).toHaveLength(0);
    expect(loadPractice().settings.cardAnimationEnabled).toBe(false);
    expect(window.localStorage.getItem('unrelated-app')).toBe('keep');
  });
  it('recovers from blocked browser storage', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(loadPractice().attempts).toEqual([]);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    expect(saveAttempt(attempt('1'))).toBe(false);
  });
  it('refuses to overwrite an unknown future schema', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, attempts: [{ private: true }] }));
    expect(saveAttempt(attempt('1'))).toBe(false);
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!).version).toBe(99);
  });
});
