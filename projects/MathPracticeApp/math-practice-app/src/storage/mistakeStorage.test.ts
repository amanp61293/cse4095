import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearApplicationData,
  loadPractice,
  parseSavedPractice,
  saveSettings,
  STORAGE_KEY,
  updateMistakeForAttempt,
} from './practiceStorage';
import { generateQuestion } from '../math/questionGenerator';
import { DEFAULT_APP_SETTINGS } from '../types/settings';

beforeEach(() => localStorage.clear());
describe('mistake storage and schema migration', () => {
  it('migrates version 1 data without losing history', () => {
    const old = JSON.stringify({
      version: 1,
      attempts: [],
      sessions: [],
      settings: DEFAULT_APP_SETTINGS,
      currentDifficulty: 3,
    });
    const migrated = parseSavedPractice(old);
    expect(migrated.version).toBe(2);
    expect(migrated.currentDifficulty).toBe(3);
    expect(migrated.mistakes).toEqual([]);
  });
  it('persists mistakes and review mastery', () => {
    const question = generateQuestion('addition', 1);
    expect(updateMistakeForAttempt(question, false, 2)).toBe(true);
    expect(loadPractice().mistakes).toHaveLength(1);
    const review = {
      ...question,
      source: 'mistake-review' as const,
      mistakePatternId: loadPractice().mistakes[0].id,
    };
    updateMistakeForAttempt(review, true, 2);
    updateMistakeForAttempt(review, true, 2);
    expect(loadPractice().mistakes[0].mastered).toBe(true);
  });
  it('clears only application storage', () => {
    localStorage.setItem('unrelated', 'keep me');
    expect(saveSettings(DEFAULT_APP_SETTINGS)).toBe(true);
    expect(clearApplicationData()).toBe(true);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem('unrelated')).toBe('keep me');
  });
});
