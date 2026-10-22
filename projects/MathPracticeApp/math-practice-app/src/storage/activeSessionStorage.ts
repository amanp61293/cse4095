import type { ActiveSession } from '../types/activeSession';
import { validConfig } from '../math/sessionEngine';

const KEY = 'math-practice-active-session';

/** A recoverable session is kept separately from long-term practice history. */
export function saveActiveSession(session: ActiveSession): boolean {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(session));
    return true;
  } catch {
    return false;
  }
}

export function loadActiveSession(): ActiveSession | null {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== 'object') return null;
    const s = value as Partial<ActiveSession>;
    const q = s.question;
    if (
      typeof s.id !== 'string' ||
      !validConfig(s.config) ||
      typeof s.startedAt !== 'string' ||
      !q ||
      typeof q !== 'object' ||
      typeof q.id !== 'string' ||
      typeof q.displayText !== 'string' ||
      !s.config.operations.includes(q.operation) ||
      q.difficulty !== s.config.difficulty ||
      !Number.isSafeInteger(q.firstOperand) ||
      !Number.isSafeInteger(q.secondOperand) ||
      !Number.isSafeInteger(q.correctAnswer) ||
      !Array.isArray(q.choices) ||
      q.choices.length !== 4 ||
      !q.choices.every((v) => Number.isSafeInteger(v)) ||
      new Set(q.choices).size !== 4 ||
      !q.choices.includes(q.correctAnswer) ||
      !['regular', 'mistake-review'].includes(q.source) ||
      ![s.attempted, s.correct, s.incorrect, s.mistakeReviewQuestions].every(
        (v) => Number.isSafeInteger(v) && (v as number) >= 0,
      ) ||
      s.correct! + s.incorrect! !== s.attempted!
    )
      return null;
    return s as ActiveSession;
  } catch {
    return null;
  }
}

export function clearActiveSession(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* Storage may be blocked. */
  }
}
