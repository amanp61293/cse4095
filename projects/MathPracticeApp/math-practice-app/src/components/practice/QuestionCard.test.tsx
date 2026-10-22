import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { QuestionCard } from './QuestionCard';
import type { Question } from '../../types/question';

afterEach(() => cleanup());

const question: Question = {
  id: 'a',
  operation: 'addition',
  difficulty: 1,
  firstOperand: 3,
  secondOperand: 4,
  displayText: '3 + 4 = ?',
  correctAnswer: 7,
  choices: [5, 6, 7, 8],
  source: 'regular',
};

describe('QuestionCard', () => {
  it('requires a selection and allows changing it before flipping', async () => {
    const user = userEvent.setup();
    render(
      <QuestionCard
        question={question}
        index={1}
        total={5}
        onResult={vi.fn()}
      />,
    );
    const flip = screen.getByRole('button', { name: 'Flip Card' });
    expect(flip).toBeDisabled();
    await user.click(screen.getByRole('button', { name: '5' }));
    expect(
      screen.getByRole('button', { name: /5.*selected/i }),
    ).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: '7' }));
    expect(screen.getByRole('button', { name: '5' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
    expect(flip).toBeEnabled();
    await user.click(flip);
    expect(screen.getByText(/Correct answer:/)).toHaveTextContent('7');
    expect(screen.getByText(/Your answer:/)).toHaveTextContent('7');
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument();
  });

  it('submits a self-reported outcome only once', async () => {
    const user = userEvent.setup();
    const record = vi.fn();
    render(
      <QuestionCard
        question={question}
        index={1}
        total={5}
        onResult={record}
      />,
    );
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Flip Card' }));
    await user.click(screen.getByRole('button', { name: 'I Got It Wrong' }));
    expect(record).toHaveBeenCalledTimes(1);
    expect(record).toHaveBeenCalledWith(false, 5);
    expect(
      screen.getByRole('button', { name: 'I Got It Right' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: 'I Got It Wrong' }),
    ).toBeDisabled();
  });

  it('resets controls when the question changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <QuestionCard
        question={question}
        index={1}
        total={5}
        onResult={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: '5' }));
    await user.click(screen.getByRole('button', { name: 'Flip Card' }));
    rerender(
      <QuestionCard
        question={{ ...question, id: 'b', displayText: '2 + 5 = ?' }}
        index={2}
        total={5}
        onResult={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Flip Card' })).toBeDisabled();
    expect(screen.getByText('2 + 5 = ?')).toBeInTheDocument();
  });
});
