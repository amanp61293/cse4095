import type { PracticeAttempt, PracticeSession } from '../types/session';
import type { AppStatistics, OperationStatistics } from '../types/statistics';
import { createEmptyStatistics } from '../types/statistics';

export function accuracy(correct: number, attempted: number): number {
  return attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
}

export function countAttempts(attempts: PracticeAttempt[]): AppStatistics {
  const stats = createEmptyStatistics();
  for (const attempt of attempts) {
    const groups: OperationStatistics[] = [
      stats,
      stats.byOperation[attempt.operation],
      stats.byDifficulty[attempt.difficulty],
    ];
    for (const group of groups) {
      group.attempted += 1;
      if (attempt.selfReportedCorrect) group.correct += 1;
      else group.incorrect += 1;
    }
  }
  return stats;
}

export function recentSessions(
  sessions: PracticeSession[],
  count = 10,
): PracticeSession[] {
  return [...sessions]
    .filter((session) => Boolean(session.completedAt))
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
    .slice(0, count);
}
