import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionCard } from './QuestionCard';
import type { Question } from '../../types/question';

const question: Question = {
  id: 'keyboard-example',
  operation: 'addition',
  firstOperand: 5,
  secondOperand: 5,
  correctAnswer: 10,
  displayText: '5 + 5 = ?',
  choices: [20, 11, 10, 9],
  difficulty: 1,
  source: 'regular',
};
afterEach(cleanup);

describe('keyboard answer selection', () => {
  it('uses number keys and prevents changes after flipping', () => {
    const report = vi.fn();
    render(
      <QuestionCard
        question={question}
        index={1}
        total={5}
        onResult={report}
        soundEnabled={false}
      />,
    );
    fireEvent.keyDown(window, { key: '3' });
    expect(
      screen.getByRole('button', { name: /10.*selected/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Flip Card' }));
    fireEvent.keyDown(window, { key: '1' });
    expect(screen.getByText(/your answer:/i)).toHaveTextContent('10');
    fireEvent.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
    expect(report).toHaveBeenCalledWith(false, 10);
  });
});
