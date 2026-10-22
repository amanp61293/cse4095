import type { PracticeAttempt, PracticeSession } from '../types/session';
import type { AppSettings } from '../types/settings';
import { DEFAULT_APP_SETTINGS } from '../types/settings';
import type { AppStatistics } from '../types/statistics';
import { countAttempts } from '../math/statisticsEngine';
import type { MathOperation } from '../types/question';
import type { MistakePattern } from '../types/mistake';
import type { Question } from '../types/question';
import { recordMistake, recordReviewResult } from '../math/mistakeEngine';

const KEY = 'math-practice-data';
const VERSION = 2;
const OPERATIONS: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];

export interface SavedPractice {
  version: number;
  attempts: PracticeAttempt[];
  sessions: PracticeSession[];
  settings: AppSettings;
  mistakes: MistakePattern[];
  currentDifficulty: 1 | 2 | 3 | 4;
}

export function emptySavedPractice(): SavedPractice {
  return { version: VERSION, attempts: [], sessions: [], mistakes: [], settings: { ...DEFAULT_APP_SETTINGS, defaultOperations: [...DEFAULT_APP_SETTINGS.defaultOperations] }, currentDifficulty: DEFAULT_APP_SETTINGS.defaultDifficulty };
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
function validOperation(value: unknown): value is MathOperation {
  return OPERATIONS.includes(value as MathOperation);
}
function validDifficulty(value: unknown): value is 1 | 2 | 3 | 4 {
  return [1, 2, 3, 4].includes(value as number);
}
function nonnegativeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0;
}
function validDate(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value));
}
function validAttempt(value: unknown): value is PracticeAttempt {
  if (!object(value)) return false;
  return ['id', 'questionId', 'sessionId'].every((key) => typeof value[key] === 'string' && value[key].length > 0)
    && validOperation(value.operation) && validDifficulty(value.difficulty)
    && ['regular', 'mistake-review'].includes(value.source as string)
    && ['firstOperand', 'secondOperand', 'correctAnswer', 'selectedAnswer'].every((key) => Number.isSafeInteger(value[key]))
    && typeof value.selfReportedCorrect === 'boolean' && validDate(value.attemptedAt);
}
function validSession(value: unknown): value is PracticeSession {
  if (!object(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0 && validDate(value.startedAt)
    && (value.completedAt === undefined || validDate(value.completedAt))
    && Array.isArray(value.operations) && value.operations.length > 0 && value.operations.every(validOperation)
    && validDifficulty(value.difficulty) && [5, 10, 20, 'continuous'].includes(value.sessionLength as string | number)
    && nonnegativeInteger(value.attempted) && nonnegativeInteger(value.correct) && nonnegativeInteger(value.incorrect)
    && value.correct + value.incorrect === value.attempted;
}
function validMistake(value: unknown): value is MistakePattern {
  if (!object(value)) return false;
  return typeof value.id === 'string' && value.id.length > 0 && validOperation(value.operation)
    && validDifficulty(value.difficulty) && ['firstOperand', 'secondOperand', 'correctAnswer', 'incorrectCount', 'similarCorrectCount'].every((k) => nonnegativeInteger(value[k]))
    && validDate(value.lastIncorrectAt) && typeof value.mastered === 'boolean';
}
function validSettings(value: unknown): value is AppSettings {
  if (!object(value)) return false;
  return ['soundEffectsEnabled', 'cardAnimationEnabled', 'showExplanations'].every((key) => typeof value[key] === 'boolean')
    && validDifficulty(value.defaultDifficulty) && [5, 10, 20, 'continuous'].includes(value.defaultSessionLength as string | number)
    && Array.isArray(value.defaultOperations) && value.defaultOperations.length > 0 && value.defaultOperations.every(validOperation)
    && nonnegativeInteger(value.masteryThreshold) && value.masteryThreshold > 0;
}

export function parseSavedPractice(raw: string | null): SavedPractice {
  if (!raw) return emptySavedPractice();
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!object(parsed)) return emptySavedPractice();
    // Version 0 is the legacy unversioned shape. Unknown future versions are not overwritten.
    if (parsed.version !== 2 && parsed.version !== 1 && parsed.version !== undefined && parsed.version !== 0) return emptySavedPractice();
    const attempts = Array.isArray(parsed.attempts) ? parsed.attempts.filter(validAttempt) : [];
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions.filter(validSession) : [];
    return {
      version: VERSION,
      attempts,
      sessions,
      mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes.filter(validMistake) : [],
      settings: validSettings(parsed.settings) ? parsed.settings : emptySavedPractice().settings,
      currentDifficulty: validDifficulty(parsed.currentDifficulty) ? parsed.currentDifficulty : DEFAULT_APP_SETTINGS.defaultDifficulty,
    };
  } catch {
    return emptySavedPractice();
  }
}
function readRaw(): string | null {
  try { return window.localStorage.getItem(KEY); } catch { return null; }
}
function write(data: SavedPractice): boolean {
  try {
    const existing = readRaw();
    if (existing) {
      const parsed: unknown = JSON.parse(existing);
      if (object(parsed) && typeof parsed.version === 'number' && parsed.version > VERSION) return false;
    }
    window.localStorage.setItem(KEY, JSON.stringify(data));
    return true;
  } catch { return false; }
}
export function loadPractice(): SavedPractice { return parseSavedPractice(readRaw()); }
export function saveAttempt(attempt: PracticeAttempt): boolean {
  const data = loadPractice();
  if (data.attempts.some((saved) => saved.id === attempt.id)) return false;
  data.attempts.push(attempt);
  return write(data);
}
export function saveSession(session: PracticeSession): boolean {
  const data = loadPractice();
  const index = data.sessions.findIndex((saved) => saved.id === session.id);
  if (index >= 0) data.sessions[index] = session;
  else data.sessions.push(session);
  return write(data);
}
export function saveSettings(settings: AppSettings): boolean {
  if (!validSettings(settings)) return false;
  const data = loadPractice(); data.settings = settings; return write(data);
}
export function saveDifficulty(difficulty: 1 | 2 | 3 | 4): boolean {
  const data = loadPractice(); data.currentDifficulty = difficulty; return write(data);
}
export function loadStatistics(): AppStatistics { return countAttempts(loadPractice().attempts); }
export function resetStatistics(): boolean {
  const data = loadPractice(); data.attempts = []; data.sessions = []; data.mistakes = []; return write(data);
}
export const STORAGE_KEY = KEY;

export function updateMistakeForAttempt(question: Question, correct: boolean, masteryThreshold: number): boolean {
  const data = loadPractice();
  if (question.source === 'mistake-review' && question.mistakePatternId) {
    data.mistakes = recordReviewResult(data.mistakes, question.mistakePatternId, correct, masteryThreshold);
  } else if (!correct) {
    data.mistakes = recordMistake(data.mistakes, question);
  }
  return write(data);
}
export function clearApplicationData(): boolean {
  try { window.localStorage.removeItem(KEY); return true; } catch { return false; }
}
