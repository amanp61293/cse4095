import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '../app/App';

const config = {
  operations: ['addition'] as const,
  difficulty: 1 as const,
  sessionLength: 5 as const,
  reviewMode: 'regular' as const,
};
afterEach(() => {
  cleanup();
  window.history.pushState({}, '', '/');
  vi.restoreAllMocks();
});

async function begin(length: 5 | 'continuous' = 5) {
  window.history.pushState(
    {
      usr: {
        config: {
          ...config,
          operations: [...config.operations],
          sessionLength: length,
        },
      },
      key: 'test',
      idx: 0,
    },
    '',
    '/practice/session',
  );
  render(<App />);
  return userEvent.setup();
}

describe('Phase 6 session flow', () => {
  it('scores five self-reported answers and shows accurate summary', async () => {
    const user = await begin();
    for (let i = 0; i < 5; i++) {
      const choice = screen.getAllByRole('button', { name: /^\d+$/ })[0];
      await user.click(choice);
      await user.click(screen.getByRole('button', { name: 'Flip Card' }));
      await user.click(
        screen.getByRole('button', {
          name: i === 0 ? 'I Got It Wrong' : 'I Got It Right',
        }),
      );
    }
    expect(
      screen.getByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Attempted').parentElement).toHaveTextContent('5');
    expect(screen.getByText('Correct').parentElement).toHaveTextContent('4');
    expect(screen.getByText('Incorrect').parentElement).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Practice Again' }));
    expect(screen.getByText(/Question 1 of 5/)).toBeInTheDocument();
  });

  it('ends continuous practice and summarizes the attempts', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = await begin('continuous');
    await user.click(screen.getAllByRole('button', { name: /^\d+$/ })[0]);
    await user.click(screen.getByRole('button', { name: 'Flip Card' }));
    await user.click(screen.getByRole('button', { name: 'I Got It Right' }));
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'End Session' }));
    expect(
      screen.getByRole('heading', { name: 'Session Summary' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Attempted').parentElement).toHaveTextContent('1');
  });
});
