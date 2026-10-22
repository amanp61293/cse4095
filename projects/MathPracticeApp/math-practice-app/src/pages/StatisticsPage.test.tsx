import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StatisticsPage } from './StatisticsPage';
import {
  loadPractice,
  saveAttempt,
  saveSession,
} from '../storage/practiceStorage';

beforeEach(() => {
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('statistics page', () => {
  it('shows the empty state and a zero accuracy', () => {
    render(
      <MemoryRouter>
        <StatisticsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText(/No questions attempted yet/)).toBeInTheDocument();
    expect(screen.getByText(/No completed sessions yet/)).toBeInTheDocument();
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
  });
  it('shows stored progress and requires confirmation to reset', async () => {
    const user = userEvent.setup();
    saveAttempt({
      id: 'a',
      questionId: 'q',
      sessionId: 's1',
      operation: 'addition',
      difficulty: 1,
      firstOperand: 1,
      secondOperand: 2,
      correctAnswer: 3,
      selectedAnswer: 3,
      selfReportedCorrect: true,
      source: 'regular',
      attemptedAt: '2026-10-21T14:00:00Z',
    });
    saveSession({
      id: 's1',
      operations: ['addition'],
      difficulty: 1,
      sessionLength: 5,
      startedAt: '2026-10-21T14:00:00Z',
      completedAt: '2026-10-21T14:05:00Z',
      attempted: 1,
      correct: 1,
      incorrect: 0,
    });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <MemoryRouter>
        <StatisticsPage />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Reset Statistics' }));
    expect(confirm).toHaveBeenCalledOnce();
    expect(loadPractice().attempts).toHaveLength(1);
    confirm.mockReturnValue(true);
    await user.click(screen.getByRole('button', { name: 'Reset Statistics' }));
    expect(loadPractice().attempts).toHaveLength(0);
    expect(screen.getByText(/No questions attempted yet/)).toBeInTheDocument();
  });
});
