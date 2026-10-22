import { beforeEach, describe, expect, it } from 'vitest';
import { clearActiveSession, loadActiveSession, saveActiveSession } from './activeSessionStorage';
import { startPractice } from '../math/sessionEngine';

const config = { operations: ['addition'] as const, difficulty: 1 as const, sessionLength: 5 as const, reviewMode: 'regular' as const };

beforeEach(() => sessionStorage.clear());

describe('active session recovery', () => {
  it('restores the current question and progress after saving', () => {
    const session = startPractice({ ...config, operations: [...config.operations] });
    expect(saveActiveSession(session)).toBe(true);
    expect(loadActiveSession()).toEqual(session);
    clearActiveSession();
    expect(loadActiveSession()).toBeNull();
  });
  it('ignores corrupted and invalid saved sessions', () => {
    sessionStorage.setItem('math-practice-active-session', '{broken');
    expect(loadActiveSession()).toBeNull();
    sessionStorage.setItem('math-practice-active-session', JSON.stringify({ id: 'bad', config }));
    expect(loadActiveSession()).toBeNull();
  });
});
