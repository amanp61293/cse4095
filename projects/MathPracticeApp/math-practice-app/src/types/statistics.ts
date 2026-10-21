import type { DifficultyLevel, MathOperation } from './question';

export interface OperationStatistics {
  attempted: number;
  correct: number;
  incorrect: number;
}

export interface AppStatistics extends OperationStatistics {
  byOperation: Record<MathOperation, OperationStatistics>;
  byDifficulty: Record<DifficultyLevel, OperationStatistics>;
}

export function createEmptyStatistics(): AppStatistics {
  const empty = (): OperationStatistics => ({
    attempted: 0,
    correct: 0,
    incorrect: 0,
  });
  return {
    ...empty(),
    byOperation: {
      addition: empty(),
      subtraction: empty(),
      multiplication: empty(),
      division: empty(),
    },
    byDifficulty: { 1: empty(), 2: empty(), 3: empty(), 4: empty() },
  };
}
