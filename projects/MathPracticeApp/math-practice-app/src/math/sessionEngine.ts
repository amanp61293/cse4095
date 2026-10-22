import type { PracticeConfig } from '../types/practiceConfig';
import type { ActiveSession, SessionResult } from '../types/activeSession';
import type { MathOperation, Question } from '../types/question';
import { generateMixedQuestion } from './questionGenerator';
import { createUniqueId } from '../utils/random';

const OPS: MathOperation[] = ['addition', 'subtraction', 'multiplication', 'division'];

export function validConfig(value: unknown): value is PracticeConfig {
  if (!value || typeof value !== 'object') return false;
  const c = value as Partial<PracticeConfig>;
  return Array.isArray(c.operations) && c.operations.length > 0 && c.operations.every((o) => OPS.includes(o)) &&
    [1, 2, 3, 4].includes(c.difficulty as number) && [5, 10, 20, 'continuous'].includes(c.sessionLength as string | number) && c.reviewMode === 'regular';
}

export function sameFact(a: Question, b: Question): boolean {
  return a.operation === b.operation && a.firstOperand === b.firstOperand && a.secondOperand === b.secondOperand;
}

export function nextQuestion(config: PracticeConfig, previous?: Question): Question {
  // Use a bounded retry strategy to avoid repeating the immediately prior question.
  for (let attempt = 0; attempt < 35; attempt++) {
    const candidate = generateMixedQuestion(config.operations, config.difficulty);
    if (!previous || !sameFact(candidate, previous)) return candidate;
  }
  // Additional bounded retries make a repeat exceptionally unlikely.
  for (let attempt = 0; attempt < 1000; attempt++) {
    const candidate = generateMixedQuestion(config.operations, config.difficulty);
    if (!previous || !sameFact(candidate, previous)) return candidate;
  }
  throw new Error('Unable to generate a different question.');
}

export function startPractice(config: PracticeConfig): ActiveSession {
  if (!validConfig(config)) throw new Error('Invalid practice configuration');
  return { id: createUniqueId(), config, startedAt: new Date().toISOString(), question: nextQuestion(config), attempted: 0, correct: 0, incorrect: 0, mistakeReviewQuestions: 0 };
}

export function scoreAttempt(session: ActiveSession, reportedCorrect: boolean): ActiveSession {
  return { ...session, attempted: session.attempted + 1, correct: session.correct + (reportedCorrect ? 1 : 0), incorrect: session.incorrect + (reportedCorrect ? 0 : 1), mistakeReviewQuestions: session.mistakeReviewQuestions + (session.question.source === 'mistake-review' ? 1 : 0) };
}

export function sessionComplete(session: ActiveSession): boolean {
  return session.config.sessionLength !== 'continuous' && session.attempted >= session.config.sessionLength;
}

export function finishPractice(session: ActiveSession): SessionResult {
  return { id: session.id, config: session.config, startedAt: session.startedAt, completedAt: new Date().toISOString(), attempted: session.attempted, correct: session.correct, incorrect: session.incorrect, mistakeReviewQuestions: session.mistakeReviewQuestions };
}
