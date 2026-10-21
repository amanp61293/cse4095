import type { DifficultyLevel, MathOperation } from './question';
import type { SessionLength } from './session';

export interface PracticeConfig {
  operations: MathOperation[];
  difficulty: DifficultyLevel;
  sessionLength: SessionLength;
  reviewMode: 'regular' | 'mistake-review';
}
