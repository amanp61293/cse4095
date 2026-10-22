import type { PracticeConfig } from './practiceConfig';
import type { Question } from './question';

export interface SessionResult {
  id: string;
  config: PracticeConfig;
  startedAt: string;
  completedAt: string;
  attempted: number;
  correct: number;
  incorrect: number;
  mistakeReviewQuestions: number;
}

export interface ActiveSession {
  id: string;
  config: PracticeConfig;
  startedAt: string;
  question: Question;
  attempted: number;
  correct: number;
  incorrect: number;
  mistakeReviewQuestions: number;
}
